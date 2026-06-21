"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import type { Story, StoryRow } from "@/types/story";
import { normalizeStory } from "@/types/story";
import {
  normalizeScene,
  resolveSceneLocationDisplay,
  slugifySceneTitle,
  type Scene,
  type SceneRow,
  type SceneWithCast,
} from "@/types/scene";
import { scanSavedText } from "@/lib/moderation/scan-text";
import {
  commitSceneRecord,
  syncSceneCharacters,
} from "@/lib/scenes/commit-scene";

export type SceneActionState = {
  error?: string;
  success?: boolean;
  scene?: Scene;
};

function formatSceneError(message: string, code?: string): string {
  if (
    code === "PGRST205" ||
    message.includes("schema cache") ||
    message.includes("Could not find")
  ) {
    return (
      "The scenes table is not exposed to the Supabase Data API yet. " +
      "Run supabase/migrations/20250704000000_scene_s1.sql, " +
      "20250705000000_scene_s1_align.sql, and supabase/fix-scenes-api.sql " +
      "in the Supabase SQL Editor."
    );
  }
  return message;
}

async function assertStoryOwner(
  supabase: Awaited<ReturnType<typeof createClient>>,
  storyId: string,
  userId: string
): Promise<{ error: string | null; story: Story | null }> {
  const { data, error } = await supabase
    .from("stories")
    .select("*")
    .eq("id", storyId)
    .eq("user_id", userId)
    .maybeSingle();

  if (error) {
    return { error: error.message, story: null };
  }
  if (!data) {
    return { error: "Story not found.", story: null };
  }
  return { error: null, story: normalizeStory(data as StoryRow) };
}

async function isSceneSlugTaken(
  supabase: Awaited<ReturnType<typeof createClient>>,
  storyId: string,
  slug: string,
  excludeSceneId?: string
): Promise<boolean> {
  let query = supabase
    .from("scenes")
    .select("id")
    .eq("story_id", storyId)
    .eq("slug", slug);

  if (excludeSceneId) {
    query = query.neq("id", excludeSceneId);
  }

  const { data, error } = await query.maybeSingle();
  if (error) throw new Error(error.message);
  return data !== null;
}

async function resolveAvailableSceneSlug(
  supabase: Awaited<ReturnType<typeof createClient>>,
  storyId: string,
  title: string,
  excludeSceneId?: string
): Promise<string> {
  const base = slugifySceneTitle(title);

  if (!(await isSceneSlugTaken(supabase, storyId, base, excludeSceneId))) {
    return base;
  }

  for (let n = 2; n <= 9999; n++) {
    const suffix = String(n);
    const candidate = `${base.slice(0, 50 - suffix.length)}${suffix}`;
    if (!(await isSceneSlugTaken(supabase, storyId, candidate, excludeSceneId))) {
      return candidate;
    }
  }

  throw new Error("Unable to allocate a unique scene slug.");
}

function parseCharacterIds(formData: FormData): string[] {
  const fromGetAll = formData.getAll("character_ids").map(String).filter(Boolean);
  if (fromGetAll.length > 0) {
    return [...new Set(fromGetAll)];
  }
  const raw = String(formData.get("character_ids") ?? "").trim();
  if (!raw) return [];
  return [...new Set(raw.split(",").map((id) => id.trim()).filter(Boolean))];
}

