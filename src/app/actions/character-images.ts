"use server";

import { randomUUID } from "crypto";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import {
  normalizeCharacterImage,
  type CharacterImage,
  type CharacterImageWithUrl,
} from "@/types/character-image";

const BUCKET = "character-photos";
const MAX_FILE_SIZE = 5 * 1024 * 1024;
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];

export type CharacterImageActionResult = {
  error?: string;
  success?: boolean;
};

export type CharacterImagesResult = {
  images: CharacterImageWithUrl[];
  featuredImageId: string | null;
  error?: string;
};

function validatePhoto(file: File): string | null {
  if (!ALLOWED_TYPES.includes(file.type)) {
    return "Image must be a JPEG, PNG, or WebP file.";
  }
  if (file.size > MAX_FILE_SIZE) {
    return "Image must be 5 MB or smaller.";
  }
  return null;
}

function formatImageError(message: string, code?: string): string {
  if (
    code === "PGRST205" ||
    message.includes("schema cache") ||
    message.includes("Could not find")
  ) {
    return (
      "The character_images table is not exposed to the Supabase Data API yet. " +
      "Run supabase/migrations/20250617000000_character_images.sql and " +
      "supabase/fix-character-images-api.sql in the Supabase SQL Editor."
    );
  }
  return message;
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

async function assertCharacterOwner(characterId: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "You must be logged in.", supabase, user: null };
  }

  const { data: character, error } = await supabase
    .from("characters")
    .select("id, user_id, featured_image_id")
    .eq("id", characterId)
    .single();

  if (error || !character) {
    return { error: "Character not found.", supabase, user: null };
  }

  if (character.user_id !== user.id) {
    return { error: "You do not have permission to edit this character.", supabase, user: null };
  }

  return { error: null, supabase, user, character };
}

async function syncPhotoPathFromFeatured(
  supabase: Awaited<ReturnType<typeof createClient>>,
  characterId: string,
  featuredImageId: string | null
) {
  if (!featuredImageId) {
    await supabase
      .from("characters")
      .update({ photo_path: null, featured_image_id: null })
      .eq("id", characterId);
    return;
  }

  const { data: image } = await supabase
    .from("character_images")
    .select("image_path")
    .eq("id", featuredImageId)
    .maybeSingle();

  await supabase
    .from("characters")
    .update({
      photo_path: image?.image_path ?? null,
      featured_image_id: featuredImageId,
    })
    .eq("id", characterId);
}

async function revalidateCharacterPaths(
  supabase: Awaited<ReturnType<typeof createClient>>,
  characterId: string,
  userId: string
) {
  revalidatePath("/dashboard");
  revalidatePath(`/dashboard/characters/${characterId}`);
  revalidatePath("/dashboard/portfolio");

  const { data: profile } = await supabase
    .from("profiles")
    .select("username")
    .eq("id", userId)
    .maybeSingle();

  if (profile?.username) {
    revalidatePath(`/u/${profile.username}`);
    revalidatePath(`/u/${profile.username}/characters/${characterId}`);
  }
}

async function attachUrls(
  images: CharacterImage[]
): Promise<CharacterImageWithUrl[]> {
  return Promise.all(
    images.map(async (image) => ({
      ...image,
      url: await getSignedStorageUrl(image.image_path),
    }))
  );
}

export async function getCharacterImages(
  characterId: string
): Promise<CharacterImagesResult> {
  const auth = await assertCharacterOwner(characterId);
  if (auth.error || !auth.supabase || !auth.character) {
    return { images: [], featuredImageId: null, error: auth.error ?? undefined };
  }

  const { data, error } = await auth.supabase
    .from("character_images")
    .select("*")
    .eq("character_id", characterId)
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: true });

  if (error) {
    return {
      images: [],
      featuredImageId: auth.character.featured_image_id,
      error: formatImageError(error.message, error.code),
    };
  }

  const images = (data ?? []).map((row) =>
    normalizeCharacterImage(row as CharacterImage)
  );

  return {
    images: await attachUrls(images),
    featuredImageId: auth.character.featured_image_id,
  };
}

