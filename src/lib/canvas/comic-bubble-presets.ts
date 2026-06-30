export const SPEECH_BUBBLE_PRESETS = [
  "classic_oval",
  "rounded_rectangle",
  "rectangle",
  "whisper",
  "jagged_shout",
  "electronic",
  "double_speech",
  "triple_speech",
] as const;

export type SpeechBubblePreset = (typeof SPEECH_BUBBLE_PRESETS)[number];

export const THOUGHT_BUBBLE_PRESETS = ["cloud", "dream", "memory"] as const;

export type ThoughtBubblePreset = (typeof THOUGHT_BUBBLE_PRESETS)[number];

export const CAPTION_BUBBLE_PRESETS = [
  "caption",
  "narration",
  "location",
  "time",
  "journal",
] as const;

export type CaptionBubblePreset = (typeof CAPTION_BUBBLE_PRESETS)[number];

export const SFX_BUBBLE_PRESETS = [
  "explosion",
  "jagged",
  "impact",
  "electric",
  "speed",
  "cloud",
] as const;

export type SfxBubblePreset = (typeof SFX_BUBBLE_PRESETS)[number];

export type BubblePreset =
  | SpeechBubblePreset
  | ThoughtBubblePreset
  | CaptionBubblePreset
  | SfxBubblePreset;

export type TailAnchor = { x: number; y: number };

export type ThoughtDot = { x: number; y: number; r: number };

export type BubbleStyleConfig = {
  fill: string;
  stroke: string;
  strokeWidth: number;
  cornerRadius: number;
  dash?: number[];
  opacity: number;
  backgroundFill?: string;
  backgroundOpacity?: number;
  padding: number;
};

export const DEFAULT_TAIL_TIP: TailAnchor = { x: 0.2, y: 1.15 };
export const DEFAULT_TAIL_BASE: TailAnchor = { x: 0.35, y: 1 };

export const DEFAULT_THOUGHT_DOTS: ThoughtDot[] = [
  { x: 0.22, y: 1.08, r: 5 },
  { x: 0.15, y: 1.18, r: 3 },
];

export function defaultBubblePreset(kind: string): BubblePreset {
  switch (kind) {
    case "thought":
      return "cloud";
    case "caption":
      return "caption";
    case "narration":
      return "narration";
    case "sfx":
      return "explosion";
    case "speech":
    default:
      return "classic_oval";
  }
}

