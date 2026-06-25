"use server";

import { getCharacterPhotoUrl } from "@/app/actions/characters";
import { getProjectCoverUrl, getProjects } from "@/app/actions/projects";
import { getStoryCoverUrls } from "@/app/actions/story-images";
import { attachCharacterCounts } from "@/app/actions/stories";
import { createClient } from "@/lib/supabase/server";
import {
  CHARACTER_PHOTOS_BUCKET,
  createSignedUrlCache,
  lookupSignedUrl,
  signStorageUrls,
} from "@/lib/storage/signed-url";
import { normalizeCharacter, type CharacterRow } from "@/types/character";
import { normalizeCharacterImage, type CharacterImageRow } from "@/types/character-image";
import { normalizeScene, type SceneRow } from "@/types/scene";
import { normalizeStory, type StoryRow } from "@/types/story";

export type LibraryProjectRef = {
  id: string;
  title: string;
  href: string;
};

export type LibraryStoryRef = {
  id: string;
  title: string;
  href: string;
};

export type LibraryCharacterItem = {
  id: string;
  name: string;
  photoUrl: string | null;
  portraitFocalY: number;
  project: LibraryProjectRef | null;
  projects: LibraryProjectRef[];
  stories: LibraryStoryRef[];
  storyTitles: string[];
  storyCount: number;
  sceneCount: number;
  referenceImageCount: number;
  assetCount: number;
  tags: string[];
  workedAt: string;
  updatedAt: string;
  href: string;
};

export type LibraryStoryItem = {
  id: string;
  title: string;
  status: string;
  project: LibraryProjectRef | null;
  worldId: string;
  sceneCount: number;
  characterCount: number;
  characterNames: string[];
  assetCount: number;
  coverUrl: string | null;
  workedAt: string;
  updatedAt: string;
  href: string;
};

export type LibrarySceneItem = {
  id: string;
  title: string;
  storyTitle: string;
  storyId: string;
  storyHref: string;
  worldId: string;
  project: LibraryProjectRef | null;
  story: LibraryStoryRef;
  characterNames: string[];
  timelinePosition: number;
  coverUrl: string | null;
  workedAt: string;
  updatedAt: string;
  href: string;
};

export type LibraryAssetItem = {
  id: string;
  name: string;
  thumbnailUrl: string | null;
  project: LibraryProjectRef | null;
  assetType: "Character" | "Setting" | "Story";
  storyTitles: string[];
  storyCount: number;
  workedAt: string;
  updatedAt: string;
  href: string;
};

export type LibraryReferenceItem = {
  id: string;
  imageUrl: string | null;
  characterId: string;
  characterName: string;
  characterHref: string;
  project: LibraryProjectRef | null;
  tags: string[];
  workedAt: string;
  updatedAt: string;
  href: string;
};

export type LibraryContinueItem = {
  id: string;
  kind: "character" | "story" | "scene" | "asset" | "project";
  title: string;
  subtitle: string | null;
  imageUrl: string | null;
  portraitFocalY?: number;
  project: LibraryProjectRef | null;
  story: LibraryStoryRef | null;
  workedAt: string;
  updatedAt: string;
  href: string;
};

/** @deprecated Use LibraryContinueItem */
export type LibraryRecentItem = LibraryContinueItem;

export type LibrarySearchResults = {
  query: string;
  characters: LibraryCharacterItem[];
  stories: LibraryStoryItem[];
  scenes: LibrarySceneItem[];
  assets: LibraryAssetItem[];
  references: LibraryReferenceItem[];
  projects: { id: string; title: string; href: string; updatedAt: string }[];
};

type ProjectMap = Map<string, LibraryProjectRef>;

function projectRef(map: ProjectMap, projectId: string | null | undefined): LibraryProjectRef | null {
  if (!projectId) return null;
  return map.get(projectId) ?? null;
}

function storyRef(
  storyId: string,
  title: string,
  worldId: string
): LibraryStoryRef {
  return {
    id: storyId,
    title,
    href: `/dashboard/worlds/${worldId}/stories/${storyId}`,
  };
}

function bumpTimestamp(
  map: Map<string, string>,
  id: string,
  candidate: string | null | undefined
) {
  if (!candidate) return;
  const current = map.get(id);
  if (!current || candidate.localeCompare(current) > 0) {
    map.set(id, candidate);
  }
}