export async function getPublicCharacterImages(
  characterId: string
): Promise<CharacterImageWithUrl[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("character_images")
    .select("*")
    .eq("character_id", characterId)
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: true });

  if (error) {
    console.error("Failed to fetch public character images:", error.message);
    return [];
  }

  const images = (data ?? []).map((row) =>
    normalizeCharacterImage(row as CharacterImage)
  );

  return attachUrls(images);
}

export async function uploadCharacterImage(
  characterId: string,
  formData: FormData
): Promise<CharacterImageActionResult> {
  const file = formData.get("image");
  const caption = String(formData.get("caption") ?? "").trim() || null;

  if (!(file instanceof File) || file.size === 0) {
    return { error: "Please choose an image to upload." };
  }

  const photoError = validatePhoto(file);
  if (photoError) {
    return { error: photoError };
  }

  const auth = await assertCharacterOwner(characterId);
  if (auth.error || !auth.supabase || !auth.user || !auth.character) {
    return { error: auth.error ?? "Unauthorized." };
  }

  const imageId = randomUUID();
  const extension = file.type.split("/")[1] ?? "jpg";
  const imagePath = `${auth.user.id}/${characterId}/gallery/${imageId}.${extension}`;

  const { error: uploadError } = await auth.supabase.storage
    .from(BUCKET)
    .upload(imagePath, file, { contentType: file.type, upsert: false });

  if (uploadError) {
    return { error: `Failed to upload image: ${uploadError.message}` };
  }

  const { count } = await auth.supabase
    .from("character_images")
    .select("*", { count: "exact", head: true })
    .eq("character_id", characterId);

  const sortOrder = count ?? 0;
  const isFirst = sortOrder === 0;

  const { error: insertError } = await auth.supabase
    .from("character_images")
    .insert({
      id: imageId,
      character_id: characterId,
      image_path: imagePath,
      caption,
      sort_order: sortOrder,
    });

  if (insertError) {
    await auth.supabase.storage.from(BUCKET).remove([imagePath]);
    return { error: formatImageError(insertError.message, insertError.code) };
  }

  if (isFirst || !auth.character.featured_image_id) {
    await syncPhotoPathFromFeatured(auth.supabase, characterId, imageId);
  }

  await revalidateCharacterPaths(auth.supabase, characterId, auth.user.id);
  return { success: true };
}

export async function updateCharacterImageCaption(
  imageId: string,
  caption: string
): Promise<CharacterImageActionResult> {
  const supabase = await createClient();

  const { data: image, error: fetchError } = await supabase
    .from("character_images")
    .select("id, character_id")
    .eq("id", imageId)
    .single();

  if (fetchError || !image) {
    return { error: "Image not found." };
  }

  const auth = await assertCharacterOwner(image.character_id);
  if (auth.error || !auth.supabase || !auth.user) {
    return { error: auth.error ?? "Unauthorized." };
  }

  const { error } = await auth.supabase
    .from("character_images")
    .update({ caption: caption.trim() || null })
    .eq("id", imageId);

  if (error) {
    return { error: formatImageError(error.message, error.code) };
  }

  await revalidateCharacterPaths(auth.supabase, image.character_id, auth.user.id);
  return { success: true };
}

