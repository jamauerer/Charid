# Project Workspace V1 — Implementation Plan

**Status:** Planning only — no implementation yet  
**Date:** 2026-06-14  
**Authority:** [PROJECT_WORKSPACE_V1.md](./PROJECT_WORKSPACE_V1.md) (design proposal) · [PROJECT_FIRST_CREATIVE_STUDIO_V1.md](./PROJECT_FIRST_CREATIVE_STUDIO_V1.md) (locked direction)  
**Prerequisite:** [WORLD_DEEMPHASIS_IMPLEMENTATION_PLAN.md](./WORLD_DEEMPHASIS_IMPLEMENTATION_PLAN.md) WD-1 minimum; WD-2–WD-3 recommended before PW-2  
**Out of scope:** Canon V1, Continuity V1, new DB tables, project-scoped story URLs, AI on project page, Structure tree (PW-5)

---

## Purpose

Replace the tabbed **entity browser** at `/dashboard/projects/[projectId]` with a **single-screen creative command center** that answers:

1. What exists?
2. What is missing?
3. What should I work on next?
4. How complete is this project?
5. Where do I click to continue?

**Validate project-first workflow** before building Canon, Continuity, or other major systems.

**Hard constraints:**

| Constraint | Rule |
|------------|------|
| **Route** | Keep `/dashboard/projects/[projectId]` — no URL migration |
| **Deep links** | Story/scene/character/setting URLs unchanged |
| **Data** | Reuse existing actions; aggregate counts in queries or page loader |
| **Scope** | PW-1 through PW-4 only in this plan (PW-5 tree, PW-6 full nav overhaul deferred) |

**Exit criterion (founder test):**

> Open **California Coast Surf Stories** → within 5 seconds state project type, what exists (characters, stories, scenes, locations), what to do next, and where to click to continue **How I Surf**.

---

## Current-state audit

### Shipped today (`v0.8`)

| Piece | File | State |
|-------|------|-------|
| Project page route | `src/app/dashboard/projects/[projectId]/page.tsx` | Lazy-loads tab data |
| Tabbed workspace | `ProjectWorkspaceView.tsx` | 5 tabs: Overview · Stories · Characters · Worlds · Relationships |
| Overview | `ProjectOverviewSection.tsx` | Cover hero + 4 stat cards; no scenes, no guidance |
| Tab sections | `ProjectStoriesSection.tsx`, `ProjectCharactersSection.tsx`, `ProjectWorldsSection.tsx`, `ProjectRelationshipsSection.tsx` | Entity lists with deep links |
| Data | `projects.ts` | `getProjectById`, `getProjectStories`, etc.; counts only — no scene/location rollups |
| Home continue | `HomeContinueHero.tsx` | Links to project page, not concrete next action |

### Missing (design doc, not in codebase)

| Piece | Analog in story workspace |
|-------|---------------------------|
| `resolveProjectFinishPath` | `src/lib/story-finish-path.ts` |
| `ProjectWhatsNext` | `StoryFinishPath.tsx` |
| `ProjectFormatGuide` | `StoryFormatGuide.tsx` |
| `ProjectRoadmapSection` | Story workspace accordions |
| Scene/location rollups | — |
| Format-aware section order | — |

---

## Target layout (Option C — Hybrid)

Single scroll page, top → bottom:

```text
1. Header (title, work_intent, compact cover, setting line)
2. What's next (primary CTA + hints)
3. Progress snapshot (checklist)
4. Expandable roadmap (accordion sections)
5. [PW-5 later] View structure →
```

Wireframe: see [PROJECT_WORKSPACE_V1.md § Wireframe](./PROJECT_WORKSPACE_V1.md).

---

## Phased implementation

### PW-1 — Roadmap shell (layout migration)

**Goal:** Replace tab bar with single scroll + accordions. Same data, new presentation.

