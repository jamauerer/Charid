# Story Workspace V3 — Implementation Report

**Date:** 2026-06-14  
**Status:** Implemented  
**Authority:** [STORY_WORKSPACE_V3.md](./STORY_WORKSPACE_V3.md) (approved) · [PROJECT_FRICTION_REPORT.md](./PROJECT_FRICTION_REPORT.md)

---

## Summary

Story Workspace V3 closes the **context-switching friction** between Story, World, and Character pages. The story page now **reads aggregated context** from existing tables — cast bonds, locations, map, moodboard — without duplicating data or adding CRUD on the story surface.

**Layout order (unchanged above, new below chapters):**

1. What's next + Chapters (A1 — unchanged)
2. **Cast & Connections** — roster + relationship bond chips
3. **Setting** — world header + locations grid + map preview + moodboard strip
4. Advanced plan + Edit details (A1 — unchanged)

World and Character pages remain the **canon editing surfaces**.

---

## Database changes

**None.** V3 is a read-aggregate UI layer only.

Requires Phase A worldbuilding migration live (`character_relationships`, `world_locations`, `world_maps`, `world_moodboards`).

---

## Files changed

### New — server

| File | Purpose |
|------|---------|
| `src/app/actions/story-workspace.ts` | `getStoryWorkspaceContext()` — parallel fetch of cast, bonds, locations, map, moodboard |

### New — components (`src/components/story-workspace/`)

| File | Purpose |
|------|---------|
| `StoryCastConnectionsPanel.tsx` | Wraps roster + relationship strip |
| `StoryRelationshipStrip.tsx` | Read-only bond chips (roster-filtered) |
| `StorySettingPanel.tsx` | Setting section orchestrator |
| `StoryWorldHeader.tsx` | World link, Open world, Change/Create world modals |
| `StoryLocationsPreview.tsx` | Read-only location grid |
| `StoryMapPreview.tsx` | Read-only map + pin list |
| `StoryMoodboardStrip.tsx` | Horizontal moodboard scroll |

### Modified

| File | Change |
|------|--------|
| `src/app/dashboard/worlds/[id]/stories/[storyId]/page.tsx` | Uses V3 panels; removed `StoryPageCharactersSection` + `StoryWorldSection` |
| `src/app/actions/stories.ts` | Added `revalidateStoryWorkspacePagesForWorld()` |
| `src/app/actions/world-locations.ts` | Revalidates story pages on location CRUD |
| `src/app/actions/world-maps.ts` | Revalidates story pages on map CRUD |
| `src/app/actions/world-moodboards.ts` | Revalidates story pages on moodboard CRUD |
| `src/components/world-bible/WorldLocationsSection.tsx` | Anchor `id="world-locations"` for deep links |
| `src/components/world-bible/WorldMapSection.tsx` | Anchor `id="world-map"` |
| `src/components/world-bible/WorldMoodboardSection.tsx` | Anchor `id="world-moodboard"` |
| `src/components/character-bible/CharacterRelationshipsSection.tsx` | Anchor `id="character-relationships"` |
| `src/app/actions/character-relationships.ts` | Revalidates story pages when bonds change |

### Retained (unused on story page)

| File | Notes |
|------|-------|
| `StoryWorldSection.tsx` | Superseded by `StorySettingPanel`; kept for reference |
| `StoryPageCharactersSection.tsx` | Superseded by `StoryCastConnectionsPanel` |

---

## Routes changed

| Route | Change |
|-------|--------|
| `/dashboard/worlds/[worldId]/stories/[storyId]` | V3 layout — **same URL**, new sections |

**Unchanged:**

- `/dashboard/worlds/[id]` — edit locations, map, moodboard
- `/dashboard/characters/[id]` — edit relationships, portraits
- `/dashboard/stories` — hub list

### Deep links from story → edit surfaces

