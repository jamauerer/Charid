"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { assembleStoryContextPacket } from "@/lib/assemble-story-context";
import { assembleStoryReferenceGraph } from "@/lib/assemble-story-reference-graph";
import { computeStoryBibleScores } from "@/lib/story-bible-scores";
import { computeStoryBibleRecommendations } from "@/lib/story-bible-recommendations";
import type { StoryBibleRecommendation } from "@/lib/story-bible-recommendations";
import { getStoryImages } from "@/app/actions/story-images";
import { getStoryCharacters } from "@/app/actions/stories";
import { scanSavedText } from "@/lib/moderation/scan-text";
import {
  emptyStoryBible,
  normalizeStoryBible,
  type StoryBible,
  type StoryBibleRow,
} from "@/types/story-bible";
import { normalizeStory, type Story, type StoryRow } from "@/types/story";
import type { StoryImageWithUrl } from "@/types/story-image";
import type { StoryImageSlotAssignment } from "@/types/story-image-slot";
import type { StoryReferenceGraph } from "@/types/story-reference-graph";
import type { StoryBibleScores } from "@/types/story-context-packet";
import type { StoryContextPacket } from "@/types/story-context-packet";

export type StoryBibleActionResult = {
  error?: string;
  success?: boolean;
};

export type StoryBibleBundle = {
  story: Story;
  bible: StoryBible;
  images: StoryImageWithUrl[];
  slotAssignments: StoryImageSlotAssignment[];
  featuredImageId: string | null;
  referenceGraph: StoryReferenceGraph;
  scores: StoryBibleScores;
  recommendations: StoryBibleRecommendation[];
  contextPacket: StoryContextPacket;
  linkedCharacterIds: string[];
};

/** Client-safe bundle — excludes contextPacket and linkedCharacterIds. */
export type StoryBibleViewBundle = Omit<
  StoryBibleBundle,
  "contextPacket" | "linkedCharacterIds"
>;

function parseOptionalField(formData: FormData, key: string): string | null {
  const value = String(formData.get(key) ?? "").trim();
  return value || null;
}

async function revalidateStoryBiblePaths(story: Story) {
  revalidatePath(`/dashboard/worlds/${story.world_id}/stories/${story.id}`);
  revalidatePath(`/dashboard/worlds/${story.world_id}`);
}

function formatStoryBibleError(message: string, code?: string): string {
  if (
    code === "PGRST205" ||
    message.includes("schema cache") ||
    message.includes("Could not find")
  ) {
    return (
      "The story_bible table is not exposed to the Supabase Data API yet. " +
      "Run supabase/migrations/20250631000000_story_bible.sql and " +
      "supabase/fix-story-bible-api.sql in the Supabase SQL Editor."
    );
  }
  return message;
}

async function assertStoryOwner(storyId: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "You must be logged in.", supabase, user: null, story: null };
  }

  const { data: story, error } = await supabase
    .from("stories")
    .select("*")
    .eq("id", storyId)
    .single();

  if (error || !story) {
    return { error: "Story not found.", supabase, user: null, story: null };
  }

  if (story.user_id !== user.id) {
    return {
      error: "You do not have permission to edit this story.",
      supabase,
      user: null,
      story: null,
    };
  }

  return {
    error: null,
    supabase,
    user,
    story: normalizeStory(story as StoryRow),
  };
}

export async function getStoryBible(
  storyId: string
): Promise<{ bible: StoryBible | null; error?: string }> {
  const auth = await assertStoryOwner(storyId);
  if (auth.error || !auth.supabase || !auth.user || !auth.story) {
    return { bible: null, error: auth.error ?? undefined };
  }

  const { data, error } = await auth.supabase
    .from("story_bible")
    .select("*")
    .eq("story_id", storyId)
    .maybeSingle();

  if (error) {
    return { bible: null, error: formatStoryBibleError(error.message, error.code) };
  }

  if (!data) {
    return {
      bible: emptyStoryBible(
        storyId,
        auth.user.id,
        auth.story.summary
      ),
    };
  }

  return { bible: normalizeStoryBible(data as StoryBibleRow) };
}

export async function ensureStoryBible(
  supabase: Awaited<ReturnType<typeof createClient>>,
  storyId: string,
  userId: string,
  summary: string | null = null
): Promise<{ error?: string }> {
  const { data: existing } = await supabase
    .from("story_bible")
    .select("story_id")
    .eq("story_id", storyId)
    .maybeSingle();

  if (existing) {
    return {};
  }

  const { error } = await supabase.from("story_bible").insert({
    story_id: storyId,
    user_id: userId,
    summary,
    version_label: "Current",
    is_current: true,
  });

  if (error) {
    return { error: formatStoryBibleError(error.message, error.code) };
  }

  return {};
}

