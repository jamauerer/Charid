# World De-emphasis — Implementation Plan

**Status:** Planning only — no implementation yet  
**Date:** 2026-06-14  
**Authority:** [PROJECT_FIRST_CREATIVE_STUDIO_V1.md](./PROJECT_FIRST_CREATIVE_STUDIO_V1.md) (locked product direction)  
**Prerequisite for:** [PROJECT_WORKSPACE_V1_IMPLEMENTATION_PLAN.md](./PROJECT_WORKSPACE_V1_IMPLEMENTATION_PLAN.md)  
**Out of scope:** Canon V1, Continuity V1, schema migrations, URL migrations, public portfolio URL changes

---

## Purpose

Remove **World** as a required creator concept while **preserving all existing data and URLs**.

Creators should think in **projects → stories → scenes → characters**. Setting (locations, mood, place rules) appears **progressively** — collapsed under **Setting**, unlocked when useful — not as a mandatory setup step before writing.

**Hard constraints:**

| Constraint | Rule |
|------------|------|
| **Data** | No destructive migration. Existing `worlds`, `stories.world_id`, `story_worlds`, bible tables stay intact. |
| **URLs** | Keep `/dashboard/worlds/[id]/stories/[storyId]` and public `/u/[username]/worlds/[slug]/...` working. |
| **Schema** | No `NOT NULL` changes in this plan. `stories.world_id` remains required at DB level. |
| **Infrastructure** | No Canon V1, Continuity V1, or new tables. Reuse existing actions and auto-provisioning. |

**Exit criterion:** A new creator can start a novel project, create a story, and land in the story workspace **without ever seeing or choosing a World**.

---

## Current-state audit

### Where World is forced on creators today

| Surface | File(s) | Problem |
|---------|---------|---------|
| Sidebar | `DashboardSidebar.tsx` | **Worlds** is a top-level nav peer of Projects |
| Create modal | `CreateModal.tsx` | Story flow: pick world first (`story-select-world`) |
| New story modal | `NewStoryModal.tsx` | Requires `worldId` prop |
| Story form | `StoryForm.tsx` | `createStory({ worldId, ... })` |
| Project wizard | `StartNewProjectWizard.tsx` | Start path `"world"`; worldbuilding intent defaults to world title |
| Project page | `ProjectWorldsSection.tsx`, `ProjectOverviewSection.tsx` | **Worlds** tab + stat card |
| Story cards | `StoryCard.tsx`, `ProjectStoriesSection.tsx` | Subtitle: *"in {world.name}"* |
| Story workspace | `StoryWorldHeader.tsx`, `StoryWorldSection.tsx` | Prominent world switcher |
| Home recent | `HomeCreativeMoments.tsx`, `home-studio.ts` | Story items subtitled with world name |
| Character create | `WorldSelectField.tsx` | Optional but exposed world picker |

### What stays internal (creators never need to know)

| Layer | Today | After |
|-------|-------|-------|
| `worlds` table | User-created setting container | **Auto-provisioned default setting** per project (internal) |
| `stories.world_id` | Required FK | Still required — populated automatically |
| `story_worlds` junction | Primary link backfilled | Unchanged |
| World bible / locations / maps | World-scoped features | Accessible via **Setting** section, not **Worlds** nav |
| Dashboard URLs | World-nested story paths | Unchanged — links generated from resolved `world_id` |
| Public portfolio | `/u/.../worlds/[slug]` | Unchanged |

### Existing helpers to reuse

| Helper | File | Use |
|--------|------|-----|
| `getOrCreateDefaultProject` | `src/app/actions/projects.ts` | Already creates "My Universe" per user |
| `resolveProjectIdForWorld` | `src/app/actions/projects.ts` | World → project resolution |
| `ensurePrimaryStoryWorldLink` | `src/app/actions/projects.ts` | Keeps `story_worlds` in sync |
| `createWorld` | `src/app/actions/worlds.ts` | Auto-provision setting container |
| `createStory` | `src/app/actions/stories.ts` | Still needs `worldId` — caller resolves it |

---

## Strategy: invisible default setting

Every project gets **at most one auto-managed setting record** (a `worlds` row) used as the internal anchor for story FKs, locations, and bible data.

```text
Creator sees:  Project → Story → Scenes
System stores: Project → [default setting world] → Story
```

**Naming convention for auto-provisioned worlds:**

| Project type | Auto setting name | Creator-facing label |
|--------------|-------------------|----------------------|
| Novel / Screenplay / Comic / Picture book | `{Project title} — Setting` or `{Project title}` | "Setting" in UI |
| Worldbuilding | User-named (existing flow) | "Setting" or user name |
| Exploring / Other | `{Project title} — Setting` | Collapsed until content exists |

