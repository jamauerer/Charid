import {
  parseIdentityArchetype,
  type IdentityArchetype,
} from "@/types/identity-archetype";

/**
 * Version-scoped character state (character_bible).
 * V1: one row per character (is_current = true, version_label = 'Current').
 * V2: becomes character_versions — same columns, multiple rows per character.
 */
export type CharacterBible = {
  character_id: string;
  user_id: string;
  identity_archetype: IdentityArchetype;
  creative_format: string | null;
  version_label: string;
  is_current: boolean;
  age: string | null;
  height: string | null;
  build: string | null;
  hair: string | null;
  eyes: string | null;
  clothing: string | null;
  accessories: string | null;
  scars_tattoos: string | null;
  other_details: string | null;
  created_at: string;
  updated_at: string;
};

export type CharacterBibleRow = CharacterBible & {
  identity_archetype?: string;
  creative_format?: string | null;
  version_label?: string;
  is_current?: boolean;
};

export function normalizeCharacterBible(row: CharacterBibleRow): CharacterBible {
  return {
    character_id: row.character_id,
    user_id: row.user_id,
    identity_archetype: parseIdentityArchetype(row.identity_archetype),
    creative_format: row.creative_format ?? null,
    version_label: row.version_label ?? "Current",
    is_current: row.is_current ?? true,
    age: row.age ?? null,
    height: row.height ?? null,
    build: row.build ?? null,
    hair: row.hair ?? null,
    eyes: row.eyes ?? null,
    clothing: row.clothing ?? null,
    accessories: row.accessories ?? null,
    scars_tattoos: row.scars_tattoos ?? null,
    other_details: row.other_details ?? null,
    created_at: row.created_at,
    updated_at: row.updated_at,
  };
}

export function emptyCharacterBible(
  characterId: string,
  userId: string
): CharacterBible {
  const now = new Date().toISOString();
  return {
    character_id: characterId,
    user_id: userId,
    identity_archetype: "humanoid_stylized",
    creative_format: null,
    version_label: "Current",
    is_current: true,
    age: null,
    height: null,
    build: null,
    hair: null,
    eyes: null,
    clothing: null,
    accessories: null,
    scars_tattoos: null,
    other_details: null,
    created_at: now,
    updated_at: now,
  };
}
