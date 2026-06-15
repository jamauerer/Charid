export type CharacterImage = {
  id: string;
  character_id: string;
  image_path: string;
  caption: string | null;
  sort_order: number;
  created_at: string;
};

export type CharacterImageRow = CharacterImage;

export type CharacterImageWithUrl = CharacterImage & {
  url: string | null;
};

export function normalizeCharacterImage(row: CharacterImageRow): CharacterImage {
  return {
    id: row.id,
    character_id: row.character_id,
    image_path: row.image_path,
    caption: row.caption ?? null,
    sort_order: row.sort_order ?? 0,
    created_at: row.created_at,
  };
}
