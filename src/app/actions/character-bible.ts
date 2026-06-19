"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { assembleCharacterContextPacket } from "@/lib/assemble-character-context";
import { assembleReferenceGraph } from "@/lib/assemble-reference-graph";
import { computeCharacterBibleScores } from "@/lib/character-bible-scores";
import {
  computeBibleRecommendations,
  type BibleRecommendation,
} from "@/lib/character-bible-recommendations";
import { getCharacterImages } from "@/app/actions/character-images";
import { getCharacterById } from "@/app/actions/characters";
import {
  emptyCharacterBible,
  normalizeCharacterBible,
  type CharacterBible,
  type CharacterBibleRow,
} from "@/types/character-bible";
import type { CharacterBibleScores } from "@/types/context-packet";
import type { CharacterContextPacket } from "@/types/context-packet";
import type { ReferenceGraph } from "@/types/reference-graph";
import { parseIdentityArchetype } from "@/types/identity-archetype";
import type { CharacterImageWithUrl } from "@/types/character-image";
import type { CharacterImageSlotAssignment } from "@/types/character-image-slot";
import { scanSavedText } from "@/lib/moderation/scan-text";
import type { Character } from "@/types/character";

export type CharacterBibleActionResult = {
  error?: string;
  success?: boolean;
};

export type CharacterBibleBundle = {
  character: Character;
  bible: CharacterBible;
  images: CharacterImageWithUrl[];
  slotAssignments: CharacterImageSlotAssignment[];
  referenceGraph: ReferenceGraph;
  scores: CharacterBibleScores;
  recommendations: BibleRecommendation[];
  contextPacket: CharacterContextPacket;
};

/** Client-safe bundle — excludes contextPacket. */
export type CharacterBibleViewBundle = Omit<CharacterBibleBundle, "contextPacket">;

function formatBibleError(message: string, code?: string): string {
  if (
    code === "PGRST205" ||
    message.includes("schema cache") ||
    message.includes("Could not find")
  ) {
    return (
      "The character_bible table is not exposed to the Supabase Data API yet. " +
      "Run supabase/migrations/20250623000000_character_bible.sql and " +
      "supabase/fix-character-bible-api.sql in the Supabase SQL Editor."
    );
  }
  return message;
}

function parseOptionalField(formData: FormData, key: string): string | null {
  const value = String(formData.get(key) ?? "").trim();
  return value || null;
}

function parseBibleFields(formData: FormData) {
  return {
    identity_archetype: parseIdentityArchetype(formData.get("identity_archetype")),
    creative_format: parseOptionalField(formData, "creative_format"),
    age: parseOptionalField(formData, "age"),
    height: parseOptionalField(formData, "height"),
    build: parseOptionalField(formData, "build"),
    hair: parseOptionalField(formData, "hair"),
    eyes: parseOptionalField(formData, "eyes"),
    clothing: parseOptionalField(formData, "clothing"),
    accessories: parseOptionalField(formData, "accessories"),
    scars_tattoos: parseOptionalField(formData, "scars_tattoos"),
    other_details: parseOptionalField(formData, "other_details"),
  };
}

async function assertCharacterOwner(characterId: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "You must be logged in.", supabase, user: null, character: null };
  }

  const { data: character, error } = await supabase
    .from("characters")
    .select("*")
    .eq("id", characterId)
    .single();

  if (error || !character) {
    return { error: "Character not found.", supabase, user: null, character: null };
  }

  if (character.user_id !== user.id) {
    return {
      error: "You do not have permission to edit this character.",
      supabase,
      user: null,
      character: null,
    };
  }

  return { error: null, supabase, user, character };
}

export async function getCharacterBible(
  characterId: string
): Promise<{ bible: CharacterBible | null; error?: string }> {
  const auth = await assertCharacterOwner(characterId);
  if (auth.error || !auth.supabase || !auth.user) {
    return { bible: null, error: auth.error ?? undefined };
  }

  const { data, error } = await auth.supabase
    .from("character_bible")
    .select("*")
    .eq("character_id", characterId)
    .maybeSingle();

  if (error) {
    return { bible: null, error: formatBibleError(error.message, error.code) };
  }

  if (!data) {
    return { bible: emptyCharacterBible(characterId, auth.user.id) };
  }

  return { bible: normalizeCharacterBible(data as CharacterBibleRow) };
}

