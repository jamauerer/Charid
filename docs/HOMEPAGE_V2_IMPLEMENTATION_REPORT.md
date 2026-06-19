# Homepage V2 — Implementation Report

**Date:** 2026-06-14  
**Status:** Implemented  
**Design authority:** [HOMEPAGE_V2_CREATIVE_STUDIO.md](./HOMEPAGE_V2_CREATIVE_STUDIO.md) · [VISUAL_IDENTITY_V1.md](./VISUAL_IDENTITY_V1.md)

---

## Summary

Logged-in home (`/dashboard`) is rebuilt as a **project-first creative studio**. First-time creators see an inspirational hero with a single “Begin your first project” path. Returning creators see their **latest project cover as hero**, a **project gallery**, **recent creative moments**, and calm secondary actions. Entity count cards, “Explore your studio” metrics, and the generic Create modal on home are **removed**.

---

## Before / after

> **Screenshots:** Capture manually during founder test (see checklist below). Paths: `/dashboard` with 0 projects vs. with 2+ projects, both themes.

### Before (Phase 1 home)

```
┌─────────────────────────────────────────┐
│ [Small hero band]                       │
│   A place where stories begin           │
│   [ Create ]  ← generic modal           │
├─────────────────────────────────────────┤
│ Your recent work — 6 small mixed thumbs │
├─────────────────────────────────────────┤
│ Explore your studio                     │
│ Stories (3) | Characters (2) | Worlds(1)│  ← dashboard feel
├─────────────────────────────────────────┤
│ Portfolio | Explore                     │
└─────────────────────────────────────────┘
```

### After — first-time (0 projects)

```
┌─────────────────────────────────────────┐
│ [ Character ] [ World ] [ Story ]       │
│   aspirational empty frames             │
│                                         │
│   A place where stories begin.          │
│   [ Begin your first project ]          │
└─────────────────────────────────────────┘
(no counts, no entity cards, no gallery)
```

### After — returning (has projects)

```
┌─────────────────────────────────────────┐
│ [ FULL-WIDTH PROJECT COVER — 16:9 ]     │
│ Continue your latest project            │
│ California Coast Surf Stories           │
│ Comic · In progress · 2h ago            │
│ [ Continue ]  [ Start something new ]   │
├─────────────────────────────────────────┤
│ Your other projects                     │
│ ┌──────────┐ ┌──────────┐               │
│ │ 16:9     │ │ 16:9     │  large cards   │
│ │ Title    │ │ Title    │               │
│ │ Comic    │ │ Novel    │               │
│ │ In prog  │ │ Getting… │               │
├─────────────────────────────────────────┤
│ Recent creative moments                 │
│ scene | chapter | story | character …   │
├─────────────────────────────────────────┤
│ [ Create project ] [ Browse portfolio ] │
└─────────────────────────────────────────┘
```

---

## Components

| Component | Path | Role |
|-----------|------|------|
| `getHomePageData` | `src/app/actions/home-page.ts` | Server data: projects, latest, creative moments |
| `DashboardHomeView` | `src/app/dashboard/DashboardHomeView.tsx` | Layout switch: first-time vs returning |
| `HomeFirstTimeHero` | `src/components/dashboard/home/HomeFirstTimeHero.tsx` | Aspirational frames + wizard CTA |
| `HomeContinueHero` | `src/components/dashboard/home/HomeContinueHero.tsx` | Latest project cover hero |
| `HomeProjectGallery` | `src/components/dashboard/home/HomeProjectGallery.tsx` | Large 16:9 project cards (`#all-projects`) |
| `HomeCreativeMoments` | `src/components/dashboard/home/HomeCreativeMoments.tsx` | Scenes, chapters, artwork strip |
| `HomeSecondaryActions` | `src/components/dashboard/home/HomeSecondaryActions.tsx` | Create project + portfolio links |
| `home-project-labels` | `src/lib/home-project-labels.ts` | Work type, progress, last-active copy |

### Updated (aligned, not new)

| Component | Change |
|-----------|--------|
| `ProjectCard` | Work type + progress labels; 16:9; no entity counts |
| `src/app/dashboard/page.tsx` | Uses `getHomePageData` only |

### Removed from home

| Removed | Reason |
|---------|--------|
| Entity count cards (Stories/Characters/Worlds) | Dashboard / admin feel |
| `CreateModal` on home hero | Replaced by project wizard CTAs |
| `HomeRecentWork` on home | Replaced by `HomeCreativeMoments` |
| Portfolio + Explore prominent grid | Demoted to secondary strip |

