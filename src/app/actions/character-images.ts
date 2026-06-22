"use server";

import { randomUUID } from "crypto";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import {
  normalizeCharacterImage,
  parseAssetRole,
  isSlotAssetRole,
  type CharacterImage,
  type CharacterImageWithUrl,
} from "@/types/character-image";
import {
  normalizeSlotAssignment,
  type AssetSource,
  type CharacterImageSlotAssignment,
} from "@/types/character-image-slot";
import { scanUploadedImage } from "@/lib/moderation/scan-image";
import { scanSavedText } from "@/lib/moderation/scan-text";
import {
  attachSignedUrls,
  CHARACTER_PHOTOS_BUCKET,
} from "@/lib/storage/signed-url";

const BUCKET = CHARACTER_PHOTOS_BUCKET;
const MAX_FILE_SIZE = 5 * 1024 * 1024;
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];

export type CharacterImageActionResult = {
  error?: string;
  success?: boolean;
};

export type CharacterImagesResult = {
  images: CharacterImageWithUrl[];
  featuredImageId: string | null;
  slotAssignments: CharacterImageSlotAssignment[];
  error?: string;
  slotError?: string;
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

function formatSlotError(message: string, code?: string): string {
  if (
    code === "PGRST205" ||
    message.includes("schema cache") ||
    message.includes("Could not find")
  ) {
    return (
      "The character_image_slot_assignments table is not exposed to the Supabase Data API yet. " +
      "Run supabase/migrations/20250626000000_character_image_slot_assignments.sql and " +
      "supabase/fix-character-bible-api.sql in the Supabase SQL Editor."
    );
  }
  return message;
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
      .update({
        photo_path: null,
        featured_image_id: null,
        portrait_focal_y: 50,
      })
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
      portrait_focal_y: 50,
    })
    .eq("id", characterId);
}

async function upsertSlotAssignment(
  supabase: Awaited<ReturnType<typeof createClient>>,
  characterId: string,
  imageId: string,
  slotRole: string,
  source: AssetSource
) {
  const { error } = await supabase
    .from("character_image_slot_assignments")
    .upsert(
      {
        character_id: characterId,
        image_id: imageId,
        slot_role: slotRole,
        source,
      },
      { onConflict: "character_id,slot_role" }
    );

  if (error) {
    throw new Error(formatSlotError(error.message, error.code));
  }
}

async function assignCanonicalRole(
  supabase: Awaited<ReturnType<typeof createClient>>,
  characterId: string,
  imageId: string,
  source: AssetSource = "assigned"
) {
  await upsertSlotAssignment(supabase, characterId, imageId, "canonical", source);
  await syncPhotoPathFromFeatured(supabase, characterId, imageId);
}

async function revalidateCharacterPaths(
  supabase: Awaited<ReturnType<typeof createClient>>,
  characterId: string,
  userId: string
) {
  revalidatePath("/dashboard");
  revalidatePath("/dashboard/characters");
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
  supabase: Awaited<ReturnType<typeof createClient>>,
  images: CharacterImage[]
): Promise<CharacterImageWithUrl[]> {
  return attachSignedUrls(
    supabase,
    images,
    (image) => image.image_path,
    (image, url) => ({ ...image, url })
  );
}

async function fetchSlotAssignments(
  supabase: Awaited<ReturnType<typeof createClient>>,
  characterId: string
): Promise<{ assignments: CharacterImageSlotAssignment[]; error?: string }> {
  const { data, error } = await supabase
    .from("character_image_slot_assignments")
    .select("*")
    .eq("character_id", characterId)
    .order("created_at", { ascending: true });

  if (error) {
    return {
      assignments: [],
      error: formatSlotError(error.message, error.code),
    };
  }

  return {
    assignments: (data ?? []).map((row) =>
      normalizeSlotAssignment(row as CharacterImageSlotAssignment)
    ),
  };
}

