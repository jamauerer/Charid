# Linking Workflow Audit

**Phase:** 2B — Creator Workflow Improvements  
**Date:** 2026-06-14  
**Authority:** [CHARID_VISION_V3.md](./CHARID_VISION_V3.md) · [FOUNDER_OPERATIONS_V1.md](./FOUNDER_OPERATIONS_V1.md)  
**Scope:** Character ↔ World ↔ Story linking only (no Scenes, Assets, AI, billing, or publishing)

**Note:** `docs/CREATOR_JOURNEY_AUDIT.md` was referenced in the Phase 2B brief but does not exist in the repo. This audit draws on code inspection, [UX_BUGS_AND_CONFUSION.md](./UX_BUGS_AND_CONFUSION.md), and V3 navigation work.

---

## Executive summary

| Question | Answer |
|----------|--------|
| Can characters be added to worlds? | **Yes** — via world page modals, character edit form, and `assignCharactersToWorld` |
| Can characters be added to stories? | **Yes** — via story page modals and `addCharacterToStory` / `addCharactersToStory` |
| Were controls missing? | **Yes (before Phase 2B)** — no in-context add/create on world or story pages |
| Were controls broken? | **Partially** — `createCharacter` parsed `world_id` but did not persist it until fixed |
| Removed by V3 navigation? | **No** — V3 moved the global character list to `/dashboard/characters` and added Create modal; it did not remove linking APIs or edit-form paths |

Phase 2B closes the main gap: creators can link and create characters **without leaving** the world or story they are working on.

---

## Data model (current)

| Relationship | Mechanism | Constraint |
|--------------|-----------|------------|
| Character → World | `characters.world_id` (nullable FK) | One world per character |
| Story → World | `stories.world_id` (required FK) | Story lives in exactly one world |
| Character → Story | `story_characters` junction | Character's `world_id` must match story's `world_id` |

There is no direct Character ↔ Story without World alignment. Changing a story's world may unlink characters whose `world_id` no longer matches.

---

## 1. Character ↔ World linking

### Existing behavior (after Phase 2B)

| Path | UI | Server action | Returns to |
|------|-----|---------------|------------|
| **World page → Add Existing Character** | `CharacterPickerModal` (multi-select) | `assignCharactersToWorld` | Same world page |
| **World page → Create New Character** | `ContextualCharacterCreateModal` | `createCharacter` (sets `world_id`) | Same world page |
| **Character edit → World dropdown** | `WorldSelectField` on `/dashboard/characters/[id]` | `updateCharacter` | Character edit page |
| **Global Create → Character** | `CreateModal` / `CharacterForm` | `createCharacter` | Character list or new character page (no world pre-selected) |

**World page location:** `/dashboard/worlds/[id]` → section **Characters in this World** → `WorldCharactersSection`.

### Before Phase 2B

- World roster was **read-only** on the world page (grid of `CharacterCard` only).
- Assigning a character to a world required opening **Edit Character** and choosing a world from the dropdown — a context switch away from the world.
- No bulk assign; one character at a time via edit form.

### Missing controls (resolved)

- Add Existing Character on world page — **added**
- Create New Character on world page with auto-link — **added**
- Multi-select picker — **added**

### Broken behavior (fixed)

- **`createCharacter` ignored `world_id`** — form field was parsed but not inserted. Contextual create on world/story appeared to succeed while character remained unassigned. **Fixed:** `world_id` is now persisted on insert.

### V3 navigation impact

- Sidebar **Characters** → `/dashboard/characters` (was effectively dashboard home list). **Does not affect** world-level linking.
- Global **+ Create** modal does not pre-select world when opened from sidebar — **intentional** alternate path, not a regression of world-page workflow.

---

## 2. Character ↔ Story linking

### Existing behavior (after Phase 2B)

| Path | UI | Server action | Returns to |
|------|-----|---------------|------------|
| **Story page → Add Existing Character** | `CharacterPickerModal` (multi-select, world-scoped) | `addCharactersToStory` | Same story page |
| **Story page → Create New Character** | `ContextualCharacterCreateModal` | `createCharacter` + `addCharacterToStory` | Same story page |
| **Story Bible → Characters tab** | Notes only (`key_characters`, `notes`) | `saveStoryCharactersNotesSection` | Same story (tab) |

**Story page location:** `/dashboard/worlds/[worldId]/stories/[storyId]` → top-level **Characters** section (`StoryPageCharactersSection`), alongside **World** section (`StoryWorldSection`).

### Before Phase 2B

