# Phase A1 — Implementation Report

**Status:** Shipped (A1 only)  
**Date:** 2026-06-14  
**Scope:** Story Finish Path + Chapters-first layout  
**Plan:** [PHASE_A_IMPLEMENTATION_PLAN.md](./PHASE_A_IMPLEMENTATION_PLAN.md) · **A1 slice**

---

## Summary

Phase A1 reorders the story workspace so creators encounter **What's next → Chapters → Characters → World → Advanced story plan** instead of the full story plan first. Every story page now resolves a single primary next step using creator-facing language aligned with **Idea → Story → Create → Finish**.

**Not in this slice:** post-create redirect (A2), Stories hub enrichment (A3), Create → Comic (A4), look & feel, home resume card, database migrations.

---

## Goals delivered

| Goal | Status |
|------|--------|
| Every story answers “What should I do next?” | ✅ `StoryFinishPath` + `resolveStoryFinishPath()` |
| Chapters are the primary creation surface | ✅ Moved above characters/world/plan; hero panel with Continue + Create |
| Advanced planning is secondary and collapsible | ✅ `StoryAdvancedPlan` wraps `StoryBibleView` (collapsed by default) |
| Creator-facing language (Create → Finish) | ✅ No “Story bible” / “Comic draft readiness” on default path |

---

## Files changed

### New

| File | Purpose |
|------|---------|
| `src/lib/story-finish-path.ts` | Finish-step resolver — primary CTA, hints, continue chapter pick |
| `src/components/dashboard/StoryFinishPath.tsx` | “What's next” hero section |
| `src/components/dashboard/StoryChaptersPanel.tsx` | Chapters work area — list, Continue story, Create next chapter |
| `src/components/dashboard/StoryAdvancedPlan.tsx` | Collapsible `<details>` wrapper for advanced planning |

### Modified

| File | Change |
|------|--------|
| `src/app/dashboard/worlds/[id]/stories/[storyId]/page.tsx` | Layout reorder; finish path; dual back nav (← Stories · world) |
| `src/components/story-bible/StoryBibleView.tsx` | `variant="advanced"` hides metrics, checklist, top recommendations |
| `src/components/ChapterList.tsx` | Creator empty state; “Continue here” badge on resume chapter |
| `src/app/dashboard/NewChapterModal.tsx` | Configurable `triggerLabel` (default: “Create next chapter”) |
| `src/components/dashboard/StoryPageCharactersSection.tsx` | `id="story-characters"` anchor for finish-path scroll |
| `src/lib/creator-vocabulary.ts` | Story finish-path and advanced-plan labels |

---

## Routes affected

| Route | Change |
|-------|--------|
| `/dashboard/worlds/[worldId]/stories/[storyId]` | **Primary** — new layout and finish path |

No new routes. Chapter and world routes unchanged.

---

## Components added

| Component | Type | Responsibility |
|-----------|------|----------------|
| `StoryFinishPath` | Server-friendly presentational | Single primary CTA + optional hint links |
| `StoryChaptersPanel` | Server | Chapters section with Continue + Create next chapter |
| `StoryAdvancedPlan` | Client (`<details>`) | Collapsed advanced story plan container |

### Supporting logic

| Module | Responsibility |
|--------|----------------|
| `lib/story-finish-path.ts` | `resolveStoryFinishPath()`, `pickContinueChapter()`, `isComicProjectType()` |

---

## Finish path behavior

Priority order (one primary CTA):

1. **No chapters** → “Add your first chapter” (scroll to `#story-chapters`)
2. **Chapters, no characters** → “Add characters” / “Add characters to your comic” (scroll to `#story-characters`)
3. **Comic project + chapters + characters** → “Ready to create your comic” (disabled; Phase B placeholder)
4. **Otherwise** → “Continue your story” (link to last chapter by `sort_order`, then `created_at`)

Secondary hints (when applicable):

- “Continue your story” link when primary is Add characters
- “Continue your story” link when primary is Ready to create your comic

