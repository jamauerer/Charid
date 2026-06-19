# Project Stage 1 — Implementation Report

**Date:** 2026-06-14  
**Status:** Implemented — requires migration deployment  
**Authority:** [PROJECT_ARCHITECTURE_AUDIT.md](./PROJECT_ARCHITECTURE_AUDIT.md)

---

## Summary

Project Stage 1 adds the **universe container** (`projects`) and wires existing Stories, Characters, Worlds, and Relationships under it. The **Story ↔ World N:M junction** (`story_worlds`) is created alongside legacy `stories.world_id` so both models work during transition.

Creators get a **Project workspace** with Overview, Stories, Characters, Worlds, and Relationships tabs. Existing World and Character pages are unchanged. No content is duplicated — project views are read aggregations filtered by `project_id`.

---

## Schema changes

### New tables

| Table | Purpose |
|-------|---------|
| `projects` | Named creative universe (title, slug, description, cover, `is_default`) |
| `story_worlds` | N:M link between stories and worlds with `role` + `sort_order` |

### New columns (nullable during transition)

| Table | Column | FK |
|-------|--------|-----|
| `stories` | `project_id` | `projects(id)` ON DELETE SET NULL |
| `worlds` | `project_id` | `projects(id)` ON DELETE SET NULL |
| `characters` | `project_id` | `projects(id)` ON DELETE SET NULL |
| `character_relationships` | `project_id` | `projects(id)` ON DELETE SET NULL |

### Unchanged (intentionally)

- `stories.world_id` — still NOT NULL; primary world during transition
- World-scoped foundations — `world_locations`, `world_maps`, `world_moodboards` inherit project via `worlds.project_id`
- `stories.project_type` — still **output format** (novel, graphic novel), not the Project entity

---

## Migrations

| File | Action |
|------|--------|
| `supabase/migrations/20250702000000_project_stage_1.sql` | Tables, columns, RLS, backfill |
| `supabase/fix-projects-api.sql` | PostgREST grants for `projects`, `story_worlds` |

### Backfill behavior

1. For each user with any story, world, or character → insert **“My Universe”** project (`slug: my-universe`, `is_default: true`)
2. Set `project_id` on all existing stories, worlds, characters
3. Insert `story_worlds` rows from current `stories.world_id` with `role = 'primary'`
4. Set `character_relationships.project_id` from `from_character`’s project

**No creator content is deleted or orphaned.**

### Deployment

```sql
-- 1. Run migration
-- supabase/migrations/20250702000000_project_stage_1.sql

-- 2. Expose to Data API
-- supabase/fix-projects-api.sql
```

Verify with `scripts/verify-migrations-live.js` after deploy (probe: `projects` table + `stories.project_id` column).

---

## Routes

| Route | Purpose |
|-------|---------|
| `/dashboard/projects` | All projects grid |
| `/dashboard/projects/[projectId]` | Project workspace (default tab: Overview) |
| `/dashboard/projects/[projectId]?tab=stories` | Stories in project |
| `/dashboard/projects/[projectId]?tab=characters` | Characters in project |
| `/dashboard/projects/[projectId]?tab=worlds` | Worlds in project |
| `/dashboard/projects/[projectId]?tab=relationships` | Relationship graph list |

**Legacy routes unchanged:**

- `/dashboard/worlds/[worldId]/stories/[storyId]` — still canonical story URL
- `/dashboard/characters/[id]`, `/dashboard/worlds/[id]` — still edit surfaces

---

## UI changes

### Navigation

- **Projects** added to primary sidebar immediately below **Home**

### New components

| Component | Role |
|-----------|------|
| `ProjectForm` | Create project modal form |
| `ProjectCard` | Grid card on projects list |
| `DashboardProjectsView` | Projects hub page |
| `ProjectWorkspaceView` | Tabbed workspace shell |
| `ProjectOverviewSection` | Cover hero + stat counts |
| `ProjectStoriesSection` | Story cards (links to world-nested story URLs) |
| `ProjectCharactersSection` | Character grid (links to character pages) |
| `ProjectWorldsSection` | World cards |
| `ProjectRelationshipsSection` | Bond list (read-only; edit on character pages) |

### Create flows

