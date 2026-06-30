"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  getComicPagePanelSurfaces,
  savePanelSurfaceDocument,
  type PanelSurfaceEntry,
} from "@/app/actions/production/panel-content";
import {
  addTextObject,
  deleteTextObject,
  duplicateTextObject,
  getArtworkObject,
  getTextObjects,
  parsePanelDocument,
  reorderObject,
  scalePanelContent,
  updateArtworkTransform,
  updateTextObject,
  updateTextStyle,
  type ImageFitMode,
  type TextObjectKind,
  type ComicTextStyle,
} from "@/lib/canvas/panel-content";
import { useDebouncedCallback } from "@/lib/use-debounced-callback";
import type { CanvasDocumentV1 } from "@/types/canvas/document-v1";
import type { ComicPanel } from "@/types/production/comic";

export type PanelContentMap = Record<string, CanvasDocumentV1>;
export type PanelArtworkUrlMap = Record<string, string | null>;

export type PanelContentState = {
  panelDocuments: PanelContentMap;
  artworkUrls: PanelArtworkUrlMap;
  surfaceIds: Record<string, string>;
};

export function emptyPanelContentState(panels: ComicPanel[]): PanelContentState {
  const panelDocuments: PanelContentMap = {};
  for (const panel of panels) {
    panelDocuments[panel.id] = parsePanelDocument(null);
  }
  return { panelDocuments, artworkUrls: {}, surfaceIds: {} };
}

type UseComicPanelContentOptions = {
  projectId: string;
  panels: ComicPanel[];
  snapshot: PanelContentState;
  onSnapshotChange: (
    updater: (current: PanelContentState) => PanelContentState,
    options?: { recordHistory?: boolean; persist?: boolean }
  ) => void;
  onContentLoaded: (state: PanelContentState, options: { initial: boolean }) => void;
  onSaveStateChange?: (state: "idle" | "saving" | "saved" | "error") => void;
};

