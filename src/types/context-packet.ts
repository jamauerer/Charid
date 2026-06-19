import type { ReferenceGraphNode } from "@/types/reference-graph";

export type AiReadinessTier =
  | "started"
  | "developing"
  | "growing"
  | "strong"
  | "ai_ready";

export type CharacterBibleScores = {
  referenceGraphCompletion: number;
  bibleCompletion: number;
  identityStrength: number;
  aiReadiness: number;
  aiReadinessTier: AiReadinessTier;
};

export type ReadinessScores = {
  bibleCompletion: number;
  identityStrength: number;
  aiReadiness: number;
  aiReadinessTier: AiReadinessTier;
  referenceGraphCompletion: number;
};

export type ReferenceAsset = {
  id: string;
  assetRoleOrType: string;
  assetRoleLabel: string | null;
  caption: string | null;
  url: string | null;
  sortOrder: number;
};

export type CharacterContextPacket = {
  kind: "character";
  schemaVersion: "1.0";
  assembledAt: string;
  userId: string;
  characterId: string;
  bibleId: string;
  versionLabel: string;

  identity: {
    name: string;
    species: string | null;
    corePersonality: string | null;
    permanentFeatures: string | null;
    backstory: string | null;
    gender: string | null;
    location: string | null;
  };

  descriptors: {
    identityArchetype: string;
    creativeFormat: string | null;
    age: string | null;
    height: string | null;
    build: string | null;
    hair: string | null;
    eyes: string | null;
    clothing: string | null;
    accessories: string | null;
    scarsTattoos: string | null;
    otherDetails: string | null;
  };

  referenceGraph: {
    nodes: ReferenceAsset[];
    canonicalId: string | null;
  };

  scores: ReadinessScores;

  /** RFIM Pillar C — populated by Identity Layer Phase 1 */
  derived: null;
};

export function referenceGraphNodeToAsset(
  node: ReferenceGraphNode
): ReferenceAsset {
  return {
    id: node.imageId,
    assetRoleOrType: node.assetRole,
    assetRoleLabel: node.assetRoleLabel,
    caption: null,
    url: node.url,
    sortOrder: node.sortOrder,
  };
}
