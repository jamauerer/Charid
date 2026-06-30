/**
 * Document Settings architecture — per project type presets.
 * Bleed, margins, and print export are out of scope for M13.5.
 */

export type DocumentUnit = "mm" | "cm" | "in";

export type DocumentDimensions = {
  width: number;
  height: number;
  unit: DocumentUnit;
};

export type DocumentPresetId = string;

export type DocumentPreset = {
  id: DocumentPresetId;
  label: string;
  dimensions: DocumentDimensions;
  /** Optional aspect hint for film/ad workflows */
  aspectLabel?: string;
};

export type DocumentProjectType =
  | "storybook"
  | "graphic_novel"
  | "film"
  | "advertisement";

/** Convert to internal pixel-equivalent at 300 DPI for future layout engines. */
export function documentDimensionsToPx(
  dims: DocumentDimensions,
  dpi = 300
): { widthPx: number; heightPx: number } {
  let widthIn = dims.width;
  let heightIn = dims.height;
  if (dims.unit === "mm") {
    widthIn = dims.width / 25.4;
    heightIn = dims.height / 25.4;
  } else if (dims.unit === "cm") {
    widthIn = dims.width / 2.54;
    heightIn = dims.height / 2.54;
  }
  return {
    widthPx: Math.round(widthIn * dpi),
    heightPx: Math.round(heightIn * dpi),
  };
}

export const STORYBOOK_DOCUMENT_PRESETS: DocumentPreset[] = [
  { id: "storybook-square", label: "Square", dimensions: { width: 210, height: 210, unit: "mm" } },
  { id: "storybook-portrait", label: "Portrait", dimensions: { width: 210, height: 297, unit: "mm" } },
  { id: "storybook-landscape", label: "Landscape", dimensions: { width: 297, height: 210, unit: "mm" } },
  { id: "storybook-custom", label: "Custom Dimensions", dimensions: { width: 210, height: 210, unit: "mm" } },
];

export const GRAPHIC_NOVEL_DOCUMENT_PRESETS: DocumentPreset[] = [
  {
    id: "gn-standard",
    label: "Standard Graphic Novel",
    dimensions: { width: 6.625, height: 10.25, unit: "in" },
  },
  { id: "gn-custom", label: "Custom Dimensions", dimensions: { width: 6.625, height: 10.25, unit: "in" } },
];

export const FILM_DOCUMENT_PRESETS: DocumentPreset[] = [
  {
    id: "film-landscape",
    label: "Landscape (16:9)",
    dimensions: { width: 16, height: 9, unit: "in" },
    aspectLabel: "16:9",
  },
  {
    id: "film-vertical",
    label: "Vertical (9:16)",
    dimensions: { width: 9, height: 16, unit: "in" },
    aspectLabel: "9:16",
  },
  {
    id: "film-square",
    label: "Square",
    dimensions: { width: 1080, height: 1080, unit: "mm" },
    aspectLabel: "1:1",
  },
  { id: "film-custom", label: "Custom Dimensions", dimensions: { width: 16, height: 9, unit: "in" } },
];

export const ADVERTISEMENT_DOCUMENT_PRESETS: DocumentPreset[] = [
  {
    id: "ad-instagram",
    label: "Instagram",
    dimensions: { width: 1080, height: 1080, unit: "mm" },
    aspectLabel: "1:1",
  },
  {
    id: "ad-story",
    label: "Story / TikTok",
    dimensions: { width: 1080, height: 1920, unit: "mm" },
    aspectLabel: "9:16",
  },
  {
    id: "ad-a4",
    label: "A4 Poster",
    dimensions: { width: 210, height: 297, unit: "mm" },
  },
  {
    id: "ad-banner",
    label: "Banner",
    dimensions: { width: 728, height: 90, unit: "mm" },
  },
  { id: "ad-custom", label: "Custom Dimensions", dimensions: { width: 1080, height: 1080, unit: "mm" } },
];

export function documentPresetsForProjectType(
  projectType: DocumentProjectType
): DocumentPreset[] {
  switch (projectType) {
    case "storybook":
      return STORYBOOK_DOCUMENT_PRESETS;
    case "graphic_novel":
      return GRAPHIC_NOVEL_DOCUMENT_PRESETS;
    case "film":
      return FILM_DOCUMENT_PRESETS;
    case "advertisement":
      return ADVERTISEMENT_DOCUMENT_PRESETS;
    default:
      return GRAPHIC_NOVEL_DOCUMENT_PRESETS;
  }
}

export function isCustomDocumentPreset(presetId: DocumentPresetId): boolean {
  return presetId.endsWith("-custom");
}

export type StudioDocumentSettings = {
  projectType: DocumentProjectType;
  presetId: DocumentPresetId;
  customDimensions?: DocumentDimensions;
};

export const DEFAULT_STUDIO_DOCUMENT_SETTINGS: StudioDocumentSettings = {
  projectType: "graphic_novel",
  presetId: "gn-standard",
};

export function resolveDocumentDimensions(settings: StudioDocumentSettings): DocumentDimensions {
  const presets = documentPresetsForProjectType(settings.projectType);
  const preset = presets.find((p) => p.id === settings.presetId) ?? presets[0];
  if (isCustomDocumentPreset(settings.presetId) && settings.customDimensions) {
    return settings.customDimensions;
  }
  return preset.dimensions;
}
