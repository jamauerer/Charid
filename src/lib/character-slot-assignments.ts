import type { CharacterImageWithUrl } from "@/types/character-image";
import { isSlotAssetRole } from "@/types/character-image";
import type { CharacterImageSlotAssignment } from "@/types/character-image-slot";

export type SlotAssignmentMap = Record<string, CharacterImageSlotAssignment>;

/** Merge DB assignments with legacy asset_role fallback (pre-migration). */
export function buildSlotAssignmentMap(
  images: CharacterImageWithUrl[],
  assignments: CharacterImageSlotAssignment[]
): SlotAssignmentMap {
  const map: SlotAssignmentMap = {};

  for (const assignment of assignments) {
    map[assignment.slot_role] = assignment;
  }

  for (const image of images) {
    if (isSlotAssetRole(image.asset_role) && !map[image.asset_role]) {
      map[image.asset_role] = {
        id: `legacy-${image.id}-${image.asset_role}`,
        character_id: image.character_id,
        image_id: image.id,
        slot_role: image.asset_role,
        source: "uploaded",
        created_at: image.created_at,
      };
    }
  }

  return map;
}

export function imageForSlot(
  slotRole: string,
  images: CharacterImageWithUrl[],
  slotMap: SlotAssignmentMap
): CharacterImageWithUrl | null {
  const assignment = slotMap[slotRole];
  if (!assignment) return null;
  return images.find((img) => img.id === assignment.image_id) ?? null;
}

export function slotAssignmentsForImage(
  imageId: string,
  slotMap: SlotAssignmentMap
): CharacterImageSlotAssignment[] {
  return Object.values(slotMap).filter((a) => a.image_id === imageId);
}

export function galleryImages(
  images: CharacterImageWithUrl[]
): CharacterImageWithUrl[] {
  return images;
}
