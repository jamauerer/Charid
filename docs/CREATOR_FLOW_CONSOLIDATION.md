# Creator Flow Consolidation

**Status:** Proposal — **no implementation in this document**  
**Date:** 2026-06-14  
**Goal:** Reduce friction when building a story  
**Authority:** [FOUNDER_TESTING_ROUND_2.md](./FOUNDER_TESTING_ROUND_2.md) · [SCENE_ARCHITECTURE_V2.md](./SCENE_ARCHITECTURE_V2.md) · [SCENE_IMPLEMENTATION_DIRECTIVES.md](./SCENE_IMPLEMENTATION_DIRECTIVES.md) · [STORY_WORKSPACE_V3.md](./STORY_WORKSPACE_V3.md)

---

## Executive summary

Round 2 proved that **Scenes are the first UI that feels like storytelling** — but everything around them still feels like database navigation. Creators can describe what happens; they cannot easily answer *where am I*, *what should I do next*, or *how do chapters relate to scenes*.

This phase **consolidates what already exists**. It does not introduce new architecture, AI systems, marketplace, discovery, or payments. It reorganizes navigation, copy, section order, and finish-path logic so the mental model **`Project → Story → Scene`** is visible in daily use.

**North star:** A creator opens one story and stays in flow — building beats, linking cast, glancing at setting — without losing project context or guessing whether to use chapters or scenes.

---

## Constraints (hard)

| Do | Do not |
|----|--------|
| Reorder and relabel story workspace sections | Add Marketplace, Discovery, Stripe |
| Extend breadcrumbs and in-page nav | New AI providers, models, or suggestion pipelines |
| Update finish path to include scenes | Project rollup tabs (Locations, Maps, Moodboards on Project) |
| Clarify chapter vs scene with creator copy | Move worldbuilding into Project workspace |
| Wire existing scene reorder if schema supports it | Big-bang URL migration (optional later) |
| Surface project name on story/chapter/scene pages | Duplicate data or new tables for this phase |
| Consolidate duplicate AI entry points (UI only) | Silent AI commit paths |

---

## Current state (as shipped)

### Hierarchy in data vs UI

| Layer | Schema / actions | Creator-facing URL / nav |
|-------|------------------|---------------------------|
| **Project** | `projects`, project workspace tabs | `/dashboard/projects/[id]` |
| **Story** | `stories`, `project_id` | `/dashboard/worlds/[worldId]/stories/[storyId]` ← **world-nested** |
| **Scene** | `scenes`, `scene_characters`, S2 suggestions | Story page `#story-scenes`; optional `/scenes/[sceneId]` |
| **Chapter** | `chapters` | Separate full page: `.../chapters/[chapterId]` |

### Story page scroll order (today)

```
Welcome banner (if ?welcome=1)
→ What's next (finish path)     ← chapter-centric
→ Chapters
→ Scenes                        ← after chapters; cast dependency below fold
→ Cast & Connections
→ Setting (locations, map, mood)
→ Advanced plan / Story Bible
→ Edit details
```

### Finish path logic (today)

[`resolveStoryFinishPath`](../src/lib/story-finish-path.ts) never references scenes:

1. No chapters → scroll to **Add your first chapter**
2. No cast → scroll to **Add characters**
3. Comic + chapter + cast → disabled “Ready to create your comic”
4. Else → **Continue your story** (chapter editor link)

Scenes are invisible to “What’s next.”

### Creation entry points (today)

- **Sidebar:** Home · Projects · Stories · Characters · Worlds · Create
- **Create modal:** Start New Project wizard **or** quick-add Character / World / Story
- **Project workspace:** Stories tab links to world-nested story URLs
- **Story create:** Requires picking a world before story exists

### Round 2 severity (recap)

| Area | Severity | Consolidation target |
|------|----------|----------------------|
| Navigation | **High** | Project context + shorter wayfinding |
| Story organization | **High** | Chapter vs scene clarity |
| Scene workflow | Medium | Order, cast-before-scenes, single AI surface |
| Finish path | **High** | Scene-aware, format-aware |
| Publishing | **High** | Acknowledge gap in copy only — **not in scope to ship publish** |

