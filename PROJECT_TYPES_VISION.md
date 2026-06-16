# CharID Project Types Vision

Product architecture document — **not an implementation spec**.

CharID is a creative consistency platform.

**AI assists. Creators create. CharID remembers.**

This document defines how different creator workflows fit into the same consistency system, what is shared across project types, and how the current architecture should evolve.

See also: [CHARID_CORE_PRINCIPLE.md](./CHARID_CORE_PRINCIPLE.md)

---

## What Are Creators Trying to Make?

Creators use CharID to build **consistent creative universes** and produce **specific outputs** from them. The outputs differ, but the underlying need is the same:

> Keep characters, worlds, and narratives coherent across time, media, and AI-assisted workflows.

### First Supported Project Types

| Type | Primary output | Status in CharID |
|------|----------------|------------------|
| **Novel** | Written narrative in chapters | **Live** (Worlds → Stories → Chapters) |
| **Graphic Novel / Comic** | Visual narrative in pages and panels | Planned |
| **Film / Animation** | Motion narrative in scenes | Planned |
| **Children's Book** | Illustrated narrative in pages | Planned |
| **Other** | Character/world organization + consistent image generation | **Partially live** (Characters, Worlds, Galleries) |

---

## Project Type Definitions

### 1. Novel

**Structure:**

```
World
→ Characters
→ Stories
→ Chapters
```

**Consistency needs:**

- Character consistency (voice, personality, relationships, backstory)
- Story consistency (plot, arcs, events, timeline)
- Timeline consistency (event order, continuity across chapters)

**Current CharID support:** Full planning and writing path for this type.

---

### 2. Graphic Novel / Comic

**Structure:**

```
World
→ Characters
→ Stories
→ Pages
→ Panels
```

**Consistency needs:**

- Character consistency (appearance, costume, expression, relationships)
- Visual consistency (art style, color, character recognizability)
- Panel continuity (layout flow, dialogue placement, action across panels)

**Future AI assistance (not in scope until consistency layer is solid):**

- Panel generation with character reference context
- Dialogue assistance grounded in character voice
- Character pose consistency across panels

---

### 3. Film / Animation

**Structure:**

```
World
→ Characters
→ Stories
→ Scenes
```

**Consistency needs:**

- Character consistency (appearance, voice, behavior)
- Scene continuity (who is present, environment, wardrobe, mood)
- Visual continuity (lighting, time of day, set design, camera logic)

**Future AI assistance:**

- Screenplay drafting from story + character context
- Scene generation informed by world rules and prior scenes
- Shot planning with visual memory references

---

### 4. Children's Book

**Structure:**

```
World
→ Characters
→ Stories
→ Pages
→ Illustrations
```

**Consistency needs:**

- Character consistency (friendly, recognizable, age-appropriate design)
- Illustration consistency (style, palette, character proportions)
- Age-appropriate storytelling (reading level, tone, vocabulary)

**Future AI assistance:**

- Story generation constrained by reading level and character voice
- Illustration prompts with locked character reference images
- Reading-level guidance tied to target audience metadata

---

### 5. Other

**Structure:** Flexible — no required narrative container beyond World and Characters.

**For creators who primarily want:**

- Character organization
- World organization
- Consistent image generation

…without committing to a specific storytelling format (novel, comic, film, etc.).

**Current CharID support:** Characters, Worlds, Galleries, public portfolios. Stories optional.

---

## 1. Shared Consistency Layer

All project types share the same **consistency stack**. AI and human workflows should read from this stack before generating anything.

| Layer | What it remembers | Used by |
|-------|-------------------|---------|
| **Character** | Appearance, personality, voice, relationships, backstory, reference images | All types |
| **World** | Setting, rules, lore, culture, locations (future), organizations (future) | All types |
| **Story** | Plot container, character roster, status, summary, timeline (future) | Novel, Comic, Film, Children's Book |
| **Story unit** | Type-specific content unit (chapter, page, scene, illustration) | Per project type |
| **Visual memory** | Reference images, style notes, wardrobe states (future) | Comic, Film, Children's Book, Other |

**Product test (from core principles):** Every feature must answer *Does this improve consistency?*

The shared layer is **not** a writing app or an AI chat surface. It is the **memory** that all outputs and AI tools draw from.

---

## 2. Shared World Model

**Worlds** are the top-level creative container in CharID today and should remain so.

A World holds:

