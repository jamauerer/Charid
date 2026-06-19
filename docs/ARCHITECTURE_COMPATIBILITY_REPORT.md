# Architecture Compatibility Report

**Status:** Assessment only — no implementation  
**Date:** 2026-06-14  
**Authority:** [CHARID_VISION_V3.md](./CHARID_VISION_V3.md) · [FINISHED_CREATIVE_WORK_PRINCIPLE.md](./FINISHED_CREATIVE_WORK_PRINCIPLE.md) · [AI_CREATION_CONTROL_PRINCIPLE.md](./AI_CREATION_CONTROL_PRINCIPLE.md) · [FOUNDER_TESTING_LESSONS_ROUND_1.md](./FOUNDER_TESTING_LESSONS_ROUND_1.md)  
**Related:** [SCENE_ARCHITECTURE_V1.md](./SCENE_ARCHITECTURE_V1.md) · [ASSET_SYSTEM_V1.md](./ASSET_SYSTEM_V1.md) · [LINKING_WORKFLOW_AUDIT.md](./LINKING_WORKFLOW_AUDIT.md)

---

## Executive verdict

**CharID can evolve into the Creator Operating System vision through incremental, additive changes. No major continuity architecture redesign is required.**

Founder Round 1 validated that the **continuity stack is a primary differentiator** and should be **kept, extended, and hidden** — not replaced. The primary gap is **creator workflow** (finish → publish → portfolio), not canon storage.

| Question | Answer |
|----------|--------|
| Replace bibles / reference graph / context packets? | **No** — High rewrite risk, loses differentiation |
| Support child → pro on one architecture? | **Yes** — with additive comic/publish layers + UI simplification |
| Major rewrite needed? | **No** for continuity; **Moderate** additive work for Project, Scene, Asset, comic outputs |
| Primary blocker | Workflow and output tables — not continuity internals |

---

## Continuity architecture confirmation

The following remain **core internal systems**. Creators interact with **Projects, Stories, Characters, Worlds, Scenes, Assets** — not these names:

| Internal system | Storage / assembly | Creator-facing alias |
|-----------------|-------------------|----------------------|
| **Character Bible** | `character_bible` + character identity fields | Character details |
| **World Bible** | `world_bible` | World details |
| **Story Bible** | `story_bible` | Story plan |
| **Reference Graph** | Assembled in `assemble-*-reference-graph.ts` (not a single DB table) | *(automatic)* |
| **Context Packet** | Assembled in `assemble-*-context.ts`; `assembleCombinedContextPacket` merges world + story + characters | *(automatic)* |
| **Continuity systems** | Slot assignments, scores, recommendations | “CharID remembers” |

**Assessment:** This layer is **compatible with V3 and future Scene/Asset objects**. Scenes should **compose into** context packets (new slice: scene cast, location, assets). Assets should **gain nodes** in reference graphs and ownership history — not replace character/world/story image slots.

---

## Existing architecture strengths

### 1. Layered canon model

Three bible tables (`character_bible`, `world_bible`, `story_bible`) plus entity rows give stable, version-ready canon storage. Migrations explicitly reserve future versioning (`version_label`, `is_current`).

### 2. Reference graph + slot pattern

Each entity type has:

- Image gallery table (`character_images`, `world_images`, `story_images`)
- Slot assignment table (`*_image_slot_assignments`)
- Reference graph assembler (runtime, typed nodes)
- Context packet assembler (runtime, AI/export-ready)

This pattern **repeats cleanly** for Scene-scoped references and future Asset images without replacing existing graphs.

### 3. Explicit relationship model

| Link | Mechanism |
|------|-----------|
| Character → World | `characters.world_id` |
| Story → World | `stories.world_id` |
| Character → Story | `story_characters` junction |
| Chapter → Story | `chapters.story_id` |

World alignment rules (story roster requires matching `world_id`) enforce continuity at the data layer.

### 4. Extension hooks in migrations

Original migration comments anticipated growth:

- `stories`: *“Future tables can attach to stories(id): chapters, media, comics…”*
- `chapters`: *“Future: chapter_media, chapter_blocks, chapter_revisions…”*
- `worlds`: *“Future: stories, locations, timelines, media, comics…”*

**Chapters already ship** — the schema was designed for attachment, not replacement.

### 5. Combined context assembly

`assembleCombinedContextPacket(worldId, storyId, characterIds)` proves multi-entity canon merge works today. Adding `sceneId` and asset IDs is an **extension**, not a rewrite.

### 6. Output intent on stories

`stories.project_type` (`novel`, `graphic_novel`, `childrens_book`, `film_animation`, `other`) captures format intent without branching the continuity stack.

### 7. Privacy and ownership defaults

`is_public` on worlds, characters, profiles; RLS owner-scoped — aligns with publish-on-opt-in without architectural change.

---

## Existing architecture risks

| Risk | Severity | Notes |
|------|----------|-------|
| **Internal jargon in UI** | Medium | `*BibleView`, reference checklist — terminology leak, not schema flaw |
| **World-centric URL routing** | Low–Medium | `/dashboard/worlds/[id]/stories/[storyId]` — workable; Project layer may add indirection later |
| **No Project container** | Medium | Large universes group by `user_id` + implicit world sets — manageable until pro scale |
| **Story bible timeline/events as text** | Low | Works for planning; Scenes formalize beats without deleting bible fields |
| **Single world per character** | Low | V3 acceptable; cross-world characters would need junction (future edge case) |
| **Asset implied via images only** | Medium | Blocks Moon Amulet ownership pattern until Asset entity ships |
| **No output/publish schema** | **High (workflow)** | Blocks finish benchmark — separate from continuity risk |
| **Scores/metrics creator-visible** | Low | UX issue; scores can stay internal or move to advanced view |

**None of these require replacing the continuity stack.**

---

## Audience compatibility assessment

### Child creator — short comic in a few hours

| Dimension | Continuity architecture | Workflow / output layer |
|-----------|-------------------------|-------------------------|
| **Can support?** | Yes — character refs, simple story, chapters as hooks | **No today** — no pages/panels, publish reader, template path |
| **Gap type** | UI simplification (hide bibles) | **Missing tables + UX** (comic pages, publish state) |
| **Rewrite risk to fix** | Low (UI pass) | Moderate (additive comic schema) |

**Verdict:** Continuity **supports** the child path once comic + publish layers exist. Architecture does not block; **workflow and output objects are missing**.

### Hobbyist — 20–40 page comic or illustrated story

| Dimension | Continuity architecture | Workflow / output layer |
|-----------|-------------------------|-------------------------|
| **Can support?** | Yes — turnarounds, story roster, story plan, chapters | Partial — chapters are plain text only; no paginated comic structure |
| **Gap type** | Optional scene-level organization | Comic pages, style guide UI, chapter publish |
| **Rewrite risk to fix** | Low | Moderate |

**Verdict:** Bibles + slots scale to longer works. Need **chapter → page → panel** (or illustrated story blocks) and **draft/live publish** — additive.

### Professional — large connected universe

| Dimension | Continuity architecture | Workflow / output layer |
|-----------|-------------------------|-------------------------|
| **Can support?** | Mostly — multi-world via multiple worlds/stories; combined context; rich bibles | Missing Project grouping, Scene continuity layer, Asset ownership history, export pipeline |
| **Gap type** | Project + Scene + Asset objects | Publishing, portfolio featured work, multi-output |
| **Rewrite risk to fix** | Moderate (additive objects) | Moderate |

**Verdict:** Professional scale needs **Project container** and **Scene/Asset** layers on top of existing bibles — not a bible replacement. Context packet assembly becomes richer, not different.

### Creation styles — manual, AI, hybrid

| Style | Architecture compatibility |
|-------|---------------------------|
| **Manual** | **Full** — current CRUD, bibles, uploads; no AI required |
| **AI starting point** | **Compatible** — structure assembly writes to same tables after creator approve ([AI_CREATION_CONTROL_PRINCIPLE.md](./AI_CREATION_CONTROL_PRINCIPLE.md)) |
| **Hybrid** | **Full** — per-entity choice; no forked schema |

