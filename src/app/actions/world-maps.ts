"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { revalidateStoryWorkspacePagesForWorld } from "@/app/actions/stories";
import { assignWorldImageToSlot, uploadWorldImage } from "@/app/actions/world-images";
import { getSignedStorageUrl } from "@/lib/storage/signed-url";
import {
  normalizeMapLocationPin,
  normalizeWorldMap,
  type MapLocationPin,
  type WorldMapBundle,
} from "@/types/world-map";

function formatError(message: string, code?: string): string {
  if (
    code === "PGRST205" ||
    message.includes("schema cache") ||
    message.includes("Could not find")
  ) {
    return (
      "The world_maps table is not exposed to the Supabase Data API yet. " +
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

async function ensurePrimaryMap(
  worldId: string,
  userId: string
): Promise<{ mapId: string; error?: string }> {
  const supabase = await createClient();

  const { data: existing } = await supabase
    .from("world_maps")
    .select("id")
    .eq("world_id", worldId)
    .eq("is_primary", true)
    .maybeSingle();

  if (existing?.id) {
    return { mapId: existing.id as string };
  }

  const { data: created, error } = await supabase
    .from("world_maps")
    .insert({
      world_id: worldId,
      user_id: userId,
      title: "World Map",
      is_primary: true,
    })
    .select("id")
    .single();

  if (error || !created) {
    return {
      mapId: "",
      error: formatError(error?.message ?? "Failed to create map.", error?.code),
    };
  }

  return { mapId: created.id as string };
}

export async function getWorldMapBundle(
  worldId: string
): Promise<{ bundle: WorldMapBundle | null; error?: string }> {
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

  const ensured = await ensurePrimaryMap(worldId, user.id);
  if (ensured.error) {
    return { bundle: null, error: ensured.error };
  }

  const { data: mapRow, error: mapError } = await supabase
    .from("world_maps")
    .select("*")
    .eq("id", ensured.mapId)
    .single();

  if (mapError || !mapRow) {
    return {
      bundle: null,
      error: formatError(mapError?.message ?? "Map not found.", mapError?.code),
    };
  }

  const map = normalizeWorldMap(mapRow);
  let imageUrl: string | null = null;

  if (map.image_id) {
    const { data: image } = await supabase
      .from("world_images")
      .select("image_path")
      .eq("id", map.image_id)
      .maybeSingle();
    imageUrl = await getSignedStorageUrl(
      supabase,
      (image?.image_path as string | null) ?? null
    );
  }

  const { data: pinRows, error: pinError } = await supabase
    .from("map_location_pins")
    .select("*")
    .eq("map_id", map.id)
    .order("created_at", { ascending: true });

  if (pinError) {
    return { bundle: null, error: formatError(pinError.message, pinError.code) };
  }

  const pins = (pinRows ?? []).map(normalizeMapLocationPin);

  return {
    bundle: { map, imageUrl, pins },
  };
}

export async function uploadWorldMapImage(
  worldId: string,
  formData: FormData
): Promise<{ error?: string; success?: boolean }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "You must be logged in." };
  }

  const uploadForm = new FormData();
  const file = formData.get("image");
  if (file instanceof File) {
    uploadForm.set("image", file);
  }
  uploadForm.set("asset_role", "canonical_map");

  const uploadResult = await uploadWorldImage(worldId, uploadForm);
  if (uploadResult.error) {
    return uploadResult;
  }

  const { data: assignment } = await supabase
    .from("world_image_slot_assignments")
    .select("image_id")
    .eq("world_id", worldId)
    .eq("slot_role", "canonical_map")
    .maybeSingle();

  if (!assignment?.image_id) {
    return { error: "Map uploaded but slot assignment failed." };
  }

  const ensured = await ensurePrimaryMap(worldId, user.id);
  if (ensured.error) {
    return { error: ensured.error };
  }

  const { error } = await supabase
    .from("world_maps")
    .update({
      image_id: assignment.image_id,
      updated_at: new Date().toISOString(),
    })
    .eq("id", ensured.mapId);

  if (error) {
    return { error: formatError(error.message, error.code) };
  }

  revalidateWorld(worldId);
  return { success: true };
}

export async function assignWorldMapImage(
  worldId: string,
  imageId: string
): Promise<{ error?: string; success?: boolean }> {
  if (!imageId) {
    return { error: "Image is required." };
  }

  const slotResult = await assignWorldImageToSlot(
    worldId,
    imageId,
    "canonical_map"
  );
  if (slotResult.error) {
    return slotResult;
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "You must be logged in." };
  }

  const ensured = await ensurePrimaryMap(worldId, user.id);
  if (ensured.error) {
    return { error: ensured.error };
  }

  const { error } = await supabase
    .from("world_maps")
    .update({
      image_id: imageId,
      updated_at: new Date().toISOString(),
    })
    .eq("id", ensured.mapId);

  if (error) {
    return { error: formatError(error.message, error.code) };
  }

  revalidateWorld(worldId);
  return { success: true };
}

export async function addMapLocationPin(input: {
  worldId: string;
  mapId: string;
  label: string;
  pinX: number;
  pinY: number;
  locationId?: string | null;
}): Promise<{ error?: string; success?: boolean; pin?: MapLocationPin }> {
  const { worldId, mapId, label, pinX, pinY, locationId } = input;
  const trimmedLabel = label.trim();

  if (!mapId || !trimmedLabel) {
    return { error: "Pin label is required." };
  }
  if (pinX < 0 || pinX > 100 || pinY < 0 || pinY > 100) {
    return { error: "Pin coordinates must be between 0 and 100." };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "You must be logged in." };
  }

  const { data: map } = await supabase
    .from("world_maps")
    .select("id, world_id")
    .eq("id", mapId)
    .eq("world_id", worldId)
    .eq("user_id", user.id)
    .maybeSingle();

  if (!map) {
    return { error: "Map not found." };
  }

  const { data: created, error } = await supabase
    .from("map_location_pins")
    .insert({
      map_id: mapId,
      location_id: locationId || null,
      label: trimmedLabel,
      pin_x: pinX,
      pin_y: pinY,
    })
    .select("*")
    .single();

  if (error || !created) {
    return { error: formatError(error?.message ?? "Failed to add pin.", error?.code) };
  }

  revalidateWorld(worldId);
  return { success: true, pin: normalizeMapLocationPin(created) };
}

export async function deleteMapLocationPin(
  pinId: string,
  worldId: string
): Promise<{ error?: string; success?: boolean }> {
  if (!pinId) {
    return { error: "Pin ID is required." };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "You must be logged in." };
  }

  const { error } = await supabase
    .from("map_location_pins")
    .delete()
    .eq("id", pinId);

  if (error) {
    return { error: formatError(error.message, error.code) };
  }

  revalidateWorld(worldId);
  return { success: true };
}
