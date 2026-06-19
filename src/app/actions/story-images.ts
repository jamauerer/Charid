"use server";

import { randomUUID } from "crypto";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import {
  normalizeStoryImage,
  parseStoryAssetType,
  isStorySlotRole,
  type StoryImage,
  type StoryImageWithUrl,
} from "@/types/story-image";
import {
  normalizeStorySlotAssignment,
  type StoryAssetSource,
  type StoryImageSlotAssignment,
} from "@/types/story-image-slot";
import { scanUploadedImage } from "@/lib/moderation/scan-image";
import { scanSavedText } from "@/lib/moderation/scan-text";

const BUCKET = "character-photos";
const MAX_FILE_SIZE = 5 * 1024 * 1024;
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];

export type StoryImageActionResult = {
  error?: string;
  success?: boolean;
};

export type StoryImagesResult = {
  images: StoryImageWithUrl[];
  featuredImageId: string | null;
  slotAssignments: StoryImageSlotAssignment[];
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
      "The story_images table is not exposed to the Supabase Data API yet. " +
      "Run supabase/migrations/20250622000000_story_images.sql and " +
      "supabase/fix-story-images-api.sql in the Supabase SQL Editor."
    );
  }
  return message;
}

function formatStorySlotError(message: string, code?: string): string {
  if (
    code === "PGRST205" ||
    message.includes("schema cache") ||
    message.includes("Could not find")
  ) {
    return (
      "The story_image_slot_assignments table is not exposed to the Supabase Data API yet. " +
      "Run supabase/migrations/20250631000000_story_bible.sql and " +
      "supabase/fix-story-bible-api.sql in the Supabase SQL Editor."
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

async function assertStoryOwner(storyId: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "You must be logged in.", supabase, user: null, story: null };
  }

  const { data: story, error } = await supabase
    .from("stories")
    .select("id, user_id, world_id, slug, featured_image_id")
    .eq("id", storyId)
    .single();

  if (error || !story) {
    return { error: "Story not found.", supabase, user: null, story: null };
  }

  if (story.user_id !== user.id) {
    return {
      error: "You do not have permission to edit this story.",
      supabase,
      user: null,
      story: null,
    };
  }

  return { error: null, supabase, user, story };
}

async function syncFeaturedImage(
  supabase: Awaited<ReturnType<typeof createClient>>,
  storyId: string,
  featuredImageId: string | null
) {
  await supabase
    .from("stories")
    .update({ featured_image_id: featuredImageId })
    .eq("id", storyId);
}

async function revalidateStoryImagePaths(
  supabase: Awaited<ReturnType<typeof createClient>>,
  userId: string,
  worldId: string,
  story?: { id: string; slug: string }
) {
  revalidatePath(`/dashboard/worlds/${worldId}`);
  if (story) {
    revalidatePath(`/dashboard/worlds/${worldId}/stories/${story.id}`);
  }

  const { data: worldRow } = await supabase
    .from("worlds")
    .select("slug")
    .eq("id", worldId)
    .maybeSingle();

  const { data: profile } = await supabase
    .from("profiles")
    .select("username")
    .eq("id", userId)
    .maybeSingle();

  if (profile?.username && worldRow?.slug) {
    revalidatePath(`/u/${profile.username}/worlds/${worldRow.slug}`);
    if (story) {
      revalidatePath(
        `/u/${profile.username}/worlds/${worldRow.slug}/stories/${story.slug}`
      );
    }
  }
}

async function attachUrls(
  images: StoryImage[]
): Promise<StoryImageWithUrl[]> {
  return Promise.all(
    images.map(async (image) => ({
      ...image,
      url: await getSignedStorageUrl(image.image_path),
    }))
  );
}

async function fetchSlotAssignments(
  supabase: Awaited<ReturnType<typeof createClient>>,
  storyId: string
): Promise<{ assignments: StoryImageSlotAssignment[]; error?: string }> {
  const { data, error } = await supabase
    .from("story_image_slot_assignments")
    .select("*")
    .eq("story_id", storyId)
    .order("created_at", { ascending: true });

  if (error) {
    return {
      assignments: [],
      error: formatStorySlotError(error.message, error.code),
    };
  }

  return {
    assignments: (data ?? []).map((row) =>
      normalizeStorySlotAssignment(row as StoryImageSlotAssignment)
    ),
  };
}

async function upsertStorySlotAssignment(
  supabase: Awaited<ReturnType<typeof createClient>>,
  storyId: string,
  imageId: string,
  slotRole: string,
  source: StoryAssetSource
) {
  const { error } = await supabase
    .from("story_image_slot_assignments")
    .upsert(
      {
        story_id: storyId,
        image_id: imageId,
        slot_role: slotRole,
        source,
      },
      { onConflict: "story_id,slot_role" }
    );

  if (error) {
    throw new Error(formatStorySlotError(error.message, error.code));
  }
}

export async function assignStoryImageToSlot(
  storyId: string,
  imageId: string,
  slotRole: string,
  source: StoryAssetSource = "assigned"
): Promise<StoryImageActionResult> {
  if (!isStorySlotRole(slotRole)) {
    return { error: "Invalid slot role." };
  }

  const auth = await assertStoryOwner(storyId);
  if (auth.error || !auth.supabase || !auth.user || !auth.story) {
    return { error: auth.error ?? "Unauthorized." };
  }

  const { data: image, error: imageError } = await auth.supabase
    .from("story_images")
    .select("id")
    .eq("id", imageId)
    .eq("story_id", storyId)
    .maybeSingle();

  if (imageError || !image) {
    return { error: "Image not found on this story." };
  }

  try {
    await upsertStorySlotAssignment(
      auth.supabase,
      storyId,
      imageId,
      slotRole,
      source
    );
  } catch (err) {
    return {
      error: err instanceof Error ? err.message : "Failed to assign image.",
    };
  }

  if (slotRole === "cover") {
    await syncFeaturedImage(auth.supabase, storyId, imageId);
  }

  await revalidateStoryImagePaths(
    auth.supabase,
    auth.user.id,
    auth.story.world_id,
    { id: auth.story.id, slug: auth.story.slug }
  );
  return { success: true };
}

export async function removeStoryImageFromSlot(
  storyId: string,
  imageId: string,
  slotRole: string
): Promise<StoryImageActionResult> {
  if (!isStorySlotRole(slotRole)) {
    return { error: "Invalid slot role." };
  }

  const auth = await assertStoryOwner(storyId);
  if (auth.error || !auth.supabase || !auth.user || !auth.story) {
    return { error: auth.error ?? "Unauthorized." };
  }

  const { data: assignment, error: fetchError } = await auth.supabase
    .from("story_image_slot_assignments")
    .select("id, image_id")
    .eq("story_id", storyId)
    .eq("slot_role", slotRole)
    .maybeSingle();

  if (fetchError) {
    return { error: formatStorySlotError(fetchError.message, fetchError.code) };
  }

  if (!assignment || assignment.image_id !== imageId) {
    return { error: "This image is not assigned to that role." };
  }

  const { error: deleteError } = await auth.supabase
    .from("story_image_slot_assignments")
    .delete()
    .eq("id", assignment.id);

  if (deleteError) {
    return { error: formatStorySlotError(deleteError.message, deleteError.code) };
  }

  await revalidateStoryImagePaths(
    auth.supabase,
    auth.user.id,
    auth.story.world_id,
    { id: auth.story.id, slug: auth.story.slug }
  );
  return { success: true };
}

export async function getStoryImages(
  storyId: string
): Promise<StoryImagesResult> {
  const auth = await assertStoryOwner(storyId);
  if (auth.error || !auth.supabase || !auth.story) {
    return {
      images: [],
      featuredImageId: null,
      slotAssignments: [],
      error: auth.error ?? undefined,
    };
  }

  const { data, error } = await auth.supabase
    .from("story_images")
    .select("*")
    .eq("story_id", storyId)
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: true });

  if (error) {
    return {
      images: [],
      featuredImageId: auth.story.featured_image_id,
      slotAssignments: [],
      error: formatImageError(error.message, error.code),
    };
  }

  const images = (data ?? []).map((row) =>
    normalizeStoryImage(row as StoryImage)
  );

  const slotResult = await fetchSlotAssignments(auth.supabase, storyId);

  return {
    images: await attachUrls(images),
    featuredImageId: auth.story.featured_image_id,
    slotAssignments: slotResult.assignments,
    slotError: slotResult.error,
  };
}

