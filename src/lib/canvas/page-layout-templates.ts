import {
  COMIC_PAGE_HEIGHT,
  COMIC_PAGE_WIDTH,
} from "@/lib/canvas/comic-page-dimensions";

export { COMIC_PAGE_HEIGHT, COMIC_PAGE_WIDTH } from "@/lib/canvas/comic-page-dimensions";
export {
  COMIC_PAGE_ASPECT_RATIO,
  COMIC_PAGE_PRINT_WIDTH_PX,
  COMIC_PAGE_PRINT_HEIGHT_PX,
  COMIC_TRIM_WIDTH_IN,
  COMIC_TRIM_HEIGHT_IN,
} from "@/lib/canvas/comic-page-dimensions";

export const PAGE_MARGIN = 32;
export const PAGE_GUTTER = 16;
export const SPREAD_PAGE_GAP = 24;

export type PanelFrameRect = {
  x: number;
  y: number;
  width: number;
  height: number;
};

/** 18 M14 panel layout templates + legacy ids for stored pages. */
export type PageLayoutTemplateId =
  | "panels-1-splash"
  | "panels-2-a"
  | "panels-2-b"
  | "panels-3-a"
  | "panels-3-b"
  | "panels-3-c"
  | "panels-3-d"
  | "panels-4-a"
  | "panels-4-b"
  | "panels-4-c"
  | "panels-4-d"
  | "panels-5-a"
  | "panels-5-b"
  | "panels-5-c"
  | "panels-5-d"
  | "panels-6-a"
  | "panels-6-b"
  | "panels-7-a"
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
  panelCount: number;
  groupLabel: string;
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

function twoPanelsSideBySide(): PanelFrameRect[] {
  const inner = innerBounds();
  const width = (inner.width - PAGE_GUTTER) / 2;
  return [
    { x: inner.x, y: inner.y, width, height: inner.height },
    { x: inner.x + width + PAGE_GUTTER, y: inner.y, width, height: inner.height },
  ];
}

function twoPanelsStacked(): PanelFrameRect[] {
  const inner = innerBounds();
  const height = (inner.height - PAGE_GUTTER) / 2;
  return [
    { x: inner.x, y: inner.y, width: inner.width, height },
    { x: inner.x, y: inner.y + height + PAGE_GUTTER, width: inner.width, height },
  ];
}

function threePanelsTopWide(): PanelFrameRect[] {
  const inner = innerBounds();
  const topHeight = (inner.height - PAGE_GUTTER) * 0.55;
  const bottomHeight = inner.height - topHeight - PAGE_GUTTER;
  const bottomWidth = (inner.width - PAGE_GUTTER) / 2;
  return [
    { x: inner.x, y: inner.y, width: inner.width, height: topHeight },
    { x: inner.x, y: inner.y + topHeight + PAGE_GUTTER, width: bottomWidth, height: bottomHeight },
    {
      x: inner.x + bottomWidth + PAGE_GUTTER,
      y: inner.y + topHeight + PAGE_GUTTER,
      width: bottomWidth,
      height: bottomHeight,
    },
  ];
}

function threePanelsLeftTall(): PanelFrameRect[] {
  const inner = innerBounds();
  const leftW = (inner.width - PAGE_GUTTER) * 0.58;
  const rightW = inner.width - leftW - PAGE_GUTTER;
  const rightH = (inner.height - PAGE_GUTTER) / 2;
  return [
    { x: inner.x, y: inner.y, width: leftW, height: inner.height },
    { x: inner.x + leftW + PAGE_GUTTER, y: inner.y, width: rightW, height: rightH },
    {
      x: inner.x + leftW + PAGE_GUTTER,
      y: inner.y + rightH + PAGE_GUTTER,
      width: rightW,
      height: rightH,
    },
  ];
}

