"use server";

import { randomUUID } from "crypto";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import type { Character, CharacterRow } from "@/types/character";
import { normalizeCharacter } from "@/types/character";

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
  return {
    name: String(formData.get("name") ?? "").trim(),
    gender: parseOptionalField(formData, "gender"),
    age: parseOptionalField(formData, "age"),
    location: parseOptionalField(formData, "location"),
    backstory: parseOptionalField(formData, "backstory"),
  };
}

export type CharacterActionState = {
  error?: string;
  success?: boolean;
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

export async function createCharacter(
  _prevState: CharacterActionState,
  formData: FormData
): Promise<CharacterActionState> {
  const { name, gender, age, location, backstory } =
    parseCharacterFields(formData);
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
    name,
    gender,
    age,
    location,
    backstory,
    photo_path: photoPath,
  });

  if (insertError) {
    if (photoPath) {
      await supabase.storage.from(BUCKET).remove([photoPath]);
    }
    return {
      error: formatCharactersError(insertError.message, insertError.code),
    };
  }

  revalidatePath("/dashboard");
  return { success: true };
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
  const { name, gender, age, location, backstory } =
    parseCharacterFields(formData);
  const photo = formData.get("photo");

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
    return {
      error: "Character not found or you do not have permission to edit it.",
    };
  }

  if (existing.user_id !== user.id) {
    return { error: "You do not have permission to edit this character." };
  }

  let photoPath: string | null = existing.photo_path;
  let oldPhotoToDelete: string | null = null;
  let newlyUploadedPath: string | null = null;

  if (photo instanceof File && photo.size > 0) {
    const photoError = validatePhoto(photo);
    if (photoError) {
      return { error: photoError };
    }

    const extension = photo.type.split("/")[1] ?? "jpg";
    const newPhotoPath = `${user.id}/${characterId}.${extension}`;

    const { error: uploadError } = await supabase.storage
      .from(BUCKET)
      .upload(newPhotoPath, photo, {
        contentType: photo.type,
        upsert: true,
      });

    if (uploadError) {
      return { error: `Failed to upload photo: ${uploadError.message}` };
    }

    newlyUploadedPath = newPhotoPath;
    if (existing.photo_path && existing.photo_path !== newPhotoPath) {
      oldPhotoToDelete = existing.photo_path;
    }
    photoPath = newPhotoPath;
  }

  const { data: updated, error: updateError } = await supabase
    .from("characters")
    .update({
      name,
      gender,
      age,
      location,
      backstory,
      photo_path: photoPath,
    })
    .eq("id", characterId)
    .select()
    .single();

  if (updateError || !updated) {
    if (newlyUploadedPath) {
      await supabase.storage.from(BUCKET).remove([newlyUploadedPath]);
    }
    return {
      error: formatCharactersError(updateError?.message ?? "Update failed.", updateError?.code),
    };
  }

  if (oldPhotoToDelete) {
    const { error: storageError } = await supabase.storage
      .from(BUCKET)
      .remove([oldPhotoToDelete]);

    if (storageError) {
      console.error("Failed to delete old photo:", storageError.message);
    }
  }

  const normalized = normalizeCharacter(updated as CharacterRow);
  const photoUrl = await getCharacterPhotoUrl(normalized.photo_path);

  revalidatePath("/dashboard");
  revalidatePath(`/dashboard/characters/${characterId}`);
  return { success: true, character: normalized, photoUrl };
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

  if (character.photo_path) {
    const { error: storageError } = await supabase.storage
      .from(BUCKET)
      .remove([character.photo_path]);

    if (storageError) {
      console.error("Failed to delete photo:", storageError.message);
      return { error: `Failed to delete photo: ${storageError.message}` };
    }
  }

  const { error: deleteError } = await supabase
    .from("characters")
    .delete()
    .eq("id", characterId);

  if (deleteError) {
    return {
      error: formatCharactersError(deleteError.message, deleteError.code),
    };
  }

  revalidatePath("/dashboard");
  return { success: true };
}
