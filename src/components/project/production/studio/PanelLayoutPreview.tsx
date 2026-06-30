"use client";

import {
  COMIC_PAGE_HEIGHT,
  COMIC_PAGE_WIDTH,
} from "@/lib/canvas/page-layout-templates";
import type { PanelFrameRect } from "@/lib/canvas/page-layout-templates";

/** Layout thumbnail viewBox from docs/charid_editor_layout.html */
export const EDITOR_LAYOUT_THUMB_WIDTH = 40;
export const EDITOR_LAYOUT_THUMB_HEIGHT = 62;
const THUMB_PAD_X = 2;
const THUMB_PAD_Y = 2;
const THUMB_INNER_WIDTH = EDITOR_LAYOUT_THUMB_WIDTH - THUMB_PAD_X * 2;
const THUMB_INNER_HEIGHT = EDITOR_LAYOUT_THUMB_HEIGHT - THUMB_PAD_Y * 2;

type PanelLayoutPreviewProps = {
  panels: PanelFrameRect[];
  active?: boolean;
  className?: string;
  /** `editor` matches HTML layout thumbs (40×62); default keeps legacy preview sizing */
  variant?: "editor" | "legacy";
};

function editorThumbScale() {
  return {
    scaleX: THUMB_INNER_WIDTH / COMIC_PAGE_WIDTH,
    scaleY: THUMB_INNER_HEIGHT / COMIC_PAGE_HEIGHT,
  };
}

export function PanelLayoutPreview({
  panels,
  active = false,
  className = "",
  variant = "legacy",
}: PanelLayoutPreviewProps) {
  if (variant === "editor") {
    const { scaleX, scaleY } = editorThumbScale();
    return (
      <svg
        viewBox={`0 0 ${EDITOR_LAYOUT_THUMB_WIDTH} ${EDITOR_LAYOUT_THUMB_HEIGHT}`}
        className={className}
        aria-hidden
        preserveAspectRatio="xMidYMid meet"
      >
        {panels.map((panel, index) => (
          <rect
            key={index}
            x={THUMB_PAD_X + panel.x * scaleX}
            y={THUMB_PAD_Y + panel.y * scaleY}
            width={panel.width * scaleX}
            height={panel.height * scaleY}
            rx={1}
            fill="#0d0d0f"
            stroke={active ? "#4a9e8e" : "#555"}
            strokeWidth={1.5}
          />
        ))}
      </svg>
    );
  }

  const { scaleX, scaleY } = {
    scaleX: 66.25 / COMIC_PAGE_WIDTH,
    scaleY: 102.5 / COMIC_PAGE_HEIGHT,
  };

  return (
    <svg
      viewBox="0 0 66.25 102.5"
      className={`panel-layout-preview ${active ? "panel-layout-preview-active" : ""} ${className}`}
      aria-hidden
      preserveAspectRatio="xMidYMid meet"
    >
      <rect x={0} y={0} width={66.25} height={102.5} fill="#ffffff" stroke="#0f172a" strokeWidth={1.4} />
      {panels.map((panel, index) => (
        <rect
          key={index}
          x={panel.x * scaleX}
          y={panel.y * scaleY}
          width={panel.width * scaleX}
          height={panel.height * scaleY}
          fill="#ffffff"
          stroke="#0f172a"
          strokeWidth={2.4}
        />
      ))}
    </svg>
  );
}