function threePanelsHorizontal(): PanelFrameRect[] {
  const inner = innerBounds();
  const height = (inner.height - PAGE_GUTTER * 2) / 3;
  return [0, 1, 2].map((i) => ({
    x: inner.x,
    y: inner.y + i * (height + PAGE_GUTTER),
    width: inner.width,
    height,
  }));
}

function threePanelsTwoTop(): PanelFrameRect[] {
  const inner = innerBounds();
  const topH = (inner.height - PAGE_GUTTER) * 0.42;
  const bottomH = inner.height - topH - PAGE_GUTTER;
  const topW = (inner.width - PAGE_GUTTER) / 2;
  return [
    { x: inner.x, y: inner.y, width: topW, height: topH },
    { x: inner.x + topW + PAGE_GUTTER, y: inner.y, width: topW, height: topH },
    { x: inner.x, y: inner.y + topH + PAGE_GUTTER, width: inner.width, height: bottomH },
  ];
}

function fourPanelsGrid(): PanelFrameRect[] {
  return gridPanels(2, 2);
}

function fourPanelsHeroTop(): PanelFrameRect[] {
  const inner = innerBounds();
  const topH = (inner.height - PAGE_GUTTER) * 0.5;
  const bottomH = inner.height - topH - PAGE_GUTTER;
  const bottomW = (inner.width - PAGE_GUTTER * 2) / 3;
  return [
    { x: inner.x, y: inner.y, width: inner.width, height: topH },
    ...[0, 1, 2].map((i) => ({
      x: inner.x + i * (bottomW + PAGE_GUTTER),
      y: inner.y + topH + PAGE_GUTTER,
      width: bottomW,
      height: bottomH,
    })),
  ];
}

function fourPanelsLeftHero(): PanelFrameRect[] {
  const inner = innerBounds();
  const leftW = (inner.width - PAGE_GUTTER) * 0.62;
  const rightW = inner.width - leftW - PAGE_GUTTER;
  const rightH = (inner.height - PAGE_GUTTER * 2) / 3;
  return [
    { x: inner.x, y: inner.y, width: leftW, height: inner.height },
    ...[0, 1, 2].map((i) => ({
      x: inner.x + leftW + PAGE_GUTTER,
      y: inner.y + i * (rightH + PAGE_GUTTER),
      width: rightW,
      height: rightH,
    })),
  ];
}

function fourPanelsMangaFixed(): PanelFrameRect[] {
  const inner = innerBounds();
  const leftW = (inner.width - PAGE_GUTTER) * (2 / 3);
  const rightW = inner.width - leftW - PAGE_GUTTER;
  const rightH = (inner.height - PAGE_GUTTER * 2) / 3;
  return [
    { x: inner.x, y: inner.y, width: leftW, height: inner.height },
    { x: inner.x + leftW + PAGE_GUTTER, y: inner.y, width: rightW, height: rightH },
    {
      x: inner.x + leftW + PAGE_GUTTER,
      y: inner.y + rightH + PAGE_GUTTER,
      width: rightW,
      height: rightH,
    },
    {
      x: inner.x + leftW + PAGE_GUTTER,
      y: inner.y + (rightH + PAGE_GUTTER) * 2,
      width: rightW,
      height: rightH,
    },
  ];
}

function fivePanelsTwoThree(): PanelFrameRect[] {
  const inner = innerBounds();
  const rowH = (inner.height - PAGE_GUTTER) / 2;
  const topW = (inner.width - PAGE_GUTTER) / 2;
  const bottomW = (inner.width - PAGE_GUTTER * 2) / 3;
  return [
    { x: inner.x, y: inner.y, width: topW, height: rowH },
    { x: inner.x + topW + PAGE_GUTTER, y: inner.y, width: topW, height: rowH },
    ...[0, 1, 2].map((i) => ({
      x: inner.x + i * (bottomW + PAGE_GUTTER),
      y: inner.y + rowH + PAGE_GUTTER,
      width: bottomW,
      height: rowH,
    })),
  ];
}

