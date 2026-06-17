export const STORY_STATUSES = [
  "Idea",
  "Planning",
  "In Progress",
  "Complete",
] as const;

export type StoryStatus = (typeof STORY_STATUSES)[number];

export const STORY_PROJECT_TYPES = [
  "novel",
  "graphic_novel",
  "film_animation",
  "childrens_book",
  "other",
] as const;

export type StoryProjectType = (typeof STORY_PROJECT_TYPES)[number];

export const STORY_PROJECT_TYPE_LABELS: Record<StoryProjectType, string> = {
  novel: "Novel",
  graphic_novel: "Graphic Novel",
  film_animation: "Film / Animation",
  childrens_book: "Children's Book",
  other: "Other",
};

export type Story = {
  id: string;
  world_id: string;
  user_id: string;
  title: string;
  slug: string;
  summary: string | null;
  status: StoryStatus;
  project_type: StoryProjectType;
  featured_image_id: string | null;
  created_at: string;
};

export type StoryRow = Story & {
  status?: string;
  project_type?: string;
  featured_image_id?: string | null;
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

  const projectType = STORY_PROJECT_TYPES.includes(
    row.project_type as StoryProjectType
  )
    ? (row.project_type as StoryProjectType)
    : "novel";

  return {
    id: row.id,
    world_id: row.world_id,
    user_id: row.user_id,
    title: row.title,
    slug: row.slug,
    summary: row.summary ?? null,
    status,
    project_type: projectType,
    featured_image_id: row.featured_image_id ?? null,
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

export function parseStoryProjectType(
  value: FormDataEntryValue | null
): StoryProjectType {
  const raw = String(value ?? "").trim();
  if (STORY_PROJECT_TYPES.includes(raw as StoryProjectType)) {
    return raw as StoryProjectType;
  }
  return "novel";
}
