# Project-Centered Information Architecture

**Status:** Approved long-term architecture — **planning only, no migration**  
**Date:** 2026-06-14  
**Version:** 1.0  
**Authority:** [CHARID_VISION_V3.md](./CHARID_VISION_V3.md) · [FINISHED_CREATIVE_WORK_PRINCIPLE.md](./FINISHED_CREATIVE_WORK_PRINCIPLE.md)  
**Related:** [ARCHITECTURE_COMPATIBILITY_REPORT.md](./ARCHITECTURE_COMPATIBILITY_REPORT.md) · [SCENE_ARCHITECTURE_V1.md](./SCENE_ARCHITECTURE_V1.md) · [IMPLEMENTATION_PHASES_V3.md](./IMPLEMENTATION_PHASES_V3.md) · [CREATIVE_FORMAT_V2.md](./CREATIVE_FORMAT_V2.md)

---

## Purpose

Correct the **creator-facing information architecture** so it matches how real creative universes work — without removing or redesigning the continuity layer (Character Bible, World Bible, Story Bible, Reference Graph, Context Packet).

Founder testing exposed a structural mismatch: the product **implicitly teaches** World → Stories, but many franchises are **Project-centered** with many-to-many Story ↔ World relationships.

This document defines the **official long-term IA** and recommended relationship model. **No database migration is required yet.**

---

## Founder testing findings

| Finding | Example |
|---------|---------|
| **World → Story nesting is too rigid** | His Dark Materials: multiple worlds (Will’s Oxford, Lyra’s Oxford, Cittàgazze) in one narrative |
| **Shared universes span stories** | Marvel, DC, Star Wars — one “project”, many stories, many worlds |
| **Stories cross worlds** | Multiverse arcs, portal fantasy, parallel Earth stories |
| **Worlds recur across stories** | The Shire appears in multiple LOTR-era stories |
| **Navigation teaches wrong hierarchy** | Dashboard: Home · Stories · Characters · Worlds — no top-level **Project** |
| **URLs encode ownership** | `/dashboard/worlds/[worldId]/stories/[storyId]` — story “belongs to” one world permanently |
| **Change World is a workaround** | Phase 2B `changeStoryWorld` moves a story — signals the model is wrong for multiverse work |

**Verdict:** Continuity architecture is **correct**. Container hierarchy is **incomplete**. Project becomes the creator-facing home for a creative universe; Stories and Worlds become **peers linked by relationship**, not parent and child.

---

## What stays unchanged (continuity layer)

| System | Role | Status |
|--------|------|--------|
| **Character Bible** | Identity, appearance, version descriptors | Keep — internal |
| **World Bible** | Setting canon, rules, locations | Keep — internal |
| **Story Bible** | Plan, timeline, events, roster notes | Keep — internal |
| **Reference Graph** | Entity ↔ image slot linking | Keep — automatic |
| **Context Packet** | Canon assembly for AI / exports | Keep — automatic |
| **Chapters** | Structural story units | Keep — extend |
| **Relationships** (future) | Character ↔ character bonds | Keep — [CHARACTER_RELATIONSHIPS_V1.md](./CHARACTER_RELATIONSHIPS_V1.md) |
| **Scenes** (future) | Moment-level continuity bridge | Keep — [SCENE_ARCHITECTURE_V1.md](./SCENE_ARCHITECTURE_V1.md) |

**Rule:** IA correction adds **containers and relationships**. It does not replace bibles or graph assembly.

---

## Current state (V1)

### Implicit hierarchy

```
User
└── World (required container)
     ├── Stories (world_id NOT NULL FK)
     ├── Characters (world_id optional FK)
     └── Locations / bible (world-scoped)
```

### Navigation (`DashboardSidebar`)

```
Home
Stories
Characters
Worlds
Portfolio
Settings
(+ Admin / Moderation — founder only)
```

### Routes

| Pattern | Implies |
|---------|---------|
| `/dashboard/worlds/[id]/stories/[storyId]` | Story owned by World |
| `/dashboard/worlds/[id]` | World is primary workspace |
| `/dashboard/stories` | Cross-world list (hub — Phase A) |

### Pain points

1. Creating a story **requires** picking a world first
2. Moving a story between worlds **breaks** implicit “this story is set here” for multiverse cases
3. No container for “Marvel Universe” vs “Spider-Man solo” vs “Secret Wars crossover”
4. Characters global + optional world — inconsistent with story-world binding

---

## Future canonical structure

### Creator mental model