async function loadProjectMap(
  supabase: Awaited<ReturnType<typeof createClient>>,
  userId: string
): Promise<ProjectMap> {
  const { data } = await supabase
    .from("projects")
    .select("id, title")
    .eq("user_id", userId);

  const map: ProjectMap = new Map();
  for (const row of data ?? []) {
    const id = row.id as string;
    map.set(id, {
      id,
      title: row.title as string,
      href: `/dashboard/projects/${id}`,
    });
  }
  return map;
}

function characterTags(character: {
  species: string | null;
  gender: string | null;
  location: string | null;
}): string[] {
  return [character.species, character.gender, character.location].filter(
    (value): value is string => Boolean(value?.trim())
  );
}

function unwrapJoin<T>(value: T | T[] | null | undefined): T | null {
  if (!value) return null;
  return Array.isArray(value) ? (value[0] ?? null) : value;
}

function matchesQuery(values: (string | null | undefined)[], query: string): boolean {
  const q = query.toLowerCase();
  return values.some((value) => value?.toLowerCase().includes(q));
}

function uniqueProjects(refs: (LibraryProjectRef | null | undefined)[]): LibraryProjectRef[] {
  const map = new Map<string, LibraryProjectRef>();
  for (const ref of refs) {
    if (ref) map.set(ref.id, ref);
  }
  return [...map.values()];
}

async function loadCharacterRelationshipMaps(
  supabase: Awaited<ReturnType<typeof createClient>>,
  characterIds: string[],
  projectMap: ProjectMap,
  createdAtByCharacter: Map<string, string>
) {
  const storiesByCharacter = new Map<string, LibraryStoryRef[]>();
  const projectsByCharacter = new Map<string, LibraryProjectRef[]>();
  const sceneCountByCharacter = new Map<string, number>();
  const referenceCountByCharacter = new Map<string, number>();
  const assetCountByCharacter = new Map<string, number>();
  const workedAtByCharacter = new Map<string, string>(createdAtByCharacter);

  if (characterIds.length === 0) {
    return {
      storiesByCharacter,
      projectsByCharacter,
      sceneCountByCharacter,
      referenceCountByCharacter,
      assetCountByCharacter,
      workedAtByCharacter,
    };
  }

  const { data: storyLinks } = await supabase
    .from("story_characters")
    .select("character_id, stories(id, title, world_id, project_id)")
    .in("character_id", characterIds);

  for (const row of storyLinks ?? []) {
    const characterId = row.character_id as string;
    const story = unwrapJoin(
      row.stories as
        | { id: string; title: string; world_id: string; project_id: string | null }
        | { id: string; title: string; world_id: string; project_id: string | null }[]
    );
    if (!story?.world_id) continue;

    const ref = storyRef(story.id, story.title, story.world_id);
    const stories = storiesByCharacter.get(characterId) ?? [];
    if (!stories.some((entry) => entry.id === ref.id)) {
      stories.push(ref);
      storiesByCharacter.set(characterId, stories);
    }

    const project = projectRef(projectMap, story.project_id);
    const projects = projectsByCharacter.get(characterId) ?? [];
    if (project && !projects.some((entry) => entry.id === project.id)) {
      projects.push(project);
      projectsByCharacter.set(characterId, projects);
    }
  }

  const { data: sceneLinks } = await supabase
    .from("scene_characters")
    .select("character_id, scenes(updated_at)")
    .in("character_id", characterIds);

  for (const row of sceneLinks ?? []) {
    const characterId = row.character_id as string;
    sceneCountByCharacter.set(characterId, (sceneCountByCharacter.get(characterId) ?? 0) + 1);
    const scene = unwrapJoin(row.scenes as { updated_at: string } | { updated_at: string }[]);
    bumpTimestamp(workedAtByCharacter, characterId, scene?.updated_at);
  }

  const { data: imageRows } = await supabase
    .from("character_images")
    .select("character_id, asset_role, created_at")
    .in("character_id", characterIds);

  for (const row of imageRows ?? []) {
    const characterId = row.character_id as string;
    assetCountByCharacter.set(characterId, (assetCountByCharacter.get(characterId) ?? 0) + 1);
    const role = row.asset_role as string | null;
    if (role === "reference" || role === "canonical") {
      referenceCountByCharacter.set(
        characterId,
        (referenceCountByCharacter.get(characterId) ?? 0) + 1
      );
    }
    bumpTimestamp(workedAtByCharacter, characterId, row.created_at as string);
  }

  const { data: bibleRows } = await supabase
    .from("character_bible")
    .select("character_id, updated_at")
    .in("character_id", characterIds);

  for (const row of bibleRows ?? []) {
    bumpTimestamp(workedAtByCharacter, row.character_id as string, row.updated_at as string);
  }

  return {
    storiesByCharacter,
    projectsByCharacter,
    sceneCountByCharacter,
    referenceCountByCharacter,
    assetCountByCharacter,
    workedAtByCharacter,
  };
}

