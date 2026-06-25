/** Shared production studio editor foundation — extensible to storybook, novel, screenplay. */

export type StudioEditorMode = "embedded" | "full";

export type ComicEditorSelection =
  | { kind: "none" }
  | { kind: "panel"; panelId: string }
  | { kind: "speech"; objectId: string }
  | { kind: "thought"; objectId: string }
  | { kind: "image"; objectId: string };

export type ComicEditorContextTool =
  | "panels"
  | "panel-properties"
  | "speech"
  | "thought"
  | "captions"
  | "inspector"
  | "layers"
  | "image";

export function contextToolForSelection(
  selection: ComicEditorSelection
): ComicEditorContextTool {
  switch (selection.kind) {
    case "panel":
      return "panel-properties";
    case "speech":
      return "speech";
    case "thought":
      return "thought";
    case "image":
      return "image";
    default:
      return "panels";
  }
}

export const COMIC_CONTEXT_TOOLS: {
  id: ComicEditorContextTool;
  label: string;
  soon?: boolean;
}[] = [
  { id: "panels", label: "Panels" },
  { id: "panel-properties", label: "Panel Properties" },
  { id: "speech", label: "Speech", soon: true },
  { id: "thought", label: "Thought", soon: true },
  { id: "captions", label: "Captions", soon: true },
  { id: "inspector", label: "Inspector", soon: true },
  { id: "layers", label: "Layers", soon: true },
];

export const LIBRARY_PLACEHOLDER_SECTIONS = [
  "Characters",
  "Stories",
  "Assets",
  "Scenes",
  "Reference Images",
] as const;
