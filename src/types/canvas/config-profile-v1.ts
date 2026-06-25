import type { LayerKind } from "@/types/canvas/document-v1";
import type { CanvasObjectType } from "@/types/canvas/document-v1";

export const CONFIG_PROFILE_VERSION = 1 as const;

export type LayoutModeV1 = "template" | "freeform";

export type ReadingZoneRoleV1 = "illustration" | "text" | "caption";

export type ReadingZoneV1 = {
  id: string;
  role: ReadingZoneRoleV1;
  x: number;
  y: number;
  width: number;
  height: number;
};

export type SurfaceConfigProfileV1 = {
  profile_version: typeof CONFIG_PROFILE_VERSION;
  allowed_layers: LayerKind[];
  allowed_object_types: CanvasObjectType[];
  layout_mode: LayoutModeV1;
  aspect_ratio_lock: number | null;
  reading_zones: ReadingZoneV1[];
  default_dimensions: {
    width: number;
    height: number;
  };
};

export type SurfaceConfigProfileValidationResult =
  | { valid: true; profile: SurfaceConfigProfileV1 }
  | { valid: false; error: string };

export const COMIC_PANEL_DIMENSIONS = { width: 800, height: 1200 } as const;

export const STORYBOOK_SPREAD_DIMENSIONS = { width: 2048, height: 1024 } as const;
