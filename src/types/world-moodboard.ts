export type WorldMoodboard = {
  id: string;
  world_id: string;
  user_id: string;
  title: string;
  created_at: string;
  updated_at: string;
};

export type WorldMoodboardRow = {
  id: string;
  world_id: string;
  user_id: string;
  title: string;
  created_at: string;
  updated_at: string;
};

export function normalizeWorldMoodboard(row: WorldMoodboardRow): WorldMoodboard {
  return {
    id: row.id,
    world_id: row.world_id,
    user_id: row.user_id,
    title: row.title,
    created_at: row.created_at,
    updated_at: row.updated_at,
  };
}

export type WorldMoodboardItem = {
  id: string;
  moodboard_id: string;
  world_image_id: string;
  caption: string | null;
  sort_order: number;
  created_at: string;
};

export type WorldMoodboardItemRow = {
  id: string;
  moodboard_id: string;
  world_image_id: string;
  caption?: string | null;
  sort_order?: number;
  created_at: string;
};

export function normalizeWorldMoodboardItem(
  row: WorldMoodboardItemRow
): WorldMoodboardItem {
  return {
    id: row.id,
    moodboard_id: row.moodboard_id,
    world_image_id: row.world_image_id,
    caption: row.caption ?? null,
    sort_order: row.sort_order ?? 0,
    created_at: row.created_at,
  };
}

export type WorldMoodboardItemWithUrl = {
  item: WorldMoodboardItem;
  imageUrl: string | null;
};

export type WorldMoodboardBundle = {
  moodboard: WorldMoodboard;
  items: WorldMoodboardItemWithUrl[];
};
