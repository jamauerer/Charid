"use server";

import { randomUUID } from "crypto";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import type { Character, CharacterRow } from "@/types/character";
import { normalizeCharacter } from "@/types/character";
import {
  createCharacterImageFromPath,
  deleteAllCharacterImageFiles,
} from "@/app/actions/character-images";
import { ensureCharacterBible } from "@/app/actions/character-bible";
import { scanUploadedImage } from "@/lib/moderation/scan-image";
import { getOrCreateDefaultProject } from "@/app/actions/projects";
import { scanSavedText } from "@/lib/moderation/scan-text";

const BUCKET = "character-photos";
const MAX_FILE_SIZE = 5 * 1024 * 1024;
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];

function validatePhoto(file: File): string | null {
  if (!ALLOWED_TYPES.includes(file.type)) {
    return "Photo must be a JPEG, PNG, or WebP image.";
  }
  if (file.size > MAX_FILE_SIZE) {
    return "Photo must be 5 MB or smaller.";
  }
  return null;
}

function parseOptionalField(formData: FormData, key: string): string | null {
  const value = String(formData.get(key) ?? "").trim();
  return value || null;
}

function parseCharacterFields(formData: FormData) {
  const worldIdRaw = String(formData.get("world_id") ?? "").trim();
  return {
    name: String(formData.get("name") ?? "").trim(),
    gender: parseOptionalField(formData, "gender"),
    age: parseOptionalField(formData, "age"),
    species: parseOptionalField(formData, "species"),
    core_personality: parseOptionalField(formData, "core_personality"),
    permanent_features: parseOptionalField(formData, "permanent_features"),
    location: parseOptionalField(formData, "location"),
    backstory: parseOptionalField(formData, "backstory"),
    is_public: formData.get("is_public") === "true",
    world_id: worldIdRaw || null,
  };
}

export type CharacterActionState = {
  error?: string;
  success?: boolean;
  characterId?: string;
};

export type CharacterPickerItem = {
  id: string;
  name: string;
  world_id: string | null;
  world_name: string | null;
  project_id: string | null;
};

export type CharactersResult = {
  characters: Character[];
  error?: string;
};

function formatCharactersError(message: string, code?: string): string {
  if (
    code === "PGRST205" ||
    message.includes("schema cache") ||
    message.includes("Could not find the table")
  ) {
    return (
      "The characters table is not exposed to the Supabase Data API yet. " +
      "In Supabase SQL Editor, run supabase/fix-characters-api.sql, then refresh this page."
    );
  }

  return message;
}

export async function getCharacters(): Promise<CharactersResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { characters: [] };
  }

  const { data, error } = await supabase
    .from("characters")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Failed to fetch characters:", error.message);
    return {
      characters: [],
      error: formatCharactersError(error.message, error.code),
    };
  }

  return { characters: (data ?? []).map((row) => normalizeCharacter(row as CharacterRow)) };
}

export async function getCharacterById(
  characterId: string
): Promise<{ character: Character | null; error?: string }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { character: null, error: "You must be logged in." };
  }

  const { data, error } = await supabase
    .from("characters")
    .select("*")
    .eq("id", characterId)
    .single();

  if (error || !data) {
    return { character: null, error: "Character not found." };
  }

  const character = normalizeCharacter(data as CharacterRow);

  if (character.user_id !== user.id) {
    return { character: null, error: "Character not found." };
  }

  return { character };
}

export async function getCharacterPhotoUrl(
  photoPath: string | null
): Promise<string | null> {
  if (!photoPath) {
    return null;
  }

  const supabase = await createClient();
  const { data, error } = await supabase.storage
    .from(BUCKET)
    .createSignedUrl(photoPath, 3600);

  if (error) {
    console.error("Failed to create signed URL:", error.message);
    return null;
  }

  return data.signedUrl;
}

