# Phase A Continuation Report

**Date:** 2026-06-14  
**Scope:** Character Relationships V1 · World Locations V1 · World Maps V1 · World Moodboards V1

---

## Summary

Four storytelling foundations shipped: typed character relationships, named world locations, static world maps with pins, and world moodboards. All integrate into existing Character and World workspace pages.

**Deployment requires a new Supabase migration** (see below).

---

## Schema changes

### New tables

| Table | Purpose |
|-------|---------|
| `character_relationships` | Directed edges between characters (type, custom label, notes) |
| `world_locations` | Named places per world (name, type, description, optional cover image) |
| `world_maps` | Primary map record per world (links to `world_images`) |
| `map_location_pins` | Pins on a map (label, x/y %, optional `location_id`) |
| `world_moodboards` | One moodboard per world (V1) |
| `world_moodboard_items` | Grid items referencing `world_images` |

### New columns

None on existing tables — all new data lives in the tables above.

### Views

None.

### RLS policies

New policies on all six tables:

- **Owner CRUD** via `user_id` or world ownership join
- **Public read** on world-scoped tables when `worlds.is_public = true`

### Storage buckets

None — reuses existing `character-photos` bucket and `world_images` gallery paths.

### Backfill

Migration backfills `world_maps` from existing `canonical_map` slot assignments where present.

---

## Migrations required

**Before deployment, run in order:**

1. `supabase/migrations/20250701000000_phase_a_worldbuilding_foundations.sql`
2. `supabase/fix-worldbuilding-foundations-api.sql` (PostgREST grants + schema reload)

### Prerequisites (already required for workspace V2)

- `20250623000000_character_bible.sql`
- `20250627000000_world_bible.sql`
- `20250628000000_world_slot_roles_v2.sql`
- `fix-world-bible-api.sql`

---

## Files changed

### Database

| File | Change |
|------|--------|
| `supabase/migrations/20250701000000_phase_a_worldbuilding_foundations.sql` | **New** — tables + RLS + map backfill |
| `supabase/fix-worldbuilding-foundations-api.sql` | **New** — API grants |

### Types & lib

| File | Change |
|------|--------|
| `src/types/character-relationship.ts` | **New** |
| `src/types/world-location.ts` | **New** |
| `src/types/world-map.ts` | **New** |
| `src/types/world-moodboard.ts` | **New** |
| `src/lib/relationship-types.ts` | **New** — preset types + display labels |
| `src/lib/location-types.ts` | **New** — preset location types |
| `src/lib/character-creator-progress.ts` | Relationships checklist reflects live count |
| `src/lib/world-creator-progress.ts` | Locations + moodboard + map from new entities |

### Server actions

| File | Change |
|------|--------|
| `src/app/actions/character-relationships.ts` | **New** — list, create, delete |
| `src/app/actions/world-locations.ts` | **New** — list, create, delete |
| `src/app/actions/world-maps.ts` | **New** — bundle, upload, pins |
| `src/app/actions/world-moodboards.ts` | **New** — bundle, upload, gallery add, remove |

### UI components

| File | Change |
|------|--------|
| `src/components/character-bible/AddRelationshipModal.tsx` | **New** |
| `src/components/character-bible/CharacterRelationshipsSection.tsx` | Placeholder → live CRUD |
| `src/components/world-bible/WorldLocationsSection.tsx` | **New** |
| `src/components/world-bible/WorldMapSection.tsx` | **New** |
| `src/components/world-bible/WorldMoodboardSection.tsx` | **New** |
| `src/components/character-bible/CharacterWorkspaceView.tsx` | Wired relationships + progress |
| `src/components/world-bible/WorldWorkspaceView.tsx` | Replaced placeholders with live sections |

### Pages

| File | Change |
|------|--------|
| `src/app/dashboard/characters/[id]/page.tsx` | Fetches relationships + photo URLs |
| `src/app/dashboard/worlds/[id]/page.tsx` | Fetches locations, map, moodboard bundles |

### Removed