- Story roster lived only inside **Story Bible → Characters tab**, mixed with narrative notes.
- Linking used a **single-select dropdown** of world characters (`StoryCharacterSection` legacy) — one at a time, easy to miss.
- Creating a character for a story required leaving to global character create, then returning to assign world and link to story manually.

### Missing controls (resolved)

- Top-level Characters section on story page — **added** (parity with World section)
- Add Existing / Create New with modals — **added**
- Multi-select — **added**

### Broken behavior

- Same **`createCharacter` / `world_id`** bug affected story contextual create until fixed.
- **`StoryCharacterSection` did not sync** after `router.refresh()` — **fixed** with `useEffect` on `initialEntries` (matches `WorldCharactersSection`).

### V3 navigation impact

- **No removal** of story character APIs or `story_characters` table usage.
- Story list placeholder at `/dashboard/stories` does not expose linking — stories are still opened via world context URL. **Gap:** global stories index has no inline roster actions (acceptable until stories hub ships).

---

## 3. Story ↔ World linking

### Existing behavior (after Phase 2B)

| Path | UI | Server action | Returns to |
|------|-----|---------------|------------|
| **Story page → Change World** | Modal + world select | `changeStoryWorld` | Story under new world URL |
| **Story page → Create New World** | `WorldForm` in modal | `createWorld` + `changeStoryWorld` | Story under new world URL |
| **Create story** | `NewStoryModal` on world page | `createStory` with `world_id` | Story in current world |

**Side effect:** `changeStoryWorld` removes `story_characters` rows where the character's `world_id` ≠ new world (characters are not auto-migrated).

### Before Phase 2B

- World assignment only at **story create** or implicit via URL (`/dashboard/worlds/[id]/stories/...`).
- No in-story **Change World** or **Create New World** without navigating away.

### Missing controls (resolved)

- Change World — **added** (`StoryWorldSection`)
- Create New World with auto-link — **added**

---

## 4. Component map

```
World page
 └── WorldCharactersSection
      ├── CharacterPickerModal (mode: world)
      └── ContextualCharacterCreateModal

Story page
 ├── StoryWorldSection
 │    ├── Change World modal → changeStoryWorld
 │    └── Create New World modal → WorldForm → changeStoryWorld
 └── StoryPageCharactersSection
      └── StoryCharacterSection
           ├── CharacterPickerModal (mode: story)
           └── ContextualCharacterCreateModal (+ addCharacterToStory)

Story Bible → Characters tab
 └── StoryCharactersSection (notes only; roster at top of story page)
```

---

## 5. Recommended UX (next iterations)

| Priority | Recommendation | Rationale |
|----------|----------------|-----------|
| **P1** | When **Change World**, show preview of characters that will be unlinked | Prevents surprise data loss |
| **P1** | **CreateModal** character flow: optional “assign to world” when user arrived from a world/story deep link | Reduces orphan characters from global create |
| **P2** | **World picker** on character create from `/dashboard/characters` | Same as P1 for list context |
| **P2** | **Unassigned characters** filter in world picker (“characters not in any world”) | Speeds “Add Existing” on new worlds |
| **P3** | **Guest characters** in story (appear in one story but not world roster) | Requires model change; defer to Scene architecture |
| **P3** | Surface **story roster count** on world story cards | At-a-glance continuity without opening story |

Do **not** build yet: Scene-level cast, Asset linking, AI context assembly, marketplace, publishing.

---

## 6. Verification checklist

Manual pass (logged-in creator):

- [ ] World page: Add Existing Character (multi) → characters appear in grid; stay on world
- [ ] World page: Create New Character → character has `world_id`; stay on world
- [ ] Story page: Add Existing Character from world roster → stay on story
- [ ] Story page: Create New Character → linked to story and world; stay on story
- [ ] Story page: Change World → URL updates; incompatible story characters removed
- [ ] Story page: Create New World → story moves to new world; stay on story
- [ ] Character edit: World dropdown still updates `world_id`
- [ ] Story Bible → Characters tab: notes save; roster not duplicated

---

## 7. Related design docs

- [SCENE_ARCHITECTURE_V1.md](./SCENE_ARCHITECTURE_V1.md) — Scenes as bridge between stories, worlds, and characters (not implemented)
- [ASSET_SYSTEM_V1.md](./ASSET_SYSTEM_V1.md) — First-class assets with ownership/scene history (not implemented)

---

## Summary

Linking **always existed at the data layer** but **contextual controls were missing or hard to discover** before Phase 2B. V3 navigation reorganized global IA without removing link capabilities. Phase 2B implements the V3 principle: *creators should not leave the object they are working on to create related content.*
