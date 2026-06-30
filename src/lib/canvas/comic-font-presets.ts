export const COMIC_FONT_PRESETS = [
  "dialogue",
  "action",
  "hero",
  "horror",
  "cute",
  "kids",
  "sci_fi",
  "noir",
  "handwritten",
  "manga",
] as const;

export type ComicFontPreset = (typeof COMIC_FONT_PRESETS)[number];

export type ComicFontPresetDef = {
  id: ComicFontPreset;
  label: string;
  fontFamily: string;
  fontSize: number;
  bold: boolean;
  italic: boolean;
  letterSpacing: number;
  lineHeight: number;
};

export const COMIC_FONT_PRESET_DEFS: Record<ComicFontPreset, ComicFontPresetDef> = {
  dialogue: {
    id: "dialogue",
    label: "Dialogue",
    fontFamily: "Comic Sans MS, cursive",
    fontSize: 14,
    bold: false,
    italic: false,
    letterSpacing: 0,
    lineHeight: 1.25,
  },
  action: {
    id: "action",
    label: "Action",
    fontFamily: "Arial Black, sans-serif",
    fontSize: 13,
    bold: true,
    italic: false,
    letterSpacing: 0.5,
    lineHeight: 1.2,
  },
  hero: {
    id: "hero",
    label: "Hero",
    fontFamily: "Impact, sans-serif",
    fontSize: 16,
    bold: true,
    italic: false,
    letterSpacing: 1,
    lineHeight: 1.15,
  },
  horror: {
    id: "horror",
    label: "Horror",
    fontFamily: "Georgia, serif",
    fontSize: 14,
    bold: false,
    italic: true,
    letterSpacing: 0.3,
    lineHeight: 1.3,
  },
  cute: {
    id: "cute",
    label: "Cute",
    fontFamily: "Verdana, sans-serif",
    fontSize: 13,
    bold: false,
    italic: false,
    letterSpacing: 0.2,
    lineHeight: 1.35,
  },
  kids: {
    id: "kids",
    label: "Kids",
    fontFamily: "Trebuchet MS, sans-serif",
    fontSize: 15,
    bold: true,
    italic: false,
    letterSpacing: 0.4,
    lineHeight: 1.3,
  },
  sci_fi: {
    id: "sci_fi",
    label: "Sci-Fi",
    fontFamily: "Courier New, monospace",
    fontSize: 13,
    bold: false,
    italic: false,
    letterSpacing: 1.2,
    lineHeight: 1.2,
  },
  noir: {
    id: "noir",
    label: "Noir",
    fontFamily: "Times New Roman, serif",
    fontSize: 13,
    bold: false,
    italic: true,
    letterSpacing: 0.1,
    lineHeight: 1.35,
  },
  handwritten: {
    id: "handwritten",
    label: "Handwritten",
    fontFamily: "Segoe Script, cursive",
    fontSize: 14,
    bold: false,
    italic: false,
    letterSpacing: 0,
    lineHeight: 1.4,
  },
  manga: {
    id: "manga",
    label: "Manga",
    fontFamily: "Arial, sans-serif",
    fontSize: 13,
    bold: true,
    italic: false,
    letterSpacing: 0.8,
    lineHeight: 1.2,
  },
};

export function resolveFontPreset(preset: ComicFontPreset | undefined): ComicFontPresetDef {
  if (preset && preset in COMIC_FONT_PRESET_DEFS) {
    return COMIC_FONT_PRESET_DEFS[preset];
  }
  return COMIC_FONT_PRESET_DEFS.dialogue;
}
