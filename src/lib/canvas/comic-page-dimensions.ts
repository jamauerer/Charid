/**
 * North American comic page dimensions — display + print architecture.
 * Display coordinates use a scaled workspace; print targets 600 DPI.
 */

/** Trim size in inches (North American comic). */
export const COMIC_TRIM_WIDTH_IN = 6.625;
export const COMIC_TRIM_HEIGHT_IN = 10.25;

export const COMIC_PAGE_ASPECT_RATIO = COMIC_TRIM_WIDTH_IN / COMIC_TRIM_HEIGHT_IN;

/** Print resolution at 600 DPI. */
export const COMIC_PAGE_PRINT_WIDTH_PX = 3975;
export const COMIC_PAGE_PRINT_HEIGHT_PX = 6150;
export const COMIC_PAGE_PRINT_DPI = 600;

/** Editor workspace size — same aspect ratio as trim. */
export const COMIC_PAGE_WIDTH = 1325;
export const COMIC_PAGE_HEIGHT = Math.round(COMIC_PAGE_WIDTH / COMIC_PAGE_ASPECT_RATIO);

/** SVG preview viewBox width (height derived from aspect). */
export const COMIC_PREVIEW_VIEWBOX_WIDTH = 66.25;
export const COMIC_PREVIEW_VIEWBOX_HEIGHT = 102.5;

export function comicPreviewScale(pageWidth = COMIC_PAGE_WIDTH, pageHeight = COMIC_PAGE_HEIGHT) {
  return {
    scaleX: COMIC_PREVIEW_VIEWBOX_WIDTH / pageWidth,
    scaleY: COMIC_PREVIEW_VIEWBOX_HEIGHT / pageHeight,
  };
}