async function attachCastToScenes(
  supabase: Awaited<ReturnType<typeof createClient>>,
  scenes: Scene[]
): Promise<SceneWithCast[]> {
  if (scenes.length === 0) return [];

  const sceneIds = scenes.map((s) => s.id);
  const { data: links } = await supabase
    .from("scene_characters")
    .select("scene_id, character_id, role, sort_order")
    .in("scene_id", sceneIds)
    .order("sort_order", { ascending: true });

  const characterIds = [
    ...new Set((links ?? []).map((l) => l.character_id as string)),
  ];

  const { data: characters } = await supabase
    .from("characters")
    .select("id, name")
    .in(
      "id",
      characterIds.length > 0
        ? characterIds
        : ["00000000-0000-0000-0000-000000000000"]
    );

  const nameMap = new Map(
    (characters ?? []).map((c) => [c.id as string, c.name as string])
  );

  const castByScene = new Map<
    string,
    { id: string; name: string; role: string; sort_order: number }[]
  >();

  for (const link of links ?? []) {
    const sceneId = link.scene_id as string;
    const characterId = link.character_id as string;
    const name = nameMap.get(characterId);
    if (!name) continue;
    if (!castByScene.has(sceneId)) {
      castByScene.set(sceneId, []);
    }
    castByScene.get(sceneId)!.push({
      id: characterId,
      name,
      role: (link.role as string) ?? "present",
      sort_order: link.sort_order as number,
    });
  }

  const locationIds = [
    ...new Set(
      scenes
        .map((s) => s.world_location_id)
        .filter((id): id is string => Boolean(id))
    ),
  ];

  const locationNameMap = new Map<string, string>();
  if (locationIds.length > 0) {
    const { data: locations } = await supabase
      .from("world_locations")
      .select("id, name")
      .in("id", locationIds);
    for (const loc of locations ?? []) {
      locationNameMap.set(loc.id as string, loc.name as string);
    }
  }

  return scenes.map((scene) => ({
    ...scene,
    characters: castByScene.get(scene.id) ?? [],
    location_display: resolveSceneLocationDisplay(scene, locationNameMap),
  }));
}

async function revalidateScenePaths(
  worldId: string,
  storyId: string,
  sceneId?: string
): Promise<void> {
  revalidatePath(`/dashboard/worlds/${worldId}/stories/${storyId}`);
  if (sceneId) {
    revalidatePath(
      `/dashboard/worlds/${worldId}/stories/${storyId}/scenes/${sceneId}`
    );
  }
}

export async function getScenesByStoryId(
  storyId: string
): Promise<{ scenes: SceneWithCast[]; error?: string }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { scenes: [], error: "You must be logged in." };
  }

  const storyCheck = await assertStoryOwner(supabase, storyId, user.id);
  if (storyCheck.error) {
    return { scenes: [], error: storyCheck.error };
  }

  const { data, error } = await supabase
    .from("scenes")
    .select("*")
    .eq("story_id", storyId)
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: true });

  if (error) {
    return {
      scenes: [],
      error: formatSceneError(error.message, error.code),
    };
  }

  const scenes = (data ?? []).map((row) => normalizeScene(row as SceneRow));
  const withCast = await attachCastToScenes(supabase, scenes);
  return { scenes: withCast };
}

export async function getSceneById(
  storyId: string,
  sceneId: string
): Promise<{ scene: SceneWithCast | null; error?: string }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { scene: null, error: "You must be logged in." };
  }

  const storyCheck = await assertStoryOwner(supabase, storyId, user.id);
  if (storyCheck.error) {
    return { scene: null, error: storyCheck.error };
  }

  const { data, error } = await supabase
    .from("scenes")
    .select("*")
    .eq("id", sceneId)
    .eq("story_id", storyId)
    .maybeSingle();

  if (error) {
    return {
      scene: null,
      error: formatSceneError(error.message, error.code),
    };
  }
  if (!data) {
    return { scene: null };
  }

  const [withCast] = await attachCastToScenes(supabase, [
    normalizeScene(data as SceneRow),
  ]);
  return { scene: withCast ?? null };
}

function parseWorldLocationId(formData: FormData): string | null {
  const raw = String(formData.get("world_location_id") ?? "").trim();
  return raw || null;
}

