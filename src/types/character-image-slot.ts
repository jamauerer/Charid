import { isSlotAssetRole } from "@/types/character-image";

export const ASSET_SOURCES = ["uploaded", "generated", "assigned"] as const;
export type AssetSource = (typeof ASSET_SOURCES)[number];

export const ASSET_SOURCE_LABELS: Record<AssetSource, string> = {
  uploaded: "Uploaded",
  generated: "Generated",
  assigned: "Assigned",
};

export type CharacterImageSlotAssignment = {
  id: string;
  character_id: string;
  image_id: string;
  slot_role: string;
  source: AssetSource;
  created_at: string;
};

export type CharacterImageSlotAssignmentRow = CharacterImageSlotAssignment;

export function normalizeSlotAssignment(
  row: CharacterImageSlotAssignmentRow
): CharacterImageSlotAssignment {
  return {
    id: row.id,
    character_id: row.character_id,
    image_id: row.image_id,
    slot_role: row.slot_role,
    source: row.source ?? "assigned",
    created_at: row.created_at,
  };
}

export function isAssignableSlotRole(role: string): boolean {
  return isSlotAssetRole(role);
}
