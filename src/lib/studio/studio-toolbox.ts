import type { LucideIcon } from "lucide-react";
import {
  Cloud,
  Layers,
  LayoutGrid,
  MessageCircle,
  Pencil,
  RectangleHorizontal,
  Shapes,
  Sparkles,
  Type,
  Upload,
  Zap,
} from "lucide-react";
import type { TextObjectKind } from "@/lib/canvas/panel-content";

export type StudioToolboxTool =
  | "layouts"
  | "speech"
  | "thought"
  | "caption"
  | "sfx"
  | "text"
  | "draw"
  | "upload"
  | "ai"
  | "shapes"
  | "layers";

export type StudioToolboxItem = {
  id: StudioToolboxTool;
  label: string;
  icon: LucideIcon;
  kind?: TextObjectKind;
};

/** Tool order matches docs/CharID_Editor_Implementation_Spec.md §4 */
export const STUDIO_TOOLBOX_GROUPS: {
  id: string;
  items: StudioToolboxItem[];
}[] = [
  {
    id: "panels-bubbles",
    items: [
      { id: "layouts", label: "Panels", icon: LayoutGrid },
      { id: "speech", label: "Speech", icon: MessageCircle, kind: "speech" },
      { id: "thought", label: "Thought", icon: Cloud, kind: "thought" },
      { id: "sfx", label: "SFX", icon: Zap, kind: "sfx" },
      { id: "caption", label: "Caption", icon: RectangleHorizontal, kind: "caption" },
    ],
  },
  {
    id: "content",
    items: [
      { id: "text", label: "Text", icon: Type },
      { id: "draw", label: "Draw", icon: Pencil },
      { id: "upload", label: "Upload", icon: Upload },
    ],
  },
  {
    id: "ai-shapes",
    items: [
      { id: "ai", label: "AI Gen", icon: Sparkles },
      { id: "shapes", label: "Shapes", icon: Shapes },
    ],
  },
  {
    id: "layers",
    items: [{ id: "layers", label: "Layers", icon: Layers }],
  },
];

export const STUDIO_TOOLBOX_ITEMS: StudioToolboxItem[] = STUDIO_TOOLBOX_GROUPS.flatMap(
  (g) => g.items
);

export type CanvasInteractionTool = "move" | "panel" | "speech" | "thought" | "caption" | "sfx";

export function toCanvasTool(tool: StudioToolboxTool | null): CanvasInteractionTool {
  if (!tool) return "move";
  if (tool === "layouts") return "panel";
  if (tool === "speech" || tool === "thought" || tool === "caption" || tool === "sfx") return tool;
  return "move";
}

export function toolOpensSidebar(_tool: StudioToolboxTool): boolean {
  return true;
}

export function toolboxItemForTool(tool: StudioToolboxTool): StudioToolboxItem | undefined {
  return STUDIO_TOOLBOX_ITEMS.find((t) => t.id === tool);
}