export function bubblePresetLabel(preset: BubblePreset): string {
  return preset
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

export function bubbleStyleForPreset(preset: BubblePreset): BubbleStyleConfig {
  switch (preset) {
    case "classic_oval":
      return {
        fill: "#ffffff",
        stroke: "#1e293b",
        strokeWidth: 2,
        cornerRadius: 999,
        opacity: 1,
        padding: 10,
      };
    case "rounded_rectangle":
      return {
        fill: "#ffffff",
        stroke: "#1e293b",
        strokeWidth: 2,
        cornerRadius: 16,
        opacity: 1,
        padding: 10,
      };
    case "rectangle":
      return {
        fill: "#ffffff",
        stroke: "#1e293b",
        strokeWidth: 2,
        cornerRadius: 2,
        opacity: 1,
        padding: 8,
      };
    case "whisper":
      return {
        fill: "#f8fafc",
        stroke: "#94a3b8",
        strokeWidth: 1.5,
        cornerRadius: 20,
        dash: [4, 3],
        opacity: 0.95,
        padding: 10,
      };
    case "jagged_shout":
      return {
        fill: "#fff7ed",
        stroke: "#ea580c",
        strokeWidth: 2.5,
        cornerRadius: 4,
        opacity: 1,
        padding: 12,
      };
    case "electronic":
      return {
        fill: "#ecfeff",
        stroke: "#0891b2",
        strokeWidth: 2,
        cornerRadius: 4,
        opacity: 1,
        padding: 8,
      };
    case "double_speech":
    case "triple_speech":
      return {
        fill: "#ffffff",
        stroke: "#334155",
        strokeWidth: 2,
        cornerRadius: 18,
        opacity: 1,
        padding: 10,
      };
    case "cloud":
      return {
        fill: "#ffffff",
        stroke: "#64748b",
        strokeWidth: 2,
        cornerRadius: 24,
        opacity: 1,
        padding: 12,
      };
    case "dream":
      return {
        fill: "#faf5ff",
        stroke: "#a78bfa",
        strokeWidth: 2,
        cornerRadius: 28,
        dash: [6, 4],
        opacity: 0.92,
        padding: 12,
      };
    case "memory":
      return {
        fill: "#fef9c3",
        stroke: "#ca8a04",
        strokeWidth: 1.5,
        cornerRadius: 20,
        opacity: 0.88,
        padding: 10,
      };
    case "caption":
      return {
        fill: "rgba(15, 23, 42, 0.82)",
        stroke: "transparent",
        strokeWidth: 0,
        cornerRadius: 4,
        opacity: 1,
        backgroundFill: "rgba(15, 23, 42, 0.82)",
        backgroundOpacity: 0.82,
        padding: 8,
      };
    case "narration":
      return {
        fill: "#fef3c7",
        stroke: "#92400e",
        strokeWidth: 1.5,
        cornerRadius: 4,
        opacity: 1,
        padding: 8,
      };
    case "location":
      return {
        fill: "rgba(30, 41, 59, 0.75)",
        stroke: "#64748b",
        strokeWidth: 1,
        cornerRadius: 2,
        opacity: 1,
        padding: 6,
      };
    case "time":
      return {
        fill: "rgba(255, 255, 255, 0.9)",
        stroke: "#cbd5e1",
        strokeWidth: 1,
        cornerRadius: 2,
        opacity: 1,
        padding: 6,
      };
    case "journal":
      return {
        fill: "#fffbeb",
        stroke: "#d97706",
        strokeWidth: 1,
        cornerRadius: 6,
        opacity: 1,
        padding: 10,
      };
    case "explosion":
      return {
        fill: "#fef08a",
        stroke: "#dc2626",
        strokeWidth: 3,
        cornerRadius: 0,
        opacity: 1,
        padding: 4,
      };
    case "jagged":
      return {
        fill: "#fee2e2",
        stroke: "#b91c1c",
        strokeWidth: 2.5,
        cornerRadius: 0,
        opacity: 1,
        padding: 6,
      };
    case "impact":
      return {
        fill: "#ffffff",
        stroke: "#0f172a",
        strokeWidth: 3,
        cornerRadius: 0,
        opacity: 1,
        padding: 4,
      };
    case "electric":
      return {
        fill: "#dbeafe",
        stroke: "#2563eb",
        strokeWidth: 2,
        cornerRadius: 0,
        opacity: 1,
        padding: 4,
      };
    case "speed":
      return {
        fill: "transparent",
        stroke: "#64748b",
        strokeWidth: 2,
        cornerRadius: 0,
        opacity: 1,
        padding: 2,
      };
    case "cloud":
      return {
        fill: "#f1f5f9",
        stroke: "#475569",
        strokeWidth: 2,
        cornerRadius: 16,
        opacity: 1,
        padding: 8,
      };
    default:
      return {
        fill: "#ffffff",
        stroke: "#1e293b",
        strokeWidth: 2,
        cornerRadius: 12,
        opacity: 1,
        padding: 8,
      };
  }
}

/** Build SVG-style path data for bubble body (local coords, origin top-left). */
export function bubbleBodyPath(
  preset: BubblePreset,
  width: number,
  height: number
): string | null {
  const w = width;
  const h = height;

  if (preset === "jagged_shout" || preset === "jagged" || preset === "explosion" || preset === "impact") {
    const spikes = preset === "explosion" ? 12 : 8;
    const cx = w / 2;
    const cy = h / 2;
    const outer = Math.max(w, h) / 2;
    const inner = outer * 0.72;
    let d = "";
    for (let i = 0; i < spikes * 2; i++) {
      const angle = (Math.PI * 2 * i) / (spikes * 2) - Math.PI / 2;
      const r = i % 2 === 0 ? outer : inner;
      const x = cx + Math.cos(angle) * r * (w / Math.max(w, h));
      const y = cy + Math.sin(angle) * r * (h / Math.max(w, h));
      d += i === 0 ? `M ${x} ${y}` : ` L ${x} ${y}`;
    }
    return `${d} Z`;
  }

  if (preset === "electric") {
    return `M 4 0 L ${w - 8} 0 L ${w} ${h * 0.3} L ${w - 4} ${h} L 8 ${h} L 0 ${h * 0.65} Z`;
  }

  if (preset === "speed") {
    return `M 0 ${h * 0.5} L ${w * 0.15} 0 L ${w * 0.85} 0 L ${w} ${h * 0.5} L ${w * 0.85} ${h} L ${w * 0.15} ${h} Z`;
  }

  return null;
}

export function speechTailPath(
  width: number,
  height: number,
  tailBase: TailAnchor,
  tailTip: TailAnchor
): string {
  const bx = tailBase.x * width;
  const by = tailBase.y * height;
  const tx = tailTip.x * width;
  const ty = tailTip.y * height;
  const midX = (bx + tx) / 2;
  return `M ${bx - 8} ${by} Q ${midX} ${ty} ${tx} ${ty} Q ${midX} ${ty} ${bx + 8} ${by} Z`;
}

export function presetsForTextKind(kind: string): BubblePreset[] {
  switch (kind) {
    case "speech":
      return [...SPEECH_BUBBLE_PRESETS];
    case "thought":
      return [...THOUGHT_BUBBLE_PRESETS];
    case "caption":
    case "narration":
      return [...CAPTION_BUBBLE_PRESETS];
    case "sfx":
      return [...SFX_BUBBLE_PRESETS];
    default:
      return ["rounded_rectangle"];
  }
}
