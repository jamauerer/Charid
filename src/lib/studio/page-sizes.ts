/**
 * Page size architecture — future document selector.
 * No generation or rendering backend changes in M15.
 */

import type { DocumentDimensions, DocumentUnit } from "@/lib/studio/document-settings";
import {
  COMIC_TRIM_HEIGHT_IN,
  COMIC_TRIM_WIDTH_IN,
} from "@/lib/canvas/comic-page-dimensions";

export type PageSizePresetId =
  | "graphic-novel"
  | "north-american-comic"
  | "storybook"
  | "storybook-square"
  | "a4"
  | "social-square"
  | "social-instagram"
  | "custom";

export type PageSizePreset = {
  id: PageSizePresetId;
  label: string;
  sublabel?: string;
  dimensions: DocumentDimensions;
  description?: string;
};

export const PAGE_SIZE_PRESETS: PageSizePreset[] = [
  {
    id: "graphic-novel",
    label: "Graphic Novel",
    dimensions: { width: COMIC_TRIM_WIDTH_IN, height: COMIC_TRIM_HEIGHT_IN, unit: "in" },
  },
  {
    id: "north-american-comic",
    label: "North American Comic",
    sublabel: `${COMIC_TRIM_WIDTH_IN} × ${COMIC_TRIM_HEIGHT_IN} in`,
    dimensions: { width: COMIC_TRIM_WIDTH_IN, height: COMIC_TRIM_HEIGHT_IN, unit: "in" },
    description: "Standard North American comic trim",
  },
  {
    id: "storybook",
    label: "Storybook",
    dimensions: { width: 210, height: 297, unit: "mm" },
  },
  {
    id: "storybook-square",
    label: "Square",
    dimensions: { width: 210, height: 210, unit: "mm" },
    description: "Square storybook format",
  },
  {
    id: "a4",
    label: "A4",
    dimensions: { width: 210, height: 297, unit: "mm" },
  },
  {
    id: "social-square",
    label: "Social",
    dimensions: { width: 1080, height: 1080, unit: "mm" },
    description: "Square social post",
  },
  {
    id: "social-instagram",
    label: "Instagram",
    dimensions: { width: 1080, height: 1350, unit: "mm" },
  },
  {
    id: "custom",
    label: "Custom",
    dimensions: { width: COMIC_TRIM_WIDTH_IN, height: COMIC_TRIM_HEIGHT_IN, unit: "in" },
  },
];

export const PAGE_SIZE_UNITS: DocumentUnit[] = ["mm", "cm", "in"];

export type StudioPageSizeSettings = {
  presetId: PageSizePresetId;
  customDimensions?: DocumentDimensions;
};

export const DEFAULT_PAGE_SIZE_SETTINGS: StudioPageSizeSettings = {
  presetId: "north-american-comic",
};

export function resolvePageSizeDimensions(settings: StudioPageSizeSettings): DocumentDimensions {
  const preset = PAGE_SIZE_PRESETS.find((p) => p.id === settings.presetId) ?? PAGE_SIZE_PRESETS[1];
  if (settings.presetId === "custom" && settings.customDimensions) {
    return settings.customDimensions;
  }
  return preset.dimensions;
}

export function formatPageSizeLabel(settings: StudioPageSizeSettings = DEFAULT_PAGE_SIZE_SETTINGS): string {
  const preset = PAGE_SIZE_PRESETS.find((p) => p.id === settings.presetId) ?? PAGE_SIZE_PRESETS[1];
  const dims = resolvePageSizeDimensions(settings);
  if (preset.sublabel) return preset.sublabel;
  return `${dims.width} × ${dims.height} ${dims.unit}`;
}
