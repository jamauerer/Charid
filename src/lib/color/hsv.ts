export type Rgb = { r: number; g: number; b: number };
export type Hsv = { h: number; s: number; v: number };

export function clamp(n: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, n));
}

export function hexToRgb(hex: string): Rgb | null {
  const normalized = hex.replace("#", "").trim();
  if (normalized.length === 3) {
    const r = parseInt(normalized[0] + normalized[0], 16);
    const g = parseInt(normalized[1] + normalized[1], 16);
    const b = parseInt(normalized[2] + normalized[2], 16);
    return { r, g, b };
  }
  if (normalized.length === 6) {
    const r = parseInt(normalized.slice(0, 2), 16);
    const g = parseInt(normalized.slice(2, 4), 16);
    const b = parseInt(normalized.slice(4, 6), 16);
    if ([r, g, b].some((v) => Number.isNaN(v))) return null;
    return { r, g, b };
  }
  return null;
}

export function rgbToHex({ r, g, b }: Rgb): string {
  const toHex = (n: number) => clamp(Math.round(n), 0, 255).toString(16).padStart(2, "0");
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

export function rgbToHsv({ r, g, b }: Rgb): Hsv {
  const rn = r / 255;
  const gn = g / 255;
  const bn = b / 255;
  const max = Math.max(rn, gn, bn);
  const min = Math.min(rn, gn, bn);
  const d = max - min;
  let h = 0;
  if (d !== 0) {
    if (max === rn) h = ((gn - bn) / d) % 6;
    else if (max === gn) h = (bn - rn) / d + 2;
    else h = (rn - gn) / d + 4;
    h *= 60;
    if (h < 0) h += 360;
  }
  const s = max === 0 ? 0 : d / max;
  return { h, s: s * 100, v: max * 100 };
}

export function hsvToRgb({ h, s, v }: Hsv): Rgb {
  const sn = clamp(s, 0, 100) / 100;
  const vn = clamp(v, 0, 100) / 100;
  const c = vn * sn;
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
  const m = vn - c;
  let rn = 0;
  let gn = 0;
  let bn = 0;
  if (h < 60) [rn, gn, bn] = [c, x, 0];
  else if (h < 120) [rn, gn, bn] = [x, c, 0];
  else if (h < 180) [rn, gn, bn] = [0, c, x];
  else if (h < 240) [rn, gn, bn] = [0, x, c];
  else if (h < 300) [rn, gn, bn] = [x, 0, c];
  else [rn, gn, bn] = [c, 0, x];
  return {
    r: (rn + m) * 255,
    g: (gn + m) * 255,
    b: (bn + m) * 255,
  };
}

export function parseColorInput(value: string): { hex: string; rgb: Rgb; hsv: Hsv } | null {
  const rgb = hexToRgb(value);
  if (!rgb) return null;
  const hex = rgbToHex(rgb);
  return { hex, rgb, hsv: rgbToHsv(rgb) };
}

export const DEFAULT_SAVED_PALETTE = [
  "#ffffff",
  "#0f172a",
  "#1e293b",
  "#6366f1",
  "#ec4899",
  "#f59e0b",
  "#22c55e",
  "#3b82f6",
  "#dc2626",
  "#fef3c7",
  "#f8fafc",
  "#000000",
];

const RECENT_KEY = "charid-recent-colors";
const PALETTE_KEY = "charid-saved-palette";

export function loadRecentColors(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(RECENT_KEY);
    return raw ? (JSON.parse(raw) as string[]) : [];
  } catch {
    return [];
  }
}

export function saveRecentColor(color: string) {
  const recent = [color, ...loadRecentColors().filter((c) => c !== color)].slice(0, 10);
  localStorage.setItem(RECENT_KEY, JSON.stringify(recent));
}

export function loadSavedPalette(): string[] {
  if (typeof window === "undefined") return DEFAULT_SAVED_PALETTE;
  try {
    const raw = localStorage.getItem(PALETTE_KEY);
    return raw ? (JSON.parse(raw) as string[]) : DEFAULT_SAVED_PALETTE;
  } catch {
    return DEFAULT_SAVED_PALETTE;
  }
}

export function saveToPalette(color: string) {
  const palette = [color, ...loadSavedPalette().filter((c) => c !== color)].slice(0, 12);
  localStorage.setItem(PALETTE_KEY, JSON.stringify(palette));
}
