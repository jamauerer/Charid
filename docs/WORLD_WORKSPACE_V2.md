# World Workspace V2

**Status:** Approved UX correction — **planning only, no implementation**  
**Date:** 2026-06-14  
**Version:** 2.0  
**Authority:** [CHARID_VISION_V3.md](./CHARID_VISION_V3.md) · [FINISHED_CREATIVE_WORK_PRINCIPLE.md](./FINISHED_CREATIVE_WORK_PRINCIPLE.md)  
**Related:** [PROJECT_CENTERED_INFORMATION_ARCHITECTURE.md](./PROJECT_CENTERED_INFORMATION_ARCHITECTURE.md) · [CHARACTER_WORKSPACE_V2.md](./CHARACTER_WORKSPACE_V2.md) · [SCENE_ARCHITECTURE_V1.md](./SCENE_ARCHITECTURE_V1.md) · [ARCHITECTURE_COMPATIBILITY_REPORT.md](./ARCHITECTURE_COMPATIBILITY_REPORT.md) · [WORLD_BIBLE_V1.md](../WORLD_BIBLE_V1.md)

---

## Purpose

Redesign the **creator-facing world page** so it feels like **a place** — not a database record optimized for continuity metrics.

Creators think in:

> Places · Locations · Maps · Stories · Characters

**Continuity architecture is unchanged.** World Bible, world image slots, reference graph, and World Context Packet remain internal. V2 is **information architecture and layout** — same data, surfaced for creators.

---

## Founder testing findings

| Finding | Current behavior (V1) | Creator mental model |
|---------|---------------------|----------------------|
| **Metrics dominate** | `WorldBibleMetricsHeader` + reference checklist before creative work | “What does this world look like?” first |
| **Tab-based bible** | Overview · Locations · Cultures · Rules · Assets — one panel at a time | Places and images should be visible together |
| **Cover separate from bible slots** | Hero cover on page; slot gallery hidden in Locations tab | One **World Gallery** — cover, map, mood, locations |
| **Locations are slots, not places** | Six fixed image slots — not named Forest, Village, Castle | Locations should become **named places** |
| **Stories imply ownership** | `WorldStoriesSection` — stories “in this world” via `world_id` | Stories may **span** multiple worlds (multiverse) |
| **Characters after bible + edit form** | Characters section at page bottom | Cast of the world matters earlier |
| **Map is one slot among many** | `canonical_map` buried in Locations tab | **World Map** is first-class, optional, evolvable |

**Verdict:** The world page reads like a **continuity dashboard**. V2 makes it read like **entering a place**.

---

## Design goals

| # | Goal |
|---|------|
| 1 | Make worlds **visually understandable** at a glance |
| 2 | Support **simple** creator workflows (child, afternoon comic) |
| 3 | Support **advanced worldbuilding** without a separate product |
| 4 | Prepare for future **Locations**, **Scenes**, and **interactive maps** |
| 5 | Reduce focus on **consistency metrics** on the default path |

---

## Current layout (V1 — shipped)

Route: `/dashboard/worlds/[id]`

```
1. Back link
2. Hero cover banner + name + description + public badge
3. WorldBibleView
   ├── WorldBibleMetricsHeader      ← consistency scores
   ├── WorldReferenceChecklist
   ├── WorldSectionNav tabs         ← Overview | Locations | Cultures | Rules | Assets
   └── Active tab panel
4. Edit World form
5. WorldStoriesSection
6. WorldCharactersSection
```

**Internal slots today** (`WORLD_CORE_SLOT_ROLES`): `canonical_map`, `canonical_reference`, `location`, `environment`, `architecture`, `mood_board` — assigned via Locations or Assets tabs.

---

## V2 layout (target)

Single scroll page — **no primary tab bar**. Advanced worldbuilding collapsed (same pattern as [CHARACTER_WORKSPACE_V2.md](./CHARACTER_WORKSPACE_V2.md) and Story A1 `StoryAdvancedPlan`).

