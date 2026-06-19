# Phase A — Implementation Plan

**Status:** Planning only — no implementation yet  
**Date:** 2026-06-14  
**Version:** 1.1 — founder plan review refinements  
**Phase:** A — Creator Workflow ([IMPLEMENTATION_PHASES_V3.md](./IMPLEMENTATION_PHASES_V3.md))  
**Authority:** [CHARID_VISION_V3.md](./CHARID_VISION_V3.md) · [FINISHED_CREATIVE_WORK_PRINCIPLE.md](./FINISHED_CREATIVE_WORK_PRINCIPLE.md)  
**Architecture:** [ARCHITECTURE_COMPATIBILITY_REPORT.md](./ARCHITECTURE_COMPATIBILITY_REPORT.md) — continuity stack unchanged

---

## Purpose

Phase A closes the gap between **Story exists** and **creator knows what to do next**, using **finished-work language** (Create → Finish) rather than internal workflow jargon.

**Creator-facing spine:**

```
Idea → Story → Create → Finish
```

**Internal milestone (not creator copy):** *comic draft readiness* — cast + chapters + format set; unlocks Phase B page building. Never surface “Comic Draft Readiness” in UI.

**Exit criterion (from IMPLEMENTATION_PHASES_V3):** Founder can articulate the next step from any story **without leaving the story page**.

**Out of scope:** Comic pages/panels, publish, Explore, AI, credits, marketplace, POD, Project/Scene/Asset entities.

---

## Current-state audit

### 1. What happens after Story creation today?

| Step | Behavior |
|------|----------|
| **Trigger** | `NewStoryModal` on world page, or `CreateModal` → pick world → `StoryForm` |
| **Server** | `createStory` inserts `stories` row; returns `{ success, story }`; revalidates paths |
| **Client** | `StoryForm` `onSuccess` → closes modal + `router.refresh()` only |
| **Navigation** | **No redirect** to story workspace — user stays on world page or dashboard |
| **Story bible** | Row created lazily via `ensureStoryBible` on first story page load |
| **Chapters** | None — empty state until user scrolls story page and adds manually |
| **Default `project_type`** | `novel` — not aligned with child comic path |
| **Default `status`** | `Idea` — no link to finish checklist |

**Summary:** Story creation is a **dead end** until the user manually finds the story card again.

---

### 2. Where creators get stuck?

| Stuck point | Evidence |
|-------------|----------|
| **No post-create guidance** | Modal closes; no “Continue to your story” |
| **Story page IA** | Order: back link → title → World → Characters → **large Story plan block** (metrics, checklist, recommendations, 8 tabs) → Chapters (bottom) → Edit Details |
| **Planning vs finishing** | Story plan UI optimized for bible completeness scores, not “finish a comic” |
| **Chapters disconnected** | Copy: “Create a chapter to start **writing**” — plain-text editor; no comic framing |
| **No progress model** | Status badge (`Idea` / `Planning` / …) not tied to actionable steps |
| **World-first friction** | Create → Story requires existing world; child path needs 3 concepts (world, story, character) |
| **Stories hub weak** | `/dashboard/stories` lists cards + world link; **no** next-step hint, chapter count, or “continue” CTA |
| **Home is counts-only** | Dashboard home shows entity counts; not in-progress story resume |
| **Nested URLs** | Story only at `/dashboard/worlds/[worldId]/stories/[storyId]` — discoverable from hub but mentally “inside world” |
| **Jargon leakage** | Create modal: “Build a character profile and **bible**”; sidebar: “Character Studio”; story sections include **Metrics** / **Recommendations** on default path |
| **Story → Finished Work** | **Does not exist** — no checklist, no comic-draft state, no gateway to Phase B |

---

### 3. What workflow steps are missing?

