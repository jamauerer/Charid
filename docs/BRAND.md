# CharID Brand Identity

CharID is a character identity platform — profiles, archives, portfolios, and worldbuilding. The brand should feel like a **character passport** or **creative dossier**, not corporate SaaS, AI tooling, or medical/HR software.

## Logo concept

The mark combines two ideas:

1. **Dossier card** — rounded rectangle with an index tab, like a character file pulled from an archive.
2. **Profile silhouette** — minimal side-view portrait of a capable female hero: practical, adventurous, grounded. Not glamorous, anime, or sexualized.

Together they read as **character identity on file** — unique to CharID.

## Logo files

| File | Use |
|------|-----|
| `public/brand/logo-mark.svg` | Icon only — sidebar, app icon, favicon source |
| `public/brand/logo.svg` | Mark + wordmark — marketing, auth pages |
| `public/brand/favicon.svg` | Optimized for 16×16–32×32 (thicker strokes) |
| `public/favicon.ico` | Legacy browser tab icon |
| `src/app/icon.svg` | Next.js app icon |
| `src/app/apple-icon.svg` | Apple touch icon |

## Color system

| Token | Hex | Usage |
|-------|-----|--------|
| `--brand-background` | `#09090B` | App background |
| `--brand-surface` | `#0F0F11` | Cards, panels |
| `--brand-primary` | `#7C3AED` | Primary actions, active states |
| `--brand-accent` | `#6366F1` | Gradients, highlights |
| `--brand-accent-light` | `#A78BFA` | Logo gradient start, soft accents |
| `--brand-text-primary` | `#FAFAFA` | Headings, primary text |
| `--brand-text-secondary` | `#A1A1AA` | Metadata, labels |
| `--brand-text-muted` | `#71717A` | Placeholders, hints |
| `--brand-border` | `rgba(255,255,255,0.06)` | Dividers, card borders |

## Logo usage rules

**Do**

- Use the official SVG assets from `public/brand/`
- Place the mark on dark backgrounds (`#09090B` – `#0F0F11`)
- Maintain clear space equal to 25% of the mark height on all sides
- Use the gradient mark on dark UI; use `logo-mark.svg` as-is

**Don't**

- Stretch, rotate, or skew the logo
- Change gradient colors outside the brand palette
- Place the violet mark on busy or low-contrast backgrounds
- Add drop shadows, glows, or AI-style effects
- Use the old letter "C" placeholder

**Minimum sizes**

- Favicon: 16×16 px (use `favicon.svg` or `favicon.ico`)
- Sidebar: 32×32 px
- Auth pages: 40×40 px or full `logo.svg`

## Typography

- **UI:** Geist Sans (existing app font)
- **Wordmark:** System UI stack at 650 weight, tight tracking — embedded in `logo.svg` only

## Voice

Professional, minimal, creative-studio — Midjourney/Notion/Linear energy without generic AI aesthetics.
