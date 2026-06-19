import { labelForWorldAssetRole } from "@/lib/world-asset-role-labels";
import {
  worldSlotAssignmentsForImage,
  type WorldSlotAssignmentMap,
} from "@/lib/world-slot-assignments";
import type { WorldImageWithUrl } from "@/types/world-image";
import type { WorldAssetSource } from "@/types/world-image-slot";
import type { ImagePickerItem, ImagePickerOriginLabel } from "@/types/image-picker";

function originFromSources(sources: WorldAssetSource[]): ImagePickerOriginLabel {
  if (sources.includes("generated")) return "Generated";
  if (sources.includes("uploaded")) return "Uploaded";
  if (sources.includes("assigned")) return "Assigned";
  return "Uploaded";
}

const MOOD_ROLES = new Set(["mood_board", "canonical_reference"]);
const PLACE_ROLES = new Set(["location", "environment", "architecture"]);
const MAP_ROLES = new Set(["canonical_map"]);

export function scoreWorldImageForSlot(
  targetSlotRole: string,
  image: WorldImageWithUrl,
  slotMap: WorldSlotAssignmentMap
): number {
  const assigned = worldSlotAssignmentsForImage(image.id, slotMap).map(
    (a) => a.slot_role
  );
  let score = 0;

  if (assigned.includes(targetSlotRole)) score += 80;
  if (assigned.includes("canonical_reference")) score += 45;

  if (MOOD_ROLES.has(targetSlotRole)) {
    if (assigned.some((r) => MOOD_ROLES.has(r))) score += 50;
    if (assigned.some((r) => PLACE_ROLES.has(r))) score += 20;
  }

  if (PLACE_ROLES.has(targetSlotRole)) {
    if (assigned.some((r) => PLACE_ROLES.has(r))) score += 50;
    if (assigned.includes("environment")) score += 35;
  }

  if (MAP_ROLES.has(targetSlotRole)) {
    if (assigned.some((r) => MAP_ROLES.has(r))) score += 60;
  }

  if (image.asset_role === targetSlotRole) score += 40;
  if (image.caption?.trim()) score += 5;

  return score;
}

export function worldImagesToPickerItems(
  images: WorldImageWithUrl[],
  slotMap: WorldSlotAssignmentMap,
  targetSlotRole: string,
  excludeImageId?: string | null
): ImagePickerItem[] {
  return images
    .filter((img) => img.id !== excludeImageId)
    .map((image) => {
      const assignments = worldSlotAssignmentsForImage(image.id, slotMap);
      const slotLabels = assignments.map((a) =>
        labelForWorldAssetRole(a.slot_role)
      );
      const title =
        image.caption?.trim() ||
        slotLabels[0] ||
        labelForWorldAssetRole(image.asset_role) ||
        "Reference";

      return {
        id: image.id,
        url: image.url,
        title,
        slotLabels,
        originLabel: originFromSources(assignments.map((a) => a.source)),
        createdAt: image.created_at,
        priorityScore: scoreWorldImageForSlot(
          targetSlotRole,
          image,
          slotMap
        ),
      };
    })
    .sort((a, b) => {
      if (b.priorityScore !== a.priorityScore) {
        return b.priorityScore - a.priorityScore;
      }
      return (
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
    });
}

/** Moodboard and other non-slot picks — recency first. */
export function worldImagesToPickerItemsGeneral(
  images: WorldImageWithUrl[],
  slotMap: WorldSlotAssignmentMap,
  excludeIds?: Set<string>
): ImagePickerItem[] {
  return images
    .filter((img) => !excludeIds?.has(img.id))
    .map((image) => {
      const assignments = worldSlotAssignmentsForImage(image.id, slotMap);
      const slotLabels = assignments.map((a) =>
        labelForWorldAssetRole(a.slot_role)
      );
      const title =
        image.caption?.trim() ||
        slotLabels[0] ||
        labelForWorldAssetRole(image.asset_role) ||
        "Reference";

      return {
        id: image.id,
        url: image.url,
        title,
        slotLabels,
        originLabel: originFromSources(assignments.map((a) => a.source)),
        createdAt: image.created_at,
        priorityScore: 0,
      };
    })
    .sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
}