export async function getStoryBibleBundle(
  storyId: string
): Promise<{ bundle: StoryBibleBundle | null; error?: string }> {
  const auth = await assertStoryOwner(storyId);
  if (auth.error || !auth.story) {
    return { bundle: null, error: auth.error ?? "Story not found." };
  }

  const { bible, error: bibleError } = await getStoryBible(storyId);
  if (bibleError || !bible) {
    return { bundle: null, error: bibleError ?? "Story bible not found." };
  }

  const gallery = await getStoryImages(storyId);
  if (gallery.error) {
    return { bundle: null, error: gallery.error };
  }

  const { entries, error: rosterError } = await getStoryCharacters(storyId);
  if (rosterError) {
    return { bundle: null, error: rosterError };
  }

  const linkedCharacterIds = entries.map((entry) => entry.character_id);

  const referenceGraph = assembleStoryReferenceGraph(
    auth.story,
    bible,
    gallery.images,
    gallery.featuredImageId,
    gallery.slotAssignments
  );
  const scores = computeStoryBibleScores(referenceGraph);
  const recommendations = computeStoryBibleRecommendations(referenceGraph);
  const contextPacket = assembleStoryContextPacket(
    auth.story,
    bible,
    gallery.images,
    gallery.featuredImageId,
    gallery.slotAssignments,
    linkedCharacterIds
  );

  return {
    bundle: {
      story: auth.story,
      bible,
      images: gallery.images,
      slotAssignments: gallery.slotAssignments,
      featuredImageId: gallery.featuredImageId,
      referenceGraph,
      scores,
      recommendations,
      contextPacket,
      linkedCharacterIds,
    },
    error: gallery.slotError,
  };
}

export async function getStoryContextPacket(
  storyId: string
): Promise<{ packet: StoryContextPacket | null; error?: string }> {
  const { bundle, error } = await getStoryBibleBundle(storyId);
  if (error || !bundle) {
    return { packet: null, error: error ?? "Failed to assemble story context packet." };
  }
  return { packet: bundle.contextPacket };
}

export async function assembleStoryReferenceGraphForStory(
  storyId: string
): Promise<{ graph: StoryReferenceGraph | null; error?: string }> {
  const { bundle, error } = await getStoryBibleBundle(storyId);
  if (error || !bundle) {
    return { graph: null, error: error ?? "Failed to assemble story reference graph." };
  }
  return { graph: bundle.referenceGraph };
}

export async function saveStoryOverviewSection(
  _prevState: StoryBibleActionResult,
  formData: FormData
): Promise<StoryBibleActionResult> {
  const storyId = String(formData.get("story_id") ?? "").trim();
  if (!storyId) return { error: "Story ID is required." };

  const auth = await assertStoryOwner(storyId);
  if (auth.error || !auth.supabase || !auth.user || !auth.story) {
    return { error: auth.error ?? "Unauthorized." };
  }

  const fields = {
    summary: parseOptionalField(formData, "summary"),
    themes: parseOptionalField(formData, "themes"),
    tone: parseOptionalField(formData, "tone"),
  };

  const ensureResult = await ensureStoryBible(
    auth.supabase,
    storyId,
    auth.user.id,
    auth.story.summary
  );
  if (ensureResult.error) return { error: ensureResult.error };

  const { error } = await auth.supabase
    .from("story_bible")
    .update({ ...fields, updated_at: new Date().toISOString() })
    .eq("story_id", storyId);

  if (error) {
    return { error: formatStoryBibleError(error.message, error.code) };
  }

  void scanSavedText({
    supabase: auth.supabase,
    userId: auth.user.id,
    entityType: "story_bible",
    entityId: storyId,
    fields,
  });

  await revalidateStoryBiblePaths(auth.story);
  return { success: true };
}

