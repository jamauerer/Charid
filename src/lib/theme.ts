/** Visual Identity Phase 3 — theme preference (client-safe). */

export const THEME_STORAGE_KEY = "charid-theme";

export type ThemeId = "sunset-light" | "sunset-dark";

export const THEMES: {
  id: ThemeId;
  label: string;
  description: string;
}[] = [
  {
    id: "sunset-light",
    label: "Light",
    description: "Neutral light — content forward",
  },
  {
    id: "sunset-dark",
    label: "Dark",
    description: "Neutral dark — content forward",
  },
];

export function isThemeId(value: string | null | undefined): value is ThemeId {
  return value === "sunset-light" || value === "sunset-dark";
}

/** Resolve theme from saved preference; defaults to light-first product. */
export function resolveTheme(
  saved: string | null,
  _prefersDark: boolean
): ThemeId {
  if (isThemeId(saved)) return saved;
  return "sunset-light";
}

export function getStoredTheme(): ThemeId | null {
  if (typeof window === "undefined") return null;
  const saved = localStorage.getItem(THEME_STORAGE_KEY);
  return isThemeId(saved) ? saved : null;
}

export function applyTheme(theme: ThemeId): void {
  if (typeof document === "undefined") return;
  document.documentElement.setAttribute("data-theme", theme);
}

export function persistTheme(theme: ThemeId): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(THEME_STORAGE_KEY, theme);
  applyTheme(theme);
}

/** Inline script — runs before paint to avoid theme flash. */
export const THEME_INIT_SCRIPT = `(function(){try{var k=${JSON.stringify(THEME_STORAGE_KEY)};var s=localStorage.getItem(k);var t=(s==="sunset-light"||s==="sunset-dark")?s:"sunset-light";document.documentElement.setAttribute("data-theme",t);}catch(e){document.documentElement.setAttribute("data-theme","sunset-light");}})();`;
