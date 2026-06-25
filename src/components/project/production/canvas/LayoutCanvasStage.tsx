"use client";

import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import { Layer, Stage } from "react-konva";
import type Konva from "konva";
import type { LayoutCanvasZoomState } from "@/components/project/production/canvas/useLayoutCanvasZoom";
import { useLayoutCanvasZoom } from "@/components/project/production/canvas/useLayoutCanvasZoom";
import {
  CANVAS_STUDIO_PADDING,
  CANVAS_WHEEL_ZOOM_STEP,
  CANVAS_WORKSPACE_PADDING,
  CANVAS_ZOOM_STEP,
  computeFitPageScale,
  computeFitWidthScale,
  computeStudioFitPageScale,
} from "@/lib/canvas/layout-canvas-zoom";

type LayoutCanvasStageProps = {
  width: number;
  height: number;
  children: ReactNode;
  onBackgroundClick?: () => void;
  fillViewport?: boolean;
  studioMode?: boolean;
  showZoomBar?: boolean;
  zoom?: LayoutCanvasZoomState;
  zoomStorageKey?: string;
};

export function LayoutCanvasStage({
  width,
  height,
  children,
  onBackgroundClick,
  fillViewport = false,
  studioMode = false,
  showZoomBar = true,
  zoom: externalZoom,
  zoomStorageKey = "layout-canvas-default",
}: LayoutCanvasStageProps) {
  const internalZoom = useLayoutCanvasZoom(zoomStorageKey, 1, 1);
  const zoom = externalZoom ?? internalZoom;
  const viewportRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<Konva.Stage>(null);
  const [viewportSize, setViewportSize] = useState({ width: 0, height: 0 });

  useEffect(() => {
    const element = viewportRef.current;
    if (!element) return;

    function measure() {
      setViewportSize({
        width: element?.clientWidth ?? 0,
        height: element?.clientHeight ?? 0,
      });
    }

    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(element);
    window.addEventListener("resize", measure);
    return () => {
      observer.disconnect();
      window.removeEventListener("resize", measure);
    };
  }, []);

  const padding = studioMode ? CANVAS_STUDIO_PADDING : CANVAS_WORKSPACE_PADDING;

  const fitPageScale =
    viewportSize.width > 0 && viewportSize.height > 0
      ? studioMode
        ? computeStudioFitPageScale(
            viewportSize.width,
            viewportSize.height,
            width,
            height,
            padding
          )
        : computeFitPageScale(viewportSize.width, viewportSize.height, width, height, padding)
      : 1;

  const fitWidthScale =
    viewportSize.width > 0
      ? computeFitWidthScale(viewportSize.width, width, padding)
      : 1;

  useEffect(() => {
    zoom.setEffectiveScaleRef(fitPageScale);
  }, [fitPageScale, zoom]);

  const effectiveScale =
    !zoom.hydrated
      ? fitPageScale
      : zoom.zoomMode === "fit-page"
        ? fitPageScale
        : zoom.zoomMode === "fit-width"
          ? fitWidthScale
          : zoom.customScale;

  const stageWidth = width * effectiveScale;
  const stageHeight = height * effectiveScale;

  const handleWheel = useCallback(
    (event: React.WheelEvent<HTMLDivElement>) => {
      if (!event.ctrlKey && !event.metaKey) return;
      event.preventDefault();
      const direction = event.deltaY > 0 ? -1 : 1;
      const baseScale =
        zoom.zoomMode === "custom"
          ? zoom.customScale
          : zoom.zoomMode === "fit-width"
            ? fitWidthScale
            : fitPageScale;
      zoom.setCustomZoom(baseScale + direction * CANVAS_WHEEL_ZOOM_STEP);
    },
    [fitPageScale, fitWidthScale, zoom]
  );

  function handleStagePointerDown(event: Konva.KonvaEventObject<MouseEvent | TouchEvent>) {
    if (event.target === stageRef.current) {
      onBackgroundClick?.();
    }
  }

  const shellClass = studioMode
    ? "production-canvas-shell production-canvas-shell-studio"
    : "production-canvas-shell overflow-hidden rounded-lg border border-[var(--production-canvas-border)]";

  return (
    <div className={shellClass}>
      {showZoomBar && (
        <div className="flex flex-wrap items-center gap-1 border-b border-[var(--production-canvas-border)] bg-[var(--production-canvas-chrome)] px-2 py-1.5">
          <ZoomBarButton
            active={zoom.zoomMode === "fit-page"}
            onClick={() => zoom.setZoomMode("fit-page")}
            title="Fit entire page in view"
          >
            Fit Page
          </ZoomBarButton>
          <ZoomBarButton
            active={zoom.zoomMode === "fit-width"}
            onClick={() => zoom.setZoomMode("fit-width")}
            title="Fit page width"
          >
            Fit Width
          </ZoomBarButton>
          <span className="mx-1 h-4 w-px bg-[var(--production-canvas-border)]" aria-hidden />
          <ZoomBarButton onClick={zoom.zoomOut} title="Zoom out">
            −
          </ZoomBarButton>
          <span className="min-w-[3rem] text-center text-xs tabular-nums text-[var(--production-canvas-text)]">
            {Math.round(effectiveScale * 100)}%
          </span>
          <ZoomBarButton onClick={zoom.zoomIn} title="Zoom in">
            +
          </ZoomBarButton>
        </div>
      )}
      <div
        ref={viewportRef}
        className={`production-canvas-viewport flex items-center justify-center overflow-hidden ${
          fillViewport ? "production-canvas-viewport-fill" : ""
        }`}
        style={
          fillViewport
            ? undefined
            : { height: "58vh", maxHeight: "720px" }
        }
        onWheel={handleWheel}
      >
        <div
          className="production-canvas-page-shadow shrink-0"
          style={{
            width: stageWidth + padding,
            padding: padding / 2,
          }}
        >
          <Stage
            ref={stageRef}
            width={stageWidth}
            height={stageHeight}
            scaleX={effectiveScale}
            scaleY={effectiveScale}
            onMouseDown={handleStagePointerDown}
            onTouchStart={handleStagePointerDown}
          >
            <Layer perfectDrawEnabled={false}>{children}</Layer>
          </Stage>
        </div>
      </div>
    </div>
  );
}

