# CharID Vision V3

## Creator Operating System

## Product authority

**North star:** [CHARID_NORTH_STAR_V1.md](./CHARID_NORTH_STAR_V1.md) — highest-level product identity. Defines what CharID ultimately is. **All vision documents and plans must align with the north star.**

**This document** (`CHARID_VISION_V3.md`) is the **detailed governing product vision** — mission, IA, core objects, UX philosophy, and long-term direction.

| Rule | Detail |
|------|--------|
| **North star** | [CHARID_NORTH_STAR_V1.md](./CHARID_NORTH_STAR_V1.md) — ultimate “what CharID is”; decision test for features |
| **Governing document (detail)** | `CHARID_VISION_V3.md` defines IA, objects, terminology, and UX standards |
| **Subordinate plans** | Roadmaps, feature plans, architecture plans, monetization plans, AI plans, and UX plans **must align** with the north star and this document |
| **Conflict resolution** | North star → V3 → subordinate plans. When V3 disagrees with the north star, **revise V3** or **revise the north star** explicitly — never ship silent conflict |
| **Amendments** | North star changes require north-star version bump; V3 changes require V3 version bump |

**Subordinate documents include (non-exhaustive):**

- [MONETIZATION_AND_AI_ROADMAP.md](./MONETIZATION_AND_AI_ROADMAP.md)
- [CHARID_BUSINESS_PLAN_V1.md](./CHARID_BUSINESS_PLAN_V1.md)
- [AI_PROVIDER_ARCHITECTURE.md](./AI_PROVIDER_ARCHITECTURE.md)
- [AI_COST_MODEL.md](./AI_COST_MODEL.md)
- [CREATOR_ECONOMY_AND_RIGHTS.md](./CREATOR_ECONOMY_AND_RIGHTS.md)
- [CREATOR_MEDIA_EXPANSION.md](./CREATOR_MEDIA_EXPANSION.md)
- [BETA_LAUNCH_PLAN.md](./BETA_LAUNCH_PLAN.md) · [BETA_READINESS_PLAN.md](./BETA_READINESS_PLAN.md)
- [TESTING_CHECKLIST_V1.md](./TESTING_CHECKLIST_V1.md)
- [VISION_ALIGNMENT_REPORT.md](./VISION_ALIGNMENT_REPORT.md) — audit trail vs V3
- [FINISHED_CREATIVE_WORK_PRINCIPLE.md](./FINISHED_CREATIVE_WORK_PRINCIPLE.md)
- [AI_CREATION_CONTROL_PRINCIPLE.md](./AI_CREATION_CONTROL_PRINCIPLE.md)
- [PRESERVE_INTENT_PRINCIPLE.md](./PRESERVE_INTENT_PRINCIPLE.md) — governing AI philosophy · Preserve Intent · Improve Execution
- [IMPLEMENTATION_PHASES_V3.md](./IMPLEMENTATION_PHASES_V3.md)
- [FOUNDER_TESTING_LESSONS_ROUND_1.md](./FOUNDER_TESTING_LESSONS_ROUND_1.md)
- [PROTECTED_CREATOR_MODE_V1.md](./PROTECTED_CREATOR_MODE_V1.md) — future safety architecture (post–Phase D)
- [CHARACTER_RELATIONSHIPS_V1.md](./CHARACTER_RELATIONSHIPS_V1.md) — first-class character bonds (Phase E+)

**Not governing:** Founder analytics SQL, database repair scripts, and internal admin labels may use legacy technical names until migrated.

---

**Status:** Official product vision · Creator Operating System  
**North star:** [CHARID_NORTH_STAR_V1.md](./CHARID_NORTH_STAR_V1.md)  
**Previous:** [CHARID_VISION.md](./CHARID_VISION.md) (V1 — competitor contrast appendix)  
**Related:** [CREATOR_MEDIA_EXPANSION.md](./CREATOR_MEDIA_EXPANSION.md) · [CREATOR_ECONOMY_AND_RIGHTS.md](./CREATOR_ECONOMY_AND_RIGHTS.md) · [CHARID_BUSINESS_PLAN_V1.md](./CHARID_BUSINESS_PLAN_V1.md)

---

## Mission

CharID is a **creator operating system**.

It is **not** an AI image generator.

It is **not** a prompt engineering tool.

It is **not** a character database.

CharID exists to help creators **finish, publish, and share** creative work — and grow entire universes over time.

