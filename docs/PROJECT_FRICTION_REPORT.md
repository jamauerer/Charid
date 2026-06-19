# Project Friction Report

**Date:** 2026-06-14  
**Status:** Founder workflow test — **no Projects implementation**  
**Authority:** [PROJECT_ARCHITECTURE_AUDIT.md](./PROJECT_ARCHITECTURE_AUDIT.md) (approved)  
**Prerequisite features tested:** Character Relationships V1 · World Locations V1 · World Maps V1 · World Moodboards V1  
**Gate:** Project implementation should **not** begin until this report is reviewed.

---

## Methodology

Structured founder pass attempting three creative setups on the **current architecture** (post–Workspace V2, post–Phase A continuation). Each scenario follows a realistic build order: world → characters → relationships → locations / map / moodboard → story → chapters.

**Sources:** Live product behavior (routes, create flows, server rules), workspace UI order, and [PROJECT_ARCHITECTURE_AUDIT.md](./PROJECT_ARCHITECTURE_AUDIT.md). Assumes worldbuilding foundations migration (`20250701000000`) is applied.

**Navigation model today:** Home · Stories · Characters · Worlds — no top-level universe container.

---

## Scenario results at a glance

| Scenario | Fit today | Blocker severity |
|----------|-----------|------------------|
| **Child comic** | Good with friction | Low — mostly navigation & duplication |
| **Fantasy novel** | Good | Low — single world matches model |
| **Multiverse-style** | Poor | **High** — single-world story + cast rules |

---

## Scenario 1: Child comic project

**Intent:** Short graphic story — friendly hero, sidekick, hometown, bright mood, 3–5 “chapters” as comic beats.

### Attempted workflow

| Step | Where | Outcome |
|------|-------|---------|
| 1. Create world “Sunnyville” | Create → World | ✅ Works |
| 2. Create hero + sidekick | World page → Characters, or Create → Character | ✅ Works; assign to Sunnyville |
| 3. Portrait + expressions | Character workspace gallery | ✅ Visual-first layout helps child path |
| 4. “Best friend” relationship | Character → Relationships → Add | ✅ Works |
| 5. Places: School, Park | World → Locations → Add | ✅ Works; cards show “No image” |
| 6. Mood reference images | World → Moodboard → Upload | ✅ Works |
| 7. Optional town map | World → Map **and** Gallery “Map & mood” slot | ⚠️ Two places for same idea |
| 8. Create story | Create → Story → **pick world** → form | ✅ Works; set `project_type` = children’s book |
| 9. Add cast to story | Story → Characters | ✅ If characters in same world |
| 10. First chapter | Story finish path → Add first chapter | ✅ Works |

### Friction (child comic)

| Issue | Severity |
|-------|----------|
| No named “project” — “Sunnyville comic” exists only as mental grouping across World + Characters + Story | Medium |
| Home dashboard shows **three equal counts** (Stories / Characters / Worlds) — not “your comic” | Medium |
| Location cards cannot attach images in V1 (schema has `cover_image_id`, UI not wired) — moodboard holds visuals instead | Medium |
| Map appears in **World Gallery** (slot card) **and** **World Map** section — unclear which to use | Medium |
| Relationship picker lists **all studio characters**, not “cast in this world” first | Low |
| Story URL embeds world ID — fine for one world, confusing if kid later adds a “dream world” chapter | Low |

**Verdict:** Completable. Feels like managing **four separate objects** instead of **one comic**.

---

## Scenario 2: Fantasy novel project

**Intent:** Novel in one secondary world — mentor/rival dynamics, named regions, map with pins, longer story arc.

### Attempted workflow

| Step | Where | Outcome |
|------|-------|---------|
| 1. World “Aldermere” | Create → World | ✅ |
| 2. Protagonist, mentor, rival | Character workspace | ✅ |
| 3. Mentor + Rival relationships | Relationships section | ✅ Preset types match fantasy tropes |
| 4. Locations: Forest, Capital, Ruins | World → Locations | ✅ Type chips (forest, city, ruins) fit |
| 5. Upload map + pin locations | World → Map → Add pin → link location | ✅ Strongest V1 worldbuilding win |
| 6. Tone references | Moodboard + gallery environment slot | ✅ Some overlap between moodboard and gallery |
| 7. Story “The Ash Crown” | World page → New Story **or** Create → Story | ✅ |
| 8. Set status / project type novel | Story edit / create form | ✅ |
| 9. Link full cast | Story → Add characters (same world) | ✅ |
| 10. Chapters + continue path | Story workspace | ✅ |

### Friction (fantasy novel)

| Issue | Severity |
|-------|----------|
| **Relationships not visible on story page** — must open each character to see mentor/rival web | Medium |
| **Locations not visible on story page** — world context is one world link, not “scenes happen in Forest” | Medium |
| Cast + world + story on **three hub lists** — finding “everything for Aldermere” requires world page as hub | Medium |
| Advanced worldbuilding (rules, cultures) still collapsed — good for child, but novelists may not discover it | Low |
| `project_type` on story vs future **Project** entity naming collision in creator’s head | Low |

