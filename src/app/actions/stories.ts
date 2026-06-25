"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import type { Character, CharacterRow } from "@/types/character";
import { normalizeCharacter } from "@/types/character";
import type { Story, StoryRow, StoryWithCounts } from "@/types/story";
import {
  normalizeStory,
  parseStoryProjectType,
  parseStoryStatus,
  slugifyStoryTitle,
} from "@/types/story";
import { deleteAllStoryImageFiles, getPublicStoryImages } from "@/app/actions/story-images";
import { scanSavedText } from "@/lib/moderation/scan-text";
import {
  createSignedUrlCache,
  lookupSignedUrl,
  signStorageUrls,
} from "@/lib/storage/signed-url";
import type { StoryImageWithUrl } from "@/types/story-image";
import type { World, WorldRow } from "@/types/world";
import { normalizeWorld } from "@/types/world";
import {
  ensurePrimaryStoryWorldLink,
  resolveProjectIdForWorld,
} from "@/app/actions/projects";
import { ensureProjectDefaultSetting } from "@/lib/project-setting";
import { normalizeProject, type ProjectRow } from "@/types/project";

export type StoryActionState = {
  error?: string;
  success?: boolean;
  story?: Story;
};

export type StoryCharacterEntry = {
  story_id: string;
  character_id: string;
  character: Character;
};

export type CharacterStoryEntry = {
  story: Story;
  worldId: string;
};

export type UserStoryEntry = {
  story: StoryWithCounts;
  world: { id: string; name: string; description: string | null };
};

function formatStoryError(message: string, code?: string): string {
  if (
    code === "PGRST205" ||
    message.includes("schema cache") ||
    message.includes("Could not find")
  ) {
    return (
      "The stories table is not exposed to the Supabase Data API yet. " +
      "Run supabase/migrations/20250619000000_stories.sql and " +
      "supabase/fix-stories-api.sql in the Supabase SQL Editor."
    );
  }
  if (code === "23505" || message.includes("stories_world_id_slug_key")) {
    return "That story slug is already in use in this world.";
  }
  return message;
}

function slugWithSuffix(base: string, suffix: number): string {
  const suffixStr = String(suffix);
  const maxBaseLen = 50 - suffixStr.length;
  return `${base.slice(0, maxBaseLen)}${suffixStr}`;
}

async function isStorySlugTaken(
  supabase: Awaited<ReturnType<typeof createClient>>,
  worldId: string,
  slug: string,
  excludeStoryId?: string
): Promise<boolean> {
  let query = supabase
    .from("stories")
    .select("id")
    .eq("world_id", worldId)
    .eq("slug", slug);

  if (excludeStoryId) {
    query = query.neq("id", excludeStoryId);
  }

  const { data, error } = await query.maybeSingle();
  if (error) throw new Error(error.message);
  return data !== null;
}

async function resolveAvailableStorySlug(
  supabase: Awaited<ReturnType<typeof createClient>>,
  worldId: string,
  title: string
): Promise<string> {
  const base = slugifyStoryTitle(title);

  if (!(await isStorySlugTaken(supabase, worldId, base))) {
    return base;
  }

  for (let n = 2; n <= 9999; n++) {
    const candidate = slugWithSuffix(base, n);
    if (!(await isStorySlugTaken(supabase, worldId, candidate))) {
      return candidate;
    }
  }

  throw new Error("Unable to allocate a unique story slug.");
}

async function assertWorldOwner(
  supabase: Awaited<ReturnType<typeof createClient>>,
  worldId: string,
  userId: string
): Promise<{ error: string | null; world: World | null }> {
  const { data, error } = await supabase
    .from("worlds")
    .select("*")
    .eq("id", worldId)
    .eq("user_id", userId)
    .maybeSingle();

  if (error) {
    return { error: error.message, world: null };
  }
  if (!data) {
    return { error: "World not found.", world: null };
  }
  return { error: null, world: normalizeWorld(data as WorldRow) };
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
    return { error: formatStoryError(error.message, error.code), story: null };
  }
  if (!data) {
    return { error: "Story not found.", story: null };
  }
  return { error: null, story: normalizeStory(data as StoryRow) };
}