**Primary goal:** **Finished creative work** (comic, graphic novel, illustrated story, novel, motion comic, film project) — not asset accumulation.

**AI is a tool inside the platform.**

**The creator's finished work and universe are the product.**

See [FINISHED_CREATIVE_WORK_PRINCIPLE.md](./FINISHED_CREATIVE_WORK_PRINCIPLE.md).

---

## Core vision

A creator should be able to start with a single idea and grow it into **finished, shareable work**:

- Comic
- Graphic novel
- Illustrated story
- Novel
- Motion comic
- Film project
- Series and published portfolios

All from the **same connected creative ecosystem** — without external tools for the core workflow.

```
Idea → Story → Characters → Images → Finished Work → Publish → Portfolio → Explore
```

Internal chain (hidden from creators): `Character → World → Story → Scene → Outputs → Publishing`

---

## Design principles

### 0. Dual audience — one workflow

CharID must support **both**:

| Audience | Example outcome |
|----------|-----------------|
| **A child (~10 years old)** | Short comic in an afternoon, published to portfolio |
| **A professional creator** | Large universe built over years — series, client work, production pipeline |

**Same workflow. Emergent complexity.** A child never sees professional-only concepts on day one. A professional never outgrows the platform because depth lives in the same objects (story, scenes, assets) — unlocked as needed. **No separate beginner or professional product** — manual, AI-assisted, and hybrid creation share one architecture ([AI_CREATION_CONTROL_PRINCIPLE.md](./AI_CREATION_CONTROL_PRINCIPLE.md)).

Validated in founder testing: [FOUNDER_TESTING_LESSONS_ROUND_1.md](./FOUNDER_TESTING_LESSONS_ROUND_1.md).

### 1. Simple enough for a child

A child should be able to create:

- A character
- A world
- A story
- A comic

…without understanding advanced concepts.

Independent tablet use for children requires **Protected Creator Mode** (future — see [PROTECTED_CREATOR_MODE_V1.md](./PROTECTED_CREATOR_MODE_V1.md)): platform-wide safety across creation, discovery, publishing, monetization, and social interaction — not just simpler UI.

**No technical terminology in the UI.**

Creators must never be required to understand:

| Internal system (hidden) | What creators feel |
|--------------------------|-------------------|
| Character Bible | “My character’s details” |
| World Bible | “My world’s details” |
| Story Bible | “My story’s plan” |
| Reference Graph | *(automatic)* |
| Context Packet | *(automatic)* |
| Continuity Engine | “CharID remembers” |

Creators should feel:

> *“I create ideas. CharID keeps everything organized.”*

### 2. Powerful enough for professionals

Professional creators should manage:

- Comic series
- Novels
- Films
- Game universes
- Shared IPs
- Production pipelines

…without outgrowing the platform.

**Complexity emerges naturally** as projects grow — never on day one.

### 3. Finished work over assets

Success is measured by **completed, publishable work** — not character count, image count, or bible completeness scores.

| Output-first | Asset-first (avoid as primary goal) |
|--------------|-------------------------------------|
| “Publish my comic” | “Create another character” |
| “Finish chapter 3” | “Fill every bible section” |
| “Share on portfolio” | “Organize reference slots” |

Roadmaps and activation funnels prioritize **Story → Finished Work → Publish** ([FINISHED_CREATIVE_WORK_PRINCIPLE.md](./FINISHED_CREATIVE_WORK_PRINCIPLE.md)).

### 4. Contextual creation — no page-hopping

Creators work **inside** the object they are editing. Related content is created or linked **in place**:

| Context | In-context actions |
|---------|-------------------|
| **World** | Create Character · Add Existing Character |
| **Story** | Create Character · Add Existing Character · Create World · Change World |
| **Scene** (future) | Add Character · Add Asset · Create either — return to Scene |
| **Comic page** (future) | Add Character · Add Asset · Generate panel — return to Page |

Users should **not** bounce between unrelated global lists to complete a story.

Phase 2B shipped world/story character and world linking. Extend this pattern to chapters, scenes, and comic pages.

### 5. Creator ownership first

Creators own:

- Characters
- Worlds
- Stories
- Uploaded assets
- Generated assets
- Published works

| Default | Options (opt-in) |
|---------|------------------|
| **Private** | Public · Discoverable · Remixable |

