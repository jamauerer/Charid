export const CHARACTER_IMAGE_ASSET_ROLES = [
  "reference",
  "canonical",
  "other",
  "turnaround_front",
  "turnaround_left",
  "turnaround_right",
  "turnaround_back",
  "expression_neutral",
  "expression_happy",
  "expression_angry",
  "expression_sad",
  "expression_surprised",
] as const;

export type CharacterImageAssetRole =
  | (typeof CHARACTER_IMAGE_ASSET_ROLES)[number]
  | `outfit_${string}`
  | `prop_${string}`
  | `companion_${string}`
  | `vehicle_${string}`;

export const TURNAROUND_ROLES = [
  "turnaround_front",
  "turnaround_left",
  "turnaround_right",
  "turnaround_back",
] as const;

export const EXPRESSION_ROLES = [
  "expression_neutral",
  "expression_happy",
  "expression_angry",
  "expression_sad",
  "expression_surprised",
] as const;

export const SLOT_ASSET_ROLES = [
  ...TURNAROUND_ROLES,
  ...EXPRESSION_ROLES,
  "canonical",
] as const;

export type SlotAssetRole = (typeof SLOT_ASSET_ROLES)[number];

export type CharacterImage = {
  id: string;
  character_id: string;
  image_path: string;
  caption: string | null;
  asset_role: string;
  asset_role_label: string | null;
  sort_order: number;
  created_at: string;
};

export type CharacterImageRow = CharacterImage & {
  asset_role?: string;
  asset_role_label?: string | null;
};

export type CharacterImageWithUrl = CharacterImage & {
  url: string | null;
};

export function normalizeCharacterImage(row: CharacterImageRow): CharacterImage {
  return {
    id: row.id,
    character_id: row.character_id,
    image_path: row.image_path,
    caption: row.caption ?? null,
    asset_role: row.asset_role ?? "reference",
    asset_role_label: row.asset_role_label ?? null,
    sort_order: row.sort_order ?? 0,
    created_at: row.created_at,
  };
}

export function isSlotAssetRole(role: string): role is SlotAssetRole {
  return (SLOT_ASSET_ROLES as readonly string[]).includes(role);
}

export function parseAssetRole(value: FormDataEntryValue | null): string {
  const raw = String(value ?? "").trim();
  return raw || "reference";
}
