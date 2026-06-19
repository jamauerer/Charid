import {
  EXPRESSION_ROLES,
  TURNAROUND_ROLES,
} from "@/types/character-image";
import type { IdentityArchetype } from "@/types/identity-archetype";
import { CREATURE_ARCHETYPES } from "@/types/identity-archetype";

export const CORE_ASSIGNABLE_ROLES = [
  "canonical",
  ...TURNAROUND_ROLES,
  ...EXPRESSION_ROLES,
] as const;

export type AssignableImageRole = (typeof CORE_ASSIGNABLE_ROLES)[number];

export function assignableRolesForArchetype(
  archetype: IdentityArchetype
): AssignableImageRole[] {
  if (CREATURE_ARCHETYPES.includes(archetype)) {
    return ["canonical"];
  }
  return [...CORE_ASSIGNABLE_ROLES];
}