export async function getCharacterSlotAssignments(
  characterId: string
): Promise<{ assignments: CharacterImageSlotAssignment[]; error?: string }> {
  const auth = await assertCharacterOwner(characterId);
  if (auth.error || !auth.supabase) {
    return { assignments: [], error: auth.error ?? undefined };
  }

  return fetchSlotAssignments(auth.supabase, characterId);
}

export async function assignImageToSlot(
  characterId: string,
  imageId: string,
  slotRole: string,
  source: AssetSource = "assigned"
): Promise<CharacterImageActionResult> {
  const role = parseAssetRole(slotRole);
  if (!isSlotAssetRole(role)) {
    return { error: "Invalid slot role." };
  }

  const auth = await assertCharacterOwner(characterId);
  if (auth.error || !auth.supabase || !auth.user) {
    return { error: auth.error ?? "Unauthorized." };
  }

  const { data: image, error: imageError } = await auth.supabase
    .from("character_images")
    .select("id")
    .eq("id", imageId)
    .eq("character_id", characterId)
    .maybeSingle();

  if (imageError || !image) {
    return { error: "Image not found on this character." };
  }

  try {
    if (role === "canonical") {
      await assignCanonicalRole(auth.supabase, characterId, imageId, source);
    } else {
      await upsertSlotAssignment(
        auth.supabase,
        characterId,
        imageId,
        role,
        source
      );
    }
  } catch (err) {
    return {
      error: err instanceof Error ? err.message : "Failed to assign image.",
    };
  }

  await revalidateCharacterPaths(auth.supabase, characterId, auth.user.id);
  return { success: true };
}

export async function removeImageFromSlot(
  characterId: string,
  imageId: string,
  slotRole: string
): Promise<CharacterImageActionResult> {
  const role = parseAssetRole(slotRole);
  if (!isSlotAssetRole(role)) {
    return { error: "Invalid slot role." };
  }

  const auth = await assertCharacterOwner(characterId);
  if (auth.error || !auth.supabase || !auth.user || !auth.character) {
    return { error: auth.error ?? "Unauthorized." };
  }

  const { data: assignment, error: fetchError } = await auth.supabase
    .from("character_image_slot_assignments")
    .select("id, image_id")
    .eq("character_id", characterId)
    .eq("slot_role", role)
    .maybeSingle();

  if (fetchError) {
    return { error: formatSlotError(fetchError.message, fetchError.code) };
  }

  if (!assignment || assignment.image_id !== imageId) {
    return { error: "This image is not assigned to that role." };
  }

  const { error: deleteError } = await auth.supabase
    .from("character_image_slot_assignments")
    .delete()
    .eq("id", assignment.id);

  if (deleteError) {
    return { error: formatSlotError(deleteError.message, deleteError.code) };
  }

  if (role === "canonical" && auth.character.featured_image_id === imageId) {
    await syncPhotoPathFromFeatured(auth.supabase, characterId, null);
  }

  await revalidateCharacterPaths(auth.supabase, characterId, auth.user.id);
  return { success: true };
}

export async function getCharacterImages(
  characterId: string
): Promise<CharacterImagesResult> {
  const auth = await assertCharacterOwner(characterId);
  if (auth.error || !auth.supabase || !auth.character) {
    return {
      images: [],
      featuredImageId: null,
      slotAssignments: [],
      error: auth.error ?? undefined,
    };
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
      slotAssignments: [],
      error: formatImageError(error.message, error.code),
    };
  }

  const images = (data ?? []).map((row) =>
    normalizeCharacterImage(row as CharacterImage)
  );

  const slotResult = await fetchSlotAssignments(auth.supabase, characterId);

  return {
    images: await attachUrls(auth.supabase, images),
    featuredImageId: auth.character.featured_image_id,
    slotAssignments: slotResult.assignments,
    slotError: slotResult.error,
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

  return attachUrls(supabase, images);
}

