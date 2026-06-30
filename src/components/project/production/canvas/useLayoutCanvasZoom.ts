"use client";

import { useCallback, useEffect, useState } from "react";
import { clampZoom, type CanvasZoomMode } from "@/lib/canvas/layout-canvas-zoom";

type StoredZoom = {
  zoomMode: CanvasZoomMode;
  customScale: number;
};

function readStoredZoom(storageKey: string): StoredZoom | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = sessionStorage.getItem(storageKey);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as StoredZoom;
    if (
      parsed.zoomMode !== "fit-page" &&
      parsed.zoomMode !== "fit-width" &&
      parsed.zoomMode !== "custom"
    ) {
      return null;
    }
    return {
      zoomMode: parsed.zoomMode,
      customScale: clampZoom(parsed.customScale ?? 1),
    };
  } catch {
    return null;
  }
}

export type LayoutCanvasZoomState = {
  zoomMode: CanvasZoomMode;
  customScale: number;
  hydrated: boolean;
  effectiveScale: number;
  setZoomMode: (mode: CanvasZoomMode) => void;
  setCustomZoom: (scale: number) => void;
  zoomIn: () => void;
  zoomOut: () => void;
  setEffectiveScaleRef: (scale: number) => void;
};

export function useLayoutCanvasZoom(
  storageKey: string,
  fitPageScale: number,
  fitWidthScale: number,
  options?: { alwaysStartFitPage?: boolean }
): LayoutCanvasZoomState {
  const alwaysStartFitPage = options?.alwaysStartFitPage ?? false;
  const [zoomMode, setZoomModeState] = useState<CanvasZoomMode>("fit-page");
  const [customScale, setCustomScaleState] = useState(1);
  const [hydrated, setHydrated] = useState(false);
  const [reportedFitPage, setReportedFitPage] = useState(fitPageScale);

  useEffect(() => {
    if (alwaysStartFitPage) {
      setZoomModeState("fit-page");
      setCustomScaleState(1);
      setHydrated(true);
      return;
    }
    const stored = readStoredZoom(storageKey);
    if (stored) {
      setZoomModeState(stored.zoomMode);
      setCustomScaleState(stored.customScale);
    }
    setHydrated(true);
  }, [alwaysStartFitPage, storageKey]);

  useEffect(() => {
    if (!hydrated || alwaysStartFitPage) return;
    const payload: StoredZoom = { zoomMode, customScale };
    sessionStorage.setItem(storageKey, JSON.stringify(payload));
  }, [alwaysStartFitPage, customScale, hydrated, storageKey, zoomMode]);

  const effectiveScale = !hydrated
    ? fitPageScale
    : zoomMode === "fit-page"
      ? reportedFitPage
      : zoomMode === "fit-width"
        ? fitWidthScale
        : customScale;

  const setZoomMode = useCallback((mode: CanvasZoomMode) => {
    setZoomModeState(mode);
  }, []);

  const setCustomZoom = useCallback((scale: number) => {
    setZoomModeState("custom");
    setCustomScaleState(clampZoom(scale));
  }, []);

  const zoomIn = useCallback(() => {
    const base =
      zoomMode === "custom"
        ? customScale
        : zoomMode === "fit-width"
          ? fitWidthScale
          : reportedFitPage;
    setCustomZoom(base + 0.1);
  }, [customScale, fitWidthScale, reportedFitPage, setCustomZoom, zoomMode]);

  const zoomOut = useCallback(() => {
    const base =
      zoomMode === "custom"
        ? customScale
        : zoomMode === "fit-width"
          ? fitWidthScale
          : reportedFitPage;
    setCustomZoom(base - 0.1);
  }, [customScale, fitWidthScale, reportedFitPage, setCustomZoom, zoomMode]);

  const setEffectiveScaleRef = useCallback((scale: number) => {
    setReportedFitPage((previous) => {
      if (Math.abs(previous - scale) < 0.001) return previous;
      return scale;
    });
  }, []);

  return {
    zoomMode,
    customScale,
    hydrated,
    effectiveScale,
    setZoomMode,
    setCustomZoom,
    zoomIn,
    zoomOut,
    setEffectiveScaleRef,
  };
}
