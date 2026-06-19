# Asset System V1

**Status:** Design only — not implemented  
**Date:** 2026-06-14  
**Authority:** [CHARID_VISION_V3.md](./CHARID_VISION_V3.md) · [SCENE_ARCHITECTURE_V1.md](./SCENE_ARCHITECTURE_V1.md) · [FOUNDER_TESTING_LESSONS_ROUND_1.md](./FOUNDER_TESTING_LESSONS_ROUND_1.md)  
**Goal:** Assets as **first-class entities** that move between characters and scenes — preparing continuity architecture for **comics, novels, films**, and future AI generation. **Planning only — do not implement until Scenes ship.**

---

## Problem

Props, weapons, vehicles, and artifacts today are implied through character/world/story images and text. There is no shared object a creator can say *“this sword”* and reuse in Scene A with Character X and Scene B with Character Y while tracking ownership history.

Database-centric thinking treats assets as attachments. **Creator-centric thinking treats assets as cast members of the universe** — movable, ownable, and scene-aware.

---

## Asset definition

An **Asset** is a reusable creative entity with:

- Identity (name, type, description)
- Visual reference (images, slots)
- **Current owner** (character, world, story, scene, or unassigned)
- **Ownership history** (audit trail)
- **Scene history** (where it appeared)

### Example assets (creator-facing)

| Example | Typical type | Notes |
|---------|--------------|-------|
| **Sword** | `weapon` | Visual consistency across scenes |
| **Amulet** | `artifact` | Ownership transfers drive plot beats |
| **Vehicle** | `vehicle` | Carriage, motorcycle, etc. |
| **Spaceship** | `vehicle` | May be owned by character or world |
| **Artifact** | `artifact` | Relics, crowns, generic powerful objects |

### Asset type labels

| Type | Examples |
|------|----------|
| `weapon` | Sword, blaster, wand |
| `artifact` | Amulet, relic, crown |
| `vehicle` | Spaceship, carriage, motorcycle |
| `tool` | Map, compass, key |
| `wearable` | Cloak, armor (when not character-default) |
| `prop` | Generic catch-all |
| `other` | User-defined |

Types are creator-facing labels, not rigid game-engine enums.

---

## What we track

Every asset maintains three continuity timelines:

| Track | Meaning | Creator question |
|-------|---------|------------------|
| **Current owner** | Who holds it now (character, world, story, scene, or unassigned) | “Who has the amulet?” |
| **Ownership history** | Full audit trail of transfers with optional story/scene context | “When did the sword change hands?” |
| **Scene history** | Every scene where the asset appeared (with or without ownership change) | “Where have we seen this ship?” |

Assets **move between characters over time** — ownership history and scene history are distinct so a prop can appear in a scene without changing hands.

---

## Independence principle

Assets **do not belong exclusively** to one character.

```
Asset: “Starfall Blade”
  Owner: Character A (Chapter 1)
  Owner: Character B (Chapter 5)   ← transfer
  Appears: Scene 12, Scene 40
```

Characters **hold** assets; Scenes **feature** assets; Worlds may **canonize** assets in world bible links.

---

## Data model (proposed)

```sql
-- Design sketch only — not migrated

create table public.assets (
  id uuid primary key,
  user_id uuid not null references auth.users(id),
  name text not null,
  slug text not null,
  asset_type text not null,
  description text,
  notes text,
  current_owner_type text,  -- 'character' | 'world' | 'story' | 'scene' | null
  current_owner_id uuid,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.asset_images (
  id uuid primary key,
  asset_id uuid not null references assets(id) on delete cascade,
  storage_path text not null,
  caption text,
  sort_order int default 0,
  created_at timestamptz not null default now()
);

create table public.asset_ownership_history (
  id uuid primary key,
  asset_id uuid not null references assets(id) on delete cascade,
  owner_type text not null,
  owner_id uuid not null,
  acquired_at timestamptz not null default now(),
  released_at timestamptz,
  reason text,  -- 'gift', 'theft', 'found', 'story_event', manual
  story_id uuid references stories(id),
  scene_id uuid references scenes(id)
);

create table public.scene_assets (
  scene_id uuid not null references scenes(id) on delete cascade,
  asset_id uuid not null references assets(id) on delete cascade,
  role text,  -- 'focus', 'background', 'held', 'mentioned'
  notes text,
  primary key (scene_id, asset_id)
);
```

