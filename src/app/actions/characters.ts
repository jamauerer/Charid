"use server";

import { randomUUID } from "crypto";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import type { Character } from "@/types/character";

const BUCKET = "character-photos";
const MAX_FILE_SIZE = 5 * 1024 * 1024;
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];

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

  return { characters: data ?? [] };
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
  const name = String(formData.get("name") ?? "").trim();
  const physicalDescription = String(
    formData.get("physical_description") ?? ""
  ).trim();
  const photo = formData.get("photo");

  if (!name) {
    return { error: "Character name is required." };
  }

  if (!physicalDescription) {
    return { error: "Physical description is required." };
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
    if (!ALLOWED_TYPES.includes(photo.type)) {
      return { error: "Photo must be a JPEG, PNG, or WebP image." };
    }

    if (photo.size > MAX_FILE_SIZE) {
      return { error: "Photo must be 5 MB or smaller." };
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
    physical_description: physicalDescription,
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