Auto worlds are **not listed** on `/dashboard/worlds` index unless the project is `worldbuilding` intent or the world has user-visible content beyond the default shell.

---

## Phased implementation

### WD-1 — Copy and navigation (no schema, no action changes)

**Goal:** Stop advertising World as a primary concept.

| Task | File(s) | Change |
|------|---------|--------|
| WD-1.1 Demote sidebar Worlds | `DashboardSidebar.tsx` | Move **Worlds** below a divider under **All settings** or remove from primary nav; keep route alive |
| WD-1.2 Rename user-facing copy | Grep `World` in `src/components/`, `src/app/dashboard/` | **World** → **Setting** in labels, tab titles, empty states, stat cards |
| WD-1.3 Project overview footnote | `ProjectOverviewSection.tsx` | Remove *"open in dedicated workspaces"* admission; replace with project-first copy |
| WD-1.4 Project worlds tab label | `ProjectWorkspaceView.tsx` | Tab `worlds` → label **Setting** |
| WD-1.5 Story card subtitle | `StoryCard.tsx`, `ProjectStoriesSection.tsx` | Hide *"in {world}"* for auto-provisioned/default settings; show only when world has a user-chosen name distinct from project title |
| WD-1.6 Home recent subtitles | `home-studio.ts` | Same rule as story cards |
| WD-1.7 Create modal labels | `CreateModal.tsx` | Remove **World** as a quick-create option for non-worldbuilding users; keep for admin/power path if needed |

**Acceptance:**

- Sidebar no longer presents Worlds as equal to Projects
- No user-facing string says "create a world before your story" on novel/comic paths
- `/dashboard/worlds` still loads for bookmarks and Setting deep links

**Risk:** Low. Copy-only.

---

### WD-2 — Auto-provision default setting per project

**Goal:** Every project always has a resolvable setting world without creator action.

| Task | File(s) | Change |
|------|---------|--------|
| WD-2.1 New helper | `src/lib/project-setting.ts` (new) | `ensureProjectDefaultSetting(projectId): Promise<World>` — find existing auto world for project or create one |
| WD-2.2 Wire into project create | `src/app/actions/projects.ts` | After `createProject`, call `ensureProjectDefaultSetting` |
| WD-2.3 Backfill script | `scripts/backfill-project-default-settings.ts` (new, one-time) | For projects with zero linked worlds, create default setting; link existing orphan stories via `world_id` if needed |
| WD-2.4 Flag auto worlds | `worlds` row metadata | Use naming convention + optional `description` prefix `[auto]` or infer from `world.name === project.title + ' — Setting'` — **no new column in WD-2** |
| WD-2.5 Query filter | `getWorlds`, `DashboardWorldsView` | Index page shows user-created worlds + worldbuilding projects; hide pure auto shells |

**`ensureProjectDefaultSetting` logic:**

```text
1. SELECT worlds WHERE project_id = ? ORDER BY created_at LIMIT 1
2. IF found → return
3. ELSE createWorld({ name: project.title + ' — Setting', projectId, description: null })
4. RETURN world
```

**Acceptance:**

- Every project has ≥1 world row linked via `worlds.project_id`
- Existing projects backfilled without data loss
- Auto worlds hidden from `/dashboard/worlds` grid unless worldbuilding intent

**Risk:** Medium. Requires careful backfill; test on founder account with California Coast Surf Stories.

---

### WD-3 — Story creation without world picker

**Goal:** Story create flows use project context; world resolved internally.

| Task | File(s) | Change |
|------|---------|--------|
| WD-3.1 New action wrapper | `src/app/actions/stories.ts` | `createStoryForProject({ projectId, title, ... })` → calls `ensureProjectDefaultSetting` → `createStory({ worldId, projectId, ... })` |
| WD-3.2 Story form | `StoryForm.tsx` | Accept `projectId` instead of required `worldId`; pass to new wrapper |
| WD-3.3 Create modal | `CreateModal.tsx` | Story path: pick **project** (or use current project context) → story form; remove `story-select-world` step for default intents |
| WD-3.4 New story modal | `NewStoryModal.tsx` | When opened from project page, use `projectId` only |
| WD-3.5 Project wizard | `StartNewProjectWizard.tsx` | Story start path: create story via project wrapper; redirect to story workspace using resolved `world_id` in URL |
| WD-3.6 World page story create | `NewStoryModal.tsx` on world page | Keep existing behavior for power users / worldbuilding |

**Acceptance:**

