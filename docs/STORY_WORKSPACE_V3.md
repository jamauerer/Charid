# Story Workspace V3

**Status:** Approved design — **planning only, no implementation**  
**Date:** 2026-06-14  
**Authority:** [PROJECT_FRICTION_REPORT.md](./PROJECT_FRICTION_REPORT.md) (approved) · [REFERENCE_IMAGE_STRATEGY.md](./REFERENCE_IMAGE_STRATEGY.md)  
**Related:** [PHASE_A1_IMPLEMENTATION_REPORT.md](./PHASE_A1_IMPLEMENTATION_REPORT.md) · [CHARACTER_WORKSPACE_V2.md](./CHARACTER_WORKSPACE_V2.md) · [WORLD_WORKSPACE_V2.md](./WORLD_WORKSPACE_V2.md) · [PROJECT_ARCHITECTURE_AUDIT.md](./PROJECT_ARCHITECTURE_AUDIT.md) · [SCENE_ARCHITECTURE_V1.md](./SCENE_ARCHITECTURE_V1.md)

---

## Purpose

Close the gap identified in the Project Friction Report:

> **Worldbuilding is separated from storytelling.**

Creators write on the **Story** page but discover cast bonds, places, maps, and mood on **Character** and **World** pages. V3 makes the story workspace the **primary creation environment** by **surfacing context**, not by copying data.

**One rule:** Story reads canon from existing tables. World and Character pages remain the **edit surfaces**.

---

## Design goals

| # | Goal |
|---|------|
| 1 | No duplicated data — single source of truth per entity |
| 2 | World / Character workspaces unchanged as deep-edit homes |
| 3 | Story page = write chapters + see everything the story needs |
| 4 | Compatible with future Projects, Scenes, Assets, Comics, Publishing |
| 5 | Child-simple default; professional depth one click away |

**North star:** A novelist or comic creator stays on the story page for a full session without asking “where was that map again?”

---

## Problem (current — post A1)

Today’s story layout ([PHASE_A1_IMPLEMENTATION_REPORT.md](./PHASE_A1_IMPLEMENTATION_REPORT.md)):

```
What's next → Chapters → Characters → World (single link) → Advanced plan → Edit
```

| Visible on story | Hidden on other pages |
|------------------|------------------------|
| Cast roster + add/create | Relationship graph |
| One world name + Change World | Locations, map, moodboard |
| Chapters | Character portraits / expressions (except roster thumb) |
| — | World gallery slots |

**Friction:** Fantasy and child-comic flows work but require **page hops** for setting and cast dynamics ([PROJECT_FRICTION_REPORT.md](./PROJECT_FRICTION_REPORT.md)).

---

## Core principle: read aggregates, edit elsewhere

```
┌─────────────────────────────────────────────────────────────┐
│  STORY WORKSPACE (V3)                                       │
│  Read: aggregated context for this story                  │
│  Write: chapters, roster links, story plan, story metadata  │
└──────────────────────────┬──────────────────────────────────┘
                           │ deep links only
         ┌─────────────────┼─────────────────┐
         ▼                 ▼                 ▼
   Character WS      World WS         (future Scene)
   edit refs,         edit locations,
   relationships,     map, moodboard
   personality
```

| Action | Where it happens |
|--------|------------------|
| Add chapter, continue story | Story |
| Link / create character in roster | Story (existing modals) |
| Add relationship, upload portrait | Character page |
| Add location, pin map, moodboard image | World page |
| View all of the above while writing | **Story (new)** |

No second copy of locations, maps, or relationships on story rows.

---

## Information architecture (V3)

### Default scroll order

```
┌──────────────────────────────────────────────────────────────┐
│ Header · status · breadcrumbs (← Stories · World)            │
├──────────────────────────────────────────────────────────────┤
│ What's next (finish path)                         [A1 keep]  │
├──────────────────────────────────────────────────────────────┤
│ Chapters (primary work area)                      [A1 keep]  │
├──────────────────────────────────────────────────────────────┤
│ CAST & CONNECTIONS                                           │
│   · Story roster (existing)                                  │
│   · Relationship graph (cast-only subset)          [NEW]     │
├──────────────────────────────────────────────────────────────┤
│ SETTING                                                      │
│   · World context (primary world; multi-world later)         │
│   · Locations gallery (read)                       [NEW]     │
│   · Map preview + pins (read)                      [NEW]     │
│   · Moodboard strip (read)                         [NEW]     │
├──────────────────────────────────────────────────────────────┤
│ Advanced story plan (collapsed)                   [A1 keep]  │
├──────────────────────────────────────────────────────────────┤
│ Edit details                                      [A1 keep]  │
└──────────────────────────────────────────────────────────────┘
```