| Task | File(s) | Change |
|------|---------|--------|
| PW-1.1 New shell component | `ProjectWorkspaceView.tsx` | Remove horizontal tabs; render vertical scroll layout |
| PW-1.2 Accordion primitive | `ProjectRoadmapSection.tsx` (new) | Reusable collapsible section: header (title, count, + action), body slot, default expanded/collapsed |
| PW-1.3 Migrate tab content | Existing `Project*Section.tsx` | Wrap each in `ProjectRoadmapSection`; no logic changes |
| PW-1.4 Rename Worlds section | `ProjectWorldsSection.tsx` | Header: **Setting**; show world count + location count placeholder (0 until PW-3) |
| PW-1.5 Hash / query compat | `ProjectWorkspaceView.tsx` | `?tab=stories` → scroll to `#project-stories`; `?tab=worlds` → `#project-setting` |
| PW-1.6 Page loader | `projects/[projectId]/page.tsx` | Load all section data upfront (same as today across tabs) or lazy on first expand — start with upfront for simplicity |
| PW-1.7 Remove overview tab | `ProjectOverviewSection.tsx` | Fold cover into header; stat cards move to section headers + checklist (PW-2) |

**Section IDs (hash anchors):**

| Section | ID |
|---------|-----|
| Characters | `#project-characters` |
| Stories | `#project-stories` |
| Scenes | `#project-scenes` |
| Setting | `#project-setting` |
| Connections | `#project-connections` |
| Notes | `#project-notes` |

**Default expansion rules:**

- Expand sections with content
- Collapse empty Connections, Notes
- On first open after wizard: expand section matching `start_path`

**Acceptance:**

- No horizontal tab bar
- All existing deep links from section rows still work
- `?tab=` bookmarks scroll to correct section
- Mobile: single column, full-width section headers

**Estimate:** 1–2 sessions. Low risk — presentation only.

---

### PW-2 — Command center (What's next + checklist)

**Goal:** Project-level guidance mirroring story finish path.

| Task | File(s) | Change |
|------|---------|--------|
| PW-2.1 Finish path resolver | `src/lib/project-finish-path.ts` (new) | `resolveProjectFinishPath(input)` — see logic below |
| PW-2.2 What's next panel | `ProjectWhatsNext.tsx` (new) | Primary CTA button + 1–2 hint links; reuse `StoryFinishPath` visual language |
| PW-2.3 Progress snapshot | `ProjectProgressSnapshot.tsx` (new) | Compact checklist row from resolver output |
| PW-2.4 Wire into page | `ProjectWorkspaceView.tsx` | Render below header, above roadmap |
| PW-2.5 Aggregated counts query | `projects.ts` | `getProjectProgressCounts(projectId)` → `{ characterCount, storyCount, sceneCount, chapterCount, locationCount, relationshipCount }` |
| PW-2.6 Home continue upgrade | `HomeContinueHero.tsx`, `home-page.ts` | Use finish path primary action when resolvable — e.g. "Continue How I Surf" → story workspace |

**`resolveProjectFinishPath` input:**

```typescript
{
  workIntent: ProjectWorkIntent;
  stories: Array<{ id; title; worldId; sceneCount; chapterCount; updatedAt }>;
  characterCount: number;
  sceneCount: number;      // rollup
  chapterCount: number;    // rollup
  locationCount: number;   // rollup
  hasCover: boolean;
  startPath?: ProjectStartPath;
}
```

**Primary step priority (default novel/comic):**

```text
1. No characters AND no stories → "Start with a character or story" (respect start_path)
2. Story exists, zero scenes → "Add first scene in {story.title}"
3. Scenes exist, zero chapters (novel) → "Add first chapter" OR "Keep adding scenes"
4. Has in-progress story → "Continue {story.title}" (most recently updated)
5. Strong progress → "Add scene" / "Review cast" hints
```

**Checklist items (format-aware):**

| work_intent | Checklist |
|-------------|-----------|
| novel | Characters · Scenes · Chapters · Cover |
| screenplay | Characters · Scenes · Locations · Cover |
| comic / picture_book | Characters · Scenes · Cover |
| worldbuilding | Characters · Locations · Maps* · Cover |
| exploring | Characters · Scenes (permissive, minimal) |

