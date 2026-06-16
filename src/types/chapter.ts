export type Chapter = {
  id: string;
  story_id: string;
  title: string;
  content: string;
  sort_order: number;
  created_at: string;
};

export type ChapterRow = Chapter & {
  sort_order?: number;
};

export function normalizeChapter(row: ChapterRow): Chapter {
  return {
    id: row.id,
    story_id: row.story_id,
    title: row.title,
    content: row.content ?? "",
    sort_order: row.sort_order ?? 0,
    created_at: row.created_at,
  };
}