| Story section | Target |
|---------------|--------|
| Locations empty / edit | `/dashboard/worlds/[id]#world-locations` |
| Map | `/dashboard/worlds/[id]#world-map` |
| Moodboard | `/dashboard/worlds/[id]#world-moodboard` |
| Relationships | `/dashboard/characters/[id]?focus=relationships` |
| Character roster thumb | `/dashboard/characters/[id]` |
| Open world | `/dashboard/worlds/[id]` |

---

## Data rules

| Surface | Source | Filter |
|---------|--------|--------|
| Roster | `story_characters` + characters | Story scope |
| Bond chips | `character_relationships` | Both endpoints ∈ story roster |
| Locations | `world_locations` | `world_id = story.world_id` |
| Map | `world_maps` + pins | Primary world map |
| Moodboard | `world_moodboards` + items | Story's primary world |

No new tables. No writes from story page for worldbuilding entities.

---

## Founder testing checklist

### Prerequisites

- [ ] Phase A migration applied (`20250701000000_phase_a_worldbuilding_foundations.sql`)
- [ ] Fix script applied (`fix-worldbuilding-foundations-api.sql`)

### Story page — read context

- [ ] Open a story with 2+ roster characters and relationships → **Cast & Connections** shows bond chips
- [ ] Story with 0 relationships → empty state with hint to add on character pages
- [ ] World with locations → **Setting** shows location grid (name, type, description)
- [ ] World with map image + pins → map preview with pin markers and pin list
- [ ] World with moodboard items → horizontal mood strip scrolls
- [ ] Empty world → each subsection shows CTA deep link to world page

### Story page — write unchanged

- [ ] Add chapter still works (primary work area)
- [ ] Add/create character in roster still works without leaving story
- [ ] Finish path / welcome banner unchanged
- [ ] Change world / create world modals still work from Setting header

### Deep links

- [ ] “Edit on world →” from locations scrolls to `#world-locations`
- [ ] Map link opens `#world-map`
- [ ] Moodboard link opens `#world-moodboard`
- [ ] Character avatar in bond chip opens character page
- [ ] Browser back returns to story with context preserved

### Refresh after edits

- [ ] Add location on world page → return to story → new location visible (or refresh)
- [ ] Upload map / add pin on world → visible on story Setting
- [ ] Add moodboard image on world → visible on story strip

### Regression

- [ ] World workspace V2 unchanged (full edit CRUD)
- [ ] Character workspace V2 unchanged (relationship CRUD)
- [ ] Child comic scenario: one world, small cast — full session without world/character hops for **reading** context
- [ ] Fantasy novel scenario: locations + map + mood visible while drafting chapters

---

## Known limitations (V3.0)

| Limitation | Notes |
|------------|-------|
| Single primary world only | Multi-world Setting stacks when Projects + `story_worlds` ship |
| Relationships read-only on story | Add/edit on character pages only |
| Locations / map / mood read-only on story | Add/edit on world pages only |
| Bond chips not force-directed graph | Horizontal chips by design for V3.0 |
| Location cover on story cards | Shows when `cover_image_id` set on world; cover upload UI still world-only |
| No sticky Setting column | V3.1 desktop polish |
| Multiverse stories | Still blocked until Project Stage 2 |

---

## Next steps (recommended order)

1. **Founder sign-off** on checklist above
2. **Project Stage 1** — deploy `projects` + `story_worlds` together (already implemented in codebase; deploy after V3 validation)
3. **V3.1** — location cover polish, optional sticky Setting column
4. **Project Stage 2** — multi-world Setting, relaxed roster rules

---

## Related documents

| Doc | Role |
|-----|------|
| [STORY_WORKSPACE_V3.md](./STORY_WORKSPACE_V3.md) | Approved design |
| [PROJECT_FRICTION_REPORT.md](./PROJECT_FRICTION_REPORT.md) | Problem statement |
| [PHASE_A_CONTINUATION_REPORT.md](./PHASE_A_CONTINUATION_REPORT.md) | Worldbuilding data layer |
| [PROJECT_STAGE_1_IMPLEMENTATION_REPORT.md](./PROJECT_STAGE_1_IMPLEMENTATION_REPORT.md) | Next: universe container (after V3 sign-off) |