CharID does **not** own creator IP. See [CREATOR_ECONOMY_AND_RIGHTS.md](./CREATOR_ECONOMY_AND_RIGHTS.md).

---

## Internal architecture (keep — do not replace)

Founder testing Round 1 confirms the **continuity stack is strong**. These remain **internal systems** — never primary creator-facing concepts:

| Internal system | Role | Creator-facing |
|-----------------|------|----------------|
| **Character Bible** | Character canon storage | “Character details” |
| **World Bible** | World canon storage | “World details” |
| **Story Bible** | Story plan storage | “Story plan” |
| **Reference Graph** | Entity ↔ image slot linking | *(automatic)* |
| **Context Packet** | Canon assembly for AI / exports | *(automatic)* |
| **Continuity Engine** | Consistency checks across work | “CharID remembers” |

**Do not replace** bibles, reference graph, or context packets with a simpler schema. **Do hide** them from default UI. Future Scenes and Assets **compose on top of** this foundation — they do not supersede it.

---

## Terminology standards

### Creator-facing (UI, marketing, help, onboarding)

Use these words in navigation, buttons, empty states, and public copy:

| Term | Meaning |
|------|---------|
| **Project** | Top-level universe container |
| **Story** | Primary narrative workspace |
| **Character** | Person, creature, or entity |
| **World** | Setting |
| **Scene** | A story moment — continuity hub |
| **Asset** | Object with history (weapon, relic, map, etc.) |

Also allowed creator-facing: **Create**, **Portfolio**, **Explore**, **Chapter**, **Page**, **Panel**, **Publish**.

### Internal only (engineering, admin, migrations, code comments)

| Internal term | Maps to creator-facing |
|---------------|------------------------|
| Character Bible | Character details / sections |
| World Bible | World details |
| Story Bible | Story plan / overview |
| Reference Graph | *(automatic — never shown)* |
| Context Packet | *(automatic — never shown)* |
| Continuity Engine | “CharID remembers” |

**Rules:**

1. **Never** put internal terms in creator-facing navigation, page titles, or primary CTAs.
2. Database table names (`character_bible`, etc.) may stay until schema migration; UI copy must not mirror table names.
3. Founder admin may show internal labels (e.g. Database health “Character Bible”) until admin copy pass.
4. Testing checklists and founder docs should migrate to creator-facing language over time.

---

## Information architecture

### Primary navigation

| Area | Purpose |
|------|---------|
| **Create** | Start new work |
| **Projects** | Top-level universe containers |
| **Stories** | Narrative workspaces |
| **Characters** | People, creatures, entities |
| **Worlds** | Settings and lore |
| **Assets** | Objects with continuity |
| **Portfolio** | Publish and share |
| **Explore** | Discovery (future) |
| **Settings** | Account, billing, privacy |

**Founder only** (never visible to normal users):

- Admin
- Moderation

---

## Create flow

When users click **Create**, show:

> **“What do you want to create?”**

| Option | Starts |
|--------|--------|
| Character | Identity + appearance |
| World | Setting |
| Story | Narrative |
| Scene | Continuity moment |
| Asset | Object with history |
| Project | Full universe container |

Creators start **wherever inspiration begins** — CharID connects the rest.

---

## Core objects

### Project

The **top-level container**.

Contains: characters · worlds · stories · relationships · scenes · assets

**Example — *The Burning Forest*:**

| Type | Items |
|------|-------|
| **Project** | The Burning Forest |
| **Characters** | Fire · Storm |
| **Relationships** | Fire ↔ Storm (rivals) |
| **World** | Ashlands |
| **Stories** | The Burning Forest · The Developers |
| **Assets** | Moon Amulet · Forest Axe |
| **Scenes** | Forest Discovery · Logging Camp |

*Today’s product maps worlds/stories without a named Project layer — Project is the future unifying container.*

---

### Character

A person, creature, hero, villain, companion, or entity.

Tracks:

- Identity
- Appearance
- Relationships
- Expressions
- Turnarounds
- Story appearances
- Scene appearances

---

### World

A setting.

Tracks:

- Locations
- Cultures
- Rules
- History
- Stories
- Assets

---

### Story

The **primary narrative object** and main creative workspace.

Contains:

- Overview
- Cast
- World
- Chapters
- Scenes
- Outputs

Stories become the hub where comics, novels, audio, and video converge.

---

### Scene

A **first-class object**. Scenes are where **continuity happens**.

