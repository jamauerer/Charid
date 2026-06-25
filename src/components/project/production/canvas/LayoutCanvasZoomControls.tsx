"use client";

import {
  CANVAS_ZOOM_PRESETS,
  clampZoom,
  formatZoomLabel,
  type CanvasZoomMode,
} from "@/lib/canvas/layout-canvas-zoom";

type LayoutCanvasZoomControlsProps = {
  zoomMode: CanvasZoomMode;
  effectiveScale: number;
  onFitPage: () => void;
  onFitWidth: () => void;
  onPreset: (scale: number) => void;
  onZoomIn: () => void;
  onZoomOut: () => void;
  compact?: boolean;
};

function ZoomButton({
  active,
  onClick,
  children,
  title,
}: {
  active?: boolean;
  onClick: () => void;
  children: React.ReactNode;
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

export function LayoutCanvasZoomControls({
  zoomMode,
  effectiveScale,
  onFitPage,
  onFitWidth,
  onPreset,
  onZoomIn,
  onZoomOut,
  compact = false,
}: LayoutCanvasZoomControlsProps) {
  return (
    <div
      className={`flex flex-wrap items-center gap-1 border-b border-[var(--production-canvas-border)] bg-[var(--production-canvas-chrome)] ${
        compact ? "px-2 py-1" : "gap-1.5 px-2 py-1.5"
      }`}
    >
      <ZoomButton
        active={zoomMode === "fit-page"}
        onClick={onFitPage}
        title="Fit entire page in view"
      >
        Fit Page
      </ZoomButton>
      <ZoomButton
        active={zoomMode === "fit-width"}
        onClick={onFitWidth}
        title="Fit page width"
      >
        Fit Width
      </ZoomButton>
      <span className="mx-1 h-4 w-px bg-[var(--production-canvas-border)]" aria-hidden />
      {!compact &&
        CANVAS_ZOOM_PRESETS.map((preset) => (
          <ZoomButton
            key={preset}
            active={zoomMode === "custom" && Math.abs(effectiveScale - preset) < 0.01}
            onClick={() => onPreset(preset)}
            title={`Zoom to ${formatZoomLabel(preset)}`}
          >
            {formatZoomLabel(preset)}
          </ZoomButton>
        ))}
      {!compact && (
        <span className="mx-1 h-4 w-px bg-[var(--production-canvas-border)]" aria-hidden />
      )}
      <ZoomButton onClick={onZoomOut} title="Zoom out">
        −
      </ZoomButton>
      <span
        className="min-w-[3.5rem] text-center text-xs font-medium tabular-nums text-[var(--production-canvas-text)]"
        aria-live="polite"
      >
        {formatZoomLabel(effectiveScale)}
      </span>
      <ZoomButton onClick={onZoomIn} title="Zoom in">
        +
      </ZoomButton>
      <span className={`ml-auto text-[10px] text-[var(--production-canvas-muted)] ${compact ? "hidden lg:inline" : "hidden sm:inline"}`}>
        Ctrl/Cmd + scroll
      </span>
    </div>
  );
}

export { clampZoom };
