"use client";

import { useCallback, useEffect, useMemo, useRef, useState, useTransition } from "react";
import { Rect } from "react-konva";
import {
  addComicPagePanel,
  applyComicPageTemplate,
  deleteComicPagePanelFromLayout,
  saveComicPageLayout,
  saveComicPagePanelBorderStyle,
} from "@/app/actions/production/page-layout";
import type { PanelBorderStyle } from "@/lib/canvas/page-layout-surface";
import { LayoutCanvasStage } from "@/components/project/production/canvas/LayoutCanvasStage";
import { LayoutRectShape } from "@/components/project/production/canvas/LayoutRectShape";
import { useLayoutEditorKeyboard } from "@/components/project/production/canvas/useLayoutEditorKeyboard";
import {
  COMIC_PAGE_HEIGHT,
  COMIC_PAGE_WIDTH,
  PAGE_LAYOUT_TEMPLATES,
  normalizePanelFrames,
  type PageLayoutTemplateId,
  type PanelFrameRect,
} from "@/lib/canvas/page-layout-templates";
import { PANEL_BORDER_OPTIONS } from "@/lib/canvas/panel-border-style";
import { useDebouncedCallback } from "@/lib/use-debounced-callback";
import { studioBtnPrimarySm } from "@/lib/visual-identity";
import type { ComicPanel } from "@/types/production/comic";

type PanelLayoutState = PanelFrameRect & {
  id: string;
  name: string;
};

type ComicPageLayoutEditorProps = {
  projectId: string;
  pageId: string;
  panels: ComicPanel[];
  templateId: PageLayoutTemplateId | null;
  panelBorderStyle: PanelBorderStyle;
  selectedPanelId: string | null;
  onSelectPanel: (panelId: string | null) => void;
  onPanelsChange: () => void;
};

function panelsToLayoutState(panels: ComicPanel[]): PanelLayoutState[] {
  const frames = normalizePanelFrames(panels);
  return panels.map((panel, index) => ({
    id: panel.id,
    name: panel.name,
    ...frames[index],
  }));
}

