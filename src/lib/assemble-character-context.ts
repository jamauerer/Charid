import { assembleReferenceGraph } from "@/lib/assemble-reference-graph";
import { computeCharacterBibleScores } from "@/lib/character-bible-scores";
import type { Character } from "@/types/character";
import type { CharacterBible } from "@/types/character-bible";
import type { CharacterImageWithUrl } from "@/types/character-image";
import {
  referenceGraphNodeToAsset,
  type CharacterContextPacket,
} from "@/types/context-packet";

import type { CharacterImageSlotAssignment } from "@/types/character-image-slot";

export function assembleCharacterContextPacket(
  character: Character,
  bible: CharacterBible,
  images: CharacterImageWithUrl[],
  featuredImageId: string | null = character.featured_image_id,
  slotAssignments: CharacterImageSlotAssignment[] = []
): CharacterContextPacket {
  const graph = assembleReferenceGraph(
    character,
    bible,
    images,
    featuredImageId,
    slotAssignments
  );
  const scores = computeCharacterBibleScores(graph);
  const { descriptors } = graph;

  return {
    kind: "character",
    schemaVersion: "1.0",
    assembledAt: new Date().toISOString(),
    userId: character.user_id,
    characterId: character.id,
    bibleId: bible.character_id,
    versionLabel: bible.version_label,
    identity: {
      name: character.name,
      species: character.species,
      corePersonality: character.core_personality,
      permanentFeatures: character.permanent_features,
      backstory: character.backstory,
      gender: character.gender,
      location: character.location,
    },
    descriptors: {
      identityArchetype: descriptors.identityArchetype,
      creativeFormat: descriptors.creativeFormat,
      age: descriptors.age,
      height: descriptors.height,
      build: descriptors.build,
      hair: descriptors.hair,
      eyes: descriptors.eyes,
      clothing: descriptors.clothing,
      accessories: descriptors.accessories,
      scarsTattoos: descriptors.scarsTattoos,
      otherDetails: descriptors.otherDetails,
    },
    referenceGraph: {
      nodes: graph.nodes.map(referenceGraphNodeToAsset),
      canonicalId: graph.canonicalImageId,
    },
    scores: {
      bibleCompletion: scores.bibleCompletion,
      identityStrength: scores.identityStrength,
      aiReadiness: scores.aiReadiness,
      aiReadinessTier: scores.aiReadinessTier,
      referenceGraphCompletion: scores.referenceGraphCompletion,
    },
    derived: null,
  };
}