export async function getPublicStoryImages(
  storyId: string
): Promise<StoryImageWithUrl[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("story_images")
    .select("*")
    .eq("story_id", storyId)
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: true });

  if (error) {
    console.error("Failed to fetch public story images:", error.message);
    return [];
  }

  const images = (data ?? []).map((row) =>
    normalizeStoryImage(row as StoryImage)
  );

  return attachUrls(images);
}

export async function getStoryCoverUrl(
  storyId: string
): Promise<string | null> {
  const supabase = await createClient();

  const { data: story } = await supabase
    .from("stories")
    .select("featured_image_id")
    .eq("id", storyId)
    .maybeSingle();

  if (!story?.featured_image_id) {
    return null;
  }

  const { data: image } = await supabase
    .from("story_images")
    .select("image_path")
    .eq("id", story.featured_image_id)
    .maybeSingle();

  return getSignedStorageUrl(image?.image_path ?? null);
}

export async function getStoryCoverUrls(
  storyIds: string[]
): Promise<Record<string, string | null>> {
  if (storyIds.length === 0) {
    return {};
  }

  const supabase = await createClient();
  const { data: stories } = await supabase
    .from("stories")
    .select("id, featured_image_id")
    .in("id", storyIds);

  const featuredIds = (stories ?? [])
    .map((story) => story.featured_image_id)
    .filter((id): id is string => Boolean(id));

  const pathByImageId = new Map<string, string>();
  if (featuredIds.length > 0) {
    const { data: images } = await supabase
      .from("story_images")
      .select("id, image_path")
      .in("id", featuredIds);

    for (const image of images ?? []) {
      pathByImageId.set(image.id, image.image_path);
    }
  }

  const featuredByStoryId = new Map(
    (stories ?? []).map((story) => [story.id, story.featured_image_id])
  );

  const result: Record<string, string | null> = {};
  await Promise.all(
    storyIds.map(async (storyId) => {
      const featuredId = featuredByStoryId.get(storyId);
      if (!featuredId) {
        result[storyId] = null;
        return;
      }
      const path = pathByImageId.get(featuredId);
      result[storyId] = path ? await getSignedStorageUrl(path) : null;
    })
  );

  return result;
}

