export type World = {
  id: string;
  user_id: string;
  name: string;
  slug: string;
  description: string | null;
  cover_image_path: string | null;
  is_public: boolean;
  created_at: string;
};

export type WorldRow = World & {
  is_public?: boolean;
};

export type WorldWithCounts = World & {
  character_count: number;
};

export function normalizeWorld(row: WorldRow): World {
  return {
    id: row.id,
    user_id: row.user_id,
    name: row.name,
    slug: row.slug,
    description: row.description ?? null,
    cover_image_path: row.cover_image_path ?? null,
    is_public: row.is_public ?? false,
    created_at: row.created_at,
  };
}

export function slugifyWorldName(value: string): string {
  const slug = value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9_-]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 50);

  return slug.length >= 2 ? slug : "world";
}
