"use server";

import { randomUUID } from "crypto";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getCharacterPhotoUrl } from "@/app/actions/characters";
import { getStoryCoverUrls } from "@/app/actions/story-images";
import { getWorldCoverUrl } from "@/app/actions/worlds";
import { relationshipDisplayLabel } from "@/lib/relationship-types";
import type { Character, CharacterRow } from "@/types/character";
import { normalizeCharacter, resolvePortraitFocalY } from "@/types/character";
import {
  normalizeCharacterRelationship,
  type CharacterRelationship,
} from "@/types/character-relationship";
import {
  DEFAULT_PROJECT_SLUG,
  DEFAULT_PROJECT_TITLE,
  normalizeProject,
  parseProjectWorkIntent,
  slugifyProjectTitle,
  type Project,
  type ProjectRow,
  type ProjectWithCounts,
} from "@/types/project";
import type { Story, StoryRow, StoryWithCounts } from "@/types/story";
import { normalizeStory } from "@/types/story";
import type { World, WorldRow, WorldWithCounts } from "@/types/world";
import { normalizeWorld } from "@/types/world";
import { scanSavedText } from "@/lib/moderation/scan-text";
import { ensureProjectDefaultSetting } from "@/lib/project-setting";
import type { ProjectStoryProgress } from "@/lib/project-finish-path";
import { getScenesByStoryId } from "@/app/actions/scenes";
import type { SceneWithCast } from "@/types/scene";
import { normalizeWorldLocation, type WorldLocationRow } from "@/types/world-location";

const BUCKET = "character-photos";
const MAX_FILE_SIZE = 5 * 1024 * 1024;
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];

export type ProjectActionState = {
  error?: string;
  success?: boolean;
  project?: Project;
};

export type RenameProjectState = {
  error?: string;
  success?: boolean;
};

export type ProjectsResult = {
  projects: ProjectWithCounts[];
  error?: string;
};

export type ProjectStoryEntry = {
  story: StoryWithCounts;
  world: { id: string; name: string; description: string | null };
  coverUrl: string | null;
};

export type ProjectCharacterEntry = {
  character: Character;
  photoUrl: string | null;
};

export type ProjectWorldEntry = {
  world: WorldWithCounts;
  coverUrl: string | null;
};

export type ProjectRelationshipEntry = {
  relationship: CharacterRelationship;
  fromCharacter: { id: string; name: string; photo_path: string | null; portrait_focal_y: number };
  toCharacter: { id: string; name: string; photo_path: string | null; portrait_focal_y: number };
  label: string;
};

export type ProjectWorkspaceBundle = {
  project: ProjectWithCounts;
  coverUrl: string | null;
};

export type ProjectProgressCounts = {
  characterCount: number;
  storyCount: number;
  sceneCount: number;
  chapterCount: number;
  locationCount: number;
  styleReferenceCount: number;
  hasCover: boolean;
};

export type ProjectSceneRollupEntry = {
  sceneId: string;
  sceneTitle: string;
  storyId: string;
  storyTitle: string;
  worldId: string;
  updatedAt: string;
};

export type ProjectLocationRollupEntry = {
  locationId: string;
  locationName: string;
  locationType: string;
  worldId: string;
  worldName: string;
};

export type ProjectAssetRollupEntry = {
  source: "character" | "world" | "story";
  sourceId: string;
  sourceName: string;
  imageCount: number;
  editHref: string;
};

export type ProjectTimelineStory = {
  storyId: string;
  storyTitle: string;
  worldId: string;
  scenes: SceneWithCast[];
};

function formatProjectError(message: string, code?: string): string {
  if (
    code === "PGRST205" ||
    message.includes("schema cache") ||
    message.includes("Could not find")
  ) {
    return (
      "The projects table is not exposed to the Supabase Data API yet. " +
      "Run supabase/migrations/20250702000000_project_stage_1.sql and " +
      "supabase/fix-projects-api.sql in the Supabase SQL Editor."
    );
  }
  if (code === "23505" || message.includes("projects_user_id_slug_key")) {
    return "That project slug is already in use on your account.";
  }
  return message;
}

function validateCover(file: File): string | null {
  if (!ALLOWED_TYPES.includes(file.type)) {
    return "Cover image must be a JPEG, PNG, or WebP file.";
  }
  if (file.size > MAX_FILE_SIZE) {
    return "Cover image must be 5 MB or smaller.";
  }
  return null;
}

function slugWithSuffix(base: string, suffix: number): string {
  const suffixStr = String(suffix);
  const maxBaseLen = 50 - suffixStr.length;
  return `${base.slice(0, maxBaseLen)}${suffixStr}`;
}

