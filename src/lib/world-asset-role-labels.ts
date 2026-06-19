import { WORLD_CORE_SLOT_ROLES } from "@/types/world-image";

export const WORLD_ASSET_ROLE_LABELS: Record<string, string> = {
  canonical_map: "Main map",
  canonical_reference: "Main world reference",
  location: "Location",
  environment: "Environment",
  architecture: "Architecture",
  mood_board: "Mood board",
  reference: "Reference",
  other: "Other",
};

export function labelForWorldAssetRole(role: string): string {
  return (
    WORLD_ASSET_ROLE_LABELS[role] ??
    role.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())
  );
}

export const WORLD_CORE_SLOT_HINTS: Record<
  (typeof WORLD_CORE_SLOT_ROLES)[number],
  string
> = {
  canonical_map: "Primary map of your world — regions, geography, and key places.",
  canonical_reference: "Defining world visual — the anchor image for tone and identity.",
  location: "Named place reference — cities, landmarks, or key locations.",
  environment: "Biomes, landscapes, and environmental atmosphere.",
  architecture: "Buildings, structures, and built-environment references.",
  mood_board: "Tone, color, and atmosphere board for the world's feel.",
};