---

## Target creator mental model

```
Project                    ← “My surf book” (container for one finished work)
└ Story                    ← “How I Surf” (where I work every day)
   ├ Scenes                ← What happens (primary spine for most formats)
   ├ Chapters              ← Optional: prose blocks / issues / grouping
   ├ Cast                  ← Who (feeds scenes)
   └ Setting               ← Where (feeds scenes)
```

**Worlds** remain settings libraries — linked from Story and Project, not parents of the narrative.

**One sentence for creators:** *Scenes are the beats of your story; chapters are optional containers for longer prose or issues.*

---

## Audit findings & proposals

### 1. Project → Story → Scene flow

#### Friction observed

- After creating a story from a **project**, navigation lands on a **world-nested** URL — project context disappears immediately.
- **Two creation philosophies:** Start New Project vs sidebar Create → Story — same entities, different paths.
- Project overview shows story/character/world counts — **not scenes or chapters**.
- No “continue last story” from project overview.

#### Proposal: **Context trail, not URL rewrite (Phase C1)**

Keep existing routes for this phase. Add **persistent project context** on all story-adjacent pages:

```
Breadcrumb:  California Coast Surf Stories  ·  How I Surf
             ↑ project link                  ↑ current story (you are here)
Subline:     in California Coast (world) — optional, de-emphasized
```

| Surface | Change |
|---------|--------|
| Story page header | Replace `← Stories · World name` with **Project · Story** when `story.project_id` resolves |
| Chapter editor | Same breadcrumb strip + **Back to story** (not only back to world) |
| Scene detail page (if kept) | Same strip; default workflow stays inline on story page |
| Project → Stories tab | Row shows **scene count + chapter count**; primary action **Open story** |
| Project overview | Add read-only stats: `N scenes · M chapters` aggregated across project stories |
| Home / continue hero | Prefer **last-opened story** within default or named project when available |

**Deferred:** Primary URL `/dashboard/projects/[pId]/stories/[sId]` with redirects — aligns with SCENE_ARCHITECTURE_V2 but explicitly **non-blocking** per directives.

#### Proposal: **Single recommended entry (Phase C1 copy + UI)**

- **First-time:** Start New Project wizard remains primary CTA on Home.
- **Returning:** Home continue row opens **project’s active story**, not global Stories list.
- Sidebar **Stories** list: show project name under each story title (metadata line).
- Do **not** remove global lists in this phase — add context labels, not new homes.

---

### 2. Chapter vs Scene clarity

#### Friction observed

- Both appear on the same page with no explained division of labor.
- Finish path says chapters are the spine; scenes feel like an optional extra.
- Chapter prose lives on a **separate page**; scenes stay on story hub — parallel lists with no structural link in UI (`chapter_id` in schema, unused in S1).
- Chapter-scoped “generate scenes” exists but output feels identical to generic generate.

#### Proposal: **Format-aware guidance block (Phase C1)**

One compact **“How this story is built”** callout at top of story workspace (below header, above What’s next). Content driven by `stories.project_type`:

| Format | Primary spine | Chapters mean | Scenes mean |
|--------|---------------|---------------|-------------|
| **Graphic novel / Children’s book** | Scenes | Optional issue/group | Visual beats — **start here** |
| **Novel** | Scenes + prose | Where you write full text | Beats / outline before or while writing |
| **Film / animation** | Scenes | Usually unused | Screen beats in order |
| **Default** | Scenes | Optional sections | Moments in your story |

Copy example (comic):

> **Scenes are your story.** Each scene is a moment — who’s there, what happens, where. Chapters are optional if you want to group scenes or write longer text.

**No new fields.** Pure copy + conditional visibility.

#### Proposal: **Rename sections for clarity (Phase C1)**

| Current label | Proposed label |
|---------------|----------------|
| Chapters | **Chapters** (subtitle: “Longer text — optional”) |
| Scenes | **Scenes** (subtitle: keep [`CREATOR_STORY.scenesHint`](../src/lib/creator-vocabulary.ts)) |
| Advanced plan | **Story plan (advanced)** — collapsed by default |

