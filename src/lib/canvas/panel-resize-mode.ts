import { PAGE_GUTTER, type PanelFrameRect } from "@/lib/canvas/page-layout-templates";

export const PANEL_RESIZE_MODES = ["linked", "independent", "freeform"] as const;

export type PanelResizeMode = (typeof PANEL_RESIZE_MODES)[number];

export const DEFAULT_PANEL_RESIZE_MODE: PanelResizeMode = "linked";

export function parsePanelResizeMode(value: unknown): PanelResizeMode {
  if (value === "independent" || value === "freeform" || value === "linked") {
    return value;
  }
  return DEFAULT_PANEL_RESIZE_MODE;
}

type PanelState = PanelFrameRect & { id: string; name?: string };

const EDGE_THRESHOLD = 12;

function sharesVerticalEdge(a: PanelFrameRect, b: PanelFrameRect): "left" | "right" | null {
  const aRight = a.x + a.width;
  const bRight = b.x + b.width;
  if (Math.abs(aRight + PAGE_GUTTER - b.x) <= EDGE_THRESHOLD) return "right";
  if (Math.abs(bRight + PAGE_GUTTER - a.x) <= EDGE_THRESHOLD) return "left";
  return null;
}

function sharesHorizontalEdge(a: PanelFrameRect, b: PanelFrameRect): "top" | "bottom" | null {
  const aBottom = a.y + a.height;
  const bBottom = b.y + b.height;
  if (Math.abs(aBottom + PAGE_GUTTER - b.y) <= EDGE_THRESHOLD) return "bottom";
  if (Math.abs(bBottom + PAGE_GUTTER - a.y) <= EDGE_THRESHOLD) return "top";
  return null;
}

function verticalOverlap(a: PanelFrameRect, b: PanelFrameRect): boolean {
  return a.y < b.y + b.height && b.y < a.y + a.height;
}

function horizontalOverlap(a: PanelFrameRect, b: PanelFrameRect): boolean {
  return a.x < b.x + b.width && b.x < a.x + a.width;
}

/**
 * When resizing in linked mode, adjust adjacent panels to preserve gutter consistency.
 */
export function applyLinkedPanelResize(
  panels: PanelState[],
  panelId: string,
  nextFrame: PanelFrameRect,
  prevFrame: PanelFrameRect
): PanelState[] {
  const deltaWidth = nextFrame.width - prevFrame.width;
  const deltaHeight = nextFrame.height - prevFrame.height;
  const deltaX = nextFrame.x - prevFrame.x;
  const deltaY = nextFrame.y - prevFrame.y;

  let result = panels.map((panel) =>
    panel.id === panelId ? { ...panel, ...nextFrame } : panel
  );

  const resized = result.find((p) => p.id === panelId);
  if (!resized) return result;

  for (const neighbor of result) {
    if (neighbor.id === panelId) continue;

    const vEdge = sharesVerticalEdge(prevFrame, neighbor);
    const hEdge = sharesHorizontalEdge(prevFrame, neighbor);

    if (vEdge === "right" && verticalOverlap(prevFrame, neighbor) && deltaWidth !== 0) {
      result = result.map((p) =>
        p.id === neighbor.id
          ? {
              ...p,
              x: p.x + deltaWidth + deltaX,
              width: Math.max(40, p.width - deltaWidth - deltaX),
            }
          : p
      );
    }

    if (vEdge === "left" && verticalOverlap(prevFrame, neighbor) && deltaX !== 0) {
      result = result.map((p) =>
        p.id === neighbor.id
          ? {
              ...p,
              width: Math.max(40, p.width + deltaX),
            }
          : p
      );
    }

    if (hEdge === "bottom" && horizontalOverlap(prevFrame, neighbor) && deltaHeight !== 0) {
      result = result.map((p) =>
        p.id === neighbor.id
          ? {
              ...p,
              y: p.y + deltaHeight + deltaY,
              height: Math.max(40, p.height - deltaHeight - deltaY),
            }
          : p
      );
    }

    if (hEdge === "top" && horizontalOverlap(prevFrame, neighbor) && deltaY !== 0) {
      result = result.map((p) =>
        p.id === neighbor.id
          ? {
              ...p,
              height: Math.max(40, p.height + deltaY),
            }
          : p
      );
    }
  }

  return result;
}

