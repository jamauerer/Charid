import { STORY_ASSET_TYPE_LABELS } from "@/types/story-image";

const STORY_SLOT_LABELS: Record<string, string> = {
  cover: "Cover",
  scene_reference: "Scene reference",
  mood_board: "Mood board",
  storyboard: "Storyboard",
  chapter_reference: "Chapter reference",
  reference: "Reference",
  other: "Other",
  key_scene: "Key scene",
};

export function labelForStoryAssetRole(role: string): string {
  if (role in STORY_SLOT_LABELS) {
    return STORY_SLOT_LABELS[role];
  }
  if (role.startsWith("scene_")) {
    return `Scene: ${role.replace("scene_", "").replace(/_/g, " ")}`;
  }
  if (role.startsWith("chapter_")) {
    return `Chapter: ${role.replace("chapter_", "").replace(/_/g, " ")}`;
  }
  if (role.startsWith("storyboard_")) {
    return `Storyboard: ${role.replace("storyboard_", "").replace(/_/g, " ")}`;
  }
  const assetType = role as keyof typeof STORY_ASSET_TYPE_LABELS;
  if (assetType in STORY_ASSET_TYPE_LABELS) {
    return STORY_ASSET_TYPE_LABELS[assetType];
  }
  return role.replace(/_/g, " ");
}
