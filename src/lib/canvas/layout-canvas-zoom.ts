export const CANVAS_WORKSPACE_PADDING = 32;
export const CANVAS_STUDIO_PADDING = 12;
export const CANVAS_MAX_VIEWPORT_HEIGHT_RATIO = 0.58;
export const CANVAS_MAX_VIEWPORT_HEIGHT_PX = 720;
export const CANVAS_MIN_ZOOM = 0.1;
export const CANVAS_MAX_ZOOM = 3;
export const CANVAS_ZOOM_STEP = 0.1;
export const CANVAS_WHEEL_ZOOM_STEP = 0.08;
/** Target fraction of viewport height the page should occupy in studio fit mode. */
export const STUDIO_HEIGHT_FILL_RATIO = 0.76;
/** Collapsed Story Reference strip height reserved in studio viewport math. */
export const STUDIO_STORY_REFERENCE_COLLAPSED_PX = 36;

export const CANVAS_ZOOM_PRESETS = [0.5, 0.75, 1, 1.5, 2] as const;

export type CanvasZoomMode = "fit-page" | "fit-width" | "custom";

export function clampZoom(scale: number): number {
  return Math.min(CANVAS_MAX_ZOOM, Math.max(CANVAS_MIN_ZOOM, scale));
}

export function computeFitPageScale(
  containerWidth: number,
  containerHeight: number,
  documentWidth: number,
  documentHeight: number,
  padding = CANVAS_WORKSPACE_PADDING
): number {
  if (containerWidth < 200 || containerHeight < 200) return 1;
  const scaleX = (containerWidth - padding * 2) / documentWidth;
  const scaleY = (containerHeight - padding * 2) / documentHeight;
  const raw = Math.min(scaleX, scaleY);
  if (raw < 0.15) return 1;
  return clampZoom(raw);
}

/** Studio fit: entire page visible in viewport (same as fit-page). */
export function computeStudioFitPageScale(
  containerWidth: number,
  containerHeight: number,
  documentWidth: number,
  documentHeight: number,
  padding = CANVAS_STUDIO_PADDING
): number {
  if (containerWidth < 200 || containerHeight < 200) return 1;
  return computeFitPageScale(
    containerWidth,
    containerHeight,
    documentWidth,
    documentHeight,
    padding
  );
}

export function computeFitWidthScale(
  containerWidth: number,
  documentWidth: number,
  padding = CANVAS_WORKSPACE_PADDING
): number {
  if (containerWidth <= 0) return 1;
  return clampZoom((containerWidth - padding * 2) / documentWidth);
}

export function formatZoomLabel(scale: number): string {
  return `${Math.round(scale * 100)}%`;
}

export function maxViewportHeight(windowHeight: number): number {
  return Math.min(
    windowHeight * CANVAS_MAX_VIEWPORT_HEIGHT_RATIO,
    CANVAS_MAX_VIEWPORT_HEIGHT_PX
  );
}
