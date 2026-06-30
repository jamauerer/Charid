export const PAGE_VIEW_MODES = ["single", "spread"] as const;

export type PageViewMode = (typeof PAGE_VIEW_MODES)[number];

export const DEFAULT_PAGE_VIEW_MODE: PageViewMode = "single";

export type PageViewModeConfig = {
  mode: PageViewMode;
  /** When mode is spread, the paired page id (future). */
  pairedPageId?: string | null;
};

export function parsePageViewMode(value: unknown): PageViewMode {
  if (value === "spread" || value === "single") return value;
  if (value === "facing") return "single";
  return DEFAULT_PAGE_VIEW_MODE;
}

export function pageViewModeLabel(mode: PageViewMode): string {
  switch (mode) {
    case "single":
      return "Single page";
    case "spread":
      return "Spread";
  }
}

export function pageViewModeDescription(mode: PageViewMode): string {
  switch (mode) {
    case "single":
      return "Edit one page at a time.";
    case "spread":
      return "View two consecutive pages side by side.";
  }
}
