"use server";

import { randomUUID } from "crypto";
import { revalidatePath } from "next/cache";
import { getChaptersByStoryId } from "@/app/actions/chapters";
import { getScenesByStoryId } from "@/app/actions/scenes";
import { getStoryBibleBundle } from "@/app/actions/story-bible";
import { getStoryWorkspaceContext } from "@/app/actions/story-workspace";
import {
  assembleSceneSuggestionContext,
} from "@/lib/assemble-scene-suggestion-context";
import {
  generateSceneSuggestionDrafts,
  resolveDraftToPayload,
} from "@/lib/ai/generate-scene-suggestions";
import { commitSceneRecord } from "@/lib/scenes/commit-scene";
import { enforceAiBillingGate } from "@/lib/billing/exempt";
import { consumeCredits } from "@/app/actions/credits";
import { AI_CREDIT_COSTS } from "@/types/credit";
import { createClient } from "@/lib/supabase/server";
import type {
  CreativeProposalBatch,
  CreativeProposalItem,
  ProposalItemStatus,
} from "@/types/creative-proposal";
import type {
  SceneSuggestionBatchView,
  SceneSuggestionItemView,
  SceneSuggestionPayload,
} from "@/types/scene-suggestion";

function resolveLocationDisplay(
  worldLocationId: string | null,
  locationLabel: string | null,
  locationNames: Map<string, string>
): string | null {
  if (worldLocationId) {
    const linked = locationNames.get(worldLocationId);
    if (linked) return linked;
  }
  return locationLabel?.trim() || null;
}

function formatProposalError(message: string, code?: string): string {
  if (
    code === "PGRST205" ||
    message.includes("schema cache") ||
    message.includes("Could not find")
  ) {
    return (
      "Creative proposal staging is not available yet. Run " +
      "supabase/migrations/20250706000000_creative_proposal_staging.sql and " +
      "supabase/fix-creative-proposals-api.sql in the Supabase SQL Editor."
    );
  }
  return message;
}

function revalidateStoryScenes(worldId: string, storyId: string): void {
  revalidatePath(`/dashboard/worlds/${worldId}/stories/${storyId}`);
}

type BatchRow = CreativeProposalBatch<SceneSuggestionPayload>;

function parseItems(raw: unknown): CreativeProposalItem<SceneSuggestionPayload>[] {
  if (!Array.isArray(raw)) return [];
  return raw as CreativeProposalItem<SceneSuggestionPayload>[];
}

function enrichItemView(
  item: CreativeProposalItem<SceneSuggestionPayload>,
  characterNames: Map<string, string>,
  locationNames: Map<string, string>
): SceneSuggestionItemView {
  return {
    ...item,
    character_names: item.payload.character_ids
      .map((id) => characterNames.get(id))
      .filter((n): n is string => Boolean(n)),
    location_display: resolveLocationDisplay(
      item.payload.world_location_id,
      item.payload.location_label,
      locationNames
    ),
  };
}

function batchToView(
  batch: BatchRow,
  characterNames: Map<string, string>,
  locationNames: Map<string, string>
): SceneSuggestionBatchView {
  return {
    id: batch.id,
    story_id: batch.story_id!,
    world_id: batch.world_id,
    chapter_id: batch.chapter_id,
    status: batch.status as "active" | "dismissed",
    items: batch.items
      .filter((item) => item.status === "pending")
      .map((item) => enrichItemView(item, characterNames, locationNames)),
    created_at: batch.created_at,
    updated_at: batch.updated_at,
  };
}

async function loadSuggestionContext(
  worldId: string,
  storyId: string,
  options?: { chapterId?: string; sceneId?: string }
) {
  const { context, error } = await getStoryWorkspaceContext(worldId, storyId);
  if (!context) {
    return { error: error ?? "Could not load story workspace." };
  }

  const { chapters } = await getChaptersByStoryId(storyId);
  const { scenes } = await getScenesByStoryId(storyId);
  const { bundle } = await getStoryBibleBundle(storyId);

  const focusChapter = options?.chapterId
    ? chapters.find((c) => c.id === options.chapterId) ?? null
    : null;

  const focusScene = options?.sceneId
    ? scenes.find((s) => s.id === options.sceneId) ?? null
    : null;

  const suggestionContext = assembleSceneSuggestionContext({
    story: context.story,
    world: context.world,
    cast: context.cast,
    bonds: context.castBonds,
    locations: context.locations,
    chapters,
    scenes,
    focusChapter,
    focusScene,
    storyBibleSummary: bundle?.bible.summary ?? null,
  });

  const characterNames = new Map(
    context.cast.map(({ character }) => [character.id, character.name])
  );
  const locationNames = new Map(
    context.locations.map(({ location }) => [location.id, location.name])
  );

  return {
    context,
    suggestionContext,
    characterNames,
    locationNames,
    chapters,
    scenes,
  };
}

