export const STORY_STATUSES = [
  "Idea",
  "Planning",
  "In Progress",
  "Complete",
] as const;

export type StoryStatus = (typeof STORY_STATUSES)[number];

export type Story = {
  id: string;
  world_id: string;
  user_id: string;
  title: string;
  slug: string;
  summary: string | null;
  status: StoryStatus;
  created_at: string;
};

export type StoryRow = Story & {
  status?: string;
};

export type StoryWithCounts = Story & {
  character_count: number;
};

export type StoryCharacterLink = {
  story_id: string;
  character_id: string;
};

export function normalizeStory(row: StoryRow): Story {
  const status = STORY_STATUSES.includes(row.status as StoryStatus)
    ? (row.status as StoryStatus)
    : "Idea";

  return {
    id: row.id,
    world_id: row.world_id,
    user_id: row.user_id,
    title: row.title,
    slug: row.slug,
    summary: row.summary ?? null,
    status,
    created_at: row.created_at,
  };
}

export function slugifyStoryTitle(value: string): string {
  const slug = value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9_-]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 50);

  return slug.length >= 2 ? slug : "story";
}

export function parseStoryStatus(value: FormDataEntryValue | null): StoryStatus {
  const raw = String(value ?? "").trim();
  if (STORY_STATUSES.includes(raw as StoryStatus)) {
    return raw as StoryStatus;
  }
  return "Idea";
}
