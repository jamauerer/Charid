"use server";

import { randomUUID } from "crypto";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import {
  normalizeWorldImage,
  isWorldSlotRole,
  type WorldImage,
  type WorldImageWithUrl,
} from "@/types/world-image";
import {
  normalizeWorldSlotAssignment,
  type WorldAssetSource,
  type WorldImageSlotAssignment,
} from "@/types/world-image-slot";
import { scanUploadedImage } from "@/lib/moderation/scan-image";
import {
  attachSignedUrls,
  CHARACTER_PHOTOS_BUCKET,
} from "@/lib/storage/signed-url";

const BUCKET = CHARACTER_PHOTOS_BUCKET;
const MAX_FILE_SIZE = 5 * 1024 * 1024;
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];

export type WorldImageActionResult = {
  error?: string;
  success?: boolean;
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

function formatWorldImageError(message: string, code?: string): string {
  if (
    code === "PGRST205" ||
    message.includes("schema cache") ||
    message.includes("Could not find")
  ) {
    return (
      "The world_images table is not exposed to the Supabase Data API yet. " +
      "Run supabase/migrations/20250627000000_world_bible.sql and " +
      "supabase/fix-world-bible-api.sql in the Supabase SQL Editor."
    );
  }
  return message;
}

function formatWorldSlotError(message: string, code?: string): string {
  if (
    code === "PGRST205" ||
    message.includes("schema cache") ||
    message.includes("Could not find")
  ) {
    return (
      "The world_image_slot_assignments table is not exposed to the Supabase Data API yet. " +
      "Run supabase/migrations/20250627000000_world_bible.sql and " +
      "supabase/fix-world-bible-api.sql in the Supabase SQL Editor."
    );
  }
  return message;
}

async function attachUrls(
  supabase: Awaited<ReturnType<typeof createClient>>,
  images: WorldImage[]
): Promise<WorldImageWithUrl[]> {
  return attachSignedUrls(
    supabase,
    images,
    (image) => image.image_path,
    (image, url) => ({ ...image, url })
  );
}
async function revalidateWorldPaths(
  supabase: Awaited<ReturnType<typeof createClient>>,
  worldId: string,
  userId: string
) {
  revalidatePath("/dashboard/worlds");
  revalidatePath(`/dashboard/worlds/${worldId}`);

  const { data: profile } = await supabase
    .from("profiles")
    .select("username")
    .eq("id", userId)
    .maybeSingle();

  if (profile?.username) {
    revalidatePath(`/u/${profile.username}`);
  }
}

async function upsertWorldSlotAssignment(
  supabase: Awaited<ReturnType<typeof createClient>>,
  worldId: string,
  imageId: string,
  slotRole: string,
  source: WorldAssetSource
) {
  const { error } = await supabase
    .from("world_image_slot_assignments")
    .upsert(
      {
        world_id: worldId,
        image_id: imageId,
        slot_role: slotRole,
        source,
      },
      { onConflict: "world_id,slot_role" }
    );

  if (error) {
    throw new Error(formatWorldSlotError(error.message, error.code));
  }
}

async function assertWorldOwner(worldId: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "You must be logged in.", supabase, user: null, world: null };
  }

  const { data: world, error } = await supabase
    .from("worlds")
    .select("*")
    .eq("id", worldId)
    .single();

  if (error || !world) {
    return { error: "World not found.", supabase, user: null, world: null };
  }

  if (world.user_id !== user.id) {
    return {
      error: "You do not have permission to edit this world.",
      supabase,
      user: null,
      world: null,
    };
  }

  return { error: null, supabase, user, world };
}

async function fetchSlotAssignments(
  supabase: Awaited<ReturnType<typeof createClient>>,
  worldId: string
): Promise<{ assignments: WorldImageSlotAssignment[]; error?: string }> {
  const { data, error } = await supabase
    .from("world_image_slot_assignments")
    .select("*")
    .eq("world_id", worldId)
    .order("created_at", { ascending: true });

  if (error) {
    return {
      assignments: [],
      error: formatWorldSlotError(error.message, error.code),
    };
  }

  return {
    assignments: (data ?? []).map((row) =>
      normalizeWorldSlotAssignment(row as WorldImageSlotAssignment)
    ),
  };
}