async function getBatchForUser(
  supabase: Awaited<ReturnType<typeof createClient>>,
  batchId: string,
  userId: string
): Promise<{ batch: BatchRow | null; error?: string }> {
  const { data, error } = await supabase
    .from("creative_proposal_batches")
    .select("*")
    .eq("id", batchId)
    .eq("user_id", userId)
    .maybeSingle();

  if (error) {
    return { batch: null, error: formatProposalError(error.message, error.code) };
  }
  if (!data) {
    return { batch: null, error: "Suggestion batch not found." };
  }

  return {
    batch: {
      ...(data as BatchRow),
      items: parseItems(data.items),
    },
  };
}

async function saveBatchItems(
  supabase: Awaited<ReturnType<typeof createClient>>,
  batchId: string,
  items: CreativeProposalItem<SceneSuggestionPayload>[]
): Promise<string | null> {
  const { error } = await supabase
    .from("creative_proposal_batches")
    .update({
      items,
      updated_at: new Date().toISOString(),
    })
    .eq("id", batchId);

  return error ? formatProposalError(error.message, error.code) : null;
}

export async function getActiveSceneSuggestionBatch(
  storyId: string
): Promise<{ batch: SceneSuggestionBatchView | null; error?: string }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { batch: null, error: "You must be logged in." };
  }

  const { data, error } = await supabase
    .from("creative_proposal_batches")
    .select("*")
    .eq("story_id", storyId)
    .eq("user_id", user.id)
    .eq("proposal_kind", "scene_suggestion")
    .eq("status", "active")
    .order("updated_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) {
    return { batch: null, error: formatProposalError(error.message, error.code) };
  }
  if (!data) {
    return { batch: null };
  }

  const batch: BatchRow = {
    ...(data as BatchRow),
    items: parseItems(data.items),
  };

  const pendingCount = batch.items.filter((i) => i.status === "pending").length;
  if (pendingCount === 0) {
    return { batch: null };
  }

  let worldId = batch.world_id;
  if (!worldId && storyId) {
    const { data: storyRow } = await supabase
      .from("stories")
      .select("world_id")
      .eq("id", storyId)
      .maybeSingle();
    worldId = (storyRow?.world_id as string | null) ?? null;
  }

  if (!worldId) {
    return { batch: null };
  }

  const loaded = await loadSuggestionContext(worldId, storyId);
  if ("error" in loaded && loaded.error) {
    return { batch: null, error: loaded.error };
  }

  return {
    batch: batchToView(
      batch,
      loaded.characterNames!,
      loaded.locationNames!
    ),
  };
}

