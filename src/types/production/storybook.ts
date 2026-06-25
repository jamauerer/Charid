export type StorybookSettings = {
  id: string;
  project_id: string;
  age_range: string;
  reading_level: string;
  educational_goals: string;
  created_at: string;
};

export type StorybookSpread = {
  id: string;
  project_id: string;
  name: string;
  sort_order: number;
  surface_id: string | null;
  created_at: string;
};

export type StorybookSettingsRow = {
  id: string;
  project_id: string;
  age_range?: string;
  reading_level?: string;
  educational_goals?: string;
  created_at: string;
};

export type StorybookSpreadRow = {
  id: string;
  project_id: string;
  name: string;
  sort_order?: number;
  surface_id?: string | null;
  created_at: string;
};

export function normalizeStorybookSettings(
  row: StorybookSettingsRow
): StorybookSettings {
  return {
    id: row.id,
    project_id: row.project_id,
    age_range: row.age_range ?? "",
    reading_level: row.reading_level ?? "",
    educational_goals: row.educational_goals ?? "",
    created_at: row.created_at,
  };
}

export function normalizeStorybookSpread(row: StorybookSpreadRow): StorybookSpread {
  return {
    id: row.id,
    project_id: row.project_id,
    name: row.name,
    sort_order: row.sort_order ?? 0,
    surface_id: row.surface_id ?? null,
    created_at: row.created_at,
  };
}
