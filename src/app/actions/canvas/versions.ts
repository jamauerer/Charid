"use server";

import { createClient } from "@/lib/supabase/server";
import { assertProductionProject } from "@/lib/production-server";
import { formatCanvasError } from "@/lib/canvas/canvas-server";
import {
  normalizeCanvasDocumentVersion,
  type CanvasDocumentVersion,
  type CanvasDocumentVersionRow,
} from "@/types/canvas/version";
import { validateCanvasDocumentV1 } from "@/lib/canvas/validate-document-v1";
import { CANVAS_DOCUMENT_SCHEMA_VERSION } from "@/types/canvas/document-v1";

export async function createDocumentVersion(
  projectId: string,
  surfaceId: string,
  revisionLabel?: string | null
): Promise<{ version?: CanvasDocumentVersion; error?: string }> {
  const supabase = await createClient();
  const check = await assertProductionProject(supabase, projectId);
  if (check.error) return { error: check.error };

  const { data: surface, error: surfaceError } = await supabase
    .from("production_surfaces")
    .select("id, canvas_document, canvas_document_version")
    .eq("id", surfaceId)
    .eq("project_id", projectId)
    .maybeSingle();

  if (surfaceError) {
    return { error: formatCanvasError(surfaceError.message, surfaceError.code) };
  }

  if (!surface) {
    return { error: "Surface not found." };
  }

  const validation = validateCanvasDocumentV1(surface.canvas_document);
  if (!validation.valid) {
    return { error: validation.error };
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data, error } = await supabase
    .from("canvas_document_versions")
    .insert({
      surface_id: surfaceId,
      project_id: projectId,
      schema_version: surface.canvas_document_version ?? CANVAS_DOCUMENT_SCHEMA_VERSION,
      document_snapshot: validation.document as unknown as Record<string, unknown>,
      revision_label: revisionLabel ?? null,
      created_by: user?.id ?? null,
    })
    .select("*")
    .single();

  if (error || !data) {
    return {
      error: formatCanvasError(
        error?.message ?? "Failed to create document version.",
        error?.code
      ),
    };
  }

  return { version: normalizeCanvasDocumentVersion(data as CanvasDocumentVersionRow) };
}

export async function listDocumentVersions(
  projectId: string,
  surfaceId: string,
  limit = 50
): Promise<{ versions: CanvasDocumentVersion[]; error?: string }> {
  const supabase = await createClient();
  const check = await assertProductionProject(supabase, projectId);
  if (check.error) return { versions: [], error: check.error };

  const { data: surface } = await supabase
    .from("production_surfaces")
    .select("id")
    .eq("id", surfaceId)
    .eq("project_id", projectId)
    .maybeSingle();

  if (!surface) {
    return { versions: [], error: "Surface not found." };
  }

  const { data, error } = await supabase
    .from("canvas_document_versions")
    .select("*")
    .eq("surface_id", surfaceId)
    .eq("project_id", projectId)
    .order("created_at", { ascending: false })
    .limit(Math.min(Math.max(limit, 1), 100));

  if (error) {
    return {
      versions: [],
      error: formatCanvasError(error.message, error.code),
    };
  }

  return {
    versions: (data ?? []).map((row) =>
      normalizeCanvasDocumentVersion(row as CanvasDocumentVersionRow)
    ),
  };
}

export async function getDocumentVersion(
  projectId: string,
  versionId: string
): Promise<{ version?: CanvasDocumentVersion; error?: string }> {
  const supabase = await createClient();
  const check = await assertProductionProject(supabase, projectId);
  if (check.error) return { error: check.error };

  const { data, error } = await supabase
    .from("canvas_document_versions")
    .select("*")
    .eq("id", versionId)
    .eq("project_id", projectId)
    .maybeSingle();

  if (error) {
    return { error: formatCanvasError(error.message, error.code) };
  }

  if (!data) {
    return { error: "Document version not found." };
  }

  return { version: normalizeCanvasDocumentVersion(data as CanvasDocumentVersionRow) };
}