export async function getCharactersForPicker(): Promise<{
  characters: CharacterPickerItem[];
  error?: string;
}> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { characters: [], error: "You must be logged in." };
  }

  const { data, error } = await supabase
    .from("characters")
    .select("id, name, world_id, project_id")
    .eq("user_id", user.id)
    .order("name", { ascending: true });

  if (error) {
    return {
      characters: [],
      error: formatCharactersError(error.message, error.code),
    };
  }

  const worldIds = [
    ...new Set(
      (data ?? [])
        .map((row) => row.world_id as string | null)
        .filter((id): id is string => Boolean(id))
    ),
  ];

  const worldNames = new Map<string, string>();
  if (worldIds.length > 0) {
    const { data: worlds } = await supabase
      .from("worlds")
      .select("id, name")
      .in("id", worldIds);
    for (const world of worlds ?? []) {
      worldNames.set(world.id, world.name);
    }
  }

  return {
    characters: (data ?? []).map((row) => ({
      id: row.id,
      name: row.name,
      world_id: row.world_id ?? null,
      world_name: row.world_id ? (worldNames.get(row.world_id) ?? null) : null,
      project_id: (row.project_id as string | null) ?? null,
    })),
  };
}

export async function assignCharactersToWorld(
  worldId: string,
  characterIds: string[]
): Promise<{ error?: string; assignedCount?: number }> {
  const uniqueIds = [...new Set(characterIds.filter(Boolean))];
  if (uniqueIds.length === 0) {
    return { error: "Select at least one character." };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "You must be logged in." };
  }

  const { data: world, error: worldError } = await supabase
    .from("worlds")
    .select("id")
    .eq("id", worldId)
    .eq("user_id", user.id)
    .maybeSingle();

  if (worldError || !world) {
    return { error: "World not found." };
  }

  const { data: updated, error: updateError } = await supabase
    .from("characters")
    .update({ world_id: worldId })
    .eq("user_id", user.id)
    .in("id", uniqueIds)
    .select("id");

  if (updateError) {
    return { error: formatCharactersError(updateError.message, updateError.code) };
  }

  const assignedCount = updated?.length ?? 0;
  if (assignedCount === 0) {
    return { error: "No characters were assigned." };
  }

  revalidatePath("/dashboard/characters");
  revalidatePath(`/dashboard/worlds/${worldId}`);
  revalidatePath("/dashboard/portfolio");

  for (const row of updated ?? []) {
    revalidatePath(`/dashboard/characters/${row.id}`);
  }

  return { assignedCount };
}

