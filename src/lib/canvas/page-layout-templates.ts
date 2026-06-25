export const COMIC_PAGE_WIDTH = 1200;
export const COMIC_PAGE_HEIGHT = 1800;
export const PAGE_MARGIN = 32;
export const PAGE_GUTTER = 16;

export type PanelFrameRect = {
  x: number;
  y: number;
  width: number;
  height: number;
};

export type PageLayoutTemplateId =
  | "splash"
  | "one-panel"
  | "two-panels"
  | "three-panels"
  | "four-panels"
  | "six-grid"
  | "manga";

export type PageLayoutTemplate = {
  id: PageLayoutTemplateId;
  label: string;
  panels: PanelFrameRect[];
};

function innerBounds() {
  return {
    x: PAGE_MARGIN,
    y: PAGE_MARGIN,
    width: COMIC_PAGE_WIDTH - PAGE_MARGIN * 2,
    height: COMIC_PAGE_HEIGHT - PAGE_MARGIN * 2,
  };
}

function gridPanels(cols: number, rows: number): PanelFrameRect[] {
  const inner = innerBounds();
  const cellW = (inner.width - PAGE_GUTTER * (cols - 1)) / cols;
  const cellH = (inner.height - PAGE_GUTTER * (rows - 1)) / rows;
  const panels: PanelFrameRect[] = [];

  for (let row = 0; row < rows; row += 1) {
    for (let col = 0; col < cols; col += 1) {
      panels.push({
        x: inner.x + col * (cellW + PAGE_GUTTER),
        y: inner.y + row * (cellH + PAGE_GUTTER),
        width: cellW,
        height: cellH,
      });
    }
  }

  return panels;
}

function splashPanel(): PanelFrameRect[] {
  const inner = innerBounds();
  return [{ ...inner }];
}

function twoPanels(): PanelFrameRect[] {
  const inner = innerBounds();
  const width = (inner.width - PAGE_GUTTER) / 2;
  return [
    { x: inner.x, y: inner.y, width, height: inner.height },
    {
      x: inner.x + width + PAGE_GUTTER,
      y: inner.y,
      width,
      height: inner.height,
    },
  ];
}

function threePanels(): PanelFrameRect[] {
  const inner = innerBounds();
  const topHeight = (inner.height - PAGE_GUTTER) * 0.55;
  const bottomHeight = inner.height - topHeight - PAGE_GUTTER;
  const bottomWidth = (inner.width - PAGE_GUTTER) / 2;

  return [
    { x: inner.x, y: inner.y, width: inner.width, height: topHeight },
    {
      x: inner.x,
      y: inner.y + topHeight + PAGE_GUTTER,
      width: bottomWidth,
      height: bottomHeight,
    },
    {
      x: inner.x + bottomWidth + PAGE_GUTTER,
      y: inner.y + topHeight + PAGE_GUTTER,
      width: bottomWidth,
      height: bottomHeight,
    },
  ];
}

function mangaPanels(): PanelFrameRect[] {
  const inner = innerBounds();
  const leftWidth = (inner.width - PAGE_GUTTER) * (2 / 3);
  const rightWidth = inner.width - leftWidth - PAGE_GUTTER;
  const rightHeight = (inner.height - PAGE_GUTTER * 2) / 3;

  return [
    { x: inner.x, y: inner.y, width: leftWidth, height: inner.height },
    { x: inner.x + leftWidth + PAGE_GUTTER, y: inner.y, width: rightWidth, height: rightHeight },
    {
      x: inner.x + leftWidth + PAGE_GUTTER,
      y: inner.y + rightHeight + PAGE_GUTTER,
      width: rightWidth,
      height: rightHeight,
    },
    {
      x: inner.x + leftWidth + PAGE_GUTTER,
      y: inner.y + (rightHeight + PAGE_GUTTER) * 2,
      width: rightWidth,
      height: rightHeight,
    },
  ];
}

export const PAGE_LAYOUT_TEMPLATES: PageLayoutTemplate[] = [
  { id: "splash", label: "Splash Page", panels: splashPanel() },
  { id: "one-panel", label: "1 Panel", panels: splashPanel() },
  { id: "two-panels", label: "2 Panels", panels: twoPanels() },
  { id: "three-panels", label: "3 Panels", panels: threePanels() },
  { id: "four-panels", label: "4 Panels", panels: gridPanels(2, 2) },
  { id: "six-grid", label: "6 Panel Grid", panels: gridPanels(2, 3) },
  { id: "manga", label: "Manga Layout", panels: mangaPanels() },
];

export function getPageLayoutTemplate(
  templateId: PageLayoutTemplateId
): PageLayoutTemplate | undefined {
  return PAGE_LAYOUT_TEMPLATES.find((template) => template.id === templateId);
}

export function defaultPanelFrame(index: number, total: number): PanelFrameRect {
  const inner = innerBounds();
  const height = (inner.height - PAGE_GUTTER * (total - 1)) / Math.max(total, 1);
  return {
    x: inner.x,
    y: inner.y + index * (height + PAGE_GUTTER),
    width: inner.width,
    height,
  };
}

export function normalizePanelFrames(
  panels: Array<{ frame_x: number; frame_y: number; frame_width: number | null; frame_height: number | null }>
): PanelFrameRect[] {
  return panels.map((panel, index) => {
    if (panel.frame_width != null && panel.frame_height != null) {
      return {
        x: panel.frame_x,
        y: panel.frame_y,
        width: panel.frame_width,
        height: panel.frame_height,
      };
    }
    return defaultPanelFrame(index, panels.length);
  });
}

export function newPanelFrame(existingCount: number): PanelFrameRect {
  const inner = innerBounds();
  const size = Math.min(320, inner.width * 0.4, inner.height * 0.35);
  const offset = (existingCount % 4) * 24;
  return {
    x: inner.x + offset,
    y: inner.y + offset,
    width: size,
    height: size * 1.25,
  };
}
