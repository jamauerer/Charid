import type { StoryImageWithUrl, StoryAssetType } from "@/types/story-image";
import {
  assetTypeToStorySlotRole,
  isStorySlotRole,
} from "@/types/story-image";
import type { StoryImageSlotAssignment } from "@/types/story-image-slot";

export type StorySlotAssignmentMap = Record<string, StoryImageSlotAssignment>;

export function buildStorySlotAssignmentMap(
  images: StoryImageWithUrl[],
  assignments: StoryImageSlotAssignment[]
): StorySlotAssignmentMap {
  const map: StorySlotAssignmentMap = {};

  for (const assignment of assignments) {
    map[assignment.slot_role] = assignment;
  }

  for (const image of images) {
    const slotRole = assetTypeToStorySlotRole(image.asset_type);
    if (slotRole && isStorySlotRole(slotRole) && !map[slotRole]) {
      map[slotRole] = {
        id: `legacy-${image.id}-${slotRole}`,
        story_id: image.story_id,
        image_id: image.id,
        slot_role: slotRole,
        source: "uploaded",
        created_at: image.created_at,
      };
    }
  }

  return map;
}

export function storyImageForSlot(
  slotRole: string,
  images: StoryImageWithUrl[],
  slotMap: StorySlotAssignmentMap
): StoryImageWithUrl | null {
  const assignment = slotMap[slotRole];
  if (!assignment) return null;
  return images.find((img) => img.id === assignment.image_id) ?? null;
}

export function storySlotAssignmentsForImage(
  imageId: string,
  slotMap: StorySlotAssignmentMap
): StoryImageSlotAssignment[] {
  return Object.values(slotMap).filter((a) => a.image_id === imageId);
}

export function hasStoryGraphRole(
  nodes: { assetRole: string }[],
  role: string
): boolean {
  return nodes.some((node) => node.assetRole === role);
}

export function hasStoryGraphRolePrefix(
  nodes: { assetRole: string }[],
  prefix: string
): boolean {
  return nodes.some(
    (node) => node.assetRole === prefix || node.assetRole.startsWith(`${prefix}_`)
  );
}

export function isGalleryStoryAssetType(assetType: StoryAssetType): boolean {
  return assetType === "reference" || assetType === "other";
}
