import type { SlotAssignmentMap } from "@/lib/character-slot-assignments";
import {
  EXPRESSION_ROLES,
  TURNAROUND_ROLES,
} from "@/types/character-image";

export type ProgressItem = {
  id: string;
  label: string;
  complete: boolean;
  optional?: boolean;
};

export function computeCharacterCreatorProgress(input: {
  slotMap: SlotAssignmentMap;
  corePersonality: string | null;
  storyCount: number;
  includeTurnaround?: boolean;
  includeExpressions?: boolean;
  relationshipCount?: number;
}): { items: ProgressItem[]; percent: number } {
  const {
    slotMap,
    corePersonality,
    storyCount,
    includeTurnaround = true,
    includeExpressions = true,
    relationshipCount = 0,
  } = input;

  const items: ProgressItem[] = [
    {
      id: "portrait",
      label: "Portrait",
      complete: Boolean(slotMap.canonical?.image_id),
    },
    {
      id: "personality",
      label: "Personality",
      complete: Boolean(corePersonality?.trim()),
    },
  ];

  if (includeExpressions) {
    const expressionsComplete = EXPRESSION_ROLES.every(
      (role) => Boolean(slotMap[role]?.image_id)
    );
    items.push({
      id: "expressions",
      label: "Expressions",
      complete: expressionsComplete,
    });
  }

  if (includeTurnaround) {
    const turnaroundComplete = TURNAROUND_ROLES.every(
      (role) => Boolean(slotMap[role]?.image_id)
    );
    items.push({
      id: "turnaround",
      label: "Turnaround",
      complete: turnaroundComplete,
    });
  }

  items.push(
    {
      id: "relationships",
      label: "Relationships",
      complete: relationshipCount > 0,
      optional: true,
    },
    {
      id: "stories",
      label: "Stories",
      complete: storyCount > 0,
    }
  );

  const required = items.filter((item) => !item.optional);
  const done = required.filter((item) => item.complete).length;
  const percent =
    required.length === 0 ? 0 : Math.round((done / required.length) * 100);

  return { items, percent };
}