async function isProjectSlugTaken(
  supabase: Awaited<ReturnType<typeof createClient>>,
  userId: string,
  slug: string,
  excludeProjectId?: string
): Promise<boolean> {
  let query = supabase
    .from("projects")
    .select("id")
    .eq("user_id", userId)
    .eq("slug", slug);

  if (excludeProjectId) {
    query = query.neq("id", excludeProjectId);
  }

  const { data, error } = await query.maybeSingle();
  if (error) throw new Error(error.message);
  return data !== null;
}

async function resolveAvailableProjectSlug(
  supabase: Awaited<ReturnType<typeof createClient>>,
  userId: string,
  title: string,
  excludeProjectId?: string
): Promise<string> {
  const base = slugifyProjectTitle(title);

  if (!(await isProjectSlugTaken(supabase, userId, base, excludeProjectId))) {
    return base;
  }

  for (let n = 2; n <= 9999; n++) {
    const candidate = slugWithSuffix(base, n);
    if (
      !(await isProjectSlugTaken(supabase, userId, candidate, excludeProjectId))
    ) {
      return candidate;
    }
  }

  throw new Error("Unable to allocate a unique project slug.");
}

async function countForProject(
  supabase: Awaited<ReturnType<typeof createClient>>,
  table: "stories" | "characters" | "worlds" | "character_relationships",
  projectId: string
): Promise<number> {
  const { count, error } = await supabase
    .from(table)
    .select("*", { count: "exact", head: true })
    .eq("project_id", projectId);

  if (error) return 0;
  return count ?? 0;
}

async function attachProjectCounts(
  supabase: Awaited<ReturnType<typeof createClient>>,
  project: Project
): Promise<ProjectWithCounts> {
  const [story_count, character_count, world_count, relationship_count] =
    await Promise.all([
      countForProject(supabase, "stories", project.id),
      countForProject(supabase, "characters", project.id),
      countForProject(supabase, "worlds", project.id),
      countForProject(supabase, "character_relationships", project.id),
    ]);

  return {
    ...project,
    story_count,
    character_count,
    world_count,
    relationship_count,
  };
}

function revalidateProjectPaths(projectId: string) {
  revalidatePath("/dashboard/projects");
  revalidatePath(`/dashboard/projects/${projectId}`);
  revalidatePath("/dashboard");
}

export async function getProjectCoverUrl(
  coverPath: string | null
): Promise<string | null> {
  if (!coverPath) return null;

  const supabase = await createClient();
  const { data } = supabase.storage.from(BUCKET).getPublicUrl(coverPath);
  return data.publicUrl ?? null;
}

/** Ensures the user has a default personal project (creates if missing). */
export async function getOrCreateDefaultProject(
  supabase: Awaited<ReturnType<typeof createClient>>,
  userId: string
): Promise<{ project: Project | null; error?: string }> {
  const { data: existing, error: fetchError } = await supabase
    .from("projects")
    .select("*")
    .eq("user_id", userId)
    .eq("is_default", true)
    .maybeSingle();

  if (fetchError) {
    return {
      project: null,
      error: formatProjectError(fetchError.message, fetchError.code),
    };
  }

  if (existing) {
    return { project: normalizeProject(existing as ProjectRow) };
  }

  const { data: created, error: insertError } = await supabase
    .from("projects")
    .insert({
      user_id: userId,
      title: DEFAULT_PROJECT_TITLE,
      slug: DEFAULT_PROJECT_SLUG,
      is_default: true,
    })
    .select("*")
    .single();

  if (insertError || !created) {
    return {
      project: null,
      error: formatProjectError(
        insertError?.message ?? "Failed to create default project.",
        insertError?.code
      ),
    };
  }

  const project = normalizeProject(created as ProjectRow);
  const settingResult = await ensureProjectDefaultSetting(
    supabase,
    userId,
    project
  );
  if (settingResult.error) {
    console.error(
      "Failed to ensure default setting for default project:",
      settingResult.error
    );
  }

  return { project };
}

export async function getProjects(): Promise<ProjectsResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { projects: [], error: "You must be logged in." };
  }

  const { data, error } = await supabase
    .from("projects")
    .select("*")
    .eq("user_id", user.id)
    .order("is_default", { ascending: false })
    .order("created_at", { ascending: false });

  if (error) {
    return { projects: [], error: formatProjectError(error.message, error.code) };
  }

  const projects = await Promise.all(
    (data ?? []).map(async (row) =>
      attachProjectCounts(supabase, normalizeProject(row as ProjectRow))
    )
  );

  return { projects };
}