---

## Ownership model

### Current owner

Single **current** owner pointer on `assets` for fast queries:

- `current_owner_type` + `current_owner_id`
- Nullable = unassigned / in vault

### Ownership history

Every transfer appends to `asset_ownership_history`:

| Event | Records |
|-------|---------|
| Create asset | First row; owner optional |
| Assign to character | New row; close previous `released_at` |
| Scene appearance | `scene_assets` row; optional history note |
| Transfer in story | History row with `story_id` / `scene_id` |

Creators see a simple timeline: *“Held by Lyra since Scene 4.”*

### Scene history

Distinct from ownership:

- An asset can **appear** in a scene without changing owner (background prop)
- `scene_assets` captures presence; history table captures transfers

---

## Relationships

```
User
 └── Assets (library)
      ├── owned by Character (current)
      ├── linked in World bible (canonical artifacts)
      ├── referenced in Story notes
      └── placed in Scenes (scene_assets)

Character
 └── may current-own many assets

Scene
 └── features many assets (subset of user library)
```

---

## UX patterns (when built)

Aligned with contextual creation (Phase 2A):

| Context | Actions |
|---------|---------|
| **Scene workspace** | Add Existing Asset · Create New Asset |
| **Character bible** | Link asset as signature item · Transfer from scene |
| **World bible** | Register world-level artifacts (shared canon) |
| **Global Assets page** | Browse library (V3 nav “Assets” — Coming Soon in Create modal) |

**Create New Asset in Scene:**

1. Modal opens on Scene page
2. Save asset
3. Auto-link to scene
4. Optional: assign current owner to a scene character
5. Return to Scene — no navigation away

---

## Continuity & AI

Assets feed the continuity engine:

- Visual consistency checks (same sword design across scenes)
- Context packets include asset descriptions + reference images
- Generation prompts: *“Character A holds Asset X in Scene Y”*

---

## Navigation principle

**Avoid:** Scene → Assets index → Character → Scene  
**Prefer:** Scene → Create Asset → Scene

Assets are reachable globally for power users, but **primary creation happens in context**.

---

## Distinction from existing “assets”

| Today | Future Asset entity |
|-------|---------------------|
| `character_images` | Character visual references — remain character-scoped |
| `world_images` | World visual references — remain world-scoped |
| `story_images` | Story mood boards — remain story-scoped |
| Implied props in text | **`assets` table** — first-class movable entities |

Character photos and turnaround slots are **not** Assets. A named lightsaber that passes between characters **is** an Asset.

---

## Implementation order (recommended)

| Phase | Deliverable |
|-------|-------------|
| 1 | `assets` + `asset_images` + user library page |
| 2 | Current owner + manual assign |
| 3 | `asset_ownership_history` on transfer |
| 4 | `scene_assets` when Scenes ship |
| 5 | World bible artifact links |
| 6 | Continuity checks + AI context inclusion |

---

## Open questions

1. **Shared assets across users** (collab / marketplace)? Out of scope V1.
2. **Duplicate assets** (two “identical” swords) — merge tool?
3. **Generated vs uploaded** asset images — same slot model as characters?
4. **Portfolio visibility** — public asset pages or private only?

---

## Summary

The Asset System treats props and artifacts as **first-class universe objects** with independent identity, movable ownership, and scene presence history. Combined with [SCENE_ARCHITECTURE_V1.md](./SCENE_ARCHITECTURE_V1.md), this moves CharID from database tables toward a **creator-centric continuity model** where things — not just people and places — persist across the story.
