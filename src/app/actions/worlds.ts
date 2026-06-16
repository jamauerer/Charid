"use server";

import { randomUUID } from "crypto";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import type { Character, CharacterRow } from "@/types/character";
import { normalizeCharacter } from "@/types/character";
import type { World, WorldRow, WorldWithCounts } from "@/types/world";
import { normalizeWorld, slugifyWorldName } from "@/types/world";

const BUCKET = "character-photos";
const MAX_FILE_SIZE = 5 * 1024 * 1024;
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];

export type WorldActionState = {
  error?: string;
  success?: boolean;
  world?: World;
};

export type WorldsResult = {
  worlds: WorldWithCounts[];
  error?: string;
};

function formatWorldError(message: string, code?: string): string {
  if (
    code === "PGRST205" ||
    message.includes("schema cache") ||
    message.includes("Could not find")
  ) {
    return (
      "The worlds table is not exposed to the Supabase Data API yet. " +
      "Run supabase/migrations/20250618000000_worlds.sql and " +
      "supabase/fix-worlds-api.sql in the Supabase SQL Editor."
    );
  }
  if (code === "23505" || message.includes("worlds_user_id_slug_key")) {
    return "That world slug is already in use on your account.";
  }
  return message;
}

function validateCover(file: File): string | null {
  if (!ALLOWED_TYPES.includes(file.type)) {
    return "Cover image must be a JPEG, PNG, or WebP file.";
  }
  if (file.size > MAX_FILE_SIZE) {
    return "Cover image must be 5 MB or smaller.";
  }
  return null;
}

function slugWithSuffix(base: string, suffix: number): string {
  const suffixStr = String(suffix);
  const maxBaseLen = 50 - suffixStr.length;
  return `${base.slice(0, maxBaseLen)}${suffixStr}`;
}

async function isSlugTaken(
  supabase: Awaited<ReturnType<typeof createClient>>,
  userId: string,
  slug: string,
  excludeWorldId?: string
): Promise<boolean> {
  let query = supabase
    .from("worlds")
    .select("id")
    .eq("user_id", userId)
    .eq("slug", slug);

  if (excludeWorldId) {
    query = query.neq("id", excludeWorldId);
  }

  const { data, error } = await query.maybeSingle();
  if (error) {
    throw new Error(error.message);
  }
  return data !== null;
}

async function resolveAvailableSlug(
  supabase: Awaited<ReturnType<typeof createClient>>,
  userId: string,
  name: string
): Promise<string> {
  const base = slugifyWorldName(name);

  if (!(await isSlugTaken(supabase, userId, base))) {
    return base;
  }

  for (let n = 2; n <= 9999; n++) {
    const candidate = slugWithSuffix(base, n);
    if (!(await isSlugTaken(supabase, userId, candidate))) {
      return candidate;
    }
  }

  throw new Error("Unable to allocate a unique world slug.");
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

async function attachCharacterCounts(
  supabase: Awaited<ReturnType<typeof createClient>>,
  userId: string,
  worlds: World[]
): Promise<WorldWithCounts[]> {
  const { data: characters } = await supabase
    .from("characters")
    .select("world_id")
    .eq("user_id", userId)
    .not("world_id", "is", null);

  const counts = new Map<string, number>();
  for (const row of characters ?? []) {
    if (row.world_id) {
      counts.set(row.world_id, (counts.get(row.world_id) ?? 0) + 1);
    }
  }

  return worlds.map((world) => ({
    ...world,
    character_count: counts.get(world.id) ?? 0,
  }));
}

async function revalidateWorldPaths(
  supabase: Awaited<ReturnType<typeof createClient>>,
  userId: string,
  world?: World
) {
  revalidatePath("/dashboard/worlds");
  if (world) {
    revalidatePath(`/dashboard/worlds/${world.id}`);
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("username")
    .eq("id", userId)
    .maybeSingle();

  if (profile?.username) {
    revalidatePath(`/u/${profile.username}`);
    if (world) {
      revalidatePath(`/u/${profile.username}/worlds/${world.slug}`);
    }
  }
}

export async function getWorldCoverUrl(
  path: string | null
): Promise<string | null> {
  return getSignedStorageUrl(path);
}

export async function getWorlds(): Promise<WorldsResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { worlds: [] };
  }

  const { data, error } = await supabase
    .from("worlds")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (error) {
    return {
      worlds: [],
      error: formatWorldError(error.message, error.code),
    };
  }

  const worlds = (data ?? []).map((row) => normalizeWorld(row as WorldRow));
  return {
    worlds: await attachCharacterCounts(supabase, user.id, worlds),
  };
}