export async function attachCharacterCounts(
  supabase: Awaited<ReturnType<typeof createClient>>,
  stories: Story[]
): Promise<StoryWithCounts[]> {
  if (stories.length === 0) {
    return [];
  }

  const { data: links } = await supabase
    .from("story_characters")
    .select("story_id")
    .in(
      "story_id",
      stories.map((s) => s.id)
    );

  const counts = new Map<string, number>();
  for (const link of links ?? []) {
    counts.set(link.story_id, (counts.get(link.story_id) ?? 0) + 1);
  }

  return stories.map((story) => ({
    ...story,
    character_count: counts.get(story.id) ?? 0,
  }));
}

async function revalidateStoryPaths(
  supabase: Awaited<ReturnType<typeof createClient>>,
  worldId: string,
  worldSlug?: string,
  story?: { id: string; slug: string }
): Promise<void> {
  revalidatePath("/dashboard/stories");
  revalidatePath(`/dashboard/worlds/${worldId}`);
  if (story) {
    revalidatePath(`/dashboard/worlds/${worldId}/stories/${story.id}`);
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("username")
    .maybeSingle();

  if (profile?.username && worldSlug) {
    revalidatePath(`/u/${profile.username}/worlds/${worldSlug}`);
    if (story) {
      revalidatePath(
        `/u/${profile.username}/worlds/${worldSlug}/stories/${story.slug}`
      );
    }
  }
}

/** Revalidates all story workspace pages linked to a world (V3 read aggregates). */
export async function revalidateStoryWorkspacePagesForWorld(
  worldId: string
): Promise<void> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("stories")
    .select("id")
    .eq("world_id", worldId);

  for (const row of data ?? []) {
    revalidatePath(`/dashboard/worlds/${worldId}/stories/${row.id as string}`);
  }
}

export async function getStoriesByWorldId(
  worldId: string
): Promise<{ stories: StoryWithCounts[]; error?: string }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { stories: [], error: "You must be logged in." };
  }

  const worldCheck = await assertWorldOwner(supabase, worldId, user.id);
  if (worldCheck.error) {
    return { stories: [], error: worldCheck.error };
  }

  const { data, error } = await supabase
    .from("stories")
    .select("*")
    .eq("world_id", worldId)
    .order("created_at", { ascending: false });

  if (error) {
    return {
      stories: [],
      error: formatStoryError(error.message, error.code),
    };
  }

  const stories = (data ?? []).map((row) => normalizeStory(row as StoryRow));
  return { stories: await attachCharacterCounts(supabase, stories) };
}

export async function getStoriesForUser(): Promise<{
  entries: UserStoryEntry[];
  error?: string;
}> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { entries: [], error: "You must be logged in." };
  }

  const { data, error } = await supabase
    .from("stories")
    .select("*, worlds!stories_world_id_fkey(id, name, description)")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (error) {
    return {
      entries: [],
      error: formatStoryError(error.message, error.code),
    };
  }

  const stories = (data ?? []).map((row) => {
    const { worlds: worldRow, ...storyRow } = row as StoryRow & {
      worlds: { id: string; name: string; description: string | null } | null;
    };
    return {
      story: normalizeStory(storyRow),
      world: worldRow
        ? {
            id: worldRow.id,
            name: worldRow.name,
            description: worldRow.description ?? null,
          }
        : {
            id: storyRow.world_id,
            name: "Unknown setting",
            description: null,
          },
    };
  });

  const storyList = stories.map((entry) => entry.story);
  const withCounts = await attachCharacterCounts(supabase, storyList);
  const countById = new Map(withCounts.map((story) => [story.id, story.character_count]));

  return {
    entries: stories.map((entry) => ({
      story: {
        ...entry.story,
        character_count: countById.get(entry.story.id) ?? 0,
      },
      world: entry.world,
    })),
  };
}

export async function getStoryById(
  worldId: string,
  storyId: string
): Promise<{ story: Story | null; error?: string }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { story: null, error: "You must be logged in." };
  }

  const { data, error } = await supabase
    .from("stories")
    .select("*")
    .eq("id", storyId)
    .eq("world_id", worldId)
    .eq("user_id", user.id)
    .maybeSingle();

  if (error) {
    return { story: null, error: formatStoryError(error.message, error.code) };
  }
  if (!data) {
    return { story: null };
  }

  return { story: normalizeStory(data as StoryRow) };
}

