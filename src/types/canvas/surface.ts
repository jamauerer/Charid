export const SURFACE_KINDS = [
  "comic_panel",
  "storybook_spread",
  "comic_page_layout",
  "character_sheet",
  "lore_page",
  "worksheet",
  "portfolio_page",
  "marketing_page",
] as const;

export type SurfaceKind = (typeof SURFACE_KINDS)[number];

export type ProductionSurface = {
  id: string;
  project_id: string;
  surface_kind: SurfaceKind;
  config_profile: Record<string, unknown>;
  width: number;
  height: number;
  canvas_document: Record<string, unknown>;
  canvas_document_version: number;
  created_at: string;
  updated_at: string;
};

export type ProductionSurfaceRow = {
  id: string;
  project_id: string;
  surface_kind: string;
  config_profile?: Record<string, unknown> | null;
  width: number;
  height: number;
  canvas_document: Record<string, unknown>;
  canvas_document_version?: number;
  created_at: string;
  updated_at: string;
};

export function normalizeProductionSurface(row: ProductionSurfaceRow): ProductionSurface {
  return {
    id: row.id,
    project_id: row.project_id,
    surface_kind: row.surface_kind as SurfaceKind,
    config_profile: row.config_profile ?? {},
    width: row.width,
    height: row.height,
    canvas_document: row.canvas_document,
    canvas_document_version: row.canvas_document_version ?? 1,
    created_at: row.created_at,
    updated_at: row.updated_at,
  };
}

export function parseSurfaceKind(value: string): SurfaceKind | null {
  return SURFACE_KINDS.includes(value as SurfaceKind) ? (value as SurfaceKind) : null;
}

export const SURFACE_KIND_FOR_WORK_INTENT: Partial<
  Record<string, SurfaceKind[]>
> = {
  comic: ["comic_panel", "comic_page_layout"],
  picture_book: ["storybook_spread"],
};

export function isSurfaceKindAllowedForWorkIntent(
  workIntent: string | null,
  kind: SurfaceKind
): boolean {
  if (!workIntent) return false;
  const allowed = SURFACE_KIND_FOR_WORK_INTENT[workIntent];
  if (!allowed) return false;
  return allowed.includes(kind);
}