| File | Reason |
|------|--------|
| `src/components/world-bible/WorldPlaceholders.tsx` | Replaced by live sections |

---

## Feature summary

### 1. Character Relationships V1

- Add relationship: pick any of your characters, choose type (friend, rival, mentor, parent, daemon, custom, …)
- List on character page with photo, label, notes
- Link to related character; remove relationship
- Visible on both characters’ pages (incoming edges show inverse label)
- **V1 scope:** user-scoped (no `project_id` until Projects ship)

### 2. World Locations V1

- Add named location with type chip (forest, village, castle, …) + optional description
- Grid cards on world page
- Remove location
- **Deferred:** cover image assign, scene links, map pin auto-create from location

### 3. World Maps V1

- Primary map per world (`world_maps` table)
- Upload / replace map image (syncs `canonical_map` slot + map record)
- Click-to-place pins with label; optional link to existing location
- Pin list with remove
- **Deferred:** interactive layers, drag-to-move pins, multiple maps per world

### 4. World Moodboards V1

- One moodboard per world
- Upload images or add from world gallery
- Grid display with remove
- **Deferred:** reorder, captions UI, multiple moodboards

---

## Founder testing checklist

### Migration

- [ ] Run `20250701000000_phase_a_worldbuilding_foundations.sql` in Supabase SQL Editor
- [ ] Run `fix-worldbuilding-foundations-api.sql`
- [ ] Confirm tables appear in Table Editor
- [ ] No amber migration banner on character/world pages

### Character Relationships

- [ ] Open character with 2+ characters in studio → **Add relationship**
- [ ] Create Friend edge A → B; appears on A’s page
- [ ] Open B’s page → same bond shows with correct label
- [ ] Try duplicate type A → B → friendly error
- [ ] Remove relationship → disappears on both pages
- [ ] Progress bar “Relationships” optional checkmark when ≥1 bond

### World Locations

- [ ] Open world → **Add location** → Forest / “Whispering Woods”
- [ ] Location card appears in grid
- [ ] Remove location → gone from grid
- [ ] Progress “Locations” optional checkmark when ≥1 location

### World Maps

- [ ] Upload map image → displays in World Map section
- [ ] **Add pin** → click map → pin appears with label
- [ ] Link pin to existing location (optional dropdown)
- [ ] Remove pin from list
- [ ] Progress “World Map” checkmark when map has image

### World Moodboards

- [ ] **Upload image** → appears in moodboard grid
- [ ] **From gallery** → pick existing world image
- [ ] Remove item from grid
- [ ] Progress “Mood Board” checkmark when ≥1 item (or mood slot filled)

### Regression

- [ ] Character gallery, personality, stories still work
- [ ] World cover, gallery slots, stories, characters still work
- [ ] Story finish path + welcome banner unchanged

---

## Future dependencies

| Feature | Depends on | Notes |
|---------|------------|-------|
| **Project-scoped relationships** | `projects` table + N:M story/world links | Replace `user_id`-only scope; add `project_id` on edges |
| **Symmetric relationship pairs** | Optional mirror rows or graph query layer | V1 stores single directed edge |
| **Location cover images** | Assign from gallery action on location card | `cover_image_id` column exists |
| **Scene ↔ location links** | Scenes architecture ([SCENE_ARCHITECTURE_V1.md](./SCENE_ARCHITECTURE_V1.md)) | Locations table ready |
| **Interactive maps** | `map_type = interactive`, drag pins, regions JSON | Pins use % coordinates |
| **Multiple maps per world** | Drop partial unique on `is_primary` | Oxford / Cittàgazze multiverse |
| **Moodboard reorder** | `sort_order` updates | Column exists |
| **Reference graph integration** | Graph assembler updates | Relationships/locations as nodes |
| **AI context packets** | Context slice for relationships + places | No AI in this phase |
| **Story cast ↔ relationship hints** | Story page surfacing shared bonds | Requires story character UI pass |

---

## Out of scope (unchanged)

- AI generation, credits, Stripe, marketplace, print on demand
