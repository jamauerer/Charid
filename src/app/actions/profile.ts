"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getPublicCharacterImages } from "@/app/actions/character-images";
import type { Character, CharacterRow } from "@/types/character";
import { normalizeCharacter } from "@/types/character";
import type { CharacterImageWithUrl } from "@/types/character-image";
import type { Profile, ProfileRow } from "@/types/profile";
import {
  normalizeProfile,
  sanitizeUsername,
  USERNAME_PATTERN,
} from "@/types/profile";

const BUCKET = "character-photos";
const MAX_FILE_SIZE = 5 * 1024 * 1024;
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];

export type ProfileActionState = {
  error?: string;
  success?: boolean;
  profile?: Profile;
  avatarUrl?: string | null;
};

export type PublicPortfolio = {
  profile: Profile;
  characters: Character[];
  avatarUrl: string | null;
  characterPhotos: Record<string, string | null>;
};

function formatProfileError(message: string, code?: string): string {
  if (code === "23505" || message.includes("profiles_username_key")) {
    return "That username is already taken.";
  }
  if (
    code === "PGRST205" ||
    message.includes("schema cache") ||
    message.includes("Could not find")
  ) {
    return (
      "The profiles table is not exposed to the Supabase Data API yet. " +
      "Run supabase/migrations/20250616000000_portfolio_profiles.sql and " +
      "supabase/fix-profiles-api.sql in the Supabase SQL Editor."
    );
  }
  return message;
}

function validateImage(file: File): string | null {
  if (!ALLOWED_TYPES.includes(file.type)) {
    return "Image must be a JPEG, PNG, or WebP file.";
  }
  if (file.size > MAX_FILE_SIZE) {
    return "Image must be 5 MB or smaller.";
  }
  return null;
}

function emailUsernamePrefix(email: string): string {
  const prefix = sanitizeUsername(email.split("@")[0] ?? "");
  return prefix.length >= 3 ? prefix.slice(0, 30) : "creator";
}

function usernameWithSuffix(base: string, suffix: number): string {
  const suffixStr = String(suffix);
  const maxBaseLen = 30 - suffixStr.length;
  return `${base.slice(0, maxBaseLen)}${suffixStr}`;
}

async function isUsernameTaken(
  supabase: Awaited<ReturnType<typeof createClient>>,
  username: string
): Promise<boolean> {
  const { data, error } = await supabase
    .from("profiles")
    .select("id")
    .eq("username", username)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  return data !== null;
}

async function resolveAvailableUsername(
  supabase: Awaited<ReturnType<typeof createClient>>,
  email: string
): Promise<string> {
  const base = emailUsernamePrefix(email);

  if (!(await isUsernameTaken(supabase, base))) {
    return base;
  }

  for (let n = 2; n <= 9999; n++) {
    const candidate = usernameWithSuffix(base, n);
    if (!(await isUsernameTaken(supabase, candidate))) {
      return candidate;
    }
  }

  throw new Error("Unable to allocate a unique username.");
}

async function getSignedStorageUrl(
  path: string | null
): Promise<string | null> {
  if (!path) return null;

  const supabase = await createClient();
  const { data, error } = await supabase.storage
    .from(BUCKET)
    .createSignedUrl(path, 3600);

  if (error) {
    console.error("Failed to create signed URL:", error.message);
    return null;
  }

  return data.signedUrl;
}

export async function getOrCreateProfile(): Promise<{
  profile: Profile | null;
  avatarUrl: string | null;
  error?: string;
}> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { profile: null, avatarUrl: null, error: "You must be logged in." };
  }

  const { data: existing, error: fetchError } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .maybeSingle();

  if (fetchError) {
    return {
      profile: null,
      avatarUrl: null,
      error: formatProfileError(fetchError.message, fetchError.code),
    };
  }

  if (existing) {
    const profile = normalizeProfile(existing as ProfileRow);
    const avatarUrl = await getSignedStorageUrl(profile.avatar_url);
    return { profile, avatarUrl };
  }

  let username: string;
  try {
    username = await resolveAvailableUsername(supabase, user.email ?? "user");
  } catch (err) {
    return {
      profile: null,
      avatarUrl: null,
      error:
        err instanceof Error
          ? formatProfileError(err.message)
          : "Failed to generate username.",
    };
  }

  const { data: created, error: insertError } = await supabase
    .from("profiles")
    .insert({
      id: user.id,
      username,
      display_name: user.email?.split("@")[0] ?? null,
      is_public: true,
    })
    .select()
    .single();

  if (insertError) {
    return {
      profile: null,
      avatarUrl: null,
      error: formatProfileError(insertError.message, insertError.code),
    };
  }

  const profile = normalizeProfile(created as ProfileRow);
  return { profile, avatarUrl: null };
}

