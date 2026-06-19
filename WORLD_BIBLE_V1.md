# World Bible V1 — Architecture

**Status:** Architecture approved — implementation begins after Homepage + Portfolio gaps.  
**Reference implementation:** [Character Bible V1.1](./CHARACTER_BIBLE_V1.md) (image-first, assets → assign roles)

**Product question:** *What is this world?*  
**Primary deliverable:** `WorldContextPacket`

---

## Core philosophy (inherited from Character Bible V1.1)

```text
Assets → Assign Roles        ✓  creator-first
Roles → Upload Assets        ✗  never force this workflow
```

Creators upload maps, location art, mood boards, and environment references first.  
CharID helps organize them into canon slots. One asset can serve multiple roles.

The creator defines canon. AI assists in organizing, expanding, and maintaining it.

---

## Architecture stack

```text
┌─────────────────────────────────────────────────────────────────┐
│  WORLD (permanent — worlds)                                      │
│  name · slug · description · cover · visibility                  │
└───────────────────────────────┬─────────────────────────────────┘
                                │
┌───────────────────────────────▼─────────────────────────────────┐
│  WORLD BIBLE (version state — world_bible)                       │
│  genre · tone · themes · rules · era · climate · overview        │
└───────────────────────────────┬─────────────────────────────────┘
                                │
┌───────────────────────────────▼─────────────────────────────────┐
│  WORLD REFERENCE ASSETS (world_images — gallery)                 │
│  All uploads land as reference assets                            │
└───────────────────────────────┬─────────────────────────────────┘
                                │
┌───────────────────────────────▼─────────────────────────────────┐
│  SLOT ASSIGNMENTS (world_image_slot_assignments)                 │
│  canonical · map · location · mood_board · environment · …       │
└───────────────────────────────┬─────────────────────────────────┘
                                │ assembled into
┌───────────────────────────────▼─────────────────────────────────┐
│  WorldContextPacket                                              │
└─────────────────────────────────────────────────────────────────┘
```

---

## Data model (Slice A — backend)

### `world_bible`

One current row per world in V1 (mirrors `character_bible`).

| Field | Purpose |
|-------|---------|
| `world_id` | PK, FK → `worlds` |
| `user_id` | Owner |
| `genre` | Fantasy, sci-fi, etc. |
| `tone` | Dark, whimsical, etc. |
| `themes` | Free text / comma-separated |
| `rules` | Magic system, physics, world rules |
| `era` | Time period |
| `climate` | Environment summary |
| `overview` | "What is this world?" narrative |
| `version_label` | Default `Current` |
| `is_current` | Version-ready |

### `world_images`

Reusable gallery assets (always `asset_role = 'reference'` on insert).

| Field | Purpose |
|-------|---------|
| `id` | UUID |
| `world_id` | FK → `worlds` |
| `image_path` | Storage path |
| `caption` | Optional label |
| `sort_order` | Gallery order |
| `asset_role` | Gallery role only (`reference`, `other`) — slots live in assignments |

### `world_image_slot_assignments`

Junction: one image → many slots; one slot → one image per world.

| Slot role | Label | Notes |
|-----------|-------|-------|
| `canonical_map` | Canonical map | Primary world map |
| `canonical_reference` | Canonical reference | Defining world visual |
| `location` | Location | Key place reference |
| `mood_board` | Mood board | Tone and atmosphere |
| `environment` | Environment | Biomes, landscapes |
| `architecture` | Architecture | Buildings, structures |

Future reserved prefixes: `location_*`, `faction_*`, `region_*`, `nation_*`, `species_*`, `organization_*`, `culture_*`

| Field | Purpose |
|-------|---------|
| `source` | `uploaded` \| `generated` \| `assigned` |

---

## UI pattern (Slice B — mirrors Character Bible V1.1)

World Bible page at `/dashboard/worlds/[id]` gains sections:

1. **Identity** — name, description, overview (from `worlds` + `world_bible`)
2. **Reference assets** — upload gallery, **Assign Role** per image
3. **Details** — genre, tone, themes, rules, era, climate
4. **Slot coverage** — map, location, mood, environment, architecture cards
5. **Reference graph inspector** — completeness + scores

---

## WorldContextPacket (Slice C)

```typescript
{
  kind: "world",
  schemaVersion: "1.0",
  worldId: string,
  bibleId: string,
  identity: { name, slug, description },
  descriptors: { genre, tone, themes, rules, era, climate, overview },
  referenceGraph: { nodes, canonicalId },
  scores: { bibleCompletion, worldStrength, aiReadiness, ... },
  roster: { characterIds[] },  // characters with world_id
}
```

---

## Implementation slices

| Slice | Scope | Status |
|-------|-------|--------|
| A | Migration + types + RLS + API grants | **Done** — see `20250627000000_world_bible.sql` |
| B | `assembleWorldReferenceGraph()` + `world-bible-scores.ts` | **Done** |
| C | `WorldContextPacket` assembler + actions | **Done** |
| D | World Bible UI (asset-first) | Planned |
| E | World locations table (named places) | Future |

---

## Explicitly out of scope (V1)

- AI generation or role suggestions
- Showcase publication layer
- Story Bible (follows same pattern after World)
- Combined Context Packet

---

## Files (foundation)

| Path | Purpose |
|------|---------|
| `supabase/migrations/20250627000000_world_bible.sql` | Tables + RLS |
| `supabase/fix-world-bible-api.sql` | PostgREST grants |
| `src/types/world-bible.ts` | Bible row types |
| `src/types/world-image.ts` | Gallery asset types |
| `src/types/world-image-slot.ts` | Slot assignment types |

Character Bible remains the reference implementation. World Bible inherits the same creator-first workflow.
