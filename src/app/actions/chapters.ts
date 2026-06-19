"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import type { Chapter, ChapterRow } from "@/types/chapter";
import { normalizeChapter } from "@/types/chapter";
import type { Story, StoryRow } from "@/types/story";
import { normalizeStory } from "@/types/story";
import type { World, WorldRow } from "@/types/world";
import { normalizeWorld } from "@/types/world";
import { scanSavedText } from "@/lib/moderation/scan-text";

export type ChapterActionState = {
  error?: string;
  success?: boolean;
  chapter?: Chapter;
};

function formatChapterError(message: string, code?: string): string {
  if (
    code === "PGRST205" ||
    message.includes("schema cache") ||
    message.includes("Could not find")
  ) {
    return (
      "The chapters table is not exposed to the Supabase Data API yet. " +
      "Run supabase/migrations/20250620000000_chapters.sql and " +
      "supabase/fix-chapters-api.sql in the Supabase SQL Editor."
    );
  }
  return message;
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
    return { error: error.message, story: null };
  }
  if (!data) {
    return { error: "Story not found.", story: null };
  }
  return { error: null, story: normalizeStory(data as StoryRow) };
}

async function nextChapterSortOrder(
  supabase: Awaited<ReturnType<typeof createClient>>,
  storyId: string
): Promise<number> {
  const { data } = await supabase
    .from("chapters")
    .select("sort_order")
    .eq("story_id", storyId)
    .order("sort_order", { ascending: false })
    .limit(1)
    .maybeSingle();

  return (data?.sort_order ?? 0) + 1;
}

async function revalidateChapterPaths(
  supabase: Awaited<ReturnType<typeof createClient>>,
  worldId: string,
  story: { id: string; slug: string },
  chapterId?: string,
  worldSlug?: string
): Promise<void> {
  revalidatePath(`/dashboard/worlds/${worldId}/stories/${story.id}`);
  if (chapterId) {
    revalidatePath(
      `/dashboard/worlds/${worldId}/stories/${story.id}/chapters/${chapterId}`
    );
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("username")
    .maybeSingle();

  if (profile?.username && worldSlug) {
    revalidatePath(
      `/u/${profile.username}/worlds/${worldSlug}/stories/${story.slug}`
    );
    if (chapterId) {
      revalidatePath(
        `/u/${profile.username}/worlds/${worldSlug}/stories/${story.slug}/chapters/${chapterId}`
      );
    }
  }
}

export async function getChaptersByStoryId(
  storyId: string
): Promise<{ chapters: Chapter[]; error?: string }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { chapters: [], error: "You must be logged in." };
  }

  const storyCheck = await assertStoryOwner(supabase, storyId, user.id);
  if (storyCheck.error) {
    return { chapters: [], error: storyCheck.error };
  }

  const { data, error } = await supabase
    .from("chapters")
    .select("*")
    .eq("story_id", storyId)
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: true });

  if (error) {
    return {
      chapters: [],
      error: formatChapterError(error.message, error.code),
    };
  }

  return {
    chapters: (data ?? []).map((row) => normalizeChapter(row as ChapterRow)),
  };
}

export async function getChapterById(
  storyId: string,
  chapterId: string
): Promise<{ chapter: Chapter | null; error?: string }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { chapter: null, error: "You must be logged in." };
  }

  const storyCheck = await assertStoryOwner(supabase, storyId, user.id);
  if (storyCheck.error) {
    return { chapter: null, error: storyCheck.error };
  }

  const { data, error } = await supabase
    .from("chapters")
    .select("*")
    .eq("id", chapterId)
    .eq("story_id", storyId)
    .maybeSingle();

  if (error) {
    return {
      chapter: null,
      error: formatChapterError(error.message, error.code),
    };
  }
  if (!data) {
    return { chapter: null };
  }

  return { chapter: normalizeChapter(data as ChapterRow) };
}