export async function getProjectById(
  projectId: string
): Promise<{ project: ProjectWithCounts | null; error?: string }> {
  if (!projectId) {
    return { project: null, error: "Project ID is required." };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { project: null, error: "You must be logged in." };
  }

  const { data, error } = await supabase
    .from("projects")
    .select("*")
    .eq("id", projectId)
    .eq("user_id", user.id)
    .maybeSingle();

  if (error) {
    return {
      project: null,
      error: formatProjectError(error.message, error.code),
    };
  }
  if (!data) {
    return { project: null };
  }

  const project = await attachProjectCounts(
    supabase,
    normalizeProject(data as ProjectRow)
  );

  if (project.world_count === 0) {
    const settingResult = await ensureProjectDefaultSetting(
      supabase,
      user.id,
      project
    );
    if (settingResult.world) {
      return {
        project: await attachProjectCounts(supabase, project),
      };
    }
    if (settingResult.error) {
      console.error(
        `Failed to ensure default setting for project ${projectId}:`,
        settingResult.error
      );
    }
  }

  return { project };
}

export async function getProjectWorkspaceBundle(
  projectId: string
): Promise<{ bundle: ProjectWorkspaceBundle | null; error?: string }> {
  const { project, error } = await getProjectById(projectId);
  if (error || !project) {
    return { bundle: null, error: error ?? "Project not found." };
  }

  const coverUrl = await getProjectCoverUrl(project.cover_image_path);
  return { bundle: { project, coverUrl } };
}

export async function getProjectStories(
  projectId: string
): Promise<{ entries: ProjectStoryEntry[]; error?: string }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { entries: [], error: "You must be logged in." };
  }

  const { data: stories, error } = await supabase
    .from("stories")
    .select("*")
    .eq("project_id", projectId)
    .eq("user_id", user.id)
    .order("project_sort_order", { ascending: true })
    .order("created_at", { ascending: true });

  if (error) {
    return {
      entries: [],
      error: formatProjectError(error.message, error.code),
    };
  }

  const normalized = (stories ?? []).map((row) => normalizeStory(row as StoryRow));
  const worldIds = [...new Set(normalized.map((s) => s.world_id))];

  const { data: worlds } = await supabase
    .from("worlds")
    .select("id, name, description")
    .in("id", worldIds.length > 0 ? worldIds : ["00000000-0000-0000-0000-000000000000"]);

  const worldMap = new Map(
    (worlds ?? []).map((w) => [
      w.id as string,
      {
        id: w.id as string,
        name: w.name as string,
        description: (w.description as string | null) ?? null,
      },
    ])
  );

  const { data: rosterCounts } = await supabase
    .from("story_characters")
    .select("story_id")
    .in(
      "story_id",
      normalized.length > 0
        ? normalized.map((s) => s.id)
        : ["00000000-0000-0000-0000-000000000000"]
    );

  const countMap = new Map<string, number>();
  for (const row of rosterCounts ?? []) {
    const sid = row.story_id as string;
    countMap.set(sid, (countMap.get(sid) ?? 0) + 1);
  }

  const coverUrls = await getStoryCoverUrls(normalized.map((s) => s.id));

  const entries: ProjectStoryEntry[] = [];
  for (const story of normalized) {
    const world = worldMap.get(story.world_id);
    if (!world) continue;

    entries.push({
      story: { ...story, character_count: countMap.get(story.id) ?? 0 },
      world,
      coverUrl: coverUrls[story.id] ?? null,
    });
  }

  return { entries };
}

export async function reorderProjectStories(
  projectId: string,
  orderedStoryIds: string[]
): Promise<{ error?: string }> {
  const uniqueIds = [...new Set(orderedStoryIds.filter(Boolean))];
  if (uniqueIds.length === 0) {
    return { error: "No stories to reorder." };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "You must be logged in." };
  }

  const { data: project, error: projectError } = await supabase
    .from("projects")
    .select("id")
    .eq("id", projectId)
    .eq("user_id", user.id)
    .maybeSingle();

  if (projectError || !project) {
    return { error: "Project not found." };
  }

  const { data: existing, error: fetchError } = await supabase
    .from("stories")
    .select("id")
    .eq("project_id", projectId)
    .eq("user_id", user.id);

  if (fetchError) {
    return { error: formatProjectError(fetchError.message, fetchError.code) };
  }

  const existingIds = new Set((existing ?? []).map((row) => row.id as string));
  if (
    uniqueIds.length !== existingIds.size ||
    uniqueIds.some((id) => !existingIds.has(id))
  ) {
    return { error: "Story order does not match this project." };
  }

  for (let index = 0; index < uniqueIds.length; index += 1) {
    const { error: updateError } = await supabase
      .from("stories")
      .update({ project_sort_order: index })
      .eq("id", uniqueIds[index])
      .eq("project_id", projectId)
      .eq("user_id", user.id);

    if (updateError) {
      return { error: formatProjectError(updateError.message, updateError.code) };
    }
  }

  revalidatePath(`/dashboard/projects/${projectId}`);
  revalidatePath("/dashboard/projects");
  return {};
}

