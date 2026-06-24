export type NovelPart = {
  id: string;
  project_id: string;
  name: string;
  sort_order: number;
  created_at: string;
};

export type NovelChapter = {
  id: string;
  part_id: string;
  name: string;
  sort_order: number;
  created_at: string;
};

export type NovelPartWithChapters = NovelPart & {
  chapters: NovelChapter[];
};

export type NovelPartRow = {
  id: string;
  project_id: string;
  name: string;
  sort_order?: number;
  created_at: string;
};

export type NovelChapterRow = {
  id: string;
  part_id: string;
  name: string;
  sort_order?: number;
  created_at: string;
};

export function normalizeNovelPart(row: NovelPartRow): NovelPart {
  return {
    id: row.id,
    project_id: row.project_id,
    name: row.name,
    sort_order: row.sort_order ?? 0,
    created_at: row.created_at,
  };
}

export function normalizeNovelChapter(row: NovelChapterRow): NovelChapter {
  return {
    id: row.id,
    part_id: row.part_id,
    name: row.name,
    sort_order: row.sort_order ?? 0,
    created_at: row.created_at,
  };
}
