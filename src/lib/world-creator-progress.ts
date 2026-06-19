import type { WorldSlotAssignmentMap } from "@/lib/world-slot-assignments";

export type ProgressItem = {
  id: string;
  label: string;
  complete: boolean;
  optional?: boolean;
};

export function computeWorldCreatorProgress(input: {
  hasCover: boolean;
  slotMap: WorldSlotAssignmentMap;
  storyCount: number;
  characterCount: number;
  locationCount?: number;
  moodboardItemCount?: number;
  hasMap?: boolean;
  mapOptional?: boolean;
}): { items: ProgressItem[]; percent: number } {
  const {
    hasCover,
    slotMap,
    storyCount,
    characterCount,
    locationCount = 0,
    moodboardItemCount = 0,
    hasMap,
    mapOptional = true,
  } = input;

  const mapComplete =
    hasMap ??
    Boolean(slotMap.canonical_map?.image_id);

  const items: ProgressItem[] = [
    { id: "cover", label: "Cover", complete: hasCover },
    {
      id: "map",
      label: "World Map",
      complete: mapComplete,
      optional: mapOptional,
    },
    {
      id: "locations",
      label: "Locations",
      complete: locationCount > 0,
      optional: true,
    },
    {
      id: "mood",
      label: "Mood Board",
      complete:
        moodboardItemCount > 0 || Boolean(slotMap.mood_board?.image_id),
    },
    { id: "stories", label: "Stories", complete: storyCount > 0 },
    { id: "characters", label: "Characters", complete: characterCount > 0 },
  ];

  const required = items.filter((item) => !item.optional);
  const done = required.filter((item) => item.complete).length;
  const percent =
    required.length === 0 ? 0 : Math.round((done / required.length) * 100);

  return { items, percent };
}