export async function updateProfile(
  _prevState: ProfileActionState,
  formData: FormData
): Promise<ProfileActionState> {
  const username = sanitizeUsername(String(formData.get("username") ?? ""));
  const displayName = String(formData.get("display_name") ?? "").trim() || null;
  const bio = String(formData.get("bio") ?? "").trim() || null;
  const isPublic = formData.get("is_public") === "true";
  const avatar = formData.get("avatar");

  if (!username || !USERNAME_PATTERN.test(username)) {
    return {
      error:
        "Username must be 3–30 characters and use only lowercase letters, numbers, hyphens, and underscores.",
    };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "You must be logged in." };
  }

  const { data: existing, error: fetchError } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .maybeSingle();

  if (fetchError || !existing) {
    return { error: "Profile not found. Refresh the page and try again." };
  }

  let avatarPath: string | null = existing.avatar_url;
  let oldAvatarToDelete: string | null = null;
  let newlyUploadedPath: string | null = null;

  if (avatar instanceof File && avatar.size > 0) {
    const imageError = validateImage(avatar);
    if (imageError) {
      return { error: imageError };
    }

    const extension = avatar.type.split("/")[1] ?? "jpg";
    const newAvatarPath = `${user.id}/avatar.${extension}`;

    const { error: uploadError } = await supabase.storage
      .from(BUCKET)
      .upload(newAvatarPath, avatar, {
        contentType: avatar.type,
        upsert: true,
      });

    if (uploadError) {
      return { error: `Failed to upload avatar: ${uploadError.message}` };
    }

    newlyUploadedPath = newAvatarPath;
    if (existing.avatar_url && existing.avatar_url !== newAvatarPath) {
      oldAvatarToDelete = existing.avatar_url;
    }
    avatarPath = newAvatarPath;
  }

  const { data: updated, error: updateError } = await supabase
    .from("profiles")
    .update({
      username,
      display_name: displayName,
      bio,
      is_public: isPublic,
      avatar_url: avatarPath,
    })
    .eq("id", user.id)
    .select()
    .single();

  if (updateError || !updated) {
    if (newlyUploadedPath) {
      await supabase.storage.from(BUCKET).remove([newlyUploadedPath]);
    }
    return {
      error: formatProfileError(
        updateError?.message ?? "Update failed.",
        updateError?.code
      ),
    };
  }

  if (oldAvatarToDelete) {
    await supabase.storage.from(BUCKET).remove([oldAvatarToDelete]);
  }

  const profile = normalizeProfile(updated as ProfileRow);
  const avatarUrl = await getSignedStorageUrl(profile.avatar_url);

  revalidatePath("/dashboard/portfolio");
  revalidatePath(`/u/${existing.username}`);
  revalidatePath(`/u/${profile.username}`);

  return { success: true, profile, avatarUrl };
}

export async function getPublicPortfolio(
  username: string
): Promise<{ data: PublicPortfolio | null; error?: string }> {
  const normalizedUsername = sanitizeUsername(username);
  if (!normalizedUsername) {
    return { data: null };
  }

  const supabase = await createClient();

  const { data: profileRow, error: profileError } = await supabase
    .from("profiles")
    .select("*")
    .eq("username", normalizedUsername)
    .maybeSingle();

  if (profileError) {
    return {
      data: null,
      error: formatProfileError(profileError.message, profileError.code),
    };
  }

  if (!profileRow || !profileRow.is_public) {
    return { data: null };
  }

  const profile = normalizeProfile(profileRow as ProfileRow);

  const { data: characterRows, error: charactersError } = await supabase
    .from("characters")
    .select("*")
    .eq("user_id", profile.id)
    .eq("is_public", true)
    .order("created_at", { ascending: false });

  if (charactersError) {
    return {
      data: null,
      error: formatProfileError(charactersError.message, charactersError.code),
    };
  }

  const characters = (characterRows ?? []).map((row) =>
    normalizeCharacter(row as CharacterRow)
  );

  const avatarUrl = await getSignedStorageUrl(profile.avatar_url);

  const characterPhotos: Record<string, string | null> = {};
  await Promise.all(
    characters.map(async (character) => {
      characterPhotos[character.id] = await getSignedStorageUrl(
        character.photo_path
      );
    })
  );

  return {
    data: {
      profile,
      characters,
      avatarUrl,
      characterPhotos,
    },
  };
}

export type PublicCharacterView = {
  profile: Profile;
  character: Character;
  photoUrl: string | null;
  avatarUrl: string | null;
  images: CharacterImageWithUrl[];
  featuredImageId: string | null;
};

export async function getPublicCharacter(
  username: string,
  characterId: string
): Promise<{ data: PublicCharacterView | null; error?: string }> {
  const normalizedUsername = sanitizeUsername(username);
  if (!normalizedUsername || !characterId) {
    return { data: null };
  }

  const supabase = await createClient();

  const { data: profileRow, error: profileError } = await supabase
    .from("profiles")
    .select("*")
    .eq("username", normalizedUsername)
    .maybeSingle();

  if (profileError) {
    return {
      data: null,
      error: formatProfileError(profileError.message, profileError.code),
    };
  }

  if (!profileRow || !profileRow.is_public) {
    return { data: null };
  }

  const profile = normalizeProfile(profileRow as ProfileRow);

  const { data: characterRow, error: characterError } = await supabase
    .from("characters")
    .select("*")
    .eq("id", characterId)
    .eq("user_id", profile.id)
    .eq("is_public", true)
    .maybeSingle();

  if (characterError) {
    return {
      data: null,
      error: formatProfileError(characterError.message, characterError.code),
    };
  }

  if (!characterRow) {
    return { data: null };
  }

  const character = normalizeCharacter(characterRow as CharacterRow);
  const photoUrl = await getSignedStorageUrl(character.photo_path);
  const avatarUrl = await getSignedStorageUrl(profile.avatar_url);
  const images = await getPublicCharacterImages(characterId);

  return {
    data: {
      profile,
      character,
      photoUrl,
      avatarUrl,
      images,
      featuredImageId: character.featured_image_id,
    },
  };
}