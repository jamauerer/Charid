"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import type { Character, CharacterRow } from "@/types/character";
import { normalizeCharacter } from "@/types/character";
import type { Story, StoryRow, StoryWithCounts } from "@/types/story";
import {
  normalizeStory,
  parseStoryStatus,
  slugifyStoryTitle,
} from "@/types/story";
import type { World, WorldRow } from "@/types/world";
import { normalizeWorld } from "@/types/world";

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

async function attachCharacterCounts(
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

  const worldId = String(formData.get("world_id") ?? "").trim();
  const title = String(formData.get("title") ?? "").trim();
  const summary = String(formData.get("summary") ?? "").trim() || null;
  const status = parseStoryStatus(formData.get("status"));

  if (!worldId || !title) {
    return { error: "Title is required." };
  }

  const worldCheck = await assertWorldOwner(supabase, worldId, user.id);
  if (worldCheck.error || !worldCheck.world) {
    return { error: worldCheck.error ?? "World not found." };
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

  const { data: created, error: insertError } = await supabase
    .from("stories")
    .insert({
      world_id: worldId,
      user_id: user.id,
      title,
      slug,
      summary,
      status,
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
  await revalidateStoryPaths(supabase, worldId, worldCheck.world.slug, {
    id: story.id,
    slug: story.slug,
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
    .update({ title, summary, status })
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

  if (character.world_id !== storyCheck.story.world_id) {
    return {
      error:
        "Character must belong to this world before joining a story in it.",
    };
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

  const BUCKET = "character-photos";
  const characterPhotos: Record<string, string | null> = {};

  await Promise.all(
    characters.map(async (character) => {
      if (!character.photo_path) {
        characterPhotos[character.id] = null;
        return;
      }
      const { data } = await supabase.storage
        .from(BUCKET)
        .createSignedUrl(character.photo_path, 3600);
      characterPhotos[character.id] = data?.signedUrl ?? null;
    })
  );

  return {
    world,
    story,
    characters,
    characterPhotos,
    profileUsername: profile.username,
  };
}