**Verdict:** One architecture supports all three entry points. AI adds a **staging/review commit path**, not a parallel data model.

---

## What can stay

| Component | Rationale | Rewrite risk if kept |
|-----------|-----------|---------------------|
| `character_bible` + identity fields | Core character canon | — |
| `world_bible` | World rules, tone, locations text | — |
| `story_bible` | Story plan, themes, timeline notes | — |
| Reference graph assemblers | Per-entity; extensible node types | — |
| Context packet assemblers | Merge layer for AI/exports | — |
| Slot assignment tables | Canonical / turnaround / expression roles | — |
| `characters`, `worlds`, `stories`, `chapters` | Core creator objects | — |
| `story_characters` junction | Story roster | — |
| RLS owner model | Security pattern | — |
| `assembleCombinedContextPacket` | Multi-entity continuity | — |
| Phase 2B contextual linking actions | Workflow pattern to extend | — |

**Do not replace or flatten bibles into generic JSON blobs.** That would be **High rewrite risk** with no V3 benefit.

---

## What should evolve

| Area | Evolution | Not replacement |
|------|-----------|-----------------|
| **Creator UI** | Hide bible/graph/packet terminology; default to Story plan, Character details | Keep bible tables and assemblers |
| **Context packets** | Add optional `scene` and `assets[]` slices when those objects exist | Keep world/story/character slices |
| **Reference graphs** | New node types: `scene`, `asset`, panel refs | Keep character/world/story nodes |
| **Story bible timeline/events** | May sync from or link to Scene rows; text fields remain for quick notes | Scenes augment, not delete |
| **Chapters** | Gain child tables: `pages`, `panels`, or `chapter_blocks`; optional `published_at` | Keep `chapters` parent |
| **Publishing** | Add publish state on stories/chapters/outputs; reader routes | Keep profile `is_public` for portfolio gate |
| **Navigation** | Story-first hubs, finish checklists | Keep entity routes during transition |
| **Worlds** | Optionally nested under `projects` via `world.project_id` | Worlds remain valid without Project |

---

## Required new objects (planning — not implemented)

Compatibility with **current** architecture:

### Project

| Aspect | Assessment |
|--------|------------|
| **Purpose** | Top-level universe workspace grouping worlds, stories, shared cast |
| **Current gap** | Worlds scoped by `user_id` only; no `projects` table |
| **Compatibility** | **High** — add `projects` + optional `worlds.project_id`, `stories.project_id`; existing rows default to null or auto-migrated “implicit project” |
| **Continuity impact** | Context packets gain optional `projectId`; bibles unchanged |
| **Rewrite risk** | **Moderate** — migration + URL strategy; worlds remain first-class |

### Scene

| Aspect | Assessment |
|--------|------------|
| **Purpose** | Continuity layer: characters, assets, locations, events per narrative beat |
| **Current gap** | Story bible `timeline` / `major_events` text; no `scenes` table |
| **Compatibility** | **High** — `scenes.chapter_id` FK matches migration intent; junction tables `scene_characters`, `scene_assets` per [SCENE_ARCHITECTURE_V1.md](./SCENE_ARCHITECTURE_V1.md) |
| **Continuity impact** | Extends reference graph + context packet; bibles provide defaults Scenes override locally |
| **Rewrite risk** | **Low–Moderate** — additive; comic panels may reference `scene_id` later |

**Hierarchy confirmed compatible:**

```
Project (new)
 └── Story (exists)
      └── Chapter (exists)
           └── Scene (new)
```

### Asset

| Aspect | Assessment |
|--------|------------|
| **Purpose** | First-class sword, amulet, vehicle, spaceship, artifact with owner + history |
| **Current gap** | Props implied via entity images and story/world slot roles |
| **Compatibility** | **High** — new `assets`, `asset_ownership_history`, `scene_assets`; existing images stay entity-scoped |
| **Continuity impact** | Reference graph adds asset nodes; context packet includes asset descriptors; character/world/story images **remain** for environment and character refs |
| **Rewrite risk** | **Moderate** — new domain; distinction from `character_images` must stay clear ([ASSET_SYSTEM_V1.md](./ASSET_SYSTEM_V1.md)) |

