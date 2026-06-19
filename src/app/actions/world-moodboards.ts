"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { revalidateStoryWorkspacePagesForWorld } from "@/app/actions/stories";
import { uploadWorldImage } from "@/app/actions/world-images";
import {
  normalizeWorldMoodboard,
  normalizeWorldMoodboardItem,
  type WorldMoodboardBundle,
} from "@/types/world-moodboard";

function formatError(message: string, code?: string): string {
  if (
    code === "PGRST205" ||
    message.includes("schema cache") ||
    message.includes("Could not find")
  ) {
    return (
      "The world_moodboards table is not exposed to the Supabase Data API yet. " +
      "Run supabase/migrations/20250701000000_phase_a_worldbuilding_foundations.sql and " +
      "supabase/fix-worldbuilding-foundations-api.sql in the Supabase SQL Editor."
    );
  }
  return message;
}

function revalidateWorld(worldId: string) {
  revalidatePath(`/dashboard/worlds/${worldId}`);
  void revalidateStoryWorkspacePagesForWorld(worldId);
}

async function getSignedUrl(path: string | null): Promise<string | null> {
  if (!path) return null;
  const supabase = await createClient();
  const { data } = await supabase.storage
    .from("character-photos")
    .createSignedUrl(path, 3600);
  return data?.signedUrl ?? null;
}

async function ensureMoodboard(
  worldId: string,
  userId: string
): Promise<{ moodboardId: string; error?: string }> {
  const supabase = await createClient();

  const { data: existing } = await supabase
    .from("world_moodboards")
    .select("id")
    .eq("world_id", worldId)
    .maybeSingle();

  if (existing?.id) {
    return { moodboardId: existing.id as string };
  }

  const { data: created, error } = await supabase
    .from("world_moodboards")
    .insert({
      world_id: worldId,
      user_id: userId,
      title: "Moodboard",
    })
    .select("id")
    .single();

  if (error || !created) {
    return {
      moodboardId: "",
      error: formatError(error?.message ?? "Failed to create moodboard.", error?.code),
    };
  }

  return { moodboardId: created.id as string };
}

export async function getWorldMoodboardBundle(
  worldId: string
): Promise<{ bundle: WorldMoodboardBundle | null; error?: string }> {
  if (!worldId) {
    return { bundle: null, error: "World ID is required." };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { bundle: null, error: "You must be logged in." };
  }

  const { data: world } = await supabase
    .from("worlds")
    .select("id")
    .eq("id", worldId)
    .eq("user_id", user.id)
    .maybeSingle();

  if (!world) {
    return { bundle: null, error: "World not found." };
  }

  const ensured = await ensureMoodboard(worldId, user.id);
  if (ensured.error) {
    return { bundle: null, error: ensured.error };
  }

  const { data: boardRow, error: boardError } = await supabase
    .from("world_moodboards")
    .select("*")
    .eq("id", ensured.moodboardId)
    .single();

  if (boardError || !boardRow) {
    return {
      bundle: null,
      error: formatError(boardError?.message ?? "Moodboard not found.", boardError?.code),
    };
  }

  const moodboard = normalizeWorldMoodboard(boardRow);

  const { data: itemRows, error: itemError } = await supabase
    .from("world_moodboard_items")
    .select("*")
    .eq("moodboard_id", moodboard.id)
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: true });

  if (itemError) {
    return { bundle: null, error: formatError(itemError.message, itemError.code) };
  }

  const items = (itemRows ?? []).map(normalizeWorldMoodboardItem);
  const imageIds = items.map((item) => item.world_image_id);

  const imagePaths = new Map<string, string>();
  if (imageIds.length > 0) {
    const { data: images } = await supabase
      .from("world_images")
      .select("id, image_path")
      .in("id", imageIds);
    for (const img of images ?? []) {
      imagePaths.set(img.id as string, img.image_path as string);
    }
  }

  const itemsWithUrl = await Promise.all(
    items.map(async (item) => ({
      item,
      imageUrl: await getSignedUrl(
        imagePaths.get(item.world_image_id) ?? null
      ),
    }))
  );

  return { bundle: { moodboard, items: itemsWithUrl } };
}

export async function addMoodboardImageFromGallery(
  worldId: string,
  worldImageId: string
): Promise<{ error?: string; success?: boolean }> {
  if (!worldImageId) {
    return { error: "Image is required." };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "You must be logged in." };
  }

  const ensured = await ensureMoodboard(worldId, user.id);
  if (ensured.error) {
    return { error: ensured.error };
  }

  const { count } = await supabase
    .from("world_moodboard_items")
    .select("*", { count: "exact", head: true })
    .eq("moodboard_id", ensured.moodboardId);

  const { error } = await supabase.from("world_moodboard_items").insert({
    moodboard_id: ensured.moodboardId,
    world_image_id: worldImageId,
    sort_order: count ?? 0,
  });

  if (error) {
    if (error.message.includes("duplicate") || error.code === "23505") {
      return { error: "This image is already on the moodboard." };
    }
    return { error: formatError(error.message, error.code) };
  }

  revalidateWorld(worldId);
  return { success: true };
}

export async function uploadMoodboardImage(
  worldId: string,
  formData: FormData
): Promise<{ error?: string; success?: boolean }> {
  const uploadForm = new FormData();
  const file = formData.get("image");
  if (file instanceof File) {
    uploadForm.set("image", file);
  }
  uploadForm.set("asset_role", "mood_board");

  const uploadResult = await uploadWorldImage(worldId, uploadForm);
  if (uploadResult.error) {
    return uploadResult;
  }

  const supabase = await createClient();
  const { data: assignment } = await supabase
    .from("world_image_slot_assignments")
    .select("image_id")
    .eq("world_id", worldId)
    .eq("slot_role", "mood_board")
    .maybeSingle();

  const { data: latest } = await supabase
    .from("world_images")
    .select("id")
    .eq("world_id", worldId)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  const imageId = (assignment?.image_id ?? latest?.id) as string | undefined;
  if (!imageId) {
    return { error: "Upload succeeded but image could not be found." };
  }

  return addMoodboardImageFromGallery(worldId, imageId);
}

export async function removeMoodboardItem(
  itemId: string,
  worldId: string
): Promise<{ error?: string; success?: boolean }> {
  if (!itemId) {
    return { error: "Item ID is required." };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "You must be logged in." };
  }

  const { error } = await supabase
    .from("world_moodboard_items")
    .delete()
    .eq("id", itemId);

  if (error) {
    return { error: formatError(error.message, error.code) };
  }

  revalidateWorld(worldId);
  return { success: true };
}
