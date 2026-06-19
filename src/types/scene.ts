export const SCENE_CHARACTER_ROLES = ["present"] as const;
export type SceneCharacterRole = (typeof SCENE_CHARACTER_ROLES)[number];

export type Scene = {
  id: string;
  story_id: string;
  project_id: string | null;
  chapter_id: string | null;
  world_id: string | null;
  user_id: string;
  title: string;
  slug: string;
  summary: string;
  location_label: string | null;
  /** Linked world_locations.id (product spec: location_id) */
  world_location_id: string | null;
  sort_order: number;
  created_at: string;
  updated_at: string;
};

export type SceneRow = Scene & {
  project_id?: string | null;
  chapter_id?: string | null;
  world_id?: string | null;
  location_label?: string | null;
  world_location_id?: string | null;
  sort_order?: number;
  updated_at?: string;
};

export type SceneCharacterLink = {
  scene_id: string;
  character_id: string;
  role: SceneCharacterRole | string;
  sort_order: number;
};

export type SceneWithCast = Scene & {
  characters: {
    id: string;
    name: string;
    role: string;
    sort_order: number;
  }[];
  /** Resolved for display: linked location name or free-text label */
  location_display: string | null;
};

export function normalizeScene(row: SceneRow): Scene {
  return {
    id: row.id,
    story_id: row.story_id,
    project_id: row.project_id ?? null,
    chapter_id: row.chapter_id ?? null,
    world_id: row.world_id ?? null,
    user_id: row.user_id,
    title: row.title,
    slug: row.slug,
    summary: row.summary ?? "",
    location_label: row.location_label ?? null,
    world_location_id: row.world_location_id ?? null,
    sort_order: row.sort_order ?? 0,
    created_at: row.created_at,
    updated_at: row.updated_at ?? row.created_at,
  };
}

export function slugifySceneTitle(value: string): string {
  const slug = value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9_-]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 50);

  return slug.length >= 2 ? slug : "scene";
}

export function resolveSceneLocationDisplay(
  scene: Scene,
  locationNames: Map<string, string>
): string | null {
  if (scene.world_location_id) {
    const linked = locationNames.get(scene.world_location_id);
    if (linked) return linked;
  }
  return scene.location_label?.trim() || null;
}
