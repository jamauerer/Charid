export const IDENTITY_ARCHETYPES = [
  "humanoid_realistic",
  "humanoid_stylized",
  "humanoid_anime",
  "humanoid_comic",
  "humanoid_cartoon",
  "humanoid_fantasy",
  "anthropomorphic",
  "creature_quadruped",
  "creature_other",
] as const;

export type IdentityArchetype = (typeof IDENTITY_ARCHETYPES)[number];

export const IDENTITY_ARCHETYPE_LABELS: Record<IdentityArchetype, string> = {
  humanoid_realistic: "Realistic human",
  humanoid_stylized: "Stylized human",
  humanoid_anime: "Anime",
  humanoid_comic: "Graphic Novel",
  humanoid_cartoon: "Cartoon",
  humanoid_fantasy: "Fantasy humanoid",
  anthropomorphic: "Anthropomorphic",
  creature_quadruped: "Creature (quadruped)",
  creature_other: "Creature (other)",
};

export const HUMANOID_ARCHETYPES: IdentityArchetype[] = [
  "humanoid_realistic",
  "humanoid_stylized",
  "humanoid_anime",
  "humanoid_comic",
  "humanoid_cartoon",
  "humanoid_fantasy",
  "anthropomorphic",
];

export const CREATURE_ARCHETYPES: IdentityArchetype[] = [
  "creature_quadruped",
  "creature_other",
];

export function isHumanoidArchetype(archetype: IdentityArchetype): boolean {
  return HUMANOID_ARCHETYPES.includes(archetype);
}

export function parseIdentityArchetype(
  value: FormDataEntryValue | null | string | undefined
): IdentityArchetype {
  const raw = String(value ?? "").trim();
  if (IDENTITY_ARCHETYPES.includes(raw as IdentityArchetype)) {
    return raw as IdentityArchetype;
  }
  return "humanoid_stylized";
}
