export type {
  CanvasDocumentV1,
  CanvasDocumentMetadataV1,
  CanvasDocumentValidationResult,
  CanvasObjectV1,
  CanvasObjectPayloadV1,
  CanvasObjectType,
  ImageAssetRefV1,
  ImagePayloadV1,
  LayerDefinitionV1,
  LayerKind,
  ShapePayloadV1,
  TextPayloadV1,
} from "@/types/canvas/document-v1";

export {
  CANVAS_DOCUMENT_SCHEMA_VERSION,
  CANVAS_OBJECT_TYPES,
  LAYER_KINDS,
} from "@/types/canvas/document-v1";

export type {
  ProductionSurface,
  ProductionSurfaceRow,
  SurfaceKind,
} from "@/types/canvas/surface";

export {
  SURFACE_KINDS,
  SURFACE_KIND_FOR_WORK_INTENT,
  isSurfaceKindAllowedForWorkIntent,
  normalizeProductionSurface,
  parseSurfaceKind,
} from "@/types/canvas/surface";

export type {
  CanvasDocumentVersion,
  CanvasDocumentVersionRow,
  RevisionLabel,
} from "@/types/canvas/version";

export { normalizeCanvasDocumentVersion } from "@/types/canvas/version";

export type {
  LayoutModeV1,
  ReadingZoneRoleV1,
  ReadingZoneV1,
  SurfaceConfigProfileV1,
  SurfaceConfigProfileValidationResult,
} from "@/types/canvas/config-profile-v1";

export {
  COMIC_PANEL_DIMENSIONS,
  CONFIG_PROFILE_VERSION,
  STORYBOOK_SPREAD_DIMENSIONS,
} from "@/types/canvas/config-profile-v1";
