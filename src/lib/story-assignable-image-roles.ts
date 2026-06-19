import { STORY_CORE_SLOT_ROLES } from "@/types/story-image";

export const STORY_ASSIGNABLE_ROLES = [...STORY_CORE_SLOT_ROLES] as const;
export type AssignableStoryImageRole = (typeof STORY_ASSIGNABLE_ROLES)[number];

export function assignableStoryRoles(): AssignableStoryImageRole[] {
  return STORY_ASSIGNABLE_ROLES.filter((role) => role !== "reference");
}
