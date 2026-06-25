"use client";

import { Rect } from "react-konva";
import { LayoutCanvasStage } from "@/components/project/production/canvas/LayoutCanvasStage";
import { LayoutRectShape } from "@/components/project/production/canvas/LayoutRectShape";
import type { LayoutCanvasZoomState } from "@/components/project/production/canvas/useLayoutCanvasZoom";
import type { PanelBorderStyle } from "@/lib/canvas/page-layout-surface";
import { COMIC_PAGE_HEIGHT, COMIC_PAGE_WIDTH } from "@/lib/canvas/page-layout-templates";
import type { LayoutRectItem } from "@/components/project/production/canvas/LayoutRectShape";

type ComicPageLayoutCanvasProps = {
  canvasItems: LayoutRectItem[];
  panelBorderStyle: PanelBorderStyle;
  selectedPanelId: string | null;
  onSelectPanel: (panelId: string | null) => void;
  onPanelFrameChange: (panelId: string, frame: Pick<LayoutRectItem, "x" | "y" | "width" | "height">) => void;
  onAddPanel?: () => void;
  isEmpty?: boolean;
  fillViewport?: boolean;
  studioMode?: boolean;
  showZoomBar?: boolean;
  zoom?: LayoutCanvasZoomState;
  pageId?: string;
};

export function ComicPageLayoutCanvas({
  canvasItems,
  panelBorderStyle,
  selectedPanelId,
  onSelectPanel,
  onPanelFrameChange,
  onAddPanel,
  isEmpty,
  fillViewport = false,
  studioMode = false,
  showZoomBar = true,
  zoom,
  pageId,
}: ComicPageLayoutCanvasProps) {
  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <LayoutCanvasStage
        width={COMIC_PAGE_WIDTH}
        height={COMIC_PAGE_HEIGHT}
        fillViewport={fillViewport}
        studioMode={studioMode}
        showZoomBar={showZoomBar}
        zoom={zoom}
        zoomStorageKey={pageId ? `comic-editor-zoom:${pageId}` : undefined}
        onBackgroundClick={() => onSelectPanel(null)}
      >
        <Rect
          x={0}
          y={0}
          width={COMIC_PAGE_WIDTH}
          height={COMIC_PAGE_HEIGHT}
          fill="#ffffff"
          stroke="#e2e8f0"
          strokeWidth={1}
          listening={false}
          perfectDrawEnabled={false}
        />
        {canvasItems.map((item) => (
          <LayoutRectShape
            key={item.id}
            item={item}
            borderStyle={panelBorderStyle}
            selected={selectedPanelId === item.id}
            onSelect={() => onSelectPanel(item.id)}
            onChange={(frame) => onPanelFrameChange(item.id, frame)}
          />
        ))}
      </LayoutCanvasStage>
      {isEmpty && onAddPanel && !studioMode && (
        <p className="mt-2 text-center text-xs text-[var(--brand-text-muted)]">
          Choose a layout template or{" "}
          <button type="button" onClick={onAddPanel} className="underline hover:text-[var(--foreground)]">
            add your first panel
          </button>
          .
        </p>
      )}
    </div>
  );
}
