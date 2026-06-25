import {
  STORYBOOK_SPREAD_DIMENSIONS,
  type ReadingZoneV1,
} from "@/types/canvas/config-profile-v1";

export const SPREAD_WIDTH = STORYBOOK_SPREAD_DIMENSIONS.width;
export const SPREAD_HEIGHT = STORYBOOK_SPREAD_DIMENSIONS.height;
export const SPREAD_MARGIN = 32;
export const SPREAD_GUTTER = 16;

export type SpreadLayoutTemplateId =
  | "full-illustration"
  | "illustration-left-text-right"
  | "illustration-right-text-left"
  | "full-spread-illustration"
  | "educational";

export type SpreadLayoutTemplate = {
  id: SpreadLayoutTemplateId;
  label: string;
  zones: ReadingZoneV1[];
};

function innerBounds() {
  return {
    x: SPREAD_MARGIN,
    y: SPREAD_MARGIN,
    width: SPREAD_WIDTH - SPREAD_MARGIN * 2,
    height: SPREAD_HEIGHT - SPREAD_MARGIN * 2,
  };
}

function zone(
  id: string,
  role: ReadingZoneV1["role"],
  x: number,
  y: number,
  width: number,
  height: number
): ReadingZoneV1 {
  return { id, role, x, y, width, height };
}

function fullIllustration(): ReadingZoneV1[] {
  const inner = innerBounds();
  return [zone("zone-illustration-1", "illustration", inner.x, inner.y, inner.width, inner.height)];
}

function illustrationLeftTextRight(): ReadingZoneV1[] {
  const inner = innerBounds();
  const illustrationWidth = inner.width * 0.55 - SPREAD_GUTTER / 2;
  const textWidth = inner.width - illustrationWidth - SPREAD_GUTTER;
  return [
    zone("zone-illustration-1", "illustration", inner.x, inner.y, illustrationWidth, inner.height),
    zone(
      "zone-text-1",
      "text",
      inner.x + illustrationWidth + SPREAD_GUTTER,
      inner.y,
      textWidth,
      inner.height
    ),
  ];
}

function illustrationRightTextLeft(): ReadingZoneV1[] {
  const inner = innerBounds();
  const textWidth = inner.width * 0.42 - SPREAD_GUTTER / 2;
  const illustrationWidth = inner.width - textWidth - SPREAD_GUTTER;
  return [
    zone("zone-text-1", "text", inner.x, inner.y, textWidth, inner.height),
    zone(
      "zone-illustration-1",
      "illustration",
      inner.x + textWidth + SPREAD_GUTTER,
      inner.y,
      illustrationWidth,
      inner.height
    ),
  ];
}

function fullSpreadIllustration(): ReadingZoneV1[] {
  return [
    zone("zone-illustration-1", "illustration", 0, 0, SPREAD_WIDTH, SPREAD_HEIGHT * 0.82),
    zone(
      "zone-text-1",
      "text",
      SPREAD_MARGIN,
      SPREAD_HEIGHT * 0.82 + SPREAD_GUTTER,
      SPREAD_WIDTH - SPREAD_MARGIN * 2,
      SPREAD_HEIGHT * 0.18 - SPREAD_MARGIN - SPREAD_GUTTER
    ),
  ];
}

function educationalLayout(): ReadingZoneV1[] {
  const inner = innerBounds();
  const illustrationHeight = inner.height * 0.58 - SPREAD_GUTTER / 2;
  const textHeight = inner.height - illustrationHeight - SPREAD_GUTTER;
  return [
    zone("zone-illustration-1", "illustration", inner.x, inner.y, inner.width, illustrationHeight),
    zone(
      "zone-text-1",
      "text",
      inner.x,
      inner.y + illustrationHeight + SPREAD_GUTTER,
      inner.width,
      textHeight
    ),
  ];
}

export const SPREAD_LAYOUT_TEMPLATES: SpreadLayoutTemplate[] = [
  {
    id: "full-illustration",
    label: "Full Illustration",
    zones: fullIllustration(),
  },
  {
    id: "illustration-left-text-right",
    label: "Illustration Left + Text Right",
    zones: illustrationLeftTextRight(),
  },
  {
    id: "illustration-right-text-left",
    label: "Illustration Right + Text Left",
    zones: illustrationRightTextLeft(),
  },
  {
    id: "full-spread-illustration",
    label: "Full Spread Illustration",
    zones: fullSpreadIllustration(),
  },
  {
    id: "educational",
    label: "Educational Layout",
    zones: educationalLayout(),
  },
];

export function getSpreadLayoutTemplate(
  templateId: SpreadLayoutTemplateId
): SpreadLayoutTemplate | undefined {
  return SPREAD_LAYOUT_TEMPLATES.find((template) => template.id === templateId);
}

export function newSpreadZone(
  role: ReadingZoneV1["role"],
  existingCount: number
): ReadingZoneV1 {
  const inner = innerBounds();
  const size = Math.min(400, inner.width * 0.35, inner.height * 0.4);
  const offset = (existingCount % 4) * 20;
  return {
    id: `zone-${role}-${Date.now()}-${existingCount}`,
    role,
    x: inner.x + offset,
    y: inner.y + offset,
    width: size,
    height: role === "text" ? size * 0.75 : size,
  };
}

export function parseReadingZones(profile: Record<string, unknown>): ReadingZoneV1[] {
  const zones = profile.reading_zones;
  if (!Array.isArray(zones)) return [];
  return zones as ReadingZoneV1[];
}
