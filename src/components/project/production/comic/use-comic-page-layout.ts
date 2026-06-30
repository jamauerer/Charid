"use client";

import { useCallback, useEffect, useMemo, useRef, useState, useTransition } from "react";
import {
  addComicPagePanel,
  applyComicPageTemplate,
  deleteComicPagePanelFromLayout,
  saveComicPageLayout,
  saveComicPagePanelBorderStyle,
  saveComicPagePanelResizeMode,
} from "@/app/actions/production/page-layout";
import {
  duplicateComicPagePanelWithContent,
  removePanelArtwork,
} from "@/app/actions/production/panel-content";
import { useLayoutEditorKeyboard } from "@/components/project/production/canvas/useLayoutEditorKeyboard";
import {
  emptyPanelContentState,
  useComicPanelContent,
  type PanelContentState,
} from "@/components/project/production/comic/use-comic-panel-content";
import { useEditorHistory } from "@/hooks/use-editor-history";
import type { PanelBorderStyle } from "@/lib/canvas/page-layout-surface";
import {
  COMIC_PAGE_HEIGHT,
  COMIC_PAGE_WIDTH,
  normalizePanelFrames,
  type PageLayoutTemplateId,
  type PanelFrameRect,
} from "@/lib/canvas/page-layout-templates";
import {
  alignPanels,
  applyLinkedPanelResize,
  distributePanels,
  snapPanelFrame,
  type PanelResizeMode,
} from "@/lib/canvas/panel-resize-mode";
import { useDebouncedCallback } from "@/lib/use-debounced-callback";
import type { TextObjectKind } from "@/lib/canvas/panel-content";
import { getArtworkObject, getTextObjects, parsePanelDocument } from "@/lib/canvas/panel-content";
import type { ComicPanel } from "@/types/production/comic";

export type PanelLayoutState = PanelFrameRect & {
  id: string;
  name: string;
};

export type ComicPageSaveState = "idle" | "saving" | "saved" | "error";

export type ComicEditorSnapshot = {
  layoutPanels: PanelLayoutState[];
  activeTemplateId: PageLayoutTemplateId | null;
  panelDocuments: PanelContentState["panelDocuments"];
  artworkUrls: PanelContentState["artworkUrls"];
  surfaceIds: PanelContentState["surfaceIds"];
};

function panelsToLayoutState(panels: ComicPanel[]): PanelLayoutState[] {
  const frames = normalizePanelFrames(panels);
  return panels.map((panel, index) => ({
    id: panel.id,
    name: panel.name,
    ...frames[index],
  }));
}

function buildInitialSnapshot(
  panels: ComicPanel[],
  templateId: PageLayoutTemplateId | null
): ComicEditorSnapshot {
  const content = emptyPanelContentState(panels);
  return {
    layoutPanels: panelsToLayoutState(panels),
    activeTemplateId: templateId,
    ...content,
  };
}

type UseComicPageLayoutOptions = {
  projectId: string;
  pageId: string;
  panels: ComicPanel[];
  templateId: PageLayoutTemplateId | null;
  panelBorderStyle: PanelBorderStyle;
  panelResizeMode: PanelResizeMode;
  selectedPanelIds: string[];
  selectedObjectId: string | null;
  onSelectPanels: (panelIds: string[]) => void;
  onSelectObject: (objectId: string | null) => void;
  onPanelsChange: () => void;
};