export async function createScene(
  _prev: SceneActionState,
  formData: FormData
): Promise<SceneActionState> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "You must be logged in." };
  }

  const storyId = String(formData.get("story_id") ?? "").trim();
  const worldId = String(formData.get("world_id") ?? "").trim();
  const title = String(formData.get("title") ?? "").trim();
  const summary = String(formData.get("summary") ?? "").trim();
  const locationLabel =
    String(formData.get("location_label") ?? "").trim() || null;
  const worldLocationId = parseWorldLocationId(formData);
  const characterIds = parseCharacterIds(formData);

  if (!storyId || !title) {
    return { error: "Scene title is required." };
  }
  if (!summary) {
    return { error: "What happens in this scene?" };
  }

  const storyCheck = await assertStoryOwner(supabase, storyId, user.id);
  if (storyCheck.error || !storyCheck.story) {
    return { error: storyCheck.error ?? "Story not found." };
  }

  const { scene, error: commitError } = await commitSceneRecord(supabase, {
    storyId,
    userId: user.id,
    worldId: worldId || storyCheck.story.world_id,
    title,
    summary,
    characterIds,
    locationLabel,
    worldLocationId,
  });

  if (commitError || !scene) {
    return {
      error: formatSceneError(
        commitError ?? "Failed to create scene."
      ),
    };
  }

  await revalidateScenePaths(
    worldId || storyCheck.story.world_id,
    storyId,
    scene.id
  );

  return { success: true, scene };
}

export async function updateScene(
  _prev: SceneActionState,
  formData: FormData
): Promise<SceneActionState> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "You must be logged in." };
  }

  const sceneId = String(formData.get("scene_id") ?? "").trim();
  const storyId = String(formData.get("story_id") ?? "").trim();
  const worldId = String(formData.get("world_id") ?? "").trim();
  const title = String(formData.get("title") ?? "").trim();
  const summary = String(formData.get("summary") ?? "").trim();
  const locationLabel =
    String(formData.get("location_label") ?? "").trim() || null;
  const worldLocationId = parseWorldLocationId(formData);
  const characterIds = parseCharacterIds(formData);

  if (!sceneId || !storyId || !title) {
    return { error: "Scene title is required." };
  }
  if (!summary) {
    return { error: "What happens in this scene?" };
  }

  const storyCheck = await assertStoryOwner(supabase, storyId, user.id);
  if (storyCheck.error || !storyCheck.story) {
    return { error: storyCheck.error ?? "Story not found." };
  }

  let slug: string;
  try {
    slug = await resolveAvailableSceneSlug(supabase, storyId, title, sceneId);
  } catch (err) {
    return {
      error:
        err instanceof Error ? err.message : "Failed to generate scene slug.",
    };
  }

  const { data: updated, error: updateError } = await supabase
    .from("scenes")
    .update({
      title,
      slug,
      summary,
      location_label: worldLocationId ? null : locationLabel,
      world_location_id: worldLocationId,
      updated_at: new Date().toISOString(),
    })
    .eq("id", sceneId)
    .eq("story_id", storyId)
    .select("*")
    .single();

  if (updateError || !updated) {
    return {
      error: formatSceneError(
        updateError?.message ?? "Failed to save scene.",
        updateError?.code
      ),
    };
  }

  const castError = await syncSceneCharacters(
    supabase,
    sceneId,
    characterIds,
    user.id
  );
  if (castError) {
    return { error: castError };
  }

  void scanSavedText({
    supabase,
    userId: user.id,
    entityType: "scene",
    entityId: sceneId,
    fields: { title, summary, location_label: locationLabel },
  });

  const scene = normalizeScene(updated as SceneRow);
  await revalidateScenePaths(
    worldId || storyCheck.story.world_id,
    storyId,
    scene.id
  );

  return { success: true, scene };
}

export async function deleteScene(
  storyId: string,
  sceneId: string,
  worldId: string
): Promise<{ error?: string }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "You must be logged in." };
  }

  const storyCheck = await assertStoryOwner(supabase, storyId, user.id);
  if (storyCheck.error) {
    return { error: storyCheck.error };
  }

  const { error } = await supabase
    .from("scenes")
    .delete()
    .eq("id", sceneId)
    .eq("story_id", storyId);

  if (error) {
    return { error: formatSceneError(error.message, error.code) };
  }

  await revalidateScenePaths(worldId, storyId);
  return {};
}
