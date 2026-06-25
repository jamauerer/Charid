"use client";

import { useCallback, useEffect, useMemo, useRef, useState, useTransition } from "react";
import {
  addComicPagePanel,
  applyComicPageTemplate,
  deleteComicPagePanelFromLayout,
  saveComicPageLayout,
  saveComicPagePanelBorderStyle,
} from "@/app/actions/production/page-layout";
import type { PanelBorderStyle } from "@/lib/canvas/page-layout-surface";
import {
  normalizePanelFrames,
  type PageLayoutTemplateId,
  type PanelFrameRect,
} from "@/lib/canvas/page-layout-templates";
import { useDebouncedCallback } from "@/lib/use-debounced-callback";
import { useLayoutEditorKeyboard } from "@/components/project/production/canvas/useLayoutEditorKeyboard";
import type { ComicPanel } from "@/types/production/comic";

export type PanelLayoutState = PanelFrameRect & {
  id: string;
  name: string;
};

export type ComicPageSaveState = "idle" | "saving" | "saved" | "error";

function panelsToLayoutState(panels: ComicPanel[]): PanelLayoutState[] {
  const frames = normalizePanelFrames(panels);
  return panels.map((panel, index) => ({
    id: panel.id,
    name: panel.name,
    ...frames[index],
  }));
}

type UseComicPageLayoutOptions = {
  projectId: string;
  pageId: string;
  panels: ComicPanel[];
  templateId: PageLayoutTemplateId | null;
  panelBorderStyle: PanelBorderStyle;
  selectedPanelId: string | null;
  onSelectPanel: (panelId: string | null) => void;
  onPanelsChange: () => void;
};

export function useComicPageLayout({
  projectId,
  pageId,
  panels,
  templateId,
  panelBorderStyle: initialBorderStyle,
  selectedPanelId,
  onSelectPanel,
  onPanelsChange,
}: UseComicPageLayoutOptions) {
  const editorRef = useRef<HTMLDivElement>(null);
  const [layoutPanels, setLayoutPanels] = useState<PanelLayoutState[]>(() =>
    panelsToLayoutState(panels)
  );
  const [activeTemplateId, setActiveTemplateId] = useState<PageLayoutTemplateId | null>(
    templateId
  );
  const [panelBorderStyle, setPanelBorderStyle] =
    useState<PanelBorderStyle>(initialBorderStyle);
  const [saveState, setSaveState] = useState<ComicPageSaveState>("idle");
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

  return {
    editorRef,
    layoutPanels,
    activeTemplateId,
    panelBorderStyle,
    saveState,
    error,
    pending,
    canvasItems,
    applyTemplate,
    handleAddPanel,
    handleDeletePanel,
    handleBorderStyleChange,
    updatePanelFrame,
  };
}