async function loadStoryRelationshipMaps(
  supabase: Awaited<ReturnType<typeof createClient>>,
  stories: { id: string; created_at: string; world_id: string }[]
) {
  const storyIds = stories.map((story) => story.id);
  const characterNamesByStory = new Map<string, string[]>();
  const assetCountByStory = new Map<string, number>();
  const workedAtByStory = new Map<string, string>(
    stories.map((story) => [story.id, story.created_at])
  );

  if (storyIds.length === 0) {
    return { characterNamesByStory, assetCountByStory, workedAtByStory };
  }

  const { data: castRows } = await supabase
    .from("story_characters")
    .select("story_id, characters(name)")
    .in("story_id", storyIds);

  for (const row of castRows ?? []) {
    const storyId = row.story_id as string;
    const character = unwrapJoin(row.characters as { name: string } | { name: string }[]);
    if (!character?.name) continue;
    const names = characterNamesByStory.get(storyId) ?? [];
    names.push(character.name);
    characterNamesByStory.set(storyId, names);
  }

  const { data: assetRows } = await supabase
    .from("story_images")
    .select("story_id, created_at")
    .in("story_id", storyIds);

  for (const row of assetRows ?? []) {
    const storyId = row.story_id as string;
    assetCountByStory.set(storyId, (assetCountByStory.get(storyId) ?? 0) + 1);
    bumpTimestamp(workedAtByStory, storyId, row.created_at as string);
  }

  const { data: sceneRows } = await supabase
    .from("scenes")
    .select("story_id, updated_at")
    .in("story_id", storyIds);

  for (const row of sceneRows ?? []) {
    bumpTimestamp(workedAtByStory, row.story_id as string, row.updated_at as string);
  }

  return { characterNamesByStory, assetCountByStory, workedAtByStory };
}

async function loadAssetStoryTitles(
  supabase: Awaited<ReturnType<typeof createClient>>,
  characterIds: string[],
  worldIds: string[],
  storyIds: string[]
) {
  const titlesByCharacter = new Map<string, string[]>();
  const titlesByWorld = new Map<string, string[]>();
  const titlesByStory = new Map<string, string[]>();

  if (characterIds.length > 0) {
    const { data } = await supabase
      .from("story_characters")
      .select("character_id, stories(title)")
      .in("character_id", characterIds);

    for (const row of data ?? []) {
      const characterId = row.character_id as string;
      const story = unwrapJoin(row.stories as { title: string } | { title: string }[]);
      if (!story?.title) continue;
      const titles = titlesByCharacter.get(characterId) ?? [];
      if (!titles.includes(story.title)) titles.push(story.title);
      titlesByCharacter.set(characterId, titles);
    }
  }

  if (worldIds.length > 0) {
    const { data } = await supabase
      .from("stories")
      .select("world_id, title")
      .in("world_id", worldIds);

    for (const row of data ?? []) {
      const worldId = row.world_id as string;
      const title = row.title as string;
      const titles = titlesByWorld.get(worldId) ?? [];
      if (!titles.includes(title)) titles.push(title);
      titlesByWorld.set(worldId, titles);
    }
  }

  if (storyIds.length > 0) {
    const { data } = await supabase
      .from("stories")
      .select("id, title")
      .in("id", storyIds);

    for (const row of data ?? []) {
      titlesByStory.set(row.id as string, [row.title as string]);
    }
  }

  return { titlesByCharacter, titlesByWorld, titlesByStory };
}