export async function generateSceneSuggestions(input: {
  worldId: string;
  storyId: string;
  chapterId?: string;
  sceneId?: string;
}): Promise<{ batch: SceneSuggestionBatchView | null; error?: string }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { batch: null, error: "You must be logged in." };
  }

  const gate = await enforceAiBillingGate(user.id);
  if (gate.error) {
    return { batch: null, error: gate.error };
  }

  const loaded = await loadSuggestionContext(
    input.worldId,
    input.storyId,
    { chapterId: input.chapterId, sceneId: input.sceneId }
  );
  if ("error" in loaded && loaded.error) {
    return { batch: null, error: loaded.error };
  }

  if (loaded.context!.cast.length === 0) {
    return {
      batch: null,
      error: "Add at least one character to your story before generating scene ideas.",
    };
  }

  await supabase
    .from("creative_proposal_batches")
    .update({
      status: "dismissed",
      updated_at: new Date().toISOString(),
    })
    .eq("story_id", input.storyId)
    .eq("user_id", user.id)
    .eq("proposal_kind", "scene_suggestion")
    .eq("status", "active");

  const { suggestions } = await generateSceneSuggestionDrafts(
    loaded.suggestionContext!
  );

  const items: CreativeProposalItem<SceneSuggestionPayload>[] = suggestions.map(
    (draft, index) => ({
      id: randomUUID(),
      status: "pending" as ProposalItemStatus,
      sort_order: index,
      payload: resolveDraftToPayload(draft, loaded.suggestionContext!),
    })
  );

  const { data: created, error: insertError } = await supabase
    .from("creative_proposal_batches")
    .insert({
      user_id: user.id,
      proposal_kind: "scene_suggestion",
      story_id: input.storyId,
      world_id: input.worldId,
      scene_id: input.sceneId ?? null,
      chapter_id: input.chapterId ?? null,
      status: "active",
      items,
    })
    .select("*")
    .single();

  if (insertError || !created) {
    return {
      batch: null,
      error: formatProposalError(
        insertError?.message ?? "Failed to save suggestions.",
        insertError?.code
      ),
    };
  }

  if (items.length > 0) {
    const consumed = await consumeCredits(
      user.id,
      AI_CREDIT_COSTS.scene_suggestion,
      "ai_usage",
      {
        action: "scene_suggestion",
        story_id: input.storyId,
        world_id: input.worldId,
        batch_id: created.id,
      }
    );
    if (!consumed.success) {
      await supabase
        .from("creative_proposal_batches")
        .delete()
        .eq("id", created.id);
      return {
        batch: null,
        error: consumed.error ?? "Failed to deduct credits.",
      };
    }
  }

  const batch: BatchRow = {
    ...(created as BatchRow),
    items: parseItems(created.items),
  };

  revalidateStoryScenes(input.worldId, input.storyId);

  return {
    batch: batchToView(
      batch,
      loaded.characterNames!,
      loaded.locationNames!
    ),
  };
}

export async function approveSceneSuggestion(input: {
  worldId: string;
  storyId: string;
  batchId: string;
  itemId: string;
}): Promise<{ error?: string }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "You must be logged in." };
  }

  const { batch, error: batchError } = await getBatchForUser(
    supabase,
    input.batchId,
    user.id
  );
  if (batchError || !batch) {
    return { error: batchError ?? "Suggestion batch not found." };
  }

  const itemIndex = batch.items.findIndex((i) => i.id === input.itemId);
  if (itemIndex === -1) {
    return { error: "Suggestion not found." };
  }

  const item = batch.items[itemIndex];
  if (item.status === "approved") {
    return { error: "This scene was already approved." };
  }
  if (item.status === "discarded") {
    return { error: "This suggestion was removed." };
  }

  const { scene, error: commitError } = await commitSceneRecord(supabase, {
    storyId: input.storyId,
    userId: user.id,
    worldId: input.worldId,
    title: item.payload.title,
    summary: item.payload.summary,
    characterIds: item.payload.character_ids,
    locationLabel: item.payload.location_label,
    worldLocationId: item.payload.world_location_id,
  });

  if (commitError || !scene) {
    return { error: commitError ?? "Failed to create scene." };
  }

  const updatedItems = [...batch.items];
  updatedItems[itemIndex] = {
    ...item,
    status: "approved",
    committed_entity_id: scene.id,
  };

  const saveError = await saveBatchItems(supabase, batch.id, updatedItems);
  if (saveError) {
    return { error: saveError };
  }

  revalidateStoryScenes(input.worldId, input.storyId);
  return {};
}

export async function discardSceneSuggestion(input: {
  worldId: string;
  storyId: string;
  batchId: string;
  itemId: string;
}): Promise<{ error?: string }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "You must be logged in." };
  }

  const { batch, error: batchError } = await getBatchForUser(
    supabase,
    input.batchId,
    user.id
  );
  if (batchError || !batch) {
    return { error: batchError ?? "Suggestion batch not found." };
  }

  const updatedItems = batch.items.map((item) =>
    item.id === input.itemId && item.status === "pending"
      ? { ...item, status: "discarded" as ProposalItemStatus }
      : item
  );

  const saveError = await saveBatchItems(supabase, batch.id, updatedItems);
  if (saveError) {
    return { error: saveError };
  }

  revalidateStoryScenes(input.worldId, input.storyId);
  return {};
}

