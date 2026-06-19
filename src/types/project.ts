import type { StoryProjectType } from "@/types/story";

export const PROJECT_WORK_INTENTS = [
  "comic",
  "novel",
  "picture_book",
  "screenplay",
  "worldbuilding",
  "exploring",
] as const;

export type ProjectWorkIntent = (typeof PROJECT_WORK_INTENTS)[number];

export const PROJECT_WORK_INTENT_LABELS: Record<ProjectWorkIntent, string> = {
  comic: "Comic",
  novel: "Novel",
  picture_book: "Picture Book",
  screenplay: "Film / Screenplay",
  worldbuilding: "Worldbuilding Project",
  exploring: "Just Exploring",
};

export const PROJECT_START_PATHS = [
  "story",
  "character",
  "world",
  "artwork",
  "describe_idea",
] as const;

export type ProjectStartPath = (typeof PROJECT_START_PATHS)[number];

export const PROJECT_START_PATH_LABELS: Record<ProjectStartPath, string> = {
  story: "Story",
  character: "Character",
  world: "World",
  artwork: "Artwork",
  describe_idea: "Describe My Idea",
};

/** Maps project work intent to default story output format when starting with a story. */
export const WORK_INTENT_DEFAULT_STORY_TYPE: Partial<
  Record<ProjectWorkIntent, StoryProjectType>
> = {
  comic: "graphic_novel",
  novel: "novel",
  picture_book: "childrens_book",
  screenplay: "film_animation",
  exploring: "other",
};

export const WORK_INTENT_SUGGESTED_TITLES: Partial<
  Record<ProjectWorkIntent, string>
> = {
  comic: "My Comic",
  novel: "My Novel",
  picture_book: "My Picture Book",
  screenplay: "My Screenplay",
  worldbuilding: "My World",
  exploring: "Untitled Project",
};

export type Project = {
  id: string;
  user_id: string;
  title: string;
  slug: string;
  description: string | null;
  cover_image_path: string | null;
  work_intent: ProjectWorkIntent | null;
  is_default: boolean;
  is_public: boolean;
  created_at: string;
  updated_at: string;
};

export type ProjectRow = Project & {
  description?: string | null;
  cover_image_path?: string | null;
  work_intent?: string | null;
  is_default?: boolean;
  is_public?: boolean;
};

export type ProjectWithCounts = Project & {
  story_count: number;
  character_count: number;
  world_count: number;
  relationship_count: number;
};

export function parseProjectWorkIntent(
  value: string | null | undefined
): ProjectWorkIntent | null {
  if (!value) return null;
  return PROJECT_WORK_INTENTS.includes(value as ProjectWorkIntent)
    ? (value as ProjectWorkIntent)
    : null;
}

export function normalizeProject(row: ProjectRow): Project {
  return {
    id: row.id,
    user_id: row.user_id,
    title: row.title,
    slug: row.slug,
    description: row.description ?? null,
    cover_image_path: row.cover_image_path ?? null,
    work_intent: parseProjectWorkIntent(row.work_intent),
    is_default: row.is_default ?? false,
    is_public: row.is_public ?? false,
    created_at: row.created_at,
    updated_at: row.updated_at,
  };
}

export function slugifyProjectTitle(value: string): string {
  const slug = value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9_-]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 50);

  return slug.length >= 2 ? slug : "project";
}

export const DEFAULT_PROJECT_TITLE = "My Studio";
export const DEFAULT_PROJECT_SLUG = "my-studio";

/** Legacy backfill title from Project Stage 1 — triggers rename prompt. */
export const LEGACY_DEFAULT_PROJECT_TITLE = "My Universe";
export const LEGACY_DEFAULT_PROJECT_SLUG = "my-universe";

export function isLegacyDefaultProject(project: Pick<Project, "title" | "slug">): boolean {
  return (
    project.title === LEGACY_DEFAULT_PROJECT_TITLE ||
    project.slug === LEGACY_DEFAULT_PROJECT_SLUG
  );
}
