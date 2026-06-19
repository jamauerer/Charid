"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { assembleWorldContextPacket } from "@/lib/assemble-world-context";
import { assembleWorldReferenceGraph } from "@/lib/assemble-world-reference-graph";
import { computeWorldBibleScores } from "@/lib/world-bible-scores";
import { getWorldImages } from "@/app/actions/world-images";
import { getWorldById, getCharactersByWorldId } from "@/app/actions/worlds";
import {
  emptyWorldBible,
  normalizeWorldBible,
  type WorldBible,
  type WorldBibleRow,
} from "@/types/world-bible";
import type { World } from "@/types/world";
import type { WorldImageWithUrl } from "@/types/world-image";
import type { WorldImageSlotAssignment } from "@/types/world-image-slot";
import type { WorldReferenceGraph } from "@/types/world-reference-graph";
import type { WorldBibleScores } from "@/types/world-context-packet";
import type { WorldContextPacket } from "@/types/world-context-packet";
import { scanSavedText } from "@/lib/moderation/scan-text";

export type WorldBibleActionResult = {
  error?: string;
  success?: boolean;
};

export type WorldBibleBundle = {
  world: World;
  bible: WorldBible;
  images: WorldImageWithUrl[];
  slotAssignments: WorldImageSlotAssignment[];
  referenceGraph: WorldReferenceGraph;
  scores: WorldBibleScores;
  contextPacket: WorldContextPacket;
  characterIds: string[];
};

/** Client-safe bundle — excludes contextPacket. */
export type WorldBibleViewBundle = Omit<WorldBibleBundle, "contextPacket" | "characterIds">;

function parseOptionalField(formData: FormData, key: string): string | null {
  const value = String(formData.get(key) ?? "").trim();
  return value || null;
}

function formatWorldBibleError(message: string, code?: string): string {
  if (
    code === "PGRST205" ||
    message.includes("schema cache") ||
    message.includes("Could not find")
  ) {
    return (
      "The world_bible table is not exposed to the Supabase Data API yet. " +
      "Run supabase/migrations/20250627000000_world_bible.sql and " +
      "supabase/fix-world-bible-api.sql in the Supabase SQL Editor."
    );
  }
  return message;
}

async function assertWorldOwner(worldId: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "You must be logged in.", supabase, user: null, world: null };
  }

  const { data: world, error } = await supabase
    .from("worlds")
    .select("*")
    .eq("id", worldId)
    .single();

  if (error || !world) {
    return { error: "World not found.", supabase, user: null, world: null };
  }

  if (world.user_id !== user.id) {
    return {
      error: "You do not have permission to edit this world.",
      supabase,
      user: null,
      world: null,
    };
  }

  return { error: null, supabase, user, world };
}

export async function getWorldBible(
  worldId: string
): Promise<{ bible: WorldBible | null; error?: string }> {
  const auth = await assertWorldOwner(worldId);
  if (auth.error || !auth.supabase || !auth.user) {
    return { bible: null, error: auth.error ?? undefined };
  }

  const { data, error } = await auth.supabase
    .from("world_bible")
    .select("*")
    .eq("world_id", worldId)
    .maybeSingle();

  if (error) {
    return { bible: null, error: formatWorldBibleError(error.message, error.code) };
  }

  if (!data) {
    return { bible: emptyWorldBible(worldId, auth.user.id) };
  }

  return { bible: normalizeWorldBible(data as WorldBibleRow) };
}

export async function ensureWorldBible(
  supabase: Awaited<ReturnType<typeof createClient>>,
  worldId: string,
  userId: string
): Promise<{ error?: string }> {
  const { data: existing } = await supabase
    .from("world_bible")
    .select("world_id")
    .eq("world_id", worldId)
    .maybeSingle();

  if (existing) {
    return {};
  }

  const { error } = await supabase.from("world_bible").insert({
    world_id: worldId,
    user_id: userId,
    version_label: "Current",
    is_current: true,
  });

  if (error) {
    return { error: formatWorldBibleError(error.message, error.code) };
  }

  return {};
}

