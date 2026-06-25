import type { PanelBorderStyle } from "@/lib/canvas/page-layout-surface";

export type { PanelBorderStyle };

export function panelBorderStroke(
  borderStyle: PanelBorderStyle,
  selected: boolean,
  hovered: boolean,
  regionStroke?: string
): { stroke: string; strokeWidth: number; dash?: number[] } {
  if (selected) {
    return { stroke: "#6366f1", strokeWidth: 3 };
  }

  if (regionStroke) {
    return { stroke: regionStroke, strokeWidth: hovered ? 3 : 2 };
  }

  switch (borderStyle) {
    case "black":
      return { stroke: "#111827", strokeWidth: 3 };
    case "white":
      return { stroke: "#f8fafc", strokeWidth: 3 };
    case "none":
      if (hovered) {
        return { stroke: "#64748b", strokeWidth: 2, dash: [6, 4] };
      }
      return { stroke: "transparent", strokeWidth: 0 };
    default:
      return { stroke: "#111827", strokeWidth: 3 };
  }
}

export const PANEL_BORDER_OPTIONS: { value: PanelBorderStyle; label: string }[] = [
  { value: "black", label: "Black borders" },
  { value: "white", label: "White borders" },
  { value: "none", label: "No borders" },
];