export async function uploadStoryImage(
  storyId: string,
  formData: FormData
): Promise<StoryImageActionResult> {
  const file = formData.get("image");
  const caption = String(formData.get("caption") ?? "").trim() || null;
  const assetType = parseStoryAssetType(formData.get("asset_type"));
  const requestedRole = String(formData.get("asset_role") ?? "").trim();

  if (!(file instanceof File) || file.size === 0) {
    return { error: "Please choose an image to upload." };
  }

  const photoError = validatePhoto(file);
  if (photoError) {
    return { error: photoError };
  }

  const auth = await assertStoryOwner(storyId);
  if (auth.error || !auth.supabase || !auth.user || !auth.story) {
    return { error: auth.error ?? "Unauthorized." };
  }

  const imageId = randomUUID();
  const extension = file.type.split("/")[1] ?? "jpg";
  const imagePath = `${auth.user.id}/stories/${storyId}/gallery/${imageId}.${extension}`;

  const { error: uploadError } = await auth.supabase.storage
    .from(BUCKET)
    .upload(imagePath, file, { contentType: file.type, upsert: false });

  if (uploadError) {
    return { error: `Failed to upload image: ${uploadError.message}` };
  }

  const { count } = await auth.supabase
    .from("story_images")
    .select("*", { count: "exact", head: true })
    .eq("story_id", storyId);

  const sortOrder = count ?? 0;
  const isFirst = sortOrder === 0;

  const { error: insertError } = await auth.supabase.from("story_images").insert({
    id: imageId,
    story_id: storyId,
    image_path: imagePath,
    caption,
    asset_type: assetType,
    sort_order: sortOrder,
  });

  if (insertError) {
    await auth.supabase.storage.from(BUCKET).remove([imagePath]);
    return { error: formatImageError(insertError.message, insertError.code) };
  }

  if (isFirst || !auth.story.featured_image_id) {
    await syncFeaturedImage(auth.supabase, storyId, imageId);
  }

  const slotRole =
    requestedRole && isStorySlotRole(requestedRole) ? requestedRole : null;

  if (slotRole) {
    try {
      await upsertStorySlotAssignment(
        auth.supabase,
        storyId,
        imageId,
        slotRole,
        "uploaded"
      );
    } catch (err) {
      return {
        error:
          err instanceof Error ? err.message : "Failed to assign uploaded image.",
      };
    }
    if (slotRole === "cover") {
      await syncFeaturedImage(auth.supabase, storyId, imageId);
    }
  }

  await revalidateStoryImagePaths(
    auth.supabase,
    auth.user.id,
    auth.story.world_id,
    { id: auth.story.id, slug: auth.story.slug }
  );

  void scanUploadedImage({
    supabase: auth.supabase,
    userId: auth.user.id,
    entityType: "story_image",
    entityId: imageId,
    storageBucket: BUCKET,
    storagePath: imagePath,
    mimeType: file.type,
  });

  return { success: true };
}