```
┌─────────────────────────────────────────────────────────┐
│ 1. WORLD HEADER                                         │
│    Name · tagline · compact progress · visibility       │
├─────────────────────────────────────────────────────────┤
│ 2. WORLD GALLERY              ← primary workspace       │
│    Cover · Map · Location images · Mood board           │
├─────────────────────────────────────────────────────────┤
│ 3. LOCATIONS                  ← named places (future)   │
│    Forest · Village · Castle · … · Add location         │
├─────────────────────────────────────────────────────────┤
│ 4. STORIES                                              │
│    In this world · Add story · Create story             │
├─────────────────────────────────────────────────────────┤
│ 5. CHARACTERS                                           │
│    Cast · Add character · Create character              │
├─────────────────────────────────────────────────────────┤
│ 6. WORLD DETAILS                                        │
│    Description · genre · tone · climate (essential)     │
├─────────────────────────────────────────────────────────┤
│ 7. ▸ ADVANCED WORLDBUILDING       (collapsed)           │
│    Rules · cultures · themes · era · deep overview      │
├─────────────────────────────────────────────────────────┤
│ 8. ▸ CONTINUITY INSIGHTS          (collapsed)           │
│    Metrics · reference checklist · graph                │
└─────────────────────────────────────────────────────────┘
```

### Section priority rationale

| Order | Section | Why here |
|-------|---------|----------|
| **1** | Header | “Where am I?” — world identity + progress |
| **2** | Gallery | Visual anchor — cover, map, atmosphere |
| **3** | Locations | Places within the world |
| **4** | Stories | Narratives that use this world |
| **5** | Characters | Who lives here |
| **6** | World details | Short essential metadata |
| **7** | Advanced worldbuilding | Rules, cultures — pro depth |
| **8** | Continuity insights | Metrics — never first |

---

## 1. World Header

### Contents

| Element | Source | Creator sees |
|---------|--------|--------------|
| Name | `worlds.name` | World name |
| Tagline | `worlds.description` (first line) or `world_bible.overview` excerpt | One-line sense of place |
| Thumbnail | Cover slot or `canonical_reference` | Small preview |
| Visibility | `worlds.is_public` | Public / Private |
| **Progress** | Computed checklist | `Cover ✓ · Map ✓ · Locations ✗ · Stories ✗` + `50% complete` |

### Remove from header (move to Continuity Insights)

- World profile complete %
- World consistency %
- Reference coverage %
- “World workspace” as primary chrome label

### Copy

- Label: **World** — not “World Bible”
- Subline example: *A forest kingdom where magic grows in the trees*

---

## 2. World Gallery

**The gallery is the primary workspace.** Creators immediately see **which image is used where**.

### Required gallery groups (creator-facing)

| Gallery card | Purpose | Maps to (internal) |
|--------------|---------|-------------------|
| **Main Cover** | Hero identity — portfolio and world page | `worlds.cover_image_path` + sync to `canonical_reference` slot |
| **World Map** | Geography — optional but first-class | `canonical_map` slot |
| **Location Images** | Visual refs for named places | `location` slot + per-location images (future) |
| **Mood Board** | Tone, color, atmosphere | `mood_board` slot |

### Secondary cards (same gallery, lower prominence)

| Card | Internal slot | Notes |
|------|---------------|-------|
| **Environment** | `environment` | Biomes, landscapes |
| **Architecture** | `architecture` | Buildings, structures |

V1’s six core slots fold into one **World Gallery** grid — no separate Locations / Assets tabs for images.

### Slot card actions

Each card supports **inline** actions — no navigation away:

| Action | Behavior |
|--------|----------|
| **Upload** | File → assign to this role in place |
| **Generate** | AI generate scoped to slot *(Phase F — placeholder until AI)* |
| **Assign Existing** | Pick from world gallery assets |
| **Replace** | Swap assignment while keeping role label visible |

**Rule:** Creator always sees **role label on card** (“World Map”, “Mood Board”) so usage is obvious.

### Layout sketch

```
Main Cover (wide hero within gallery)

World Map          Mood Board

Location Images    [+ Add location image]

Environment        Architecture
```

### Label clarity

Use creator labels from [world-asset-role-labels.ts](../src/lib/world-asset-role-labels.ts) — renamed for V2 where needed:

| Internal | V2 creator label |
|----------|------------------|
| `canonical_reference` | Main Cover *(or “World reference” if distinct from cover)* |
| `canonical_map` | World Map |
| `location` | Location Image |
| `mood_board` | Mood Board |

---

## 3. World Maps

**Maps are optional but first-class** — not a hidden slot in a tab.

### V2 behavior (non-interactive)

| Capability | Detail |
|------------|--------|
| **Optional** | Empty map state: “Add a map when you’re ready” |
| **Upload** | Image assigned to World Map card |
| **Generate** | Future AI map illustration *(Phase F)* |
| **Replace** | Swap map without losing world context |

### Future roadmap — interactive maps (not V2 implementation)

Design architecture so maps can evolve:

```
Phase W1 (V2)     Static map image on World Map slot
Phase W2          Named location pins (coordinates on image)
Phase W3          Clickable locations → location detail / scenes
Phase W4          Multi-layer maps (regions, factions)
```

### Data model evolution (planning)

| Stage | Storage |
|-------|---------|
| **Now** | `canonical_map` slot assignment → single image |
| **W2** | `world_maps` table: `id`, `world_id`, `image_id`, `map_type` (`static` \| `interactive`) |
| **W3** | `map_location_pins`: `map_id`, `location_id`, `x`, `y`, `label` |
| **W4** | Layer JSON on `world_maps` — regions, heatmaps |

**Rule:** V2 UI and slot system must not block adding `world_maps` — treat current slot as **default static map** until migration.

### His Dark Materials example (future)

One **Project**, multiple **Worlds**, each with its own **World Map** card:

- Oxford · Cittàgazze · Mulefa World

Stories link to **many** worlds — not nested under one.

---

## 4. Locations

### V2 vision: named places

Locations are **first-class world objects** — not only image slot labels.

| Preset examples | Use |
|-----------------|-----|
| Forest | Wilderness |
| Village | Settlement |
| Castle | Fortified place |
| Mountain | Terrain feature |
| City | Urban hub |
| Ruins | Adventure site |
| River | Water feature |
| **Custom** | Creator-defined |

### Location entity (future schema sketch)

```sql
-- Planning only — NOT for migration yet

create table public.locations (
  id uuid primary key default gen_random_uuid(),
  world_id uuid not null references public.worlds(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  location_type text,  -- forest, village, castle, custom, ...
  description text,
  sort_order int default 0,
  cover_image_id uuid references public.world_images(id) on delete set null,
  map_pin_x numeric,  -- nullable until interactive maps (W2+)
  map_pin_y numeric,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
```

### Location capabilities (phased)

| Phase | Capability |
|-------|----------|
| **W-L1** | List + add + name + type chip + description |
| **W-L2** | Cover image per location (from gallery upload/assign) |
| **W-L3** | Link location to **Scenes** ([SCENE_ARCHITECTURE_V1.md](./SCENE_ARCHITECTURE_V1.md)) |
| **W-L4** | Pin on World Map (interactive) |

### V2 interim (before `locations` table)

- **Locations section** on world page with empty state + “Add location” *(disabled or simple text list in stub)*
- World Gallery **Location Images** card still uses `location` slot for single anchor image
- Story bible **Locations** tab remains advanced planning until world locations ship

### UX

```
Locations
┌──────────┐ ┌──────────┐ ┌──────────┐
│ Forest   │ │ Village  │ │ + Add    │
│ [image?] │ │ [image?] │ │ location │
└──────────┘ └──────────┘ └──────────┘
```

Child path: pick preset type chip → name → optional picture.

---

## 5. Stories

Move stories **above** edit form and bible tabs. Clarify relationship to world.

### V2 copy shift

| V1 (implies ownership) | V2 (relationship) |
|------------------------|-------------------|
| “Stories in this world” | “Stories in this world” + “Also appears in…” when N:M ships |
| Create story only from world | **Add story** (link existing) + **Create story** |

### Actions

| Action | Behavior |
|--------|----------|
| **Add to World** | Link existing story via `story_worlds` junction *(Phase E)* — interim: stories with this `world_id` |
| **Create Story** | Modal → new story associated with this world → redirect to story workspace |

### Multiverse (architecture direction)

Per [PROJECT_CENTERED_INFORMATION_ARCHITECTURE.md](./PROJECT_CENTERED_INFORMATION_ARCHITECTURE.md):

> **Do not model Story as a child of World.**

```
Story ↔ World   many-to-many

His Dark Materials (Project)
├── Story: The Golden Compass
│     └── Worlds: Oxford (primary), Cittàgazze (visited)
├── Story: The Subtle Knife
│     └── Worlds: Will's Oxford, Cittàgazze, …
└── Worlds: Oxford, Cittàgazze, Mulefa World
```

**V2 UI** lists stories **linked** to this world. When N:M ships, same story appears on multiple world pages without duplication of story rows.

---

## 6. World Details

Essential metadata — always visible, not buried in Overview tab.

| Field | Required? | Notes |
|-------|-----------|-------|
| **Description** | Recommended | “What is this place?” |
| **Genre** | Optional | Fantasy, sci-fi, … |
| **Tone** | Optional | Whimsical, dark, … |
| **Climate / setting** | Optional | From `world_bible.climate` |

