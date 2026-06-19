import { WORLD_CORE_SLOT_ROLES } from "@/types/world-image";

export const WORLD_ASSIGNABLE_ROLES = [...WORLD_CORE_SLOT_ROLES] as const;

export type AssignableWorldImageRole = (typeof WORLD_ASSIGNABLE_ROLES)[number];

export function assignableWorldRoles(): AssignableWorldImageRole[] {
  return [...WORLD_ASSIGNABLE_ROLES];
}