export async function ensureCharacterBible(
  supabase: Awaited<ReturnType<typeof createClient>>,
  characterId: string,
  userId: string,
  partial?: Partial<{
    age: string | null;
    identity_archetype: string;
  }>
): Promise<{ error?: string }> {
  const { data: existing } = await supabase
    .from("character_bible")
    .select("character_id")
    .eq("character_id", characterId)
    .maybeSingle();

  if (existing) {
    if (partial?.age !== undefined) {
      const { error } = await supabase
        .from("character_bible")
        .update({ age: partial.age, updated_at: new Date().toISOString() })
        .eq("character_id", characterId);
      if (error) return { error: error.message };
    }
    return {};
  }

  const { error } = await supabase.from("character_bible").insert({
    character_id: characterId,
    user_id: userId,
    identity_archetype: partial?.identity_archetype ?? "humanoid_stylized",
    version_label: "Current",
    is_current: true,
    age: partial?.age ?? null,
  });

  if (error) {
    return { error: formatBibleError(error.message, error.code) };
  }

  return {};
}

export async function updateCharacterBible(
  _prevState: CharacterBibleActionResult,
  formData: FormData
): Promise<CharacterBibleActionResult> {
  const characterId = String(formData.get("character_id") ?? "").trim();
  if (!characterId) {
    return { error: "Character ID is required." };
  }

  const auth = await assertCharacterOwner(characterId);
  if (auth.error || !auth.supabase || !auth.user) {
    return { error: auth.error ?? "Unauthorized." };
  }

  const fields = parseBibleFields(formData);
  const now = new Date().toISOString();

  const ensureResult = await ensureCharacterBible(
    auth.supabase,
    characterId,
    auth.user.id
  );
  if (ensureResult.error) {
    return { error: ensureResult.error };
  }

  const { error } = await auth.supabase
    .from("character_bible")
    .update({ ...fields, updated_at: now })
    .eq("character_id", characterId);

  if (error) {
    return { error: formatBibleError(error.message, error.code) };
  }

  revalidatePath(`/dashboard/characters/${characterId}`);
  return { success: true };
}

export async function saveCharacterIdentitySection(
  _prevState: CharacterBibleActionResult,
  formData: FormData
): Promise<CharacterBibleActionResult> {
  const characterId = String(formData.get("character_id") ?? "").trim();
  if (!characterId) {
    return { error: "Character ID is required." };
  }

  const auth = await assertCharacterOwner(characterId);
  if (auth.error || !auth.supabase || !auth.user) {
    return { error: auth.error ?? "Unauthorized." };
  }

  const name = String(formData.get("name") ?? "").trim();
  if (!name) {
    return { error: "Character name is required." };
  }

  const characterFields = {
    name,
    gender: parseOptionalField(formData, "gender"),
    species: parseOptionalField(formData, "species"),
    core_personality: parseOptionalField(formData, "core_personality"),
    permanent_features: parseOptionalField(formData, "permanent_features"),
    location: parseOptionalField(formData, "location"),
    backstory: parseOptionalField(formData, "backstory"),
    is_public: formData.get("is_public") === "true",
  };

  const bibleFields = {
    identity_archetype: parseIdentityArchetype(formData.get("identity_archetype")),
    creative_format: parseOptionalField(formData, "creative_format"),
  };

  const { error: characterError } = await auth.supabase
    .from("characters")
    .update(characterFields)
    .eq("id", characterId);

  if (characterError) {
    return { error: formatBibleError(characterError.message, characterError.code) };
  }

  const ensureResult = await ensureCharacterBible(
    auth.supabase,
    characterId,
    auth.user.id
  );
  if (ensureResult.error) {
    return { error: ensureResult.error };
  }

  const { error: bibleError } = await auth.supabase
    .from("character_bible")
    .update({ ...bibleFields, updated_at: new Date().toISOString() })
    .eq("character_id", characterId);

  if (bibleError) {
    return { error: formatBibleError(bibleError.message, bibleError.code) };
  }

  revalidatePath("/dashboard");
  revalidatePath("/dashboard/characters");
  revalidatePath(`/dashboard/characters/${characterId}`);
  revalidatePath("/dashboard/portfolio");

  void scanSavedText({
    supabase: auth.supabase,
    userId: auth.user.id,
    entityType: "character",
    entityId: characterId,
    fields: {
      name: characterFields.name,
      gender: characterFields.gender,
      species: characterFields.species,
      core_personality: characterFields.core_personality,
      permanent_features: characterFields.permanent_features,
      location: characterFields.location,
      backstory: characterFields.backstory,
    },
  });

  return { success: true };
}

