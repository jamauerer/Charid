# Visual Identity — Phase 4 Implementation

**Date:** 2026-06-14  
**Status:** Implemented  
**Reference:** Midjourney — density, typography, whitespace, restraint  
**Supersedes:** Sunset/atmosphere direction from Phase 3 (tokens and chrome only; Homepage V2 IA unchanged)

---

## Summary

Phase 4 shifts CharID from **sunset creative studio atmosphere** to **content-first UI**. The interface recedes; artwork and project covers dominate. Orange/amber accents, decorative gradients, and oversized hero bands are removed. Vertical spacing is ~40% tighter. A single subtle accent (`#6366f1`) is used only for primary actions and selection states.

---

## Design principles (Phase 4)

| Principle | Implementation |
|-----------|----------------|
| Interface disappears | Flat surfaces, thin borders, no ambient washes |
| Art is primary | `aspect-video` cards; metadata in 1–2 small lines |
| Single accent | `--brand-ui-accent: #6366f1` — buttons, focus, selected theme |
| No sunset | Removed amber/orange CTAs, warm borders, gradient placeholders |
| Midjourney density | 14px base body, compact padding, `space-y-5` page stacks |
| Above the fold (13") | Compact continue row + project grid visible without scroll |
| Readability over atmosphere | Neutral zinc palette; high-contrast text hierarchy |

---

## Tokens

### Removed

- `--brand-warm-accent*` / sunset palette  
- `--studio-gradient-*` / `--studio-ambient`  
- `--brand-sunset-glow` / `--brand-warm-border`  
- `.studio-marketing-wash` / `.studio-showcase-frame` gradient utilities  

### Added / updated

| Token | Value | Use |
|-------|-------|-----|
| `--brand-ui-accent` | `#6366f1` | Primary buttons, selection ring |
| `--studio-empty-fill` | `#f4f4f5` / `#1c1c1c` | Flat empty covers (no gradient) |

### Themes

Theme IDs unchanged (`sunset-light` / `sunset-dark`) for storage compatibility.  
Settings labels renamed to **Light** / **Dark**.

| | Light | Dark |
|---|-------|------|
| Background | `#fafafa` | `#0a0a0a` |
| Surface | `#ffffff` | `#141414` |
| Border | `#e4e4e7` | `#27272a` |
| Text | `#18181b` | `#fafafa` |

---

## Component changes

### Dashboard home (`/dashboard`)

| Before (Phase 3) | After (Phase 4) |
|------------------|-----------------|
| Full-width 16:9 hero with scrim | Horizontal **continue row** — small cover + inline metadata |
| `min-h-[420px]` first-time hero | Compact text block + single CTA |
| `space-y-12` sections | `space-y-5` (`studioPageStack`) |
| Gradient aspiration frames | Removed |
| Orange hover on cards | Accent border hover at 30% opacity |

### Shell

- Removed fixed ambient gradient overlay  
- Main padding: `lg:pt-20` → `lg:pt-10` (~50% reduction)  
- Mobile header: `h-12` → `h-11`  

### Cards (Project, Story, World, Character)

- `aspect-video` (16:9) art area  
- Metadata: `text-sm` title + `text-[11px]` secondary — one line where possible  
- No image scale-on-hover  
- Flat `--studio-empty-fill` placeholders  

### Marketing (`/`)

- Removed hero gradient blobs and showcase gradient frames  
- Section padding: `py-16–24` → `py-8–10`  
- Headline: `text-5xl` → `text-3xl` max  
- Pipeline: inline text steps, no numbered amber circles  
- Features: 3-column text grid, no large showcase panels  

### Empty states

- Removed decorative gradient divider bar  
- Padding: `py-12` → `py-6`  

### Buttons

- Solid accent fill — no amber→orange gradients  
- `rounded-md` (was `rounded-lg`)  
- Smaller vertical padding  

---

## `visual-identity.ts` exports

New helpers:

- `studioPageStack` — `space-y-5`  
- `studioSectionHeading` / `studioSectionSub` — compact section labels  

Updated: all button, card, panel, and empty-art classes use flat tokens and accent hover.

---

## Above-the-fold target (13" laptop, ~768px viewport)

Returning creator home (~):

| Block | Approx. height |
|-------|----------------|
| Shell top padding | 40px |
| Continue row | ~100px |
| Projects heading + 2× grid row | ~220px |
| **Total before scroll** | ~360px — recent strip partially visible |

---

## Remaining work (Phase 4.1)

Workspace interiors still contain Phase 1–3 amber accents:

- Story / scene workspace panels  
- Scene suggestion staging  
- Character bible progress bars (token updated; some copy unchanged)  
- Create modal violet/amber mixed buttons  

These can be migrated incrementally without IA changes.

---

## Verification

```bash
npx tsc --noEmit
npm run build
```

Both pass as of 2026-06-14.

---

## Files changed (primary)

```
src/app/globals.css
src/lib/visual-identity.ts
src/lib/theme.ts
src/components/dashboard/DashboardShell.tsx
src/components/dashboard/home/*.tsx
src/app/dashboard/DashboardHomeView.tsx
src/components/marketing/HomePageContent.tsx
src/components/marketing/MarketingHeader.tsx
src/components/project/ProjectCard.tsx
src/components/StoryCard.tsx
src/components/WorldCard.tsx
src/components/studio/StudioEmptyState.tsx
src/components/settings/SettingsAppearancePanel.tsx
src/app/dashboard/projects/DashboardProjectsView.tsx
```
