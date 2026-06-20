"use server";

import { getProjectCoverUrl, getProjects } from "@/app/actions/projects";
import { getCharacterPhotoUrl, getCharacters } from "@/app/actions/characters";
import { getStoryCoverUrls } from "@/app/actions/story-images";
import { getStoriesForUser } from "@/app/actions/stories";
import { getWorldCoverUrl, getWorlds } from "@/app/actions/worlds";
import { isAutoProvisionedSetting } from "@/lib/project-setting";
import { createClient } from "@/lib/supabase/server";
import type { ProjectWithCounts } from "@/types/project";

export type HomeProjectEntry = {
  project: ProjectWithCounts;
  coverUrl: string | null;
};

export type HomeCreativeMoment = {
  id: string;
  kind: "scene" | "chapter" | "story" | "character" | "world";
  title: string;
  subtitle: string | null;
  imageUrl: string | null;
  href: string;
  sortKey: string;
};

export type HomePageData = {
  isFirstTime: boolean;
  projects: HomeProjectEntry[];
  latestProject: HomeProjectEntry | null;
  creativeMoments: HomeCreativeMoment[];
  error?: string;
};

async function fetchCreativeMoments(): Promise<HomeCreativeMoment[]> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return [];

  const moments: HomeCreativeMoment[] = [];

  const { data: scenes } = await supabase
    .from("scenes")
    .select("id, title, story_id, updated_at, stories(world_id, title)")
    .eq("user_id", user.id)
    .order("updated_at", { ascending: false })
    .limit(4);

  for (const row of scenes ?? []) {
    const stories = row.stories as
      | { world_id: string; title: string }
      | { world_id: string; title: string }[]
      | null;
    const story = Array.isArray(stories) ? stories[0] : stories;
    if (!story?.world_id) continue;

    const storyCoverUrls = await getStoryCoverUrls([row.story_id as string]);

    moments.push({
      id: row.id as string,
      kind: "scene",
      title: row.title as string,
      subtitle: story.title,
      imageUrl: storyCoverUrls[row.story_id as string] ?? null,
      href: `/dashboard/worlds/${story.world_id}/stories/${row.story_id}/scenes/${row.id}`,
      sortKey: row.updated_at as string,
    });
  }

  const storiesResult = await getStoriesForUser();
  const storyIds = new Set(storiesResult.entries.map((e) => e.story.id));

  const { data: chapters } = await supabase
    .from("chapters")
    .select("id, title, story_id, created_at, stories(world_id, title)")
    .order("created_at", { ascending: false })
    .limit(12);

  let chapterCount = 0;
  for (const row of chapters ?? []) {
    if (!storyIds.has(row.story_id as string)) continue;
    const stories = row.stories as
      | { world_id: string; title: string }
      | { world_id: string; title: string }[]
      | null;
    const story = Array.isArray(stories) ? stories[0] : stories;
    if (!story?.world_id) continue;

    moments.push({
      id: row.id as string,
      kind: "chapter",
      title: row.title as string,
      subtitle: story.title,
      imageUrl: null,
      href: `/dashboard/worlds/${story.world_id}/stories/${row.story_id}/chapters/${row.id}`,
      sortKey: row.created_at as string,
    });
    chapterCount += 1;
    if (chapterCount >= 4) break;
  }

  const [charactersResult, worldsResult] = await Promise.all([
    getCharacters(),
    getWorlds(),
  ]);

  const storyCoverUrls = await getStoryCoverUrls(
    storiesResult.entries.slice(0, 3).map((e) => e.story.id)
  );

  for (const { story, world } of storiesResult.entries.slice(0, 3)) {
    moments.push({
      id: story.id,
      kind: "story",
      title: story.title,
      subtitle: isAutoProvisionedSetting(world) ? null : world.name,
      imageUrl: storyCoverUrls[story.id] ?? null,
      href: `/dashboard/worlds/${world.id}/stories/${story.id}`,
      sortKey: story.created_at,
    });
  }

  for (const character of charactersResult.characters.slice(0, 2)) {
    moments.push({
      id: character.id,
      kind: "character",
      title: character.name,
      subtitle: character.species,
      imageUrl: await getCharacterPhotoUrl(character.photo_path),
      href: `/dashboard/characters/${character.id}`,
      sortKey: character.created_at,
    });
  }

  for (const world of worldsResult.worlds.slice(0, 2)) {
    moments.push({
      id: world.id,
      kind: "world",
      title: world.name,
      subtitle: null,
      imageUrl: await getWorldCoverUrl(world.cover_image_path),
      href: `/dashboard/worlds/${world.id}`,
      sortKey: world.created_at,
    });
  }

  moments.sort((a, b) => b.sortKey.localeCompare(a.sortKey));
  return moments.slice(0, 6);
}

export async function getHomePageData(): Promise<HomePageData> {
  const { projects, error } = await getProjects();

  const sorted = [...projects].sort(
    (a, b) => b.updated_at.localeCompare(a.updated_at)
  );

  const projectEntries: HomeProjectEntry[] = await Promise.all(
    sorted.map(async (project) => ({
      project,
      coverUrl: await getProjectCoverUrl(project.cover_image_path),
    }))
  );

  const isFirstTime = projectEntries.length === 0;
  const latestProject = projectEntries[0] ?? null;

  const creativeMoments = isFirstTime ? [] : await fetchCreativeMoments();

  return {
    isFirstTime,
    projects: projectEntries,
    latestProject,
    creativeMoments,
    error,
  };
}