export async function updateStoryImageCaption(
  imageId: string,
  caption: string
): Promise<StoryImageActionResult> {
  const supabase = await createClient();

  const { data: image, error: fetchError } = await supabase
    .from("story_images")
    .select("id, story_id")
    .eq("id", imageId)
    .single();

  if (fetchError || !image) {
    return { error: "Image not found." };
  }

  const auth = await assertStoryOwner(image.story_id);
  if (auth.error || !auth.supabase || !auth.user || !auth.story) {
    return { error: auth.error ?? "Unauthorized." };
  }

  const { error } = await auth.supabase
    .from("story_images")
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

  await revalidateStoryImagePaths(
    auth.supabase,
    auth.user.id,
    auth.story.world_id,
    { id: auth.story.id, slug: auth.story.slug }
  );
  return { success: true };
}

export async function updateStoryImageAssetType(
  imageId: string,
  assetType: string
): Promise<StoryImageActionResult> {
  const supabase = await createClient();

  const { data: image, error: fetchError } = await supabase
    .from("story_images")
    .select("id, story_id")
    .eq("id", imageId)
    .single();

  if (fetchError || !image) {
    return { error: "Image not found." };
  }

  const auth = await assertStoryOwner(image.story_id);
  if (auth.error || !auth.supabase || !auth.user || !auth.story) {
    return { error: auth.error ?? "Unauthorized." };
  }

  const { error } = await auth.supabase
    .from("story_images")
    .update({ asset_type: parseStoryAssetType(assetType) })
    .eq("id", imageId);

  if (error) {
    return { error: formatImageError(error.message, error.code) };
  }

  await revalidateStoryImagePaths(
    auth.supabase,
    auth.user.id,
    auth.story.world_id,
    { id: auth.story.id, slug: auth.story.slug }
  );
  return { success: true };
}