\*Maps = placeholder until feature exists (count 0, optional)

**Acceptance:**

- Primary CTA is always one button with a concrete href
- Checklist reflects real counts from DB
- Empty project shows wizard-respecting first step
- Home "Continue" can deep-link to story workspace when that's the next step

**Estimate:** 2 sessions. Medium — new logic, query work.

---

### PW-3 — Rollups (scenes, locations)

**Goal:** Project page shows cross-story scene and location visibility.

| Task | File(s) | Change |
|------|---------|--------|
| PW-3.1 Scene rollup query | `projects.ts` | `getProjectSceneRollup(projectId)` → scenes grouped by story, sorted by `updated_at`, limit 5 for preview |
| PW-3.2 Scenes section | `ProjectScenesSection.tsx` (new) | Accordion: aggregated list, "View in story →" links to `#story-scenes` |
| PW-3.3 Location count query | `projects.ts` | Count `world_locations` across project's worlds |
| PW-3.4 Setting section header | `ProjectWorldsSection.tsx` | Show `{n} worlds · {m} locations` in collapsed preview |
| PW-3.5 Setting line in header | `ProjectWorkspaceHeader.tsx` (new) | *Setting: {primary world name}* — link to setting workspace; hide for auto-provisioned default (see World De-emphasis plan) |
| PW-3.6 Lazy fetch (optional) | `page.tsx` | If perf issue: load rollups only when Scenes section expands |

**Acceptance:**

- Founder project shows "4 scenes" across stories
- Scene preview rows link to correct story workspace anchor
- Location count visible in Setting section header

**Estimate:** 1–2 sessions. Medium — new queries.

---

### PW-4 — Format templates (type-driven workspace)

**Goal:** Novel vs Screenplay vs Worldbuilding feel different without new schema.

| Task | File(s) | Change |
|------|---------|--------|
| PW-4.1 Template config | `src/lib/project-workspace-template.ts` (new) | Map `ProjectWorkIntent` → section order, visibility, default expansion, checklist weights |
| PW-4.2 Apply template | `ProjectWorkspaceView.tsx` | Render sections in template order; hide sections marked `hidden` |
| PW-4.3 Format guide | `ProjectFormatGuide.tsx` (new) | Dismissible one-liner per type; mirror `StoryFormatGuide` localStorage key pattern |
| PW-4.4 Placeholder sections | `ProjectRoadmapSection.tsx` | Pages, Timeline, Culture, Illustrations — label + empty state only when template includes them |
| PW-4.5 Notes section | `ProjectNotesSection.tsx` (new) | Project description (existing field) + empty state for future freeform notes |

**Template matrix:** see [PROJECT_WORKSPACE_V1.md § Template matrix](./PROJECT_WORKSPACE_V1.md).

**Acceptance:**

- Novel project: Characters → Stories → Scenes → Chapters → Setting → Notes
- Worldbuilding: Characters → Setting (expanded) → Maps* → Notes
- Format guide dismisses per project and persists

**Estimate:** 1–2 sessions. Low–medium.

---

## Deferred (not in this plan)

| Phase | Scope | Why deferred |
|-------|-------|--------------|
| **PW-5** | Structure view (read-only tree drawer) | Nice-to-have; not required for founder test |
| **PW-6** | Sidebar IA overhaul (Stories/Characters/Worlds → "All …") | Partially covered by World De-emphasis WD-1 |
| **PW-AI** | Project-scoped suggestions | Requires Canon/Continuity foundations |
| **Continuity alerts on project page** | Zone 1–2 warnings | Continuity V1 not built |
| **Assets rollup** | Cross-entity image count | No unified asset query yet; show placeholder |

---

## Component architecture

```text
projects/[projectId]/page.tsx
└── ProjectWorkspaceView
    ├── ProjectWorkspaceHeader      (PW-1/3)
    ├── ProjectFormatGuide          (PW-4)
    ├── ProjectWhatsNext            (PW-2)
    ├── ProjectProgressSnapshot     (PW-2)
    └── ProjectRoadmapSection × N   (PW-1)
        ├── ProjectCharactersSection
        ├── ProjectStoriesSection
        ├── ProjectScenesSection    (PW-3)
        ├── ProjectWorldsSection    → Setting
        ├── ProjectRelationshipsSection
        └── ProjectNotesSection     (PW-4)
```

