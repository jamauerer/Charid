"use server";

import { createClient } from "@/lib/supabase/server";
import {
  assertProductionProject,
} from "@/lib/production-server";
import {
  formatCanvasError,
  revalidateProjectCanvas,
} from "@/lib/canvas/canvas-server";
import { buildProductionSurfaceInsert } from "@/lib/canvas/build-surface-insert";
import { validateSurfaceConfigProfileV1 } from "@/lib/canvas/validate-config-profile-v1";
import { validateCanvasDocumentV1 } from "@/lib/canvas/validate-document-v1";
import { configProfileToJson } from "@/lib/canvas/surface-config-presets";
import { createDocumentVersion } from "@/app/actions/canvas/versions";
import {
  isSurfaceKindAllowedForWorkIntent,
  normalizeProductionSurface,
  parseSurfaceKind,
  type ProductionSurface,
  type ProductionSurfaceRow,
  type SurfaceKind,
} from "@/types/canvas/surface";

async function assertSurfaceOwned(
  projectId: string,
  surfaceId: string
): Promise<{ surface?: ProductionSurface; error?: string }> {
  const supabase = await createClient();
  const check = await assertProductionProject(supabase, projectId);
  if (check.error) return { error: check.error };

  const { data, error } = await supabase
    .from("production_surfaces")
    .select("*")
    .eq("id", surfaceId)
    .eq("project_id", projectId)
    .maybeSingle();

  if (error) {
    return { error: formatCanvasError(error.message, error.code) };
  }

  if (!data) {
    return { error: "Surface not found." };
  }

  return { surface: normalizeProductionSurface(data as ProductionSurfaceRow) };
}

export async function createSurface(
  projectId: string,
  surfaceKind: string
): Promise<{ surface?: ProductionSurface; error?: string }> {
  const kind = parseSurfaceKind(surfaceKind);
  if (!kind) {
    return { error: "Invalid surface kind." };
  }

  const supabase = await createClient();
  const check = await assertProductionProject(supabase, projectId);
  if (check.error) return { error: check.error };

  if (!isSurfaceKindAllowedForWorkIntent(check.workIntent, kind)) {
    return { error: "This surface kind is not available for this project format." };
  }

  const payload = buildProductionSurfaceInsert(projectId, kind);
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

  revalidateProjectCanvas(projectId);
  return { surface: normalizeProductionSurface(data as ProductionSurfaceRow) };
}

export async function getSurface(
  projectId: string,
  surfaceId: string
): Promise<{ surface?: ProductionSurface; error?: string }> {
  return assertSurfaceOwned(projectId, surfaceId);
}

export async function getSurfaceById(
  projectId: string,
  surfaceId: string
): Promise<{ surface?: ProductionSurface; error?: string }> {
  return getSurface(projectId, surfaceId);
}

export async function listSurfacesForProject(
  projectId: string,
  surfaceKind?: SurfaceKind
): Promise<{ surfaces: ProductionSurface[]; error?: string }> {
  const supabase = await createClient();
  const check = await assertProductionProject(supabase, projectId);
  if (check.error) return { surfaces: [], error: check.error };

  let query = supabase
    .from("production_surfaces")
    .select("*")
    .eq("project_id", projectId)
    .order("updated_at", { ascending: false });

  if (surfaceKind) {
    query = query.eq("surface_kind", surfaceKind);
  }

  const { data, error } = await query;

  if (error) {
    return {
      surfaces: [],
      error: formatCanvasError(error.message, error.code),
    };
  }

  return {
    surfaces: (data ?? []).map((row) =>
      normalizeProductionSurface(row as ProductionSurfaceRow)
    ),
  };
}

export async function updateSurfaceDocument(
  projectId: string,
  surfaceId: string,
  document: Record<string, unknown>,
  options?: { createVersion?: boolean; revisionLabel?: string | null }
): Promise<{ surface?: ProductionSurface; error?: string }> {
  const validation = validateCanvasDocumentV1(document);
  if (!validation.valid) {
    return { error: validation.error };
  }

  const owned = await assertSurfaceOwned(projectId, surfaceId);
  if (owned.error || !owned.surface) {
    return { error: owned.error ?? "Surface not found." };
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("production_surfaces")
    .update({
      canvas_document: validation.document as unknown as Record<string, unknown>,
      canvas_document_version: validation.document.schema_version,
    })
    .eq("id", surfaceId)
    .eq("project_id", projectId)
    .select("*")
    .single();

  if (error || !data) {
    return {
      error: formatCanvasError(error?.message ?? "Failed to update surface.", error?.code),
    };
  }

  if (options?.createVersion) {
    const versionResult = await createDocumentVersion(
      projectId,
      surfaceId,
      options.revisionLabel ?? "manual"
    );
    if (versionResult.error) {
      return { error: versionResult.error };
    }
  }

  revalidateProjectCanvas(projectId);
  return { surface: normalizeProductionSurface(data as ProductionSurfaceRow) };
}

export async function updateSurfaceConfigProfile(
  projectId: string,
  surfaceId: string,
  configProfile: Record<string, unknown>,
  options?: { templateId?: string | null }
): Promise<{ surface?: ProductionSurface; error?: string }> {
  const validation = validateSurfaceConfigProfileV1(configProfile);
  if (!validation.valid) {
    return { error: validation.error };
  }

  const owned = await assertSurfaceOwned(projectId, surfaceId);
  if (owned.error || !owned.surface) {
    return { error: owned.error ?? "Surface not found." };
  }

  const document =
    options?.templateId !== undefined
      ? {
          ...owned.surface.canvas_document,
          metadata: {
            ...(owned.surface.canvas_document.metadata ?? {}),
            template_id: options.templateId,
            template_applied_at: options.templateId ? new Date().toISOString() : null,
          },
        }
      : owned.surface.canvas_document;

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("production_surfaces")
    .update({
      config_profile: configProfileToJson(validation.profile),
      canvas_document: document,
    })
    .eq("id", surfaceId)
    .eq("project_id", projectId)
    .select("*")
    .single();

  if (error || !data) {
    return {
      error: formatCanvasError(error?.message ?? "Failed to update surface.", error?.code),
    };
  }

  revalidateProjectCanvas(projectId);
  return { surface: normalizeProductionSurface(data as ProductionSurfaceRow) };
}