export async function getLibraryCharacters(): Promise<{
  items: LibraryCharacterItem[];
  error?: string;
}> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { items: [], error: "You must be logged in." };

  const projectMap = await loadProjectMap(supabase, user.id);

  const { data, error } = await supabase
    .from("characters")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (error) return { items: [], error: error.message };

  const normalized = (data ?? []).map((row) => normalizeCharacter(row as CharacterRow));
  const createdAtByCharacter = new Map(
    normalized.map((character) => [character.id, character.created_at])
  );

  const relationshipMaps = await loadCharacterRelationshipMaps(
    supabase,
    normalized.map((character) => character.id),
    projectMap,
    createdAtByCharacter
  );

  const items = await Promise.all(
    normalized.map(async (character) => {
      const homeProject = projectRef(projectMap, character.project_id);
      const stories = relationshipMaps.storiesByCharacter.get(character.id) ?? [];
      const linkedProjects = relationshipMaps.projectsByCharacter.get(character.id) ?? [];
      const projects = uniqueProjects([homeProject, ...linkedProjects]);
      const workedAt =
        relationshipMaps.workedAtByCharacter.get(character.id) ?? character.created_at;

      return {
        id: character.id,
        name: character.name,
        photoUrl: await getCharacterPhotoUrl(character.photo_path),
        portraitFocalY: character.portrait_focal_y,
        project: homeProject,
        projects,
        stories,
        storyTitles: stories.map((story) => story.title),
        storyCount: stories.length,
        sceneCount: relationshipMaps.sceneCountByCharacter.get(character.id) ?? 0,
        referenceImageCount: relationshipMaps.referenceCountByCharacter.get(character.id) ?? 0,
        assetCount: relationshipMaps.assetCountByCharacter.get(character.id) ?? 0,
        tags: characterTags(character),
        workedAt,
        updatedAt: workedAt,
        href: `/dashboard/characters/${character.id}`,
      } satisfies LibraryCharacterItem;
    })
  );

  return { items };
}

export async function getLibraryStories(): Promise<{
  items: LibraryStoryItem[];
  error?: string;
}> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { items: [], error: "You must be logged in." };

  const projectMap = await loadProjectMap(supabase, user.id);

  const { data, error } = await supabase
    .from("stories")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (error) return { items: [], error: error.message };

  const stories = (data ?? []).map((row) => normalizeStory(row as StoryRow & { project_id?: string }));
  const withCounts = await attachCharacterCounts(supabase, stories);

  const storyIds = withCounts.map((story) => story.id);
  const sceneCountByStory = new Map<string, number>();
  if (storyIds.length > 0) {
    const { data: sceneRows } = await supabase
      .from("scenes")
      .select("story_id")
      .in("story_id", storyIds);
    for (const row of sceneRows ?? []) {
      const storyId = row.story_id as string;
      sceneCountByStory.set(storyId, (sceneCountByStory.get(storyId) ?? 0) + 1);
    }
  }

  const storyMaps = await loadStoryRelationshipMaps(supabase, withCounts);
  const coverUrls = await getStoryCoverUrls(withCounts.map((story) => story.id));
  const projectIdByStory = new Map(
    (data ?? []).map((row) => [row.id as string, (row.project_id as string | null) ?? null])
  );

  const items: LibraryStoryItem[] = withCounts.map((story) => {
    const workedAt = storyMaps.workedAtByStory.get(story.id) ?? story.created_at;
    return {
      id: story.id,
      title: story.title,
      status: story.status,
      project: projectRef(projectMap, projectIdByStory.get(story.id)),
      worldId: story.world_id,
      sceneCount: sceneCountByStory.get(story.id) ?? 0,
      characterCount: story.character_count,
      characterNames: storyMaps.characterNamesByStory.get(story.id) ?? [],
      assetCount: storyMaps.assetCountByStory.get(story.id) ?? 0,
      coverUrl: coverUrls[story.id] ?? null,
      workedAt,
      updatedAt: workedAt,
      href: `/dashboard/worlds/${story.world_id}/stories/${story.id}`,
    };
  });

  return { items };
}

