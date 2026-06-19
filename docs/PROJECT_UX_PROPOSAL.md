# Project UX Proposal

**Date:** 2026-06-14  
**Status:** Approved direction — **proposal only, not yet implemented**  
**Prerequisite:** [Project Stage 1](./PROJECT_STAGE_1_IMPLEMENTATION_REPORT.md) (schema + workspace shipped)  
**Authority:** Founder UX adjustment — replace universe framing with finished-work framing

---

## Summary

CharID’s Project entity was introduced as a **universe container** (“My Universe”, “creative universe”, shared-IP examples). That framing is wrong for most creators.

**Correct framing:** A Project is **a container for everything needed to create a finished work.**

Creators may run **many unrelated projects** at once — a children’s dragon comic, a fantasy novel, a trainspotting hobby piece, a film script, and a picture book are **five separate projects**, not one mega-universe.

This document defines terminology, information architecture, creation flow, and a phased implementation plan. **No code changes until this proposal is signed off.**

---

## Problem

### What Stage 1 shipped

| Area | Current copy / behavior |
|------|-------------------------|
| Backfill | Default project titled **“My Universe”** (`slug: my-universe`) |
| `DEFAULT_PROJECT_TITLE` | `"My Universe"` in `src/types/project.ts` |
| Create modal | Project option: *“A workspace for your creative universe”* |
| Project workspace subtitle | *“Creative universe”* |
| Overview badge | *“Default universe”* |
| Empty states | *“Empty universe”*, *“relationships in one universe”* |
| Project form placeholder | *“A shared universe for your stories, characters, and worlds…”* |

### Why this fails

1. **Assumes one creator = one universe** — backfill merges all legacy content into a single default bucket.
2. **Confuses Project with World** — “universe” language makes World feel redundant or nested incorrectly.
3. **Confuses Project with output type** — `stories.project_type` (novel, graphic novel) is media format; Project is the **work container**.
4. **Hides the product promise** — creators think in **finished works** (“my comic”, “my novel”), not abstract universes.

---

## Definition

> **Project:** A container for everything needed to create a finished work.

### What a Project holds

```
Project
├ Stories          (live — multiple per project)
├ Characters       (live — shared cast across stories in this work)
├ Worlds           (live — multiple settings if the work needs them)
├ Relationships    (live — bonds between characters in this work)
├ Locations        (live via worlds — aggregated in project view)
├ Maps             (live via worlds — aggregated in project view)
├ Moodboards       (live via worlds — aggregated in project view)
├ Scenes           (future)
└ Assets           (future)
```

**Rules:**

- One creator → **many projects** (unrelated works stay separate).
- One project → **many stories, worlds, characters** (e.g. comic series + spin-off in same IP).
- Worlds remain **places/settings** inside a project — not substitutes for the project itself.
- Locations, maps, and moodboards stay **world-scoped in the database**; the project workspace **aggregates** them (same pattern as [Story Workspace V3](./STORY_WORKSPACE_V3_IMPLEMENTATION_REPORT.md)).

---

## Creator examples

These are **separate projects** for the same creator:

| Project title | What they’re making | Typical start |
|---------------|---------------------|---------------|
| **Children's Dragon Comic** | Graphic narrative | Character + bright world + moodboard |
| **Fantasy Novel** | Written novel | World + cast + story |
| **Trainspotting** | Photo / hobby documentation | Artwork / locations (future asset path) |
| **Film Script** | Screenplay | Story + characters |
| **Picture Book** | Illustrated children’s book | Character + moodboard + story |

None of these should be forced into **“My Universe”**.

---

## Terminology map

| Retire (universe framing) | Use instead (work framing) |
|---------------------------|----------------------------|
| My Universe | **My Studio** (backfill title) or prompt rename on first visit |
| Creative universe | **Creative project** / **Your project** |
| Default universe | **Default project** (or remove badge — see below) |
| Empty universe | **Empty project — add your first story, character, or world** |
| Organize your full creative universe | **Everything for one finished work, in one place** |
| Universe container | **Work container** |
| Name your creative universe | **Name your project** |

**Keep “universe” only where accurate:** marketing vision docs, multiverse IP examples (Marvel), world-level lore — never as the Project label.

**Naming collision guard:**

| Concept | Field / entity | Creator-facing label |
|---------|----------------|----------------------|
| Work container | `projects` table | **Project** |
| Output format | `stories.project_type` | **Story format** or **Work type** (in forms) |
| Setting | `worlds` table | **World** |

---

## Information architecture

### Sidebar (unchanged structure, updated copy)

```
Home
Projects          ← primary hub for finished works
Stories           ← global list (filtered by project where possible)
Characters
Worlds
```

Projects is the **home for a single work**. Global lists remain for power users but should show **project context** on cards (Phase 2).

### Project workspace tabs

**Phase A (terminology + creation flow):** keep existing tabs, fix copy.

| Tab | Content |
|-----|---------|
| Overview | Cover, counts, short definition, quick actions |
| Stories | All stories with `project_id` |
| Characters | All characters with `project_id` |
| Worlds | All worlds with `project_id` |
| Relationships | All bonds with `project_id` |