| Scene contains | Purpose |
|----------------|---------|
| Characters | Who is present |
| Assets | What objects matter |
| Locations | Where |
| Events | What happens in the beat |
| Notes | Mood, dialogue, purpose |

**Scenes are the continuity layer** connecting characters, assets, locations, and events. Hierarchy: `Project → Story → Chapter → Scene` ([SCENE_ARCHITECTURE_V1.md](./SCENE_ARCHITECTURE_V1.md) — planning only until shipped).

**All outputs derive from scenes.**

Examples: illustration · comic panel · storyboard · film shot · animation frame

---

### Asset

**Independent objects** with continuity across scenes and stories.

Examples: weapons · jewelry · vehicles · books · relics · tools · maps

**Ownership is story-driven, not character-permanent.**

**Example — Moon Amulet:**

| Scene | Owner |
|-------|-------|
| Scene 1 | Fire |
| Scene 18 | Villain |
| Scene 32 | Storm |

The **asset** tracks ownership history. Characters do not permanently own assets — **stories determine ownership** at each moment in canon.

---

## Comic system

```
Story → Chapter → Page → Panel → Scene
```

- **Panels reference scenes.**
- **Scenes drive continuity.**

### Comic templates (beginner)

| Format | |
|--------|---|
| Children's book | |
| Classic comic | |
| Graphic novel | |
| Manga | |
| Webtoon | |

### Page templates

Splash · 2-panel · 3-panel · 4-panel · 6-panel · 9-panel · vertical scroll

Users customize later. Templates reduce blank-page friction for children and beginners.

---

## Story style guide

Every story contains a **hidden style guide** (creator-facing as “Look & feel” — not “style guide engine”).

Tracks:

- Art style
- Color palette
- Panel style
- Rendering style
- Typography
- Visual consistency rules

**All chapters inherit.** No visual drift across pages or episodes.

*Maps internally to story bible + generation context — see [AI_PROVIDER_ARCHITECTURE.md](./AI_PROVIDER_ARCHITECTURE.md).*

---

## AI philosophy

**AI accelerates creation. AI never reduces creator control.**

**Preserve Intent. Improve Execution.**

AI enhances creator work — it does not replace creator decisions. A sketch stays recognizably the creator's sketch after refinement.

| Principle | Doc |
|-----------|-----|
| Creator control (review, approve, edit, remove, regenerate) | [AI_CREATION_CONTROL_PRINCIPLE.md](./AI_CREATION_CONTROL_PRINCIPLE.md) |
| Preserve intent (composition, layout, silhouette, landmarks) | [PRESERVE_INTENT_PRINCIPLE.md](./PRESERVE_INTENT_PRINCIPLE.md) |

Full control principle: [AI_CREATION_CONTROL_PRINCIPLE.md](./AI_CREATION_CONTROL_PRINCIPLE.md).  
Full preserve-intent principle: [PRESERVE_INTENT_PRINCIPLE.md](./PRESERVE_INTENT_PRINCIPLE.md).

### One architecture, three creation styles

| Style | Description |
|-------|-------------|
| **Manual** | Build everything by hand — upload, type, arrange |
| **AI starting point** | Describe an idea; CharID assembles structure; creator approves before canon |
| **Hybrid** | Mix per object — manual characters, AI scene outline, hand-drawn panels |

No separate beginner vs professional product. **Shared architecture, different entry points.**

### Structure before generation

A creator may describe world, characters, assets, story, and scenes in a **single prompt**. CharID may assemble a **proposed** structure — Project, World, Characters, Assets, Story, chapter outline, scene outline — **before** image or page generation.

The creator must always be able to **review · approve · edit · remove · regenerate** any part. No silent commits.

### What AI assists with (after structure is approved)

- Bible field suggestions and reference images
- Comic panels and pages from scene context
- Motion comics, voice, video (future)
- Publishing assets

AI **supports** creation. AI does **not replace** creation.

**The creator remains the author.**

AI is credit-gated, provider-abstracted, and downstream of approved canon — never a blank prompt homepage that bypasses review.

---

## Future publishing vision

Creators publish and monetize **finished work** directly from CharID. Creators **retain ownership**. CharID receives **platform fees** on commercial transactions.

| Capability | Phase |
|------------|-------|
| **Publish to Portfolio** | Profile + featured finished work |
| **Publish publicly** | Story/comic reader URLs; opt-in visibility |
| **Sell digital work** | Comics, books, story packs — marketplace |
| **Order physical books** | Creator-initiated print via POD partners |
| **Sell physical books** | Reader purchase; creator royalties; CharID platform fee |

