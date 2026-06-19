# Scene Architecture V1

> **Superseded by [SCENE_ARCHITECTURE_V2.md](./SCENE_ARCHITECTURE_V2.md)** (2026-06-14).  
> V1 assumed world-centric navigation and required `chapter_id` on every scene.  
> Retained for historical reference only — **do not implement from this document.**

**Status:** Superseded — design only  
**Date:** 2026-06-14  
**Authority:** [CHARID_VISION_V3.md](./CHARID_VISION_V3.md) · [FOUNDER_TESTING_LESSONS_ROUND_1.md](./FOUNDER_TESTING_LESSONS_ROUND_1.md)  
**Goal:** Define Scenes as the **continuity layer** connecting characters, assets, locations, and events — without database-centric navigation. **Planning only — do not implement until comic + publish MVP ships.**

---

## Problem

Today, creators think in tables: characters, worlds, stories, chapters. Narrative work happens in **moments** — a confrontation, a reveal, a quiet beat. Those moments need a first-class home that preserves context and enables future outputs (comics, storyboards, motion).

Scenes become where **creator intent meets continuity**.

---

## Hierarchy

```
Project
├── Stories
├── Worlds
├── Characters
├── Relationships
├── Assets
└── Story
     └── Chapter
          └── Scene
```

| Level | Creator-facing name | Purpose |
|-------|---------------------|---------|
| **Project** | Project | Top-level workspace for a creative universe (future; see V3 Create flow placeholder) |
| **Story** | Story | Narrative arc within a world |
| **Chapter** | Chapter | Structural division (already exists in schema) |
| **Scene** | Scene | Atomic narrative moment — the **bridge** between stories, worlds, and characters |

---

## Scenes as the continuity bridge

Stories belong to **Worlds**. Characters belong to **Worlds** and are linked to **Stories** via roster. Today those layers are connected only implicitly (shared `world_id`, story roster).

**Scenes** make the connection explicit at the moment level:

```
World (canon, rules, locations)
  ↑ inherited via Story
Story (arc, roster, bible)
  ↑ roster subset + guests
Scene (who, what, where, when — this beat)
  → Characters present
  → Relationships between present characters (from project graph)
  → Assets in play
  → Locations
  → Events (what happens)
  → Notes & beats
  → Continuity references (prior scenes, bible slots)
```

A scene answers: *Who is here, with what, where, and does it match everything we already established in this world and story?*

Scenes do not replace Worlds or Characters — they **compose** them for each narrative beat and prepare outputs (comics, novels, films, storyboards, future AI generation).

---

## What a Scene contains (V1 design)

Each Scene is a bounded workspace with five creator-facing groups:

| Group | Purpose | Examples |
|-------|---------|----------|
| **Characters** | Who is present in this moment | Story roster subset, POV, guest appearances |
| **Assets** | Props and artifacts in play | Sword, amulet, spaceship ([ASSET_SYSTEM_V1.md](./ASSET_SYSTEM_V1.md)) |
| **Locations** | Where the beat happens | Named place, setting notes, world bible location ref |
| **Events** | What happens in the beat | Story beat, turn, reveal, action |
| **Notes** | Narrative intent | Summary, tone, dialogue cues |
| **Continuity references** | What must stay consistent | Prior scene links, reference graph slots, context snapshot hooks (AI future) |

**Relationship to World:** Every Story belongs to a World. Scenes inherit world canon through their parent Story; they do not replace Worlds.

**Relationship to Character:** Characters are linked at Story level today; Scenes reference **who is present** in that moment (subset of story roster + optional guests).

---

## Scene definition (detail)

A **Scene** is a bounded narrative unit with:

- A place in the story (Chapter parent)
- Participating **characters**
- **Location** / setting
- **Notes** (visual and textual)
- Referenced **assets** (props, vehicles, artifacts)
- **Continuity references** (links to authoritative images, prior scenes, bible slots)
- Future: **Panels** (comic/storyboard frames)

Scenes are the layer where CharID answers: *“What happens here, with whom, using what, and does it match everything we already know?”*

---

## Scene contents — persistence sketch (V1 design)

