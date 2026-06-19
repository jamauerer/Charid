export type StoryReferenceGraphNodeType =
  | "canonical"
  | "reference"
  | "scene"
  | "mood"
  | "storyboard"
  | "chapter"
  | "extended";

export type StoryReferenceGraphNode = {
  imageId: string;
  assetRole: string;
  assetType: string;
  caption: string | null;
  nodeType: StoryReferenceGraphNodeType;
  slotKey: string | null;
  sortOrder: number;
  imagePath: string;
  url: string | null;
  isFeatured: boolean;
  assignmentSource?: string | null;
};

export type StoryCanonDescriptors = {
  title: string;
  slug: string;
  summary: string | null;
  status: string;
  projectType: string;
  themes: string | null;
  tone: string | null;
  timeline: string | null;
  majorEvents: string | null;
  keyCharacters: string | null;
  keyLocations: string | null;
  notes: string | null;
};

export type StoryReferenceGraph = {
  storyId: string;
  bibleId: string;
  versionLabel: string;
  nodes: StoryReferenceGraphNode[];
  nodeCountByType: Record<StoryReferenceGraphNodeType, number>;
  descriptors: StoryCanonDescriptors;
  coverImageId: string | null;
  galleryReferenceCount: number;
};