`HomeRecentWork.tsx` and `home-studio.ts` remain in codebase (unused by home page; safe to delete in a cleanup pass).

---

## Decisions

### 1. First-time threshold: `projects.length === 0`

Strict count per spec. Users with a backfilled empty **“My Studio”** default project see the **returning** layout (hero + optional gallery), not the first-time hero. If that proves confusing, a follow-up can treat “single default empty project” as first-time without schema changes.

### 2. Latest project = highest `updated_at`

Projects sorted by `updated_at` descending; first entry powers the continue hero.

### 3. Gallery visibility

| Projects | Behavior |
|----------|----------|
| 0 | First-time hero only |
| 1 | Continue hero only (no duplicate gallery) |
| 2+ | Continue hero + “Your other projects” grid (excludes hero project) |

### 4. Project card metadata

Shows **work type** + **progress label** (“Getting started”, “Story taking shape”, “In progress”, “In full swing”) — not story/character/world counts.

### 5. Creative moments

Merged feed from scenes (`updated_at`), chapters (`created_at`), stories, characters, worlds — max 6 items, sorted by recency. Scenes/chapters prioritized when present.

### 6. Creation entry on home

All home CTAs open **`StartNewProjectWizard`** directly — no Quick-add fork on home. Sidebar `CreateModal` unchanged (out of scope).

### 7. `/dashboard/projects` — recommendation

**Keep the route as an archive view for now. Do not redirect.**

| Option | Verdict |
|--------|---------|
| Redirect to `/dashboard#all-projects` | Deferred — home gallery only shows when 2+ projects; single-project users would lose a list view |
| Archive at `/dashboard/projects` | **Recommended** — full grid, “Start New Project”, legacy rename prompt |

**Future:** Add sidebar copy “All projects” linking to `/dashboard/projects`; add “View all projects →” on home when gallery is truncated (if pagination added).

---

## Empty states

Homepage V2 uses existing Phase 3 copy via `STUDIO_EMPTY_COPY` on list pages. Home itself uses **aspirational frames** (first-time) rather than dashed empty boxes.

| Entity | Copy (unchanged on other pages) |
|--------|----------------------------------|
| Project | What do you want to create? |
| Story | Every story starts somewhere. |
| Character | Who do you want to meet? |
| World | What kind of place are we exploring? |
| Scene | What happens next? |

---

## Founder test checklist

Capture screenshots for report appendix:

1. `/dashboard` — new account, 0 projects, Sunset Light  
2. `/dashboard` — returning user, 1 project with cover, Sunset Dark  
3. `/dashboard` — 3+ projects, gallery visible  
4. `/dashboard/projects` — archive grid  
5. Toggle theme in Settings → Appearance  

Ask: *“Does this feel like software, or a place where stories begin?”*

---

## Remaining issues

| Issue | Severity | Notes |
|-------|----------|-------|
| Backfilled “My Studio” skips first-time hero | Medium | May show empty continue hero for brand-new migrations |
| `home-studio.ts` / `HomeRecentWork` unused | Low | Dead code cleanup |
| Single-project users have no gallery on home | Low | By design; use `/dashboard/projects` |
| Creative moments lack dedicated artwork type | Low | Uses story/character/world covers; no moodboard slot yet |
| Sidebar still lists Stories/Characters/Worlds | Low | Out of V2 scope; home no longer depends on it |
| Progress label is heuristic | Low | Not tied to bible/completion scores |
| Projects page header still “Projects” + count badge | Low | Archive view; soften in follow-up |
| No `updated_at` on stories/characters/worlds in moments sort | Low | Falls back to `created_at` |

---

## Verification

```bash
npx tsc --noEmit
npm run build
```

Both pass as of 2026-06-14.

---

## Files changed

```
src/app/actions/home-page.ts                    (new)
src/app/dashboard/page.tsx
src/app/dashboard/DashboardHomeView.tsx
src/components/dashboard/home/HomeFirstTimeHero.tsx      (new)
src/components/dashboard/home/HomeContinueHero.tsx       (new)
src/components/dashboard/home/HomeProjectGallery.tsx     (new)
src/components/dashboard/home/HomeCreativeMoments.tsx    (new)
src/components/dashboard/home/HomeSecondaryActions.tsx   (new)
src/lib/home-project-labels.ts                           (new)
src/components/project/ProjectCard.tsx
docs/HOMEPAGE_V2_IMPLEMENTATION_REPORT.md
```