Formats: comics · graphic novels · illustrated stories · novels · audiobooks · motion comics · video episodes

Detail: [CREATOR_MEDIA_EXPANSION.md](./CREATOR_MEDIA_EXPANSION.md) · [CREATOR_ECONOMY_AND_RIGHTS.md](./CREATOR_ECONOMY_AND_RIGHTS.md)

Public surfaces remain **project-linked** (`/u/[username]` → finished work → story) — not a generic AI content feed.

### Highest-priority creator workflow gap (Round 1)

The most important missing chain:

```
Story → Finished Work → Publish → Portfolio → Explore
```

Ship **Finished Work + Publish + Portfolio reader** before marketplace, Explore at scale, or additional infrastructure. Documented in [FOUNDER_TESTING_LESSONS_ROUND_1.md](./FOUNDER_TESTING_LESSONS_ROUND_1.md).

---

## Creator marketplace

**Future phase** — after Story → Publish path is proven. Not current scope.

Creators may sell:

- Digital comics and graphic novels
- Digital books and illustrated stories
- Story packs
- Character packs
- Downloadable assets

- Creators **keep ownership**
- CharID takes a **marketplace fee**

Requires: payments, rights, moderation, and dispute flow beyond subscription credits.

---

## Print-on-demand vision

**Future phase** — after digital publish is proven.

Partner with print providers. Creators can:

- **Order** physical copies for themselves (proof copies, gifts)
- **Sell** physical books via POD — readers purchase; creators earn royalties; CharID receives a platform fee

Products: physical comics · graphic novels · story books · art books · character guides

---

## Discoverability

**Future Explore** section:

- Featured creators
- Trending stories
- New worlds
- Popular comics
- Featured universes

Goal: help creators **find audiences** — not compete with TikTok-style AI feeds.

Discoverable visibility remains **creator opt-in** ([CREATOR_ECONOMY_AND_RIGHTS.md](./CREATOR_ECONOMY_AND_RIGHTS.md)).

---

## Long-term vision

CharID becomes **a place where anyone can build a universe.**

| Who | What they can do |
|-----|------------------|
| A child | Create their first comic |
| A professional | Manage an entire publishing pipeline |
| A creator | Build an audience |
| A creator | Earn income |
| A creator | Publish digitally |
| A creator | Publish physically |
| A creator | Own their work |

**AI helps bring ideas to life.**

**The creator remains at the center.**

---

## What should never change

1. Creator owns IP · CharID hosts
2. Private by default
3. Scene-driven continuity (not disposable generations)
4. No unlimited AI
5. Not positioned as an AI generator
6. Admin/moderation invisible to normal users
7. Internal jargon hidden — simple surface, deep system underneath
8. AI accelerates setup — never reduces creator control ([AI_CREATION_CONTROL_PRINCIPLE.md](./AI_CREATION_CONTROL_PRINCIPLE.md))

**Decision test:** *Does this help someone **finish and publish** creative work — or does it turn CharID into another asset vault or content vending machine?*

---

## Current product vs V3 (honest map)

| V3 concept | Today |
|------------|-------|
| Project container | Worlds + stories (implicit grouping) |
| Scene object | Timeline/events foundation; full scene model **planned** ([SCENE_ARCHITECTURE_V1.md](./SCENE_ARCHITECTURE_V1.md)) |
| Asset object | Character/world/story images; standalone asset library **planned** ([ASSET_SYSTEM_V1.md](./ASSET_SYSTEM_V1.md)) |
| Comic / finished work | Story + chapters only; **no comic editor or reader** |
| Publish finished work | Profile + entity flags only; **no issue/chapter publish** |
| Contextual linking | World + story character/world modals (**Phase 2B**) |
| Explore | Not shipped |
| Marketplace / POD | Documented only |

Use this column to prioritize roadmap without pretending shipped features exist.

---

## Document index