function fivePanelsHeroFour(): PanelFrameRect[] {
  const inner = innerBounds();
  const topH = (inner.height - PAGE_GUTTER) * 0.45;
  const bottomH = inner.height - topH - PAGE_GUTTER;
  const bottomW = (inner.width - PAGE_GUTTER) / 2;
  const smallH = (bottomH - PAGE_GUTTER) / 2;
  return [
    { x: inner.x, y: inner.y, width: inner.width, height: topH },
    { x: inner.x, y: inner.y + topH + PAGE_GUTTER, width: bottomW, height: smallH },
    {
      x: inner.x + bottomW + PAGE_GUTTER,
      y: inner.y + topH + PAGE_GUTTER,
      width: bottomW,
      height: smallH,
    },
    { x: inner.x, y: inner.y + topH + PAGE_GUTTER + smallH + PAGE_GUTTER, width: bottomW, height: smallH },
    {
      x: inner.x + bottomW + PAGE_GUTTER,
      y: inner.y + topH + PAGE_GUTTER + smallH + PAGE_GUTTER,
      width: bottomW,
      height: smallH,
    },
  ];
}

function fivePanelsColumns(): PanelFrameRect[] {
  const inner = innerBounds();
  const leftW = (inner.width - PAGE_GUTTER) * 0.4;
  const rightW = inner.width - leftW - PAGE_GUTTER;
  const leftH = (inner.height - PAGE_GUTTER) / 2;
  const rightH = (inner.height - PAGE_GUTTER * 2) / 3;
  return [
    { x: inner.x, y: inner.y, width: leftW, height: leftH },
    { x: inner.x, y: inner.y + leftH + PAGE_GUTTER, width: leftW, height: leftH },
    ...[0, 1, 2].map((i) => ({
      x: inner.x + leftW + PAGE_GUTTER,
      y: inner.y + i * (rightH + PAGE_GUTTER),
      width: rightW,
      height: rightH,
    })),
  ];
}

function fivePanelsStrips(): PanelFrameRect[] {
  const inner = innerBounds();
  const h = (inner.height - PAGE_GUTTER * 4) / 5;
  return [0, 1, 2, 3, 4].map((i) => ({
    x: inner.x,
    y: inner.y + i * (h + PAGE_GUTTER),
    width: inner.width,
    height: h,
  }));
}

function sixPanelsGrid23(): PanelFrameRect[] {
  return gridPanels(2, 3);
}

function sixPanelsGrid32(): PanelFrameRect[] {
  return gridPanels(3, 2);
}

function sevenPanelsGrid(): PanelFrameRect[] {
  const inner = innerBounds();
  const topH = (inner.height - PAGE_GUTTER) * 0.34;
  const bottomH = inner.height - topH - PAGE_GUTTER;
  const topW = (inner.width - PAGE_GUTTER * 2) / 3;
  const bottomW = (inner.width - PAGE_GUTTER * 3) / 4;
  return [
    ...[0, 1, 2].map((i) => ({
      x: inner.x + i * (topW + PAGE_GUTTER),
      y: inner.y,
      width: topW,
      height: topH,
    })),
    ...[0, 1, 2, 3].map((i) => ({
      x: inner.x + i * (bottomW + PAGE_GUTTER),
      y: inner.y + topH + PAGE_GUTTER,
      width: bottomW,
      height: bottomH,
    })),
  ];
}

