import {
  CANVAS_DOCUMENT_SCHEMA_VERSION,
  CANVAS_OBJECT_TYPES,
  LAYER_KINDS,
  type CanvasDocumentV1,
  type CanvasDocumentValidationResult,
  type CanvasObjectType,
  type CanvasObjectV1,
  type LayerKind,
} from "@/types/canvas/document-v1";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isFiniteNumber(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value);
}

function validateLayer(raw: unknown, index: number): string | null {
  if (!isRecord(raw)) return `Layer ${index} must be an object.`;
  if (typeof raw.id !== "string" || !raw.id.trim()) {
    return `Layer ${index} requires a non-empty id.`;
  }
  if (!LAYER_KINDS.includes(raw.kind as LayerKind)) {
    return `Layer ${index} has invalid kind.`;
  }
  if (typeof raw.visible !== "boolean" || typeof raw.locked !== "boolean") {
    return `Layer ${index} requires visible and locked booleans.`;
  }
  return null;
}

function validateObjectPayload(type: CanvasObjectType, payload: unknown): string | null {
  if (!isRecord(payload)) return "Object payload must be an object.";

  if (type === "image") {
    if (payload.fit !== "cover" && payload.fit !== "contain") {
      return "Image object requires fit of cover or contain.";
    }
    if (payload.asset_ref !== null && !isRecord(payload.asset_ref)) {
      return "Image asset_ref must be null or an object.";
    }
    return null;
  }

  if (type === "text") {
    if (typeof payload.content !== "string") return "Text object requires content string.";
    if (!isFiniteNumber(payload.font_size)) return "Text object requires font_size.";
    if (typeof payload.font_family !== "string") return "Text object requires font_family.";
    if (!["left", "center", "right"].includes(payload.align as string)) {
      return "Text object requires valid align.";
    }
    return null;
  }

  if (type === "shape") {
    if (payload.shape !== "rect" && payload.shape !== "ellipse") {
      return "Shape object requires shape of rect or ellipse.";
    }
    if (typeof payload.fill !== "string" || typeof payload.stroke !== "string") {
      return "Shape object requires fill and stroke strings.";
    }
    if (!isFiniteNumber(payload.stroke_width)) {
      return "Shape object requires stroke_width.";
    }
    return null;
  }

  return "Unknown object type.";
}

function validateObject(raw: unknown, index: number, layerIds: Set<string>): string | null {
  if (!isRecord(raw)) return `Object ${index} must be an object.`;
  if (typeof raw.id !== "string" || !raw.id.trim()) {
    return `Object ${index} requires a non-empty id.`;
  }
  if (!CANVAS_OBJECT_TYPES.includes(raw.type as CanvasObjectType)) {
    return `Object ${index} has invalid type.`;
  }
  for (const field of ["x", "y", "width", "height", "rotation", "z_index"] as const) {
    if (!isFiniteNumber(raw[field])) {
      return `Object ${index} requires numeric ${field}.`;
    }
  }
  if (typeof raw.layer_id !== "string" || !layerIds.has(raw.layer_id)) {
    return `Object ${index} references unknown layer_id.`;
  }
  if (typeof raw.locked !== "boolean" || typeof raw.hidden !== "boolean") {
    return `Object ${index} requires locked and hidden booleans.`;
  }
  if (!isRecord(raw.metadata)) return `Object ${index} requires metadata object.`;

  const payloadError = validateObjectPayload(raw.type as CanvasObjectType, raw.payload);
  if (payloadError) return `Object ${index}: ${payloadError}`;

  return null;
}

export function validateCanvasDocumentV1(input: unknown): CanvasDocumentValidationResult {
  if (!isRecord(input)) {
    return { valid: false, error: "Document must be an object." };
  }

  if (input.schema_version !== CANVAS_DOCUMENT_SCHEMA_VERSION) {
    return {
      valid: false,
      error: `Unsupported schema_version. Expected ${CANVAS_DOCUMENT_SCHEMA_VERSION}.`,
    };
  }

  if (!Array.isArray(input.layers)) {
    return { valid: false, error: "Document requires layers array." };
  }

  if (!Array.isArray(input.objects)) {
    return { valid: false, error: "Document requires objects array." };
  }

  const layerIds = new Set<string>();
  for (let i = 0; i < input.layers.length; i += 1) {
    const layerError = validateLayer(input.layers[i], i);
    if (layerError) return { valid: false, error: layerError };
    const layer = input.layers[i] as { id: string };
    if (layerIds.has(layer.id)) {
      return { valid: false, error: `Duplicate layer id: ${layer.id}` };
    }
    layerIds.add(layer.id);
  }

  const objectIds = new Set<string>();
  for (let i = 0; i < input.objects.length; i += 1) {
    const objectError = validateObject(input.objects[i], i, layerIds);
    if (objectError) return { valid: false, error: objectError };
    const obj = input.objects[i] as CanvasObjectV1;
    if (objectIds.has(obj.id)) {
      return { valid: false, error: `Duplicate object id: ${obj.id}` };
    }
    objectIds.add(obj.id);
  }

  const metadata = isRecord(input.metadata) ? input.metadata : {};

  return {
    valid: true,
    document: {
      schema_version: CANVAS_DOCUMENT_SCHEMA_VERSION,
      layers: input.layers as CanvasDocumentV1["layers"],
      objects: input.objects as CanvasObjectV1[],
      metadata,
    },
  };
}

export function parseCanvasDocumentV1(input: unknown): CanvasDocumentValidationResult {
  return validateCanvasDocumentV1(input);
}