export async function getProjectCharacters(
  projectId: string
): Promise<{ entries: ProjectCharacterEntry[]; error?: string }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { entries: [], error: "You must be logged in." };
  }

  const { data, error } = await supabase
    .from("characters")
    .select("*")
    .eq("project_id", projectId)
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (error) {
    return {
      entries: [],
      error: formatProjectError(error.message, error.code),
    };
  }

  const characters = (data ?? []).map((row) =>
    normalizeCharacter(row as CharacterRow)
  );

  const entries = await Promise.all(
    characters.map(async (character) => ({
      character,
      photoUrl: await getCharacterPhotoUrl(character.photo_path),
    }))
  );

  return { entries };
}

export async function getProjectWorlds(
  projectId: string
): Promise<{ entries: ProjectWorldEntry[]; error?: string }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { entries: [], error: "You must be logged in." };
  }

  const { data: worlds, error } = await supabase
    .from("worlds")
    .select("*")
    .eq("project_id", projectId)
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (error) {
    return {
      entries: [],
      error: formatProjectError(error.message, error.code),
    };
  }

  const normalized = (worlds ?? []).map((row) => normalizeWorld(row as WorldRow));
  const worldIds = normalized.map((w) => w.id);

  const { data: charCounts } = await supabase
    .from("characters")
    .select("world_id")
    .in(
      "world_id",
      worldIds.length > 0 ? worldIds : ["00000000-0000-0000-0000-000000000000"]
    );

  const countMap = new Map<string, number>();
  for (const row of charCounts ?? []) {
    const wid = row.world_id as string | null;
    if (!wid) continue;
    countMap.set(wid, (countMap.get(wid) ?? 0) + 1);
  }

  const entries = await Promise.all(
    normalized.map(async (world) => ({
      world: {
        ...world,
        character_count: countMap.get(world.id) ?? 0,
      },
      coverUrl: await getWorldCoverUrl(world.cover_image_path),
    }))
  );

  return { entries };
}

export async function getProjectRelationships(
  projectId: string
): Promise<{ entries: ProjectRelationshipEntry[]; error?: string }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { entries: [], error: "You must be logged in." };
  }

  const { data, error } = await supabase
    .from("character_relationships")
    .select("*")
    .eq("project_id", projectId)
    .eq("user_id", user.id)
    .order("created_at", { ascending: true });

  if (error) {
    return {
      entries: [],
      error: formatProjectError(error.message, error.code),
    };
  }

  const relationships = (data ?? []).map(normalizeCharacterRelationship);
  const characterIds = [
    ...new Set(
      relationships.flatMap((r) => [r.from_character_id, r.to_character_id])
    ),
  ];

  const { data: characters } = await supabase
    .from("characters")
    .select("id, name, photo_path, portrait_focal_y")
    .in(
      "id",
      characterIds.length > 0
        ? characterIds
        : ["00000000-0000-0000-0000-000000000000"]
    );

  const characterMap = new Map(
    (characters ?? []).map((c) => [
      c.id as string,
      {
        id: c.id as string,
        name: c.name as string,
        photo_path: (c.photo_path as string | null) ?? null,
        portrait_focal_y: resolvePortraitFocalY(
          c.portrait_focal_y as number | null | undefined
        ),
      },
    ])
  );

  const entries: ProjectRelationshipEntry[] = [];
  for (const relationship of relationships) {
    const fromCharacter = characterMap.get(relationship.from_character_id);
    const toCharacter = characterMap.get(relationship.to_character_id);
    if (!fromCharacter || !toCharacter) continue;

    entries.push({
      relationship,
      fromCharacter,
      toCharacter,
      label: relationshipDisplayLabel(
        relationship.relationship_type,
        relationship.custom_label,
        "outgoing"
      ),
    });
  }

  return { entries };
}