- Identity (name, slug, description, cover)
- Visibility (public / private)
- Characters assigned to the world (`characters.world_id`)
- Stories set in the world (`stories.world_id`)
- Future: locations, rules, timeline, factions, technology/magic systems

**All project types start from World.** There is no separate "Novel World" vs "Comic World" — one world can eventually host multiple stories in different formats if the creator chooses.

---

## 3. Shared Character Model

**Characters** are global to the creator's account but **assigned to worlds** for organization.

A Character holds:

- Core profile (name, gender, age, location, backstory)
- Gallery / reference images (`character_images`, featured image)
- Public visibility
- Future: personality traits, voice notes, relationships, wardrobe variants, appearance tags for AI

**Characters link to stories** via `story_characters` (many-to-many). This roster defines *who appears in this narrative* regardless of project type.

Character consistency is **type-agnostic**. A character in a novel and the same character in a comic share one profile and one gallery.

---

## 4. What Is Common Across All Project Types

| Element | Common behavior |
|---------|-----------------|
| **Authentication & profiles** | Creator identity, public portfolio |
| **Characters** | Create, edit, gallery, assign to world, link to stories |
| **Worlds** | Create, edit, public world pages |
| **Stories** | Narrative project container (recommended universal — see §7) |
| **Story ↔ Character roster** | Many-to-many via `story_characters` |
| **Visibility model** | Public world → public stories → public content units |
| **RLS pattern** | Owner CRUD; public read via parent world `is_public` |
| **Consistency context for AI** | Character + World + Story + prior units (future) |

Creators always get: **organize → connect → maintain consistency → produce**.

---

## 5. What Is Unique to Each Project Type

| Project type | Unique content unit | Unique fields / concerns | Not shared with |
|--------------|--------------------|---------------------------|-----------------|
| **Novel** | Chapter (`title`, `content`, `sort_order`) | Plain text, reading order | Panel layout, shot lists |
| **Graphic Novel** | Page → Panel | Layout, dialogue bubbles, visual refs per panel | Long-form prose chapters |
| **Film / Animation** | Scene | Screenplay format, location, cast present, duration | Page/panel grid |
| **Children's Book** | Page → Illustration | Reading level, page spread, illustration prompt | Screenplay structure |
| **Other** | None required | Image-first workflows, optional stories | Forced narrative structure |

**Unique = the story unit and its metadata**, not the world or character models.

---

## 6. Recommended Future Database Architecture

Current tables (live):

```
profiles
characters ── character_images
worlds
stories ── story_characters ── characters
chapters (story_id)
```

### Recommended evolution

**Keep unchanged (shared core):**

- `profiles`, `characters`, `character_images`, `worlds`
- `stories`, `story_characters`

**Extend `stories` (lightweight, when needed):**

```text
stories.project_type  text  -- 'novel' | 'comic' | 'film' | 'childrens_book' | 'other'
                          -- default 'novel' for backward compatibility
                          -- 'other' = planning-only, no required content units
```

