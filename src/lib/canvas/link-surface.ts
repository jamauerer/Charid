import { createClient } from "@/lib/supabase/server";
import { buildProductionSurfaceInsert } from "@/lib/canvas/build-surface-insert";
import { formatCanvasError } from "@/lib/canvas/canvas-server";
import {
  normalizeProductionSurface,
  type ProductionSurface,
  type ProductionSurfaceRow,
} from "@/types/canvas/surface";

type SupabaseClient = Awaited<ReturnType<typeof createClient>>;

export type LinkSurfaceResult = {
  surface?: ProductionSurface;
  error?: string;
};

export async function insertProductionSurface(
  supabase: SupabaseClient,
  projectId: string,
  surfaceKind: "comic_panel" | "storybook_spread"
): Promise<LinkSurfaceResult> {
  const payload = buildProductionSurfaceInsert(projectId, surfaceKind);

  const { data, error } = await supabase
    .from("production_surfaces")
    .insert(payload)
    .select("*")
    .single();

  if (error || !data) {
    return {
      error: formatCanvasError(error?.message ?? "Failed to create surface.", error?.code),
    };
  }

  return { surface: normalizeProductionSurface(data as ProductionSurfaceRow) };
}

export async function deleteSurfaceById(
  supabase: SupabaseClient,
  projectId: string,
  surfaceId: string
): Promise<{ error?: string }> {
  const { error } = await supabase
    .from("production_surfaces")
    .delete()
    .eq("id", surfaceId)
    .eq("project_id", projectId);

  if (error) {
    return { error: formatCanvasError(error.message, error.code) };
  }

  return {};
}

async function assertComicPanelOwned(
  supabase: SupabaseClient,
  projectId: string,
  panelId: string
): Promise<{ pageId: string } | null> {
  const { data: panel } = await supabase
    .from("comic_panels")
    .select("id, page_id, surface_id")
    .eq("id", panelId)
    .maybeSingle();

  if (!panel) return null;

  const { data: page } = await supabase
    .from("comic_pages")
    .select("id, issue_id")
    .eq("id", panel.page_id as string)
    .maybeSingle();

  if (!page) return null;

  const { data: issue } = await supabase
    .from("comic_issues")
    .select("id")
    .eq("id", page.issue_id as string)
    .eq("project_id", projectId)
    .maybeSingle();

  if (!issue) return null;

  return { pageId: panel.page_id as string };
}

export async function createAndLinkPanelSurface(
  supabase: SupabaseClient,
  projectId: string,
  panelId: string
): Promise<LinkSurfaceResult> {
  const owned = await assertComicPanelOwned(supabase, projectId, panelId);
  if (!owned) {
    return { error: "Panel not found." };
  }

  const { data: panel } = await supabase
    .from("comic_panels")
    .select("id, surface_id")
    .eq("id", panelId)
    .maybeSingle();

  if (!panel) {
    return { error: "Panel not found." };
  }

  if (panel.surface_id) {
    const { data: existing } = await supabase
      .from("production_surfaces")
      .select("*")
      .eq("id", panel.surface_id as string)
      .eq("project_id", projectId)
      .maybeSingle();

    if (existing) {
      return { surface: normalizeProductionSurface(existing as ProductionSurfaceRow) };
    }
  }

  const created = await insertProductionSurface(supabase, projectId, "comic_panel");
  if (created.error || !created.surface) {
    return { error: created.error ?? "Failed to create panel surface." };
  }

  const { error: linkError } = await supabase
    .from("comic_panels")
    .update({ surface_id: created.surface.id })
    .eq("id", panelId);

  if (linkError) {
    await deleteSurfaceById(supabase, projectId, created.surface.id);
    return { error: formatCanvasError(linkError.message, linkError.code) };
  }

  return created;
}

export async function createAndLinkSpreadSurface(
  supabase: SupabaseClient,
  projectId: string,
  spreadId: string
): Promise<LinkSurfaceResult> {
  const { data: spread } = await supabase
    .from("storybook_spreads")
    .select("id, surface_id")
    .eq("id", spreadId)
    .eq("project_id", projectId)
    .maybeSingle();

  if (!spread) {
    return { error: "Spread not found." };
  }

  if (spread.surface_id) {
    const { data: existing } = await supabase
      .from("production_surfaces")
      .select("*")
      .eq("id", spread.surface_id as string)
      .eq("project_id", projectId)
      .maybeSingle();

    if (existing) {
      return { surface: normalizeProductionSurface(existing as ProductionSurfaceRow) };
    }
  }

  const created = await insertProductionSurface(supabase, projectId, "storybook_spread");
  if (created.error || !created.surface) {
    return { error: created.error ?? "Failed to create spread surface." };
  }

  const { error: linkError } = await supabase
    .from("storybook_spreads")
    .update({ surface_id: created.surface.id })
    .eq("id", spreadId)
    .eq("project_id", projectId);

  if (linkError) {
    await deleteSurfaceById(supabase, projectId, created.surface.id);
    return { error: formatCanvasError(linkError.message, linkError.code) };
  }

  return created;
}
