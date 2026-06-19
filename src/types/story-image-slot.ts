import { normalizeStorySlotRole, isStorySlotRole } from "@/types/story-image";

export const STORY_ASSET_SOURCES = ["uploaded", "generated", "assigned"] as const;
export type StoryAssetSource = (typeof STORY_ASSET_SOURCES)[number];

export const STORY_ASSET_SOURCE_LABELS: Record<StoryAssetSource, string> = {
  uploaded: "Uploaded",
  generated: "Generated",
  assigned: "Assigned",
};

export type StoryImageSlotAssignment = {
  id: string;
  story_id: string;
  image_id: string;
  slot_role: string;
  source: StoryAssetSource;
  created_at: string;
};

export function normalizeStorySlotAssignment(
  row: StoryImageSlotAssignment
): StoryImageSlotAssignment {
  return {
    id: row.id,
    story_id: row.story_id,
    image_id: row.image_id,
    slot_role: normalizeStorySlotRole(row.slot_role),
    source: row.source ?? "assigned",
    created_at: row.created_at,
  };
}

export function isAssignableStorySlotRole(role: string): boolean {
  return isStorySlotRole(role);
}
