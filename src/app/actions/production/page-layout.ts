"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidateProjectCanvas } from "@/lib/canvas/canvas-server";
import {
  ensurePageLayoutSurface,
  findPageLayoutSurface,
  panelBorderStyleFromPageLayoutSurface,
  panelResizeModeFromPageLayoutSurface,
  setPageLayoutPanelBorderStyle,
  setPageLayoutPanelResizeMode,
  setPageLayoutTemplateId,
  templateIdFromPageLayoutSurface,
  type PanelBorderStyle,
} from "@/lib/canvas/page-layout-surface";
import type { PanelResizeMode } from "@/lib/canvas/panel-resize-mode";
import {
  getPageLayoutTemplate,
  newPanelFrame,
  normalizePanelFrames,
  type PageLayoutTemplateId,
  type PanelFrameRect,
} from "@/lib/canvas/page-layout-templates";
import {
  createAndLinkPanelSurface,
  deleteSurfaceById,
} from "@/lib/canvas/link-surface";
import {
  assertProductionProject,
  defaultNameForSibling,
  formatProductionError,
  nextSortOrder,
  revalidateProjectProduction,
} from "@/lib/production-server";
import {
  normalizeComicPanel,
  type ComicPanel,
  type ComicPanelRow,
} from "@/types/production/comic";

export type PanelFrameUpdate = {
  panelId: string;
  frame: PanelFrameRect;
  rotation?: number;
};

async function assertComicPageOwned(
  supabase: Awaited<ReturnType<typeof createClient>>,
  projectId: string,
  pageId: string
): Promise<boolean> {
  const { data: page } = await supabase
    .from("comic_pages")
    .select("id, issue_id")
    .eq("id", pageId)
    .maybeSingle();

  if (!page) return false;

  const { data: issue } = await supabase
    .from("comic_issues")
    .select("id")
    .eq("id", page.issue_id as string)
    .eq("project_id", projectId)
    .maybeSingle();

  return Boolean(issue);
}

async function getPagePanels(
  supabase: Awaited<ReturnType<typeof createClient>>,
  pageId: string
): Promise<ComicPanel[]> {
  const { data } = await supabase
    .from("comic_panels")
    .select("*")
    .eq("page_id", pageId)
    .order("sort_order", { ascending: true });

  return (data ?? []).map((row) => normalizeComicPanel(row as ComicPanelRow));
}

async function deletePagePanels(
  supabase: Awaited<ReturnType<typeof createClient>>,
  projectId: string,
  pageId: string
): Promise<{ error?: string }> {
  const panels = await getPagePanels(supabase, pageId);

  for (const panel of panels) {
    if (panel.surface_id) {
      const deleted = await deleteSurfaceById(supabase, projectId, panel.surface_id);
      if (deleted.error) return deleted;
    }
  }

  const { error } = await supabase.from("comic_panels").delete().eq("page_id", pageId);
  if (error) return { error: formatProductionError(error.message, error.code) };
  return {};
}

async function createPanelWithFrame(
  supabase: Awaited<ReturnType<typeof createClient>>,
  projectId: string,
  pageId: string,
  frame: PanelFrameRect,
  index: number
): Promise<{ panel?: ComicPanel; error?: string }> {
  const sortOrder = index;
  const name = `Panel ${index + 1}`;

  const { data, error } = await supabase
    .from("comic_panels")
    .insert({
      page_id: pageId,
      name,
      sort_order: sortOrder,
      frame_x: frame.x,
      frame_y: frame.y,
      frame_width: frame.width,
      frame_height: frame.height,
      frame_rotation: 0,
    })
    .select("*")
    .single();

  if (error || !data) {
    return {
      error: formatProductionError(error?.message ?? "Failed to create panel.", error?.code),
    };
  }

  const linkResult = await createAndLinkPanelSurface(
    supabase,
    projectId,
    data.id as string
  );
  if (linkResult.error) {
    await supabase.from("comic_panels").delete().eq("id", data.id);
    return { error: linkResult.error };
  }

  const { data: linked, error: reloadError } = await supabase
    .from("comic_panels")
    .select("*")
    .eq("id", data.id)
    .single();

  if (reloadError || !linked) {
    return {
      error: formatProductionError(
        reloadError?.message ?? "Failed to load panel.",
        reloadError?.code
      ),
    };
  }

  return { panel: normalizeComicPanel(linked as ComicPanelRow) };
}