export async function createProject(
  _prev: ProjectActionState,
  formData: FormData
): Promise<ProjectActionState> {
  const title = String(formData.get("title") ?? "").trim();
  const description =
    String(formData.get("description") ?? "").trim() || null;
  const workIntentRaw = String(formData.get("work_intent") ?? "").trim();
  const workIntent = parseProjectWorkIntent(workIntentRaw || null);

  if (!title) {
    return { error: "Project title is required." };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "You must be logged in." };
  }

  let slug: string;
  try {
    slug = await resolveAvailableProjectSlug(supabase, user.id, title);
  } catch (err) {
    return {
      error:
        err instanceof Error ? err.message : "Failed to generate project slug.",
    };
  }

  const projectId = randomUUID();
  const cover = formData.get("cover");
  let coverPath: string | null = null;

  if (cover instanceof File && cover.size > 0) {
    const coverError = validateCover(cover);
    if (coverError) {
      return { error: coverError };
    }

    const extension = cover.type.split("/")[1] ?? "jpg";
    coverPath = `${user.id}/projects/${projectId}/cover.${extension}`;

    const { error: uploadError } = await supabase.storage
      .from(BUCKET)
      .upload(coverPath, cover, {
        contentType: cover.type,
        upsert: false,
      });

    if (uploadError) {
      return { error: `Failed to upload cover image: ${uploadError.message}` };
    }
  }

  const { data: created, error: insertError } = await supabase
    .from("projects")
    .insert({
      id: projectId,
      user_id: user.id,
      title,
      slug,
      description,
      cover_image_path: coverPath,
      work_intent: workIntent,
      is_default: false,
    })
    .select("*")
    .single();

  if (insertError || !created) {
    if (coverPath) {
      await supabase.storage.from(BUCKET).remove([coverPath]);
    }
    return {
      error: formatProjectError(
        insertError?.message ?? "Failed to create project.",
        insertError?.code
      ),
    };
  }

  const project = normalizeProject(created as ProjectRow);

  const settingResult = await ensureProjectDefaultSetting(
    supabase,
    user.id,
    project
  );
  if (settingResult.error) {
    console.error(
      "Failed to ensure default setting for new project:",
      settingResult.error
    );
  }

  revalidateProjectPaths(project.id);
  if (settingResult.world) {
    revalidatePath("/dashboard/worlds");
  }

  void scanSavedText({
    supabase,
    userId: user.id,
    entityType: "project",
    entityId: projectId,
    fields: { title, description },
  });

  return { success: true, project };
}

export async function renameProjectTitle(
  _prev: RenameProjectState,
  formData: FormData
): Promise<RenameProjectState> {
  const projectId = String(formData.get("project_id") ?? "").trim();
  const title = String(formData.get("title") ?? "").trim();

  if (!projectId) {
    return { error: "Project ID is required." };
  }
  if (!title) {
    return { error: "Project title is required." };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "You must be logged in." };
  }

  let slug: string;
  try {
    slug = await resolveAvailableProjectSlug(
      supabase,
      user.id,
      title,
      projectId
    );
  } catch (err) {
    return {
      error:
        err instanceof Error ? err.message : "Failed to generate project slug.",
    };
  }

  const { error: updateError } = await supabase
    .from("projects")
    .update({
      title,
      slug,
      updated_at: new Date().toISOString(),
    })
    .eq("id", projectId)
    .eq("user_id", user.id);

  if (updateError) {
    return {
      error: formatProjectError(updateError.message, updateError.code),
    };
  }

  revalidateProjectPaths(projectId);
  revalidatePath("/dashboard");

  return { success: true };
}

/** Links a story to its primary world in story_worlds (dual-model support). */
export async function ensurePrimaryStoryWorldLink(
  supabase: Awaited<ReturnType<typeof createClient>>,
  storyId: string,
  worldId: string
): Promise<void> {
  const { error } = await supabase.from("story_worlds").upsert(
    {
      story_id: storyId,
      world_id: worldId,
      role: "primary",
      sort_order: 0,
    },
    { onConflict: "story_id,world_id" }
  );

  if (error) {
    console.error("Failed to upsert story_worlds link:", error.message);
  }
}

export async function resolveProjectIdForWorld(
  supabase: Awaited<ReturnType<typeof createClient>>,
  userId: string,
  worldId: string | null,
  formProjectId?: string | null
): Promise<{ projectId: string | null; error?: string }> {
  if (formProjectId) {
    const { data } = await supabase
      .from("projects")
      .select("id")
      .eq("id", formProjectId)
      .eq("user_id", userId)
      .maybeSingle();
    if (data) return { projectId: data.id as string };
  }

  if (worldId) {
    const { data: world } = await supabase
      .from("worlds")
      .select("project_id")
      .eq("id", worldId)
      .eq("user_id", userId)
      .maybeSingle();
    if (world?.project_id) {
      return { projectId: world.project_id as string };
    }
  }

  const defaultResult = await getOrCreateDefaultProject(supabase, userId);
  return {
    projectId: defaultResult.project?.id ?? null,
    error: defaultResult.error,
  };
}