#### Proposal: **Chapter ↔ scene relationship (Phase C2)**

Without new schema in C1:

- Show chapter list item with **“N scenes”** when `chapter_id` grouping ships (S3).
- Until then: optional **“Related chapter”** read-only hint on scene card if creator manually aligns names — **skip in C1**.

Chapter editor footer: link **“View scenes for this story →”** back to story `#story-scenes`.

---

### 3. Story workspace hierarchy

#### Friction observed

- Page is long; dependencies misordered: **Scenes before Cast**, but scenes require cast.
- Setting and Cast are **below** Scenes — creator hits cast gate late.
- Story Bible competes with Scenes for “where is the plan?”
- V3 aggregates (map, moodboard) add scroll depth below scenes.

#### Proposal: **Story Workspace V4 layout (Phase C1)**

Reorder for **dependency + narrative flow**, without removing V3 surfaces:

```
┌─────────────────────────────────────────────────────────────┐
│ Header · status · Project · Story breadcrumbs               │
├─────────────────────────────────────────────────────────────┤
│ Format guidance (1 line + expandable “Learn more”)          │
├─────────────────────────────────────────────────────────────┤
│ What's next (finish path) — scene-aware                     │
├─────────────────────────────────────────────────────────────┤
│ STORY SPINE (new grouping label)                            │
│   Scenes          ← move up; primary list                   │
│   Chapters        ← below scenes for comic-first formats    │
├─────────────────────────────────────────────────────────────┤
│ CAST & CONNECTIONS  ← before setting; satisfies scene gate  │
├─────────────────────────────────────────────────────────────┤
│ SETTING           ← read aggregates (V3 unchanged)          │
├─────────────────────────────────────────────────────────────┤
│ Story plan (advanced) — collapsed                           │
├─────────────────────────────────────────────────────────────┤
│ Story details — collapsed or moved to header “⋯” later      │
└─────────────────────────────────────────────────────────────┘
```

**Format exception (Phase C1):** For `novel` project type only, allow **Chapters above Scenes** via same component order flag — one `storyWorkspaceSectionOrder(projectType)` helper, not two pages.

#### Proposal: **In-page section nav (Phase C1)**

Sticky subnav on desktop (horizontal chips); collapsible “Jump to” on mobile:

`Scenes · Chapters · Cast · Setting · Plan`

Uses existing `#story-scenes`, `#story-chapters`, `#story-characters`, `#story-setting` anchors. Surfaces hashes already referenced by finish path.

#### Proposal: **De-emphasize duplicate scene surface (Phase C2)**

- Story page = **canonical** scene list + inline edit.
- Scene detail route: keep for deep links / future references panel; remove duplicate suggestion panel there or redirect to story `#story-scenes`.

---

### 4. Scene ordering and organization

#### Friction observed

- Numbered cards imply order; **no reorder UI** (S2 in directives).
- Creation order ≠ narrative order.
- No scene count on project/story cards.
- Staging batch loss if creator clicks Generate twice.

#### Proposal: **Reorder controls (Phase C2 — uses existing `sort_order`)**

If S2 reorder actions exist or ship alongside consolidation:

- **Move up / Move down** on each scene card (not drag-first — simpler, mobile-safe).
- Optimistic UI + `sort_order` persist.
- Empty state copy: “Order is how readers will experience your story.”

#### Proposal: **Scene list as story flow (Phase C1)**

- Scene cards remain the visual spine — no table view.
- Add **read-only flow strip** above list when ≥3 scenes: truncated titles joined by `→` (pure presentation).
- Show **total scene count** in section header: `Scenes (4)`.

#### Proposal: **AI staging discipline (Phase C1 — UI only)**

- **One** “Get scene ideas” entry point on story page — remove duplicate generate from chapter helper **or** merge into single panel with chapter context selector.
- If active staging batch exists: **disable** top-level Generate; show “Review N suggestions below.”
- Confirm before **Clear all suggestions**.

No new AI — consolidate existing [`StoryScenesPanel`](../src/components/scene-workspace/StoryScenesPanel.tsx) + chapter suggest UI.

---

### 5. Navigation and breadcrumbs