| Flow | Change |
|------|--------|
| **Create Project** | Live in Create modal → navigates to new project workspace |
| **Create World** | Auto-assigns `project_id` (form field or default “My Universe”) |
| **Create Story** | Sets `project_id` from world; upserts `story_worlds` primary link |
| **Create Character** | Sets `project_id` from world or default project |
| **Create Relationship** | Sets `project_id` from character scope |

### Dual-model writes

- `createStory` → writes `stories.world_id` + `stories.project_id` + `story_worlds` (primary)
- `changeStoryWorld` → updates `stories.world_id`, removes old primary junction row, upserts new primary

---

## Application files

| Area | Files |
|------|-------|
| Migration | `supabase/migrations/20250702000000_project_stage_1.sql`, `supabase/fix-projects-api.sql` |
| Types | `src/types/project.ts`, `src/types/story-world.ts` |
| Actions | `src/app/actions/projects.ts` |
| Updated actions | `stories.ts`, `worlds.ts`, `characters.ts`, `character-relationships.ts` |
| Pages | `src/app/dashboard/projects/page.tsx`, `[projectId]/page.tsx` |
| Components | `src/components/project/*`, `ProjectForm.tsx` |
| Nav | `DashboardSidebar.tsx`, `CreateModal.tsx` |

---

## Founder testing checklist

### Migration & data safety

- [ ] Run migration + fix script on staging/live
- [ ] Existing user sees **“My Universe”** project with all prior stories/worlds/characters counted
- [ ] Story pages still load at `/dashboard/worlds/[w]/stories/[s]`
- [ ] Character and world pages unchanged
- [ ] No duplicate rows in stories/worlds/characters tables

### Project workspace

- [ ] Sidebar **Projects** appears below Home
- [ ] `/dashboard/projects` lists all projects with cover + counts
- [ ] Create **New Project** (e.g. “Dragon Quest”) → lands on project Overview
- [ ] Overview shows cover, story/character/world/relationship counts
- [ ] **Stories** tab lists stories with links to story workspace
- [ ] **Characters** tab lists cast with links to character pages
- [ ] **Worlds** tab lists worlds with links to world workspace
- [ ] **Relationships** tab shows bonds (create via character page first)

### Create flows

- [ ] Create modal **Project** option works (no longer “coming soon”)
- [ ] New world lands in default or selected project
- [ ] New story sets `project_id` and `story_worlds` primary row
- [ ] New character inherits project from world
- [ ] New relationship gets `project_id` and appears on project Relationships tab

### Regression

- [ ] Create story → welcome banner → finish path still works
- [ ] World workspace V2 (locations, map, moodboard) unchanged
- [ ] Character relationships CRUD on character page unchanged
- [ ] Portfolio public pages unchanged (project-scoped public not yet exposed)

---

## Known limitations (Stage 1)

| Limitation | Planned |
|------------|---------|
| Story URLs still world-nested | Stage 4: `/dashboard/projects/[p]/stories/[s]` |
| Single primary world per story in UI | Stage 2: multi-world story links UI |
| `addCharacterToStory` still requires matching `world_id` | Stage 2: project cast rules |
| No project picker on World/Character forms yet | Stage 2–3 create-flow polish |
| Relationships read-only on project page | Edit stays on character pages (by design) |
| `project_id` nullable — not enforced NOT NULL | Stage 2 after backfill verified |
| No project-scoped public portfolio | Future publishing phase |
| Locations/maps/moodboards not on project tabs | Inherit via world; no duplication needed |
| `is_default` project cannot be deleted in UI | Future project management |
| Assets, Scenes, Comics, Publishing | Future entities attach via `project_id` |

---

## Future compatibility

Stage 1 schema supports without rewrite:

- **Locations / Maps / Moodboards** — remain world-scoped; filter by `worlds.project_id`
- **Assets** — add `assets.project_id` referencing same `projects` table
- **Scenes** — attach to `chapter_id` → story → `project_id`
- **Comics / Publishing** — project as portfolio container; stories as output units
- **Multiverse stories** — `story_worlds` ready; Stage 2 UI for multiple world links

---

## Next recommended steps

1. Deploy migration to live Supabase
2. Founder sign-off on checklist above
3. **Story Workspace V3** (story-centric read aggregates) — per `STORY_WORKSPACE_V3.md`
4. **Project Stage 2** — dual-read primary world from `story_worlds`, multi-world UI, relaxed roster rules
