# CharID Ammonite Logo — Cursor Prompt

Use this prompt when refining, extending, or re-exporting the official CharID brand mark.

---

## Context

CharID’s official logo is a **minimalist ammonite shell** — a counter-clockwise spiral with radial chamber lines (line art, no fill). It replaces the legacy purple “character dossier” icon.

**Brand color:** `#4e7470` — same as the Create button (`--brand-accent` in `src/app/globals.css`).

**Geometry source:** `src/lib/brand-ammonite.ts` and `scripts/generate-ammonite-brand.mjs` (must stay in sync).

---

## Cursor prompt (copy/paste)

```
Integrate the CharID ammonite logo consistently across the app.

Requirements:
- Mark: minimalist ammonite line art (CCW spiral, radial septa, no star, no gradients)
- Color: #4e7470 (--brand-accent / Create button green)
- UI component: src/components/brand/AmmoniteMark.tsx with currentColor + text-[var(--brand-accent)]
- Swap point: src/components/brand/BrandLogoSlot.tsx → CharIDLogo → AmmoniteMark
- Static assets: public/brand/logo-mark.svg, favicon.svg; src/app/icon.svg; src/app/apple-icon.svg
- Regenerate: npm run generate:brand (deploys SVGs + favicon.ico)
- Favicon: 3-chamber simplified derivative at 32×32 (not scaled 7-chamber mark)
- Apple icon: dark plate #111111, ammonite stroke #4e7470, 180×180 squircle
- Do not reintroduce purple dossier assets or gradient fills
- Preserve flat line-art style at 16px tab size

When changing geometry, update BOTH:
1. src/lib/brand-ammonite.ts
2. scripts/generate-ammonite-brand.mjs
Then run: npm run generate:brand
```

---

## File map

| Purpose | Path |
|---------|------|
| React mark (in-app) | `src/components/brand/AmmoniteMark.tsx` |
| Logo wrapper | `src/components/brand/CharIDLogo.tsx` |
| App swap point | `src/components/brand/BrandLogoSlot.tsx` |
| Path geometry | `src/lib/brand-ammonite.ts` |
| Generator + deploy | `scripts/generate-ammonite-brand.mjs` |
| favicon.ico | `scripts/generate-favicon.mjs` → `public/favicon.ico` |
| Draft previews | `assets/brand-ammonite-draft/previews/` |

---

## Regeneration commands

```bash
# Draft previews only
node scripts/generate-ammonite-brand.mjs

# Deploy to public/ + app icons + favicon.ico
npm run generate:brand
```

---

## Visual spec

- **Style:** Uniform stroke line art; `stroke-linecap: round`; `stroke-linejoin: round`
- **Mark viewBox:** 64×64, 7 chambers, stroke-width 2.25
- **Favicon viewBox:** 32×32, 3 chambers, stroke-width 2
- **Wordmark lockup:** Optional `logo.svg` (128×168) with path-based “CharID” under mark
- **Reference:** Founder-supplied ammonite line art (spiral opening upper-left)