Internal step ids (`comic_draft_ready`, etc.) are not shown in UI copy.

---

## Story page layout (after A1)

```
1. ← Stories · World name
2. Title + status badge
3. What's next (StoryFinishPath)
4. Chapters (StoryChaptersPanel)
5. Characters
6. World
7. ▸ Advanced story plan (collapsed)
8. Edit details
```

---

## Migration requirements

**None for A1.**

Finish path is computed from existing tables:

- `stories` — `project_type`, `status`
- `chapters` — count, `sort_order`, `created_at`
- `story_characters` — link count

### Recommended follow-up (Phase A3)

| Migration | Purpose |
|-----------|---------|
| `stories.updated_at` | Accurate “continue working” sort on Stories hub |
| `chapters.updated_at` | Better “last edited chapter” for Continue story |

Until then, continue chapter uses highest `sort_order` (tie-break: latest `created_at`).

---

## Founder testing checklist

### Finish path

- [ ] **New story (no chapters):** Shows **Add your first chapter**; scroll lands on Chapters section
- [ ] **Story with chapters, no characters:** Shows **Add characters**; secondary **Continue your story** works
- [ ] **Comic-type story** (`childrens_book` or `graphic_novel`) with chapters + characters: Shows **Ready to create your comic** (disabled) with coming-soon hint
- [ ] **Story with chapters + characters (non-comic or incomplete comic gate):** Shows **Continue your story** → opens last chapter
- [ ] No UI copy says “Story bible”, “Comic draft readiness”, or “Comic Draft Readiness”

### Chapters-first layout

- [ ] Chapters section visible **without scrolling** on a typical laptop viewport (after title + What's next)
- [ ] **Create next chapter** opens modal and redirects to new chapter on success
- [ ] **Continue story** button in chapters header matches finish-path chapter
- [ ] Chapter list highlights **Continue here** on the resume chapter
- [ ] Empty chapters state uses creator copy (“Create your first chapter…”)

### Advanced planning

- [ ] **Advanced story plan** is collapsed on first load
- [ ] Expanding shows section tabs (Overview, Timeline, etc.)
- [ ] Metrics header, reference checklist, and top recommendations **hidden** inside advanced panel
- [ ] Metrics and Recommendations tabs still reachable inside expanded panel

### Navigation & regression

- [ ] **← Stories** and world name links work
- [ ] Phase 2B: Add/create character on story page still works
- [ ] Phase 2B: Change/create world on story page still works
- [ ] Edit details form still saves at bottom

### Explicitly not testable in A1

- Post-create redirect / welcome banner (A2)
- Stories hub next-step labels (A3)
- Create → Comic entry (A4)
- Actionable comic page builder (Phase B)

---

## Known follow-ups

| Item | Phase | Notes |
|------|-------|-------|
| Post-create redirect + `?welcome=1` banner | A2 | Modal still closes without navigating to story |
| Terminology pass (sidebar, global Create) | A2/A6 | “Character Studio”, bible labels elsewhere |
| Stories hub sort + next-step on cards | A3 | Needs `stories.updated_at` or computed activity |
| Home resume card | A5 | — |
| Create → Comic first-class entry | A4 | — |
| Enable **Ready to create your comic** CTA | Phase B | Opens page/panel editor |
| `chapters.updated_at` for smarter Continue | A3 optional | Better than sort_order proxy |
| Unit tests for `resolveStoryFinishPath()` | Optional | No test runner configured yet |
| `FounderDashboard.tsx` TS errors | Pre-existing | Blocks full `npm run build`; unrelated to A1 |

---

## Build verification

- A1 files: **no linter errors**
- `next build` **compiles A1 successfully**; fails at pre-existing `FounderDashboard.tsx` type errors (not introduced by this slice)

---

## Version

| Version | Date | Notes |
|---------|------|-------|
| 1.0 | 2026-06-14 | A1 shipped — finish path + chapters-first layout |
