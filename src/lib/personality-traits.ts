export const SUGGESTED_PERSONALITY_TRAITS = [
  "Bold",
  "Brave",
  "Funny",
  "Silly",
  "Kind",
  "Curious",
  "Shy",
  "Serious",
  "Wise",
  "Loyal",
  "Creative",
  "Protective",
  "Competitive",
  "Impulsive",
] as const;

export type PersonalityTrait = (typeof SUGGESTED_PERSONALITY_TRAITS)[number];

export function parsePersonalityTraits(value: string | null | undefined): string[] {
  if (!value?.trim()) return [];
  return value
    .split(/[,;]+/)
    .map((part) => part.trim())
    .filter(Boolean);
}

export function serializePersonalityTraits(traits: string[]): string {
  return [...new Set(traits.map((t) => t.trim()).filter(Boolean))].join(", ");
}