```
Project          ← "My creative universe" (His Dark Materials, Marvel, my comic series)
├── Stories      ← Narrative arcs (The Golden Compass, Northern Lights)
├── Worlds       ← Settings (Lyra's Oxford, Will's Oxford, Cittàgazze)
├── Characters   ← Cast (Lyra, Pantalaimon, Will, Serafina)
├── Relationships ← Bonds between characters (friend, mentor, daemon, …)
├── Assets       ← Objects with history (Alethiometer, Subtle Knife)
└── Scenes       ← Moments (continuity bridge — under Story → Chapter)
```

**Project** is the top-level **creator-facing** container. Bibles remain attached to Character, World, and Story entities — not to Project directly (Project holds metadata + membership).

### Official hierarchy (continuity + structure)

```
Project
 └── Story
      └── Chapter
           └── Scene
```

Worlds and Characters **associate** to Project, Story, and Scene — they are not owned exclusively by a single parent.

---

## Relationship architecture (recommended)

### Core principle

> **Stories and Worlds are related — not nested.**

| Relationship | Cardinality | Meaning |
|--------------|-------------|---------|
| Project ↔ Story | 1:N | Every story belongs to one project |
| Project ↔ World | 1:N | Worlds are defined in project scope |
| Project ↔ Character | 1:N | Characters belong to a project (primary home) |
| Character ↔ Character | **N:M** | Typed relationships (friend, mentor, daemon, …) — [CHARACTER_RELATIONSHIPS_V1.md](./CHARACTER_RELATIONSHIPS_V1.md) |
| Story ↔ World | **N:M** | A story may span multiple worlds; a world may appear in many stories |
| Story ↔ Character | **N:M** | Story roster (existing `story_characters`) |
| Character ↔ World | **N:M** (optional) | Character native world(s) — e.g. Lyra ↔ Lyra’s Oxford |
| Scene ↔ World | N:1 or N:M | Scene setting — usually one primary world per scene |
| Asset ↔ Project / Story / Scene | varies | See [ASSET_SYSTEM_V1.md](./ASSET_SYSTEM_V1.md) |

### Junction tables (future — design only)

```sql
-- Planning sketch — NOT for implementation yet

-- project_stories (if story.project_id replaces world_id as primary parent)
-- projects (id, user_id, title, slug, primary_output, visual_medium, ...)

story_worlds (
  story_id uuid references stories(id),
  world_id uuid references worlds(id),
  role text,  -- 'primary' | 'secondary' | 'visited' | 'parallel'
  sort_order int,
  primary key (story_id, world_id)
)

character_worlds (
  character_id uuid references characters(id),
  world_id uuid references worlds(id),
  primary key (character_id, world_id)
)

-- stories.world_id → nullable legacy primary; deprecate in favor of story_worlds
-- stories.project_id → NOT NULL when projects ship
```

### Relationship examples

#### His Dark Materials

| Entity | Project | Stories | Worlds |
|--------|---------|---------|--------|
| His Dark Materials | HDM | The Golden Compass, The Subtle Knife, The Amber Spyglass | Lyra’s Oxford, Will’s Oxford, Cittàgazze, … |

- **The Subtle Knife** → `story_worlds`: Will’s Oxford (primary), Cittàgazze (secondary), Lyra’s Oxford (visited)

#### Marvel (shared universe)

| Entity | Project | Stories | Worlds |
|--------|---------|---------|--------|
| Marvel Universe | Marvel | Secret Wars, Spider-Man: Year One, … | Earth-616, Battleworld, … |

- Many stories share Earth-616
- Crossover story links multiple worlds in one arc

#### Child afternoon comic (simple case)

| Entity | Project | Stories | Worlds |
|--------|---------|---------|--------|
| My Comic | *(auto-created)* | My Adventure | My Town |

- N:M collapses to 1:1 — **simple path is a subset**, not a different product

---

## Creator navigation (future)

### Target sidebar

```
Home
Projects          ← NEW — universe home
Stories
Characters
Worlds
Relationships     ← Phase E — character bonds
Assets            ← Phase E
Portfolio
Explore           ← Phase D
Settings
```

**Admin** and **Moderation** remain founder-only (unchanged).

### URL strategy (evolutionary)

| Phase | Canonical story URL | Notes |
|-------|---------------------|-------|
| **Today** | `/dashboard/worlds/[worldId]/stories/[storyId]` | Keep working |
| **Transitional** | `/dashboard/stories/[storyId]` | Redirect after lookup (Phase A5) |
| **Target** | `/dashboard/projects/[projectId]/stories/[storyId]` | Project-centered |

World-scoped URLs may remain as **aliases** (“view this story in World X context”) for deep links from world pages.

### Home dashboard

| Today | Future |
|-------|--------|
| Entity counts | **Continue your story** (Phase A) |
| — | **Recent project** card |
| — | Cross-project “in progress” list |

---

## Interim vs target — Story page