- Create story from project page or wizard: zero world selection steps
- Redirect lands at `/dashboard/worlds/{autoWorldId}/stories/{storyId}` — URL preserved
- Story create from world page still works

**Risk:** Medium. Touch create flows; regression-test all entry points.

---

### WD-4 — De-emphasize world in story workspace

**Goal:** Story workspace reads as project-first; setting is secondary.

| Task | File(s) | Change |
|------|---------|--------|
| WD-4.1 Context trail | `CreatorContextTrail.tsx` | Order: **Project → Story**; setting as tertiary link or collapsed |
| WD-4.2 World header | `StoryWorldHeader.tsx` | Collapse behind **Setting** accordion; hide change-world for auto settings |
| WD-4.3 Story setting panel | `StorySettingPanel.tsx` | Rename section **Setting**; empty state: *"Add a location when a scene needs a place"* |
| WD-4.4 Change world UI | `StoryWorldSection.tsx` | Visible only for `worldbuilding` intent or when project has multiple linked worlds |

**Acceptance:**

- Story workspace above-the-fold shows Project + Story, not World
- Setting panel collapsed by default for novel/comic with no locations

**Risk:** Low–medium. UI-only; depends on WD-2 auto-world detection.

---

### WD-5 — Project wizard alignment

**Goal:** New project flows match project-first mental model.

| Task | File(s) | Change |
|------|---------|--------|
| WD-5.1 Start paths | `StartNewProjectWizard.tsx` | Remove `"world"` as default start path for non-worldbuilding intents |
| WD-5.2 Worldbuilding intent | Same | Keep explicit setting creation; label **Setting** not **World** |
| WD-5.3 Post-create routing | Same | Non-worldbuilding → project page; worldbuilding → setting workspace |

**Acceptance:**

- Wizard for Novel offers: describe idea / character / story — not world
- Worldbuilding project type still supports rich setting setup

**Risk:** Low.

---

## Explicit non-goals (this plan)

| Item | Why deferred |
|------|--------------|
| Nullable `stories.world_id` | Requires migration + RLS rewrite; not needed if auto-provision works |
| Project-scoped story URLs (`/dashboard/projects/.../stories/...`) | URL migration; preserve existing links |
| Public portfolio restructure | `/u/.../worlds/...` stays |
| Merging world bible into project table | Major infrastructure |
| Secondary/visited worlds UI (`story_worlds` roles) | Not required for project-first validation |
| Canon / Continuity systems | Locked for later |

---

## Testing checklist

| Scenario | Expected |
|----------|----------|
| New user → wizard → Novel → story | Lands in story workspace; never saw world picker |
| Existing project with linked world | All links work; no duplicate auto world created |
| California Coast Surf Stories | Stories still open at same URLs |
| Worldbuilding project | Full setting workspace accessible; appears in Setting section |
| Create story from `/dashboard/worlds/[id]` | Still works |
| Public portfolio world page | Unchanged |
| Character create | No required world; optional setting link hidden for auto worlds |
| Backfill script on prod-like data | Zero orphaned stories; no duplicate worlds per project |

---

## Rollout order

```text
WD-1 (copy/nav)     → ship first; zero risk
WD-2 (auto setting) → ship with backfill; enables WD-3
WD-3 (create flows) → highest user impact
WD-4 (story WS)     → can parallel WD-3 after WD-2
WD-5 (wizard)       → after WD-3
```

**Suggested checkpoint:** Tag `v0.9.0-project-first-alpha` after WD-3 passes founder test.

---

## Founder test (must pass before Project Workspace V1)

> Create **California Coast Surf Stories** (Novel) → add story **How I Surf** → add a scene — without ever creating or selecting a World.

Existing founder data: open project → continue story → URLs unchanged.

---

## File index (touch list)

| Phase | Primary files |
|-------|---------------|
| WD-1 | `DashboardSidebar.tsx`, `CreateModal.tsx`, `ProjectWorkspaceView.tsx`, `ProjectOverviewSection.tsx`, `StoryCard.tsx`, `ProjectStoriesSection.tsx`, `home-studio.ts` |
| WD-2 | `project-setting.ts` (new), `projects.ts`, `worlds.ts`, backfill script |
| WD-3 | `stories.ts`, `StoryForm.tsx`, `NewStoryModal.tsx`, `CreateModal.tsx`, `StartNewProjectWizard.tsx` |
| WD-4 | `CreatorContextTrail.tsx`, `StoryWorldHeader.tsx`, `StorySettingPanel.tsx`, `StoryWorldSection.tsx` |
| WD-5 | `StartNewProjectWizard.tsx` |