**Verdict:** **Best fit** for current architecture. Single world + single story + rich world page is what the schema assumes.

---

## Scenario 3: Multiverse-style project

**Intent:** His Dark Materials–style — two worlds (e.g. “Lyra’s Oxford”, “Cittàgazze”), characters in different worlds, cross-world relationship, one story arc visiting both.

### Attempted workflow

| Step | Where | Outcome |
|------|-------|---------|
| 1. Create world A + world B | Create → World (×2) | ✅ |
| 2. Lyra in world A, Will in world B | Characters with different `world_id` | ✅ |
| 3. Relationship Lyra ↔ Will | Character → Relationships | ✅ **User-scoped** — bond works across worlds |
| 4. Locations per world | Each world page → Locations | ✅ But split across two world workspaces |
| 5. Map per world | Each world → Map | ✅ Correct per-world |
| 6. One story spanning both worlds | Create → Story → **must pick one world** | ❌ **Blocked** |
| 7. Add both characters to story | Story → Characters | ❌ `addCharacterToStory` requires same world as story |
| 8. Workaround: `changeStoryWorld` | Story → Change World | ⚠️ **Moves** story; unlinks characters from other world |
| 9. Workaround: duplicate story per world | Manual | ❌ Loses single narrative; breaks finish path intent |
| 10. See “all worlds in this IP” | — | ❌ No container; Worlds list mixes all universes |

### Friction (multiverse)

| Issue | Severity |
|-------|----------|
| Story **must** belong to exactly one world | **Critical** |
| Story roster **must** match that world’s characters | **Critical** |
| URL `/worlds/{A}/stories/{id}` implies story “lives in” A even when narrative is in B | **High** |
| Relationships work but **story page never surfaces them** for cross-world pairs | High |
| Two worlds = **two full workspace scrolls** (gallery, map, moodboard, locations each) — no unified “universe overview” | High |
| Moodboard/map/location work **per world** — correct data model, but no cross-world story to tie them together | High |
| Create flow teaches “pick a world for your story” — opposite of multiverse mental model | High |

**Verdict:** **Not buildable** as one coherent multiverse story without workarounds that lose data or split the narrative. Confirms [PROJECT_ARCHITECTURE_AUDIT.md](./PROJECT_ARCHITECTURE_AUDIT.md): **Story ↔ World N:M required with Projects**, not optional follow-up.

---

## V1 feature founder tests

### Relationships V1

| Test | Result |
|------|--------|
| Add friend / mentor / custom | ✅ |
| See bond on other character’s page | ✅ Inverse labels for directed types |
| See bonds from story cast view | ❌ Not on story page |
| Filter picker to same world / same “project” | ❌ All user characters |
| Relationship + story arc notes | ⚠️ Notes field only; no story link |

**Awkward:** Building cast dynamics requires **N character page visits**; no relationship graph or story-level “dynamics” panel.

### Locations V1

| Test | Result |
|------|--------|
| Add forest / village / castle | ✅ |
| Describe place | ✅ |
| Attach image to location card | ❌ UI not shipped (column exists) |
| Use location on story / chapter | ❌ No story↔location link |
| Pin on map → link location | ✅ When map + locations exist |

**Awkward:** Locations are **world-only artifacts** — story planning still blind to “where does this chapter happen?”

### Maps V1

| Test | Result |
|------|--------|
| Upload map | ✅ |
| Place pins with labels | ✅ Click-to-place works |
| Link pin to named location | ✅ Optional dropdown |
| Same map via gallery slot | ⚠️ Duplicate path via World Gallery `canonical_map` |
| Map on story page | ❌ |

**Awkward:** Map setup is strong on world page; **invisible during story writing**.

### Moodboards V1

| Test | Result |
|------|--------|
| Upload tone images | ✅ |
| Add from gallery | ✅ |
| Remove items | ✅ |
| Mood slot in gallery vs moodboard grid | ⚠️ Two systems (single slot vs collection) |
| Moodboard at project level | ❌ Per world only |

**Awkward:** For child comic, moodboard is the right tool; **gallery mood slot feels redundant** for the same creative job.

---

## Direct answers

### What felt awkward?

1. **No universe name** — creators think “my comic / my novel / my HDM”; app thinks “world + story + characters.”
2. **World Map vs World Gallery map slot** — two entry points for one map image.
3. **Moodboard vs mood_board gallery slot** — same duplication pattern.
4. **Locations without images** — cards look broken next to rich gallery above.
5. **Relationships live on characters only** — story planning doesn’t show the cast graph.
6. **Multiverse: relationship works, story doesn’t** — the product partially supports cross-world bonds but forbids cross-world narrative.
7. **`changeStoryWorld` copy** — “Move story” + unlink characters feels destructive for multiverse intent, not additive.
8. **`stories.project_type`** — reads like “project” but means output format (novel vs comic).

### What required unnecessary navigation?