export type StoryProjectContext = {
  id: string;
  title: string;
};

export async function getStoryProjectContext(
  storyId: string,
  worldId?: string
): Promise<{ project: StoryProjectContext | null; error?: string }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { project: null, error: "You must be logged in." };
  }

  const { data: story } = await supabase
    .from("stories")
    .select("project_id, world_id")
    .eq("id", storyId)
    .eq("user_id", user.id)
    .maybeSingle();

  if (!story) {
    return { project: null };
  }

  let projectId = (story.project_id as string | null) ?? null;

  if (!projectId) {
    const resolvedWorldId = worldId ?? (story.world_id as string);
    const resolve = await resolveProjectIdForWorld(
      supabase,
      user.id,
      resolvedWorldId,
      null
    );
    projectId = resolve.projectId;
  }

  if (!projectId) {
    return { project: null };
  }

  const { data: project } = await supabase
    .from("projects")
    .select("id, title")
    .eq("id", projectId)
    .eq("user_id", user.id)
    .maybeSingle();

  if (!project) {
    return { project: null };
  }

  return {
    project: {
      id: project.id as string,
      title: project.title as string,
    },
  };
}

export async function getProjectStoryProgress(
  projectId: string
): Promise<{ stories: ProjectStoryProgress[]; error?: string }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { stories: [], error: "You must be logged in." };
  }

  const { data: storyRows, error } = await supabase
    .from("stories")
    .select("id, title, world_id, project_type, created_at")
    .eq("project_id", projectId)
    .eq("user_id", user.id)
    .order("project_sort_order", { ascending: true })
    .order("created_at", { ascending: true });

  if (error) {
    return { stories: [], error: formatProjectError(error.message, error.code) };
  }

  const stories = storyRows ?? [];
  const storyIds = stories.map((row) => row.id as string);

  const sceneCountMap = new Map<string, number>();
  if (storyIds.length > 0) {
    const { data: sceneRows } = await supabase
      .from("scenes")
      .select("story_id")
      .in("story_id", storyIds);

    for (const row of sceneRows ?? []) {
      const sid = row.story_id as string;
      sceneCountMap.set(sid, (sceneCountMap.get(sid) ?? 0) + 1);
    }
  }

  return {
    stories: stories.map((row) => ({
      id: row.id as string,
      title: row.title as string,
      worldId: row.world_id as string,
      sceneCount: sceneCountMap.get(row.id as string) ?? 0,
      updatedAt: row.created_at as string,
      projectType: (row.project_type as Story["project_type"]) ?? "novel",
    })),
  };
}

export async function getProjectProgressCounts(
  projectId: string
): Promise<{ counts: ProjectProgressCounts | null; error?: string }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { counts: null, error: "You must be logged in." };
  }

  const { data: projectRow, error: projectError } = await supabase
    .from("projects")
    .select("cover_image_path")
    .eq("id", projectId)
    .eq("user_id", user.id)
    .maybeSingle();

  if (projectError || !projectRow) {
    return {
      counts: null,
      error: projectError?.message ?? "Project not found.",
    };
  }

  const { data: storyRows } = await supabase
    .from("stories")
    .select("id")
    .eq("project_id", projectId)
    .eq("user_id", user.id);

  const storyIds = (storyRows ?? []).map((row) => row.id as string);

  const { data: worldRows } = await supabase
    .from("worlds")
    .select("id")
    .eq("project_id", projectId)
    .eq("user_id", user.id);

  const worldIds = (worldRows ?? []).map((row) => row.id as string);
  const primaryWorldId = worldIds[0] ?? null;

  const [
    characterCount,
    sceneCount,
    chapterCount,
    locationCount,
    styleReferenceCount,
  ] = await Promise.all([
    countForProject(supabase, "characters", projectId),
    storyIds.length > 0
      ? supabase
          .from("scenes")
          .select("*", { count: "exact", head: true })
          .in("story_id", storyIds)
          .then(({ count }) => count ?? 0)
      : Promise.resolve(0),
    storyIds.length > 0
      ? supabase
          .from("chapters")
          .select("*", { count: "exact", head: true })
          .in("story_id", storyIds)
          .then(({ count }) => count ?? 0)
      : Promise.resolve(0),
    worldIds.length > 0
      ? supabase
          .from("world_locations")
          .select("*", { count: "exact", head: true })
          .in("world_id", worldIds)
          .then(({ count }) => count ?? 0)
      : Promise.resolve(0),
    primaryWorldId
      ? supabase
          .from("world_moodboards")
          .select("id")
          .eq("world_id", primaryWorldId)
          .maybeSingle()
          .then(async ({ data: board }) => {
            if (!board?.id) return 0;
            const { count } = await supabase
              .from("world_moodboard_items")
              .select("*", { count: "exact", head: true })
              .eq("moodboard_id", board.id as string);
            return count ?? 0;
          })
      : Promise.resolve(0),
  ]);

  return {
    counts: {
      characterCount,
      storyCount: storyIds.length,
      sceneCount,
      chapterCount,
      locationCount,
      styleReferenceCount,
      hasCover: Boolean(projectRow.cover_image_path),
    },
  };
}