**New files:**

| File | Phase |
|------|-------|
| `src/lib/project-finish-path.ts` | PW-2 |
| `src/lib/project-workspace-template.ts` | PW-4 |
| `src/components/project/ProjectRoadmapSection.tsx` | PW-1 |
| `src/components/project/ProjectWorkspaceHeader.tsx` | PW-1/3 |
| `src/components/project/ProjectWhatsNext.tsx` | PW-2 |
| `src/components/project/ProjectProgressSnapshot.tsx` | PW-2 |
| `src/components/project/ProjectScenesSection.tsx` | PW-3 |
| `src/components/project/ProjectFormatGuide.tsx` | PW-4 |
| `src/components/project/ProjectNotesSection.tsx` | PW-4 |

---

## Data layer additions

| Function | Phase | Returns |
|----------|-------|---------|
| `getProjectProgressCounts(projectId)` | PW-2 | Aggregated counts for finish path |
| `getProjectSceneRollup(projectId, limit?)` | PW-3 | Scenes with story title, worldId, href |
| `getProjectLocationCount(projectId)` | PW-3 | Sum of locations across project worlds |

All implemented in `src/app/actions/projects.ts` using existing Supabase client patterns — **no migrations**.

---

## Mobile behavior

| Concern | Approach |
|---------|----------|
| Vertical space | What's next at top; sticky compact bar after scroll (optional PW-2.7) |
| Accordions | One section open at a time on `< md` (optional) |
| Lists | Max 4 inline items; "View all N" expands section |
| Touch | Full-width section headers; + action in header row |

---

## Testing checklist

| Scenario | Expected |
|----------|----------|
| Empty project (post-wizard) | What's next matches start_path; relevant section expanded |
| California Coast Surf Stories | Shows 3 characters, 1 story, 4 scenes, setting line |
| Primary CTA | Links to story workspace scene add or continue |
| `?tab=characters` legacy URL | Scrolls to characters section |
| Novel vs worldbuilding | Different section order and checklist |
| Mobile 375px | Readable, tappable, no horizontal scroll |
| Build | `npm run build` passes |
| No regression | Story/character/setting workspace links unchanged |

---

## Rollout order

```text
PW-1 (roadmap shell)     → ship; immediate UX win
PW-2 (command center)    → ship; founder test mostly passes
PW-3 (rollups)           → ship; completes founder test
PW-4 (format templates)  → ship; type differentiation

Parallel track: World De-emphasis WD-1 can ship anytime
WD-2/WD-3 should land before or with PW-2 for clean Setting/header behavior
```

**Suggested checkpoints:**

| Tag | After |
|-----|-------|
| `v0.9.0-project-first-alpha` | WD-3 + PW-2 |
| `v0.9.1-project-workspace` | PW-3 + PW-4 |

---

## Success criteria

From [PROJECT_WORKSPACE_V1.md](./PROJECT_WORKSPACE_V1.md):

Founder opens **California Coast Surf Stories** and within **5 seconds** can state:

1. What project this is and what type it is  
2. What exists (characters, stories, scenes, locations)  
3. What to do next (concrete action)  
4. Where to click to continue the story  

If the page still feels like a **database admin screen**, stop and simplify before adding features.

---

## Relationship to locked architecture

| System | This plan |
|--------|-----------|
| **Canon V1** | Not implemented. Existing bibles/context packets unchanged. |
| **Continuity V1** | Not implemented. No ⚠ alerts on project page. Checklist uses counts only. |
| **Canon Scope Precedence** | Not referenced in UI. |
| **World data model** | Unchanged. Setting section links to existing world workspace. |
| **Story workspace** | Unchanged. Project page links in via finish path. |

**Goal:** Validate that project-first presentation improves creator workflow **before** investing in hidden consistency infrastructure.
