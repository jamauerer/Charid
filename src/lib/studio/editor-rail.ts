import type { StudioToolboxTool } from "@/lib/studio/studio-toolbox";

/** Sidebar panel ids from docs/charid_editor_layout.html icon rail `data-panel` values */
export type EditorRailPanel =
  | "panels"
  | "speech"
  | "thought"
  | "sfx"
  | "caption"
  | "text"
  | "draw"
  | "upload"
  | "ai"
  | "shapes"
  | "layers";

export function toolToRailPanel(tool: StudioToolboxTool): EditorRailPanel {
  return tool === "layouts" ? "panels" : tool;
}

export function railPanelToTool(panel: EditorRailPanel): StudioToolboxTool {
  return panel === "panels" ? "layouts" : panel;
}
