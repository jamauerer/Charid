"use client";

import { useState } from "react";
import { formatZoomLabel, type CanvasZoomMode } from "@/lib/canvas/layout-canvas-zoom";
import type { LayoutCanvasZoomState } from "@/components/project/production/canvas/useLayoutCanvasZoom";

type ComicPageEditorZoomMenuProps = {
  zoom: LayoutCanvasZoomState;
};

export function ComicPageEditorZoomMenu({ zoom }: ComicPageEditorZoomMenuProps) {
  const [open, setOpen] = useState(false);

  const modeLabel =
    zoom.zoomMode === "fit-page"
      ? "Fit Page"
      : zoom.zoomMode === "fit-width"
        ? "Fit Width"
        : formatZoomLabel(zoom.effectiveScale);

  return (
    <div className="relative">
      <button
        type="button"
        className="production-editor-toolbar-btn"
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
        aria-haspopup="menu"
      >
        {modeLabel}
      </button>
      {open && (
        <>
          <button
            type="button"
            className="fixed inset-0 z-10 cursor-default"
            aria-label="Close zoom menu"
            onClick={() => setOpen(false)}
          />
          <div className="production-editor-zoom-menu" role="menu">
            <ZoomMenuItem
              active={zoom.zoomMode === "fit-page"}
              onClick={() => {
                zoom.setZoomMode("fit-page");
                setOpen(false);
              }}
            >
              Fit Page
            </ZoomMenuItem>
            <ZoomMenuItem
              active={zoom.zoomMode === "fit-width"}
              onClick={() => {
                zoom.setZoomMode("fit-width");
                setOpen(false);
              }}
            >
              Fit Width
            </ZoomMenuItem>
            <div className="my-1 h-px bg-[var(--brand-border)]" />
            <ZoomMenuItem
              onClick={() => {
                zoom.zoomOut();
              }}
            >
              Zoom out
            </ZoomMenuItem>
            <ZoomMenuItem
              onClick={() => {
                zoom.zoomIn();
              }}
            >
              Zoom in
            </ZoomMenuItem>
            <p className="px-2 py-1 text-[10px] text-[var(--brand-text-muted)]">
              {formatZoomLabel(zoom.effectiveScale)} · Ctrl/Cmd + scroll
            </p>
          </div>
        </>
      )}
    </div>
  );
}

function ZoomMenuItem({
  active,
  onClick,
  children,
}: {
  active?: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      role="menuitem"
      onClick={onClick}
      className={`production-editor-zoom-menu-item ${active ? "production-editor-zoom-menu-item-active" : ""}`}
    >
      {children}
    </button>
  );
}

export function zoomModeLabel(mode: CanvasZoomMode, scale: number): string {
  if (mode === "fit-page") return "Fit Page";
  if (mode === "fit-width") return "Fit Width";
  return formatZoomLabel(scale);
}
