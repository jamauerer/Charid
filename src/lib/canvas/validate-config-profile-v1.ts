import {
  CONFIG_PROFILE_VERSION,
  type SurfaceConfigProfileV1,
  type SurfaceConfigProfileValidationResult,
} from "@/types/canvas/config-profile-v1";
import {
  CANVAS_OBJECT_TYPES,
  LAYER_KINDS,
  type CanvasObjectType,
  type LayerKind,
} from "@/types/canvas/document-v1";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export function validateSurfaceConfigProfileV1(
  input: unknown
): SurfaceConfigProfileValidationResult {
  if (!isRecord(input)) {
    return { valid: false, error: "Config profile must be an object." };
  }

  if (input.profile_version !== CONFIG_PROFILE_VERSION) {
    return {
      valid: false,
      error: `Unsupported profile_version. Expected ${CONFIG_PROFILE_VERSION}.`,
    };
  }

  if (!Array.isArray(input.allowed_layers)) {
    return { valid: false, error: "allowed_layers must be an array." };
  }

  for (const layer of input.allowed_layers) {
    if (!LAYER_KINDS.includes(layer as LayerKind)) {
      return { valid: false, error: `Invalid layer in allowed_layers: ${String(layer)}` };
    }
  }

  if (!Array.isArray(input.allowed_object_types)) {
    return { valid: false, error: "allowed_object_types must be an array." };
  }

  for (const objectType of input.allowed_object_types) {
    if (!CANVAS_OBJECT_TYPES.includes(objectType as CanvasObjectType)) {
      return {
        valid: false,
        error: `Invalid object type in allowed_object_types: ${String(objectType)}`,
      };
    }
  }

  if (input.layout_mode !== "template" && input.layout_mode !== "freeform") {
    return { valid: false, error: "layout_mode must be template or freeform." };
  }

  if (
    input.aspect_ratio_lock !== null &&
    (typeof input.aspect_ratio_lock !== "number" || !Number.isFinite(input.aspect_ratio_lock))
  ) {
    return { valid: false, error: "aspect_ratio_lock must be null or a finite number." };
  }

  if (!isRecord(input.default_dimensions)) {
    return { valid: false, error: "default_dimensions must be an object." };
  }

  const { width, height } = input.default_dimensions;
  if (typeof width !== "number" || typeof height !== "number" || width <= 0 || height <= 0) {
    return { valid: false, error: "default_dimensions requires positive width and height." };
  }

  const readingZones = Array.isArray(input.reading_zones) ? input.reading_zones : [];

  return {
    valid: true,
    profile: {
      profile_version: CONFIG_PROFILE_VERSION,
      allowed_layers: input.allowed_layers as LayerKind[],
      allowed_object_types: input.allowed_object_types as CanvasObjectType[],
      layout_mode: input.layout_mode,
      aspect_ratio_lock: input.aspect_ratio_lock as number | null,
      reading_zones: readingZones as SurfaceConfigProfileV1["reading_zones"],
      default_dimensions: { width, height },
    },
  };
}
