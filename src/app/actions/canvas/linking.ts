"use server";

import { createClient } from "@/lib/supabase/server";
import {
  assertProductionProject,
  revalidateProjectProduction,
} from "@/lib/production-server";
import { formatCanvasError, revalidateProjectCanvas } from "@/lib/canvas/canvas-server";
import {
  createAndLinkPanelSurface,
  createAndLinkSpreadSurface,
  deleteSurfaceById,
} from "@/lib/canvas/link-surface";
import type { ProductionSurface } from "@/types/canvas/surface";

export async function ensurePanelSurface(
  projectId: string,
  panelId: string
): Promise<{ surface?: ProductionSurface; error?: string }> {
  const supabase = await createClient();
  const check = await assertProductionProject(supabase, projectId, "comic");
  if (check.error) return { error: check.error };

  const result = await createAndLinkPanelSurface(supabase, projectId, panelId);
  if (result.error) return { error: result.error };

  revalidateProjectProduction(projectId);
  revalidateProjectCanvas(projectId);
  return { surface: result.surface };
}

export async function ensureSpreadSurface(
  projectId: string,
  spreadId: string
): Promise<{ surface?: ProductionSurface; error?: string }> {
  const supabase = await createClient();
  const check = await assertProductionProject(supabase, projectId, "picture_book");
  if (check.error) return { error: check.error };

  const result = await createAndLinkSpreadSurface(supabase, projectId, spreadId);
  if (result.error) return { error: result.error };

  revalidateProjectProduction(projectId);
  revalidateProjectCanvas(projectId);
  return { surface: result.surface };
}

export async function unlinkSurface(
  projectId: string,
  surfaceId: string
): Promise<{ error?: string }> {
  const supabase = await createClient();
  const check = await assertProductionProject(supabase, projectId);
  if (check.error) return { error: check.error };

  const { data: surface } = await supabase
    .from("production_surfaces")
    .select("id, surface_kind")
    .eq("id", surfaceId)
    .eq("project_id", projectId)
    .maybeSingle();

  if (!surface) {
    return { error: "Surface not found." };
  }

  if (surface.surface_kind === "comic_panel") {
    const { error } = await supabase
      .from("comic_panels")
      .update({ surface_id: null })
      .eq("surface_id", surfaceId);

    if (error) {
      return { error: formatCanvasError(error.message, error.code) };
    }
  } else if (surface.surface_kind === "storybook_spread") {
    const { error } = await supabase
      .from("storybook_spreads")
      .update({ surface_id: null })
      .eq("surface_id", surfaceId)
      .eq("project_id", projectId);

    if (error) {
      return { error: formatCanvasError(error.message, error.code) };
    }
  }

  const deleted = await deleteSurfaceById(supabase, projectId, surfaceId);
  if (deleted.error) return deleted;

  revalidateProjectProduction(projectId);
  revalidateProjectCanvas(projectId);
  return {};
}

export async function deleteLinkedSurface(
  projectId: string,
  surfaceId: string
): Promise<{ error?: string }> {
  return unlinkSurface(projectId, surfaceId);
}
