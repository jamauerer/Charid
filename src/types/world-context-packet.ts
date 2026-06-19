import type { AiReadinessTier, ReferenceAsset } from "@/types/context-packet";
import type { WorldReferenceGraphNode } from "@/types/world-reference-graph";

export type WorldBibleScores = {
  referenceGraphCompletion: number;
  worldCompletion: number;
  worldConsistency: number;
  aiReadiness: number;
  aiReadinessTier: AiReadinessTier;
};

export type WorldReadinessScores = {
  worldCompletion: number;
  worldConsistency: number;
  aiReadiness: number;
  aiReadinessTier: AiReadinessTier;
  referenceGraphCompletion: number;
};

export type WorldLocationReference = {
  id: string;
  assetRole: string;
  caption: string | null;
  url: string | null;
  description: string | null;
};

export type WorldContextPacket = {
  kind: "world";
  schemaVersion: "1.0";
  assembledAt: string;
  userId: string;
  worldId: string;
  bibleId: string;
  versionLabel: string;

  identity: {
    name: string;
    slug: string;
    description: string | null;
    genre: string | null;
    tone: string | null;
    themes: string | null;
    overview: string | null;
  };

  canon: {
    rules: string | null;
    era: string | null;
    climate: string | null;
  };

  locations: {
    references: WorldLocationReference[];
    descriptions: string | null;
  };

  assets: {
    maps: ReferenceAsset[];
    environmentReferences: ReferenceAsset[];
    architectureReferences: ReferenceAsset[];
    moodBoards: ReferenceAsset[];
    canonicalReference: ReferenceAsset | null;
    gallery: ReferenceAsset[];
  };

  referenceGraph: {
    nodes: ReferenceAsset[];
    canonicalMapId: string | null;
    canonicalReferenceId: string | null;
  };

  scores: WorldReadinessScores;

  roster: {
    characterIds: string[];
  };

  derived: null;
};

export function worldReferenceGraphNodeToAsset(
  node: WorldReferenceGraphNode
): ReferenceAsset {
  return {
    id: node.imageId,
    assetRoleOrType: node.assetRole,
    assetRoleLabel: node.assetRoleLabel,
    caption: node.caption,
    url: node.url,
    sortOrder: node.sortOrder,
  };
}

export function worldLocationFromNode(
  node: WorldReferenceGraphNode
): WorldLocationReference {
  return {
    id: node.imageId,
    assetRole: node.assetRole,
    caption: node.caption,
    url: node.url,
    description: node.caption,
  };
}
