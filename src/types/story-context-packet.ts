import type { AiReadinessTier, ReferenceAsset } from "@/types/context-packet";
import type { StoryReferenceGraphNode } from "@/types/story-reference-graph";
import type { Story } from "@/types/story";
import type { StoryBible } from "@/types/story-bible";

export type StoryBibleScores = {
  referenceGraphCompletion: number;
  storyCompletion: number;
  storyConsistency: number;
  aiReadiness: number;
  aiReadinessTier: AiReadinessTier;
};

export type StoryReadinessScores = {
  storyCompletion: number;
  storyConsistency: number;
  aiReadiness: number;
  aiReadinessTier: AiReadinessTier;
  referenceGraphCompletion: number;
};

export type StoryContextPacket = {
  kind: "story";
  schemaVersion: "1.0";
  assembledAt: string;
  userId: string;
  storyId: string;
  bibleId: string;
  versionLabel: string;

  story: {
    title: string;
    slug: string;
    summary: string | null;
    status: Story["status"];
    projectType: Story["project_type"];
    worldId: string;
  };

  canon: {
    summary: string | null;
    themes: string | null;
    tone: string | null;
    notes: string | null;
  };

  timeline: string | null;

  events: string | null;

  characters: {
    linkedCharacterIds: string[];
    keyCharacters: string | null;
  };

  locations: {
    keyLocations: string | null;
  };

  assets: {
    cover: ReferenceAsset | null;
    sceneReferences: ReferenceAsset[];
    moodBoards: ReferenceAsset[];
    storyboards: ReferenceAsset[];
    chapterReferences: ReferenceAsset[];
    gallery: ReferenceAsset[];
  };

  referenceGraph: {
    nodes: ReferenceAsset[];
    coverId: string | null;
  };

  scores: StoryReadinessScores;

  derived: null;
};

export function storyReferenceGraphNodeToAsset(
  node: StoryReferenceGraphNode
): ReferenceAsset {
  return {
    id: node.imageId,
    assetRoleOrType: node.assetRole,
    assetRoleLabel: null,
    caption: node.caption,
    url: node.url,
    sortOrder: node.sortOrder,
  };
}
