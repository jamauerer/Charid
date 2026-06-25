import { CANVAS_DOCUMENT_SCHEMA_VERSION } from "@/types/canvas/document-v1";
import type { SurfaceKind } from "@/types/canvas/surface";
import { canvasDocumentToJson, createEmptyCanvasDocumentV1 } from "@/lib/canvas/create-empty-document-v1";
import {
  configProfileToJson,
  getConfigProfileForSurfaceKind,
} from "@/lib/canvas/surface-config-presets";

export function buildProductionSurfaceInsert(
  projectId: string,
  surfaceKind: SurfaceKind
): {
  project_id: string;
  surface_kind: SurfaceKind;
  config_profile: Record<string, unknown>;
  width: number;
  height: number;
  canvas_document: Record<string, unknown>;
  canvas_document_version: number;
} {
  const profile = getConfigProfileForSurfaceKind(surfaceKind);
  const document = createEmptyCanvasDocumentV1(surfaceKind);

  return {
    project_id: projectId,
    surface_kind: surfaceKind,
    config_profile: configProfileToJson(profile),
    width: profile.default_dimensions.width,
    height: profile.default_dimensions.height,
    canvas_document: canvasDocumentToJson(document),
    canvas_document_version: CANVAS_DOCUMENT_SCHEMA_VERSION,
  };
}