export async function getWorldById(
  worldId: string
): Promise<{ world: World | null; error?: string }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { world: null, error: "You must be logged in." };
  }

  const { data, error } = await supabase
    .from("worlds")
    .select("*")
    .eq("id", worldId)
    .eq("user_id", user.id)
    .maybeSingle();

  if (error) {
    return { world: null, error: formatWorldError(error.message, error.code) };
  }

  if (!data) {
    return { world: null };
  }

  return { world: normalizeWorld(data as WorldRow) };
}

export async function getWorldSelectOptions(): Promise<
  { id: string; name: string }[]
> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return [];
  }

  const { data, error } = await supabase
    .from("worlds")
    .select("id, name")
    .eq("user_id", user.id)
    .order("name", { ascending: true });

  if (error) {
    console.error("Failed to fetch world options:", error.message);
    return [];
  }

  return data ?? [];
}

export async function getCharactersByWorldId(
  worldId: string
): Promise<{ characters: Character[]; error?: string }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { characters: [], error: "You must be logged in." };
  }

  const { data: world, error: worldError } = await supabase
    .from("worlds")
    .select("id")
    .eq("id", worldId)
    .eq("user_id", user.id)
    .maybeSingle();

  if (worldError || !world) {
    return { characters: [], error: "World not found." };
  }

  const { data, error } = await supabase
    .from("characters")
    .select("*")
    .eq("user_id", user.id)
    .eq("world_id", worldId)
    .order("created_at", { ascending: false });

  if (error) {
    return {
      characters: [],
      error: formatWorldError(error.message, error.code),
    };
  }

  return {
    characters: (data ?? []).map((row) =>
      normalizeCharacter(row as CharacterRow)
    ),
  };
}

export async function createWorld(
  _prevState: WorldActionState,
  formData: FormData
): Promise<WorldActionState> {
  const name = String(formData.get("name") ?? "").trim();
  const description =
    String(formData.get("description") ?? "").trim() || null;
  const isPublic = formData.get("is_public") !== "false";
  const cover = formData.get("cover");

  if (!name) {
    return { error: "World name is required." };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "You must be logged in." };
  }

  let slug: string;
  try {
    slug = await resolveAvailableSlug(supabase, user.id, name);
  } catch (err) {
    return {
      error:
        err instanceof Error ? err.message : "Failed to generate world slug.",
    };
  }

  const worldId = randomUUID();
  let coverPath: string | null = null;

  if (cover instanceof File && cover.size > 0) {
    const coverError = validateCover(cover);
    if (coverError) {
      return { error: coverError };
    }

    const extension = cover.type.split("/")[1] ?? "jpg";
    coverPath = `${user.id}/worlds/${worldId}/cover.${extension}`;

    const { error: uploadError } = await supabase.storage
      .from(BUCKET)
      .upload(coverPath, cover, {
        contentType: cover.type,
        upsert: false,
      });

    if (uploadError) {
      return { error: `Failed to upload cover image: ${uploadError.message}` };
    }
  }

  const { data: created, error: insertError } = await supabase
    .from("worlds")
    .insert({
      id: worldId,
      user_id: user.id,
      name,
      slug,
      description,
      cover_image_path: coverPath,
      is_public: isPublic,
    })
    .select()
    .single();

  if (insertError || !created) {
    if (coverPath) {
      await supabase.storage.from(BUCKET).remove([coverPath]);
    }
    return {
      error: formatWorldError(
        insertError?.message ?? "Failed to create world.",
        insertError?.code
      ),
    };
  }

  const world = normalizeWorld(created as WorldRow);
  await revalidateWorldPaths(supabase, user.id, world);
  return { success: true, world };
}

