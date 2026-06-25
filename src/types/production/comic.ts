export type ComicIssue = {
  id: string;
  project_id: string;
  name: string;
  sort_order: number;
  created_at: string;
};

export type ComicPage = {
  id: string;
  issue_id: string;
  name: string;
  sort_order: number;
  created_at: string;
};

export type ComicPanel = {
  id: string;
  page_id: string;
  name: string;
  sort_order: number;
  surface_id: string | null;
  frame_x: number;
  frame_y: number;
  frame_width: number | null;
  frame_height: number | null;
  frame_rotation: number;
  created_at: string;
};

export type ComicPageWithPanels = ComicPage & {
  panels: ComicPanel[];
};

export type ComicIssueWithPages = ComicIssue & {
  pages: ComicPageWithPanels[];
};

export type ComicArtDirection = {
  id: string;
  project_id: string;
  art_style: string;
  notes: string;
  created_at: string;
};

export type ComicIssueRow = {
  id: string;
  project_id: string;
  name: string;
  sort_order?: number;
  created_at: string;
};

export type ComicPageRow = {
  id: string;
  issue_id: string;
  name: string;
  sort_order?: number;
  created_at: string;
};

export type ComicPanelRow = {
  id: string;
  page_id: string;
  name: string;
  sort_order?: number;
  surface_id?: string | null;
  frame_x?: number | null;
  frame_y?: number | null;
  frame_width?: number | null;
  frame_height?: number | null;
  frame_rotation?: number | null;
  created_at: string;
};

export type ComicArtDirectionRow = {
  id: string;
  project_id: string;
  art_style?: string;
  notes?: string;
  created_at: string;
};

export function normalizeComicIssue(row: ComicIssueRow): ComicIssue {
  return {
    id: row.id,
    project_id: row.project_id,
    name: row.name,
    sort_order: row.sort_order ?? 0,
    created_at: row.created_at,
  };
}

export function normalizeComicPage(row: ComicPageRow): ComicPage {
  return {
    id: row.id,
    issue_id: row.issue_id,
    name: row.name,
    sort_order: row.sort_order ?? 0,
    created_at: row.created_at,
  };
}

export function normalizeComicPanel(row: ComicPanelRow): ComicPanel {
  return {
    id: row.id,
    page_id: row.page_id,
    name: row.name,
    sort_order: row.sort_order ?? 0,
    surface_id: row.surface_id ?? null,
    frame_x: Number(row.frame_x ?? 0),
    frame_y: Number(row.frame_y ?? 0),
    frame_width: row.frame_width != null ? Number(row.frame_width) : null,
    frame_height: row.frame_height != null ? Number(row.frame_height) : null,
    frame_rotation: Number(row.frame_rotation ?? 0),
    created_at: row.created_at,
  };
}

export function normalizeComicArtDirection(
  row: ComicArtDirectionRow
): ComicArtDirection {
  return {
    id: row.id,
    project_id: row.project_id,
    art_style: row.art_style ?? "",
    notes: row.notes ?? "",
    created_at: row.created_at,
  };
}

export const COMIC_ART_STYLE_PRESETS = [
  "Manga",
  "Western Comic",
  "Cartoon",
  "Watercolor",
  "Realistic",
  "Custom",
] as const;

export type ComicArtStylePreset = (typeof COMIC_ART_STYLE_PRESETS)[number];
