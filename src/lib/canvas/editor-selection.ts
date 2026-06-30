import type { ComicToolboxTool } from "@/components/project/production/comic/ComicFloatingToolbox";
import { getTextKind } from "@/lib/canvas/panel-content";
import type { CanvasObjectV1 } from "@/types/canvas/document-v1";

export function isPanelInteractive(activeTool: ComicToolboxTool): boolean {
  return activeTool === "move" || activeTool === "panel";
}

export function isArtworkInteractive(activeTool: ComicToolboxTool): boolean {
  return activeTool === "move";
}

export function isTextObjectSelectable(
  activeTool: ComicToolboxTool,
  object: CanvasObjectV1
): boolean {
  if (activeTool === "move") return true;
  const kind = getTextKind(object);
  switch (activeTool) {
    case "speech":
      return kind === "speech";
    case "thought":
      return kind === "thought";
    case "caption":
      return kind === "caption" || kind === "narration" || kind === "free";
    case "sfx":
      return kind === "sfx";
    default:
      return false;
  }
}