export function snapPanelFrame(
  frame: PanelFrameRect,
  otherPanels: PanelFrameRect[],
  pageWidth: number,
  pageHeight: number,
  snapThreshold = 8
): PanelFrameRect & { snapGuides?: { x: number[]; y: number[] } } {
  let { x, y, width, height } = frame;
  const xGuides: number[] = [];
  const yGuides: number[] = [];
  const xCandidates = [0, pageWidth];
  const yCandidates = [0, pageHeight];

  for (const panel of otherPanels) {
    xCandidates.push(panel.x, panel.x + panel.width);
    yCandidates.push(panel.y, panel.y + panel.height);
  }

  for (const target of xCandidates) {
    if (Math.abs(target - x) <= snapThreshold) {
      x = target;
      xGuides.push(target);
    }
    if (Math.abs(target - (x + width)) <= snapThreshold) {
      width = target - x;
      xGuides.push(target);
    }
  }

  for (const target of yCandidates) {
    if (Math.abs(target - y) <= snapThreshold) {
      y = target;
      yGuides.push(target);
    }
    if (Math.abs(target - (y + height)) <= snapThreshold) {
      height = target - y;
      yGuides.push(target);
    }
  }

  return {
    x,
    y,
    width: Math.max(40, width),
    height: Math.max(40, height),
    snapGuides:
      xGuides.length || yGuides.length
        ? { x: [...new Set(xGuides)], y: [...new Set(yGuides)] }
        : undefined,
  };
}

export function alignPanels(
  panels: PanelState[],
  selectedIds: string[],
  alignment: "left" | "center" | "right" | "top" | "middle" | "bottom"
): PanelState[] {
  if (selectedIds.length < 2) return panels;

  const selected = panels.filter((p) => selectedIds.includes(p.id));
  const minX = Math.min(...selected.map((p) => p.x));
  const maxX = Math.max(...selected.map((p) => p.x + p.width));
  const minY = Math.min(...selected.map((p) => p.y));
  const maxY = Math.max(...selected.map((p) => p.y + p.height));
  const centerX = (minX + maxX) / 2;
  const centerY = (minY + maxY) / 2;

  return panels.map((panel) => {
    if (!selectedIds.includes(panel.id)) return panel;
    switch (alignment) {
      case "left":
        return { ...panel, x: minX };
      case "right":
        return { ...panel, x: maxX - panel.width };
      case "center":
        return { ...panel, x: centerX - panel.width / 2 };
      case "top":
        return { ...panel, y: minY };
      case "bottom":
        return { ...panel, y: maxY - panel.height };
      case "middle":
        return { ...panel, y: centerY - panel.height / 2 };
      default:
        return panel;
    }
  });
}

export function distributePanels(
  panels: PanelState[],
  selectedIds: string[],
  axis: "horizontal" | "vertical"
): PanelState[] {
  if (selectedIds.length < 3) return panels;

  const selected = [...panels.filter((p) => selectedIds.includes(p.id))].sort((a, b) =>
    axis === "horizontal" ? a.x - b.x : a.y - b.y
  );

  const first = selected[0];
  const last = selected[selected.length - 1];
  const totalSpan =
    axis === "horizontal"
      ? last.x + last.width - first.x
      : last.y + last.height - first.y;
  const totalSize = selected.reduce(
    (sum, p) => sum + (axis === "horizontal" ? p.width : p.height),
    0
  );
  const gap = (totalSpan - totalSize) / (selected.length - 1);

  let cursor = axis === "horizontal" ? first.x : first.y;
  const positions = new Map<string, number>();

  for (const panel of selected) {
    positions.set(panel.id, cursor);
    cursor += (axis === "horizontal" ? panel.width : panel.height) + gap;
  }

  return panels.map((panel) => {
    const pos = positions.get(panel.id);
    if (pos === undefined) return panel;
    return axis === "horizontal" ? { ...panel, x: pos } : { ...panel, y: pos };
  });
}
