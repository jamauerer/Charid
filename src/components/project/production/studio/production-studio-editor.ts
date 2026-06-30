/** Shared production studio editor foundation — extensible to storybook, novel, screenplay. */

export type StudioEditorMode = "embedded" | "full";

export type ComicEditorSelection =
  | { kind: "none" }
  | { kind: "panel"; panelIds: string[] }
  | { kind: "text"; panelId: string; objectId: string }
  | { kind: "artwork"; panelId: string };

export type ComicEditorContextTool =
  | "panels"
  | "panel-properties"
  | "text-tools"
  | "speech"
  | "thought"
  | "captions"
  | "layers"
  | "image";

export function contextToolForSelection(
  selection: ComicEditorSelection
): ComicEditorContextTool {
  switch (selection.kind) {
    case "panel":
      return "panel-properties";
    case "text":
      return selection.objectId ? "text-tools" : "panels";
    case "artwork":
      return "panel-properties";
    default:
      return "panels";
  }
}

export const COMIC_CONTEXT_TOOLS: {
  id: ComicEditorContextTool;
  label: string;
  soon?: boolean;
}[] = [
  { id: "panels", label: "Panel Layouts" },
  { id: "panel-properties", label: "Properties" },
  { id: "text-tools", label: "Text" },
  { id: "layers", label: "Layers" },
];

export const TEXT_TOOL_KINDS = [
  { id: "speech", label: "Speech bubble" },
  { id: "thought", label: "Thought bubble" },
  { id: "caption", label: "Caption" },
  { id: "sfx", label: "Sound effect" },
] as const;

export const LIBRARY_PLACEHOLDER_SECTIONS = [
  "Characters",
  "Stories",
  "Assets",
  "Scenes",
  "Reference Images",
] as const;

export const AI_PROMPT_RESERVED_CLASS = "production-ai-prompt-reserved";