export async function saveCharacterDetailsSection(
  _prevState: CharacterBibleActionResult,
  formData: FormData
): Promise<CharacterBibleActionResult> {
  const characterId = String(formData.get("character_id") ?? "").trim();
  if (!characterId) {
    return { error: "Character ID is required." };
  }

  const auth = await assertCharacterOwner(characterId);
  if (auth.error || !auth.supabase || !auth.user) {
    return { error: auth.error ?? "Unauthorized." };
  }

  const fields = {
    age: parseOptionalField(formData, "age"),
    height: parseOptionalField(formData, "height"),
    build: parseOptionalField(formData, "build"),
    hair: parseOptionalField(formData, "hair"),
    eyes: parseOptionalField(formData, "eyes"),
    clothing: parseOptionalField(formData, "clothing"),
    accessories: parseOptionalField(formData, "accessories"),
    scars_tattoos: parseOptionalField(formData, "scars_tattoos"),
    other_details: parseOptionalField(formData, "other_details"),
  };

  const ensureResult = await ensureCharacterBible(
    auth.supabase,
    characterId,
    auth.user.id
  );
  if (ensureResult.error) {
    return { error: ensureResult.error };
  }

  const { error } = await auth.supabase
    .from("character_bible")
    .update({ ...fields, updated_at: new Date().toISOString() })
    .eq("character_id", characterId);

  if (error) {
    return { error: formatBibleError(error.message, error.code) };
  }

  revalidatePath(`/dashboard/characters/${characterId}`);

  void scanSavedText({
    supabase: auth.supabase,
    userId: auth.user.id,
    entityType: "character_bible",
    entityId: characterId,
    fields,
  });

  return { success: true };
}

export async function getCharacterBibleBundle(
  characterId: string
): Promise<{ bundle: CharacterBibleBundle | null; error?: string }> {
  const { character, error: characterError } = await getCharacterById(characterId);
  if (characterError || !character) {
    return { bundle: null, error: characterError ?? "Character not found." };
  }

  const { bible, error: bibleError } = await getCharacterBible(characterId);
  if (bibleError || !bible) {
    return { bundle: null, error: bibleError ?? "Character bible not found." };
  }

  const gallery = await getCharacterImages(characterId);
  if (gallery.error) {
    return { bundle: null, error: gallery.error };
  }

  const referenceGraph = assembleReferenceGraph(
    character,
    bible,
    gallery.images,
    gallery.featuredImageId,
    gallery.slotAssignments
  );
  const scores = computeCharacterBibleScores(referenceGraph);
  const recommendations = computeBibleRecommendations(referenceGraph);
  const contextPacket = assembleCharacterContextPacket(
    character,
    bible,
    gallery.images,
    gallery.featuredImageId,
    gallery.slotAssignments
  );

  return {
    bundle: {
      character,
      bible,
      images: gallery.images,
      slotAssignments: gallery.slotAssignments,
      referenceGraph,
      scores,
      recommendations,
      contextPacket,
    },
    error: gallery.slotError,
  };
}

export async function getCharacterContextPacket(
  characterId: string
): Promise<{ packet: CharacterContextPacket | null; error?: string }> {
  const { bundle, error } = await getCharacterBibleBundle(characterId);
  if (error || !bundle) {
    return { packet: null, error: error ?? "Failed to assemble context packet." };
  }
  return { packet: bundle.contextPacket };
}

export async function getPublicCharacterBibleAge(
  characterId: string
): Promise<string | null> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("character_bible")
    .select("age")
    .eq("character_id", characterId)
    .eq("is_current", true)
    .maybeSingle();

  return data?.age ?? null;
}
