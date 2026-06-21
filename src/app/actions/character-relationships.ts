"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import {
  createSignedUrlCache,
  lookupSignedUrl,
  signStorageUrls,
} from "@/lib/storage/signed-url";
import {
  isRelationshipType,
  type RelationshipType,
} from "@/lib/relationship-types";
import {
  normalizeCharacterRelationship,
  type CharacterRelationshipEntry,
} from "@/types/character-relationship";

function formatError(message: string, code?: string): string {
  if (
    code === "PGRST205" ||
    message.includes("schema cache") ||
    message.includes("Could not find")
  ) {
    return (
      "The character_relationships table is not exposed to the Supabase Data API yet. " +
      "Run supabase/migrations/20250701000000_phase_a_worldbuilding_foundations.sql and " +
      "supabase/fix-worldbuilding-foundations-api.sql in the Supabase SQL Editor."
    );
  }
  if (message.includes("duplicate key") || message.includes("unique")) {
    return "This relationship already exists between these characters.";
  }
  return message;
}

function revalidateCharacter(characterId: string) {
  revalidatePath(`/dashboard/characters/${characterId}`);
  revalidatePath("/dashboard/characters");
}

async function revalidateStoriesForCharacter(
  characterId: string
): Promise<void> {
  const supabase = await createClient();
  const { data: links } = await supabase
    .from("story_characters")
    .select("story_id, stories(world_id)")
    .eq("character_id", characterId);

  for (const link of links ?? []) {
    const storyId = link.story_id as string;
    const stories = link.stories as
      | { world_id: string }
      | { world_id: string }[]
      | null;
    const worldId = Array.isArray(stories)
      ? stories[0]?.world_id
      : stories?.world_id;
    if (worldId) {
      revalidatePath(`/dashboard/worlds/${worldId}/stories/${storyId}`);
    }
  }
}

export async function getCharacterRelationships(
  characterId: string
): Promise<{ entries: CharacterRelationshipEntry[]; error?: string }> {
  if (!characterId) {
    return { entries: [], error: "Character ID is required." };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { entries: [], error: "You must be logged in." };
  }

  const { data, error } = await supabase
    .from("character_relationships")
    .select("*")
    .eq("user_id", user.id)
    .or(
      `from_character_id.eq.${characterId},to_character_id.eq.${characterId}`
    )
    .order("created_at", { ascending: true });

  if (error) {
    return { entries: [], error: formatError(error.message, error.code) };
  }

  const relationships = (data ?? []).map(normalizeCharacterRelationship);
  const otherIds = [
    ...new Set(
      relationships.map((rel) =>
        rel.from_character_id === characterId
          ? rel.to_character_id
          : rel.from_character_id
      )
    ),
  ];

  if (otherIds.length === 0) {
    return { entries: [] };
  }

  const { data: characters } = await supabase
    .from("characters")
    .select("id, name, photo_path")
    .in("id", otherIds);

  const characterMap = new Map(
    (characters ?? []).map((c) => [
      c.id as string,
      {
        id: c.id as string,
        name: c.name as string,
        photo_path: (c.photo_path as string | null) ?? null,
      },
    ])
  );

  const entries: CharacterRelationshipEntry[] = [];
  for (const relationship of relationships) {
    const outgoing = relationship.from_character_id === characterId;
    const otherId = outgoing
      ? relationship.to_character_id
      : relationship.from_character_id;
    const otherCharacter = characterMap.get(otherId);
    if (!otherCharacter) continue;

    entries.push({
      relationship,
      direction: outgoing ? "outgoing" : "incoming",
      otherCharacter,
    });
  }

  return { entries };
}

export async function createCharacterRelationship(input: {
  fromCharacterId: string;
  toCharacterId: string;
  relationshipType: RelationshipType;
  customLabel?: string | null;
  notes?: string | null;
}): Promise<{ error?: string; success?: boolean }> {
  const {
    fromCharacterId,
    toCharacterId,
    relationshipType,
    customLabel,
    notes,
  } = input;

  if (!fromCharacterId || !toCharacterId) {
    return { error: "Both characters are required." };
  }
  if (fromCharacterId === toCharacterId) {
    return { error: "A character cannot have a relationship with themselves." };
  }
  if (!isRelationshipType(relationshipType)) {
    return { error: "Invalid relationship type." };
  }
  if (relationshipType === "custom" && !customLabel?.trim()) {
    return { error: "Enter a label for custom relationships." };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "You must be logged in." };
  }

  const { data: owned } = await supabase
    .from("characters")
    .select("id, project_id")
    .eq("user_id", user.id)
    .in("id", [fromCharacterId, toCharacterId]);

  if ((owned ?? []).length !== 2) {
    return { error: "Both characters must belong to you." };
  }

  const fromChar = owned?.find((c) => c.id === fromCharacterId);
  const toChar = owned?.find((c) => c.id === toCharacterId);
  const projectId =
    (fromChar?.project_id as string | null) ??
    (toChar?.project_id as string | null) ??
    null;

  const { error } = await supabase.from("character_relationships").insert({
    user_id: user.id,
    project_id: projectId,
    from_character_id: fromCharacterId,
    to_character_id: toCharacterId,
    relationship_type: relationshipType,
    custom_label: customLabel?.trim() || null,
    notes: notes?.trim() || null,
  });

  if (error) {
    return { error: formatError(error.message, error.code) };
  }

  revalidateCharacter(fromCharacterId);
  revalidateCharacter(toCharacterId);
  await revalidateStoriesForCharacter(fromCharacterId);
  await revalidateStoriesForCharacter(toCharacterId);
  if (projectId) {
    revalidatePath(`/dashboard/projects/${projectId}`);
    revalidatePath("/dashboard/projects");
  }
  return { success: true };
}

export async function deleteCharacterRelationship(
  relationshipId: string,
  characterId: string
): Promise<{ error?: string; success?: boolean }> {
  if (!relationshipId) {
    return { error: "Relationship ID is required." };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "You must be logged in." };
  }

  const { data: existing } = await supabase
    .from("character_relationships")
    .select("from_character_id, to_character_id")
    .eq("id", relationshipId)
    .eq("user_id", user.id)
    .maybeSingle();

  if (!existing) {
    return { error: "Relationship not found." };
  }

  const { error } = await supabase
    .from("character_relationships")
    .delete()
    .eq("id", relationshipId)
    .eq("user_id", user.id);

  if (error) {
    return { error: formatError(error.message, error.code) };
  }

  revalidateCharacter(characterId);
  revalidateCharacter(existing.from_character_id as string);
  revalidateCharacter(existing.to_character_id as string);
  await revalidateStoriesForCharacter(existing.from_character_id as string);
  await revalidateStoriesForCharacter(existing.to_character_id as string);
  return { success: true };
}

export async function getRelationshipPhotoUrls(
  entries: CharacterRelationshipEntry[]
): Promise<Record<string, string | null>> {
  if (entries.length === 0) {
    return {};
  }

  const supabase = await createClient();
  const cache = createSignedUrlCache();
  await signStorageUrls(
    supabase,
    entries.map((entry) => entry.otherCharacter.photo_path),
    { cache }
  );

  const urls: Record<string, string | null> = {};
  for (const entry of entries) {
    urls[entry.otherCharacter.id] = lookupSignedUrl(
      cache,
      entry.otherCharacter.photo_path
    );
  }
  return urls;
}