export function useComicPageLayout({
  projectId,
  pageId,
  panels,
  templateId,
  panelBorderStyle: initialBorderStyle,
  panelResizeMode: initialResizeMode,
  selectedPanelIds,
  selectedObjectId,
  onSelectPanels,
  onSelectObject,
  onPanelsChange,
}: UseComicPageLayoutOptions) {
  const editorRef = useRef<HTMLDivElement>(null);
  const selectedPanelId = selectedPanelIds[0] ?? null;
  const hydratedRef = useRef(false);

  const initialSnapshot = useMemo(
    () => buildInitialSnapshot(panels, templateId),
    [] // eslint-disable-line react-hooks/exhaustive-deps
  );

  const history = useEditorHistory<ComicEditorSnapshot>(initialSnapshot);
  const present = history.present;
  const layoutPanels = present.layoutPanels;
  const activeTemplateId = present.activeTemplateId;

  const [panelBorderStyle, setPanelBorderStyle] =
    useState<PanelBorderStyle>(initialBorderStyle);
  const [panelResizeMode, setPanelResizeMode] =
    useState<PanelResizeMode>(initialResizeMode);
  const [layoutSaveState, setLayoutSaveState] = useState<ComicPageSaveState>("idle");
  const [contentSaveState, setContentSaveState] = useState<ComicPageSaveState>("idle");
  const [error, setError] = useState<string | null>(null);
  const [layoutPending, startLayoutTransition] = useTransition();
  const [snapGuides, setSnapGuides] = useState<{ x: number[]; y: number[] }>({ x: [], y: [] });

  const contentSnapshot: PanelContentState = useMemo(
    () => ({
      panelDocuments: present.panelDocuments,
      artworkUrls: present.artworkUrls,
      surfaceIds: present.surfaceIds,
    }),
    [present.panelDocuments, present.artworkUrls, present.surfaceIds]
  );

  const commitSnapshot = useCallback(
    (
      updater: (current: ComicEditorSnapshot) => ComicEditorSnapshot,
      options?: { recordHistory?: boolean }
    ) => {
      const current = history.present;
      const next = updater(current);
      if (options?.recordHistory === false) {
        history.setPresent(next);
      } else {
        history.record(next);
      }
    },
    [history]
  );

  const onContentLoaded = useCallback(
    (state: PanelContentState, options: { initial: boolean }) => {
      if (options.initial) {
        hydratedRef.current = true;
        history.reset({
          layoutPanels: panelsToLayoutState(panels),
          activeTemplateId: templateId,
          ...state,
        });
        return;
      }

      commitSnapshot(
        (current) => ({
          ...current,
          layoutPanels: panelsToLayoutState(panels),
          activeTemplateId: templateId,
          panelDocuments: { ...current.panelDocuments, ...state.panelDocuments },
          artworkUrls: { ...current.artworkUrls, ...state.artworkUrls },
          surfaceIds: { ...current.surfaceIds, ...state.surfaceIds },
        }),
        { recordHistory: false }
      );
    },
    [commitSnapshot, history, panels, templateId]
  );

  const onSnapshotChange = useCallback(
    (
      updater: (current: PanelContentState) => PanelContentState,
      options?: { recordHistory?: boolean; persist?: boolean }
    ) => {
      commitSnapshot(
        (current) => {
          const nextContent = updater({
            panelDocuments: current.panelDocuments,
            artworkUrls: current.artworkUrls,
            surfaceIds: current.surfaceIds,
          });
          return { ...current, ...nextContent };
        },
        { recordHistory: options?.recordHistory ?? true }
      );
    },
    [commitSnapshot]
  );

  const panelContent = useComicPanelContent({
    projectId,
    panels,
    snapshot: contentSnapshot,
    onSnapshotChange,
    onContentLoaded,
    onSaveStateChange: setContentSaveState,
  });

  useEffect(() => {
    if (!hydratedRef.current) return;
    const nextLayout = panelsToLayoutState(panels);
    history.setPresent({
      ...history.present,
      layoutPanels: nextLayout,
      activeTemplateId: templateId,
    });
  }, [panels, templateId]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    setPanelBorderStyle(initialBorderStyle);
  }, [initialBorderStyle]);

  useEffect(() => {
    setPanelResizeMode(initialResizeMode);
  }, [initialResizeMode]);

  const saveState: ComicPageSaveState =
    layoutSaveState === "saving" || contentSaveState === "saving"
      ? "saving"
      : layoutSaveState === "error" || contentSaveState === "error"
        ? "error"
        : layoutSaveState === "saved" || contentSaveState === "saved"
          ? "saved"
          : "idle";

  const persistLayout = useDebouncedCallback(
    useCallback(
      async (nextPanels: PanelLayoutState[], nextTemplateId: PageLayoutTemplateId | null) => {
        setLayoutSaveState("saving");
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
          setLayoutSaveState("error");
          setError(result.error);
          return;
        }
        setLayoutSaveState("saved");
        setError(null);
      },
      [projectId, pageId]
    ),
    600
  );

  const persistLayoutImmediate = useCallback(
    async (nextPanels: PanelLayoutState[], nextTemplateId: PageLayoutTemplateId | null) => {
      setLayoutSaveState("saving");
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
        setLayoutSaveState("error");
        setError(result.error);
        return;
      }
      setLayoutSaveState("saved");
      setError(null);
    },
    [projectId, pageId]
  );

  function commitLayout(nextPanels: PanelLayoutState[], nextTemplateId: PageLayoutTemplateId | null) {
    commitSnapshot((current) => ({
      ...current,
      layoutPanels: nextPanels,
      activeTemplateId: nextTemplateId,
    }));
    persistLayout(nextPanels, nextTemplateId);
  }

  function persistSnapshot(snapshot: ComicEditorSnapshot) {
    void persistLayoutImmediate(snapshot.layoutPanels, snapshot.activeTemplateId);
    void panelContent.persistAllDocuments({
      panelDocuments: snapshot.panelDocuments,
      artworkUrls: snapshot.artworkUrls,
      surfaceIds: snapshot.surfaceIds,
    });
  }

  function handleUndo() {
    const restored = history.undo();
    if (restored) persistSnapshot(restored);
  }

  function handleRedo() {
    const restored = history.redo();
    if (restored) persistSnapshot(restored);
  }

  function updatePanelFrame(panelId: string, frame: PanelFrameRect) {
    const prevPanel = layoutPanels.find((p) => p.id === panelId);
    if (!prevPanel) return;

    let nextPanels = layoutPanels.map((panel) =>
      panel.id === panelId ? { ...panel, ...frame } : panel
    );

    if (panelResizeMode === "linked") {
      nextPanels = applyLinkedPanelResize(
        nextPanels,
        panelId,
        frame,
        prevPanel
      ) as PanelLayoutState[];
    } else if (panelResizeMode === "independent") {
      const others = layoutPanels.filter((p) => p.id !== panelId);
      const snapped = snapPanelFrame(frame, others, COMIC_PAGE_WIDTH, COMIC_PAGE_HEIGHT);
      if (snapped.snapGuides) {
        setSnapGuides(snapped.snapGuides);
      } else {
        setSnapGuides({ x: [], y: [] });
      }
      const { snapGuides: _guides, ...frameOnly } = snapped;
      nextPanels = layoutPanels.map((panel) =>
        panel.id === panelId ? { ...panel, ...frameOnly } : panel
      );
    }

    const committed = nextPanels.find((p) => p.id === panelId) ?? { ...prevPanel, ...frame };
    if (prevPanel.width !== committed.width || prevPanel.height !== committed.height) {
      panelContent.scaleContentForPanelResize(
        panelId,
        prevPanel.width,
        prevPanel.height,
        committed.width,
        committed.height
      );
    }

    commitLayout(nextPanels, null);
  }

  function clearSnapGuides() {
    setSnapGuides({ x: [], y: [] });
  }

  function applyTemplate(nextTemplateId: PageLayoutTemplateId) {
    startLayoutTransition(async () => {
      setError(null);
      const result = await applyComicPageTemplate(projectId, pageId, nextTemplateId);
      if (result.error) {
        setError(result.error);
        return;
      }
      onSelectPanels(result.panels[0]?.id ? [result.panels[0].id] : []);
      onPanelsChange();
    });
  }

  function handleAddPanel() {
    startLayoutTransition(async () => {
      setError(null);
      const result = await addComicPagePanel(projectId, pageId);
      if (result.error || !result.panel) {
        setError(result.error ?? "Failed to add panel.");
        return;
      }
      onSelectPanels([result.panel.id]);
      onPanelsChange();
    });
  }

  function handleDeletePanel() {
    if (!selectedPanelId) return;
    startLayoutTransition(async () => {
      setError(null);
      const result = await deleteComicPagePanelFromLayout(projectId, selectedPanelId);
      if (result.error) {
        setError(result.error);
        return;
      }
      onSelectPanels([]);
      onSelectObject(null);
      onPanelsChange();
    });
  }

  async function handleDeleteArtwork() {
    if (!selectedPanelId) return;
    const result = await removePanelArtwork(projectId, selectedPanelId);
    if (result.error) {
      setError(result.error);
      return;
    }
    if (result.document) {
      panelContent.clearArtwork(selectedPanelId, result.document);
    }
    onSelectObject(null);
  }

  function handleDeleteSelection() {
    if (selectedObjectId === "artwork" && selectedPanelId) {
      void handleDeleteArtwork();
      return;
    }
    if (selectedObjectId && selectedObjectId !== "artwork" && selectedPanelId) {
      panelContent.deleteText(selectedPanelId, selectedObjectId);
      onSelectObject(null);
      return;
    }
    if (selectedPanelId && !selectedObjectId) {
      handleDeletePanel();
    }
  }

  function handleBorderStyleChange(style: PanelBorderStyle) {
    setPanelBorderStyle(style);
    startLayoutTransition(async () => {
      const result = await saveComicPagePanelBorderStyle(projectId, pageId, style);
      if (result.error) setError(result.error);
    });
  }

  function handleResizeModeChange(mode: PanelResizeMode) {
    setPanelResizeMode(mode);
    startLayoutTransition(async () => {
      const result = await saveComicPagePanelResizeMode(projectId, pageId, mode);
      if (result.error) setError(result.error);
    });
  }

  function handleAlign(alignment: Parameters<typeof alignPanels>[2]) {
    if (selectedPanelIds.length < 2) return;
    const next = alignPanels(layoutPanels, selectedPanelIds, alignment) as PanelLayoutState[];
    commitLayout(next, activeTemplateId);
  }

  function handleDistribute(axis: "horizontal" | "vertical") {
    if (selectedPanelIds.length < 3) return;
    const next = distributePanels(layoutPanels, selectedPanelIds, axis) as PanelLayoutState[];
    commitLayout(next, activeTemplateId);
  }

  function handleDuplicatePanel() {
    if (!selectedPanelId) return;
    startLayoutTransition(async () => {
      const source = layoutPanels.find((p) => p.id === selectedPanelId);
      if (!source) return;
      const result = await duplicateComicPagePanelWithContent(projectId, pageId, selectedPanelId, {
        x: source.x + 24,
        y: source.y + 24,
        width: source.width,
        height: source.height,
      });
      if (result.error || !result.panelId) {
        setError(result.error ?? "Failed to duplicate panel.");
        return;
      }
      if (result.entry) {
        panelContent.applyPanelEntry(result.entry);
      }
      onSelectPanels([result.panelId]);
      onPanelsChange();
    });
  }

  function addTextObject(kind: TextObjectKind) {
    if (!selectedPanelId) return null;
    const panel = layoutPanels.find((p) => p.id === selectedPanelId);
    if (!panel) return null;
    const objectId = panelContent.addText(selectedPanelId, kind, panel.width, panel.height);
    if (objectId) onSelectObject(objectId);
    return objectId;
  }

  useLayoutEditorKeyboard({
    containerRef: editorRef,
    onEscape: () => {
      onSelectObject(null);
      onSelectPanels([]);
      clearSnapGuides();
    },
    onDelete: handleDeleteSelection,
    onUndo: handleUndo,
    onRedo: handleRedo,
    onDuplicate: selectedObjectId ? undefined : handleDuplicatePanel,
  });

  const panelDocuments = present.panelDocuments;

  const canvasItems = useMemo(
    () =>
      layoutPanels.map((panel, index) => ({
        id: panel.id,
        label: panel.name || `Panel ${index + 1}`,
        x: panel.x,
        y: panel.y,
        width: panel.width,
        height: panel.height,
        fill: getArtworkObject(panelDocuments[panel.id] ?? parsePanelDocument(null))
          ? "rgba(255, 255, 255, 0.95)"
          : "rgba(241, 245, 249, 0.65)",
      })),
    [layoutPanels, panelDocuments]
  );

  const panelContents = useMemo(() => {
    const map: Record<
      string,
      { document: (typeof panelDocuments)[string]; artworkUrl: string | null }
    > = {};
    for (const panel of layoutPanels) {
      map[panel.id] = {
        document: panelDocuments[panel.id] ?? parsePanelDocument(null),
        artworkUrl: present.artworkUrls[panel.id] ?? null,
      };
    }
    return map;
  }, [layoutPanels, panelDocuments, present.artworkUrls]);

  const pageHasContent = useMemo(() => {
    for (const panel of layoutPanels) {
      const doc = panelDocuments[panel.id] ?? parsePanelDocument(null);
      if (getArtworkObject(doc)) return true;
      if (getTextObjects(doc).length > 0) return true;
    }
    return false;
  }, [layoutPanels, panelDocuments]);

  return {
    editorRef,
    layoutPanels,
    activeTemplateId,
    panelBorderStyle,
    panelResizeMode,
    saveState,
    error,
    layoutPending,
    snapGuides,
    canvasItems,
    panelContents,
    pageHasContent,
    panelContent,
    history,
    clearSnapGuides,
    applyTemplate,
    handleAddPanel,
    handleDeletePanel,
    handleDeleteArtwork,
    handleDeleteSelection,
    handleBorderStyleChange,
    handleResizeModeChange,
    handleAlign,
    handleDistribute,
    handleDuplicatePanel,
    updatePanelFrame,
    addTextObject,
    handleUndo,
    handleRedo,
  };
}
