"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidateProjectCanvas } from "@/lib/canvas/canvas-server";
import { createAndLinkSpreadSurface } from "@/lib/canvas/link-surface";
import { parseSurfaceConfigProfile } from "@/lib/canvas/parse-config-profile";
import {
  getSpreadLayoutTemplate,
  newSpreadZone,
  type SpreadLayoutTemplateId,
} from "@/lib/canvas/spread-layout-templates";
import { configProfileToJson } from "@/lib/canvas/surface-config-presets";
import { validateSurfaceConfigProfileV1 } from "@/lib/canvas/validate-config-profile-v1";
import {
  assertProductionProject,
  formatProductionError,
  revalidateProjectProduction,
} from "@/lib/production-server";
import type { ReadingZoneV1 } from "@/types/canvas/config-profile-v1";
import {
  normalizeProductionSurface,
  type ProductionSurface,
  type ProductionSurfaceRow,
} from "@/types/canvas/surface";

export type SpreadLayoutState = {
  surfaceId: string;
  zones: ReadingZoneV1[];
  templateId: SpreadLayoutTemplateId | null;
  width: number;
  height: number;
};

async function getSpreadRow(
  supabase: Awaited<ReturnType<typeof createClient>>,
  projectId: string,
  spreadId: string
) {
  const { data } = await supabase
    .from("storybook_spreads")
    .select("id, surface_id")
    .eq("id", spreadId)
    .eq("project_id", projectId)
    .maybeSingle();
  return data;
}

async function ensureSpreadSurfaceRecord(
  supabase: Awaited<ReturnType<typeof createClient>>,
  projectId: string,
  spreadId: string
): Promise<{ surface?: ProductionSurface; error?: string }> {
  const linked = await createAndLinkSpreadSurface(supabase, projectId, spreadId);
  if (linked.error || !linked.surface) {
    return { error: linked.error ?? "Failed to load spread surface." };
  }
  return { surface: linked.surface };
}

function templateIdFromSurface(surface: ProductionSurface): SpreadLayoutTemplateId | null {
  const metadata = surface.canvas_document.metadata;
  if (metadata && typeof metadata === "object" && "template_id" in metadata) {
    const templateId = (metadata as { template_id?: unknown }).template_id;
    return typeof templateId === "string" ? (templateId as SpreadLayoutTemplateId) : null;
  }
  return null;
}

async function persistSpreadLayout(
  supabase: Awaited<ReturnType<typeof createClient>>,
  projectId: string,
  surface: ProductionSurface,
  zones: ReadingZoneV1[],
  templateId: SpreadLayoutTemplateId | null
): Promise<{ surface?: ProductionSurface; error?: string }> {
  const profile = parseSurfaceConfigProfile(surface.config_profile);
  if (!profile) {
    return { error: "Invalid spread configuration." };
  }

  const nextProfile = {
    ...profile,
    reading_zones: zones,
  };

  const validation = validateSurfaceConfigProfileV1(nextProfile);
  if (!validation.valid) {
    return { error: validation.error };
  }

  const document = {
    ...surface.canvas_document,
    metadata: {
      ...(surface.canvas_document.metadata ?? {}),
      template_id: templateId,
      template_applied_at: templateId ? new Date().toISOString() : null,
    },
  };

  const { data, error } = await supabase
    .from("production_surfaces")
    .update({
      config_profile: configProfileToJson(validation.profile),
      canvas_document: document,
    })
    .eq("id", surface.id)
    .eq("project_id", projectId)
    .select("*")
    .single();

  if (error || !data) {
    return {
      error: formatProductionError(error?.message ?? "Failed to save spread layout.", error?.code),
    };
  }

  return { surface: normalizeProductionSurface(data as ProductionSurfaceRow) };
}

