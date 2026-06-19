import { labelForAssetRole } from "@/lib/asset-role-labels";
import { slotAssignmentsForImage } from "@/lib/character-slot-assignments";
import type { SlotAssignmentMap } from "@/lib/character-slot-assignments";
import {
  EXPRESSION_ROLES,
  TURNAROUND_ROLES,
  type CharacterImageWithUrl,
} from "@/types/character-image";
import type { AssetSource } from "@/types/character-image-slot";
import type { ImagePickerItem, ImagePickerOriginLabel } from "@/types/image-picker";

const EXPRESSION_SET = new Set<string>(EXPRESSION_ROLES);
const TURNAROUND_SET = new Set<string>(TURNAROUND_ROLES);

function originFromSources(sources: AssetSource[]): ImagePickerOriginLabel {
  if (sources.includes("generated")) return "Generated";
  if (sources.includes("uploaded")) return "Uploaded";
  if (sources.includes("assigned")) return "Assigned";
  return "Uploaded";
}

function assignedRolesForImage(
  imageId: string,
  slotMap: SlotAssignmentMap
): string[] {
  return slotAssignmentsForImage(imageId, slotMap).map((a) => a.slot_role);
}

/** Score how well an image fits the slot being filled. Higher = better match. */
export function scoreCharacterImageForSlot(
  targetSlotRole: string,
  image: CharacterImageWithUrl,
  slotMap: SlotAssignmentMap
): number {
  const assigned = assignedRolesForImage(image.id, slotMap);
  let score = 0;

  if (assigned.includes("canonical")) score += 90;
  if (assigned.some((r) => EXPRESSION_SET.has(r))) score += 70;
  if (assigned.includes("turnaround_front")) score += 55;
  if (assigned.some((r) => TURNAROUND_SET.has(r))) score += 40;

  if (targetSlotRole === "canonical") {
    if (assigned.includes("turnaround_front")) score += 30;
    if (assigned.some((r) => EXPRESSION_SET.has(r))) score += 25;
    if (image.asset_role === "reference") score += 15;
  }

  if (EXPRESSION_SET.has(targetSlotRole)) {
    if (assigned.includes("expression_neutral")) score += 50;
    if (assigned.includes(targetSlotRole)) score += 80;
    if (assigned.some((r) => EXPRESSION_SET.has(r))) score += 35;
    if (assigned.includes("canonical")) score += 45;
    if (image.asset_role.startsWith("expression_")) score += 20;
  }

  if (TURNAROUND_SET.has(targetSlotRole)) {
    if (assigned.some((r) => TURNAROUND_SET.has(r))) score += 45;
    if (assigned.includes("canonical")) score += 25;
    if (image.asset_role.startsWith("turnaround_")) score += 30;
  }

  if (image.asset_role === targetSlotRole) score += 60;
  if (image.caption?.trim()) score += 5;

  return score;
}

export function characterImagesToPickerItems(
  images: CharacterImageWithUrl[],
  slotMap: SlotAssignmentMap,
  targetSlotRole: string,
  excludeImageId?: string | null
): ImagePickerItem[] {
  return images
    .filter((img) => img.id !== excludeImageId)
    .map((image) => {
      const assignments = slotAssignmentsForImage(image.id, slotMap);
      const slotLabels = assignments.map((a) =>
        labelForAssetRole(a.slot_role)
      );
      const title =
        image.caption?.trim() ||
        slotLabels[0] ||
        labelForAssetRole(image.asset_role) ||
        "Reference";

      return {
        id: image.id,
        url: image.url,
        title,
        slotLabels,
        originLabel: originFromSources(assignments.map((a) => a.source)),
        createdAt: image.created_at,
        priorityScore: scoreCharacterImageForSlot(
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

export function filterPickerItems(
  items: ImagePickerItem[],
  query: string
): ImagePickerItem[] {
  const q = query.trim().toLowerCase();
  if (!q) return items;

  return items.filter((item) => {
    const haystack = [
      item.title,
      item.originLabel,
      ...item.slotLabels,
    ]
      .join(" ")
      .toLowerCase();
    return haystack.includes(q);
  });
}

export function formatPickerDate(iso: string): string {
  try {
    return new Intl.DateTimeFormat(undefined, {
      month: "short",
      day: "numeric",
      year: "numeric",
    }).format(new Date(iso));
  } catch {
    return "";
  }
}