**Phase B (aggregated worldbuilding — read-only rollups):**

| Tab | Content |
|-----|---------|
| Locations | Cards from all worlds in project; deep-link to world location editor |
| Maps | Thumbnails from all worlds; deep-link to world map |
| Moodboards | Strips from all worlds; deep-link to world moodboard |

**Phase C (future):** Scenes, Assets tabs — disabled stubs matching Create modal pattern.

---

## Creation flow (approved)

Today: **Create → flat picker** (Character | World | Story | Project | Scene | Asset).

### Target flow

```
Create
  └─ Start New Project          ← primary path; replaces flat “Project” tile
       │
       ├─ Step 1: What are you creating?
       │     • Comic
       │     • Novel
       │     • Picture Book
       │     • Film / Screenplay
       │     • Worldbuilding Project
       │     • Not Sure Yet
       │
       └─ Step 2: How would you like to start?
             • Story
             • Character
             • World
             • Artwork
             • Let AI help organize my idea   (Coming Soon — disabled)
```

After both steps → **name the project** (title + optional cover) → **create first entity** pre-scoped to new `project_id` → land in **Project workspace**.

### Step 1 → data mapping

| UI choice | Stored on `projects` (new) | Default `stories.project_type` when Story start chosen |
|-----------|----------------------------|--------------------------------------------------------|
| Comic | `work_intent: comic` | `graphic_novel` |
| Novel | `work_intent: novel` | `novel` |
| Picture Book | `work_intent: picture_book` | `childrens_book` |
| Film / Screenplay | `work_intent: screenplay` | `film_animation` |
| Worldbuilding Project | `work_intent: worldbuilding` | *(none — no story required)* |
| Not Sure Yet | `work_intent: unset` | `other` or omit until first story |

**Schema note:** add nullable `work_intent text` on `projects` (check constraint or enum). Does **not** replace `stories.project_type`; it seeds the first story when relevant.

### Step 2 → routing

| Start choice | Action after project created |
|--------------|------------------------------|
| **Story** | If no world in project → mini-step “Create or pick a world” → StoryForm |
| **Character** | CharacterForm with `project_id` hidden field |
| **World** | WorldForm with `project_id` hidden field |
| **Artwork** | Route to new world (if none) → World moodboard upload **or** Character gallery upload; copy: *“Add reference art for this project”* |
| **AI organize** | Disabled chip: *“Coming soon — describe your idea and we’ll suggest structure”* |

### Secondary paths (retain for power users)

Inside an **existing** project workspace → **Add to project** menu:

- New Story · New Character · New World · Upload artwork

Global **Create** button (long term): collapses to **“Add to…”** when a project context is active (e.g. from project page). Home/sidebar Create remains **Start New Project** as primary.

---

## Backfill & default project migration

Existing users have **“My Universe”** from `20250702000000_project_stage_1.sql`.

### Recommended UX (no data loss)

1. **One-time rename prompt** on first visit to `/dashboard/projects` if `title = 'My Universe'` and `is_default = true`:
   - *“Your existing work lives here. What’s this project called?”*
   - Suggest: *“My Studio”*, *“Untitled Project”*, or free text.
2. **Server constant change:** `DEFAULT_PROJECT_TITLE` → `"My Studio"` for **new** default rows only.
3. **Optional SQL patch** (separate migration, not automatic): offer rename script for founders; do not mass-rename without creator action.

### `is_default` flag

Keep for **auto-assign** when creating entities without explicit project (legacy paths). Retire **“Default universe”** badge → **“Default project”** or hide badge entirely (default is an implementation detail, not identity).

---

## UI copy inventory (implementation checklist)

| File | Current | Proposed |
|------|---------|----------|
| `src/types/project.ts` | `DEFAULT_PROJECT_TITLE = "My Universe"` | `"My Studio"` |
| `CreateModal.tsx` | picker-first; Project tile with universe copy | **Start New Project** wizard; demote orphan Character/World/Story to “Add without project” or project-scoped submenu |
| `ProjectForm.tsx` | placeholder Middle-earth / shared universe | placeholder *“Children's Dragon Comic”* / *“Everything for this finished work…”* |
| `ProjectWorkspaceView.tsx` | “Creative universe” | *“Finished work in progress”* or omit subtitle |
| `ProjectOverviewSection.tsx` | “Default universe”, universe grouping copy | “Default project”; *“Stories, characters, and worlds for this project”* |
| `ProjectCard.tsx` | “Empty universe” | *“Empty project — start with a story, character, or world”* |
| `ProjectWorldsSection.tsx` | “places within this universe” | *“Settings and places for this project”* |
| `ProjectCharactersSection.tsx` | “this universe” | *“this project”* |
| `ProjectRelationshipsSection.tsx` | “this universe” | *“this project”* |
| `DashboardProjectsView.tsx` | “Name your creative universe” | *“Start a new project”* / *“Name your finished work”* |
| `supabase/migrations/20250702000000…` | backfill `'My Universe'` | new deploys only: `'My Studio'`; existing DBs use rename prompt |