| Missing step | Phase A target |
|--------------|----------------|
| **Immediate landing on story after create** | Redirect / push to story workspace |
| **Finish path (“What's next”)** | Single CTA: add chapter, continue, add characters, etc. |
| **Comic as first-class Create entry** | Create → Comic (phased A4a–d) |
| **Stories hub: continue working** | Sort by recent activity; mirror finish-path label |
| **Story plan behind “Advanced story plan”** | Default: creation sections only |
| **Look & feel stub** | Optional; maps to bible fields |
| **Chapter template helper** | Optional seed for comic entry |
| **`comic_draft_ready` (internal)** | Powers “Ready to create your comic” — not shown as jargon |

---

### 4. What navigation improvements are still needed?

| Area | Improvement |
|------|-------------|
| **Post-create** | Navigate to story page with optional `?welcome=1` one-time hint |
| **Story page back link** | Dual: “← Stories” (hub) + world name secondary |
| **Home** | “Continue your story” card when in-progress story exists |
| **Stories hub** | Primary workspace — status, next step, last edited |
| **Create modal** | **Comic** as first-class tile (“Make a comic”); copy pass |
| **Sidebar tagline** | “Character Studio” → neutral creator copy |
| **Section order** | What's next → Chapters → Characters → World → Advanced |
| **Optional alias route** | `/dashboard/stories/[storyId]` → redirect to canonical world-nested URL (bookmark-friendly) |

**Not required in Phase A:** Change world-nested URL scheme (moderate migration risk); flat `/dashboard/stories/[id]` as canonical.

---

### 5. What contextual creation gaps remain?

| Context | Phase 2B | Phase A gap |
|---------|----------|-------------|
| **World page** | Add/create character ✅ | — |
| **Story page** | Add/create character, change/create world ✅ | — |
| **Global Create → Character** | Works | **No `world_id` pre-select** — orphan characters |
| **Global Create → Story** | Requires world pick | **No inline create world** in comic starter (only separate flow) |
| **Chapter page** | — | No contextual add character |
| **Create from Home “Make a comic”** | — | Should create world + story + redirect in one flow |
| **Project picker** | Stub dead-end | Keep stub or hide until Phase E |

---

## Creator Finish Path

**Design only.** Every story page must answer: **What should I do next?**

The finish path is a **single primary CTA** plus optional step hints — not a technical checklist. Language must feel like **creating and finishing**, not database setup.

### Creator-facing next steps (examples)

| Situation | What the story shows |
|-----------|----------------------|
| No chapters yet | **Add your first chapter** |
| Chapters exist, none opened recently | **Continue your story** → last-edited chapter |
| No characters linked | **Add characters** |
| Comic-type story, no cast yet | **Add characters to your comic** |
| Optional enrichment | **Add locations** (links to story plan → Locations, advanced) |
| Internal gate met; Phase B not shipped | **Ready to create your comic** (placeholder until Phase B) |
| Phase B complete (future) | **Keep creating** / **Build your comic** |
| Phase C complete (future) | **Ready to share** / **Publish your work** |

### Internal step model (engineering)

Map creator copy to computed state in `lib/story-finish-path.ts`:

| Internal id | Creator label (dynamic) | Complete when |
|-------------|---------------------------|---------------|
| `first_chapter` | Add your first chapter | `chapters.length ≥ 1` |
| `continue_chapter` | Continue your story | Has chapters; CTA = most recent `chapter.updated_at` |
| `characters_linked` | Add characters | `story_characters.length ≥ 1` |
| `locations_optional` | Add locations | Optional; never blocks Finish |
| `comic_draft_ready` | Ready to create your comic | Comic `project_type` + cast + chapters (internal only) |
| `publish_ready` | Ready to share | Phase C — placeholder in Phase A |

**Priority rule:** Show **one** primary next step. Secondary steps appear as smaller hints below, not a wall of checkboxes.

### Finish vs planning

| Finish path (default) | Advanced planning (collapsed) |
|-----------------------|-------------------------------|
| Add / continue chapters | Timeline, major events |
| Add characters | Overview themes, metrics |
| Ready to create comic (when met) | Reference assets, locations detail |
| Ready to share (future) | Recommendations, completeness scores |

---

## Story First-Time User Experience

**Design only.** First visit to a story workspace — especially after **Create → Comic** — should feel like **starting work**, not opening a planning dashboard.

### Triggers

| Entry | FTUE behavior |
|-------|---------------|
| **Create → Comic** | Land on story page; welcome banner; chapters section focused; finish path = “Add your first chapter” or pre-seeded chapters → “Add characters” |
| **Create → Story** (generic) | Same redirect; softer copy; finish path = “Add your first chapter” |
| **Stories hub → open** | No welcome banner; show **Continue your story** if in progress |

### First-time story page (default layout)

```
┌─────────────────────────────────────────┐
│ ← Stories          [Story title]        │
├─────────────────────────────────────────┤
│ WHAT'S NEXT                             │
│  [ Primary CTA: Add your first chapter ]│
├─────────────────────────────────────────┤
│ CHAPTERS                                  │
│  · (empty) or template list               │
│  [ + Create next chapter ]                │
├─────────────────────────────────────────┤
│ CHARACTERS (compact)                      │
│  [ Add character ]                        │
├─────────────────────────────────────────┤
│ WORLD (compact, secondary)                │
├─────────────────────────────────────────┤
│ ▸ Advanced story plan (collapsed)         │
├─────────────────────────────────────────┤
│ Edit details                              │
└─────────────────────────────────────────┘
```

### Welcome moment

- Dismissible one-line banner when `?welcome=1`: *“You're in your story — add a chapter or character to get started.”*
- No tour, no metrics, no reference checklist on first paint.
- Post-create redirect is **mandatory** (modal close alone is insufficient).

### Returning user

- No welcome banner.
- Primary CTA = **Continue your story** (deep link to last chapter) when chapters exist.
- Stories hub row mirrors same next-step label.

---

## Comic Entry Point Strategy

**“Make a comic” is a first-class concept** — not a hidden template on the Story object. Many creators (especially children) start with *“I want to make a comic”*, not *“I want to create a story.”*

### Creator mental model

```
Create → Comic     ← preferred child / hobbyist entry
Create → Story     ← professional / novel / general entry
```

Both land on the **same story workspace** and **same database**. Comic entry pre-configures intent; it does not fork architecture.

### Phased rollout (implementation)

| Phase | Deliverable | User sees |
|-------|-------------|-----------|
| **A4a** | Create picker: **Comic** tile (peer to Character, World, Story) | “Make a comic” |
| **A4b** | Comic flow: title + world pick/create → story + `project_type` preset | Short form, not Story jargon |
| **A4c** | Optional chapter template seed (e.g. 6 chapters) | Lands on story with chapters list populated |
| **A4d** | Redirect + FTUE tuned for comic | Finish path comic-aware copy |
| **Phase B** | “Ready to create your comic” opens page editor | Finish path CTA becomes actionable |

### Create modal picker (target)

| Option | Creator label | Notes |
|--------|---------------|-------|
| **Comic** | **Make a comic** | First-class; primary for child path; may sort first |
| Character | Character | Unchanged |
| World | World | Unchanged |
| Story | Story | “Plan a story” — for novel / general |
| Project | Project | Coming soon / hidden |

### Comic flow (minimal v1)

1. Creator chooses **Make a comic**.
2. Enter comic title (story title under the hood).
3. Pick existing world **or** create world inline (v1.1 if scoped).
4. Server creates story with `project_type`: `childrens_book` or `graphic_novel` (selector or default).
5. Optional: seed chapter titles (“Page 1” … “Page 6”).
6. Redirect to story workspace with `?welcome=1`.

### Copy guidelines

| Avoid (internal) | Prefer (creator-facing) |
|------------------|-------------------------|
| Create story object | Start your comic |
| Comic draft readiness | Ready to create your comic |
| Outline chapters | Add your first chapter / Create next chapter |
| Story bible | Advanced story plan |
| Link characters to story | Add characters |

---

## Story page section audit

Audit of current story workspace sections. **Default layout must prioritize creation over planning.**

### Classification

| Section | Current location | Class | Phase A treatment |
|---------|------------------|-------|-------------------|
| **What's next / Finish path** | Missing | **Essential immediately** | **Add** — top of page |
| **Chapters** | Bottom | **Essential immediately** | **Move up** — primary work area |
| **Create next chapter** | In chapters header | **Essential immediately** | Prominent button |
| **Continue story** | Missing | **Essential immediately** | **Add** — link to last chapter in finish path + chapter list |
| **Characters** | Mid page | **Essential immediately** | Keep compact; below chapters |
| **World** | Top (after title) | **Useful after creation starts** | Move below characters; collapse for comic entry |
| **Look & feel** | Missing | **Useful after creation starts** | Optional strip; not blocking |
| **Story plan — overview** | StoryBibleView tab | **Advanced planning** | Collapsed accordion |
| **Story plan — timeline** | Tab | **Advanced planning** | Collapsed |
| **Story plan — major events** | Tab | **Advanced planning** | Collapsed |
| **Story plan — character notes** | Tab | **Advanced planning** | Collapsed |
| **Story plan — locations** | Tab | **Advanced planning** | Collapsed; finish path may link here |
| **Story plan — assets / references** | Tab | **Advanced planning** | Collapsed |
| **Metrics / completeness** | StoryBibleMetricsHeader | **Advanced planning** | Hidden until advanced expanded |
| **Reference checklist** | Above tabs | **Advanced planning** | Hidden until advanced expanded |
| **Recommendations** | Above + tab | **Advanced planning** | Hidden until advanced expanded |
| **Edit details** | Bottom | **Useful after creation starts** | Stay at bottom |

### Recommended default layout (Phase A)

```
1. Title + status (subtle)
2. What's next — single primary CTA
3. Chapters — list · Create next chapter · Continue story
4. Characters — compact roster + add/create
5. World — compact (secondary)
6. Advanced story plan — collapsed
7. Edit details
```

**Principle:** Creators encounter **Chapters · Create next chapter · Continue story** before any advanced planning system.

---

## User journey (Phase A target)

**Creator-facing:**

```
Idea → Story → Create → Finish
```

**Internal (engineering / analytics only):**

```
… → chapters exist → cast linked → comic_draft_ready → Phase B pages → publish_ready
```

Panel editing is **Phase B**. Phase A ends when the creator sees a clear **Create → Finish** path and **Ready to create your comic** when internal gates are met.

### Child path (afternoon comic)

```
Home / Create → Make a comic
  → Land on story workspace
  → Add first chapter (or use template)
  → Add characters
  → Finish path: Ready to create your comic (Phase B unlock later)
```

### Professional path

```
Stories hub → Open story
  → Continue your story / Add first chapter
  → Optional: expand Advanced story plan
  → Same finish path logic
```

Same story page, same data — different entry points and default UI depth.

---

## Required UI changes

### Story workspace (`/dashboard/worlds/[worldId]/stories/[storyId]`)

| Change | Detail |
|--------|--------|
| **Reorder layout** | See [Story page section audit](#story-page-section-audit) — What's next → Chapters → Characters → World → Advanced → Edit |
| **StoryFinishPath** | Single primary CTA; creator copy from [Creator Finish Path](#creator-finish-path) |
| **Chapters block** | Hero work area: list · **Create next chapter** · **Continue story** (last edited) |
| **Advanced story plan** | Collapsed; wraps `StoryBibleView`; label not “Story bible” |
| **Look & feel strip** | Optional; below World or inside Advanced |
| **Phase B placeholder** | When internal gate met: **Ready to create your comic** — disabled until Phase B |
| **Post-create banner** | FTUE welcome when `?welcome=1` |

### Stories hub (`/dashboard/stories`)

| Change | Detail |
|--------|--------|
| **Row/card enrichment** | Status, character count, chapter count, **next step label**, relative last updated |
| **Continue CTA** | Prominent on most recently edited story |
| **Empty state** | **Make a comic** as primary CTA |
| **Sort** | By `updated_at` desc (requires DB column or computed) |

### Home (`/dashboard`)

| Change | Detail |
|--------|--------|
| **Resume card** | If in-progress story: title + next step + link |
| **Copy** | De-emphasize entity counts as primary; optional secondary |

### Create flows

| Change | Detail |
|--------|--------|
| **Create → Comic** | First-class picker tile; see [Comic Entry Point Strategy](#comic-entry-point-strategy) |
| **StoryForm / ComicForm success** | `router.push` to story URL with `?welcome=1` |
| **Character from Create** | Optional world select (or prompt after) |
| **Copy pass** | Finished-work language; no “bible” in creator copy |

### Global chrome

| Change | Detail |
|--------|--------|
| **Sidebar tagline** | Remove “Character Studio” |
| **Story section nav** | Hide Metrics / Recommendations from default; move under Advanced |

---

## Required routes

| Route | Action |
|-------|--------|
| `/dashboard/stories` | **Enhance** — hub with progress metadata (existing page) |
| `/dashboard/worlds/[worldId]/stories/[storyId]` | **Enhance** — finish path layout (existing) |
| `/dashboard/stories/[storyId]` | **Add** — server redirect to canonical world-nested URL after lookup |
| `/dashboard/worlds/[worldId]/stories/[storyId]/chapters/[chapterId]` | **Minor copy** — “Chapter outline” framing (existing) |

**No new public routes.** No comic editor routes (Phase B).

---

## Required components

### New

| Component | Responsibility |
|-----------|----------------|
| `StoryFinishPath` | Single primary CTA + optional hints; uses `lib/story-finish-path.ts` |
| `StoryWhatsNext` | Alias/wrapper for finish path hero |
| `StoryChaptersPanel` | Chapters list + Create next chapter + Continue story |
| `StoryAdvancedPlan` | Collapsible wrapper around `StoryBibleView` |
| `StoryLookAndFeelForm` | Optional style fields |
| `ComicCreateFlow` / `MakeComicModal` | Create → Comic entry (phased) |
| `StoryResumeCard` | Home continue widget |
| `StoryHubRow` | Hub row with next-step label |
| `ChapterTemplateActions` | Optional template seed for comic entry |
| `lib/story-finish-path.ts` | Internal state + creator-facing next-step resolver |

### Modified

| Component | Change |
|-----------|--------|
| `StoryForm` / `createStory` success handler | Navigate to story page |
| `CreateModal` | Comic tile first-class; copy pass |
| `DashboardStoriesView` | Hub enrichment, sort, next step |
| `DashboardHomeView` | Resume card |
| `StoryDetailPage` | Layout reorder; pass finish-path props |
| `StoryBibleView` | `variant="advanced"` — hide header metrics when embedded |
| `StorySectionNav` | Filter sections for default vs advanced |
| `ChapterList` | Chapter count badge; comic-oriented empty state |
| `DashboardSidebar` | Tagline |
| `WorldStoriesSection` | Post-create already on world — ensure redirect if modal used |

### Unchanged (regression only)

| Component | Note |
|-----------|------|
| `StoryWorldSection` | Phase 2B — verify |
| `StoryPageCharactersSection` | Phase 2B — verify |
| `CharacterPickerModal` / `ContextualCharacterCreateModal` | Reuse |

---

## Required database changes

Phase A prefers **computed finish state** from existing tables. Minimal schema additions only.

| Change | Required? | Notes |
|--------|-----------|-------|
| **`stories.updated_at`** | **Recommended** | Touch on story edit, chapter CRUD, cast link, bible save; powers “continue working” sort |
| **`story_bible` look & feel** | **Optional** | Reuse `themes` + `tone` first; add `look_and_feel_notes` only if needed |
| **`stories.finish_path_dismissed_at`** | Optional | If checklist should stay dismissible per user |
| **Chapter template seed** | No schema | Insert standard `chapters` rows via action |
| **Comic pages / panels** | **Phase B** | Not Phase A |
| **Publish columns** | **Phase C** | Not Phase A |
| **Bible / graph / packet tables** | **None** | Architecture frozen |

### Finish path computation (no new tables)

```typescript
// lib/story-finish-path.ts (planned)
type FinishStepId =
  | "first_chapter"
  | "continue_chapter"
  | "characters_linked"
  | "locations_optional"
  | "comic_draft_ready"   // internal — UI: "Ready to create your comic"
  | "publish_ready";      // Phase C — UI: "Ready to share"

// resolveNextStep() → { primaryLabel, primaryHref, hint?: string }
```

### Optional migration sketch

```sql
-- Phase A only if not using touch via trigger
alter table public.stories
  add column if not exists updated_at timestamptz not null default now();

-- Backfill: updated_at = created_at where missing
```

Trigger or application-level touch on: story update, chapter insert/update/delete, story_characters insert/delete, story_bible update.

---

## Implementation sequence (recommended)

| Sprint slice | Deliverable |
|--------------|-------------|
| **A1** | `story-finish-path.ts` + What's next + **Chapters-first layout** |
| **A2** | Post-create redirect + FTUE; Advanced plan collapsed; terminology pass |
| **A3** | Stories hub + `updated_at` + Continue labels |
| **A4a–d** | Create → Comic (phased): tile → flow → template → redirect |
| **A5** | Look & feel; Home resume; story alias route |
| **A6** | Contextual gaps + copy pass + founder QA |

---

## Founder testing checkpoints

### Story creation & landing

- [ ] Create story from world modal → lands on story page with welcome hint
- [ ] Create story from Create modal → same redirect
- [ ] “Make a comic” → story with template chapters + correct `project_type`

### Finish path & FTUE

- [ ] New story shows **Add your first chapter** (not internal jargon)
- [ ] Story with chapters shows **Continue your story** to last chapter
- [ ] After linking character, next step updates sensibly
- [ ] When gates met, shows **Ready to create your comic** (not “Comic draft readiness”)
- [ ] Advanced story plan collapsed; metrics hidden until expanded
- [ ] Chapters section visible **without scrolling** on laptop viewport

### Create → Comic

- [ ] **Comic** appears as first-class Create option
- [ ] Comic flow lands on story with welcome hint
- [ ] Optional template chapters work without duplicate-on-rerun bug

### Stories hub & home

- [ ] Hub lists stories sorted by recent activity
- [ ] Each row shows creator next-step (e.g. “Continue your story”, “Add your first chapter”)
- [ ] Home shows resume card for most recent in-progress story

### Contextual creation (2B regression)

- [ ] World: add/create character still works
- [ ] Story: add/create character, change/create world still works

### Professional path

- [ ] Can ignore checklist and use full story plan
- [ ] All existing story bible saves still persist

### Exit gate

- [ ] Founder, from cold story open, states next action in **&lt; 5 seconds** without scrolling hunt
- [ ] Issues logged in `UX_BUGS_AND_CONFUSION.md`

---

## Risks

| Risk | Severity | Mitigation |
|------|----------|------------|
| **Power users miss metrics on load** | Medium | Advanced plan one click; remember expanded preference in localStorage |
| **Scope creep into comic editor** | High | Phase B owns pages; Phase A only “Ready to create your comic” placeholder |
| **Comic entry scope** | Medium | Ship A4a–b before template seed; inline world create in A4c+ |
| **`updated_at` touch missed on some actions** | Low | Central helper `touchStory(storyId)` called from all mutating actions |
| **Story page performance** | Low | Finish path server-computed; bible bundle load unchanged but deferred below fold |
| **Redirect breaks deep links** | Low | Canonical URL remains world-nested; alias route is redirect-only |
| **Template chapters duplicate on re-run** | Medium | Template action idempotent or confirm dialog |

---

## Estimated effort

| Slice | Effort (1 dev) |
|-------|----------------|
| A1 Finish path + layout | 3–4 days |
| A2 Redirect + advanced collapse + terminology | 2–3 days |
| A3 Stories hub + `updated_at` | 2 days |
| A4 Make a comic + chapter templates | 3–4 days |
| A5 Look & feel + home resume + alias route | 2 days |
| A6 Contextual gaps + copy pass + QA | 2–3 days |
| **Total Phase A** | **~14–18 dev days (3–4 weeks)** |

Aligns with **Moderate** complexity in [IMPLEMENTATION_PHASES_V3.md](./IMPLEMENTATION_PHASES_V3.md).

---

## Explicit non-goals (Phase A)

- Comic pages, panels, templates grid editor (**Phase B**)
- Publish, draft/live, public reader (**Phase C**)
- Explore index changes (**Phase D**)
- Project, Scene, Asset entities (**Phase E**)
- AI structure assembly or generation (**Phase F**)
- Stripe, credits, marketplace, POD
- Replacing or renaming bible/graph/packet **internal** code — creator copy only
- Removing `StoryBibleView` — wrap and de-emphasize

---

## Success metrics (Phase A)

| Metric | Target |
|--------|--------|
| Post-create redirect rate | 100% of story creates land on story page |
| Stories with ≥1 character within 24h | Increase vs baseline |
| Stories with ≥1 chapter within 7d | Increase vs baseline |
| Founder “find next step” time | &lt; 5 seconds on story page |
| Support tickets “what do I do after creating a story” | → 0 |

---

## Document index

| Doc | Role |
|-----|------|
| [IMPLEMENTATION_PHASES_V3.md](./IMPLEMENTATION_PHASES_V3.md) | Phase A–H overview |
| [LINKING_WORKFLOW_AUDIT.md](./LINKING_WORKFLOW_AUDIT.md) | Phase 2B baseline |
| [TESTING_CHECKLIST_V1.md](./TESTING_CHECKLIST_V1.md) | Regression base |
| [UX_BUGS_AND_CONFUSION.md](./UX_BUGS_AND_CONFUSION.md) | Issue log during A |

---

## Version

| Version | Date | Notes |
|---------|------|-------|
| 1.0 | 2026-06-14 | Initial Phase A plan — audit + UI/routes/components/DB + checkpoints |
| 1.1 | 2026-06-14 | Founder review — Create→Finish language, Comic entry, section audit, finish path FTUE |