export type WorldImagesResult = {
  images: WorldImageWithUrl[];
  slotAssignments: WorldImageSlotAssignment[];
  error?: string;
  slotError?: string;
};

export async function getWorldImages(
  worldId: string
): Promise<WorldImagesResult> {
  const auth = await assertWorldOwner(worldId);
  if (auth.error || !auth.supabase) {
    return {
      images: [],
      slotAssignments: [],
      error: auth.error ?? undefined,
    };
  }

  const { data, error } = await auth.supabase
    .from("world_images")
    .select("*")
    .eq("world_id", worldId)
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: true });

  if (error) {
    return {
      images: [],
      slotAssignments: [],
      error: formatWorldImageError(error.message, error.code),
    };
  }

  const images = (data ?? []).map((row) =>
    normalizeWorldImage(row as WorldImage)
  );

  const slotResult = await fetchSlotAssignments(auth.supabase, worldId);

  return {
    images: await attachUrls(auth.supabase, images),
    slotAssignments: slotResult.assignments,
    slotError: slotResult.error,
  };
}

export async function getPublicWorldImages(
  worldId: string
): Promise<WorldImageWithUrl[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("world_images")
    .select("*")
    .eq("world_id", worldId)
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: true });

  if (error) {
    console.error("Failed to fetch public world images:", error.message);
    return [];
  }

  const images = (data ?? []).map((row) =>
    normalizeWorldImage(row as WorldImage)
  );

  return attachUrls(supabase, images);
}

export async function getPublicWorldSlotAssignments(
  worldId: string
): Promise<WorldImageSlotAssignment[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("world_image_slot_assignments")
    .select("*")
    .eq("world_id", worldId)
    .order("created_at", { ascending: true });

  if (error) {
    console.error("Failed to fetch public world slot assignments:", error.message);
    return [];
  }

  return (data ?? []).map((row) =>
    normalizeWorldSlotAssignment(row as WorldImageSlotAssignment)
  );
}

export async function assignWorldImageToSlot(
  worldId: string,
  imageId: string,
  slotRole: string,
  source: WorldAssetSource = "assigned"
): Promise<WorldImageActionResult> {
  if (!isWorldSlotRole(slotRole)) {
    return { error: "Invalid slot role." };
  }

  const auth = await assertWorldOwner(worldId);
  if (auth.error || !auth.supabase || !auth.user) {
    return { error: auth.error ?? "Unauthorized." };
  }

  const { data: image, error: imageError } = await auth.supabase
    .from("world_images")
    .select("id")
    .eq("id", imageId)
    .eq("world_id", worldId)
    .maybeSingle();

  if (imageError || !image) {
    return { error: "Image not found on this world." };
  }

  try {
    await upsertWorldSlotAssignment(
      auth.supabase,
      worldId,
      imageId,
      slotRole,
      source
    );
  } catch (err) {
    return {
      error: err instanceof Error ? err.message : "Failed to assign image.",
    };
  }

  await revalidateWorldPaths(auth.supabase, worldId, auth.user.id);
  return { success: true };
}

export async function removeWorldImageFromSlot(
  worldId: string,
  imageId: string,
  slotRole: string
): Promise<WorldImageActionResult> {
  if (!isWorldSlotRole(slotRole)) {
    return { error: "Invalid slot role." };
  }

  const auth = await assertWorldOwner(worldId);
  if (auth.error || !auth.supabase || !auth.user) {
    return { error: auth.error ?? "Unauthorized." };
  }

  const { data: assignment, error: fetchError } = await auth.supabase
    .from("world_image_slot_assignments")
    .select("id, image_id")
    .eq("world_id", worldId)
    .eq("slot_role", slotRole)
    .maybeSingle();

  if (fetchError) {
    return { error: formatWorldSlotError(fetchError.message, fetchError.code) };
  }

  if (!assignment || assignment.image_id !== imageId) {
    return { error: "This image is not assigned to that role." };
  }

  const { error: deleteError } = await auth.supabase
    .from("world_image_slot_assignments")
    .delete()
    .eq("id", assignment.id);

  if (deleteError) {
    return { error: formatWorldSlotError(deleteError.message, deleteError.code) };
  }

  await revalidateWorldPaths(auth.supabase, worldId, auth.user.id);
  return { success: true };
}

