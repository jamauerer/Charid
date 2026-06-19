export const WORLD_IMAGE_ASSET_ROLES = ["reference", "other"] as const;

/** Core assignable slot roles (V1). */
export const WORLD_CORE_SLOT_ROLES = [
  "canonical_map",
  "canonical_reference",
  "location",
  "environment",
  "architecture",
  "mood_board",
] as const;

export type WorldCoreSlotRole = (typeof WORLD_CORE_SLOT_ROLES)[number];

/** Legacy Slice A role names — normalized at read time. */
export const LEGACY_WORLD_SLOT_ROLE_MAP: Record<string, string> = {
  canonical: "canonical_reference",
  map: "canonical_map",
  location_primary: "location",
};

const EXTENDED_SLOT_PREFIXES = [
  "location_",
  "faction_",
  "region_",
  "nation_",
  "species_",
  "organization_",
  "culture_",
] as const;

export type WorldImage = {
  id: string;
  world_id: string;
  image_path: string;
  caption: string | null;
  asset_role: string;
  asset_role_label: string | null;
  sort_order: number;
  created_at: string;
};

export type WorldImageRow = WorldImage;

export type WorldImageWithUrl = WorldImage & {
  url: string | null;
};

export function normalizeWorldSlotRole(role: string): string {
  return LEGACY_WORLD_SLOT_ROLE_MAP[role] ?? role;
}

export function isWorldSlotRole(role: string): role is WorldCoreSlotRole {
  if ((WORLD_CORE_SLOT_ROLES as readonly string[]).includes(role)) {
    return true;
  }
  return EXTENDED_SLOT_PREFIXES.some((prefix) => role.startsWith(prefix));
}

export function normalizeWorldImage(row: WorldImageRow): WorldImage {
  return {
    id: row.id,
    world_id: row.world_id,
    image_path: row.image_path,
    caption: row.caption ?? null,
    asset_role: row.asset_role ?? "reference",
    asset_role_label: row.asset_role_label ?? null,
    sort_order: row.sort_order ?? 0,
    created_at: row.created_at,
  };
}
