export type CanvasDocumentVersion = {
  id: string;
  surface_id: string;
  project_id: string;
  schema_version: number;
  document_snapshot: Record<string, unknown>;
  revision_label: string | null;
  created_by: string | null;
  created_at: string;
};

export type CanvasDocumentVersionRow = {
  id: string;
  surface_id: string;
  project_id: string;
  schema_version: number;
  document_snapshot: Record<string, unknown>;
  revision_label?: string | null;
  created_by?: string | null;
  created_at: string;
};

export function normalizeCanvasDocumentVersion(
  row: CanvasDocumentVersionRow
): CanvasDocumentVersion {
  return {
    id: row.id,
    surface_id: row.surface_id,
    project_id: row.project_id,
    schema_version: row.schema_version,
    document_snapshot: row.document_snapshot,
    revision_label: row.revision_label ?? null,
    created_by: row.created_by ?? null,
    created_at: row.created_at,
  };
}

export type RevisionLabel = "manual" | "autosave" | "pre_compile" | "system";
