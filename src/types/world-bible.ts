export type WorldBible = {
  world_id: string;
  user_id: string;
  genre: string | null;
  tone: string | null;
  themes: string | null;
  rules: string | null;
  era: string | null;
  climate: string | null;
  overview: string | null;
  version_label: string;
  is_current: boolean;
  created_at: string;
  updated_at: string;
};

export type WorldBibleRow = WorldBible;

export function emptyWorldBible(
  worldId: string,
  userId: string
): WorldBible {
  const now = new Date().toISOString();
  return {
    world_id: worldId,
    user_id: userId,
    genre: null,
    tone: null,
    themes: null,
    rules: null,
    era: null,
    climate: null,
    overview: null,
    version_label: "Current",
    is_current: true,
    created_at: now,
    updated_at: now,
  };
}

export function normalizeWorldBible(row: WorldBibleRow): WorldBible {
  return {
    world_id: row.world_id,
    user_id: row.user_id,
    genre: row.genre ?? null,
    tone: row.tone ?? null,
    themes: row.themes ?? null,
    rules: row.rules ?? null,
    era: row.era ?? null,
    climate: row.climate ?? null,
    overview: row.overview ?? null,
    version_label: row.version_label ?? "Current",
    is_current: row.is_current ?? true,
    created_at: row.created_at,
    updated_at: row.updated_at,
  };
}