export async function getLibraryScenes(): Promise<{
  items: LibrarySceneItem[];
  error?: string;
}> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { items: [], error: "You must be logged in." };

  const projectMap = await loadProjectMap(supabase, user.id);

  const { data, error } = await supabase
    .from("scenes")
    .select("*, stories(id, title, world_id)")
    .eq("user_id", user.id)
    .order("updated_at", { ascending: false });

  if (error) return { items: [], error: error.message };

  const sceneIds = (data ?? []).map((row) => row.id as string);
  const castByScene = new Map<string, string[]>();

  if (sceneIds.length > 0) {
    const { data: castRows } = await supabase
      .from("scene_characters")
      .select("scene_id, characters(name)")
      .in("scene_id", sceneIds);

    for (const row of castRows ?? []) {
      const sceneId = row.scene_id as string;
      const character = unwrapJoin(row.characters as { name: string } | { name: string }[]);
      if (!character?.name) continue;
      const list = castByScene.get(sceneId) ?? [];
      list.push(character.name);
      castByScene.set(sceneId, list);
    }
  }

  const cache = createSignedUrlCache();
  await signStorageUrls(
    supabase,
    (data ?? []).map((row) => row.cover_image_path as string | null),
    { bucket: CHARACTER_PHOTOS_BUCKET, cache }
  );

  const items: LibrarySceneItem[] = [];
  for (const row of data ?? []) {
    const scene = normalizeScene(row as SceneRow);
    const stories = row.stories as
      | { id: string; title: string; world_id: string }
      | { id: string; title: string; world_id: string }[]
      | null;
    const storyRow = Array.isArray(stories) ? stories[0] : stories;
    if (!storyRow?.world_id) continue;

    const story = storyRef(storyRow.id, storyRow.title, storyRow.world_id);
    const workedAt = scene.updated_at;

    items.push({
      id: scene.id,
      title: scene.title,
      storyTitle: story.title,
      storyId: scene.story_id,
      storyHref: story.href,
      worldId: storyRow.world_id,
      project: projectRef(projectMap, scene.project_id),
      story,
      characterNames: castByScene.get(scene.id) ?? [],
      timelinePosition: scene.sort_order + 1,
      coverUrl: lookupSignedUrl(cache, scene.cover_image_path),
      workedAt,
      updatedAt: workedAt,
      href: `/dashboard/worlds/${storyRow.world_id}/stories/${scene.story_id}/scenes/${scene.id}`,
    });
  }

  return { items };
}

