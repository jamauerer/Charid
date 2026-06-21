import { randomUUID } from "crypto";
import type { SupabaseClient } from "@supabase/supabase-js";
import { scanSavedText } from "@/lib/moderation/scan-text";
import {
  normalizeScene,
  slugifySceneTitle,
  type Scene,
  type SceneRow,
} from "@/types/scene";

export type CommitSceneInput = {
  storyId: string;
  userId: string;
  worldId: string;
  title: string;
  summary: string;
  characterIds: string[];
  locationLabel: string | null;
  worldLocationId: string | null;
};

async function isSceneSlugTaken(
  supabase: SupabaseClient,
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
  supabase: SupabaseClient,
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

async function nextSceneSortOrder(
  supabase: SupabaseClient,
  storyId: string
): Promise<number> {
  const { data } = await supabase
    .from("scenes")
    .select("sort_order")
    .eq("story_id", storyId)
    .order("sort_order", { ascending: false })
    .limit(1)
    .maybeSingle();

  return (data?.sort_order ?? 0) + 1;
}

export async function syncSceneCharacters(
  supabase: SupabaseClient,
  sceneId: string,
  characterIds: string[],
  userId: string
): Promise<string | null> {
  if (characterIds.length === 0) {
    const { error } = await supabase
      .from("scene_characters")
      .delete()
      .eq("scene_id", sceneId);
    return error ? error.message : null;
  }

  const { data: owned } = await supabase
    .from("characters")
    .select("id")
    .eq("user_id", userId)
    .in("id", characterIds);

  const ownedIds = new Set((owned ?? []).map((c) => c.id as string));
  const validIds = characterIds.filter((id) => ownedIds.has(id));

  if (validIds.length === 0) {
    return "Selected characters were not found.";
  }

  await supabase.from("scene_characters").delete().eq("scene_id", sceneId);

  const { error } = await supabase.from("scene_characters").insert(
    validIds.map((characterId, index) => ({
      scene_id: sceneId,
      character_id: characterId,
      role: "present",
      sort_order: index,
    }))
  );

  return error ? error.message : null;
}

/** Insert a scene into canon — used by manual create and Approve on suggestions. */
export async function commitSceneRecord(
  supabase: SupabaseClient,
  input: CommitSceneInput
): Promise<{ scene: Scene | null; error?: string }> {
  const {
    storyId,
    userId,
    worldId,
    title,
    summary,
    characterIds,
    locationLabel,
    worldLocationId,
  } = input;

  if (!title.trim()) {
    return { scene: null, error: "Scene title is required." };
  }
  if (!summary.trim()) {
    return { scene: null, error: "What happens in this scene?" };
  }

  let slug: string;
  try {
    slug = await resolveAvailableSceneSlug(supabase, storyId, title);
  } catch (err) {
    return {
      scene: null,
      error:
        err instanceof Error ? err.message : "Failed to generate scene slug.",
    };
  }

  const sortOrder = await nextSceneSortOrder(supabase, storyId);

  const sceneId = randomUUID();

  const { data: storyRow } = await supabase
    .from("stories")
    .select("project_id, world_id")
    .eq("id", storyId)
    .maybeSingle();

  const projectId = (storyRow?.project_id as string | null) ?? null;
  const resolvedWorldId =
    worldId || (storyRow?.world_id as string | null) || null;

  const { data: created, error: insertError } = await supabase
    .from("scenes")
    .insert({
      id: sceneId,
      story_id: storyId,
      project_id: projectId,
      world_id: resolvedWorldId,
      user_id: userId,
      title: title.trim(),
      slug,
      summary: summary.trim(),
      location_label: worldLocationId ? null : locationLabel,
      world_location_id: worldLocationId,
      sort_order: sortOrder,
    })
    .select("*")
    .single();

  if (insertError || !created) {
    return {
      scene: null,
      error: insertError?.message ?? "Failed to create scene.",
    };
  }

  const castError = await syncSceneCharacters(
    supabase,
    sceneId,
    characterIds,
    userId
  );
  if (castError) {
    await supabase.from("scenes").delete().eq("id", sceneId);
    return { scene: null, error: castError };
  }

  void scanSavedText({
    supabase,
    userId,
    entityType: "scene",
    entityId: sceneId,
    fields: { title, summary, location_label: locationLabel },
  });

  return { scene: normalizeScene(created as SceneRow) };
}
