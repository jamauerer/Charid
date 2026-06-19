# Project Architecture Audit

**Date:** 2026-06-14  
**Status:** Audit only — **no Projects implementation**  
**Authority:** [PROJECT_CENTERED_INFORMATION_ARCHITECTURE.md](./PROJECT_CENTERED_INFORMATION_ARCHITECTURE.md) · [PHASE_A_CONTINUATION_REPORT.md](./PHASE_A_CONTINUATION_REPORT.md)  
**Goal:** Decide whether Projects can ship incrementally or Story/World ownership must be revised first.

---

## Executive verdict

| Question | Answer |
|----------|--------|
| Can Projects be added incrementally? | **Yes** — via additive schema + dual-read/dual-write |
| Must Story/World ownership be revised first? | **No full revision required before starting** — but **Story ↔ World N:M** (`story_worlds`) must be part of the Project rollout, not deferred after |
| Continuity layer (bibles, graphs, chapters)? | **Unchanged** — Projects are a container/IA layer |
| Current model fits simple creators? | **Yes** — single world, single story is a degenerate case |
| Current model fits multiverse / shared universes? | **No** — schema and app logic enforce single-world stories |

**Recommendation:** Begin Projects with **Stage 1 additive migration** (see [Recommended architecture](#recommended-architecture)). Do **not** remove `stories.world_id` until Stage 4. Introduce `story_worlds` early in the Project phase so His Dark Materials / Marvel-style work is possible without another breaking migration.

---

## 1. Current Story ↔ World relationship model

### Database

```sql
-- supabase/migrations/20250619000000_stories.sql
stories.world_id uuid NOT NULL REFERENCES worlds(id) ON DELETE CASCADE
UNIQUE (world_id, slug)
```

- Every story row has **exactly one** parent world FK.
- Story slug is unique **per world**, not per user or project.
- Deleting a world **cascades** to its stories, chapters (via story), story bible, story images, etc.

### Application

| Layer | Behavior |
|-------|----------|
| **Create story** | `createStory` requires `world_id` in form data; no story without a world |
| **Routes** | Canonical: `/dashboard/worlds/[worldId]/stories/[storyId]` — world ID is part of identity |
| **Hub list** | `/dashboard/stories` lists all user stories with world name (cross-world view only) |
| **World page** | `getStoriesByWorldId` — stories **owned** by that world |
| **Story page** | Single `StoryWorldSection` — one linked world + **Change World** (move, not add) |
| **Characters in story** | `addCharacterToStory` rejects if `character.world_id !== story.world_id` |
| **Public RLS** | Story visibility joins through **one** `stories.world_id` → `worlds.is_public` |
| **Revalidation** | Path helpers use `(worldId, storyId)` pairs |

### Naming collision

`stories.project_type` (migration `20250621000000_story_project_type.sql`) is **media intent** (novel, graphic_novel, …), **not** the Project container entity. Future `projects` table needs distinct naming in code (`creative_project`, `universe`, or namespace types carefully).

### Mental model taught to creators today

```
World (required parent)
 └── Story (exactly one world_id)
      └── Chapter
           └── (future Scene)
```

Characters: optional `world_id` on `characters`, but story roster **requires** character world = story world.

---

## 2. Does a Story belong to exactly one World?

**Yes — enforced at every layer.**

| Enforcement | Location |
|-------------|----------|
| NOT NULL FK | `stories.world_id` |
| Create flow | `StoryForm`, `NewStoryModal`, `CreateModal` — world required |
| URL structure | Story detail nested under world |
| Business rules | Character assignment, slug scope, `changeStoryWorld` (swap single FK) |
| Cascade delete | World delete removes stories |

There is no secondary world reference, no junction table, no array column.

---

## 3. Can a Story span multiple Worlds today?

**No.**

| Capability | Today |
|------------|-------|
| Story linked to 2+ worlds simultaneously | ❌ |
| Primary + secondary world roles | ❌ |
| Multiverse arc in one story record | ❌ |
| World page shows story that **visits** but doesn't **live in** that world | ❌ (only owned stories) |
| Move story to another world | ✅ `changeStoryWorld` — **mutates** `world_id`, re-slugs, unlinks incompatible characters |
| Same story appearing on two world pages | ❌ (unless duplicated rows — not supported) |

`changeStoryWorld` is a **re-parenting workaround**, not multiverse support. It explicitly removes characters whose `world_id` doesn't match the new world.

---

## 4. Schema changes Projects would require

### New entities

```sql
-- Planning sketch — not for implementation yet

projects (
  id uuid PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES auth.users(id),
  title text NOT NULL,
  slug text NOT NULL,
  description text,
  primary_output text,        -- optional: novel | comic | …
  visual_medium text,         -- optional
  is_public boolean DEFAULT false,
  created_at timestamptz,
  updated_at timestamptz,
  UNIQUE (user_id, slug)
)
```

### New junction / scope columns

| Change | Purpose | Priority |
|--------|---------|----------|
| `story_worlds (story_id, world_id, role, sort_order)` | N:M Story ↔ World | **Critical** for multiverse |
| `stories.project_id` → `projects(id)` | Story belongs to universe | **Critical** |
| `worlds.project_id` → `projects(id)` | Worlds scoped to universe | High |
| `characters.project_id` → `projects(id)` | Cast home universe | High |
| `character_worlds (character_id, world_id)` | Character native world(s) | Medium (Lyra ↔ Oxford) |
| `character_relationships.project_id` | Replace user-only scope (V1 shipped user-scoped) | Medium |
| `story_worlds.role` | `primary` \| `secondary` \| `visited` \| `parallel` | Medium |

### Legacy column evolution

| Column | Transition |
|--------|------------|
| `stories.world_id` | Keep during Stages 1–3 as **legacy primary**; backfill `story_worlds` with `role = 'primary'`; nullable or remove in Stage 4 |
| `characters.world_id` | Keep as quick “home world”; migrate to `character_worlds` for multi-world natives |
| `character_relationships.user_id` | Keep for RLS; add `project_id` for grouping |

### Unchanged / world-scoped (inherit project via world)

These tables need **no immediate redesign** if `worlds.project_id` is set:

- `world_bible`, `world_images`, `world_image_slot_assignments`
- `world_locations`, `world_maps`, `map_location_pins`, `world_moodboards`, `world_moodboard_items`
- `story_bible`, `story_images`, `chapters`, `story_characters`

Future `scenes` attach to `chapter_id`; world context derived from story membership + scene fields.

### RLS impact

- Today: story access → `user_id` + world public join
- Future: add `project_id` ownership checks; public portfolio may become project-scoped
- **High touch:** every policy joining `stories.world_id` for public read

### Route impact

| Today | Target |
|-------|--------|
| `/dashboard/worlds/[w]/stories/[s]` | Keep as alias / deep link |
| — | `/dashboard/projects/[p]/stories/[s]` canonical |
| — | `/dashboard/stories/[s]` project-agnostic alias (lookup story → project) |

---

## 5. How Projects would interact with existing systems

### Characters

| Today | With Projects |
|-------|---------------|
| User-owned; optional `world_id` | `project_id` required for new characters |
| Story roster gated by single world | Roster from project cast; scene/world context per chapter |
| Global `/dashboard/characters` | Filter by project; cross-project only in portfolio/admin |
| Character workspace V2 | Unchanged layout; scope picker = project |

**Migration:** Backfill one project per user (or per world) → set `characters.project_id`.

### Relationships

| Today | With Projects |
|-------|---------------|
| `character_relationships` scoped by `user_id` (Phase A V1) | Add `project_id`; bonds are **universe-persistent** (Gandalf ↔ Frodo across books) |
| Visible on character pages | Same; filter to project cast |
| Planning doc assumed `project_id` | **Align V1 data** when projects ship |

**Risk:** Low if `project_id` added nullable + backfilled before enforcing NOT NULL.

### Worlds

| Today | With Projects |
|-------|---------------|
| Top-level creator container | **Peer under Project** — “places in this universe” |
| Owns stories (FK) | **Referenced by** stories via `story_worlds` |
| World workspace V2 | Same UI; stories panel shows **linked** stories, not owned |
| Maps, locations, moodboards | Stay world-scoped; inherit `project_id` via world |

**HDM example:** Project “His Dark Materials” → Worlds: Lyra’s Oxford, Will’s Oxford, Cittàgazze → Story “The Subtle Knife” links to all three.

### Locations

| Today | With Projects |
|-------|---------------|
| `world_locations.world_id` NOT NULL | Unchanged — locations belong to a world |
| Map pins link to locations | Unchanged |
| Scene → location (future) | Scene picks location; location implies world |

No structural change required beyond `worlds.project_id`.

### Stories

| Today | With Projects |
|-------|---------------|
| `world_id` NOT NULL parent | `project_id` NOT NULL parent; worlds via junction |
| Create requires world pick | Create requires project; add 1+ worlds |
| Finish path / chapters V2 | Unchanged — story-scoped workflow |
| `project_type` column | Rename conceptually to `output_format` or keep; project holds default medium |

**Highest migration risk** — see [Migration risk analysis](#migration-risk-analysis).

### Maps

| Today | With Projects |
|-------|---------------|
| `world_maps` per world | Unchanged — each world has its own map |
| Pins → `world_locations` | Unchanged |
| Multiverse | Multiple worlds = multiple maps under one project; story links worlds, not maps directly |

### Moodboards

| Today | With Projects |
|-------|---------------|
| `world_moodboards` one per world | Unchanged |
| Project-level mood reel (future) | Optional `project_moodboards` later — not required for V1 Projects |

### Future Assets

| Planning | Project interaction |
|----------|-------------------|
| [ASSET_SYSTEM_V1.md](./ASSET_SYSTEM_V1.md) | `assets.project_id` primary; optional story/scene attachment |
| Alethiometer, Subtle Knife | Owned by universe; appear in scenes across worlds |
| Reference graph | Asset nodes under project scope |

Add Assets **after** `projects` exists — avoid user-scoped-only asset rows.

### Future Scenes

| Planning | Project interaction |
|----------|-------------------|
| [SCENE_ARCHITECTURE_V1.md](./SCENE_ARCHITECTURE_V1.md) | `scenes.chapter_id` → story → project |
| Scene world/location | Primary world + location from `story_worlds` + `world_locations` |
| Scene cast | Subset of `story_characters` |
| Relationship context | Edges from `character_relationships` where both cast members ∈ project |

Scenes do **not** require Story/World ownership revision beyond `story_worlds` — they need a resolved world **per scene**, not per story record FK alone.

---

## Franchise evaluation

Legend: ✅ fits today · ⚠️ partial / workaround · ❌ broken without Projects + N:M

### His Dark Materials

| Aspect | Today | With Projects + story_worlds |
|--------|-------|------------------------------|
| One IP, many worlds | ❌ | ✅ |
| *The Subtle Knife* spans Will’s Oxford + Cittàgazze + Lyra’s Oxford | ❌ single `world_id` | ✅ multi link |
| Lyra + Will relationship across worlds | ⚠️ user-scoped relationships work | ✅ project-scoped |
| Daemons / witches / armored bears | ⚠️ characters in one world each | ✅ character_worlds |
| Three books = three stories | ✅ if one world chosen | ✅ one project, three stories |

**Verdict:** ❌ **Requires** Project + Story ↔ World N:M before authentic multiverse workflow.

### Lord of the Rings

| Aspect | Today | With Projects |
|--------|-------|---------------|
| Middle-earth as primary world | ✅ one world | ✅ |
| *Fellowship*, *Two Towers*, *Return* as stories | ✅ three stories same world | ✅ cleaner under “LOTR Project” |
| Characters recur across books | ✅ same world_id | ✅ project-scoped cast |
| Valinor / other lands (rare) | ⚠️ second world = second project feel | ⚠️ story_worlds if one arc visits multiple |
| Silmarillion (different era) | ⚠️ separate world or same | ✅ same project, different world optional |

**Verdict:** ✅ **Works today** for core LOTR. Projects improve IA but aren’t blocking.

### Marvel

| Aspect | Today | With Projects |
|--------|-------|---------------|
| Shared universe label | ❌ no container | ✅ “Marvel Universe” project |
| Many heroes, many series | ⚠️ scattered worlds/stories | ✅ project groups all |
| Crossover (*Secret Wars*, *Civil War*) | ❌ one story / one world | ✅ story links Earth-616 + Battleworld + … |
| Spider-Man + Avengers same story | ❌ character world lock | ✅ project cast + story roster |
| Earth-616 reused across 100 stories | ✅ same world_id | ✅ story_worlds + one world |

**Verdict:** ❌ **Requires** Project + N:M. Single-world model forces artificial splits or changeStoryWorld hacks.

### Star Wars

| Aspect | Today | With Projects |
|--------|-------|---------------|
| Galaxy as universe | ❌ no project | ✅ “Star Wars” project |
| Tatooine, Coruscant, Death Star as worlds/locations | ⚠️ locations OR separate worlds | ✅ worlds under project; locations within |
| Skywalker saga vs *Mandalorian* | ⚠️ separate worlds/stories | ✅ one project, many stories |
| Cross-planet episodes | ❌ single world_id | ✅ story_worlds |
| Droids, ships (future assets) | — | ✅ project-scoped assets |

**Verdict:** ❌ **Requires** Project + N:M for authentic galactic structure.

### Summary matrix

| Franchise | Works today? | Blocker |
|-----------|--------------|---------|
| Child: one town, one adventure | ✅ | None |
| LOTR (core) | ✅ | None |
| His Dark Materials | ❌ | story_worlds + project |
| Marvel | ❌ | project + story_worlds + cast rules |
| Star Wars | ❌ | project + story_worlds |

---

## Migration risk analysis

### Risk tiers

| Tier | Area | Risk | Notes |
|------|------|------|-------|
| 🔴 High | `stories.world_id` removal | Breaking | Touches routes, slugs, RLS, create flows, portfolio URLs |
| 🔴 High | URL migration | Breaking | Bookmarks, emails, shared links under `/worlds/.../stories/...` |
| 🟠 Medium | `story_worlds` introduction | Dual-write complexity | Must agree on primary world during transition |
| 🟠 Medium | Character ↔ story world rules | Logic change | Relax `world_id` match; use project + roster rules |
| 🟠 Medium | `changeStoryWorld` semantics | UX change | Becomes “set primary world” or “manage world links” |
| 🟡 Low | `projects` table additive | Safe | No existing table |
| 🟡 Low | `worlds.project_id` nullable | Safe | Backfill per user |
| 🟡 Low | `character_relationships.project_id` | Safe | V1 just shipped; small data volume |
| 🟡 Low | Locations, maps, moodboards | Safe | World-scoped; inherit via world |
| 🟢 Minimal | Bibles, chapters, finish path | Safe | Story-scoped continuity unchanged |

### What breaks if Projects ship “container only” without story_worlds

- Marvel / HDM / Star Wars creators still cannot model cross-world stories
- World pages still imply **ownership** not **reference**
- `changeStoryWorld` remains the only escape hatch — data loss for multi-world intent
- Second migration later = **double pain** (URLs + mental model twice)

### What breaks if Story/World ownership revised **before** Projects

- Unnecessary delay for simple creators (LOTR-in-one-world, child comic)
- Phase A work (finish path, workspaces, locations) already world-centric — rippling revision now has high cost, low immediate benefit
- No top-level navigation home without `projects` row anyway

---

## Recommended architecture

### Principle

> **Add Projects incrementally. Pair Project container with Story ↔ World N:M in the same program of work. Do not remove legacy `world_id` until dual-read is proven.**

Continuity architecture (bibles, reference graph, context packets, chapters) stays as-is per [PROJECT_CENTERED_INFORMATION_ARCHITECTURE.md](./PROJECT_CENTERED_INFORMATION_ARCHITECTURE.md).

### Staged rollout

#### Stage 0 — Now (complete / in progress)

- ✅ Phase A story workflow (finish path, chapters-first)
- ✅ Character / World workspace V2
- ✅ Relationships, locations, maps, moodboards (world- or user-scoped)
- ✅ Document N:M intent (this audit + IA doc)
- ⚠️ Avoid **new** features that hard-code “story has one world forever” in irrecoverable ways

#### Stage 1 — Additive schema (Project phase start)

1. `projects` table
2. `stories.project_id` NULLABLE
3. `worlds.project_id` NULLABLE
4. `characters.project_id` NULLABLE
5. `story_worlds` junction
6. Backfill: default project per user (or per existing world)
7. Backfill: `story_worlds` from current `stories.world_id` as `primary`

**Ship gate:** migration + API grants only; old UI unchanged.

#### Stage 2 — Dual read / dual write

- UI reads primary world from `story_worlds` first, falls back to `stories.world_id`
- New stories write both
- Relax `addCharacterToStory` world check → project cast check (configurable strictness)
- Story page: **Worlds** section (plural) — add/remove links

**Ship gate:** multiverse stories creatable without `changeStoryWorld`.

#### Stage 3 — Project workspace + navigation

- Sidebar **Projects**
- `/dashboard/projects/[projectId]` hub (stories, worlds, characters counts)
- Create flows: project-first
- Optional: `/dashboard/stories/[storyId]` alias route

#### Stage 4 — Deprecate single-world ownership

- `stories.world_id` nullable or removed
- Canonical URL: `/dashboard/projects/[p]/stories/[s]`
- World page stories = `WHERE story_id IN (SELECT … FROM story_worlds WHERE world_id = ?)`
- Redirects from old world-nested URLs

### Do **not** require before starting Stage 1

- Removing `stories.world_id`
- Rewriting all routes
- Moving locations/maps to project level
- Scene or Asset entities

### Must **not** defer past Stage 2

- `story_worlds` junction
- Multi-world story UI
- Project-scoped character roster rules

---

## Answer: incremental vs revise first?

| Approach | Recommendation |
|----------|----------------|
| **Revise Story/World ownership first, then Projects** | ❌ Not recommended — high churn, no user-facing Project home, blocks nothing useful |
| **Projects container only, keep single world forever** | ❌ Not recommended — fails HDM/Marvel/Star Wars; requires second migration |
| **Incremental: Projects + story_worlds together, legacy FK during transition** | ✅ **Recommended** |

Simple creators keep working: one project (auto), one world, one story = current behavior with extra row in `story_worlds`.

Multiverse creators gain: one project, many worlds, stories that link multiple worlds — without invalidating Phase A foundations.

---

## Pre-implementation checklist (when Projects scheduled)

- [ ] Resolve `project_type` vs `projects` naming in types and UI copy
- [ ] Design backfill: one default project per user vs per world
- [ ] Specify `story_worlds.role` enum and primary-world selection rules
- [ ] Plan URL redirects (301 map old → new)
- [ ] Update RLS tests for public portfolio
- [ ] Add `project_id` to `character_relationships` in same migration batch as projects
- [ ] Replace “Stories live inside a world” copy on story page
- [ ] Audit `revalidateStoryPaths` and all `(worldId, storyId)` helpers

---

## Related documents

| Doc | Relevance |
|-----|-----------|
| [PROJECT_CENTERED_INFORMATION_ARCHITECTURE.md](./PROJECT_CENTERED_INFORMATION_ARCHITECTURE.md) | Target IA (approved planning) |
| [CHARACTER_RELATIONSHIPS_V1.md](./CHARACTER_RELATIONSHIPS_V1.md) | Planned `project_id` on edges |
| [WORLD_WORKSPACE_V2.md](./WORLD_WORKSPACE_V2.md) | World page → linked stories |
| [SCENE_ARCHITECTURE_V1.md](./SCENE_ARCHITECTURE_V1.md) | Scenes inherit project via story |
| [ASSET_SYSTEM_V1.md](./ASSET_SYSTEM_V1.md) | Assets attach to project |
| [PHASE_A_CONTINUATION_REPORT.md](./PHASE_A_CONTINUATION_REPORT.md) | Current world-scoped foundations |

---

**Conclusion:** Projects can and should be added **incrementally**. Story/World **single-parent ownership does not need a big-bang revision first**, but **Story ↔ World N:M must not be treated as a follow-up** — ship it with Projects Stage 1–2. Until then, the product accurately serves single-world narratives (LOTR, child comics) but **cannot** faithfully model His Dark Materials, Marvel, or Star Wars without workarounds.