export async function createCharacter(
  _prevState: CharacterActionState,
  formData: FormData
): Promise<CharacterActionState> {
  const {
    name,
    gender,
    age,
    species,
    core_personality,
    permanent_features,
    location,
    backstory,
    is_public,
    world_id,
  } = parseCharacterFields(formData);
  const photo = formData.get("photo");

  if (!name) {
    return { error: "Character name is required." };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "You must be logged in to create a character." };
  }

  let projectId: string | null = null;
  const formProjectId = String(formData.get("project_id") ?? "").trim();
  const formStoryId = String(formData.get("story_id") ?? "").trim();

  if (formProjectId) {
    const { data: projectRow } = await supabase
      .from("projects")
      .select("id")
      .eq("id", formProjectId)
      .eq("user_id", user.id)
      .maybeSingle();
    if (projectRow) {
      projectId = projectRow.id as string;
    }
  }

  if (!projectId && formStoryId) {
    const { data: storyRow } = await supabase
      .from("stories")
      .select("project_id")
      .eq("id", formStoryId)
      .eq("user_id", user.id)
      .maybeSingle();
    if (storyRow?.project_id) {
      projectId = storyRow.project_id as string;
    }
  }

  if (world_id) {
    const { data: world, error: worldError } = await supabase
      .from("worlds")
      .select("id, project_id")
      .eq("id", world_id)
      .eq("user_id", user.id)
      .maybeSingle();

    if (worldError || !world) {
      return { error: "World not found." };
    }

    if (!projectId && world.project_id) {
      projectId = world.project_id as string;
    }
  }

  if (!projectId) {
    const defaultProject = await getOrCreateDefaultProject(supabase, user.id);
    if (defaultProject.error && !defaultProject.project) {
      return { error: defaultProject.error };
    }
    projectId = defaultProject.project?.id ?? null;
  }

  const characterId = randomUUID();
  let photoPath: string | null = null;

  if (photo instanceof File && photo.size > 0) {
    const photoError = validatePhoto(photo);
    if (photoError) {
      return { error: photoError };
    }

    const extension = photo.type.split("/")[1] ?? "jpg";
    photoPath = `${user.id}/${characterId}.${extension}`;

    const { error: uploadError } = await supabase.storage
      .from(BUCKET)
      .upload(photoPath, photo, {
        contentType: photo.type,
        upsert: false,
      });

    if (uploadError) {
      return { error: `Failed to upload photo: ${uploadError.message}` };
    }
  }

  const { error: insertError } = await supabase.from("characters").insert({
    id: characterId,
    user_id: user.id,
    project_id: projectId,
    name,
    gender,
    species,
    core_personality,
    permanent_features,
    location,
    backstory,
    photo_path: photoPath,
    is_public: is_public ?? false,
    world_id,
  });

  if (insertError) {
    if (photoPath) {
      await supabase.storage.from(BUCKET).remove([photoPath]);
    }
    return {
      error: formatCharactersError(insertError.message, insertError.code),
    };
  }

  const bibleResult = await ensureCharacterBible(supabase, characterId, user.id, {
    age,
  });
  if (bibleResult.error) {
    console.error("Failed to create character bible row:", bibleResult.error);
  }

  if (photoPath) {
    const galleryResult = await createCharacterImageFromPath(
      supabase,
      characterId,
      photoPath,
      user.id
    );
    if (galleryResult.error) {
      console.error("Failed to create gallery image row:", galleryResult.error);
    }
  }

  revalidatePath("/dashboard");
  revalidatePath("/dashboard/characters");
  revalidatePath("/dashboard/portfolio");
  if (projectId) {
    revalidatePath(`/dashboard/projects/${projectId}`);
    revalidatePath("/dashboard/projects");
  }
  if (world_id) {
    revalidatePath(`/dashboard/worlds/${world_id}`);
  }

  void scanSavedText({
    supabase,
    userId: user.id,
    entityType: "character",
    entityId: characterId,
    fields: {
      name,
      species,
      core_personality,
      permanent_features,
      location,
      backstory,
    },
  });

  if (photoPath) {
    void scanUploadedImage({
      supabase,
      userId: user.id,
      entityType: "character_photo",
      entityId: characterId,
      storageBucket: BUCKET,
      storagePath: photoPath,
      mimeType: photo instanceof File ? photo.type : undefined,
    });
  }

  return { success: true, characterId };
}

export type UpdateCharacterResult = CharacterActionState & {
  character?: Character;
  photoUrl?: string | null;
};

