"use client";

import type { LayoutCanvasZoomState } from "@/components/project/production/canvas/useLayoutCanvasZoom";

type EditorZoomBarProps = {
  zoom: LayoutCanvasZoomState;
  scale: number;
};

/** Bottom-right zoom controls — matches `.zoom-bar` in the HTML reference */
export function EditorZoomBar({ zoom, scale }: EditorZoomBarProps) {
  return (
    <div className="zoom-bar">
      <button type="button" className="zoom-btn" onClick={zoom.zoomOut} title="Zoom out">
        −
      </button>
      <span className="zoom-val">{Math.round(scale * 100)}%</span>
      <button type="button" className="zoom-btn" onClick={zoom.zoomIn} title="Zoom in">
        +
      </button>
      <button type="button" className="zoom-fit-btn" onClick={() => zoom.setZoomMode("fit-page")}>
        Fit page
      </button>
    </div>
  );
}
