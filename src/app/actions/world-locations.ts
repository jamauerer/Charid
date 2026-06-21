"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { isLocationType, type LocationType } from "@/lib/location-types";
import {
  normalizeWorldLocation,
  type WorldLocation,
  type WorldLocationWithCover,
} from "@/types/world-location";

import { revalidateStoryWorkspacePagesForWorld } from "@/app/actions/stories";
import {
  createSignedUrlCache,
  lookupSignedUrl,
  signStorageUrls,
} from "@/lib/storage/signed-url";

function formatError(message: string, code?: string): string {
  if (
    code === "PGRST205" ||
    message.includes("schema cache") ||
    message.includes("Could not find")
  ) {
    return (
      "The world_locations table is not exposed to the Supabase Data API yet. " +
      "Run supabase/migrations/20250701000000_phase_a_worldbuilding_foundations.sql and " +
      "supabase/fix-worldbuilding-foundations-api.sql in the Supabase SQL Editor."
    );
  }
  return message;
}

function revalidateWorld(worldId: string) {
  revalidatePath(`/dashboard/worlds/${worldId}`);
  revalidatePath("/dashboard/worlds");
  void revalidateStoryWorkspacePagesForWorld(worldId);
}

export async function getWorldLocations(
  worldId: string
): Promise<{ locations: WorldLocationWithCover[]; error?: string }> {
  if (!worldId) {
    return { locations: [], error: "World ID is required." };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { locations: [], error: "You must be logged in." };
  }

  const { data, error } = await supabase
    .from("world_locations")
    .select("*")
    .eq("world_id", worldId)
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: true });

  if (error) {
    return { locations: [], error: formatError(error.message, error.code) };
  }

  const locations = (data ?? []).map(normalizeWorldLocation);
  const coverIds = locations
    .map((loc) => loc.cover_image_id)
    .filter((id): id is string => Boolean(id));

  const imagePaths = new Map<string, string>();
  if (coverIds.length > 0) {
    const { data: images } = await supabase
      .from("world_images")
      .select("id, image_path")
      .in("id", coverIds);
    for (const img of images ?? []) {
      imagePaths.set(img.id as string, img.image_path as string);
    }
  }

  const cache = createSignedUrlCache();
  await signStorageUrls(
    supabase,
    locations.map((location) =>
      location.cover_image_id
        ? (imagePaths.get(location.cover_image_id) ?? null)
        : null
    ),
    { cache }
  );

  const locationsWithCover: WorldLocationWithCover[] = locations.map(
    (location) => ({
      location,
      coverUrl: location.cover_image_id
        ? lookupSignedUrl(cache, imagePaths.get(location.cover_image_id) ?? null)
        : null,
    })
  );

  return { locations: locationsWithCover };
}

export async function createWorldLocation(input: {
  worldId: string;
  name: string;
  locationType: LocationType;
  description?: string | null;
}): Promise<{ error?: string; success?: boolean; location?: WorldLocation }> {
  const { worldId, name, locationType, description } = input;
  const trimmedName = name.trim();

  if (!worldId || !trimmedName) {
    return { error: "Location name is required." };
  }
  if (!isLocationType(locationType)) {
    return { error: "Invalid location type." };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "You must be logged in." };
  }

  const { data: world } = await supabase
    .from("worlds")
    .select("id")
    .eq("id", worldId)
    .eq("user_id", user.id)
    .maybeSingle();

  if (!world) {
    return { error: "World not found." };
  }

  const { count } = await supabase
    .from("world_locations")
    .select("*", { count: "exact", head: true })
    .eq("world_id", worldId);

  const { data: created, error } = await supabase
    .from("world_locations")
    .insert({
      world_id: worldId,
      user_id: user.id,
      name: trimmedName,
      location_type: locationType,
      description: description?.trim() || null,
      sort_order: count ?? 0,
    })
    .select("*")
    .single();

  if (error || !created) {
    return { error: formatError(error?.message ?? "Failed to create location.", error?.code) };
  }

  revalidateWorld(worldId);
  return { success: true, location: normalizeWorldLocation(created) };
}

export async function deleteWorldLocation(
  locationId: string,
  worldId: string
): Promise<{ error?: string; success?: boolean }> {
  if (!locationId || !worldId) {
    return { error: "Location ID is required." };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "You must be logged in." };
  }

  const { error } = await supabase
    .from("world_locations")
    .delete()
    .eq("id", locationId)
    .eq("world_id", worldId)
    .eq("user_id", user.id);

  if (error) {
    return { error: formatError(error.message, error.code) };
  }

  revalidateWorld(worldId);
  return { success: true };
}