export async function getWorldBibleBundle(
  worldId: string
): Promise<{ bundle: WorldBibleBundle | null; error?: string }> {
  const { world, error: worldError } = await getWorldById(worldId);
  if (worldError || !world) {
    return { bundle: null, error: worldError ?? "World not found." };
  }

  const { bible, error: bibleError } = await getWorldBible(worldId);
  if (bibleError || !bible) {
    return { bundle: null, error: bibleError ?? "World bible not found." };
  }

  const gallery = await getWorldImages(worldId);
  if (gallery.error) {
    return { bundle: null, error: gallery.error };
  }

  const { characters, error: rosterError } = await getCharactersByWorldId(worldId);
  if (rosterError) {
    return { bundle: null, error: rosterError };
  }

  const characterIds = characters.map((character) => character.id);

  const referenceGraph = assembleWorldReferenceGraph(
    world,
    bible,
    gallery.images,
    gallery.slotAssignments
  );
  const scores = computeWorldBibleScores(referenceGraph);
  const contextPacket = assembleWorldContextPacket(
    world,
    bible,
    gallery.images,
    gallery.slotAssignments,
    characterIds
  );

  return {
    bundle: {
      world,
      bible,
      images: gallery.images,
      slotAssignments: gallery.slotAssignments,
      referenceGraph,
      scores,
      contextPacket,
      characterIds,
    },
    error: gallery.slotError,
  };
}

export async function getWorldContextPacket(
  worldId: string
): Promise<{ packet: WorldContextPacket | null; error?: string }> {
  const { bundle, error } = await getWorldBibleBundle(worldId);
  if (error || !bundle) {
    return { packet: null, error: error ?? "Failed to assemble world context packet." };
  }
  return { packet: bundle.contextPacket };
}

export async function assembleWorldReferenceGraphForWorld(
  worldId: string
): Promise<{ graph: WorldReferenceGraph | null; error?: string }> {
  const { bundle, error } = await getWorldBibleBundle(worldId);
  if (error || !bundle) {
    return { graph: null, error: error ?? "Failed to assemble world reference graph." };
  }
  return { graph: bundle.referenceGraph };
}

export async function saveWorldOverviewSection(
  _prevState: WorldBibleActionResult,
  formData: FormData
): Promise<WorldBibleActionResult> {
  const worldId = String(formData.get("world_id") ?? "").trim();
  if (!worldId) {
    return { error: "World ID is required." };
  }

  const auth = await assertWorldOwner(worldId);
  if (auth.error || !auth.supabase || !auth.user) {
    return { error: auth.error ?? "Unauthorized." };
  }

  const fields = {
    overview: parseOptionalField(formData, "overview"),
    genre: parseOptionalField(formData, "genre"),
    tone: parseOptionalField(formData, "tone"),
    themes: parseOptionalField(formData, "themes"),
  };

  const ensureResult = await ensureWorldBible(
    auth.supabase,
    worldId,
    auth.user.id
  );
  if (ensureResult.error) {
    return { error: ensureResult.error };
  }

  const { error } = await auth.supabase
    .from("world_bible")
    .update({ ...fields, updated_at: new Date().toISOString() })
    .eq("world_id", worldId);

  if (error) {
    return { error: formatWorldBibleError(error.message, error.code) };
  }

  revalidatePath(`/dashboard/worlds/${worldId}`);

  void scanSavedText({
    supabase: auth.supabase,
    userId: auth.user.id,
    entityType: "world",
    entityId: worldId,
    fields: {
      overview: fields.overview,
      genre: fields.genre,
      tone: fields.tone,
      themes: fields.themes,
    },
  });

  return { success: true };
}

export async function saveWorldRulesSection(
  _prevState: WorldBibleActionResult,
  formData: FormData
): Promise<WorldBibleActionResult> {
  const worldId = String(formData.get("world_id") ?? "").trim();
  if (!worldId) {
    return { error: "World ID is required." };
  }

  const auth = await assertWorldOwner(worldId);
  if (auth.error || !auth.supabase || !auth.user) {
    return { error: auth.error ?? "Unauthorized." };
  }

  const fields = {
    rules: parseOptionalField(formData, "rules"),
    era: parseOptionalField(formData, "era"),
    climate: parseOptionalField(formData, "climate"),
  };

  const ensureResult = await ensureWorldBible(
    auth.supabase,
    worldId,
    auth.user.id
  );
  if (ensureResult.error) {
    return { error: ensureResult.error };
  }

  const { error } = await auth.supabase
    .from("world_bible")
    .update({ ...fields, updated_at: new Date().toISOString() })
    .eq("world_id", worldId);

  if (error) {
    return { error: formatWorldBibleError(error.message, error.code) };
  }

  revalidatePath(`/dashboard/worlds/${worldId}`);

  void scanSavedText({
    supabase: auth.supabase,
    userId: auth.user.id,
    entityType: "world",
    entityId: worldId,
    fields: {
      rules: fields.rules,
      era: fields.era,
      climate: fields.climate,
    },
  });

  return { success: true };
}