**Rationale:** Chapters stay first (finish path unchanged). Context blocks sit **between** writing and advanced planning — visible while drafting, not buried below the fold after world link.

---

## Section specifications

### 1. What's next + Chapters

**No change** to Phase A1 behavior. V3 adds context below chapters, not above.

---

### 2. Cast & Connections

Combines existing **Characters** section with a new **relationship read model**.

#### 2a. Story roster (existing, minor copy tweak)

| Element | Behavior |
|---------|----------|
| `StoryPageCharactersSection` | Keep add/create modals; stay on story |
| Portrait thumbnails | From `photo_path` / canonical slot |
| Link per character | → `/dashboard/characters/[id]` for full edit |

#### 2b. Relationship graph (NEW — read only)

**Placement:** Directly **below** the roster grid, inside the same `Cast & Connections` card — not a separate page.

**Data rule:**

```text
Include edge E where:
  E.from_character_id ∈ story roster
  AND E.to_character_id ∈ story roster
```

Query existing `character_relationships` — no story-specific relationship table in V3.

**UI (compact graph):**

```
Cast & Connections
├── [Hero thumb] [Sidekick thumb] [Mentor thumb]  (+ Add to story)
└── Connections among your cast
    ┌─────────────────────────────────────┐
    │  Hero ──best friend──▶ Sidekick      │
    │  Hero ──mentor──────▶ Mentor       │
    └─────────────────────────────────────┘
    [Edit relationships on character pages →]
```

| Display | Detail |
|---------|--------|
| Layout | Horizontal **bond chips** (not force-directed graph in V3) — pair avatar + label + type |
| Empty state | “Add relationships on character pages to see cast dynamics here.” |
| Actions | **No** add relationship on story in V3 — link to character with `?focus=relationships` optional |
| Cross-world cast | Show bonds even when characters have different `world_id` (relationships are user-scoped today) |

**Why not edit here:** Avoid duplicating `AddRelationshipModal` logic; Character page owns bond CRUD. Story **reflects** roster-filtered graph.

**Future (Scenes):** Highlight bonds relevant to **current scene** cast pairs ([SCENE_ARCHITECTURE_V1.md](./SCENE_ARCHITECTURE_V1.md)).

---

### 3. Setting

Replaces the thin **StoryWorldSection** (world name + Change World only) with a **read-only setting panel** backed by the story’s primary world.

#### 3a. World header (evolve existing)

| Element | V3 behavior |
|---------|-------------|
| World name | Link to world workspace |
| Subtitle | “Places and visuals for this story” (not “Stories live inside a world”) |
| Actions | **Open world** (primary) · Change world (secondary, existing) · Create world (existing) |

#### 3b. Location gallery (NEW — read only)

**Placement:** First row inside **Setting**, full width, grid of location cards.

**Data:** `getWorldLocations(worldId)` — same rows as world page.

| Card shows | Edit path |
|------------|-----------|
| Name, type chip, description excerpt | “Edit on world →” |
| Cover image when `cover_image_id` wired | — |
| Empty world | “No places yet — add locations on the world page” + CTA link |

**No** add-location modal on story in V3 (keeps single write path).

**Future:** Scene picker assigns `location_id` per beat; story setting panel can filter “locations used in this story” via scene aggregate — still no duplicated location rows.

#### 3c. World map (NEW — read only)

**Placement:** Below locations — **wide aspect preview** (16:10), left ~65% on desktop; pin list right ~35%.

**Data:** `getWorldMapBundle(worldId)` — map image + pins.

| Element | Behavior |
|---------|----------|
| Map image | Read-only preview; click → world page `#world-map` |
| Pins | Dots + labels; optional link to location name |
| Empty | “Add a map on the world page” + link |
| Upload / pin mode | **Not** on story — world page only |

**REFERENCE_IMAGE_STRATEGY alignment:** Map is canonical geography ref; story **displays** it for “where does this chapter happen?” without re-upload.

#### 3d. Moodboard strip (NEW — read only)

**Placement:** Below map — horizontal **scroll strip** of moodboard items (3–6 visible, scroll for more).

