export type ScreenplayAct = {
  id: string;
  project_id: string;
  name: string;
  sort_order: number;
  created_at: string;
};

export type ScreenplayBeat = {
  id: string;
  act_id: string;
  name: string;
  sort_order: number;
  created_at: string;
};

export type ScreenplayActWithBeats = ScreenplayAct & {
  beats: ScreenplayBeat[];
};

export type ScreenplayActRow = {
  id: string;
  project_id: string;
  name: string;
  sort_order?: number;
  created_at: string;
};

export type ScreenplayBeatRow = {
  id: string;
  act_id: string;
  name: string;
  sort_order?: number;
  created_at: string;
};

export function normalizeScreenplayAct(row: ScreenplayActRow): ScreenplayAct {
  return {
    id: row.id,
    project_id: row.project_id,
    name: row.name,
    sort_order: row.sort_order ?? 0,
    created_at: row.created_at,
  };
}

export function normalizeScreenplayBeat(row: ScreenplayBeatRow): ScreenplayBeat {
  return {
    id: row.id,
    act_id: row.act_id,
    name: row.name,
    sort_order: row.sort_order ?? 0,
    created_at: row.created_at,
  };
}