export async function updateCharacter(
  _prevState: UpdateCharacterResult,
  formData: FormData
): Promise<UpdateCharacterResult> {
  const characterId = String(formData.get("character_id") ?? "").trim();
  const { name, gender, age, species, core_personality, permanent_features, location, backstory, is_public, world_id } =
    parseCharacterFields(formData);

  if (!characterId) {
    return { error: "Character ID is required." };
  }

  if (!name) {
    return { error: "Character name is required." };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "You must be logged in to edit a character." };
  }

  const { data: existing, error: fetchError } = await supabase
    .from("characters")
    .select("*")
    .eq("id", characterId)
    .single();

  if (fetchError || !existing) {
    if (fetchError) {
      console.error("[updateCharacter] fetch error:", {
        message: fetchError.message,
        code: fetchError.code,
        details: fetchError.details,
        hint: fetchError.hint,
      });
      return {
        error: `[fetch] ${fetchError.message}${fetchError.code ? ` (${fetchError.code})` : ""}`,
      };
    }
    return {
      error: "Character not found or you do not have permission to edit it.",
    };
  }

  if (existing.user_id !== user.id) {
    return { error: "You do not have permission to edit this character." };
  }

  if (world_id) {
    const { data: world, error: worldError } = await supabase
      .from("worlds")
      .select("id")
      .eq("id", world_id)
      .eq("user_id", user.id)
      .maybeSingle();

    if (worldError || !world) {
      return { error: "Selected world not found." };
    }
  }

  const { data: updated, error: updateError } = await supabase
    .from("characters")
    .update({
      name,
      gender,
      species,
      core_personality,
      permanent_features,
      location,
      backstory,
      is_public,
      world_id,
    })
    .eq("id", characterId)
    .select()
    .single();

  if (updateError || !updated) {
    if (updateError) {
      console.error("[updateCharacter] update error:", {
        message: updateError.message,
        code: updateError.code,
        details: updateError.details,
        hint: updateError.hint,
      });
      return {
        error: `[update] ${updateError.message}${updateError.code ? ` (${updateError.code})` : ""}`,
      };
    }
    return { error: "Update failed: no row returned." };
  }

  const bibleResult = await ensureCharacterBible(supabase, characterId, user.id, {
    age,
  });
  if (bibleResult.error) {
    console.error("[updateCharacter] bible update error:", bibleResult.error);
  }

  const normalized = normalizeCharacter(updated as CharacterRow);
  const photoUrl = await getCharacterPhotoUrl(normalized.photo_path);

  const { data: profile } = await supabase
    .from("profiles")
    .select("username")
    .eq("id", user.id)
    .maybeSingle();

  revalidatePath("/dashboard");
  revalidatePath("/dashboard/characters");
  revalidatePath(`/dashboard/characters/${characterId}`);
  revalidatePath("/dashboard/portfolio");
  revalidatePath("/dashboard/worlds");
  if (existing.world_id) {
    revalidatePath(`/dashboard/worlds/${existing.world_id}`);
  }
  if (normalized.world_id && normalized.world_id !== existing.world_id) {
    revalidatePath(`/dashboard/worlds/${normalized.world_id}`);
  }
  if (profile?.username) {
    revalidatePath(`/u/${profile.username}`);
    revalidatePath(`/u/${profile.username}/characters/${characterId}`);
  }

  void scanSavedText({
    supabase,
    userId: user.id,
    entityType: "character",
    entityId: characterId,
    fields: {
      name,
      species,
      core_personality,
      permanent_features,
      location,
      backstory,
    },
  });

  return { success: true, character: normalized, photoUrl };
}

export async function saveCharacterPersonality(
  characterId: string,
  corePersonality: string
): Promise<{ error?: string; success?: boolean }> {
  if (!characterId) {
    return { error: "Character ID is required." };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "You must be logged in." };
  }

  const { error } = await supabase
    .from("characters")
    .update({ core_personality: corePersonality.trim() || null })
    .eq("id", characterId)
    .eq("user_id", user.id);

  if (error) {
    return { error: error.message };
  }

  revalidatePath(`/dashboard/characters/${characterId}`);
  return { success: true };
}

export type DeleteCharacterResult = {
  error?: string;
  success?: boolean;
};

export async function deleteCharacter(
  characterId: string
): Promise<DeleteCharacterResult> {
  if (!characterId) {
    return { error: "Character ID is required." };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "You must be logged in to delete a character." };
  }

  const { data: character, error: fetchError } = await supabase
    .from("characters")
    .select("id, photo_path, user_id")
    .eq("id", characterId)
    .single();

  if (fetchError || !character) {
    return { error: "Character not found or you do not have permission to delete it." };
  }

  if (character.user_id !== user.id) {
    return { error: "You do not have permission to delete this character." };
  }

  await deleteAllCharacterImageFiles(
    supabase,
    characterId,
    character.photo_path
  );

  const { error: deleteError } = await supabase
    .from("characters")
    .delete()
    .eq("id", characterId);

  if (deleteError) {
    return {
      error: formatCharactersError(deleteError.message, deleteError.code),
    };
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("username")
    .eq("id", user.id)
    .maybeSingle();

  revalidatePath("/dashboard");
  revalidatePath("/dashboard/characters");
  revalidatePath("/dashboard/portfolio");
  if (profile?.username) {
    revalidatePath(`/u/${profile.username}`);
    revalidatePath(`/u/${profile.username}/characters/${characterId}`);
  }
  return { success: true };
}