---

## Architecture gaps (summary)

| Gap | Blocks vision? | Fix type |
|-----|----------------|----------|
| Comic pages / panels | **Yes** — child benchmark | Additive schema + editor |
| Publish draft vs live | **Yes** — finish → share | Additive columns + reader UI |
| Portfolio featured finished work | Partial | UX + query layer on publish state |
| Project container | Pro scale | Additive table + optional FKs |
| Scene entity | Continuity at beat level | Additive under chapters |
| Asset entity | Prop ownership continuity | Additive parallel to characters |
| Contextual creation in comic/chapter | Workflow | UI pattern (2B proven) |
| Terminology pass | Child path friction | UI only |

**Not gaps in continuity architecture** — gaps in **output and workflow layers** on top of it.

---

## Workflow improvements needed

Founder Round 1: **primary issue is workflow, not continuity.** Analysis scope per brief (no AI, billing, credits, marketplace):

| Priority | Workflow | Current state | Architecture need |
|----------|----------|---------------|-------------------|
| **P0** | Story → Finished Work | Chapters = plain text; no comic structure | `pages` / `panels` or equivalent under `chapters` |
| **P0** | Finished Work → Publish | Profile + entity `is_public` only | `published_at`, `publish_status` on chapter/story/output |
| **P1** | Publish → Portfolio | Card grid public pages | Reader component + featured publish query |
| **P1** | Contextual creation | World/story modals shipped (2B) | Extend to chapter page, comic panel, scene (future) |
| **P1** | Linking workflows | Character/world/story links work | Same pattern for assets when Asset ships |
| **P2** | Story completion guidance | No finish checklist | UI state machine on story — no schema required |
| **P2** | Portfolio workflows | Profile editor only | Link portfolio sections to published outputs |
| **P3** | Explore | Not shipped | Index on published outputs — after reader exists |

**Continuity systems require no workflow changes** — only **less exposure** in default UI.

---

## Estimated rewrite risk

### By initiative

| Initiative | Risk | Rationale |
|------------|------|-----------|
| Keep bibles + reference graph + context packets | **Low** | Validated; extend only |
| AI structure assembly (review before commit) | **Low–Moderate** | Additive staging UX; same tables on approve |
| Terminology / hide internal UI | **Low** | Copy and component naming |
| Contextual creation extension | **Low** | Proven 2B pattern |
| Comic pages / panels under chapters | **Moderate** | New tables; migrations foresaw attachment |
| Publish state + public reader | **Moderate** | Additive columns + routes |
| Scene object + junctions | **Low–Moderate** | Additive under existing chapters |
| Asset object + ownership history | **Moderate** | New domain; clear separation from image slots |
| Project container + world migration | **Moderate** | Optional FKs; URL migration plan needed |
| Portfolio featured outputs | **Low** | Query + UI on publish tables |
| **Replace bibles with unified “canon document”** | **High** | **Do not do** — breaks assemblers, scores, migrations |
| **Remove reference graph for simpler CRUD** | **High** | **Do not do** — loses continuity differentiation |
| **Flatten all images into one asset table** | **High** | **Do not do** — confuses character refs vs movable props |

### By audience outcome

| Outcome | Overall risk to achieve |
|---------|-------------------------|
| Child short comic + publish | **Moderate** — workflow/output additive; continuity Low |
| Hobbyist 20–40 page comic | **Moderate** — same + scale testing |
| Professional multi-story universe | **Moderate** — Project + Scene + Asset additive over time |

### Overall platform evolution

| Classification | Verdict |
|----------------|---------|
| **Incremental evolution** | **Yes** — recommended path |
| **Major continuity redesign** | **Not required** |
| **Major workflow/output redesign** | **New subsystems**, not rewrites of existing canon |

---

## Compatibility matrix: future objects × continuity stack