Optional later: `stories.target_audience`, `stories.reading_level` (children's book), `stories.aspect_ratio` (comic/film).

**Add type-specific content tables (all attach to `stories.id`):**

| Table | Parent | Purpose |
|-------|--------|---------|
| `chapters` | `stories` | Novel — **exists today** |
| `pages` | `stories` | Comic, Children's book — ordered spreads |
| `panels` | `pages` | Comic — layout unit within a page |
| `scenes` | `stories` | Film / Animation — screenplay unit |
| `illustrations` | `pages` | Children's book — image + caption per page |

**Shared patterns for new tables:**

- `id`, `story_id`, `title` or label, `sort_order`, `created_at`
- No `user_id` — ownership via `stories.user_id`
- No `is_public` — visibility via public world
- RLS: owner CRUD through story; public read when world is public

**Future cross-cutting tables (not v1):**

- `locations` (`world_id`)
- `character_relationships` (`character_id`, `character_id`, type)
- `story_events` / `timeline_entries` (`story_id`) — timeline consistency
- `visual_references` (`character_id` or `world_id`) — AI image memory
- `ai_context_snapshots` — frozen consistency bundle for generation (optional)

### Entity relationship (target state)

```text
World
├── Characters (world_id)
└── Stories (world_id, project_type)
    ├── story_characters → Characters
    ├── chapters          [novel]
    ├── pages             [comic, childrens_book]
    │   ├── panels        [comic]
    │   └── illustrations [childrens_book]
    └── scenes            [film]
```

---

## 7. Should Stories Remain Universal?

**Yes. Stories should remain the universal narrative container.**

**Reasons:**

1. **One consistency unit for plot** — Character arcs, events, and relationships belong to a *story*, not to a world alone. A world can have many stories.
2. **Shared roster model** — `story_characters` already works for every format ("who is in this narrative").
3. **AI context boundary** — AI should load World + Story + content units. Without stories, comics and novels in the same world would blur plot context.
4. **Creator mental model** — Creators think in projects: "this graphic novel," "this novel," "this short film" — not just "this world."
5. **Already built** — Stories, status, summary, public pages, and character links are live and type-agnostic.

**`project_type` on `stories`** tells the UI which content units to show (Chapters vs Pages vs Scenes) without forking the data model.

**Exception:** "Other" creators may use Worlds + Characters only, with no stories. Stories remain optional, not mandatory.

---

## 8. Should Chapters Become Novel-Specific?

**Conceptually yes. In the database, keep the `chapters` table as-is.**

**Recommendation:**

| Approach | Verdict |
|----------|---------|
| Rename `chapters` → `novel_chapters` | **No** — unnecessary migration pain |
| Move chapters under a new abstraction table | **No** — over-engineering for current scale |
| Add `stories.project_type = 'novel'` and treat `chapters` as novel-only in UI/docs | **Yes** |
| Add `pages`, `scenes` as sibling tables for other types | **Yes, when those types ship** |

**Rules:**

- Only stories with `project_type = 'novel'` (or unset/default for backward compatibility) expose the Chapters UI.
- Comic stories use `pages` / `panels`, not `chapters`.
- Film stories use `scenes`, not `chapters`.
- Existing `chapters` rows remain valid — all current stories are implicitly novels.

**Do not delete or rename `chapters`.** Gate by project type in application logic when multi-type support launches.

---

## 9. Migration Strategy from Current Architecture

### Current state (shipped)

```
Characters ✓   Galleries ✓   Worlds ✓
Stories ✓      Chapters ✓
Public portfolios ✓   Public worlds/stories/chapters ✓
```

### Phase 1 — Document & stabilize (now)

- Adopt this vision and [CHARID_CORE_PRINCIPLE.md](./CHARID_CORE_PRINCIPLE.md) as product guardrails.
- No schema changes required.
- Treat all existing stories as `project_type = 'novel'` implicitly.

### Phase 2 — Story project type (when first non-novel type is built)

1. Migration: add `stories.project_type text not null default 'novel'` with check constraint.
2. UI: show project type on story create (default Novel).
3. Chapters section: only render when `project_type = 'novel'`.
4. Zero data migration — existing rows get default `'novel'`.

### Phase 3 — Graphic novel / comic

1. Migration: `pages`, `panels` tables attached to `stories.id`.
2. UI: Pages → Panels editor for `project_type = 'comic'`.
3. Reuse story roster, public visibility, RLS patterns from chapters.

### Phase 4 — Film / animation

1. Migration: `scenes` table.
2. UI: Scene editor (screenplay textarea v1, same simplicity as chapters).

### Phase 5 — Children's book

1. Migration: `pages`, `illustrations` (may share `pages` with comic or separate if schema diverges).
2. Metadata: reading level on story or page.

### Phase 6 — World depth & AI context

1. Locations, rules, timeline tables on `worlds` / `stories`.
2. Character relationships, voice/appearance tags.
3. AI reads bundled context — never standalone chat.

### Migration principles

- **Additive only** — new tables and nullable/default columns; no breaking renames.
- **Same RLS pattern** — ownership through `stories.user_id`; public via `worlds.is_public`.
- **Same URL patterns** — extend routes per content type, don't rewrite story routes.
- **Backward compatible** — existing novel workflows unchanged after `project_type` column.

---

## Summary

| Question | Answer |
|----------|--------|
| Shared consistency layer | Character → World → Story → type-specific unit |
| Shared world model | Worlds remain universal containers |
| Shared character model | One character profile + gallery across all types |
| Common across types | Profiles, characters, worlds, stories, roster, visibility, RLS |
| Unique per type | Chapters, pages/panels, scenes, illustrations |
| Stories universal? | **Yes** — with optional `project_type` |
| Chapters novel-specific? | **Yes in product logic** — keep `chapters` table name |
| Migration approach | Additive phases; default existing data to Novel |

CharID grows by **adding content unit types**, not by fragmenting worlds or characters. The memory layer stays one system; the output format is what changes.

---

*Document status: Draft for review — no code, migrations, or implementation implied.*