export async function getPublicWorlds(
  username: string
): Promise<{ worlds: World[]; coverUrls: Record<string, string | null> }> {
  const supabase = await createClient();
  const normalizedUsername = username.toLowerCase().replace(/[^a-z0-9_-]/g, "");

  const { data: profile } = await supabase
    .from("profiles")
    .select("id, is_public")
    .eq("username", normalizedUsername)
    .maybeSingle();

  if (!profile?.is_public) {
    return { worlds: [], coverUrls: {} };
  }

  const { data, error } = await supabase
    .from("worlds")
    .select("*")
    .eq("user_id", profile.id)
    .eq("is_public", true)
    .order("name", { ascending: true });

  if (error) {
    console.error("Failed to fetch public worlds:", error.message);
    return { worlds: [], coverUrls: {} };
  }

  const worlds = (data ?? []).map((row) => normalizeWorld(row as WorldRow));
  const coverUrls: Record<string, string | null> = {};

  await Promise.all(
    worlds.map(async (world) => {
      coverUrls[world.id] = await getSignedStorageUrl(world.cover_image_path);
    })
  );

  return { worlds, coverUrls };
}

export async function getPublicWorld(
  username: string,
  slug: string
): Promise<{
  world: World | null;
  coverUrl: string | null;
  characters: Character[];
  characterPhotos: Record<string, string | null>;
  profileUsername: string | null;
  error?: string;
}> {
  const supabase = await createClient();
  const normalizedUsername = username.toLowerCase().replace(/[^a-z0-9_-]/g, "");
  const normalizedSlug = slugifyWorldName(slug);

  const { data: profile } = await supabase
    .from("profiles")
    .select("id, username, is_public")
    .eq("username", normalizedUsername)
    .maybeSingle();

  if (!profile?.is_public) {
    return {
      world: null,
      coverUrl: null,
      characters: [],
      characterPhotos: {},
      profileUsername: null,
    };
  }

  const { data: worldRow, error: worldError } = await supabase
    .from("worlds")
    .select("*")
    .eq("user_id", profile.id)
    .eq("slug", normalizedSlug)
    .eq("is_public", true)
    .maybeSingle();

  if (worldError) {
    return {
      world: null,
      coverUrl: null,
      characters: [],
      characterPhotos: {},
      profileUsername: profile.username,
      error: formatWorldError(worldError.message, worldError.code),
    };
  }

  if (!worldRow) {
    return {
      world: null,
      coverUrl: null,
      characters: [],
      characterPhotos: {},
      profileUsername: profile.username,
    };
  }

  const world = normalizeWorld(worldRow as WorldRow);
  const coverUrl = await getSignedStorageUrl(world.cover_image_path);

  const { data: characterRows } = await supabase
    .from("characters")
    .select("*")
    .eq("user_id", profile.id)
    .eq("world_id", world.id)
    .eq("is_public", true)
    .order("created_at", { ascending: false });

  const characters = (characterRows ?? []).map((row) =>
    normalizeCharacter(row as CharacterRow)
  );

  const characterPhotos: Record<string, string | null> = {};
  await Promise.all(
    characters.map(async (character) => {
      characterPhotos[character.id] = await getSignedStorageUrl(
        character.photo_path
      );
    })
  );

  return {
    world,
    coverUrl,
    characters,
    characterPhotos,
    profileUsername: profile.username,
  };
}
