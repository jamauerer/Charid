"use client";

import { useEffect, useState } from "react";
import { ComicPagePanelsSidebar } from "@/components/project/production/comic/ComicPagePanelsSidebar";
import { ComicStudioArtworkSlot } from "@/components/project/production/comic/ComicStudioArtworkSlot";
import {
  COMIC_CONTEXT_TOOLS,
  contextToolForSelection,
  type ComicEditorContextTool,
  type ComicEditorSelection,
} from "@/components/project/production/studio/production-studio-editor";
import type { PanelBorderStyle } from "@/lib/canvas/page-layout-surface";
import { PANEL_BORDER_OPTIONS } from "@/lib/canvas/panel-border-style";
import type { ComicPanel } from "@/types/production/comic";

type ComicPageEditorRightSidebarProps = {
  projectId: string;
  pageId: string;
  panels: ComicPanel[];
  selection: ComicEditorSelection;
  panelBorderStyle: PanelBorderStyle;
  pending: boolean;
  onSelectPanel: (panelId: string | null) => void;
  onAddPanel: () => void;
  onDeletePanel: () => void;
  onBorderStyleChange: (style: PanelBorderStyle) => void;
};

export function ComicPageEditorRightSidebar({
  projectId,
  pageId,
  panels,
  selection,
  panelBorderStyle,
  pending,
  onSelectPanel,
  onAddPanel,
  onDeletePanel,
  onBorderStyleChange,
}: ComicPageEditorRightSidebarProps) {
  const autoTool = contextToolForSelection(selection);
  const [activeTool, setActiveTool] = useState<ComicEditorContextTool>(autoTool);

  useEffect(() => {
    setActiveTool(autoTool);
  }, [autoTool]);

  const selectedPanel =
    selection.kind === "panel"
      ? panels.find((panel) => panel.id === selection.panelId) ?? null
      : null;

  const visibleTabs = COMIC_CONTEXT_TOOLS.filter((tool) =>
    tool.id === "panel-properties" ? selection.kind === "panel" : true
  );

  return (
    <aside className="production-editor-sidebar production-editor-sidebar-right">
      <nav className="production-editor-context-nav" aria-label="Context tools">
        {visibleTabs.map((tool) => (
          <button
            key={tool.id}
            type="button"
            onClick={() => setActiveTool(tool.id)}
            className={`production-editor-context-tab ${
              activeTool === tool.id ? "production-editor-context-tab-active" : ""
            }`}
          >
            {tool.label}
            {tool.soon && (
              <span className="ml-0.5 text-[8px] uppercase text-[var(--brand-text-muted)]">Soon</span>
            )}
          </button>
        ))}
      </nav>

      <div className="production-editor-context-panel">
        {activeTool === "panels" && (
          <ComicPagePanelsSidebar
            projectId={projectId}
            pageId={pageId}
            panels={panels}
            selectedPanelId={selection.kind === "panel" ? selection.panelId : null}
            onSelectPanel={(id) => onSelectPanel(id)}
            onAddPanel={onAddPanel}
          />
        )}

        {activeTool === "panel-properties" && selectedPanel && (
          <PanelPropertiesPanel
            panel={selectedPanel}
            panelBorderStyle={panelBorderStyle}
            pending={pending}
            onBorderStyleChange={onBorderStyleChange}
            onDeletePanel={onDeletePanel}
          />
        )}

        {activeTool !== "panels" && activeTool !== "panel-properties" && (
          <ComingSoonPanel name={COMIC_CONTEXT_TOOLS.find((t) => t.id === activeTool)?.label ?? "Tool"} />
        )}
      </div>
    </aside>
  );
}

function PanelPropertiesPanel({
  panel,
  panelBorderStyle,
  pending,
  onBorderStyleChange,
  onDeletePanel,
}: {
  panel: ComicPanel;
  panelBorderStyle: PanelBorderStyle;
  pending: boolean;
  onBorderStyleChange: (style: PanelBorderStyle) => void;
  onDeletePanel: () => void;
}) {
  return (
    <div className="space-y-3">
      <div>
        <p className="text-sm font-medium text-[var(--foreground)]">{panel.name}</p>
        <p className="mt-1 text-xs text-[var(--brand-text-muted)]">
          Drag handles to move and resize on the page.
        </p>
      </div>

      <ComicStudioArtworkSlot label="Panel artwork" compact />

      <div>
        <label className="mb-1 block text-[10px] uppercase tracking-wide text-[var(--brand-text-muted)]">
          Border
        </label>
        <select
          value={panelBorderStyle}
          onChange={(event) => onBorderStyleChange(event.target.value as PanelBorderStyle)}
          disabled={pending}
          className="production-editor-select w-full"
        >
          {PANEL_BORDER_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>

      <PlaceholderAction label="Rounded corners" />
      <PlaceholderAction label="Duplicate panel" />

      <button
        type="button"
        onClick={onDeletePanel}
        disabled={pending}
        className="production-editor-btn production-editor-btn-danger w-full"
      >
        Delete panel
      </button>
    </div>
  );
}

function PlaceholderAction({ label }: { label: string }) {
  return (
    <button type="button" disabled className="production-editor-sidebar-action" title="Coming soon">
      {label}
      <span className="text-[9px] uppercase text-[var(--brand-text-muted)]">Soon</span>
    </button>
  );
}

function ComingSoonPanel({ name }: { name: string }) {
  return (
    <div className="rounded-lg border border-dashed border-[var(--brand-border)] px-3 py-5 text-center">
      <p className="text-sm font-medium text-[var(--foreground)]">{name}</p>
      <p className="mt-1 text-xs text-[var(--brand-text-muted)]">Coming in a future milestone.</p>
    </div>
  );
}