| Pattern | Example |
|---------|-----------|
| Hub → entity → back → hub → other entity | Home → World → Character → back → Story |
| Same task, two surfaces | Map upload in Gallery **and** Map section |
| Story context missing worldbuilding | Write chapters on story page; map/locations on world page |
| Finding all pieces of one IP | Three sidebar lists + no filter |
| Cross-character relationship setup | Open character A → add → open B to verify inverse |
| Create story | Must go Create → Story → **choose world** even when already on world page (world page has shortcut — Create modal doesn’t remember context) |

**World page** is the de facto “project hub” for single-world work — but it is **not labeled or designed** as such, and it **cannot span worlds**.

### What information was hard to find?

| Information | Where it hides |
|-------------|----------------|
| “What world is this story in?” | Story page — one world link (OK for single world) |
| “Who is connected to whom?” | Per character only |
| “What places exist?” | World page only |
| “What does this world look like?” | Cover + moodboard + gallery — scattered |
| “All stories in this universe” | World page if one world; **no cross-world list** |
| “All characters in this universe” | World page partial; global list unscoped |
| Map pins ↔ locations | World map section only |
| Progress toward “done” | Per-entity progress bars — no project-level completion |

### What would benefit from a Project container?

| Need | How Project helps |
|------|-------------------|
| **Name the creative universe** | “My Comic”, “Aldermere”, “His Dark Materials” |
| **Single home for cast + worlds + stories** | Project workspace replaces bouncing between three hubs |
| **Multiverse stories** | `story_worlds` N:M under project scope ([audit](./PROJECT_ARCHITECTURE_AUDIT.md)) |
| **Cross-world cast** | Project-scoped roster rules; relax per-story single-world character lock |
| **Relationship graph in context** | Project-level “Cast & bonds” beside story list |
| **Shared mood / tone** | Optional project moodboard or defaults across worlds |
| **Child path simplicity** | Auto-project per user or per first world — UI shows one card |
| **Professional path** | Explicit project for Marvel/LOTR-scale organization |
| **Portfolio / publish** | “Publish this project” vs orphan public entities |
| **Future assets & scenes** | Project as attachment root ([ASSET_SYSTEM_V1.md](./ASSET_SYSTEM_V1.md), [SCENE_ARCHITECTURE_V1.md](./SCENE_ARCHITECTURE_V1.md)) |
| **Rename `project_type`** | Disambiguate story output format from Project entity |

---

## Project container: priority by scenario

| Capability | Child comic | Fantasy novel | Multiverse |
|------------|-------------|---------------|------------|
| Named universe home | Nice | Nice | **Required** |
| Story ↔ World N:M | Low | Low | **Required** |
| Project-scoped character list | Nice | Nice | **Required** |
| Project-scoped relationships | Low | Medium | **Required** |
| Story page shows locations/map | Medium | Medium | High |
| Single-world (degenerate case) | ✅ today | ✅ today | N/A |

---

## Recommendations before Project implementation

### Do not block on

- Location cover image UI (nice polish)
- Map/gallery deduplication (UX cleanup can parallel Project)

### Do block Project start on

- [ ] Founder sign-off on this friction report
- [ ] Worldbuilding foundations migration applied and smoke-tested ([PHASE_A_CONTINUATION_REPORT.md](./PHASE_A_CONTINUATION_REPORT.md) checklist)
- [ ] Agreement that **Stage 1–2** of [PROJECT_ARCHITECTURE_AUDIT.md](./PROJECT_ARCHITECTURE_AUDIT.md) includes **`story_worlds`**, not container-only

### Project phase should address first

1. **`projects` table + project workspace route** — labeled universe home  
2. **`story_worlds` junction + multi-world story UI** — unblocks multiverse scenario  
3. **Project-scoped lists** — characters, worlds, stories filtered together  
4. **`character_relationships.project_id`** — align with shipped V1  
5. **Story alias URL** `/dashboard/stories/[id]` — reduce world-nested navigation pain (Phase A5)  
6. **Rename or clarify `project_type`** in creator UI → “Format” or “Output type”

### Incremental confirmation

The audit is **validated by this pass**:

- **Incremental Projects:** yes — single-world users keep working  
- **Revise ownership first:** no big-bang — but **N:M must ship with Projects**, not after  
- **Phase A V1 features:** shippable and valuable **within a world**; friction is mostly **container and story↔world scope**, not the features themselves

---

## Gate

**Project implementation must not start until:**

1. This report is approved  
2. Phase A continuation migrations are live in founder environment  
3. Product accepts **Project Stage 1 = projects + story_worlds + scoping**, not projects table alone  

---

## Related documents

| Doc | Role |
|-----|------|
| [PROJECT_ARCHITECTURE_AUDIT.md](./PROJECT_ARCHITECTURE_AUDIT.md) | Schema & migration strategy |
| [PROJECT_CENTERED_INFORMATION_ARCHITECTURE.md](./PROJECT_CENTERED_INFORMATION_ARCHITECTURE.md) | Target IA |
| [PHASE_A_CONTINUATION_REPORT.md](./PHASE_A_CONTINUATION_REPORT.md) | V1 feature scope & testing |
| [FOUNDER_TESTING_LESSONS_ROUND_1.md](./FOUNDER_TESTING_LESSONS_ROUND_1.md) | Prior workflow friction themes |
