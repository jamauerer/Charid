export type WorldReferenceGraphNodeType =
  | "canonical"
  | "reference"
  | "location"
  | "mood"
  | "environment"
  | "architecture"
  | "extended";

export type WorldReferenceGraphNode = {
  imageId: string;
  assetRole: string;
  assetRoleLabel: string | null;
  caption: string | null;
  nodeType: WorldReferenceGraphNodeType;
  slotKey: string | null;
  sortOrder: number;
  imagePath: string;
  url: string | null;
  assignmentSource?: string | null;
};

export type WorldCanonDescriptors = {
  name: string;
  slug: string;
  description: string | null;
  genre: string | null;
  tone: string | null;
  themes: string | null;
  rules: string | null;
  era: string | null;
  climate: string | null;
  overview: string | null;
};

export type WorldReferenceGraph = {
  worldId: string;
  bibleId: string;
  versionLabel: string;
  nodes: WorldReferenceGraphNode[];
  nodeCountByType: Record<WorldReferenceGraphNodeType, number>;
  descriptors: WorldCanonDescriptors;
  canonicalMapImageId: string | null;
  canonicalReferenceImageId: string | null;
  galleryReferenceCount: number;
};
