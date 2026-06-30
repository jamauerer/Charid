import type { ComicFontPreset } from "@/lib/canvas/comic-font-presets";
import type { BubblePreset, TailAnchor, ThoughtDot } from "@/lib/canvas/comic-bubble-presets";
import {
  DEFAULT_TAIL_BASE,
  DEFAULT_TAIL_TIP,
  DEFAULT_THOUGHT_DOTS,
  defaultBubblePreset,
} from "@/lib/canvas/comic-bubble-presets";
import type { TextObjectKind } from "@/lib/canvas/panel-content";

export type ComicTextStyle = {
  font_preset?: ComicFontPreset;
  bold: boolean;
  italic: boolean;
  underline: boolean;
  letter_spacing: number;
  line_height: number;
  fill_color: string;
  outline_color: string;
  outline_width: number;
  shadow: boolean;
  opacity: number;
  background_fill: string;
  background_opacity: number;
  padding: number;
  corner_radius: number;
  bubble_preset: BubblePreset;
  tail_base: TailAnchor;
  tail_tip: TailAnchor;
  thought_dots: ThoughtDot[];
};

export const DEFAULT_TEXT_STYLE: ComicTextStyle = {
  bold: false,
  italic: false,
  underline: false,
  letter_spacing: 0,
  line_height: 1.25,
  fill_color: "#0f172a",
  outline_color: "transparent",
  outline_width: 0,
  shadow: false,
  opacity: 1,
  background_fill: "transparent",
  background_opacity: 0,
  padding: 8,
  corner_radius: 12,
  bubble_preset: "classic_oval",
  tail_base: DEFAULT_TAIL_BASE,
  tail_tip: DEFAULT_TAIL_TIP,
  thought_dots: DEFAULT_THOUGHT_DOTS,
};

export function defaultStyleForKind(kind: TextObjectKind): ComicTextStyle {
  const preset = defaultBubblePreset(kind);
  const base = { ...DEFAULT_TEXT_STYLE, bubble_preset: preset };

  switch (kind) {
    case "speech":
      return {
        ...base,
        fill_color: "#0f172a",
        background_fill: "#ffffff",
        background_opacity: 1,
        outline_color: "#0f172a",
        outline_width: 2,
        padding: 12,
        corner_radius: 16,
        font_preset: "dialogue",
      };
    case "caption":
      return {
        ...base,
        fill_color: "#f8fafc",
        background_fill: "rgba(15, 23, 42, 0.88)",
        background_opacity: 0.88,
        corner_radius: 8,
        padding: 10,
        outline_color: "transparent",
        outline_width: 0,
        font_preset: "noir",
      };
    case "narration":
      return {
        ...base,
        fill_color: "#78350f",
        background_fill: "#fef3c7",
        background_opacity: 1,
        font_preset: "noir",
      };
    case "sfx":
      return {
        ...base,
        fill_color: "#dc2626",
        bold: true,
        font_preset: "hero",
        outline_color: "#0f172a",
        outline_width: 1,
        corner_radius: 0,
      };
    case "thought":
      return {
        ...base,
        fill_color: "#0f172a",
        background_fill: "#ffffff",
        background_opacity: 1,
        outline_color: "#0f172a",
        outline_width: 2,
        padding: 12,
        corner_radius: 24,
      };
    default:
      return base;
  }
}

export function parseComicTextStyle(metadata: Record<string, unknown>, kind: TextObjectKind): ComicTextStyle {
  const defaults = defaultStyleForKind(kind);
  const raw = metadata.comic_style;
  if (!raw || typeof raw !== "object") return defaults;

  const style = raw as Partial<ComicTextStyle>;
  return {
    ...defaults,
    ...style,
    tail_base: { ...defaults.tail_base, ...(style.tail_base ?? {}) },
    tail_tip: { ...defaults.tail_tip, ...(style.tail_tip ?? {}) },
    thought_dots: style.thought_dots?.length ? style.thought_dots : defaults.thought_dots,
  };
}

export function comicStyleToMetadata(style: Partial<ComicTextStyle>): Record<string, unknown> {
  return { comic_style: style };
}