Long-form **overview**, **themes**, **era** move to Advanced Worldbuilding.

---

## 7. Advanced Worldbuilding (collapsed)

Wraps former bible tabs: Overview (deep), Rules, Cultures, extended reference assets.

| Content | Source (internal) |
|---------|-----------------|
| Overview (full) | `world_bible.overview` |
| Themes | `world_bible.themes` |
| Era | `world_bible.era` |
| Rules | `world_bible.rules` |
| Cultures | Cultures section form |
| Extra reference assets | Gallery overflow beyond core cards |

Label: **Advanced worldbuilding** — not “World Bible”.

---

## 8. Continuity Insights (collapsed)

Home for V1 chrome that appeared first:

| Component (existing) | V2 placement |
|---------------------|--------------|
| `WorldBibleMetricsHeader` (full) | Collapsed section |
| `WorldReferenceChecklist` | Collapsed section |
| Reference graph detail | Collapsed section |

Subtitle: “Reference coverage and consistency — for when you want to go deeper.”

---

## Progress indicator

Single creator-facing checklist — not multiple metric bars.

### Example

```
Cover ✓   World Map ✓   Locations ✗   Mood Board ✗   Stories ✓   Characters ✗

50% complete
```

### Checklist items

| Item | Complete when |
|------|---------------|
| **Cover** | Main cover set |
| **World Map** | Map slot filled *(optional — excluded from % if skipped)* |
| **Locations** | ≥1 named location *(Phase W-L1)* or location slot filled *(interim)* |
| **Mood Board** | Mood board slot filled |
| **Stories** | ≥1 story linked to world |
| **Characters** | ≥1 character linked to world |

Optional map: if creator marks “No map for this world”, exclude from denominator.

---

## Relationship model

### Today (V1)

```
World 1──N Stories     (stories.world_id NOT NULL)
World 1──N Characters  (characters.world_id optional)
```

### Target (Phase E+)

```
Project 1──N Worlds
Project 1──N Stories
Story N──M Worlds      (story_worlds junction)
World 1──N Locations
World 1──N Characters  (character_worlds junction optional)
Scene N──1 Location    (future)
```

### World page in target model

- World page shows **linked stories**, not owned stories only
- **Create Story** adds association, not necessarily exclusive parent
- World remains a **place**; Story remains the **narrative hub** ([PHASE_A1_IMPLEMENTATION_REPORT.md](./PHASE_A1_IMPLEMENTATION_REPORT.md))

---

## Creator workflows

### Child workflow (~10)

```
Create world → Name it → Add cover picture → Add mood board
→ Add one location (“Forest”) → Create story in this world
→ Add character → Done
```

- Never sees consistency scores unless expanded
- Map optional — “Skip map” OK
- World feels like a **setting for their comic**

### Hobbyist workflow

```
Cover + map + 2–3 locations → Stories and characters linked
→ World details (genre, tone) → Advanced rules when magic system matters
```

### Professional workflow

```
Full gallery → Location library with scene links → Multiverse story associations
→ Advanced cultures/rules → Continuity insights for IP bible export
→ Interactive map pins (future)
```

**Same page. Emergent complexity.**

---

## Migration impact

### Schema

| Change | Required for V2 layout? |
|--------|-------------------------|
| World gallery UI merge | **No** — uses existing slots + cover |
| `locations` table | **Phase W-L1** — stub UI can ship first |
| `world_maps` table | **Deferred** — static slot sufficient for V2 |
| `story_worlds` junction | **Phase E** — N:M stories |
| World Bible tables | **Keep** — no replacement |

### Code / components

| V1 | V2 disposition |
|----|----------------|
| Hero cover block + `WorldBibleView` | Merge into unified `WorldWorkspaceV2` |
| `WorldSectionNav` | Remove as primary; content → Details / Advanced |
| `WorldLocationSlotsSection` | Merge into `WorldGallery` |
| `WorldReferenceSection` | Merge into gallery + Advanced overflow |
| `WorldBibleMetricsHeader` | → Continuity Insights |
| `WorldStoriesSection` / `WorldCharactersSection` | Move up; add actions |
| `EditWorldForm` | Split: Details (inline) + cover via gallery |

### Continuity

- Slot assignments unchanged
- World reference graph assembly unchanged
- World Context Packet unchanged
- Scoring unchanged — display location only

---

## Implementation recommendations

### Phasing