export const PAGE_LAYOUT_TEMPLATES: PageLayoutTemplate[] = [
  { id: "panels-1-splash", label: "Layout A", panelCount: 1, groupLabel: "1 Panel", panels: splashPanel() },
  { id: "panels-2-a", label: "Layout A", panelCount: 2, groupLabel: "2 Panels", panels: twoPanelsSideBySide() },
  { id: "panels-2-b", label: "Layout B", panelCount: 2, groupLabel: "2 Panels", panels: twoPanelsStacked() },
  { id: "panels-3-a", label: "Layout A", panelCount: 3, groupLabel: "3 Panels", panels: threePanelsTopWide() },
  { id: "panels-3-b", label: "Layout B", panelCount: 3, groupLabel: "3 Panels", panels: threePanelsLeftTall() },
  { id: "panels-3-c", label: "Layout C", panelCount: 3, groupLabel: "3 Panels", panels: threePanelsHorizontal() },
  { id: "panels-3-d", label: "Layout D", panelCount: 3, groupLabel: "3 Panels", panels: threePanelsTwoTop() },
  { id: "panels-4-a", label: "Layout A", panelCount: 4, groupLabel: "4 Panels", panels: fourPanelsGrid() },
  { id: "panels-4-b", label: "Layout B", panelCount: 4, groupLabel: "4 Panels", panels: fourPanelsHeroTop() },
  { id: "panels-4-c", label: "Layout C", panelCount: 4, groupLabel: "4 Panels", panels: fourPanelsLeftHero() },
  { id: "panels-4-d", label: "Layout D", panelCount: 4, groupLabel: "4 Panels", panels: fourPanelsMangaFixed() },
  { id: "panels-5-a", label: "Layout A", panelCount: 5, groupLabel: "5 Panels", panels: fivePanelsTwoThree() },
  { id: "panels-5-b", label: "Layout B", panelCount: 5, groupLabel: "5 Panels", panels: fivePanelsHeroFour() },
  { id: "panels-5-c", label: "Layout C", panelCount: 5, groupLabel: "5 Panels", panels: fivePanelsColumns() },
  { id: "panels-5-d", label: "Layout D", panelCount: 5, groupLabel: "5 Panels", panels: fivePanelsStrips() },
  { id: "panels-6-a", label: "Layout A", panelCount: 6, groupLabel: "6 Panels", panels: sixPanelsGrid23() },
  { id: "panels-6-b", label: "Layout B", panelCount: 6, groupLabel: "6 Panels", panels: sixPanelsGrid32() },
  { id: "panels-7-a", label: "Layout A", panelCount: 7, groupLabel: "7 Panels", panels: sevenPanelsGrid() },
];

const LEGACY_TEMPLATE_MAP: Record<string, PageLayoutTemplateId> = {
  splash: "panels-1-splash",
  "one-panel": "panels-1-splash",
  "two-panels": "panels-2-a",
  "three-panels": "panels-3-a",
  "four-panels": "panels-4-a",
  "six-grid": "panels-6-a",
  manga: "panels-4-d",
};

export function normalizePageLayoutTemplateId(
  templateId: string | null | undefined
): PageLayoutTemplateId | null {
  if (!templateId) return null;
  if (LEGACY_TEMPLATE_MAP[templateId]) return LEGACY_TEMPLATE_MAP[templateId];
  const found = PAGE_LAYOUT_TEMPLATES.find((t) => t.id === templateId);
  return found ? found.id : null;
}

export function getPageLayoutTemplate(
  templateId: PageLayoutTemplateId | string | null
): PageLayoutTemplate | undefined {
  const normalized = normalizePageLayoutTemplateId(templateId);
  if (!normalized) return undefined;
  return PAGE_LAYOUT_TEMPLATES.find((template) => template.id === normalized);
}

export function panelLayoutLibraryGroups(): {
  panelCount: number;
  label: string;
  templates: PageLayoutTemplate[];
}[] {
  const counts = [1, 2, 3, 4, 5, 6, 7];
  return counts.map((count) => {
    let templates = PAGE_LAYOUT_TEMPLATES.filter((t) => t.panelCount === count);
    if (count === 7) {
      templates = templates.filter((t) => t.id === "panels-7-a");
    }
    if (count === 1 && templates[0]) {
      templates = [{ ...templates[0], label: "Full Page" }];
    }
    return {
      panelCount: count,
      label: count === 1 ? "1 Panel" : `${count} Panels`,
      templates,
    };
  });
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

export function spreadCanvasWidth(): number {
  return COMIC_PAGE_WIDTH * 2 + SPREAD_PAGE_GAP;
}