**Data:** `getWorldMoodboardBundle(worldId)`.

| Element | Behavior |
|---------|----------|
| Thumbnails | From `world_moodboard_items` → signed URLs |
| Empty | “Add mood images on the world page” |
| Edit | Link to world `#moodboard` |
| Style role | Feeds future generation ([REFERENCE_IMAGE_STRATEGY.md](./REFERENCE_IMAGE_STRATEGY.md)) — story shows tone at a glance |

**Note:** Do not duplicate gallery `mood_board` slot UI here — moodboard **collection** is the richer surface; slot is world-edit concern.

---

## Responsive layout

| Breakpoint | Layout |
|------------|--------|
| Mobile | Single column: roster → bonds → locations grid → map stack → mood strip |
| Tablet+ | Map + pin list side-by-side |
| Desktop (≥1280) | Optional: Setting map/mood **sticky** in right column while scrolling chapters (V3.1 polish — not required for V3.0) |

---

## Data assembly (server)

New aggregator — **read only**, no new tables:

```typescript
// Conceptual — planning only
type StoryWorkspaceBundle = {
  story: Story;
  world: World;
  chapters: Chapter[];
  finishPath: FinishPathResult;
  cast: StoryCharacterEntry[];
  castPhotoUrls: Record<string, string | null>;
  castRelationships: CharacterRelationshipEntry[]; // filtered to roster pairs
  locations: WorldLocationWithCover[];
  map: WorldMapBundle | null;
  moodboard: WorldMoodboardBundle | null;
  storyBible: StoryBibleViewBundle; // existing
};
```

**Implementation sketch:** `getStoryWorkspaceBundle(worldId, storyId)` parallelizes existing actions:

- `getStoryById`, `getChaptersByStoryId`, `getStoryCharacters`
- `getCharacterRelationships` per cast id **or** one query filtered by roster ids
- `getWorldLocations`, `getWorldMapBundle`, `getWorldMoodboardBundle`
- `getStoryBibleBundle`

**Caching:** Single page load; `revalidatePath` on story/world/character mutations already in place.

---

## Compatibility matrix

| Future feature | V3 compatibility |
|----------------|------------------|
| **Projects** | Bundle adds `projectId`; Setting may list **multiple worlds** via `story_worlds` ([PROJECT_ARCHITECTURE_AUDIT.md](./PROJECT_ARCHITECTURE_AUDIT.md)) — one Setting subsection per linked world |
| **Scenes** | Insert **Scene beats** between Chapters and Cast, or nested under Chapters; Setting filters by scene’s `location_id` |
| **Assets** | “Props in this story” strip reads asset↔story links; no asset CRUD on story |
| **Comics** | Chapters → pages/panels; moodboard + cast refs surfaced for panel context ([REFERENCE_IMAGE_STRATEGY.md](./REFERENCE_IMAGE_STRATEGY.md)) |
| **Publishing** | Finish path extends to publish; V3 context panels become portfolio preview inputs |
| **Generation** | `assembleCombinedContextPacket` unchanged; UI mirrors what packet already uses |

---

## Multi-world evolution (post-Project)

V3 ships for **single primary world** (`stories.world_id`). Project phase extends Setting only:

```
Setting
├── World: Aldermere (primary)
│   ├── Locations · Map · Mood
├── World: Cittàgazze (also in this story)
│   ├── Locations · Map · Mood
└── [+ Link another world]
```

Cast rules relax when `story_worlds` ships; relationship graph logic unchanged (roster-filtered).

---

## What stays on World / Character pages

| Surface | World / Character page | Story V3 |
|---------|------------------------|----------|
| Upload portrait / slots | ✅ Edit | Read roster thumb + link |
| Add relationship | ✅ Edit | Read bond chips |
| Add location | ✅ Edit | Read cards |
| Map upload / pins | ✅ Edit | Read preview |
| Moodboard upload | ✅ Edit | Read strip |
| Rules, cultures, bible tabs | ✅ Edit | Not shown (link to world advanced) |
| Personality traits | ✅ Edit | Optional one-line from bible later |

---

## UI component map (planned)

