export type Character = {
  id: string;
  user_id: string;
  name: string;
  gender: string | null;
  age: string | null;
  location: string | null;
  backstory: string | null;
  photo_path: string | null;
  created_at: string;
};

/** Raw row shape before migration (legacy column). */
export type CharacterRow = Character & {
  physical_description?: string | null;
};

export function normalizeCharacter(row: CharacterRow): Character {
  return {
    id: row.id,
    user_id: row.user_id,
    name: row.name,
    gender: row.gender ?? null,
    age: row.age ?? null,
    location: row.location ?? null,
    backstory: row.backstory ?? row.physical_description ?? null,
    photo_path: row.photo_path ?? null,
    created_at: row.created_at,
  };
}