export async function deleteStoryImage(
  imageId: string
): Promise<StoryImageActionResult> {
  const supabase = await createClient();

  const { data: image, error: fetchError } = await supabase
    .from("story_images")
    .select("id, story_id, image_path")
    .eq("id", imageId)
    .single();

  if (fetchError || !image) {
    return { error: "Image not found." };
  }

  const auth = await assertStoryOwner(image.story_id);
  if (auth.error || !auth.supabase || !auth.user || !auth.story) {
    return { error: auth.error ?? "Unauthorized." };
  }

  const { error: storageError } = await auth.supabase.storage
    .from(BUCKET)
    .remove([image.image_path]);

  if (storageError) {
    return { error: `Failed to delete image file: ${storageError.message}` };
  }

  const { error: deleteError } = await auth.supabase
    .from("story_images")
    .delete()
    .eq("id", imageId);

  if (deleteError) {
    return { error: formatImageError(deleteError.message, deleteError.code) };
  }

  let newFeaturedId = auth.story.featured_image_id;
  if (auth.story.featured_image_id === imageId) {
    const { data: remaining } = await auth.supabase
      .from("story_images")
      .select("id")
      .eq("story_id", image.story_id)
      .order("sort_order", { ascending: true })
      .limit(1);

    newFeaturedId = remaining?.[0]?.id ?? null;
  }

  await syncFeaturedImage(auth.supabase, image.story_id, newFeaturedId);

  const { data: remainingImages } = await auth.supabase
    .from("story_images")
    .select("id")
    .eq("story_id", image.story_id)
    .order("sort_order", { ascending: true });

  if (remainingImages) {
    await Promise.all(
      remainingImages.map((row, index) =>
        auth.supabase!
          .from("story_images")
          .update({ sort_order: index })
          .eq("id", row.id)
      )
    );
  }

  await revalidateStoryImagePaths(
    auth.supabase,
    auth.user.id,
    auth.story.world_id,
    { id: auth.story.id, slug: auth.story.slug }
  );
  return { success: true };
}

export async function reorderStoryImages(
  storyId: string,
  orderedImageIds: string[]
): Promise<StoryImageActionResult> {
  const auth = await assertStoryOwner(storyId);
  if (auth.error || !auth.supabase || !auth.user || !auth.story) {
    return { error: auth.error ?? "Unauthorized." };
  }

  const { data: currentImages } = await auth.supabase
    .from("story_images")
    .select("id")
    .eq("story_id", storyId)
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: true });

  const oldFirstId = currentImages?.[0]?.id ?? null;
  const featuredWasFirst =
    !auth.story.featured_image_id ||
    auth.story.featured_image_id === oldFirstId;

  await Promise.all(
    orderedImageIds.map((id, index) =>
      auth.supabase!
        .from("story_images")
        .update({ sort_order: index })
        .eq("id", id)
        .eq("story_id", storyId)
    )
  );

  const newFirstId = orderedImageIds[0] ?? null;
  if (featuredWasFirst && newFirstId) {
    await syncFeaturedImage(auth.supabase, storyId, newFirstId);
  }

  await revalidateStoryImagePaths(
    auth.supabase,
    auth.user.id,
    auth.story.world_id,
    { id: auth.story.id, slug: auth.story.slug }
  );
  return { success: true };
}

export async function setFeaturedStoryImage(
  storyId: string,
  imageId: string
): Promise<StoryImageActionResult> {
  const auth = await assertStoryOwner(storyId);
  if (auth.error || !auth.supabase || !auth.user || !auth.story) {
    return { error: auth.error ?? "Unauthorized." };
  }

  const { data: image, error } = await auth.supabase
    .from("story_images")
    .select("id")
    .eq("id", imageId)
    .eq("story_id", storyId)
    .maybeSingle();

  if (error || !image) {
    return { error: "Image not found on this story." };
  }

  await syncFeaturedImage(auth.supabase, storyId, imageId);
  await revalidateStoryImagePaths(
    auth.supabase,
    auth.user.id,
    auth.story.world_id,
    { id: auth.story.id, slug: auth.story.slug }
  );
  return { success: true };
}

export async function deleteAllStoryImageFiles(
  supabase: Awaited<ReturnType<typeof createClient>>,
  storyId: string
) {
  const { data: images } = await supabase
    .from("story_images")
    .select("image_path")
    .eq("story_id", storyId);

  const paths = (images ?? []).map((image) => image.image_path);
  if (paths.length > 0) {
    await supabase.storage.from(BUCKET).remove(paths);
  }
}
