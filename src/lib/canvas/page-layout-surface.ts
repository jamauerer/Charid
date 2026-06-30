import { buildProductionSurfaceInsert } from "@/lib/canvas/build-surface-insert";
import { formatCanvasError } from "@/lib/canvas/canvas-server";
import {
  DEFAULT_PANEL_RESIZE_MODE,
  parsePanelResizeMode,
  type PanelResizeMode,
} from "@/lib/canvas/panel-resize-mode";
import type { PageLayoutTemplateId } from "@/lib/canvas/page-layout-templates";
import { normalizePageLayoutTemplateId } from "@/lib/canvas/page-layout-templates";
import {
  normalizeProductionSurface,
  type ProductionSurface,
  type ProductionSurfaceRow,
} from "@/types/canvas/surface";

export type PanelBorderStyle = "black" | "white" | "none";

type ServerClient = Awaited<
  ReturnType<typeof import("@/lib/supabase/server").createClient>
>;

type PageLayoutMetadataPatch = {
  template_id?: PageLayoutTemplateId | null;
  template_applied_at?: string | null;
  panel_border_style?: PanelBorderStyle;
  panel_resize_mode?: PanelResizeMode;
};

function pageMetadata(surface: ProductionSurface): Record<string, unknown> {
  const metadata = surface.canvas_document.metadata;
  return metadata && typeof metadata === "object" ? { ...metadata } : {};
}

function pageIdFromSurface(surface: ProductionSurface): string | null {
  const metadata = pageMetadata(surface);
  const pageId = metadata.page_id;
  return typeof pageId === "string" ? pageId : null;
}

async function updatePageLayoutMetadata(
  supabase: ServerClient,
  projectId: string,
  pageId: string,
  patch: PageLayoutMetadataPatch
): Promise<{ error?: string }> {
  const ensured = await ensurePageLayoutSurface(supabase, projectId, pageId);
  if (ensured.error || !ensured.surface) {
    return { error: ensured.error ?? "Failed to load page layout." };
  }

  const merged = {
    ...pageMetadata(ensured.surface),
    page_id: pageId,
    ...patch,
  };

  const document = {
    ...ensured.surface.canvas_document,
    metadata: merged,
  };

  const { error } = await supabase
    .from("production_surfaces")
    .update({ canvas_document: document })
    .eq("id", ensured.surface.id)
    .eq("project_id", projectId);

  if (error) {
    return { error: formatCanvasError(error.message, error.code) };
  }

  return {};
}

export async function findPageLayoutSurface(
  supabase: ServerClient,
  projectId: string,
  pageId: string
): Promise<ProductionSurface | null> {
  const { data, error } = await supabase
    .from("production_surfaces")
    .select("*")
    .eq("project_id", projectId)
    .eq("surface_kind", "comic_page_layout");

  if (error || !data) return null;

  for (const row of data) {
    const surface = normalizeProductionSurface(row as ProductionSurfaceRow);
    if (pageIdFromSurface(surface) === pageId) {
      return surface;
    }
  }

  return null;
}

export async function ensurePageLayoutSurface(
  supabase: ServerClient,
  projectId: string,
  pageId: string
): Promise<{ surface?: ProductionSurface; error?: string }> {
  const existing = await findPageLayoutSurface(supabase, projectId, pageId);
  if (existing) return { surface: existing };

  const payload = buildProductionSurfaceInsert(projectId, "comic_page_layout");
  const document = {
    ...payload.canvas_document,
    metadata: { page_id: pageId },
  };

  const { data, error } = await supabase
    .from("production_surfaces")
    .insert({
      ...payload,
      canvas_document: document,
    })
    .select("*")
    .single();

  if (error || !data) {
    return {
      error: formatCanvasError(error?.message ?? "Failed to create page layout.", error?.code),
    };
  }

  return { surface: normalizeProductionSurface(data as ProductionSurfaceRow) };
}

export async function setPageLayoutTemplateId(
  supabase: ServerClient,
  projectId: string,
  pageId: string,
  templateId: PageLayoutTemplateId | null
): Promise<{ error?: string }> {
  return updatePageLayoutMetadata(supabase, projectId, pageId, {
    template_id: templateId,
    template_applied_at: templateId ? new Date().toISOString() : null,
  });
}

export async function setPageLayoutPanelBorderStyle(
  supabase: ServerClient,
  projectId: string,
  pageId: string,
  panelBorderStyle: PanelBorderStyle
): Promise<{ error?: string }> {
  return updatePageLayoutMetadata(supabase, projectId, pageId, {
    panel_border_style: panelBorderStyle,
  });
}

export function templateIdFromPageLayoutSurface(
  surface: ProductionSurface | null
): PageLayoutTemplateId | null {
  if (!surface) return null;
  const templateId = pageMetadata(surface).template_id;
  return normalizePageLayoutTemplateId(
    typeof templateId === "string" ? templateId : null
  );
}

export function panelBorderStyleFromPageLayoutSurface(
  surface: ProductionSurface | null
): PanelBorderStyle {
  if (!surface) return "black";
  const style = pageMetadata(surface).panel_border_style;
  if (style === "white" || style === "none") return style;
  return "black";
}

export function panelResizeModeFromPageLayoutSurface(
  surface: ProductionSurface | null
): PanelResizeMode {
  if (!surface) return DEFAULT_PANEL_RESIZE_MODE;
  return parsePanelResizeMode(pageMetadata(surface).panel_resize_mode);
}

export async function setPageLayoutPanelResizeMode(
  supabase: ServerClient,
  projectId: string,
  pageId: string,
  panelResizeMode: PanelResizeMode
): Promise<{ error?: string }> {
  return updatePageLayoutMetadata(supabase, projectId, pageId, {
    panel_resize_mode: panelResizeMode,
  });
}
