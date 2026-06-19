export const STORY_ASSET_TYPES = [
  "cover",
  "reference",
  "mood_board",
  "key_scene",
  "other",
] as const;

export type StoryAssetType = (typeof STORY_ASSET_TYPES)[number];

/** Core assignable slot roles (Story Bible V1). */
export const STORY_CORE_SLOT_ROLES = [
  "cover",
  "scene_reference",
  "mood_board",
  "storyboard",
  "chapter_reference",
  "reference",
] as const;

export type StoryCoreSlotRole = (typeof STORY_CORE_SLOT_ROLES)[number];

/** Legacy asset type / role names — normalized at read time. */
export const LEGACY_STORY_SLOT_ROLE_MAP: Record<string, string> = {
  key_scene: "scene_reference",
};

const EXTENDED_SLOT_PREFIXES = ["scene_", "chapter_", "storyboard_"] as const;

export function normalizeStorySlotRole(role: string): string {
  return LEGACY_STORY_SLOT_ROLE_MAP[role] ?? role;
}

export function isStorySlotRole(role: string): role is StoryCoreSlotRole {
  if ((STORY_CORE_SLOT_ROLES as readonly string[]).includes(role)) {
    return true;
  }
  return EXTENDED_SLOT_PREFIXES.some((prefix) => role.startsWith(prefix));
}

export function assetTypeToStorySlotRole(
  assetType: StoryAssetType
): string | null {
  switch (assetType) {
    case "cover":
      return "cover";
    case "mood_board":
      return "mood_board";
    case "key_scene":
      return "scene_reference";
    default:
      return null;
  }
}

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