export async function getStorybookSpreadLayoutState(
  projectId: string,
  spreadId: string
): Promise<{ data?: SpreadLayoutState; error?: string }> {
  const supabase = await createClient();
  const check = await assertProductionProject(supabase, projectId, "picture_book");
  if (check.error) return { error: check.error };

  const spread = await getSpreadRow(supabase, projectId, spreadId);
  if (!spread) return { error: "Spread not found." };

  const ensured = await ensureSpreadSurfaceRecord(supabase, projectId, spreadId);
  if (ensured.error || !ensured.surface) {
    return { error: ensured.error ?? "Failed to load spread surface." };
  }

  const profile = parseSurfaceConfigProfile(ensured.surface.config_profile);
  const zones = profile?.reading_zones ?? [];

  return {
    data: {
      surfaceId: ensured.surface.id,
      zones,
      templateId: templateIdFromSurface(ensured.surface),
      width: ensured.surface.width,
      height: ensured.surface.height,
    },
  };
}

export async function applyStorybookSpreadTemplate(
  projectId: string,
  spreadId: string,
  templateId: SpreadLayoutTemplateId
): Promise<{ data?: SpreadLayoutState; error?: string }> {
  const template = getSpreadLayoutTemplate(templateId);
  if (!template) return { error: "Unknown spread template." };

  const supabase = await createClient();
  const check = await assertProductionProject(supabase, projectId, "picture_book");
  if (check.error) return { error: check.error };

  const spread = await getSpreadRow(supabase, projectId, spreadId);
  if (!spread) return { error: "Spread not found." };

  const ensured = await ensureSpreadSurfaceRecord(supabase, projectId, spreadId);
  if (ensured.error || !ensured.surface) {
    return { error: ensured.error ?? "Failed to load spread surface." };
  }

  const saved = await persistSpreadLayout(
    supabase,
    projectId,
    ensured.surface,
    template.zones.map((zone) => ({ ...zone })),
    templateId
  );
  if (saved.error || !saved.surface) {
    return { error: saved.error ?? "Failed to apply template." };
  }

  revalidateProjectProduction(projectId);
  revalidateProjectCanvas(projectId);

  return {
    data: {
      surfaceId: saved.surface.id,
      zones: template.zones,
      templateId,
      width: saved.surface.width,
      height: saved.surface.height,
    },
  };
}

export async function saveStorybookSpreadLayout(
  projectId: string,
  spreadId: string,
  zones: ReadingZoneV1[],
  templateId?: SpreadLayoutTemplateId | null
): Promise<{ error?: string }> {
  const supabase = await createClient();
  const check = await assertProductionProject(supabase, projectId, "picture_book");
  if (check.error) return { error: check.error };

  const spread = await getSpreadRow(supabase, projectId, spreadId);
  if (!spread) return { error: "Spread not found." };

  const ensured = await ensureSpreadSurfaceRecord(supabase, projectId, spreadId);
  if (ensured.error || !ensured.surface) {
    return { error: ensured.error ?? "Failed to load spread surface." };
  }

  const saved = await persistSpreadLayout(
    supabase,
    projectId,
    ensured.surface,
    zones,
    templateId === undefined ? templateIdFromSurface(ensured.surface) : templateId
  );
  if (saved.error) return { error: saved.error };

  revalidateProjectProduction(projectId);
  revalidateProjectCanvas(projectId);
  return {};
}

export async function addStorybookSpreadRegion(
  projectId: string,
  spreadId: string,
  role: ReadingZoneV1["role"]
): Promise<{ zones: ReadingZoneV1[]; error?: string }> {
  const state = await getStorybookSpreadLayoutState(projectId, spreadId);
  if (state.error || !state.data) {
    return { zones: [], error: state.error ?? "Failed to load spread." };
  }

  const zones = [...state.data.zones, newSpreadZone(role, state.data.zones.length)];
  const saved = await saveStorybookSpreadLayout(projectId, spreadId, zones, null);
  if (saved.error) return { zones: state.data.zones, error: saved.error };

  return { zones };
}

export async function deleteStorybookSpreadRegion(
  projectId: string,
  spreadId: string,
  zoneId: string
): Promise<{ zones: ReadingZoneV1[]; error?: string }> {
  const state = await getStorybookSpreadLayoutState(projectId, spreadId);
  if (state.error || !state.data) {
    return { zones: [], error: state.error ?? "Failed to load spread." };
  }

  const zones = state.data.zones.filter((zone) => zone.id !== zoneId);
  const saved = await saveStorybookSpreadLayout(projectId, spreadId, zones, null);
  if (saved.error) return { zones: state.data.zones, error: saved.error };

  return { zones };
}
