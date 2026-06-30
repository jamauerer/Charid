"use client";

import type { EditorRailPanel } from "@/lib/studio/editor-rail";
import { railPanelToTool, toolToRailPanel } from "@/lib/studio/editor-rail";
import type { StudioToolboxTool } from "@/lib/studio/studio-toolbox";

type EditorIconRailProps = {
  activeTool: StudioToolboxTool;
  onToolChange: (tool: StudioToolboxTool) => void;
  disabled?: boolean;
};

type RailItem = {
  panel: EditorRailPanel;
  title: string;
  label: string;
  icon: React.ReactNode;
};

const RAIL_ITEMS: RailItem[] = [
  {
    panel: "panels",
    title: "Panel layouts",
    label: "Panels",
    icon: (
      <svg viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.4">
        <rect x="1" y="1" width="7" height="7" rx=".8" />
        <rect x="10" y="1" width="7" height="7" rx=".8" />
        <rect x="1" y="10" width="7" height="7" rx=".8" />
        <rect x="10" y="10" width="7" height="7" rx=".8" />
      </svg>
    ),
  },
  {
    panel: "speech",
    title: "Speech bubbles",
    label: "Speech",
    icon: (
      <svg viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.4">
        <path d="M2 3a1 1 0 0 1 1-1h12a1 1 0 0 1 1 1v8a1 1 0 0 1-1 1H6l-4 3V3z" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    panel: "thought",
    title: "Thought bubbles",
    label: "Thought",
    icon: (
      <svg viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.4">
        <ellipse cx="9" cy="6" rx="7" ry="4.5" />
        <circle cx="5" cy="12" r="1.5" />
        <circle cx="3" cy="15" r="1" />
      </svg>
    ),
  },
  {
    panel: "sfx",
    title: "Sound effects",
    label: "SFX",
    icon: (
      <svg viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.4">
        <path d="M2 6l3-3 3 5 3-3 3 3" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    panel: "caption",
    title: "Captions & narration",
    label: "Caption",
    icon: (
      <svg viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.4">
        <rect x="2" y="5" width="14" height="8" rx="1" />
        <path d="M4.5 8h9M4.5 10.5h6" strokeLinecap="round" />
      </svg>
    ),
  },
];

const RAIL_CONTENT: RailItem[] = [
  {
    panel: "text",
    title: "Text tool",
    label: "Text",
    icon: (
      <svg viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.4">
        <path d="M3 4h12M9 4v10M6 14h6" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    panel: "draw",
    title: "Draw",
    label: "Draw",
    icon: (
      <svg viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.4">
        <path d="M3 15l2-1 9-9-1-1-9 9-1 2z" strokeLinejoin="round" />
        <path d="M13 4l1 1" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    panel: "upload",
    title: "Upload image",
    label: "Upload",
    icon: (
      <svg viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.4">
        <rect x="2" y="10" width="14" height="6" rx="1" />
        <path d="M9 2v8M6 5l3-3 3 3" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
];

const RAIL_AI: RailItem[] = [
  {
    panel: "ai",
    title: "AI Generate",
    label: "AI Gen",
    icon: (
      <svg viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.4">
        <path d="M9 2l1.5 4.5H15L11.5 9l1.5 4.5L9 11l-4 2.5L6.5 9 3 6.5h4.5z" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    panel: "shapes",
    title: "Shapes",
    label: "Shapes",
    icon: (
      <svg viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.4">
        <circle cx="12" cy="12" r="4" />
        <rect x="2" y="2" width="6" height="6" rx=".5" />
        <path d="M2 16l4-7 4 7z" strokeLinejoin="round" />
      </svg>
    ),
  },
];

const RAIL_LAYERS: RailItem = {
  panel: "layers",
  title: "Layers",
  label: "Layers",
  icon: (
    <svg viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.4">
      <path d="M2 9l7 4 7-4M2 13l7 4 7-4M9 2L2 6l7 3 7-3-7-4z" strokeLinejoin="round" />
    </svg>
  ),
};

function RailButton({
  item,
  active,
  disabled,
  onSelect,
}: {
  item: RailItem;
  active: boolean;
  disabled?: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      type="button"
      className={`rail-btn${active ? " active" : ""}`}
      data-panel={item.panel}
      title={item.title}
      disabled={disabled}
      onClick={onSelect}
    >
      {item.icon}
      <span className="rail-label">{item.label}</span>
    </button>
  );
}

/** Icon rail — matches docs/charid_editor_layout.html `.iconrail` */
export function EditorIconRail({ activeTool, onToolChange, disabled }: EditorIconRailProps) {
  const activePanel = toolToRailPanel(activeTool);

  function select(panel: EditorRailPanel) {
    onToolChange(railPanelToTool(panel));
  }

  return (
    <>
      {RAIL_ITEMS.map((item) => (
        <RailButton
          key={item.panel}
          item={item}
          active={activePanel === item.panel}
          disabled={disabled}
          onSelect={() => select(item.panel)}
        />
      ))}
      <div className="rail-sep" aria-hidden />
      {RAIL_CONTENT.map((item) => (
        <RailButton
          key={item.panel}
          item={item}
          active={activePanel === item.panel}
          disabled={disabled}
          onSelect={() => select(item.panel)}
        />
      ))}
      <div className="rail-sep" aria-hidden />
      {RAIL_AI.map((item) => (
        <RailButton
          key={item.panel}
          item={item}
          active={activePanel === item.panel}
          disabled={disabled}
          onSelect={() => select(item.panel)}
        />
      ))}
      <div className="rail-sep" aria-hidden />
      <RailButton
        item={RAIL_LAYERS}
        active={activePanel === RAIL_LAYERS.panel}
        disabled={disabled}
        onSelect={() => select(RAIL_LAYERS.panel)}
      />
    </>
  );
}