export async function getComicPageLayoutState(
  projectId: string,
  pageId: string
): Promise<{
  panels: ComicPanel[];
  templateId: PageLayoutTemplateId | null;
  panelBorderStyle: PanelBorderStyle;
  panelResizeMode: PanelResizeMode;
  error?: string;
}> {
  const supabase = await createClient();
  const check = await assertProductionProject(supabase, projectId, "comic");
  if (check.error) {
    return {
      panels: [],
      templateId: null,
      panelBorderStyle: "black",
      panelResizeMode: "linked",
      error: check.error,
    };
  }

  if (!(await assertComicPageOwned(supabase, projectId, pageId))) {
    return {
      panels: [],
      templateId: null,
      panelBorderStyle: "black",
      panelResizeMode: "linked",
      error: "Page not found.",
    };
  }

  const panels = await getPagePanels(supabase, pageId);
  const layoutSurface = await findPageLayoutSurface(supabase, projectId, pageId);

  return {
    panels,
    templateId: templateIdFromPageLayoutSurface(layoutSurface),
    panelBorderStyle: panelBorderStyleFromPageLayoutSurface(layoutSurface),
    panelResizeMode: panelResizeModeFromPageLayoutSurface(layoutSurface),
  };
}

export async function saveComicPagePanelBorderStyle(
  projectId: string,
  pageId: string,
  panelBorderStyle: PanelBorderStyle
): Promise<{ error?: string }> {
  const supabase = await createClient();
  const check = await assertProductionProject(supabase, projectId, "comic");
  if (check.error) return { error: check.error };

  if (!(await assertComicPageOwned(supabase, projectId, pageId))) {
    return { error: "Page not found." };
  }

  const result = await setPageLayoutPanelBorderStyle(
    supabase,
    projectId,
    pageId,
    panelBorderStyle
  );
  if (result.error) return result;

  revalidateProjectProduction(projectId);
  revalidateProjectCanvas(projectId);
  return {};
}

export async function saveComicPagePanelResizeMode(
  projectId: string,
  pageId: string,
  panelResizeMode: PanelResizeMode
): Promise<{ error?: string }> {
  const supabase = await createClient();
  const check = await assertProductionProject(supabase, projectId, "comic");
  if (check.error) return { error: check.error };

  if (!(await assertComicPageOwned(supabase, projectId, pageId))) {
    return { error: "Page not found." };
  }

  const result = await setPageLayoutPanelResizeMode(
    supabase,
    projectId,
    pageId,
    panelResizeMode
  );
  if (result.error) return result;

  revalidateProjectProduction(projectId);
  revalidateProjectCanvas(projectId);
  return {};
}

export async function applyComicPageTemplate(
  projectId: string,
  pageId: string,
  templateId: PageLayoutTemplateId
): Promise<{ panels: ComicPanel[]; error?: string }> {
  const template = getPageLayoutTemplate(templateId);
  if (!template) {
    return { panels: [], error: "Unknown layout template." };
  }

  const supabase = await createClient();
  const check = await assertProductionProject(supabase, projectId, "comic");
  if (check.error) return { panels: [], error: check.error };

  if (!(await assertComicPageOwned(supabase, projectId, pageId))) {
    return { panels: [], error: "Page not found." };
  }

  const cleared = await deletePagePanels(supabase, projectId, pageId);
  if (cleared.error) return { panels: [], error: cleared.error };

  const createdPanels: ComicPanel[] = [];
  for (let index = 0; index < template.panels.length; index += 1) {
    const result = await createPanelWithFrame(
      supabase,
      projectId,
      pageId,
      template.panels[index],
      index
    );
    if (result.error || !result.panel) {
      return { panels: createdPanels, error: result.error ?? "Failed to create panel." };
    }
    createdPanels.push(result.panel);
  }

  const templateResult = await setPageLayoutTemplateId(
    supabase,
    projectId,
    pageId,
    templateId
  );
  if (templateResult.error) {
    return { panels: createdPanels, error: templateResult.error };
  }

  revalidateProjectProduction(projectId);
  revalidateProjectCanvas(projectId);
  return { panels: createdPanels };
}