export async function deleteCharacterImage(
  imageId: string
): Promise<CharacterImageActionResult> {
  const supabase = await createClient();

  const { data: image, error: fetchError } = await supabase
    .from("character_images")
    .select("id, character_id, image_path")
    .eq("id", imageId)
    .single();

  if (fetchError || !image) {
    return { error: "Image not found." };
  }

  const auth = await assertCharacterOwner(image.character_id);
  if (auth.error || !auth.supabase || !auth.user || !auth.character) {
    return { error: auth.error ?? "Unauthorized." };
  }

  const { error: storageError } = await auth.supabase.storage
    .from(BUCKET)
    .remove([image.image_path]);

  if (storageError) {
    return { error: `Failed to delete image file: ${storageError.message}` };
  }

  const { error: deleteError } = await auth.supabase
    .from("character_images")
    .delete()
    .eq("id", imageId);

  if (deleteError) {
    return { error: formatImageError(deleteError.message, deleteError.code) };
  }

  let newFeaturedId = auth.character.featured_image_id;
  if (auth.character.featured_image_id === imageId) {
    const { data: remaining } = await auth.supabase
      .from("character_images")
      .select("id")
      .eq("character_id", image.character_id)
      .order("sort_order", { ascending: true })
      .limit(1);

    newFeaturedId = remaining?.[0]?.id ?? null;
  }

  await syncPhotoPathFromFeatured(auth.supabase, image.character_id, newFeaturedId);

  const { data: remainingImages } = await auth.supabase
    .from("character_images")
    .select("id")
    .eq("character_id", image.character_id)
    .order("sort_order", { ascending: true });

  if (remainingImages) {
    await Promise.all(
      remainingImages.map((row, index) =>
        auth.supabase!
          .from("character_images")
          .update({ sort_order: index })
          .eq("id", row.id)
      )
    );
  }

  await revalidateCharacterPaths(auth.supabase, image.character_id, auth.user.id);
  return { success: true };
}

export async function reorderCharacterImages(
  characterId: string,
  orderedImageIds: string[]
): Promise<CharacterImageActionResult> {
  const auth = await assertCharacterOwner(characterId);
  if (auth.error || !auth.supabase || !auth.user || !auth.character) {
    return { error: auth.error ?? "Unauthorized." };
  }

  const { data: currentImages } = await auth.supabase
    .from("character_images")
    .select("id")
    .eq("character_id", characterId)
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: true });

  const oldFirstId = currentImages?.[0]?.id ?? null;
  const featuredWasFirst =
    !auth.character.featured_image_id ||
    auth.character.featured_image_id === oldFirstId;

  await Promise.all(
    orderedImageIds.map((id, index) =>
      auth.supabase!
        .from("character_images")
        .update({ sort_order: index })
        .eq("id", id)
        .eq("character_id", characterId)
    )
  );

  const newFirstId = orderedImageIds[0] ?? null;
  if (featuredWasFirst && newFirstId) {
    await syncPhotoPathFromFeatured(auth.supabase, characterId, newFirstId);
  }

  await revalidateCharacterPaths(auth.supabase, characterId, auth.user.id);
  return { success: true };
}

export async function setFeaturedCharacterImage(
  characterId: string,
  imageId: string
): Promise<CharacterImageActionResult> {
  const auth = await assertCharacterOwner(characterId);
  if (auth.error || !auth.supabase || !auth.user) {
    return { error: auth.error ?? "Unauthorized." };
  }

  const { data: image, error } = await auth.supabase
    .from("character_images")
    .select("id")
    .eq("id", imageId)
    .eq("character_id", characterId)
    .maybeSingle();

  if (error || !image) {
    return { error: "Image not found on this character." };
  }

  await syncPhotoPathFromFeatured(auth.supabase, characterId, imageId);
  await revalidateCharacterPaths(auth.supabase, characterId, auth.user.id);
  return { success: true };
}

export async function createCharacterImageFromPath(
  supabase: Awaited<ReturnType<typeof createClient>>,
  characterId: string,
  imagePath: string,
  userId: string
) {
  const imageId = randomUUID();

  const { error: insertError } = await supabase.from("character_images").insert({
    id: imageId,
    character_id: characterId,
    image_path: imagePath,
    caption: "Main Portrait",
    sort_order: 0,
  });

  if (insertError) {
    return { error: insertError.message };
  }

  await syncPhotoPathFromFeatured(supabase, characterId, imageId);
  return { imageId };
}

export async function deleteAllCharacterImageFiles(
  supabase: Awaited<ReturnType<typeof createClient>>,
  characterId: string,
  legacyPhotoPath: string | null
) {
  const { data: images } = await supabase
    .from("character_images")
    .select("image_path")
    .eq("character_id", characterId);

  const paths = new Set<string>();
  for (const image of images ?? []) {
    paths.add(image.image_path);
  }
  if (legacyPhotoPath) {
    paths.add(legacyPhotoPath);
  }

  if (paths.size > 0) {
    await supabase.storage.from(BUCKET).remove([...paths]);
  }
}
