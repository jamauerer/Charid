export const STORY_WORLD_ROLES = [
  "primary",
  "secondary",
  "visited",
  "parallel",
] as const;

export type StoryWorldRole = (typeof STORY_WORLD_ROLES)[number];

export type StoryWorldLink = {
  story_id: string;
  world_id: string;
  role: StoryWorldRole;
  sort_order: number;
  created_at: string;
};

export type StoryWorldRow = {
  story_id: string;
  world_id: string;
  role?: string;
  sort_order?: number;
  created_at: string;
};

export function normalizeStoryWorldLink(row: StoryWorldRow): StoryWorldLink {
  const role = STORY_WORLD_ROLES.includes(row.role as StoryWorldRole)
    ? (row.role as StoryWorldRole)
    : "primary";

  return {
    story_id: row.story_id,
    world_id: row.world_id,
    role,
    sort_order: row.sort_order ?? 0,
    created_at: row.created_at,
  };
}