export async function getProjectSceneRollup(
  projectId: string,
  limit = 8
): Promise<{ entries: ProjectSceneRollupEntry[]; error?: string }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { entries: [], error: "You must be logged in." };
  }

  const { data: storyRows } = await supabase
    .from("stories")
    .select("id, title, world_id")
    .eq("project_id", projectId)
    .eq("user_id", user.id);

  const storyMap = new Map(
    (storyRows ?? []).map((row) => [
      row.id as string,
      {
        title: row.title as string,
        worldId: row.world_id as string,
      },
    ])
  );

  const storyIds = [...storyMap.keys()];
  if (storyIds.length === 0) {
    return { entries: [] };
  }

  const { data: sceneRows, error } = await supabase
    .from("scenes")
    .select("id, title, story_id, updated_at, created_at")
    .in("story_id", storyIds)
    .order("updated_at", { ascending: false })
    .limit(limit);

  if (error) {
    return { entries: [], error: error.message };
  }

  const entries: ProjectSceneRollupEntry[] = [];
  for (const row of sceneRows ?? []) {
    const storyId = row.story_id as string;
    const story = storyMap.get(storyId);
    if (!story) continue;

    entries.push({
      sceneId: row.id as string,
      sceneTitle: row.title as string,
      storyId,
      storyTitle: story.title,
      worldId: story.worldId,
      updatedAt: (row.updated_at as string) ?? (row.created_at as string),
    });
  }

  return { entries };
}

export async function getProjectLocationRollup(
  projectId: string
): Promise<{ entries: ProjectLocationRollupEntry[]; error?: string }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { entries: [], error: "You must be logged in." };
  }

  const { data: worldRows } = await supabase
    .from("worlds")
    .select("id, name")
    .eq("project_id", projectId)
    .eq("user_id", user.id);

  const worldMap = new Map(
    (worldRows ?? []).map((row) => [row.id as string, row.name as string])
  );
  const worldIds = [...worldMap.keys()];
  if (worldIds.length === 0) {
    return { entries: [] };
  }

  const { data: locationRows, error } = await supabase
    .from("world_locations")
    .select("*")
    .in("world_id", worldIds)
    .order("sort_order", { ascending: true })
    .order("name", { ascending: true });

  if (error) {
    return { entries: [], error: error.message };
  }

  const entries: ProjectLocationRollupEntry[] = [];
  for (const row of locationRows ?? []) {
    const location = normalizeWorldLocation(row as WorldLocationRow);
    const worldName = worldMap.get(location.world_id);
    if (!worldName) continue;

    entries.push({
      locationId: location.id,
      locationName: location.name,
      locationType: location.location_type,
      worldId: location.world_id,
      worldName,
    });
  }

  return { entries };
}