---

## Wireframe (creation wizard)

```
┌─────────────────────────────────────────┐
│  Start New Project                  [×] │
│  A container for everything you need    │
│  to create a finished work.             │
├─────────────────────────────────────────┤
│  What are you creating?                 │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ │
│  │  Comic   │ │  Novel   │ │ Picture  │ │
│  │          │ │          │ │  Book    │ │
│  └──────────┘ └──────────┘ └──────────┘ │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ │
│  │  Film /  │ │Worldbuild│ │ Not Sure │ │
│  │Screenplay│ │ Project  │ │   Yet    │ │
│  └──────────┘ └──────────┘ └──────────┘ │
│                                         │
│  [ Back ]                    [ Continue ]│
└─────────────────────────────────────────┘

        ↓ Continue

┌─────────────────────────────────────────┐
│  How would you like to start?       [×] │
│  Project: Comic (editable title next)   │
├─────────────────────────────────────────┤
│  ○ Story      ○ Character               │
│  ○ World      ○ Artwork                 │
│  ○ Let AI help organize my idea (Soon)  │
│                                         │
│  Project title                          │
│  [ Children's Dragon Comic          ]   │
│                                         │
│  [ Back ]              [ Create & start ]│
└─────────────────────────────────────────┘
```

---

## Technical scope by phase

### Phase A — Terminology & wizard (ship first)

- [ ] Copy pass on all project components (table above)
- [ ] `CreateModal` refactor → **Start New Project** two-step wizard
- [ ] Pass `project_id` + optional `work_intent` through Character / World / Story forms
- [ ] Migration: `projects.work_intent` nullable column
- [ ] Rename prompt for legacy “My Universe” projects
- [ ] Update `DEFAULT_PROJECT_TITLE` / backfill string for new installs

**No schema break.** Existing `project_id` wiring from Stage 1 reused.

### Phase B — Project rollups (Locations / Maps / Moodboards)

- [ ] Server action: `getProjectWorldbuildingRollup(projectId)` (mirror story-workspace pattern)
- [ ] Project tabs: Locations, Maps, Moodboards (read aggregations + deep links)
- [ ] Overview section: mini-previews of setting assets

### Phase C — Polish

- [ ] Project badge on Story / Character / World global list cards
- [ ] Filter global lists by active project
- [ ] **AI organize** entry (when product ready)
- [ ] Scenes / Assets stubs → real tabs when architecture lands

---

## Out of scope (this proposal)

- Changing `stories.world_id` NOT NULL constraint
- Multiverse story casting (Story ↔ multiple worlds) — separate track via `story_worlds`
- Removing global Stories / Characters / Worlds nav
- Portfolio / public project pages
- Automated project splitting for users with one bloated “My Universe”

---

## Success criteria

1. New creator never sees **“universe”** on Project surfaces.
2. Create flow always starts with **Start New Project** as the recommended path.
3. Creator can maintain **≥3 unrelated projects** without content bleeding together.
4. Project workspace answers: *“Everything for my dragon comic”* in one scroll.
5. `work_intent` on project aligns with first story’s `project_type` when user picks Story start.
6. Legacy users with “My Universe” get a clear rename path; no orphaned rows.

---

## Open questions (founder decision before build)

| # | Question | Recommendation |
|---|----------|----------------|
| 1 | Hide **Create → Character/World/Story** without a project? | **No** — keep advanced path; wizard is primary |
| 2 | Default backfill title for new SQL runs: `My Studio` vs `Untitled Project`? | **My Studio** |
| 3 | Show Locations/Maps/Moodboards tabs in Phase A or B? | **Phase B** — avoid empty tabs at launch |
| 4 | “Artwork” start → world moodboard vs character gallery? | **World moodboard** if world exists; else create world first |
| 5 | `film_animation` label vs “Film / Screenplay” in UI? | UI says **Film / Screenplay**; DB keeps `film_animation` |

---

## Related documents

| Doc | Relationship |
|-----|--------------|
| [PROJECT_STAGE_1_IMPLEMENTATION_REPORT.md](./PROJECT_STAGE_1_IMPLEMENTATION_REPORT.md) | Schema baseline — this proposal adjusts UX only |
| [PROJECT_FRICTION_REPORT.md](./PROJECT_FRICTION_REPORT.md) | User research motivating project container |
| [PROJECT_CENTERED_INFORMATION_ARCHITECTURE.md](./PROJECT_CENTERED_INFORMATION_ARCHITECTURE.md) | Update universe examples after Phase A ships |
| [VISUAL_IDENTITY_PHASE_1.md](./VISUAL_IDENTITY_PHASE_1.md) | Warm studio tone for project empty states |
| [STORY_WORKSPACE_V3_IMPLEMENTATION_REPORT.md](./STORY_WORKSPACE_V3_IMPLEMENTATION_REPORT.md) | Pattern for aggregated Locations/Maps/Moodboards |

---

**Next step:** Founder sign-off on open questions → implement **Phase A** (terminology + creation wizard + `work_intent` column + rename prompt).