| Slice | Deliverable | Depends on |
|-------|-------------|------------|
| **W1** | V2 layout shell + Header + collapsed Advanced / Insights | — |
| **W2** | Unified `WorldGallery` (cover, map, mood, location, env, arch) | — |
| **W3** | World Details inline section | — |
| **W4** | Stories + Characters moved up; Create / Add actions | Phase 2B patterns |
| **W5** | Creator progress checklist | W2, W4 |
| **W6** | Locations entity + UI (W-L1) | Migration |
| **W7** | `story_worlds` N:M display | Phase E |
| **W8** | Map architecture (`world_maps`) + pins | Post–W-L1 |
| **W9** | Interactive map | Future — not V2 |
| **W10** | Generate on slot | Phase F (AI) |

**Suggested timing:** Parallel with [CHARACTER_WORKSPACE_V2.md](./CHARACTER_WORKSPACE_V2.md) (C1–C5) — shared “workspace V2” pattern.

### New components (planned)

| Component | Responsibility |
|-----------|----------------|
| `WorldWorkspaceV2` | Page layout orchestrator |
| `WorldHeader` | Name, tagline, progress |
| `WorldGallery` | Unified image cards |
| `WorldGalleryCard` | Single role — upload / assign / replace |
| `WorldLocationsSection` | Named places list + add |
| `WorldStoriesPanel` | Linked stories + actions |
| `WorldCharactersPanel` | Cast + Phase 2B modals |
| `WorldDetailsSection` | Essential metadata |
| `WorldAdvancedBuilding` | Collapsed rules / cultures / deep overview |
| `WorldContinuityInsights` | Collapsed metrics + checklist |
| `lib/world-creator-progress.ts` | Checklist + % |

### Files likely touched

| File | Change |
|------|--------|
| `src/app/dashboard/worlds/[id]/page.tsx` | V2 layout |
| `src/components/world-bible/WorldBibleView.tsx` | Refactor or replace |
| `src/lib/creator-vocabulary.ts` | World-facing labels |

### Founder testing checklist (post-implementation)

- [ ] New world: cover addable **without scrolling past metrics**
- [ ] World Map card clearly labeled; upload/assign/replace work in place
- [ ] Creator can explain which image is cover vs map vs mood board
- [ ] Locations section visible before Advanced Worldbuilding
- [ ] Stories and Characters above collapsed sections
- [ ] Create Story from world page works
- [ ] Add Character from world page (Phase 2B regression)
- [ ] Continuity Insights collapsed by default
- [ ] Child describes world as a **place**, not a form
- [ ] Optional map skip does not block progress unfairly

---

## Relationship to Character Workspace V2

| Pattern | Character V2 | World V2 |
|---------|--------------|----------|
| Primary workspace | Character Gallery | World Gallery |
| Places / cast early | Relationships, Stories | Locations, Stories, Characters |
| Metrics hidden | Continuity Insights | Continuity Insights |
| Advanced collapsed | Advanced character details | Advanced worldbuilding |
| Map / slots | Portrait + turnaround + expressions | Cover + map + mood + locations |

Both apply: **visualize first, analyze later**.

---

## Rationale summary

| Audience | V1 pain | V2 answer |
|----------|---------|-----------|
| **Child** | Metrics and tabs before pictures | Cover + mood + one location first |
| **Hobbyist** | Where is the map? | World Map card in gallery |
| **Professional** | Multiverse doesn’t fit world → story | Story ↔ World N:M (Phase E) |
| **Future** | Scenes need places | Location entities + scene links |
| **Continuity engine** | Unchanged | Same slots, graph, packet, bible |

**The world should feel like a place. The continuity layer stays powerful underneath.**

---

## Document index

| Doc | Role |
|-----|------|
| [PROJECT_CENTERED_INFORMATION_ARCHITECTURE.md](./PROJECT_CENTERED_INFORMATION_ARCHITECTURE.md) | Story ↔ World N:M |
| [CHARACTER_WORKSPACE_V2.md](./CHARACTER_WORKSPACE_V2.md) | Parallel workspace redesign pattern |
| [SCENE_ARCHITECTURE_V1.md](./SCENE_ARCHITECTURE_V1.md) | Locations → scenes |
| [WORLD_BIBLE_V1.md](../WORLD_BIBLE_V1.md) | Internal continuity stack |

---

## Version

| Version | Date | Notes |
|---------|------|-------|
| 2.0 | 2026-06-14 | Founder UX review — gallery-first world page, maps, locations, N:M stories |