export async function saveComicPageLayout(
  projectId: string,
  pageId: string,
  updates: PanelFrameUpdate[],
  templateId?: PageLayoutTemplateId | null
): Promise<{ error?: string }> {
  const supabase = await createClient();
  const check = await assertProductionProject(supabase, projectId, "comic");
  if (check.error) return { error: check.error };

  if (!(await assertComicPageOwned(supabase, projectId, pageId))) {
    return { error: "Page not found." };
  }

  for (const update of updates) {
    const { data: panel } = await supabase
      .from("comic_panels")
      .select("id, page_id")
      .eq("id", update.panelId)
      .maybeSingle();

    if (!panel || panel.page_id !== pageId) {
      return { error: "Panel not found." };
    }

    const { error } = await supabase
      .from("comic_panels")
      .update({
        frame_x: update.frame.x,
        frame_y: update.frame.y,
        frame_width: update.frame.width,
        frame_height: update.frame.height,
        frame_rotation: update.rotation ?? 0,
      })
      .eq("id", update.panelId);

    if (error) {
      return { error: formatProductionError(error.message, error.code) };
    }
  }

  if (templateId !== undefined) {
    const templateResult = await setPageLayoutTemplateId(
      supabase,
      projectId,
      pageId,
      templateId
    );
    if (templateResult.error) return templateResult;
  }

  revalidateProjectProduction(projectId);
  revalidateProjectCanvas(projectId);
  return {};
}

export async function addComicPagePanel(
  projectId: string,
  pageId: string,
  frame?: PanelFrameRect
): Promise<{ panel?: ComicPanel; error?: string }> {
  const supabase = await createClient();
  const check = await assertProductionProject(supabase, projectId, "comic");
  if (check.error) return { error: check.error };

  if (!(await assertComicPageOwned(supabase, projectId, pageId))) {
    return { error: "Page not found." };
  }

  const existing = await getPagePanels(supabase, pageId);
  const panelFrame = frame ?? newPanelFrame(existing.length);
  const sortOrder = await nextSortOrder(supabase, "comic_panels", "page_id", pageId);
  const name = await defaultNameForSibling(
    supabase,
    "comic_panels",
    "page_id",
    pageId,
    "panel"
  );

  const { data, error } = await supabase
    .from("comic_panels")
    .insert({
      page_id: pageId,
      name,
      sort_order: sortOrder,
      frame_x: panelFrame.x,
      frame_y: panelFrame.y,
      frame_width: panelFrame.width,
      frame_height: panelFrame.height,
      frame_rotation: 0,
    })
    .select("*")
    .single();

  if (error || !data) {
    return {
      error: formatProductionError(error?.message ?? "Failed to create panel.", error?.code),
    };
  }

  const linkResult = await createAndLinkPanelSurface(
    supabase,
    projectId,
    data.id as string
  );
  if (linkResult.error) {
    await supabase.from("comic_panels").delete().eq("id", data.id);
    return { error: linkResult.error };
  }

  await setPageLayoutTemplateId(supabase, projectId, pageId, null);

  const { data: linked, error: reloadError } = await supabase
    .from("comic_panels")
    .select("*")
    .eq("id", data.id)
    .single();

  if (reloadError || !linked) {
    return {
      error: formatProductionError(
        reloadError?.message ?? "Failed to load panel.",
        reloadError?.code
      ),
    };
  }

  revalidateProjectProduction(projectId);
  revalidateProjectCanvas(projectId);
  return { panel: normalizeComicPanel(linked as ComicPanelRow) };
}

export async function deleteComicPagePanelFromLayout(
  projectId: string,
  panelId: string
): Promise<{ error?: string }> {
  const supabase = await createClient();
  const check = await assertProductionProject(supabase, projectId, "comic");
  if (check.error) return { error: check.error };

  const { data: panel } = await supabase
    .from("comic_panels")
    .select("id, page_id, surface_id")
    .eq("id", panelId)
    .maybeSingle();

  if (!panel) return { error: "Panel not found." };

  if (!(await assertComicPageOwned(supabase, projectId, panel.page_id as string))) {
    return { error: "Panel not found." };
  }

  if (panel.surface_id) {
    const deleted = await deleteSurfaceById(
      supabase,
      projectId,
      panel.surface_id as string
    );
    if (deleted.error) return deleted;
  }

  const { error } = await supabase.from("comic_panels").delete().eq("id", panelId);
  if (error) return { error: formatProductionError(error.message, error.code) };

  await setPageLayoutTemplateId(supabase, projectId, panel.page_id as string, null);

  revalidateProjectProduction(projectId);
  revalidateProjectCanvas(projectId);
  return {};
}

export { normalizePanelFrames };
