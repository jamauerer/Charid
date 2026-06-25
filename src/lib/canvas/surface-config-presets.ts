import {
  CONFIG_PROFILE_VERSION,
  COMIC_PANEL_DIMENSIONS,
  STORYBOOK_SPREAD_DIMENSIONS,
  type SurfaceConfigProfileV1,
} from "@/types/canvas/config-profile-v1";
import type { SurfaceKind } from "@/types/canvas/surface";

const MVP_LAYERS = ["background", "artwork", "text"] as const;
const MVP_OBJECT_TYPES = ["image", "text", "shape"] as const;

function baseProfile(
  dimensions: { width: number; height: number },
  layoutMode: "template" | "freeform" = "template"
): SurfaceConfigProfileV1 {
  return {
    profile_version: CONFIG_PROFILE_VERSION,
    allowed_layers: [...MVP_LAYERS],
    allowed_object_types: [...MVP_OBJECT_TYPES],
    layout_mode: layoutMode,
    aspect_ratio_lock: dimensions.width / dimensions.height,
    reading_zones: [],
    default_dimensions: { ...dimensions },
  };
}

export function getConfigProfileForSurfaceKind(
  surfaceKind: SurfaceKind
): SurfaceConfigProfileV1 {
  switch (surfaceKind) {
    case "comic_panel":
      return baseProfile(COMIC_PANEL_DIMENSIONS);
    case "storybook_spread":
      return baseProfile(STORYBOOK_SPREAD_DIMENSIONS);
    case "comic_page_layout":
      return {
        ...baseProfile({ width: 1200, height: 1800 }),
        allowed_object_types: ["shape"],
        allowed_layers: ["background"],
      };
    case "character_sheet":
      return baseProfile({ width: 1200, height: 1600 });
    case "lore_page":
      return baseProfile({ width: 1200, height: 1600 });
    case "worksheet":
      return baseProfile({ width: 1600, height: 1200 }, "template");
    case "portfolio_page":
      return baseProfile({ width: 1440, height: 900 });
    case "marketing_page":
      return baseProfile({ width: 1440, height: 900 });
    default:
      return baseProfile(COMIC_PANEL_DIMENSIONS);
  }
}

export function configProfileToJson(profile: SurfaceConfigProfileV1): Record<string, unknown> {
  return profile as unknown as Record<string, unknown>;
}

export function getDefaultDimensionsForSurfaceKind(
  surfaceKind: SurfaceKind
): { width: number; height: number } {
  const profile = getConfigProfileForSurfaceKind(surfaceKind);
  return profile.default_dimensions;
}