#### Friction observed

- Six sidebar homes for one project.
- Breadcrumb: `Stories · World` — no project.
- Chapter editor: full navigation away from story.
- Scene has two paths (inline vs detail page).

#### Proposal: **Breadcrumb standard (Phase C1)**

Shared component `CreatorContextTrail`:

| Page | Trail |
|------|-------|
| Project workspace | `Projects · [Project title]` |
| Story | `[Project] · [Story title]` |
| Chapter editor | `[Project] · [Story] · [Chapter title]` |
| Scene detail (if used) | `[Project] · [Story] · [Scene title]` |

World name moves to **secondary line** under trail: “Setting: California Coast” linking to world workspace.

#### Proposal: **Sidebar context (Phase C2 — light touch)**

When user navigates from a project, set session hint (query param or cookie): `?fromProject=[id]`.

- Sidebar **Projects** item shows subtle “working in California Coast Surf Stories” subtitle until cleared.
- Do **not** hide global Stories/Characters/Worlds lists.

#### Proposal: **Chapter editor as overlay panel (Phase C3 — optional)**

Reduce full-page break:

- **C1 minimum:** Prominent “← Back to [Story title]” with project in label; after save, return to story not world.
- **C3 stretch:** Slide-over chapter editor on story page for short edits — **only if** effort stays small; not required for consolidation success.

---

### 6. Finish path visibility

#### Friction observed

- What's next always pushes **chapters first**.
- Scenes never appear in hints or primary CTA.
- Comic “draft ready” points to future page builder — dead end after scenes exist.
- Cast gate blocks scenes but finish path doesn't say “add cast **to create scenes**.”

#### Proposal: **Scene-aware finish path (Phase C1)**

Extend [`resolveStoryFinishPath`](../src/lib/story-finish-path.ts) inputs: `sceneCount`, keep `projectType`.

**Revised priority:**

```
1. No cast
   → Primary: "Add characters to your story" (#story-characters)
   → Hint: "You'll need at least one character to create scenes."

2. Cast ok, no scenes (all formats)
   → Primary: "Add your first scene" (#story-scenes) OR open create studio
   → Hint (novel + 0 chapters): "Or start writing in a chapter"

3. Scenes ok, novel, no chapters
   → Primary: "Add your first chapter" (#story-chapters)
   → Hint: "Scenes outline your beats; chapters hold your prose."

4. Has continue target
   → Primary: "Continue your story" (prefer last-edited: chapter OR scene — track in client localStorage for C1)
   → Hints: links to other section

5. Comic + ≥1 scene + cast (replace chapter-based comic_draft_ready)
   → Primary: "Add another scene" OR "Review your scene flow"
   → Hint: honest copy — "Page layout coming later; your beats are saved."
   → Remove disabled dead-end button
```

**Visual treatment:**

- What's next shows **checklist row**: `✓ 2 characters · ✓ 3 scenes · ○ 1 chapter` (counts only, not gamified badges).
- Primary button stays one clear action.

#### Proposal: **Publishing expectation copy (Phase C1 — honesty, not feature)**

When `sceneCount >= 1`, subtle info line under finish path:

> Your scenes are saved in your studio. Sharing to readers is coming soon — keep building your flow.

Addresses Round 2 publish gap **without** shipping publish MVP in this phase.

---

## Implementation phases

Sequential, each shippable independently:

| Phase | Scope | Effort | User-visible win |
|-------|--------|--------|------------------|
| **C1a** | Breadcrumbs (`CreatorContextTrail`), project name on story/chapter pages | Small | “I know where I am” |
| **C1b** | Story workspace reorder: Scenes → Chapters → Cast → Setting; section subnav | Medium | Less scroll, cast before scene gate |
| **C1c** | Format guidance callout + section subtitle copy | Small | Chapter vs scene clarity |
| **C1d** | Finish path v2 (scene-aware + checklist counts) | Medium | What's next matches real workflow |
| **C1e** | Consolidate AI generate entry points + staging guardrails | Small | Less accidental batch loss |
| **C2a** | Scene reorder (up/down) if `sort_order` API ready | Medium | Narrative order control |
| **C2b** | Project/story cards show scene + chapter counts | Small | Progress visible at a glance |
| **C2c** | Scene detail dedupe — story page canonical | Small | One scene workflow |
| **C3** | Chapter editor slide-over (optional) | Large | Prose without leaving story |