export async function getProjectAssetRollup(
  projectId: string
): Promise<{ entries: ProjectAssetRollupEntry[]; error?: string }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { entries: [], error: "You must be logged in." };
  }

  const entries: ProjectAssetRollupEntry[] = [];

  const { data: characterRows } = await supabase
    .from("characters")
    .select("id, name")
    .eq("project_id", projectId)
    .eq("user_id", user.id);

  for (const row of characterRows ?? []) {
    const characterId = row.id as string;
    const { count } = await supabase
      .from("character_images")
      .select("id", { count: "exact", head: true })
      .eq("character_id", characterId);

    entries.push({
      source: "character",
      sourceId: characterId,
      sourceName: row.name as string,
      imageCount: count ?? 0,
      editHref: `/dashboard/characters/${characterId}`,
    });
  }

  const { data: worldRows } = await supabase
    .from("worlds")
    .select("id, name")
    .eq("project_id", projectId)
    .eq("user_id", user.id);

  for (const row of worldRows ?? []) {
    const worldId = row.id as string;
    const { count } = await supabase
      .from("world_images")
      .select("id", { count: "exact", head: true })
      .eq("world_id", worldId);

    entries.push({
      source: "world",
      sourceId: worldId,
      sourceName: row.name as string,
      imageCount: count ?? 0,
      editHref: `/dashboard/worlds/${worldId}`,
    });
  }

  const { data: storyRows } = await supabase
    .from("stories")
    .select("id, title, world_id")
    .eq("project_id", projectId)
    .eq("user_id", user.id);

  for (const row of storyRows ?? []) {
    const storyId = row.id as string;
    const worldId = row.world_id as string;
    const { count } = await supabase
      .from("story_images")
      .select("id", { count: "exact", head: true })
      .eq("story_id", storyId);

    entries.push({
      source: "story",
      sourceId: storyId,
      sourceName: row.title as string,
      imageCount: count ?? 0,
      editHref: `/dashboard/worlds/${worldId}/stories/${storyId}`,
    });
  }

  entries.sort((a, b) => a.sourceName.localeCompare(b.sourceName));
  return { entries };
}

export async function getProjectTimelineStories(
  projectId: string
): Promise<{ stories: ProjectTimelineStory[]; error?: string }> {
  const storiesResult = await getProjectStories(projectId);
  if (storiesResult.error) {
    return { stories: [], error: storiesResult.error };
  }

  const stories: ProjectTimelineStory[] = [];
  for (const entry of storiesResult.entries) {
    const { scenes, error } = await getScenesByStoryId(entry.story.id);
    if (error) {
      return { stories: [], error };
    }

    stories.push({
      storyId: entry.story.id,
      storyTitle: entry.story.title,
      worldId: entry.world.id,
      scenes,
    });
  }

  return { stories };
}

export async function updateProjectCover(
  projectId: string,
  formData: FormData
): Promise<{ error?: string; success?: boolean }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "You must be logged in." };
  }

  const cover = formData.get("cover");
  if (!(cover instanceof File) || cover.size === 0) {
    return { error: "Choose an image to upload." };
  }

  const coverError = validateCover(cover);
  if (coverError) {
    return { error: coverError };
  }

  const { data: existing } = await supabase
    .from("projects")
    .select("cover_image_path")
    .eq("id", projectId)
    .eq("user_id", user.id)
    .maybeSingle();

  if (!existing) {
    return { error: "Project not found." };
  }

  const extension = cover.type.split("/")[1] ?? "jpg";
  const coverPath = `${user.id}/projects/${projectId}/cover.${extension}`;

  const { error: uploadError } = await supabase.storage
    .from(BUCKET)
    .upload(coverPath, cover, {
      contentType: cover.type,
      upsert: true,
    });

  if (uploadError) {
    return { error: `Failed to upload cover: ${uploadError.message}` };
  }

  const { error: updateError } = await supabase
    .from("projects")
    .update({
      cover_image_path: coverPath,
      updated_at: new Date().toISOString(),
    })
    .eq("id", projectId)
    .eq("user_id", user.id);

  if (updateError) {
    return { error: updateError.message };
  }

  if (
    existing.cover_image_path &&
    existing.cover_image_path !== coverPath
  ) {
    await supabase.storage.from(BUCKET).remove([existing.cover_image_path]);
  }

  revalidateProjectPaths(projectId);
  revalidatePath("/dashboard");

  return { success: true };
}

export async function deleteProject(
  projectId: string
): Promise<{ error?: string }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "You must be logged in." };
  }

  const { data: existing, error: fetchError } = await supabase
    .from("projects")
    .select("id, cover_image_path")
    .eq("id", projectId)
    .eq("user_id", user.id)
    .maybeSingle();

  if (fetchError) {
    return { error: formatProjectError(fetchError.message, fetchError.code) };
  }

  if (!existing) {
    return { error: "Project not found." };
  }

  const { error: deleteError } = await supabase
    .from("projects")
    .delete()
    .eq("id", projectId)
    .eq("user_id", user.id);

  if (deleteError) {
    return { error: formatProjectError(deleteError.message, deleteError.code) };
  }

  const coverPath = existing.cover_image_path as string | null;
  if (coverPath) {
    await supabase.storage.from(BUCKET).remove([coverPath]);
  }

  revalidateProjectPaths(projectId);
  revalidatePath("/dashboard/projects");
  revalidatePath("/dashboard");

  return {};
}