export async function uploadCharacterImage(
  characterId: string,
  formData: FormData
): Promise<CharacterImageActionResult> {
  const file = formData.get("image");
  const caption = String(formData.get("caption") ?? "").trim() || null;
  const requestedRole = String(formData.get("asset_role") ?? "").trim();

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
  const slotRole = requestedRole && isSlotAssetRole(requestedRole)
    ? requestedRole
    : null;

  const { error: insertError } = await auth.supabase
    .from("character_images")
    .insert({
      id: imageId,
      character_id: characterId,
      image_path: imagePath,
      caption,
      sort_order: sortOrder,
      asset_role: "reference",
    });

  if (insertError) {
    await auth.supabase.storage.from(BUCKET).remove([imagePath]);
    return { error: formatImageError(insertError.message, insertError.code) };
  }

  if (slotRole) {
    try {
      if (slotRole === "canonical") {
        await assignCanonicalRole(
          auth.supabase,
          characterId,
          imageId,
          "uploaded"
        );
      } else {
        await upsertSlotAssignment(
          auth.supabase,
          characterId,
          imageId,
          slotRole,
          "uploaded"
        );
      }
    } catch (err) {
      await auth.supabase.from("character_images").delete().eq("id", imageId);
      await auth.supabase.storage.from(BUCKET).remove([imagePath]);
      return {
        error: err instanceof Error ? err.message : "Failed to assign slot.",
      };
    }
  }

  await revalidateCharacterPaths(auth.supabase, characterId, auth.user.id);

  void scanUploadedImage({
    supabase: auth.supabase,
    userId: auth.user.id,
    entityType: "character_image",
    entityId: imageId,
    storageBucket: BUCKET,
    storagePath: imagePath,
    mimeType: file.type,
  });

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

  void scanSavedText({
    supabase: auth.supabase,
    userId: auth.user.id,
    entityType: "image_caption",
    entityId: imageId,
    fields: { caption },
  });

  await revalidateCharacterPaths(auth.supabase, image.character_id, auth.user.id);
  return { success: true };
}

export async function deleteCharacterImage(
  imageId: string
): Promise<CharacterImageActionResult> {
  const supabase = await createClient();

  const { data: image, error: fetchError } = await supabase
    .from("character_images")
    .select("id, character_id, image_path, asset_role")
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

  if (auth.character.featured_image_id === imageId) {
    if (newFeaturedId) {
      await assignCanonicalRole(auth.supabase, image.character_id, newFeaturedId);
    } else {
      await syncPhotoPathFromFeatured(auth.supabase, image.character_id, null);
    }
  }

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

  await assignCanonicalRole(auth.supabase, characterId, imageId);
  await revalidateCharacterPaths(auth.supabase, characterId, auth.user.id);
  return { success: true };
}

export async function updateCharacterImageRole(
  imageId: string,
  assetRole: string,
  assetRoleLabel?: string | null
): Promise<CharacterImageActionResult> {
  const role = parseAssetRole(assetRole);

  if (isSlotAssetRole(role)) {
    const supabase = await createClient();
    const { data: image, error: fetchError } = await supabase
      .from("character_images")
      .select("id, character_id")
      .eq("id", imageId)
      .single();

    if (fetchError || !image) {
      return { error: "Image not found." };
    }

    return assignImageToSlot(image.character_id, imageId, role, "assigned");
  }

  const supabase = await createClient();

  const { data: image, error: fetchError } = await supabase
    .from("character_images")
    .select("id, character_id, asset_role")
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
    .update({
      asset_role: role,
      asset_role_label: assetRoleLabel?.trim() || null,
    })
    .eq("id", imageId);

  if (error) {
    return { error: formatImageError(error.message, error.code) };
  }

  await revalidateCharacterPaths(auth.supabase, image.character_id, auth.user.id);
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
    asset_role: "reference",
  });

  if (insertError) {
    return { error: insertError.message };
  }

  await assignCanonicalRole(supabase, characterId, imageId, "uploaded");
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