| Doc | Role |
|-----|------|
| [CHARID_NORTH_STAR_V1.md](./CHARID_NORTH_STAR_V1.md) | **North star** — highest-level product identity |
| [CHARID_VISION.md](./CHARID_VISION.md) | One-page + competitor contrast |
| [VISION_ALIGNMENT_REPORT.md](./VISION_ALIGNMENT_REPORT.md) | Audit vs V3 |
| [CHARID_BUSINESS_PLAN_V1.md](./CHARID_BUSINESS_PLAN_V1.md) | Revenue and growth |
| [CREATOR_MEDIA_EXPANSION.md](./CREATOR_MEDIA_EXPANSION.md) | Motion, audio, video publishing |
| [MONETIZATION_AND_AI_ROADMAP.md](./MONETIZATION_AND_AI_ROADMAP.md) | Build phases |
| [AI_CREATION_CONTROL_PRINCIPLE.md](./AI_CREATION_CONTROL_PRINCIPLE.md) | Manual · AI · hybrid creation styles |
| [COLLABORATIVE_CREATION_PRINCIPLE.md](./COLLABORATIVE_CREATION_PRINCIPLE.md) | Suggest → Review → Edit → Approve → Commit |
| [PRESERVE_INTENT_PRINCIPLE.md](./PRESERVE_INTENT_PRINCIPLE.md) | Governing AI philosophy · Preserve Intent · Improve Execution |
| [IMPLEMENTATION_PHASES_V3.md](./IMPLEMENTATION_PHASES_V3.md) | Canonical product phases A–H |
| [FINISHED_CREATIVE_WORK_PRINCIPLE.md](./FINISHED_CREATIVE_WORK_PRINCIPLE.md) | Finish-first product principle |
| [FOUNDER_TESTING_LESSONS_ROUND_1.md](./FOUNDER_TESTING_LESSONS_ROUND_1.md) | Round 1 vision refinement |
| [PROTECTED_CREATOR_MODE_V1.md](./PROTECTED_CREATOR_MODE_V1.md) | Future safety architecture — children, families, schools |
| [CHARACTER_RELATIONSHIPS_V1.md](./CHARACTER_RELATIONSHIPS_V1.md) | Character bonds — relationship graph, continuity context |
| [CHARACTER_WORKSPACE_V2.md](./CHARACTER_WORKSPACE_V2.md) | Gallery-first character page layout (planning) |
| [WORLD_WORKSPACE_V2.md](./WORLD_WORKSPACE_V2.md) | Gallery-first world page, maps, locations (planning) |

---

## Version

| Version | Date | Notes |
|---------|------|-------|
| 3.0 | 2026-06-14 | Creator OS — IA, scenes, assets, publishing vision |
| 3.1 | 2026-06-14 | Product authority · terminology standards · governing document |
| 3.2 | 2026-06-14 | Founder Round 1 — dual audience · finished work · contextual workflow · internal architecture preserved · publish gap |
| 3.3 | 2026-06-14 | AI creation control — manual / AI / hybrid · structure before generation · shared architecture |
| 3.4 | 2026-06-14 | Architecture report accepted · [IMPLEMENTATION_PHASES_V3.md](./IMPLEMENTATION_PHASES_V3.md) canonical build order |

---

## Recommended implementation order

**Canonical roadmap:** [IMPLEMENTATION_PHASES_V3.md](./IMPLEMENTATION_PHASES_V3.md) — phases **A through H**.

Architecture Compatibility Report **accepted** — continuity stack frozen; work moves to creator workflow and finished outputs.

| Phase | Focus | Status |
|-------|-------|--------|
| **—** | Continuity architecture (bibles, graph, packets) | ✅ **Complete — no redesign** |
| **—** | Navigation + Create + Phase 2B linking | ✅ **Shipped** |
| **A** | Creator workflow (finish path, stories hub, terminology, contextual creation) | **Next** |
| **B** | Comics (pages, panels, templates) | Planned |
| **C** | Publishing + portfolio reader | Planned |
| **D** | Explore discovery | Planned |
| **E** | Projects · Relationships · Scenes · Assets | Planned |
| **F** | AI assisted creation (+ billing/credits when required) | Deferred |
| **G** | Marketplace | Deferred |
| **H** | Print on demand | Deferred |

**Deprioritized until A–D complete:** AI generation · Stripe/credits · marketplace · POD · founder analytics V2 · additional infrastructure.

Detail per phase: goal, dependencies, complexity, founder checkpoints — [IMPLEMENTATION_PHASES_V3.md](./IMPLEMENTATION_PHASES_V3.md).

**Phase A plan:** [PHASE_A_IMPLEMENTATION_PLAN.md](./PHASE_A_IMPLEMENTATION_PLAN.md)