export async function createChapter(
  _prev: ChapterActionState,
  formData: FormData
): Promise<ChapterActionState> {
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

  if (!storyId || !title) {
    return { error: "Title is required." };
  }

  const storyCheck = await assertStoryOwner(supabase, storyId, user.id);
  if (storyCheck.error || !storyCheck.story) {
    return { error: storyCheck.error ?? "Story not found." };
  }

  const sortOrder = await nextChapterSortOrder(supabase, storyId);

  const { data: created, error: insertError } = await supabase
    .from("chapters")
    .insert({
      story_id: storyId,
      title,
      content: "",
      sort_order: sortOrder,
    })
    .select("*")
    .single();

  if (insertError || !created) {
    return {
      error: formatChapterError(
        insertError?.message ?? "Failed to create chapter.",
        insertError?.code
      ),
    };
  }

  const chapter = normalizeChapter(created as ChapterRow);

  let worldSlug: string | undefined;
  if (worldId) {
    const { data: worldRow } = await supabase
      .from("worlds")
      .select("slug")
      .eq("id", worldId)
      .maybeSingle();
    worldSlug = worldRow?.slug;
  }

  await revalidateChapterPaths(
    supabase,
    worldId || storyCheck.story.world_id,
    { id: storyCheck.story.id, slug: storyCheck.story.slug },
    chapter.id,
    worldSlug
  );

  return { success: true, chapter };
}

export async function updateChapter(
  _prev: ChapterActionState,
  formData: FormData
): Promise<ChapterActionState> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "You must be logged in." };
  }

  const chapterId = String(formData.get("chapter_id") ?? "").trim();
  const storyId = String(formData.get("story_id") ?? "").trim();
  const worldId = String(formData.get("world_id") ?? "").trim();
  const title = String(formData.get("title") ?? "").trim();
  const content = String(formData.get("content") ?? "");

  if (!chapterId || !storyId || !title) {
    return { error: "Title is required." };
  }

  const storyCheck = await assertStoryOwner(supabase, storyId, user.id);
  if (storyCheck.error || !storyCheck.story) {
    return { error: storyCheck.error ?? "Story not found." };
  }

  const { data: updated, error: updateError } = await supabase
    .from("chapters")
    .update({ title, content })
    .eq("id", chapterId)
    .eq("story_id", storyId)
    .select("*")
    .single();

  if (updateError || !updated) {
    return {
      error: formatChapterError(
        updateError?.message ?? "Failed to save chapter.",
        updateError?.code
      ),
    };
  }

  const chapter = normalizeChapter(updated as ChapterRow);

  void scanSavedText({
    supabase,
    userId: user.id,
    entityType: "chapter",
    entityId: chapterId,
    fields: { title, content },
  });

  let worldSlug: string | undefined;
  if (worldId) {
    const { data: worldRow } = await supabase
      .from("worlds")
      .select("slug")
      .eq("id", worldId)
      .maybeSingle();
    worldSlug = worldRow?.slug;
  }

  await revalidateChapterPaths(
    supabase,
    worldId || storyCheck.story.world_id,
    { id: storyCheck.story.id, slug: storyCheck.story.slug },
    chapter.id,
    worldSlug
  );

  return { success: true, chapter };
}

export async function getPublicChaptersByStory(
  storyId: string
): Promise<Chapter[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("chapters")
    .select("*")
    .eq("story_id", storyId)
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: true });

  if (error) {
    console.error("Failed to fetch public chapters:", error.message);
    return [];
  }

  return (data ?? []).map((row) => normalizeChapter(row as ChapterRow));
}

export async function getPublicChapter(
  username: string,
  worldSlug: string,
  storySlug: string,
  chapterId: string
): Promise<{
  world: World | null;
  story: Story | null;
  chapter: Chapter | null;
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
      chapter: null,
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
      chapter: null,
      profileUsername: profile.username,
    };
  }

  const world = normalizeWorld(worldRow as WorldRow);

  const { data: storyRow } = await supabase
    .from("stories")
    .select("*")
    .eq("world_id", world.id)
    .eq("slug", storySlug)
    .maybeSingle();

  if (!storyRow) {
    return {
      world,
      story: null,
      chapter: null,
      profileUsername: profile.username,
    };
  }

  const story = normalizeStory(storyRow as StoryRow);

  const { data: chapterRow, error: chapterError } = await supabase
    .from("chapters")
    .select("*")
    .eq("id", chapterId)
    .eq("story_id", story.id)
    .maybeSingle();

  if (chapterError) {
    return {
      world,
      story,
      chapter: null,
      profileUsername: profile.username,
      error: formatChapterError(chapterError.message, chapterError.code),
    };
  }

  if (!chapterRow) {
    return {
      world,
      story,
      chapter: null,
      profileUsername: profile.username,
    };
  }

  return {
    world,
    story,
    chapter: normalizeChapter(chapterRow as ChapterRow),
    profileUsername: profile.username,
  };
}