| Future object | Uses Character Bible | Uses World Bible | Uses Story Bible | Extends Reference Graph | Extends Context Packet |
|---------------|---------------------|------------------|------------------|-------------------------|------------------------|
| **Project** | Indirect (groups entities) | Indirect | Indirect | Optional project scope | Optional `projectId` |
| **Scene** | Cast subset refs | Location inheritance | Beat within arc | Scene + panel nodes | Scene slice with cast/assets |
| **Asset** | Owner FK | World canon link | Story appearance | Asset nodes | Asset descriptors |
| **Comic page/panel** | Character slot refs | Background refs | Story/chapter context | Panel nodes | Panel generation context |

**No column requires retiring an existing system.**

---

## Recommended evolution sequence (architecture-only)

Aligns with [CHARID_VISION_V3.md](./CHARID_VISION_V3.md) and [FOUNDER_TESTING_LESSONS_ROUND_1.md](./FOUNDER_TESTING_LESSONS_ROUND_1.md):

1. **Keep** continuity stack; **hide** from default creator UI (**Low risk**)
2. **Add** comic output schema under `chapters` (**Moderate**)
3. **Add** publish state + reader (**Moderate**)
4. **Extend** contextual creation to comic/chapter contexts (**Low**)
5. **Add** `scenes` + junctions when comic MVP needs beat-level continuity (**Low–Moderate**)
6. **Add** `character_relationships` when project + cast dynamics require structured bonds (**Low–Moderate**)
7. **Add** `assets` + history when props matter across scenes (**Moderate**)
8. **Add** `projects` when pro grouping requires it (**Moderate**)
9. **Extend** context packet + reference graph as each object ships (**Low** per extension)

**Do not** reorder to replace bibles first. **Do not** block comic MVP on Scene/Asset/Project schema — those can follow.

---

## Conclusion

CharID’s **continuity architecture is compatible with the full V3 Creator OS vision**. Founder testing correctly identified that the stack **works** and **differentiates** the product. The path forward is:

1. **Preserve** Character Bible, World Bible, Story Bible, Reference Graph, Context Packet, and continuity systems as internal foundations.
2. **Expose** creators to Projects, Stories, Characters, Worlds, Relationships, Scenes, and Assets — not internal names.
3. **Add** output and workflow layers (comic, publish, portfolio reader) — the highest-priority gaps.
4. **Introduce** Project, Scene, and Asset as **additive objects** that compose on top of existing canon — not replacements.
5. **Support** manual, AI-assisted, and hybrid creation on the **same schema** — structure assembly with review-before-commit ([AI_CREATION_CONTROL_PRINCIPLE.md](./AI_CREATION_CONTROL_PRINCIPLE.md)).

**No major architecture redesign is required.** Rewrite risk stays **Low** for continuity preservation and **Moderate** for new creator-facing output workflows — which is expected product growth, not structural failure.

---

## Document index

| Doc | Role |
|-----|------|
| [SCENE_ARCHITECTURE_V1.md](./SCENE_ARCHITECTURE_V1.md) | Scene schema sketch |
| [ASSET_SYSTEM_V1.md](./ASSET_SYSTEM_V1.md) | Asset schema sketch |
| [CHARACTER_RELATIONSHIPS_V1.md](./CHARACTER_RELATIONSHIPS_V1.md) | Relationship schema sketch |
| [LINKING_WORKFLOW_AUDIT.md](./LINKING_WORKFLOW_AUDIT.md) | Current linking behavior |
| [FOUNDER_TESTING_LESSONS_ROUND_1.md](./FOUNDER_TESTING_LESSONS_ROUND_1.md) | Workflow priority evidence |
| [AI_CREATION_CONTROL_PRINCIPLE.md](./AI_CREATION_CONTROL_PRINCIPLE.md) | Manual / AI / hybrid on shared architecture |
| [IMPLEMENTATION_PHASES_V3.md](./IMPLEMENTATION_PHASES_V3.md) | Canonical phases A–H |

---

## Version

| Version | Date | Notes |
|---------|------|-------|
| 1.0 | 2026-06-14 | Initial architecture compatibility assessment |
