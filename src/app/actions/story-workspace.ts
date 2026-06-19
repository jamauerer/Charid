"use server";

import { getCharacterPhotoUrl } from "@/app/actions/characters";
import { getWorldLocations } from "@/app/actions/world-locations";
import { getWorldMapBundle } from "@/app/actions/world-maps";
import { getWorldMoodboardBundle } from "@/app/actions/world-moodboards";
import { getWorldById } from "@/app/actions/worlds";
import {
  getStoryById,
  getStoryCharacters,
  type StoryCharacterEntry,
} from "@/app/actions/stories";
import { createClient } from "@/lib/supabase/server";
import { relationshipDisplayLabel } from "@/lib/relationship-types";
import {
  normalizeCharacterRelationship,
  type CharacterRelationship,
} from "@/types/character-relationship";
import type { Story } from "@/types/story";
import type { World } from "@/types/world";
import type { WorldLocationWithCover } from "@/types/world-location";
import type { WorldMapBundle } from "@/types/world-map";
import type { WorldMoodboardBundle } from "@/types/world-moodboard";

export type StoryCastBond = {
  relationship: CharacterRelationship;
  fromCharacter: { id: string; name: string; photo_path: string | null };
  toCharacter: { id: string; name: string; photo_path: string | null };
  label: string;
};

export type StoryWorkspaceContext = {
  story: Story;
  world: World;
  cast: StoryCharacterEntry[];
  castPhotoUrls: Record<string, string | null>;
  castBonds: StoryCastBond[];
  bondPhotoUrls: Record<string, string | null>;
  locations: WorldLocationWithCover[];
  mapBundle: WorldMapBundle | null;
  moodboardBundle: WorldMoodboardBundle | null;
  worldbuildingError?: string;
};

function collectWorldbuildingError(
  errors: (string | undefined)[]
): string | undefined {
  const migration = errors.find(
    (e) =>
      e &&
      (e.includes("world_locations") ||
        e.includes("world_maps") ||
        e.includes("world_moodboards") ||
        e.includes("character_relationships") ||
        e.includes("not exposed"))
  );
  return migration;
}

async function getCastBonds(
  rosterIds: string[]
): Promise<{
  bonds: StoryCastBond[];
  photoUrls: Record<string, string | null>;
  error?: string;
}> {
  if (rosterIds.length < 2) {
    return { bonds: [], photoUrls: {} };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { bonds: [], photoUrls: {}, error: "You must be logged in." };
  }

  const rosterSet = new Set(rosterIds);
  const orFilter = rosterIds
    .flatMap((id) => [
      `from_character_id.eq.${id}`,
      `to_character_id.eq.${id}`,
    ])
    .join(",");

  const { data, error } = await supabase
    .from("character_relationships")
    .select("*")
    .eq("user_id", user.id)
    .or(orFilter);

  if (error) {
    const message = error.message;
    if (
      error.code === "PGRST205" ||
      message.includes("schema cache") ||
      message.includes("Could not find")
    ) {
      return {
        bonds: [],
        photoUrls: {},
        error:
          "The character_relationships table is not exposed to the Supabase Data API yet. " +
          "Run supabase/migrations/20250701000000_phase_a_worldbuilding_foundations.sql and " +
          "supabase/fix-worldbuilding-foundations-api.sql in the Supabase SQL Editor.",
      };
    }
    return { bonds: [], photoUrls: {}, error: message };
  }

  const relationships = (data ?? [])
    .map(normalizeCharacterRelationship)
    .filter(
      (rel) =>
        rosterSet.has(rel.from_character_id) &&
        rosterSet.has(rel.to_character_id)
    );

  if (relationships.length === 0) {
    return { bonds: [], photoUrls: {} };
  }

  const characterIds = [
    ...new Set(
      relationships.flatMap((rel) => [
        rel.from_character_id,
        rel.to_character_id,
      ])
    ),
  ];

  const { data: characters } = await supabase
    .from("characters")
    .select("id, name, photo_path")
    .in("id", characterIds);

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

  const bonds: StoryCastBond[] = [];
  for (const relationship of relationships) {
    const fromCharacter = characterMap.get(relationship.from_character_id);
    const toCharacter = characterMap.get(relationship.to_character_id);
    if (!fromCharacter || !toCharacter) continue;

    bonds.push({
      relationship,
      fromCharacter,
      toCharacter,
      label: relationshipDisplayLabel(
        relationship.relationship_type,
        relationship.custom_label,
        "outgoing"
      ),
    });
  }

  const photoUrls: Record<string, string | null> = {};
  await Promise.all(
    characterIds.map(async (id) => {
      const character = characterMap.get(id);
      photoUrls[id] = await getCharacterPhotoUrl(
        character?.photo_path ?? null
      );
    })
  );

  return { bonds, photoUrls };
}

export async function getStoryWorkspaceContext(
  worldId: string,
  storyId: string
): Promise<{ context: StoryWorkspaceContext | null; error?: string }> {
  const { world, error: worldError } = await getWorldById(worldId);
  if (worldError === "You must be logged in.") {
    return { context: null, error: worldError };
  }
  if (!world) {
    return { context: null, error: "World not found." };
  }

  const { story, error: storyError } = await getStoryById(worldId, storyId);
  if (!story) {
    return { context: null, error: "Story not found." };
  }
  if (storyError) {
    return { context: null, error: storyError };
  }

  const { entries: cast } = await getStoryCharacters(storyId);
  const rosterIds = cast.map(({ character }) => character.id);

  const [
    castPhotoUrlsEntries,
    bondsResult,
    locationsResult,
    mapResult,
    moodboardResult,
  ] = await Promise.all([
    Promise.all(
      cast.map(async ({ character }) => ({
        id: character.id,
        url: await getCharacterPhotoUrl(character.photo_path),
      }))
    ),
    getCastBonds(rosterIds),
    getWorldLocations(worldId),
    getWorldMapBundle(worldId),
    getWorldMoodboardBundle(worldId),
  ]);

  const castPhotoUrls = Object.fromEntries(
    castPhotoUrlsEntries.map(({ id, url }) => [id, url])
  );

  const worldbuildingError = collectWorldbuildingError([
    bondsResult.error,
    locationsResult.error,
    mapResult.error,
    moodboardResult.error,
  ]);

  return {
    context: {
      story,
      world,
      cast,
      castPhotoUrls,
      castBonds: bondsResult.bonds,
      bondPhotoUrls: bondsResult.photoUrls,
      locations: locationsResult.locations,
      mapBundle: mapResult.bundle,
      moodboardBundle: moodboardResult.bundle,
      worldbuildingError,
    },
  };
}
