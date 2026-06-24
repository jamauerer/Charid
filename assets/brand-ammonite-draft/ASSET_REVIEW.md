# CharID Ammonite Brand — Draft Asset Review

**Status:** Draft only — **do not replace** `public/brand/*` or `src/app/*` until founder approval.

**Generated:** 2026-06-21  
**Generator:** `scripts/generate-ammonite-brand.mjs`

---

## Checkpoint recommendation

Before replacing production brand files, create a git checkpoint:

```bash
git add -A
git status
git commit -m "Remove Story Bible surface from story page."
# optional tag after brand swap:
# git tag pre-ammonite-brand
```

### Current git state (at generation time)

| Item | Value |
|------|--------|
| **Branch** | `main` (up to date with `origin/main`) |
| **HEAD** | `9a90da5` — Signed URL stabilization |
| **Tag `pre-brand-refresh`** | Points at `9a90da5` (already on origin) |
| **Uncommitted** | Story Bible removal, misc page/schema edits |

**Recommendation:** Commit or stash unrelated WIP **before** swapping brand assets, so the ammonite rollout is an isolated commit on top of a clean tree.

---

## Delivered files

### SVG sources (draft)

| File | viewBox | Chambers | Shell color | Star |
|------|---------|----------|-------------|------|
| `logo-mark.svg` | 64×64 | 7 | `currentColor` → set `#1C1917` / `#E7E0D4` in UI | `#B89356` |
| `logo.svg` | 128×168 | 7 + path wordmark | `currentColor` (mark + wordmark) | `#B89356` |
| `favicon.svg` | 32×32 | 3 (derivative) | `currentColor` | `#B89356` (~26% width) |
| `apple-icon.svg` | 180×180 | 5 | `#E7E0D4` on `#111111` plate | `#B89356` |

### Preview renders

Under `assets/brand-ammonite-draft/previews/`:

| Preview | Sizes / variants |
|---------|------------------|
| `logo-mark-*` | 32, 64, 512 — light & dark backgrounds |
| `logo-*` / `logo-lockup-*` | 128, 256 — light & dark |
| `favicon-*` | 16, 32, 64 — light & dark |
| `apple-icon-*` | 180, 512 |

---

## Asset review notes

### What reads well

- **Ammonite concept preserved:** CCW spiral opening upper-left; radial septa; center star reads at all tested sizes.
- **Favicon is a true derivative:** 3 chambers + enlarged star — not a scaled 7-chamber mark.
- **Apple icon:** Dark plate + cream shell matches reference direction; 5 chambers fill the squircle safely.
- **Logo lockup (option B):** Self-contained mark + path-based `CharID`; no tagline.
- **Technical compliance:** Flat fills only; no gradients, filters, textures, or raster embeds.
- **Anchor budget:** 7 quads + 1 star per mark (~40 points/mark); favicon 3 quads + star (~16 points).

### Founder review items

1. **Wordmark refinement:** Path letters are geometric serif-inspired placeholders — may want second pass on `a`, `h`, and overall tracking before production swap.
2. **Mark centering:** Spiral centroid is mathematical center (32,32); optical weight tilts slightly toward the opening — acceptable or nudge 1–2px in v2.
3. **`currentColor` usage:** `logo-mark`, `logo`, and `favicon` use `currentColor` for shell/wordmark; parent CSS must set `#1C1917` (light) or `#E7E0D4` (dark). `apple-icon` bakes colors (no `currentColor`).
4. **16px favicon:** Star and opening remain visible; chamber detail is intentionally minimal — confirm in browser tab vs reference.
5. **No production paths touched:** Existing purple dossier assets remain live.

### Not in scope (awaiting later phases)

- Replacing `public/brand/*`, `src/app/icon.svg`, `src/app/apple-icon.svg`
- `npm run generate:favicon` / `.ico` sync
- `CharIDLogo.tsx` / `layout.tsx` metadata updates
- CSS palette migration (`globals.css` purple → brand neutrals/bronze)
- `docs/BRAND.md` rewrite

---

## Approval checklist

- [ ] Ammonite mark shape approved (7-chamber geometry)
- [ ] Favicon derivative approved at 16px / 32px
- [ ] Apple icon approved on device home screen
- [ ] Path wordmark approved or revision requested
- [ ] Git checkpoint created
- [ ] Authorized to copy draft → `public/brand/` + app icon paths