export function ComicPageLayoutEditor({
  projectId,
  pageId,
  panels,
  templateId,
  panelBorderStyle: initialBorderStyle,
  selectedPanelId,
  onSelectPanel,
  onPanelsChange,
}: ComicPageLayoutEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null);
  const [layoutPanels, setLayoutPanels] = useState<PanelLayoutState[]>(() =>
    panelsToLayoutState(panels)
  );
  const [activeTemplateId, setActiveTemplateId] = useState<PageLayoutTemplateId | null>(
    templateId
  );
  const [panelBorderStyle, setPanelBorderStyle] =
    useState<PanelBorderStyle>(initialBorderStyle);
  const [saveState, setSaveState] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  useEffect(() => {
    setLayoutPanels(panelsToLayoutState(panels));
  }, [panels]);

  useEffect(() => {
    setActiveTemplateId(templateId);
  }, [templateId]);

  useEffect(() => {
    setPanelBorderStyle(initialBorderStyle);
  }, [initialBorderStyle]);

  const persistLayout = useDebouncedCallback(
    useCallback(
      async (nextPanels: PanelLayoutState[], nextTemplateId: PageLayoutTemplateId | null) => {
        setSaveState("saving");
        const result = await saveComicPageLayout(
          projectId,
          pageId,
          nextPanels.map((panel) => ({
            panelId: panel.id,
            frame: {
              x: panel.x,
              y: panel.y,
              width: panel.width,
              height: panel.height,
            },
          })),
          nextTemplateId
        );
        if (result.error) {
          setSaveState("error");
          setError(result.error);
          return;
        }
        setSaveState("saved");
        setError(null);
      },
      [projectId, pageId]
    ),
    600
  );

  function updatePanelFrame(panelId: string, frame: PanelFrameRect) {
    setActiveTemplateId(null);
    setLayoutPanels((current) => {
      const next = current.map((panel) =>
        panel.id === panelId ? { ...panel, ...frame } : panel
      );
      persistLayout(next, null);
      return next;
    });
  }

  function applyTemplate(nextTemplateId: PageLayoutTemplateId) {
    startTransition(async () => {
      setError(null);
      const result = await applyComicPageTemplate(projectId, pageId, nextTemplateId);
      if (result.error) {
        setError(result.error);
        return;
      }
      setActiveTemplateId(nextTemplateId);
      onSelectPanel(result.panels[0]?.id ?? null);
      onPanelsChange();
    });
  }

  function handleAddPanel() {
    startTransition(async () => {
      setError(null);
      const result = await addComicPagePanel(projectId, pageId);
      if (result.error || !result.panel) {
        setError(result.error ?? "Failed to add panel.");
        return;
      }
      setActiveTemplateId(null);
      onSelectPanel(result.panel.id);
      onPanelsChange();
    });
  }

  function handleDeletePanel() {
    if (!selectedPanelId) return;
    startTransition(async () => {
      setError(null);
      const result = await deleteComicPagePanelFromLayout(projectId, selectedPanelId);
      if (result.error) {
        setError(result.error);
        return;
      }
      setActiveTemplateId(null);
      onSelectPanel(null);
      onPanelsChange();
    });
  }

  function handleBorderStyleChange(style: PanelBorderStyle) {
    setPanelBorderStyle(style);
    startTransition(async () => {
      const result = await saveComicPagePanelBorderStyle(projectId, pageId, style);
      if (result.error) setError(result.error);
    });
  }

  useLayoutEditorKeyboard({
    containerRef: editorRef,
    onEscape: () => onSelectPanel(null),
    onDelete: handleDeletePanel,
  });

  const canvasItems = useMemo(
    () =>
      layoutPanels.map((panel, index) => ({
        id: panel.id,
        label: panel.name || `Panel ${index + 1}`,
        x: panel.x,
        y: panel.y,
        width: panel.width,
        height: panel.height,
        fill: "rgba(241, 245, 249, 0.65)",
      })),
    [layoutPanels]
  );

  return (
    <div ref={editorRef} className={`space-y-3 ${pending ? "opacity-80" : ""}`}>
      <div className="flex flex-wrap items-center gap-2">
        <label className="text-xs font-medium text-[var(--brand-text-secondary)]">
          Layout template
        </label>
        <select
          value={activeTemplateId ?? ""}
          onChange={(event) => {
            const value = event.target.value as PageLayoutTemplateId;
            if (value) applyTemplate(value);
          }}
          disabled={pending}
          className="production-editor-select"
        >
          <option value="" disabled>
            Choose a template…
          </option>
          {PAGE_LAYOUT_TEMPLATES.map((template) => (
            <option key={template.id} value={template.id}>
              {template.label}
            </option>
          ))}
        </select>
        <label className="text-xs font-medium text-[var(--brand-text-secondary)]">
          Panel borders
        </label>
        <select
          value={panelBorderStyle}
          onChange={(event) =>
            handleBorderStyleChange(event.target.value as PanelBorderStyle)
          }
          disabled={pending}
          className="production-editor-select"
        >
          {PANEL_BORDER_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <button
          type="button"
          onClick={handleAddPanel}
          disabled={pending}
          className="production-editor-btn"
        >
          Add panel
        </button>
        <button
          type="button"
          onClick={handleDeletePanel}
          disabled={pending || !selectedPanelId}
          className="production-editor-btn production-editor-btn-danger"
        >
          Delete selected
        </button>
        <span className="ml-auto text-xs text-[var(--brand-text-muted)]">
          {saveState === "saving" && "Saving…"}
          {saveState === "saved" && "Saved"}
          {saveState === "error" && "Save failed"}
        </span>
      </div>

      {error && (
        <p className="rounded-lg border border-[var(--status-danger-border)] bg-[var(--status-danger-bg)] px-3 py-2 text-sm text-[var(--status-danger-text)]">
          {error}
        </p>
      )}

      <LayoutCanvasStage
        width={COMIC_PAGE_WIDTH}
        height={COMIC_PAGE_HEIGHT}
        onBackgroundClick={() => onSelectPanel(null)}
      >
        <Rect
          x={0}
          y={0}
          width={COMIC_PAGE_WIDTH}
          height={COMIC_PAGE_HEIGHT}
          fill="#ffffff"
          stroke="#e2e8f0"
          strokeWidth={1}
          listening={false}
          perfectDrawEnabled={false}
        />
        {canvasItems.map((item) => (
          <LayoutRectShape
            key={item.id}
            item={item}
            borderStyle={panelBorderStyle}
            selected={selectedPanelId === item.id}
            onSelect={() => onSelectPanel(item.id)}
            onChange={(frame) => updatePanelFrame(item.id, frame)}
          />
        ))}
      </LayoutCanvasStage>

      {layoutPanels.length === 0 && (
        <div className="rounded-xl border border-dashed border-[var(--brand-border)] px-4 py-6 text-center">
          <p className="text-sm text-[var(--brand-text-muted)]">
            Choose a layout template or add panels to start designing this page.
          </p>
          <button
            type="button"
            onClick={handleAddPanel}
            disabled={pending}
            className={`mt-3 ${studioBtnPrimarySm}`}
          >
            Add first panel
          </button>
        </div>
      )}

      <p className="text-xs text-[var(--brand-text-muted)]">
        Drag panels to move them. Use handles to resize. Delete or Escape to deselect.
        Changes save automatically.
      </p>
    </div>
  );
}