export async function createStory(
  _prev: StoryActionState,
  formData: FormData
): Promise<StoryActionState> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "You must be logged in." };
  }

  let worldId = String(formData.get("world_id") ?? "").trim();
  const projectIdInput = String(formData.get("project_id") ?? "").trim() || null;
  const title = String(formData.get("title") ?? "").trim();
  const summary = String(formData.get("summary") ?? "").trim() || null;
  const status = parseStoryStatus(formData.get("status"));
  const projectType = parseStoryProjectType(formData.get("project_type"));

  if (!title) {
    return { error: "Title is required." };
  }

  if (!worldId && !projectIdInput) {
    return { error: "Project is required." };
  }

  let resolvedProjectId: string | null = projectIdInput;

  if (!worldId && projectIdInput) {
    const { data: projectRow, error: projectError } = await supabase
      .from("projects")
      .select("*")
      .eq("id", projectIdInput)
      .eq("user_id", user.id)
      .maybeSingle();

    if (projectError) {
      return { error: projectError.message };
    }
    if (!projectRow) {
      return { error: "Project not found." };
    }

    const project = normalizeProject(projectRow as ProjectRow);
    const settingResult = await ensureProjectDefaultSetting(
      supabase,
      user.id,
      project
    );
    if (settingResult.error || !settingResult.world) {
      return {
        error: settingResult.error ?? "Failed to resolve project setting.",
      };
    }
    worldId = settingResult.world.id;
    resolvedProjectId = project.id;
  }

  const worldCheck = await assertWorldOwner(supabase, worldId, user.id);
  if (worldCheck.error || !worldCheck.world) {
    return { error: worldCheck.error ?? "Setting not found." };
  }

  let projectId: string | null;
  if (resolvedProjectId) {
    projectId = resolvedProjectId;
  } else {
    const projectResolve = await resolveProjectIdForWorld(
      supabase,
      user.id,
      worldId,
      projectIdInput
    );
    if (projectResolve.error && !projectResolve.projectId) {
      return { error: projectResolve.error };
    }
    projectId = projectResolve.projectId;
  }

  let slug: string;
  try {
    slug = await resolveAvailableStorySlug(supabase, worldId, title);
  } catch (err) {
    return {
      error:
        err instanceof Error ? err.message : "Failed to generate story slug.",
    };
  }

  let projectSortOrder = 0;
  if (projectId) {
    const { data: lastStory } = await supabase
      .from("stories")
      .select("project_sort_order")
      .eq("project_id", projectId)
      .eq("user_id", user.id)
      .order("project_sort_order", { ascending: false })
      .limit(1)
      .maybeSingle();
    projectSortOrder = ((lastStory?.project_sort_order as number) ?? -1) + 1;
  }

  const { data: created, error: insertError } = await supabase
    .from("stories")
    .insert({
      world_id: worldId,
      user_id: user.id,
      project_id: projectId,
      project_sort_order: projectSortOrder,
      title,
      slug,
      summary,
      status,
      project_type: projectType,
    })
    .select("*")
    .single();

  if (insertError || !created) {
    return {
      error: formatStoryError(
        insertError?.message ?? "Failed to create story.",
        insertError?.code
      ),
    };
  }

  const story = normalizeStory(created as StoryRow);
  await ensurePrimaryStoryWorldLink(supabase, story.id, worldId);

  if (projectId) {
    revalidatePath(`/dashboard/projects/${projectId}`);
    revalidatePath("/dashboard/projects");
  }

  await revalidateStoryPaths(supabase, worldId, worldCheck.world.slug, {
    id: story.id,
    slug: story.slug,
  });

  void scanSavedText({
    supabase,
    userId: user.id,
    entityType: "story",
    entityId: story.id,
    fields: { title, summary },
  });

  return { success: true, story };
}

