import type { IdentityArchetype } from "@/types/identity-archetype";

export type ReferenceGraphNodeType =
  | "canonical"
  | "reference"
  | "turnaround"
  | "expression"
  | "extended";

export type ReferenceGraphNode = {
  imageId: string;
  assetRole: string;
  assetRoleLabel: string | null;
  nodeType: ReferenceGraphNodeType;
  slotKey: string | null;
  sortOrder: number;
  imagePath: string;
  url: string | null;
  isFeatured: boolean;
  assignmentSource?: string | null;
};

export type VisualIdentityDescriptors = {
  name: string;
  species: string | null;
  corePersonality: string | null;
  permanentFeatures: string | null;
  backstory: string | null;
  identityArchetype: IdentityArchetype;
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

export type ReferenceGraph = {
  characterId: string;
  bibleId: string;
  identityArchetype: IdentityArchetype;
  creativeFormat: string | null;
  versionLabel: string;
  nodes: ReferenceGraphNode[];
  nodeCountByType: Record<ReferenceGraphNodeType, number>;
  descriptors: VisualIdentityDescriptors;
  canonicalImageId: string | null;
  galleryReferenceCount: number;
};
