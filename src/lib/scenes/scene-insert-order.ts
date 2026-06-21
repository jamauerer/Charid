import type { SupabaseClient } from "@supabase/supabase-js";

export type SceneInsertPlacement =
  | { mode: "start" }
  | { mode: "end" }
  | { mode: "after"; sceneId: string }
  | { mode: "before"; sceneId: string };

export function parseSceneInsertPlacement(formData: FormData): SceneInsertPlacement | null {
  const mode = String(formData.get("insert_placement") ?? "").trim();
  const anchor = String(formData.get("insert_anchor_scene_id") ?? "").trim();

  if (mode === "start") return { mode: "start" };
  if (mode === "end") return { mode: "end" };
  if (mode === "after" && anchor) return { mode: "after", sceneId: anchor };
  if (mode === "before" && anchor) return { mode: "before", sceneId: anchor };
  return null;
}

/** Allocate sort_order for a new scene and shift siblings when inserting mid-sequence. */
export async function resolveInsertSortOrder(
  supabase: SupabaseClient,
  storyId: string,
  placement: SceneInsertPlacement | null | undefined
): Promise<number> {
  const { data, error } = await supabase
    .from("scenes")
    .select("id, sort_order")
    .eq("story_id", storyId)
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: true });

  if (error) {
    throw new Error(error.message);
  }

  const list = data ?? [];

  if (list.length === 0) {
    return 0;
  }

  if (!placement || placement.mode === "end") {
    const max = Math.max(...list.map((row) => row.sort_order as number));
    return max + 1;
  }

  let insertIndex: number;
  if (placement.mode === "start") {
    insertIndex = 0;
  } else if (placement.mode === "after") {
    const idx = list.findIndex((row) => row.id === placement.sceneId);
    insertIndex = idx === -1 ? list.length : idx + 1;
  } else {
    const idx = list.findIndex((row) => row.id === placement.sceneId);
    insertIndex = idx === -1 ? list.length : idx;
  }

  const updates = list
    .map((row, index) => {
      const newOrder = index >= insertIndex ? index + 1 : index;
      if ((row.sort_order as number) === newOrder) {
        return null;
      }
      return supabase
        .from("scenes")
        .update({ sort_order: newOrder })
        .eq("id", row.id as string);
    })
    .filter(Boolean);

  if (updates.length > 0) {
    const results = await Promise.all(updates);
    const failed = results.find((result) => result?.error);
    if (failed?.error) {
      throw new Error(failed.error.message);
    }
  }

  return insertIndex;
}

/** Reindex all scenes in a story to contiguous sort_order values. */
export async function applySceneSortOrder(
  supabase: SupabaseClient,
  storyId: string,
  orderedSceneIds: string[]
): Promise<string | null> {
  if (orderedSceneIds.length === 0) {
    return null;
  }

  const updates = orderedSceneIds.map((sceneId, index) =>
    supabase
      .from("scenes")
      .update({ sort_order: index, updated_at: new Date().toISOString() })
      .eq("id", sceneId)
      .eq("story_id", storyId)
  );

  const results = await Promise.all(updates);
  const failed = results.find((result) => result.error);
  return failed?.error?.message ?? null;
}