export async function updateStory(
  _prev: StoryActionState,
  formData: FormData
): Promise<StoryActionState> {
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
  const summary = String(formData.get("summary") ?? "").trim() || null;
  const status = parseStoryStatus(formData.get("status"));
  const projectType = parseStoryProjectType(formData.get("project_type"));

  if (!storyId || !worldId || !title) {
    return { error: "Title is required." };
  }

  const storyCheck = await assertStoryOwner(supabase, storyId, user.id);
  if (storyCheck.error || !storyCheck.story) {
    return { error: storyCheck.error ?? "Story not found." };
  }

  if (storyCheck.story.world_id !== worldId) {
    return { error: "Story does not belong to this world." };
  }

  const { data: updated, error: updateError } = await supabase
    .from("stories")
    .update({ title, summary, status, project_type: projectType })
    .eq("id", storyId)
    .select("*")
    .single();

  if (updateError || !updated) {
    return {
      error: formatStoryError(
        updateError?.message ?? "Failed to update story.",
        updateError?.code
      ),
    };
  }

  const { data: worldRow } = await supabase
    .from("worlds")
    .select("slug")
    .eq("id", worldId)
    .maybeSingle();

  const story = normalizeStory(updated as StoryRow);
  await revalidateStoryPaths(
    supabase,
    worldId,
    worldRow?.slug,
    { id: story.id, slug: story.slug }
  );

  void scanSavedText({
    supabase,
    userId: user.id,
    entityType: "story",
    entityId: storyId,
    fields: { title, summary },
  });

  return { success: true, story };
}

export async function deleteStory(
  storyId: string
): Promise<{ error?: string }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "You must be logged in." };
  }

  const storyCheck = await assertStoryOwner(supabase, storyId, user.id);
  if (storyCheck.error || !storyCheck.story) {
    return { error: storyCheck.error ?? "Story not found." };
  }

  const worldId = storyCheck.story.world_id;

  await deleteAllStoryImageFiles(supabase, storyId);

  const { error } = await supabase.from("stories").delete().eq("id", storyId);

  if (error) {
    return { error: formatStoryError(error.message, error.code) };
  }

  const { data: worldRow } = await supabase
    .from("worlds")
    .select("slug")
    .eq("id", worldId)
    .maybeSingle();

  await revalidateStoryPaths(supabase, worldId, worldRow?.slug);
  return {};
}

export async function getStoryCharacters(
  storyId: string
): Promise<{ entries: StoryCharacterEntry[]; error?: string }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { entries: [], error: "You must be logged in." };
  }

  const storyCheck = await assertStoryOwner(supabase, storyId, user.id);
  if (storyCheck.error) {
    return { entries: [], error: storyCheck.error };
  }

  const { data: links, error: linksError } = await supabase
    .from("story_characters")
    .select("story_id, character_id")
    .eq("story_id", storyId);

  if (linksError) {
    return {
      entries: [],
      error: formatStoryError(linksError.message, linksError.code),
    };
  }

  if (!links?.length) {
    return { entries: [] };
  }

  const characterIds = links.map((l) => l.character_id);
  const { data: characterRows, error: charsError } = await supabase
    .from("characters")
    .select("*")
    .in("id", characterIds)
    .eq("user_id", user.id);

  if (charsError) {
    return { entries: [], error: charsError.message };
  }

  const characterMap = new Map(
    (characterRows ?? []).map((row) => [
      row.id,
      normalizeCharacter(row as CharacterRow),
    ])
  );

  const entries: StoryCharacterEntry[] = [];
  for (const link of links) {
    const character = characterMap.get(link.character_id);
    if (character) {
      entries.push({
        story_id: link.story_id,
        character_id: link.character_id,
        character,
      });
    }
  }

  return { entries };
}

export async function addCharacterToStory(
  storyId: string,
  characterId: string
): Promise<{ error?: string }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "You must be logged in." };
  }

  const storyCheck = await assertStoryOwner(supabase, storyId, user.id);
  if (storyCheck.error || !storyCheck.story) {
    return { error: storyCheck.error ?? "Story not found." };
  }

  const { data: character, error: charError } = await supabase
    .from("characters")
    .select("*")
    .eq("id", characterId)
    .eq("user_id", user.id)
    .maybeSingle();

  if (charError || !character) {
    return { error: "Character not found." };
  }

  const { error: insertError } = await supabase.from("story_characters").insert({
    story_id: storyId,
    character_id: characterId,
  });

  if (insertError) {
    if (insertError.code === "23505") {
      return { error: "Character is already in this story." };
    }
    return { error: formatStoryError(insertError.message, insertError.code) };
  }

  const { data: worldRow } = await supabase
    .from("worlds")
    .select("slug")
    .eq("id", storyCheck.story.world_id)
    .maybeSingle();

  await revalidateStoryPaths(
    supabase,
    storyCheck.story.world_id,
    worldRow?.slug,
    { id: storyCheck.story.id, slug: storyCheck.story.slug }
  );
  revalidatePath(`/dashboard/characters/${characterId}`);
  return {};
}