export async function getLibraryAssets(): Promise<{
  items: LibraryAssetItem[];
  error?: string;
}> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { items: [], error: "You must be logged in." };

  const projectMap = await loadProjectMap(supabase, user.id);
  const items: LibraryAssetItem[] = [];
  const cache = createSignedUrlCache();

  const characterIds: string[] = [];
  const worldIds: string[] = [];
  const assetCharacterIdByKey = new Map<string, string>();
  const assetWorldIdByKey = new Map<string, string>();

  const { data: characterImages } = await supabase
    .from("character_images")
    .select("id, image_path, caption, asset_role_label, created_at, characters!inner(id, name, project_id, user_id)")
    .eq("characters.user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(200);

  await signStorageUrls(
    supabase,
    (characterImages ?? []).map((row) => row.image_path as string),
    { bucket: CHARACTER_PHOTOS_BUCKET, cache }
  );

  for (const row of characterImages ?? []) {
    const character = unwrapJoin(
      row.characters as { id: string; name: string; project_id: string | null } | { id: string; name: string; project_id: string | null }[]
    );
    if (!character) continue;
    characterIds.push(character.id);
    const workedAt = row.created_at as string;
    const assetKey = `Character-${row.id as string}`;
    assetCharacterIdByKey.set(assetKey, character.id);
    items.push({
      id: row.id as string,
      name:
        (row.caption as string | null)?.trim() ||
        (row.asset_role_label as string | null)?.trim() ||
        `${character.name} image`,
      thumbnailUrl: lookupSignedUrl(cache, row.image_path as string),
      project: projectRef(projectMap, character.project_id),
      assetType: "Character",
      storyTitles: [],
      storyCount: 0,
      workedAt,
      updatedAt: workedAt,
      href: `/dashboard/characters/${character.id}`,
    });
  }

  const { data: worldImages } = await supabase
    .from("world_images")
    .select("id, image_path, caption, asset_role, created_at, worlds!inner(id, name, project_id, user_id)")
    .eq("worlds.user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(200);

  await signStorageUrls(
    supabase,
    (worldImages ?? []).map((row) => row.image_path as string),
    { bucket: CHARACTER_PHOTOS_BUCKET, cache }
  );

  for (const row of worldImages ?? []) {
    const world = unwrapJoin(
      row.worlds as { id: string; name: string; project_id: string | null } | { id: string; name: string; project_id: string | null }[]
    );
    if (!world) continue;
    worldIds.push(world.id);
    const workedAt = row.created_at as string;
    const assetKey = `Setting-${row.id as string}`;
    assetWorldIdByKey.set(assetKey, world.id);
    items.push({
      id: row.id as string,
      name:
        (row.caption as string | null)?.trim() ||
        (row.asset_role as string | null)?.replace(/_/g, " ") ||
        `${world.name} image`,
      thumbnailUrl: lookupSignedUrl(cache, row.image_path as string),
      project: projectRef(projectMap, world.project_id),
      assetType: "Setting",
      storyTitles: [],
      storyCount: 0,
      workedAt,
      updatedAt: workedAt,
      href: `/dashboard/worlds/${world.id}`,
    });
  }

  const { data: storyImages } = await supabase
    .from("story_images")
    .select("id, image_path, caption, created_at, stories!inner(id, title, world_id, project_id, user_id)")
    .eq("stories.user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(200);

  await signStorageUrls(
    supabase,
    (storyImages ?? []).map((row) => row.image_path as string),
    { bucket: CHARACTER_PHOTOS_BUCKET, cache }
  );

  for (const row of storyImages ?? []) {
    const story = unwrapJoin(
      row.stories as {
        id: string;
        title: string;
        world_id: string;
        project_id: string | null;
      } | {
        id: string;
        title: string;
        world_id: string;
        project_id: string | null;
      }[]
    );
    if (!story) continue;
    const workedAt = row.created_at as string;
    items.push({
      id: row.id as string,
      name: (row.caption as string | null)?.trim() || `${story.title} image`,
      thumbnailUrl: lookupSignedUrl(cache, row.image_path as string),
      project: projectRef(projectMap, story.project_id),
      assetType: "Story",
      storyTitles: [story.title],
      storyCount: 1,
      workedAt,
      updatedAt: workedAt,
      href: `/dashboard/worlds/${story.world_id}/stories/${story.id}`,
    });
  }

  const assetStoryMaps = await loadAssetStoryTitles(
    supabase,
    [...new Set(characterIds)],
    [...new Set(worldIds)],
    []
  );

  for (const item of items) {
    const characterId = assetCharacterIdByKey.get(`${item.assetType}-${item.id}`);
    if (characterId) {
      const titles = assetStoryMaps.titlesByCharacter.get(characterId) ?? [];
      item.storyTitles = titles;
      item.storyCount = titles.length;
      continue;
    }
    const worldId = assetWorldIdByKey.get(`${item.assetType}-${item.id}`);
    if (worldId) {
      const titles = assetStoryMaps.titlesByWorld.get(worldId) ?? [];
      item.storyTitles = titles;
      item.storyCount = titles.length;
    }
  }

  items.sort((a, b) => b.workedAt.localeCompare(a.workedAt));
  return { items };
}

export async function getLibraryReferenceImages(): Promise<{
  items: LibraryReferenceItem[];
  error?: string;
}> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { items: [], error: "You must be logged in." };

  const projectMap = await loadProjectMap(supabase, user.id);

  const { data, error } = await supabase
    .from("character_images")
    .select("*, characters!inner(id, name, project_id, user_id)")
    .eq("characters.user_id", user.id)
    .in("asset_role", ["reference", "canonical"])
    .order("created_at", { ascending: false })
    .limit(200);

  if (error) return { items: [], error: error.message };

  const cache = createSignedUrlCache();
  await signStorageUrls(
    supabase,
    (data ?? []).map((row) => row.image_path as string),
    { bucket: CHARACTER_PHOTOS_BUCKET, cache }
  );

  const items: LibraryReferenceItem[] = [];
  for (const row of data ?? []) {
    const image = normalizeCharacterImage(row as CharacterImageRow);
    const character = unwrapJoin(
      row.characters as { id: string; name: string; project_id: string | null } | { id: string; name: string; project_id: string | null }[]
    );
    if (!character) continue;
    const tags = [image.asset_role_label, image.asset_role]
      .filter((value): value is string => Boolean(value?.trim()))
      .map((value) => value.replace(/_/g, " "));

    const workedAt = image.created_at;
    items.push({
      id: image.id,
      imageUrl: lookupSignedUrl(cache, image.image_path),
      characterId: character.id,
      characterName: character.name,
      characterHref: `/dashboard/characters/${character.id}`,
      project: projectRef(projectMap, character.project_id),
      tags,
      workedAt,
      updatedAt: workedAt,
      href: `/dashboard/characters/${character.id}`,
    });
  }

  return { items };
}

export async function getLibraryContinueCreating(): Promise<{
  items: LibraryContinueItem[];
  error?: string;
}> {
  const [characters, stories, scenes, assets, projectsResult] = await Promise.all([
    getLibraryCharacters(),
    getLibraryStories(),
    getLibraryScenes(),
    getLibraryAssets(),
    getProjects(),
  ]);

  const error =
    characters.error ??
    stories.error ??
    scenes.error ??
    assets.error ??
    projectsResult.error;

  const moments: LibraryContinueItem[] = [];

  for (const item of characters.items) {
    moments.push({
      id: item.id,
      kind: "character",
      title: item.name,
      subtitle: item.project?.title ?? null,
      imageUrl: item.photoUrl,
      portraitFocalY: item.portraitFocalY,
      project: item.project,
      story: item.stories[0] ?? null,
      workedAt: item.workedAt,
      updatedAt: item.workedAt,
      href: item.href,
    });
  }

  for (const item of stories.items) {
    moments.push({
      id: item.id,
      kind: "story",
      title: item.title,
      subtitle: item.project?.title ?? null,
      imageUrl: item.coverUrl,
      project: item.project,
      story: {
        id: item.id,
        title: item.title,
        href: item.href,
      },
      workedAt: item.workedAt,
      updatedAt: item.workedAt,
      href: item.href,
    });
  }

  for (const item of scenes.items) {
    moments.push({
      id: item.id,
      kind: "scene",
      title: item.title,
      subtitle: item.storyTitle,
      imageUrl: item.coverUrl,
      project: item.project,
      story: item.story,
      workedAt: item.workedAt,
      updatedAt: item.workedAt,
      href: item.href,
    });
  }

  for (const item of assets.items) {
    moments.push({
      id: item.id,
      kind: "asset",
      title: item.name,
      subtitle: item.assetType,
      imageUrl: item.thumbnailUrl,
      project: item.project,
      story: null,
      workedAt: item.workedAt,
      updatedAt: item.workedAt,
      href: item.href,
    });
  }

  for (const project of projectsResult.projects) {
    moments.push({
      id: project.id,
      kind: "project",
      title: project.title,
      subtitle: "Project",
      imageUrl: await getProjectCoverUrl(project.cover_image_path),
      project: {
        id: project.id,
        title: project.title,
        href: `/dashboard/projects/${project.id}`,
      },
      story: null,
      workedAt: project.updated_at,
      updatedAt: project.updated_at,
      href: `/dashboard/projects/${project.id}`,
    });
  }

  moments.sort((a, b) => b.workedAt.localeCompare(a.workedAt));

  return { items: moments.slice(0, 24), error };
}

/** @deprecated Use getLibraryContinueCreating */
export async function getLibraryRecent() {
  return getLibraryContinueCreating();
}

export async function searchLibrary(query: string): Promise<LibrarySearchResults> {
  const trimmed = query.trim();
  if (!trimmed) {
    return {
      query: "",
      characters: [],
      stories: [],
      scenes: [],
      assets: [],
      references: [],
      projects: [],
    };
  }

  const [characters, stories, scenes, assets, references, projectsResult] =
    await Promise.all([
      getLibraryCharacters(),
      getLibraryStories(),
      getLibraryScenes(),
      getLibraryAssets(),
      getLibraryReferenceImages(),
      getProjects(),
    ]);

  return {
    query: trimmed,
    characters: characters.items.filter((item) =>
      matchesQuery(
        [item.name, ...item.tags, ...item.storyTitles, item.project?.title],
        trimmed
      )
    ),
    stories: stories.items.filter((item) =>
      matchesQuery(
        [item.title, item.status, ...item.characterNames, item.project?.title],
        trimmed
      )
    ),
    scenes: scenes.items.filter((item) =>
      matchesQuery(
        [item.title, item.storyTitle, ...item.characterNames, item.project?.title],
        trimmed
      )
    ),
    assets: assets.items.filter((item) =>
      matchesQuery(
        [item.name, item.assetType, ...item.storyTitles, item.project?.title],
        trimmed
      )
    ),
    references: references.items.filter((item) =>
      matchesQuery(
        [item.characterName, ...item.tags, item.project?.title],
        trimmed
      )
    ),
    projects: projectsResult.projects
      .filter((project) =>
        matchesQuery([project.title, project.description], trimmed)
      )
      .map((project) => ({
        id: project.id,
        title: project.title,
        href: `/dashboard/projects/${project.id}`,
        updatedAt: project.updated_at,
      })),
  };
}
