export const CANVAS_DOCUMENT_SCHEMA_VERSION = 1 as const;

export const LAYER_KINDS = [
  "background",
  "artwork",
  "text",
  "bubble",
  "caption",
  "effects",
  "reference",
] as const;

export type LayerKind = (typeof LAYER_KINDS)[number];

export const CANVAS_OBJECT_TYPES = ["image", "text", "shape"] as const;

export type CanvasObjectType = (typeof CANVAS_OBJECT_TYPES)[number];

export type LayerDefinitionV1 = {
  id: string;
  kind: LayerKind;
  visible: boolean;
  locked: boolean;
};

export type ImageAssetRefV1 = {
  source: "character" | "story" | "world";
  entity_id: string;
  image_id: string;
};

export type ImagePayloadV1 = {
  asset_ref: ImageAssetRefV1 | null;
  fit: "cover" | "contain";
};

export type TextPayloadV1 = {
  content: string;
  font_size: number;
  font_family: string;
  align: "left" | "center" | "right";
};

export type ShapePayloadV1 = {
  shape: "rect" | "ellipse";
  fill: string;
  stroke: string;
  stroke_width: number;
};

export type CanvasObjectPayloadV1 =
  | ImagePayloadV1
  | TextPayloadV1
  | ShapePayloadV1;

export type CanvasObjectV1 = {
  id: string;
  type: CanvasObjectType;
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;
  layer_id: string;
  z_index: number;
  locked: boolean;
  hidden: boolean;
  metadata: Record<string, unknown>;
  payload: CanvasObjectPayloadV1;
};

export type CanvasDocumentMetadataV1 = {
  template_id?: string | null;
  template_applied_at?: string | null;
  story_refs_cache?: {
    scene_id?: string | null;
    character_ids?: string[];
  };
  ai?: {
    last_modified_by?: "user" | "system";
  };
};

export type CanvasDocumentV1 = {
  schema_version: typeof CANVAS_DOCUMENT_SCHEMA_VERSION;
  layers: LayerDefinitionV1[];
  objects: CanvasObjectV1[];
  metadata: CanvasDocumentMetadataV1;
};

export type CanvasDocumentValidationResult =
  | { valid: true; document: CanvasDocumentV1 }
  | { valid: false; error: string };