| Component | Type | Replaces / extends |
|-----------|------|-------------------|
| `StoryWorkspaceView` | Orchestrator | Story page layout |
| `StoryCastConnectionsPanel` | New | Wraps `StoryPageCharactersSection` + `StoryRelationshipStrip` |
| `StoryRelationshipStrip` | New | Read-only bond chips |
| `StorySettingPanel` | New | Evolves `StoryWorldSection` |
| `StoryLocationsPreview` | New | Read-only grid |
| `StoryMapPreview` | New | Read-only map + pins |
| `StoryMoodboardStrip` | New | Read-only horizontal gallery |
| `StoryFinishPath` | Keep | — |
| `StoryChaptersPanel` | Keep | — |
| `StoryAdvancedPlan` | Keep | — |

---

## Migration impact

### Database

| Change | Required for V3? |
|--------|------------------|
| New tables | **No** |
| New columns | **No** |
| New views | **No** |
| RLS changes | **No** |

All surfaces read existing: `story_characters`, `character_relationships`, `world_locations`, `world_maps`, `map_location_pins`, `world_moodboards`, `world_moodboard_items`.

### API / server actions

| Change | Impact |
|--------|--------|
| `getStoryWorkspaceBundle()` | **New** — composes existing actions |
| Existing CRUD actions | **Unchanged** |
| `getCombinedContextPacket()` | **Unchanged** — generation path |

### Routes

| Route | V3 impact |
|-------|-----------|
| `/dashboard/worlds/[worldId]/stories/[storyId]` | Layout swap to `StoryWorkspaceView` |
| `/dashboard/stories/[storyId]` | Optional alias (Phase A5) — same bundle, resolve world from story |
| Character / World routes | **Unchanged** |

### Frontend

| Area | Effort |
|------|--------|
| Story page server component | Medium — fetch bundle |
| 4 new read components | Medium |
| `StoryWorldSection` | Replace with `StorySettingPanel` |
| Copy updates | Low — remove “Stories live inside a world” |
| Finish path anchors | Low — add `#story-setting`, `#cast-connections` if needed |

### Risk

| Risk | Mitigation |
|------|------------|
| Page load latency (many parallel fetches) | Single bundle action; parallel `Promise.all` |
| Creator expects edit on story | Clear “Edit on world/character →” CTAs |
| Empty states feel broken | Match world page empty copy + deep link |
| Multiverse still blocked | Document as Project phase; V3 still helps single-world |

### Rollout

| Phase | Scope |
|-------|-------|
| **V3.0** | Single world; read surfaces; relationship strip; setting panel |
| **V3.1** | Location cover images on story cards (when world UI wires covers) |
| **V3.2** | Optional sticky setting column on desktop |
| **Project E2** | Multi-world Setting stacks |

---

## Success criteria

Founder can:

1. Open a story and see **cast + how they connect** without opening character pages  
2. See **where the story happens** (locations + map) while writing chapters  
3. See **tone** (moodboard) without opening the world page  
4. Deep-link to world/character to **edit** without losing story context (browser back)  
5. Complete child-comic and fantasy-novel scenarios from [PROJECT_FRICTION_REPORT.md](./PROJECT_FRICTION_REPORT.md) **without page hops** for read tasks  

**Not required for V3 success:** Multiverse (blocked until Projects + `story_worlds`).

---

## Implementation gate

| Prerequisite | Status |
|--------------|--------|
| Phase A1 story layout | ✅ Shipped |
| Phase A continuation (relationships, locations, map, moodboard) | ✅ Shipped (needs migration live) |
| Project Friction Report approved | ✅ |
| This document approved | Pending |

**Do not start Project entity until V3 read surfaces ship** — friction report recommends fixing story context first.

---

## Related documents

| Doc | Role |
|-----|------|
| [PROJECT_FRICTION_REPORT.md](./PROJECT_FRICTION_REPORT.md) | Problem statement |
| [REFERENCE_IMAGE_STRATEGY.md](./REFERENCE_IMAGE_STRATEGY.md) | Story/comic ref hierarchy |
| [PHASE_A1_IMPLEMENTATION_REPORT.md](./PHASE_A1_IMPLEMENTATION_REPORT.md) | Current baseline |
| [PROJECT_ARCHITECTURE_AUDIT.md](./PROJECT_ARCHITECTURE_AUDIT.md) | Multi-world follow-on |
| [IMPLEMENTATION_PHASES_V3.md](./IMPLEMENTATION_PHASES_V3.md) | Build order |

---

**Summary:** Story Workspace V3 is a **read-aggregate layer** — chapters first, then cast connections, then setting visuals — with all edits still on Character and World pages. Zero schema duplication; primary creation environment moves to the story without blocking future Projects or Scenes.