export async function uploadWorldImage(
  worldId: string,
  formData: FormData
): Promise<WorldImageActionResult> {
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

  const auth = await assertWorldOwner(worldId);
  if (auth.error || !auth.supabase || !auth.user) {
    return { error: auth.error ?? "Unauthorized." };
  }

  const imageId = randomUUID();
  const extension = file.type.split("/")[1] ?? "jpg";
  const imagePath = `${auth.user.id}/worlds/${worldId}/gallery/${imageId}.${extension}`;

  const { error: uploadError } = await auth.supabase.storage
    .from(BUCKET)
    .upload(imagePath, file, { contentType: file.type, upsert: false });

  if (uploadError) {
    return { error: `Failed to upload image: ${uploadError.message}` };
  }

  const { count } = await auth.supabase
    .from("world_images")
    .select("*", { count: "exact", head: true })
    .eq("world_id", worldId);

  const sortOrder = count ?? 0;
  const slotRole =
    requestedRole && isWorldSlotRole(requestedRole) ? requestedRole : null;

  const { error: insertError } = await auth.supabase.from("world_images").insert({
    id: imageId,
    world_id: worldId,
    image_path: imagePath,
    caption,
    sort_order: sortOrder,
    asset_role: "reference",
  });

  if (insertError) {
    await auth.supabase.storage.from(BUCKET).remove([imagePath]);
    return { error: formatWorldImageError(insertError.message, insertError.code) };
  }

  if (slotRole) {
    try {
      await upsertWorldSlotAssignment(
        auth.supabase,
        worldId,
        imageId,
        slotRole,
        "uploaded"
      );
    } catch (err) {
      await auth.supabase.from("world_images").delete().eq("id", imageId);
      await auth.supabase.storage.from(BUCKET).remove([imagePath]);
      return {
        error: err instanceof Error ? err.message : "Failed to assign slot.",
      };
    }
  }

  await revalidateWorldPaths(auth.supabase, worldId, auth.user.id);

  void scanUploadedImage({
    supabase: auth.supabase,
    userId: auth.user.id,
    entityType: "world_cover",
    entityId: imageId,
    storageBucket: BUCKET,
    storagePath: imagePath,
    mimeType: file.type,
  });

  return { success: true };
}

export async function deleteWorldImage(
  imageId: string
): Promise<WorldImageActionResult> {
  const supabase = await createClient();

  const { data: image, error: fetchError } = await supabase
    .from("world_images")
    .select("id, world_id, image_path")
    .eq("id", imageId)
    .single();

  if (fetchError || !image) {
    return { error: "Image not found." };
  }

  const auth = await assertWorldOwner(image.world_id);
  if (auth.error || !auth.supabase || !auth.user) {
    return { error: auth.error ?? "Unauthorized." };
  }

  const { error: storageError } = await auth.supabase.storage
    .from(BUCKET)
    .remove([image.image_path]);

  if (storageError) {
    return { error: `Failed to delete image file: ${storageError.message}` };
  }

  const { error: deleteError } = await auth.supabase
    .from("world_images")
    .delete()
    .eq("id", imageId);

  if (deleteError) {
    return { error: formatWorldImageError(deleteError.message, deleteError.code) };
  }

  const { data: remainingImages } = await auth.supabase
    .from("world_images")
    .select("id")
    .eq("world_id", image.world_id)
    .order("sort_order", { ascending: true });

  if (remainingImages) {
    await Promise.all(
      remainingImages.map((row, index) =>
        auth.supabase!
          .from("world_images")
          .update({ sort_order: index })
          .eq("id", row.id)
      )
    );
  }

  await revalidateWorldPaths(auth.supabase, image.world_id, auth.user.id);
  return { success: true };
}