export function useComicPanelContent({
  projectId,
  panels,
  snapshot,
  onSnapshotChange,
  onContentLoaded,
  onSaveStateChange,
}: UseComicPanelContentOptions) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const surfaceIdsRef = useRef(snapshot.surfaceIds);
  surfaceIdsRef.current = snapshot.surfaceIds;
  const onContentLoadedRef = useRef(onContentLoaded);
  onContentLoadedRef.current = onContentLoaded;
  const loadedPanelIdsKeyRef = useRef<string | null>(null);

  const panelIdsKey = useMemo(() => panels.map((p) => p.id).join(","), [panels]);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      const isInitial = loadedPanelIdsKeyRef.current === null;
      const panelIds = panels.map((p) => p.id);
      if (panelIds.length === 0) {
        setLoading(false);
        return;
      }

      setLoading(true);
      const result = await getComicPagePanelSurfaces(projectId, panelIds);
      if (cancelled) return;

      if (result.error) {
        setError(result.error);
        setLoading(false);
        return;
      }

      const nextDocs: PanelContentMap = {};
      const nextUrls: PanelArtworkUrlMap = {};
      const nextSurfaceIds: Record<string, string> = {};

      for (const entry of result.entries) {
        nextDocs[entry.panelId] = entry.document;
        nextUrls[entry.panelId] = entry.artworkUrl;
        nextSurfaceIds[entry.panelId] = entry.surfaceId;
      }

      for (const panel of panels) {
        if (!nextDocs[panel.id]) {
          nextDocs[panel.id] = parsePanelDocument(null);
        }
      }

      loadedPanelIdsKeyRef.current = panelIdsKey;
      onContentLoadedRef.current(
        { panelDocuments: nextDocs, artworkUrls: nextUrls, surfaceIds: nextSurfaceIds },
        { initial: isInitial }
      );
      setError(null);
      setLoading(false);
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [projectId, panelIdsKey, panels]);

  const persistDocument = useDebouncedCallback(
    useCallback(
      async (panelId: string, document: CanvasDocumentV1) => {
        const surfaceId = surfaceIdsRef.current[panelId];
        if (!surfaceId) return;

        onSaveStateChange?.("saving");
        const result = await savePanelSurfaceDocument(projectId, surfaceId, document);
        if (result.error) {
          setError(result.error);
          onSaveStateChange?.("error");
          return;
        }
        setError(null);
        onSaveStateChange?.("saved");
      },
      [projectId, onSaveStateChange]
    ),
    600
  );

  const persistDocumentImmediate = useCallback(
    async (panelId: string, document: CanvasDocumentV1) => {
      const surfaceId = surfaceIdsRef.current[panelId];
      if (!surfaceId) return;

      onSaveStateChange?.("saving");
      const result = await savePanelSurfaceDocument(projectId, surfaceId, document);
      if (result.error) {
        setError(result.error);
        onSaveStateChange?.("error");
        return;
      }
      setError(null);
      onSaveStateChange?.("saved");
    },
    [projectId, onSaveStateChange]
  );

  const persistAllDocuments = useCallback(
    async (state: PanelContentState) => {
      onSaveStateChange?.("saving");
      let hadError = false;
      for (const panel of panels) {
        const surfaceId = state.surfaceIds[panel.id];
        const document = state.panelDocuments[panel.id];
        if (!surfaceId || !document) continue;
        const result = await savePanelSurfaceDocument(projectId, surfaceId, document);
        if (result.error) {
          hadError = true;
          setError(result.error);
        }
      }
      onSaveStateChange?.(hadError ? "error" : "saved");
    },
    [panels, projectId, onSaveStateChange]
  );

  function applyPanelEntry(entry: PanelSurfaceEntry) {
    onSnapshotChange(
      (current) => ({
        panelDocuments: { ...current.panelDocuments, [entry.panelId]: entry.document },
        artworkUrls: { ...current.artworkUrls, [entry.panelId]: entry.artworkUrl },
        surfaceIds: { ...current.surfaceIds, [entry.panelId]: entry.surfaceId },
      }),
      { recordHistory: true, persist: false }
    );
  }

  function updateDocument(
    panelId: string,
    updater: (doc: CanvasDocumentV1) => CanvasDocumentV1,
    options?: { recordHistory?: boolean; persist?: boolean }
  ) {
    const prev = snapshot.panelDocuments[panelId] ?? parsePanelDocument(null);
    const next = updater(prev);
    onSnapshotChange(
      (current) => ({
        ...current,
        panelDocuments: { ...current.panelDocuments, [panelId]: next },
      }),
      { recordHistory: options?.recordHistory ?? true, persist: options?.persist ?? true }
    );
    if (options?.persist !== false) {
      persistDocument(panelId, next);
    }
  }

  function syncArtworkEntry(
    panelId: string,
    entry: { document: CanvasDocumentV1; surfaceId: string; artworkUrl: string | null },
    options?: { skipPersist?: boolean }
  ) {
    onSnapshotChange(
      (current) => ({
        panelDocuments: { ...current.panelDocuments, [panelId]: entry.document },
        artworkUrls: { ...current.artworkUrls, [panelId]: entry.artworkUrl },
        surfaceIds: { ...current.surfaceIds, [panelId]: entry.surfaceId },
      }),
      { recordHistory: true, persist: false }
    );
    if (!options?.skipPersist) {
      void persistDocumentImmediate(panelId, entry.document);
    }
  }

  function clearArtwork(panelId: string, document: CanvasDocumentV1) {
    onSnapshotChange(
      (current) => ({
        ...current,
        panelDocuments: { ...current.panelDocuments, [panelId]: document },
        artworkUrls: { ...current.artworkUrls, [panelId]: null },
      }),
      { recordHistory: true, persist: false }
    );
    void persistDocumentImmediate(panelId, document);
  }

  function applyArtworkFit(panelId: string, fitMode: ImageFitMode) {
    updateDocument(panelId, (doc) =>
      updateArtworkTransform(doc, { image_fit: fitMode, offset_x: 0, offset_y: 0 })
    );
  }

  function centerArtwork(panelId: string) {
    updateDocument(panelId, (doc) => updateArtworkTransform(doc, { offset_x: 0, offset_y: 0 }));
  }

  function applyArtworkTransform(
    panelId: string,
    patch: {
      offset_x?: number;
      offset_y?: number;
      scale?: number;
      rotation?: number;
      opacity?: number;
    }
  ) {
    updateDocument(panelId, (doc) => updateArtworkTransform(doc, patch));
  }

  function addText(panelId: string, kind: TextObjectKind, panelWidth: number, panelHeight: number) {
    let newId: string | null = null;
    const prev = snapshot.panelDocuments[panelId] ?? parsePanelDocument(null);
    const result = addTextObject(prev, kind, panelWidth, panelHeight);
    newId = result.objectId;
    onSnapshotChange(
      (current) => ({
        ...current,
        panelDocuments: { ...current.panelDocuments, [panelId]: result.document },
      }),
      { recordHistory: true }
    );
    persistDocument(panelId, result.document);
    return newId;
  }

  function updateText(
    panelId: string,
    objectId: string,
    patch: Parameters<typeof updateTextObject>[2],
    panelSize?: { width: number; height: number }
  ) {
    updateDocument(panelId, (doc) => updateTextObject(doc, objectId, patch, panelSize));
  }

  function updateTextObjectStyle(panelId: string, objectId: string, patch: Partial<ComicTextStyle>) {
    updateDocument(panelId, (doc) => updateTextStyle(doc, objectId, patch));
  }

  function deleteText(panelId: string, objectId: string) {
    updateDocument(panelId, (doc) => deleteTextObject(doc, objectId));
  }

  function duplicateText(panelId: string, objectId: string) {
    let newId: string | null = null;
    const prev = snapshot.panelDocuments[panelId] ?? parsePanelDocument(null);
    const result = duplicateTextObject(prev, objectId);
    newId = result.newObjectId;
    onSnapshotChange(
      (current) => ({
        ...current,
        panelDocuments: { ...current.panelDocuments, [panelId]: result.document },
      }),
      { recordHistory: true }
    );
    persistDocument(panelId, result.document);
    return newId;
  }

  function reorderText(
    panelId: string,
    objectId: string,
    direction: "front" | "back" | "forward" | "backward"
  ) {
    updateDocument(panelId, (doc) => reorderObject(doc, objectId, direction));
  }

  function scaleContentForPanelResize(
    panelId: string,
    oldWidth: number,
    oldHeight: number,
    newWidth: number,
    newHeight: number
  ) {
    updateDocument(
      panelId,
      (doc) => scalePanelContent(doc, oldWidth, oldHeight, newWidth, newHeight),
      { recordHistory: false }
    );
  }

  function getPanelDocument(panelId: string): CanvasDocumentV1 {
    return snapshot.panelDocuments[panelId] ?? parsePanelDocument(null);
  }

  function getPanelTextObjects(panelId: string) {
    return getTextObjects(getPanelDocument(panelId));
  }

  function hasArtwork(panelId: string): boolean {
    return Boolean(getArtworkObject(getPanelDocument(panelId)));
  }

  return {
    loading,
    error,
    documents: snapshot.panelDocuments,
    artworkUrls: snapshot.artworkUrls,
    surfaceIds: snapshot.surfaceIds,
    applyPanelEntry,
    syncArtworkEntry,
    clearArtwork,
    applyArtworkFit,
    centerArtwork,
    applyArtworkTransform,
    addText,
    updateText,
    updateTextObjectStyle,
    deleteText,
    duplicateText,
    reorderText,
    scaleContentForPanelResize,
    getPanelDocument,
    getPanelTextObjects,
    hasArtwork,
    persistAllDocuments,
  };
}

export type ComicPanelContentApi = ReturnType<typeof useComicPanelContent>;