export async function updateSceneSuggestionItem(input: {
  worldId: string;
  storyId: string;
  batchId: string;
  itemId: string;
  payload: SceneSuggestionPayload;
}): Promise<{ error?: string }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "You must be logged in." };
  }

  const { batch, error: batchError } = await getBatchForUser(
    supabase,
    input.batchId,
    user.id
  );
  if (batchError || !batch) {
    return { error: batchError ?? "Suggestion batch not found." };
  }

  const title = input.payload.title.trim();
  const summary = input.payload.summary.trim();
  if (!title) return { error: "Scene title is required." };
  if (!summary) return { error: "What happens in this scene?" };
  if (input.payload.character_ids.length === 0) {
    return { error: "Pick at least one character." };
  }

  const updatedItems = batch.items.map((item) =>
    item.id === input.itemId && item.status === "pending"
      ? {
          ...item,
          payload: {
            title,
            summary,
            character_ids: input.payload.character_ids,
            world_location_id: input.payload.world_location_id,
            location_label: input.payload.location_label,
          },
        }
      : item
  );

  const saveError = await saveBatchItems(supabase, batch.id, updatedItems);
  if (saveError) {
    return { error: saveError };
  }

  revalidateStoryScenes(input.worldId, input.storyId);
  return {};
}

export async function regenerateSceneSuggestionItem(input: {
  worldId: string;
  storyId: string;
  batchId: string;
  itemId: string;
}): Promise<{ error?: string }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "You must be logged in." };
  }

  const gate = await enforceAiBillingGate(user.id);
  if (gate.error) {
    return { error: gate.error };
  }

  const { batch, error: batchError } = await getBatchForUser(
    supabase,
    input.batchId,
    user.id
  );
  if (batchError || !batch) {
    return { error: batchError ?? "Suggestion batch not found." };
  }

  const itemIndex = batch.items.findIndex((i) => i.id === input.itemId);
  if (itemIndex === -1) {
    return { error: "Suggestion not found." };
  }

  const item = batch.items[itemIndex];
  if (item.status !== "pending") {
    return { error: "Only pending suggestions can be regenerated." };
  }

  const loaded = await loadSuggestionContext(
    input.worldId,
    input.storyId,
    { chapterId: batch.chapter_id ?? undefined, sceneId: batch.scene_id ?? undefined }
  );
  if ("error" in loaded && loaded.error) {
    return { error: loaded.error };
  }

  const excludeTitles = [
    ...loaded.scenes!.map((s) => s.title),
    ...batch.items
      .filter((i) => i.status === "pending" && i.id !== input.itemId)
      .map((i) => i.payload.title),
  ];

  const { suggestions } = await generateSceneSuggestionDrafts(
    loaded.suggestionContext!,
    { single: true, excludeTitles }
  );

  if (suggestions.length === 0) {
    return { error: "Could not generate a new suggestion. Try again." };
  }

  const updatedItems = [...batch.items];
  updatedItems[itemIndex] = {
    ...item,
    payload: resolveDraftToPayload(suggestions[0], loaded.suggestionContext!),
  };

  const saveError = await saveBatchItems(supabase, batch.id, updatedItems);
  if (saveError) {
    return { error: saveError };
  }

  const consumed = await consumeCredits(
    user.id,
    AI_CREDIT_COSTS.regenerate_scene_suggestion,
    "ai_usage",
    {
      action: "regenerate_scene_suggestion",
      story_id: input.storyId,
      world_id: input.worldId,
      batch_id: batch.id,
      item_id: input.itemId,
    }
  );
  if (!consumed.success) {
    await saveBatchItems(supabase, batch.id, batch.items);
    return { error: consumed.error ?? "Failed to deduct credits." };
  }

  revalidateStoryScenes(input.worldId, input.storyId);
  return {};
}

export async function dismissSceneSuggestionBatch(input: {
  worldId: string;
  storyId: string;
  batchId: string;
}): Promise<{ error?: string }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "You must be logged in." };
  }

  const { error } = await supabase
    .from("creative_proposal_batches")
    .update({
      status: "dismissed",
      updated_at: new Date().toISOString(),
    })
    .eq("id", input.batchId)
    .eq("user_id", user.id);

  if (error) {
    return { error: formatProposalError(error.message, error.code) };
  }

  revalidateStoryScenes(input.worldId, input.storyId);
  return {};
}
