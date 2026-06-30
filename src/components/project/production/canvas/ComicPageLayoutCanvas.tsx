"use client";

import { Group, Line, Rect } from "react-konva";
import { LayoutCanvasStage } from "@/components/project/production/canvas/LayoutCanvasStage";
import { LayoutRectShape } from "@/components/project/production/canvas/LayoutRectShape";
import { PanelArtworkShape } from "@/components/project/production/canvas/PanelArtworkShape";
import { ComicTextObjectShape } from "@/components/project/production/canvas/ComicTextObjectShape";
import type { LayoutCanvasZoomState } from "@/components/project/production/canvas/useLayoutCanvasZoom";
import type { PanelBorderStyle } from "@/lib/canvas/page-layout-surface";
import { getTextObjects } from "@/lib/canvas/panel-content";
import {
  COMIC_PAGE_HEIGHT,
  COMIC_PAGE_WIDTH,
  SPREAD_PAGE_GAP,
  spreadCanvasWidth,
} from "@/lib/canvas/page-layout-templates";
import type { PanelResizeMode } from "@/lib/canvas/panel-resize-mode";
import type { LayoutRectItem } from "@/components/project/production/canvas/LayoutRectShape";
import type { ComicTextStyle } from "@/lib/canvas/comic-text-style";
import type { ComicToolboxTool } from "@/components/project/production/comic/ComicFloatingToolbox";
import {
  isArtworkInteractive,
  isPanelInteractive,
  isTextObjectSelectable,
} from "@/lib/canvas/editor-selection";
import type { PageViewMode } from "@/lib/canvas/page-view-mode";
import type { CanvasDocumentV1 } from "@/types/canvas/document-v1";

export type PanelCanvasContent = {
  document: CanvasDocumentV1;
  artworkUrl: string | null;
};

type ComicPageLayoutCanvasProps = {
  canvasItems: LayoutRectItem[];
  panelBorderStyle: PanelBorderStyle;
  panelResizeMode?: PanelResizeMode;
  selectedPanelIds: string[];
  selectedObjectId: string | null;
  panelContents?: Record<string, PanelCanvasContent>;
  onSelectPanel: (panelId: string | null, additive?: boolean) => void;
  onSelectObject: (panelId: string, objectId: string | null) => void;
  onPanelFrameChange: (panelId: string, frame: Pick<LayoutRectItem, "x" | "y" | "width" | "height">) => void;
  onPanelFrameCommit?: () => void;
  onArtworkTransform?: (
    panelId: string,
    patch: { offset_x?: number; offset_y?: number; scale?: number; rotation?: number; opacity?: number }
  ) => void;
  onTextObjectChange?: (
    panelId: string,
    objectId: string,
    patch: Partial<{ x: number; y: number; width: number; height: number }>
  ) => void;
  onTextStyleChange?: (
    panelId: string,
    objectId: string,
    patch: Partial<ComicTextStyle>
  ) => void;
  pageViewMode?: PageViewMode;
  activeTool?: ComicToolboxTool;
  onAddPanel?: () => void;
  isEmpty?: boolean;
  fillViewport?: boolean;
  studioMode?: boolean;
  showZoomBar?: boolean;
  zoom?: LayoutCanvasZoomState;
  pageId?: string;
  snapGuides?: { x: number[]; y: number[] };
  onArtworkCropPlaceholder?: (panelId: string) => void;
  spreadNextPageLabel?: string | null;
};

