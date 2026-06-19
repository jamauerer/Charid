export type Character = {
  id: string;
  user_id: string;
  name: string;
  gender: string | null;
  species: string | null;
  core_personality: string | null;
  permanent_features: string | null;
  location: string | null;
  backstory: string | null;
  photo_path: string | null;
  featured_image_id: string | null;
  world_id: string | null;
  is_public: boolean;
  created_at: string;
};

/** Raw row shape before normalization (legacy columns). */
export type CharacterRow = Character & {
  physical_description?: string | null;
  age?: string | null;
  is_public?: boolean;
  featured_image_id?: string | null;
  world_id?: string | null;
  species?: string | null;
  core_personality?: string | null;
  permanent_features?: string | null;
};

export function normalizeCharacter(row: CharacterRow): Character {
  return {
    id: row.id,
    user_id: row.user_id,
    name: row.name,
    gender: row.gender ?? null,
    species: row.species ?? null,
    core_personality: row.core_personality ?? null,
    permanent_features: row.permanent_features ?? null,
    location: row.location ?? null,
    backstory: row.backstory ?? row.physical_description ?? null,
    photo_path: row.photo_path ?? null,
    featured_image_id: row.featured_image_id ?? null,
    world_id: row.world_id ?? null,
    is_public: row.is_public ?? false,
    created_at: row.created_at,
  };
}

/** Display helper: permanent identity + current version age from bible. */
export type CharacterDisplay = Character & {
  age?: string | null;
};

export function withBibleAge(
  character: Character,
  age: string | null | undefined
): CharacterDisplay {
  return { ...character, age: age ?? null };
}