**Recommended first PR:** C1a + C1d + C1b (navigation context + finish path + reorder sections).

---

## Component map (planned changes)

| Component / module | Change |
|--------------------|--------|
| `CreatorContextTrail` | **New** — shared breadcrumbs |
| `StoryDetailPage` | Wire trail; pass `project` into layout |
| `ChapterEditorPage` | Wire trail; back link to story |
| `resolveStoryFinishPath` | Add scenes + format branches |
| `StoryFinishPath` | Checklist counts UI |
| `StoryScenesPanel` | Move up in page; header count; single AI entry |
| `StoryChaptersPanel` | Subtitle; back-links |
| `StoryFormatGuide` | **New** — small callout by `project_type` |
| `StorySectionNav` | **New** — anchor chips |
| `ProjectOverviewSection` | Scene/chapter aggregate counts |
| `ProjectStoriesSection` | Scene count per story row |

**No new server actions required for C1** except optional `getProjectStoryStats(projectId)` aggregating existing scene/chapter queries.

---

## Out of scope (this phase)

Explicitly excluded per product direction:

- Marketplace, Discovery, Stripe, billing
- New AI models, providers, or suggestion algorithms
- Publishing MVP, public scene reader, “Publish story” action
- Project tabs for Locations / Maps / Moodboards
- URL migration to project-scoped story routes (optional follow-on)
- Scene ↔ chapter FK UI (awaits S3 schema usage)
- Comic page builder, export, print
- Drag-and-drop scene reorder (up/down sufficient for C2)
- Auto-updating story status badge from progress

---

## Success criteria

Founder / creator can:

1. Open **How I Surf** from **California Coast Surf Stories** and always see **project name** in the header trail.
2. Explain in one breath: “Scenes are my beats; chapters are optional prose.”
3. Follow **What's next** to add cast, then a scene, **without** being told to add a chapter first (comic path).
4. Jump to Scenes / Cast / Setting via subnav without long scroll.
5. Build 3 surf scenes, reorder them, and read the list as a coherent flow.
6. Not lose an in-progress AI suggestion batch by accidentally clicking Generate again.
7. Understand that scenes are **studio-only** until publish ships — no false “Share” affordance.

---

## Open questions (resolve before C1 implementation)

| # | Question | Recommendation |
|---|----------|----------------|
| 1 | Novel: Chapters above Scenes or unified Scenes-first with hint? | Scenes-first + finish path nudges to chapter when scenes exist |
| 2 | Keep scene detail page? | Yes, but strip duplicate AI; story page canonical |
| 3 | Track “continue” by last edited chapter vs scene? | localStorage `charid-last-story-focus` for C1; server later |
| 4 | Empty cast: block scene create or inline add? | C1: keep block; finish path + cast section moved up mitigates |
| 5 | When `project_id` null (legacy story)? | Trail falls back to `Stories · World · Story` |

---

## Related documents

| Doc | Role |
|-----|------|
| [FOUNDER_TESTING_ROUND_2.md](./FOUNDER_TESTING_ROUND_2.md) | Evidence base |
| [SCENE_ARCHITECTURE_V2.md](./SCENE_ARCHITECTURE_V2.md) | Scene-first model; URL migration deferred |
| [SCENE_IMPLEMENTATION_DIRECTIVES.md](./SCENE_IMPLEMENTATION_DIRECTIVES.md) | Binding rules; no project rollups |
| [STORY_WORKSPACE_V3.md](./STORY_WORKSPACE_V3.md) | V3 aggregates preserved in V4 layout |
| [PUBLISHING_MVP_ARCHITECTURE.md](./PUBLISHING_MVP_ARCHITECTURE.md) | Future; copy-only acknowledgment now |

---

## Version

| Version | Date | Notes |
|---------|------|-------|
| 1.0 | 2026-06-14 | Creator Flow Consolidation proposal — pre-implementation |
