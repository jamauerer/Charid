export const STORY_ASSET_TYPES = [
  "cover",
  "reference",
  "mood_board",
  "key_scene",
  "other",
] as const;

export type StoryAssetType = (typeof STORY_ASSET_TYPES)[number];

export const STORY_ASSET_TYPE_LABELS: Record<StoryAssetType, string> = {
  cover: "Cover",
  reference: "Reference",
  mood_board: "Mood Board",
  key_scene: "Key Scene",
  other: "Other",
};

export type StoryImage = {
  id: string;
  story_id: string;
  image_path: string;
  caption: string | null;
  asset_type: StoryAssetType;
  sort_order: number;
  created_at: string;
};

export type StoryImageRow = StoryImage & {
  asset_type?: string;
};

export type StoryImageWithUrl = StoryImage & {
  url: string | null;
};

export function parseStoryAssetType(value: unknown): StoryAssetType {
  const raw = String(value ?? "").trim();
  if (STORY_ASSET_TYPES.includes(raw as StoryAssetType)) {
    return raw as StoryAssetType;
  }
  return "reference";
}

export function normalizeStoryImage(row: StoryImageRow): StoryImage {
  return {
    id: row.id,
    story_id: row.story_id,
    image_path: row.image_path,
    caption: row.caption ?? null,
    asset_type: parseStoryAssetType(row.asset_type),
    sort_order: row.sort_order ?? 0,
    created_at: row.created_at,
  };
}