export function ComicPageLayoutCanvas({
  canvasItems,
  panelBorderStyle,
  panelResizeMode = "linked",
  selectedPanelIds,
  selectedObjectId,
  panelContents = {},
  onSelectPanel,
  onSelectObject,
  onPanelFrameChange,
  onPanelFrameCommit,
  onArtworkTransform,
  onTextObjectChange,
  onTextStyleChange,
  onAddPanel,
  isEmpty,
  fillViewport = false,
  studioMode = false,
  showZoomBar = true,
  zoom,
  pageId,
  snapGuides,
  pageViewMode = "single",
  activeTool = "move",
  onArtworkCropPlaceholder,
  spreadNextPageLabel,
}: ComicPageLayoutCanvasProps) {
  const isSpread = pageViewMode === "spread";
  const stageWidth = isSpread ? spreadCanvasWidth() : COMIC_PAGE_WIDTH;
  const viewModeClass = isSpread ? "comic-canvas-spread" : "comic-canvas-single";
  const panelInteractive = isPanelInteractive(activeTool);
  const artworkInteractive = isArtworkInteractive(activeTool);
  const nextPageX = COMIC_PAGE_WIDTH + SPREAD_PAGE_GAP;

  return (
    <div className={`flex min-h-0 flex-1 flex-col ${viewModeClass}`}>
      <LayoutCanvasStage
        width={stageWidth}
        height={COMIC_PAGE_HEIGHT}
        fillViewport={fillViewport}
        studioMode={studioMode}
        showZoomBar={showZoomBar}
        zoom={zoom}
        zoomStorageKey={pageId ? `comic-editor-zoom:${pageId}` : undefined}
        onBackgroundClick={() => {
          onSelectPanel(null);
          onSelectObject("", null);
          onPanelFrameCommit?.();
        }}
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
        {isSpread && (
          <>
            <Rect
              x={nextPageX}
              y={0}
              width={COMIC_PAGE_WIDTH}
              height={COMIC_PAGE_HEIGHT}
              fill="#fafafa"
              stroke="#cbd5e1"
              strokeWidth={1}
              dash={[8, 6]}
              listening={false}
              perfectDrawEnabled={false}
            />
            {spreadNextPageLabel && (
              <Rect
                x={nextPageX + COMIC_PAGE_WIDTH / 2 - 80}
                y={COMIC_PAGE_HEIGHT / 2 - 16}
                width={160}
                height={32}
                fill="rgba(15, 23, 42, 0.06)"
                cornerRadius={6}
                listening={false}
              />
            )}
          </>
        )}
        {canvasItems.map((item) => {
          const content = panelContents[item.id];
          const textObjects = content ? getTextObjects(content.document) : [];
          const isSelected = selectedPanelIds.includes(item.id);
          const panelFrameSelected = isSelected && selectedObjectId === null;

          return (
            <Group key={item.id}>
              <LayoutRectShape
                item={item}
                borderStyle={panelBorderStyle}
                selected={panelFrameSelected}
                resizeMode={panelResizeMode}
                interactive={panelInteractive}
                onSelect={(additive) => {
                  if (!panelInteractive) return;
                  onSelectPanel(item.id, additive);
                }}
                onChange={(frame) => onPanelFrameChange(item.id, frame)}
                onInteractionEnd={onPanelFrameCommit}
              />
              {content && (
                <>
                  <PanelArtworkShape
                    document={content.document}
                    imageUrl={content.artworkUrl}
                    panelWidth={item.width}
                    panelHeight={item.height}
                    clipX={item.x}
                    clipY={item.y}
                    selected={selectedObjectId === "artwork" && isSelected}
                    interactive={artworkInteractive}
                    onSelect={() => {
                      if (!artworkInteractive) return;
                      onSelectPanel(item.id);
                      onSelectObject(item.id, "artwork");
                    }}
                    onDoubleClick={() => onArtworkCropPlaceholder?.(item.id)}
                    onTransformChange={(patch) => onArtworkTransform?.(item.id, patch)}
                  />
                  {textObjects.map((textObj) => {
                    const selectable = isTextObjectSelectable(activeTool, textObj);
                    return (
                      <ComicTextObjectShape
                        key={textObj.id}
                        object={textObj}
                        clipX={item.x}
                        clipY={item.y}
                        selected={selectedObjectId === textObj.id}
                        selectable={selectable}
                        onSelect={() => onSelectObject(item.id, textObj.id)}
                        onChange={(patch) => onTextObjectChange?.(item.id, textObj.id, patch)}
                        onStyleChange={(patch) => onTextStyleChange?.(item.id, textObj.id, patch)}
                      />
                    );
                  })}
                </>
              )}
            </Group>
          );
        })}
        {snapGuides &&
          snapGuides.x.map((x, index) => (
            <Line
              key={`snap-x-${index}-${x}`}
              points={[x, 0, x, COMIC_PAGE_HEIGHT]}
              stroke="#6366f1"
              strokeWidth={1}
              dash={[4, 4]}
              listening={false}
              perfectDrawEnabled={false}
            />
          ))}
        {snapGuides &&
          snapGuides.y.map((y, index) => (
            <Line
              key={`snap-y-${index}-${y}`}
              points={[0, y, COMIC_PAGE_WIDTH, y]}
              stroke="#6366f1"
              strokeWidth={1}
              dash={[4, 4]}
              listening={false}
              perfectDrawEnabled={false}
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