function ZoomBarButton({
  active,
  onClick,
  children,
  title,
}: {
  active?: boolean;
  onClick: () => void;
  children: ReactNode;
  title: string;
}) {
  return (
    <button
      type="button"
      title={title}
      onClick={onClick}
      className={`production-editor-btn ${active ? "production-editor-btn-active" : ""}`}
    >
      {children}
    </button>
  );
}

export function layoutRoleLabel(role: "illustration" | "text" | "caption"): string {
  switch (role) {
    case "illustration":
      return "Illustration area";
    case "text":
      return "Text area";
    case "caption":
      return "Caption area";
    default:
      return "Region";
  }
}

export function layoutRoleFill(role: "illustration" | "text" | "caption"): string {
  switch (role) {
    case "illustration":
      return "rgba(99, 102, 241, 0.1)";
    case "text":
      return "rgba(16, 185, 129, 0.1)";
    case "caption":
      return "rgba(245, 158, 11, 0.1)";
    default:
      return "rgba(148, 163, 184, 0.08)";
  }
}

export function layoutRoleStroke(role: "illustration" | "text" | "caption"): string {
  switch (role) {
    case "illustration":
      return "rgba(99, 102, 241, 0.75)";
    case "text":
      return "rgba(16, 185, 129, 0.75)";
    case "caption":
      return "rgba(245, 158, 11, 0.75)";
    default:
      return "rgba(148, 163, 184, 0.75)";
  }
}