export async function addCharactersToStory(
  storyId: string,
  characterIds: string[]
): Promise<{ error?: string; addedCount?: number }> {
  const uniqueIds = [...new Set(characterIds.filter(Boolean))];
  if (uniqueIds.length === 0) {
    return { error: "Select at least one character." };
  }

  let addedCount = 0;
  for (const characterId of uniqueIds) {
    const result = await addCharacterToStory(storyId, characterId);
    if (result.error) {
      if (result.error.includes("already in this story")) {
        continue;
      }
      return { error: result.error, addedCount };
    }
    addedCount += 1;
  }

  if (addedCount === 0) {
    return { error: "No characters were added to this story." };
  }

  return { addedCount };
}

export async function changeStoryWorld(
  storyId: string,
  newWorldId: string
): Promise<{ error?: string; worldId?: string; storyId?: string }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "You must be logged in." };
  }

  const storyCheck = await assertStoryOwner(supabase, storyId, user.id);
  if (storyCheck.error || !storyCheck.story) {
    return { error: storyCheck.error ?? "Story not found." };
  }

  const story = storyCheck.story;
  if (story.world_id === newWorldId) {
    return { worldId: newWorldId, storyId: story.id };
  }

  const worldCheck = await assertWorldOwner(supabase, newWorldId, user.id);
  if (worldCheck.error || !worldCheck.world) {
    return { error: worldCheck.error ?? "World not found." };
  }

  let slug = story.slug;
  if (await isStorySlugTaken(supabase, newWorldId, slug, storyId)) {
    slug = await resolveAvailableStorySlug(supabase, newWorldId, story.title);
  }

  const oldWorldId = story.world_id;

  const { error: updateError } = await supabase
    .from("stories")
    .update({ world_id: newWorldId, slug })
    .eq("id", storyId)
    .eq("user_id", user.id);

  if (updateError) {
    return {
      error: formatStoryError(updateError.message, updateError.code),
    };
  }

  await supabase
    .from("story_worlds")
    .delete()
    .eq("story_id", storyId)
    .eq("world_id", oldWorldId);

  await ensurePrimaryStoryWorldLink(supabase, storyId, newWorldId);

  const { data: oldWorldRow } = await supabase
    .from("worlds")
    .select("slug")
    .eq("id", oldWorldId)
    .maybeSingle();

  await revalidateStoryPaths(supabase, oldWorldId, oldWorldRow?.slug, {
    id: story.id,
    slug: story.slug,
  });

  await revalidateStoryPaths(supabase, newWorldId, worldCheck.world.slug, {
    id: story.id,
    slug,
  });

  revalidatePath("/dashboard/stories");

  return { worldId: newWorldId, storyId: story.id };
}

export async function removeCharacterFromStory(
  storyId: string,
  characterId: string
): Promise<{ error?: string }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "You must be logged in." };
  }

  const storyCheck = await assertStoryOwner(supabase, storyId, user.id);
  if (storyCheck.error || !storyCheck.story) {
    return { error: storyCheck.error ?? "Story not found." };
  }

  const { error } = await supabase
    .from("story_characters")
    .delete()
    .eq("story_id", storyId)
    .eq("character_id", characterId);

  if (error) {
    return { error: formatStoryError(error.message, error.code) };
  }

  const { data: worldRow } = await supabase
    .from("worlds")
    .select("slug")
    .eq("id", storyCheck.story.world_id)
    .maybeSingle();

  await revalidateStoryPaths(
    supabase,
    storyCheck.story.world_id,
    worldRow?.slug,
    { id: storyCheck.story.id, slug: storyCheck.story.slug }
  );
  revalidatePath(`/dashboard/characters/${characterId}`);
  return {};
}