export async function saveStoryTimelineSection(
  _prevState: StoryBibleActionResult,
  formData: FormData
): Promise<StoryBibleActionResult> {
  const storyId = String(formData.get("story_id") ?? "").trim();
  if (!storyId) return { error: "Story ID is required." };

  const auth = await assertStoryOwner(storyId);
  if (auth.error || !auth.supabase || !auth.user || !auth.story) {
    return { error: auth.error ?? "Unauthorized." };
  }

  const timeline = parseOptionalField(formData, "timeline");
  const ensureResult = await ensureStoryBible(
    auth.supabase,
    storyId,
    auth.user.id,
    auth.story.summary
  );
  if (ensureResult.error) return { error: ensureResult.error };

  const { error } = await auth.supabase
    .from("story_bible")
    .update({ timeline, updated_at: new Date().toISOString() })
    .eq("story_id", storyId);

  if (error) {
    return { error: formatStoryBibleError(error.message, error.code) };
  }

  void scanSavedText({
    supabase: auth.supabase,
    userId: auth.user.id,
    entityType: "story_bible",
    entityId: storyId,
    fields: { timeline: timeline ?? "" },
  });

  await revalidateStoryBiblePaths(auth.story);
  return { success: true };
}

export async function saveStoryMajorEventsSection(
  _prevState: StoryBibleActionResult,
  formData: FormData
): Promise<StoryBibleActionResult> {
  const storyId = String(formData.get("story_id") ?? "").trim();
  if (!storyId) return { error: "Story ID is required." };

  const auth = await assertStoryOwner(storyId);
  if (auth.error || !auth.supabase || !auth.user || !auth.story) {
    return { error: auth.error ?? "Unauthorized." };
  }

  const major_events = parseOptionalField(formData, "major_events");
  const ensureResult = await ensureStoryBible(
    auth.supabase,
    storyId,
    auth.user.id,
    auth.story.summary
  );
  if (ensureResult.error) return { error: ensureResult.error };

  const { error } = await auth.supabase
    .from("story_bible")
    .update({ major_events, updated_at: new Date().toISOString() })
    .eq("story_id", storyId);

  if (error) {
    return { error: formatStoryBibleError(error.message, error.code) };
  }

  void scanSavedText({
    supabase: auth.supabase,
    userId: auth.user.id,
    entityType: "story_bible",
    entityId: storyId,
    fields: { major_events: major_events ?? "" },
  });

  await revalidateStoryBiblePaths(auth.story);
  return { success: true };
}

export async function saveStoryLocationsSection(
  _prevState: StoryBibleActionResult,
  formData: FormData
): Promise<StoryBibleActionResult> {
  const storyId = String(formData.get("story_id") ?? "").trim();
  if (!storyId) return { error: "Story ID is required." };

  const auth = await assertStoryOwner(storyId);
  if (auth.error || !auth.supabase || !auth.user || !auth.story) {
    return { error: auth.error ?? "Unauthorized." };
  }

  const key_locations = parseOptionalField(formData, "key_locations");
  const ensureResult = await ensureStoryBible(
    auth.supabase,
    storyId,
    auth.user.id,
    auth.story.summary
  );
  if (ensureResult.error) return { error: ensureResult.error };

  const { error } = await auth.supabase
    .from("story_bible")
    .update({ key_locations, updated_at: new Date().toISOString() })
    .eq("story_id", storyId);

  if (error) {
    return { error: formatStoryBibleError(error.message, error.code) };
  }

  void scanSavedText({
    supabase: auth.supabase,
    userId: auth.user.id,
    entityType: "story_bible",
    entityId: storyId,
    fields: { key_locations: key_locations ?? "" },
  });

  await revalidateStoryBiblePaths(auth.story);
  return { success: true };
}

export async function saveStoryCharactersNotesSection(
  _prevState: StoryBibleActionResult,
  formData: FormData
): Promise<StoryBibleActionResult> {
  const storyId = String(formData.get("story_id") ?? "").trim();
  if (!storyId) return { error: "Story ID is required." };

  const auth = await assertStoryOwner(storyId);
  if (auth.error || !auth.supabase || !auth.user || !auth.story) {
    return { error: auth.error ?? "Unauthorized." };
  }

  const fields = {
    key_characters: parseOptionalField(formData, "key_characters"),
    notes: parseOptionalField(formData, "notes"),
  };

  const ensureResult = await ensureStoryBible(
    auth.supabase,
    storyId,
    auth.user.id,
    auth.story.summary
  );
  if (ensureResult.error) return { error: ensureResult.error };

  const { error } = await auth.supabase
    .from("story_bible")
    .update({ ...fields, updated_at: new Date().toISOString() })
    .eq("story_id", storyId);

  if (error) {
    return { error: formatStoryBibleError(error.message, error.code) };
  }

  void scanSavedText({
    supabase: auth.supabase,
    userId: auth.user.id,
    entityType: "story_bible",
    entityId: storyId,
    fields: {
      key_characters: fields.key_characters ?? "",
      notes: fields.notes ?? "",
    },
  });

  await revalidateStoryBiblePaths(auth.story);
  return { success: true };
}
