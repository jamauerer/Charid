"use client";

import type { TextObjectKind } from "@/lib/canvas/panel-content";

export type ComicToolboxTool = "move" | "panel" | "speech" | "thought" | "caption" | "sfx";

type ComicFloatingToolboxProps = {
  activeTool: ComicToolboxTool;
  onToolChange: (tool: ComicToolboxTool) => void;
  onAddText?: (kind: TextObjectKind) => void;
  onAddPanel?: () => void;
  disabled?: boolean;
};

const TOOLS: {
  id: ComicToolboxTool;
  label: string;
  shortcut: string;
  icon: string;
  kind?: TextObjectKind;
}[] = [
  { id: "move", label: "Move", shortcut: "V", icon: "↖" },
  { id: "panel", label: "Panel", shortcut: "P", icon: "▢" },
  { id: "speech", label: "Speech", shortcut: "S", icon: "💬", kind: "speech" },
  { id: "thought", label: "Thought", shortcut: "T", icon: "☁", kind: "thought" },
  { id: "caption", label: "Caption", shortcut: "C", icon: "▭", kind: "caption" },
  { id: "sfx", label: "SFX", shortcut: "X", icon: "!", kind: "sfx" },
];

export function ComicFloatingToolbox({
  activeTool,
  onToolChange,
  onAddText,
  onAddPanel,
  disabled = false,
}: ComicFloatingToolboxProps) {
  function handleClick(tool: (typeof TOOLS)[number]) {
    if (disabled) return;
    onToolChange(tool.id);
    if (tool.id === "panel") {
      onAddPanel?.();
      return;
    }
    if (tool.kind && onAddText) {
      onAddText(tool.kind);
      return;
    }
  }

  return (
    <div className="comic-floating-toolbox" role="toolbar" aria-label="Comic tools">
      {TOOLS.map((tool) => (
        <button
          key={tool.id}
          type="button"
          disabled={disabled}
          onClick={() => handleClick(tool)}
          className={`comic-toolbox-btn ${activeTool === tool.id ? "comic-toolbox-btn-active" : ""}`}
          title={`${tool.label} (${tool.shortcut})`}
        >
          <span className="comic-toolbox-btn-icon" aria-hidden>
            {tool.icon}
          </span>
          <span className="comic-toolbox-btn-label">{tool.label}</span>
          <span className="comic-toolbox-btn-shortcut">{tool.shortcut}</span>
        </button>
      ))}
    </div>
  );
}
