"use server";

import { getCharacterPhotoUrl, getCharacters } from "@/app/actions/characters";
import { getStoryCoverUrls } from "@/app/actions/story-images";
import { getStoriesForUser } from "@/app/actions/stories";
import { getWorldCoverUrl, getWorlds } from "@/app/actions/worlds";
import { isAutoProvisionedSetting } from "@/lib/project-setting";

export type HomeStudioItem = {
  id: string;
  type: "story" | "character" | "world";
  title: string;
  subtitle: string | null;
  imageUrl: string | null;
  href: string;
  sortKey: string;
};

export async function getHomeStudioPreview(): Promise<{
  items: HomeStudioItem[];
  error?: string;
}> {
  const [storiesResult, charactersResult, worldsResult] = await Promise.all([
    getStoriesForUser(),
    getCharacters(),
    getWorlds(),
  ]);

  const error =
    storiesResult.error ?? charactersResult.error ?? worldsResult.error;

  const storyCoverUrls = await getStoryCoverUrls(
    storiesResult.entries.slice(0, 4).map((e) => e.story.id)
  );

  const items: HomeStudioItem[] = [];

  for (const { story, world } of storiesResult.entries.slice(0, 4)) {
    items.push({
      id: story.id,
      type: "story",
      title: story.title,
      subtitle: isAutoProvisionedSetting(world) ? null : world.name,
      imageUrl: storyCoverUrls[story.id] ?? null,
      href: `/dashboard/worlds/${world.id}/stories/${story.id}`,
      sortKey: story.created_at,
    });
  }

  for (const world of worldsResult.worlds.slice(0, 3)) {
    items.push({
      id: world.id,
      type: "world",
      title: world.name,
      subtitle: null,
      imageUrl: await getWorldCoverUrl(world.cover_image_path),
      href: `/dashboard/worlds/${world.id}`,
      sortKey: world.created_at,
    });
  }

  for (const character of charactersResult.characters.slice(0, 3)) {
    items.push({
      id: character.id,
      type: "character",
      title: character.name,
      subtitle: character.species,
      imageUrl: await getCharacterPhotoUrl(character.photo_path),
      href: `/dashboard/characters/${character.id}`,
      sortKey: character.created_at,
    });
  }

  items.sort((a, b) => b.sortKey.localeCompare(a.sortKey));

  return { items: items.slice(0, 6), error };
}
