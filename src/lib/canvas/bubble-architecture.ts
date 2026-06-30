/**
 * Bubble Studio architecture — future SVG artwork plugs in here.
 * Tails remain independent for later draggable tail support.
 */

export const BUBBLE_STYLE_IDS = [
  "speech",
  "thought",
  "caption",
  "sfx",
  "whisper",
  "shout",
] as const;

export type BubbleStyleId = (typeof BUBBLE_STYLE_IDS)[number];

export type BubbleAssetRef = {
  id: BubbleStyleId;
  label: string;
  /** Path under /public when SVG assets ship (Milestone 14+). */
  svgPath: string | null;
  /** Tail geometry is separate from bubble body for draggable tails later. */
  tailIndependent: boolean;
  /** Maps to canvas TextObjectKind where applicable. */
  textKind: "speech" | "thought" | "caption" | "sfx" | "narration" | "free";
};

/** Placeholder registry — procedural rendering until professional SVG assets arrive. */
export const BUBBLE_ASSET_REGISTRY: Record<BubbleStyleId, BubbleAssetRef> = {
  speech: {
    id: "speech",
    label: "Speech",
    svgPath: null,
    tailIndependent: true,
    textKind: "speech",
  },
  thought: {
    id: "thought",
    label: "Thought",
    svgPath: null,
    tailIndependent: true,
    textKind: "thought",
  },
  caption: {
    id: "caption",
    label: "Caption",
    svgPath: null,
    tailIndependent: false,
    textKind: "caption",
  },
  sfx: {
    id: "sfx",
    label: "SFX",
    svgPath: null,
    tailIndependent: false,
    textKind: "sfx",
  },
  whisper: {
    id: "whisper",
    label: "Whisper",
    svgPath: null,
    tailIndependent: true,
    textKind: "speech",
  },
  shout: {
    id: "shout",
    label: "Shout",
    svgPath: null,
    tailIndependent: true,
    textKind: "speech",
  },
};

export function getBubbleAsset(id: BubbleStyleId): BubbleAssetRef {
  return BUBBLE_ASSET_REGISTRY[id];
}