Phase A1 shipped **chapters-first** story workspace without changing ownership model. That is correct sequencing: **workflow before container migration**.

| Concern | Interim (Phase A–D) | Target (Phase E+) |
|---------|---------------------|-------------------|
| Story container | Still under World in URL | Under Project |
| World on story page | Single world section + Change World | Multi-world list + add/remove |
| Create story | Pick world | Pick project (world optional / multi) |
| Finish path | Works per story | Works per story inside project |

---

## Migration recommendations

**No migration until Phase E (Project object) is scheduled.** Recommended order:

### Stage 0 — Now (planning only)

- Document N:M Story ↔ World (this doc)
- Avoid new features that **deepen** world_id as sole parent
- `changeStoryWorld` remains escape hatch — document as legacy

### Stage 1 — Additive (Phase E start)

1. Create `projects` table
2. Add `stories.project_id` (nullable)
3. Create `story_worlds` junction
4. Backfill: one project per world (or per user “Default project”) for existing data
5. Backfill: `story_worlds` from current `stories.world_id` as `role = 'primary'`

### Stage 2 — Dual read

- UI reads primary world from `story_worlds` first, falls back to `world_id`
- New stories write both during transition

### Stage 3 — Project routes + nav

- `/dashboard/projects/[id]` workspace
- Sidebar Projects link
- Story create flow: project-first

### Stage 4 — Deprecate world_id as parent

- Make `stories.world_id` nullable or remove
- Canonical URLs project-scoped
- World page lists **stories that reference this world** (not “owned stories”)

### Characters and worlds

- Add `characters.project_id` (required for new characters)
- `characters.world_id` → migrate to `character_worlds` junction
- Global Characters list filters by project

**Estimated complexity:** Medium–high — touches routes, RLS, create flows, public portfolio URLs. Fits **Phase E** in [IMPLEMENTATION_PHASES_V3.md](./IMPLEMENTATION_PHASES_V3.md).

---

## Implementation recommendations

| Priority | Work | Phase |
|----------|------|-------|
| **Now** | Approve IA doc; avoid world-nesting assumptions in new specs | — |
| **A5** | Story alias route `/dashboard/stories/[id]` | Phase A |
| **E1** | `projects` table + backfill | Phase E |
| **E2** | `story_worlds` junction + multi-world UI on story page | Phase E |
| **E3** | Project workspace + nav | Phase E |
| **E4** | Character / world project scoping | Phase E |
| **E5** | URL migration + redirects | Phase E |

### Do not block Phase A–D on Project migration

Child benchmark (comic → publish → portfolio) does not require Project entity. A single implicit project per user is sufficient until multiverse/pro features demand otherwise.

### Alignment with other V2 docs

| Doc | Interaction |
|-----|-------------|
| [CREATIVE_FORMAT_V2.md](./CREATIVE_FORMAT_V2.md) | Primary Output + Visual Medium on Project (default) and Story (override) |
| [CHARACTER_CLASSIFICATION_V2.md](./CHARACTER_CLASSIFICATION_V2.md) | Characters scoped to Project; type/style unchanged |
| [CHARACTER_RELATIONSHIPS_V1.md](./CHARACTER_RELATIONSHIPS_V1.md) | First-class character bonds; project-scoped graph |
| [SCENE_ARCHITECTURE_V1.md](./SCENE_ARCHITECTURE_V1.md) | Scene inherits worlds via Story membership |
| [PHASE_A_IMPLEMENTATION_PLAN.md](./PHASE_A_IMPLEMENTATION_PLAN.md) | Story-first workflow precedes container migration |
| [WORLD_WORKSPACE_V2.md](./WORLD_WORKSPACE_V2.md) | World page; Story ↔ World N:M on world stories panel |
| [CHARACTER_WORKSPACE_V2.md](./CHARACTER_WORKSPACE_V2.md) | Parallel gallery-first workspace pattern |

---

## Rationale summary

| Audience | Need | Project-centered IA |
|----------|------|---------------------|
| **Child** | Simple — one comic, one town | Auto-project; 1 story : 1 world |
| **Hobbyist** | Series in one setting | Project = series; worlds stable |
| **Professional** | Multiverse, shared canon | N:M Story ↔ World; Project = IP bible home |
| **Continuity engine** | Bibles + graph + packets | Unchanged — entities stay the same |

**Simple default. Powerful when needed.**

Creators see:

```
Home → Projects → Stories → Create → Finish
```

Underneath, Character Bible, World Bible, Story Bible, Reference Graph, and Context Packet continue to power consistency.

---

## Version

| Version | Date | Notes |
|---------|------|-------|
| 1.0 | 2026-06-14 | Founder UX correction — Project-centered IA, Story ↔ World N:M |