| Field group | Fields | Notes |
|-------------|--------|-------|
| **Identity** | `id`, `chapter_id`, `story_id`, `user_id`, `title`, `slug`, `sort_order` | Ordered within chapter |
| **Narrative** | `summary`, `notes`, `tone`, `story_beat` | Free text + optional structured beat type |
| **Cast** | `scene_characters` junction | Character IDs + optional role in scene (e.g. POV) |
| **Place** | `location_name`, `location_notes`, `world_location_ref` | Text now; link to world bible location slots later |
| **Assets** | `scene_assets` junction | Asset IDs + role (held, background, focus) |
| **Media** | `scene_images`, slot assignments | Reference art for the moment |
| **Continuity** | `context_snapshot`, `reference_graph_ref` | Computed/persisted packet for AI (future) |
| **Future** | `panels[]` | Panel sequence for comic output |

---

## Panels (future)

Panels live **under Scene**, not under Story directly.

```
Scene
 ├── Panel 1 (establishing)
 ├── Panel 2 (dialogue)
 └── Panel 3 (reaction)
```

Each panel may reference:

- Character expressions / poses from Character Bible
- Asset instances
- Caption / dialogue text
- Layout hints (aspect ratio, grid position)

Panels are **out of scope for V1 implementation** but the Scene model must not block them.

---

## Data model (proposed)

```sql
-- Design sketch only — not migrated

create table public.scenes (
  id uuid primary key,
  chapter_id uuid not null references chapters(id) on delete cascade,
  story_id uuid not null references stories(id) on delete cascade,
  user_id uuid not null references auth.users(id),
  title text not null,
  slug text not null,
  sort_order int not null default 0,
  summary text,
  notes text,
  location_name text,
  location_notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (chapter_id, slug)
);

create table public.scene_characters (
  scene_id uuid references scenes(id) on delete cascade,
  character_id uuid references characters(id) on delete cascade,
  role text,
  primary key (scene_id, character_id)
);

create table public.scene_assets (
  scene_id uuid references scenes(id) on delete cascade,
  asset_id uuid references assets(id) on delete cascade,
  role text,
  primary key (scene_id, asset_id)
);
```

---

## Navigation & UX (when built)

Creators work **inside the story**, not the database:

```
Story page
 → Chapters list
 → Chapter page
 → Scenes list
 → Scene workspace (cast, location, assets, notes, panels)
```

Contextual creation (same pattern as Phase 2A):

- **In Scene:** Add Existing Character / Create New Character → returns to Scene
- **In Scene:** Add Existing Asset / Create New Asset → returns to Scene
- **In Chapter:** Create Scene → returns to Scene list in Chapter

Avoid: Scene → global Characters list → back → lost context.

---

## Continuity engine role

Scenes become the **smallest unit** for:

1. **Context packets** — assemble character bibles + world rules + story bible + scene cast for AI
2. **Reference graph** — which images/slots are authoritative for this moment
3. **Continuity checks** — hair color, outfit, location rules vs prior scenes
4. **Outputs** — comic pages, animatics, export bundles

Vision V3 hides “Context Packet” and “Reference Graph” from creators; Scenes are the natural surface where those systems attach.

---

## Implementation order (recommended)

| Phase | Deliverable |
|-------|-------------|
| 1 | `scenes` table + CRUD under chapter |
| 2 | Scene list UI on chapter page |
| 3 | Scene workspace: cast + notes |
| 4 | Link to assets ([ASSET_SYSTEM_V1.md](./ASSET_SYSTEM_V1.md)) |
| 5 | Scene images / reference slots |
| 6 | Context packet assembly per scene |
| 7 | Panels sub-model |

---

## Open questions

1. **Scene without Chapter?** Allow orphan scenes on Story for quick capture, or require chapter always?
2. **Guest characters** — characters not in story roster but in one scene (e.g. shopkeeper)?
3. **Reuse scenes** across chapters/stories (unlikely V1)?
4. **Public publishing** — are scenes visible on portfolio or only story/chapter summaries?

---

## Summary

**Scenes** sit between Chapters and future Panels, anchoring characters, locations, assets, and notes in one continuity-aware workspace. They complete the V3 chain:

`Character → World → Story → Scene → Outputs → Publishing`

This document is design authority until Scene ships; no schema changes are implied until a dedicated migration phase.
