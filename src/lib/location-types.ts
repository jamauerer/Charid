export const LOCATION_TYPES = [
  "forest",
  "village",
  "castle",
  "mountain",
  "city",
  "ruins",
  "river",
  "custom",
] as const;

export type LocationType = (typeof LOCATION_TYPES)[number];

export const LOCATION_TYPE_LABELS: Record<LocationType, string> = {
  forest: "Forest",
  village: "Village",
  castle: "Castle",
  mountain: "Mountain",
  city: "City",
  ruins: "Ruins",
  river: "River",
  custom: "Custom",
};

export function isLocationType(value: string): value is LocationType {
  return (LOCATION_TYPES as readonly string[]).includes(value);
}
