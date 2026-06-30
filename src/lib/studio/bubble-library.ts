/**
 * Bubble Library — sidebar categories and preview architecture.
 * SVG assets plug in via `previewSvgPath` when available.
 */

import type { TextObjectKind } from "@/lib/canvas/panel-content";

export type BubbleLibraryCategoryId =
  | "speech"
  | "thought"
  | "caption"
  | "sfx"
  | "whisper"
  | "shout"
  | "radio"
  | "electronic"
  | "narration";

export type BubbleLibraryCategory = {
  id: BubbleLibraryCategoryId;
  label: string;
  textKind: TextObjectKind;
  available: boolean;
  /** Future: path to SVG asset in /public/studio/bubbles/ */
  previewSvgPath?: string;
  group: "dialogue" | "effects" | "narration";
};

export const BUBBLE_LIBRARY_CATEGORIES: BubbleLibraryCategory[] = [
  { id: "speech", label: "Speech", textKind: "speech", available: true, group: "dialogue" },
  { id: "thought", label: "Thought", textKind: "thought", available: true, group: "dialogue" },
  { id: "caption", label: "Caption", textKind: "caption", available: true, group: "narration" },
  { id: "sfx", label: "SFX", textKind: "sfx", available: true, group: "effects" },
  { id: "whisper", label: "Whisper", textKind: "speech", available: false, group: "dialogue" },
  { id: "shout", label: "Shout", textKind: "speech", available: false, group: "dialogue" },
  { id: "radio", label: "Radio", textKind: "speech", available: false, group: "effects" },
  { id: "electronic", label: "Electronic", textKind: "speech", available: false, group: "effects" },
  { id: "narration", label: "Narration", textKind: "narration", available: false, group: "narration" },
];

export const TEXT_SIDEBAR_PRESETS = [
  { id: "heading", label: "Heading", fontPreset: "hero" as const, kind: "free" as const },
  { id: "body", label: "Body", fontPreset: "dialogue" as const, kind: "free" as const },
  { id: "dialogue", label: "Dialogue", fontPreset: "dialogue" as const, kind: "speech" as const },
  { id: "narration", label: "Narration", fontPreset: "noir" as const, kind: "narration" as const },
  { id: "sfx", label: "SFX", fontPreset: "hero" as const, kind: "sfx" as const },
] as const;

export function bubblesForTool(
  tool: "speech" | "thought" | "caption"
): BubbleLibraryCategory[] {
  switch (tool) {
    case "speech":
      return BUBBLE_LIBRARY_CATEGORIES.filter(
        (c) =>
          c.id === "speech" ||
          c.id === "whisper" ||
          c.id === "shout" ||
          c.id === "radio" ||
          c.id === "electronic"
      );
    case "thought":
      return BUBBLE_LIBRARY_CATEGORIES.filter((c) => c.id === "thought");
    case "caption":
      return BUBBLE_LIBRARY_CATEGORIES.filter(
        (c) => c.id === "caption" || c.id === "narration"
      );
  }
}