export async function getStoriesForCharacter(
  characterId: string
): Promise<{ entries: CharacterStoryEntry[]; error?: string }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { entries: [], error: "You must be logged in." };
  }

  const { data: character, error: charError } = await supabase
    .from("characters")
    .select("id")
    .eq("id", characterId)
    .eq("user_id", user.id)
    .maybeSingle();

  if (charError || !character) {
    return { entries: [], error: "Character not found." };
  }

  const { data: links, error: linksError } = await supabase
    .from("story_characters")
    .select("story_id")
    .eq("character_id", characterId);

  if (linksError) {
    return {
      entries: [],
      error: formatStoryError(linksError.message, linksError.code),
    };
  }

  if (!links?.length) {
    return { entries: [] };
  }

  const storyIds = links.map((l) => l.story_id);
  const { data: storyRows, error: storiesError } = await supabase
    .from("stories")
    .select("*")
    .in("id", storyIds)
    .eq("user_id", user.id)
    .order("title", { ascending: true });

  if (storiesError) {
    return {
      entries: [],
      error: formatStoryError(storiesError.message, storiesError.code),
    };
  }

  return {
    entries: (storyRows ?? []).map((row) => ({
      story: normalizeStory(row as StoryRow),
      worldId: (row as StoryRow).world_id,
    })),
  };
}

export async function getPublicStoriesByWorld(
  worldId: string
): Promise<StoryWithCounts[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("stories")
    .select("*")
    .eq("world_id", worldId)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Failed to fetch public stories:", error.message);
    return [];
  }

  const stories = (data ?? []).map((row) => normalizeStory(row as StoryRow));
  return attachCharacterCounts(supabase, stories);
}

export async function getPublicStory(
  username: string,
  worldSlug: string,
  storySlug: string
): Promise<{
  world: World | null;
  story: Story | null;
  characters: Character[];
  characterPhotos: Record<string, string | null>;
  images: StoryImageWithUrl[];
  featuredImageId: string | null;
  profileUsername: string | null;
  error?: string;
}> {
  const supabase = await createClient();
  const normalizedUsername = username.toLowerCase().replace(/[^a-z0-9_-]/g, "");

  const { data: profile } = await supabase
    .from("profiles")
    .select("id, username, is_public")
    .eq("username", normalizedUsername)
    .maybeSingle();

  if (!profile?.is_public) {
    return {
      world: null,
      story: null,
      characters: [],
      characterPhotos: {},
      images: [],
      featuredImageId: null,
      profileUsername: null,
    };
  }

  const { data: worldRow } = await supabase
    .from("worlds")
    .select("*")
    .eq("user_id", profile.id)
    .eq("slug", worldSlug)
    .eq("is_public", true)
    .maybeSingle();

  if (!worldRow) {
    return {
      world: null,
      story: null,
      characters: [],
      characterPhotos: {},
      images: [],
      featuredImageId: null,
      profileUsername: profile.username,
    };
  }

  const world = normalizeWorld(worldRow as WorldRow);

  const { data: storyRow, error: storyError } = await supabase
    .from("stories")
    .select("*")
    .eq("world_id", world.id)
    .eq("slug", storySlug)
    .maybeSingle();

  if (storyError) {
    return {
      world,
      story: null,
      characters: [],
      characterPhotos: {},
      images: [],
      featuredImageId: null,
      profileUsername: profile.username,
      error: formatStoryError(storyError.message, storyError.code),
    };
  }

  if (!storyRow) {
    return {
      world,
      story: null,
      characters: [],
      characterPhotos: {},
      images: [],
      featuredImageId: null,
      profileUsername: profile.username,
    };
  }

  const story = normalizeStory(storyRow as StoryRow);

  const { data: links } = await supabase
    .from("story_characters")
    .select("character_id")
    .eq("story_id", story.id);

  const characterIds = (links ?? []).map((l) => l.character_id);
  let characters: Character[] = [];

  if (characterIds.length > 0) {
    const { data: characterRows } = await supabase
      .from("characters")
      .select("*")
      .in("id", characterIds)
      .eq("user_id", profile.id)
      .eq("is_public", true);

    characters = (characterRows ?? []).map((row) =>
      normalizeCharacter(row as CharacterRow)
    );
  }

  const cache = createSignedUrlCache();
  await signStorageUrls(
    supabase,
    characters.map((character) => character.photo_path),
    { cache }
  );

  const characterPhotos = Object.fromEntries(
    characters.map((character) => [
      character.id,
      lookupSignedUrl(cache, character.photo_path),
    ])
  );

  const images = await getPublicStoryImages(story.id);

  return {
    world,
    story,
    characters,
    characterPhotos,
    images,
    featuredImageId: story.featured_image_id,
    profileUsername: profile.username,
  };
}
