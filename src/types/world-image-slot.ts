import { normalizeWorldSlotRole, isWorldSlotRole } from "@/types/world-image";

export const WORLD_ASSET_SOURCES = ["uploaded", "generated", "assigned"] as const;
export type WorldAssetSource = (typeof WORLD_ASSET_SOURCES)[number];

export const WORLD_ASSET_SOURCE_LABELS: Record<WorldAssetSource, string> = {
  uploaded: "Uploaded",
  generated: "Generated",
  assigned: "Assigned",
};

export type WorldImageSlotAssignment = {
  id: string;
  world_id: string;
  image_id: string;
  slot_role: string;
  source: WorldAssetSource;
  created_at: string;
};

export function normalizeWorldSlotAssignment(
  row: WorldImageSlotAssignment
): WorldImageSlotAssignment {
  return {
    id: row.id,
    world_id: row.world_id,
    image_id: row.image_id,
    slot_role: normalizeWorldSlotRole(row.slot_role),
    source: row.source ?? "assigned",
    created_at: row.created_at,
  };
}

export function isAssignableWorldSlotRole(role: string): boolean {
  return isWorldSlotRole(role);
}
