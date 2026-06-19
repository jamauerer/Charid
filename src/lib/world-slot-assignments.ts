import type { WorldImageWithUrl } from "@/types/world-image";
import { isWorldSlotRole } from "@/types/world-image";
import type { WorldImageSlotAssignment } from "@/types/world-image-slot";

export type WorldSlotAssignmentMap = Record<string, WorldImageSlotAssignment>;

export function buildWorldSlotAssignmentMap(
  images: WorldImageWithUrl[],
  assignments: WorldImageSlotAssignment[]
): WorldSlotAssignmentMap {
  const map: WorldSlotAssignmentMap = {};

  for (const assignment of assignments) {
    map[assignment.slot_role] = assignment;
  }

  for (const image of images) {
    if (isWorldSlotRole(image.asset_role) && !map[image.asset_role]) {
      map[image.asset_role] = {
        id: `legacy-${image.id}-${image.asset_role}`,
        world_id: image.world_id,
        image_id: image.id,
        slot_role: image.asset_role,
        source: "uploaded",
        created_at: image.created_at,
      };
    }
  }

  return map;
}

export function worldImageForSlot(
  slotRole: string,
  images: WorldImageWithUrl[],
  slotMap: WorldSlotAssignmentMap
): WorldImageWithUrl | null {
  const assignment = slotMap[slotRole];
  if (!assignment) return null;
  return images.find((img) => img.id === assignment.image_id) ?? null;
}

export function worldSlotAssignmentsForImage(
  imageId: string,
  slotMap: WorldSlotAssignmentMap
): WorldImageSlotAssignment[] {
  return Object.values(slotMap).filter((a) => a.image_id === imageId);
}

export function worldGalleryImages(images: WorldImageWithUrl[]): WorldImageWithUrl[] {
  return images;
}

export function hasWorldGraphRole(
  nodes: { assetRole: string }[],
  role: string
): boolean {
  return nodes.some((node) => node.assetRole === role);
}

export function hasWorldGraphRolePrefix(
  nodes: { assetRole: string }[],
  prefix: string
): boolean {
  return nodes.some(
    (node) => node.assetRole === prefix || node.assetRole.startsWith(`${prefix}_`)
  );
}
