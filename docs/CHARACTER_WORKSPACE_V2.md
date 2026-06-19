# Character Workspace V2

**Status:** Approved UX correction — **planning only, no implementation**  
**Date:** 2026-06-14  
**Version:** 2.0  
**Authority:** [CHARID_VISION_V3.md](./CHARID_VISION_V3.md) · [FINISHED_CREATIVE_WORK_PRINCIPLE.md](./FINISHED_CREATIVE_WORK_PRINCIPLE.md)  
**Related:** [CHARACTER_CLASSIFICATION_V2.md](./CHARACTER_CLASSIFICATION_V2.md) · [CHARACTER_RELATIONSHIPS_V1.md](./CHARACTER_RELATIONSHIPS_V1.md) · [WORLD_WORKSPACE_V2.md](./WORLD_WORKSPACE_V2.md) · [PHASE_A1_IMPLEMENTATION_REPORT.md](./PHASE_A1_IMPLEMENTATION_REPORT.md) · [ARCHITECTURE_COMPATIBILITY_REPORT.md](./ARCHITECTURE_COMPATIBILITY_REPORT.md)

---

## Purpose

Redesign the **creator-facing character page** so it prioritizes **who the character is and what they look like** — not continuity metrics, bible tabs, or internal scoring systems.

**Continuity architecture is unchanged.** Character Bible, Reference Graph, Context Packet, slot assignments, and scoring logic remain internal. V2 is an **information architecture and layout** correction — the same data, surfaced for creators.

---

## Founder testing findings

| Finding | Current behavior | Creator mental model |
|---------|------------------|----------------------|
| **Metrics before creation** | `CharacterBibleMetricsHeader` + consistency scores appear above all work | “Who is this?” comes first |
| **Tab switching for images** | Reference · Turnaround · Expressions are separate tabs | “What images do I have / need?” should be one gallery |
| **Checklist chrome dominates** | `ReferenceGraphInspector` + recommendations above sections | Progress should be simple, not a dashboard |
| **Stories buried at bottom** | `CharacterStoriesSection` last; read-only list | “What stories are they in?” matters early |
| **No relationships surface** | Bonds only implied in backstory text | Friend, rival, daemon need a visible home |
| **Empty personality field** | Blank textarea for core personality | Children need suggested traits to tap |
| **Technical classification** | Identity Archetype dropdown (V1) | See [CHARACTER_CLASSIFICATION_V2.md](./CHARACTER_CLASSIFICATION_V2.md) |

**Verdict:** The page is built for **continuity engineers**, not **creators**. V2 inverts the default path: **create and visualize first, analyze later**.

---

## Design goals

| # | Goal |
|---|------|
| 1 | Simple enough for a child (~10) |
| 2 | Professional depth available without leaving the page |
| 3 | **Visuals first** — gallery is the primary workspace |
| 4 | Reduce navigation and tab switching |
| 5 | Surface **relationships** and **stories** earlier |
| 6 | Single creator-facing **progress** indicator — not multiple score systems |

---

## Current layout (V1 — shipped)

Route: `/dashboard/characters/[id]` · Component: `CharacterBibleView`

```
1. Back link
2. CharacterBibleMetricsHeader     ← consistency %, profile/visual scores
3. ReferenceGraphInspector         ← reference checklist
4. CharacterBibleRecommendations
5. BibleSectionNav tabs            ← Identity | Reference | Turnaround | Expressions | Details
6. Active tab panel (one at a time)
7. CharacterBibleFeedback
8. CharacterStoriesSection         ← read-only, bottom
```

**Problems:** Steps 2–4 appear before any creative work. Gallery requires three tab switches. Stories and relationships are late or missing.

---

## V2 layout (target)

Single scroll page — **no primary tab bar**. Advanced content collapsed like Story page A1 (`StoryAdvancedPlan` pattern).

```
┌─────────────────────────────────────────────────────────┐
│ 1. CHARACTER HEADER                                     │
│    Name · type · style · compact progress (40% complete)│
├─────────────────────────────────────────────────────────┤
│ 2. CHARACTER GALLERY          ← primary workspace       │
│    Portrait · turnaround · expressions — inline slots   │
├─────────────────────────────────────────────────────────┤
│ 3. PERSONALITY                                          │
│    Trait chips + custom                                   │
├─────────────────────────────────────────────────────────┤
│ 4. RELATIONSHIPS              ← future-ready (Phase E)  │
│    Friend · Enemy · Mentor · … · Add relationship       │
├─────────────────────────────────────────────────────────┤
│ 5. STORIES                                              │
│    Appears in · Add to Story · Create Story             │
├─────────────────────────────────────────────────────────┤
│ 6. ▸ ADVANCED CHARACTER DETAILS   (collapsed)           │
│    Classification · backstory · appearance details      │
├─────────────────────────────────────────────────────────┤
│ 7. ▸ CONTINUITY INSIGHTS          (collapsed)           │
│    Metrics · reference graph · recommendations          │
└─────────────────────────────────────────────────────────┘
```

### Section priority rationale

| Order | Section | Why here |
|-------|---------|----------|
| **1** | Header | Identity anchor + at-a-glance progress |
| **2** | Gallery | “What do they look like?” — highest creative energy |
| **3** | Personality | Quick character voice without bible jargon |
| **4** | Relationships | Cast dynamics before deep lore |
| **5** | Stories | Where the character acts in the narrative |
| **6** | Advanced details | Classification, backstory, height/build — optional depth |
| **7** | Continuity insights | Power users and future AI readiness — never first |

---

## 1. Character Header

### Contents

| Element | Source (internal) | Creator sees |
|---------|-------------------|--------------|
| Name | `characters.name` | Character name (editable inline or link to advanced) |
| Character Type | V2 classification | Human, Animal, Creature, … |
| Visual Style | V2 classification | Comic Book, Anime, … |
| Photo thumbnail | `canonical` slot | Small portrait if set |
| **Progress summary** | Computed from slot + field checklist | `40% complete` + compact row |

### Remove from header (move to Continuity Insights)

- Profile complete %
- Visual consistency %
- Reference coverage %
- AI readiness tier
- “Creative workspace” internal label as primary chrome

### Header copy

- Label: **Character** — not “Character Bible” or “Creative workspace”
- Subline: `{Type} · {Visual Style}` — not identity archetype slug

---

## 2. Character Gallery

**The gallery is the primary workspace.** All reference slots visible on one surface — no tab switching.

### Required slots

| Creator label | Internal slot role | Group |
|---------------|-------------------|-------|
| **Portrait** | `canonical` | Core |
| **Front View** | `turnaround_front` | Turnaround |
| **Left View** | `turnaround_left` | Turnaround |
| **Right View** | `turnaround_right` | Turnaround |
| **Back View** | `turnaround_back` | Turnaround |
| **Neutral** | `expression_neutral` | Expressions |
| **Happy** | `expression_happy` | Expressions |
| **Angry** | `expression_angry` | Expressions |
| **Sad** | `expression_sad` | Expressions |
| **Surprised** | `expression_surprised` | Expressions |

Maps 1:1 to existing `CHARACTER_IMAGE_ASSET_ROLES` / slot assignment system — **no schema change required for slots**.

### Slot card UX

Each slot shows:

```
┌──────────────┐
│  [preview]   │  empty state: dashed + slot label
│              │
│ Portrait     │
│ [Upload]     │
│ [Generate]*  │
│ [Assign]     │
└──────────────┘
```

| Action | Behavior |
|--------|----------|
| **Upload** | File picker → assign to this slot in place |
| **Generate** | Opens generate flow scoped to slot *(Phase F — disabled/placeholder until AI)* |
| **Assign Existing** | Picker modal filtered to character’s uploaded images |

**Rule:** Creator never leaves the gallery to complete a slot. No navigation to separate Reference / Turnaround / Expressions tabs.

### Layout groups

```
Portrait (hero, larger)

Turnaround
[Front] [Left] [Right] [Back]

Expressions
[Neutral] [Happy] [Angry] [Sad] [Surprised]
```

### Creature / animal simplification

When [CHARACTER_CLASSIFICATION_V2.md](./CHARACTER_CLASSIFICATION_V2.md) type is Animal or simple Creature, gallery may **collapse** turnaround group to optional (same as today’s `assignableRolesForArchetype` logic) — but creator labels stay friendly; never hide behind “quadruped routing”.

---

## 3. Personality

Replace empty-first `core_personality` textarea with **trait chips** + optional custom text.

### Suggested chips (tap to toggle)

Bold · Brave · Funny · Silly · Kind · Curious · Shy · Serious · Wise · Loyal · Creative · Protective · Competitive · Impulsive

### UX

- Chips multi-select
- Selected chips highlighted
- “Add your own” → custom trait input
- Optional free-text line: “Anything else about their personality”

### Storage (implementation options)

| Option | Notes |
|--------|-------|
| **A** | `personality_traits text[]` on `character_bible` or `characters` |
| **B** | Serialize chips into `core_personality` as structured JSON *(interim)* |
| **C** | Chips UI writes comma-separated to `core_personality` | 

Recommend **A** when implementing; **C** for zero-migration prototype.

Context packet continues to expose personality as text — assembled from chips + custom.

---

## 4. Relationships

Future-ready section per [CHARACTER_RELATIONSHIPS_V1.md](./CHARACTER_RELATIONSHIPS_V1.md).

### V2 placeholder (before Phase E schema)

- Section visible with **Add relationship** CTA
- Empty state: “Who is this character connected to?”
- When Phase E ships: list edges (Friend, Enemy, Parent, Mentor, Companion, Daemon, Rival, …)

### Placement

**Above** Advanced Details and Continuity Insights — **below** Personality. Creators think about cast connections before backstory essays.

### Examples shown in empty-state hints

Friend · Enemy · Parent · Child · Sibling · Mentor · Companion · Daemon · Rival

---

## 5. Stories

Move story membership **up** — section 5 in V2 layout (today: bottom, read-only).

### Current (`CharacterStoriesSection`)

- Lists linked stories with status badge
- No actions

### V2 actions

| Action | Behavior |
|--------|----------|
| **Add to Story** | Picker modal — existing stories in user’s worlds; link character to roster |
| **Create Story** | Inline or modal — pick/create world → create story → link character → optional redirect |

Reuse contextual patterns from Phase 2B (`CharacterPickerModal` inverse, `StoryForm` / world pick).

### Display

- Story title, status, link to story workspace
- Empty state: “Not in any stories yet” + **Add to Story** + **Create Story** as primary CTAs

---

## 6. Advanced Character Details (collapsed)

Wraps former **Identity** + **Details** tabs. Label: **Advanced character details** — not “Character Bible”.

### Contents (expanded)

| Group | Fields |
|-------|--------|
| **Classification** | Character Type, Visual Style, Special Traits ([CHARACTER_CLASSIFICATION_V2.md](./CHARACTER_CLASSIFICATION_V2.md)) |
| **Identity** | Species, gender, location, permanent features |
| **Backstory** | Long-form origin / goals |
| **Appearance details** | Age, height, build, hair, eyes, clothing, accessories, scars |
| **Portfolio visibility** | Public / private |

Remove from default path:

- Identity Archetype (V1) — replaced by Classification V2
- Creative Format on character — see [CREATIVE_FORMAT_V2.md](./CREATIVE_FORMAT_V2.md)

---

## 7. Continuity Insights (collapsed)

Home for everything that was **above the fold** in V1:

| Component (existing) | V2 placement |
|---------------------|--------------|
| `CharacterBibleMetricsHeader` (full metrics) | Inside collapsed section |
| `ReferenceGraphInspector` | Inside collapsed section |
| `CharacterBibleRecommendations` | Inside collapsed section |
| `CharacterBibleFeedback` | Bottom of insights or footer |

Label: **Continuity insights** — subtitle: “Reference coverage and suggestions for when you want to go deeper.”

**Never** show consistency score as page hero. Professionals expand when ready.

---

## Progress indicator

Replace **multiple scoring systems** (profile complete, visual consistency, reference coverage, consistency score, AI readiness tier) with one **creator-facing checklist**.

### Example

```
Portrait ✓   Personality ✓   Expressions ✗   Turnaround ✗   Relationships ✗   Stories ✗

40% complete
```

### Checklist items (V2 default)

| Item | Complete when |
|------|---------------|
| **Portrait** | `canonical` slot filled |
| **Personality** | ≥1 trait chip or personality text |
| **Expressions** | All 5 expression slots filled *(or ≥1 for child-simple mode — configurable)* |
| **Turnaround** | All 4 turnaround slots filled *(optional for Animal type)* |
| **Relationships** | ≥1 relationship edge *(Phase E)* |
| **Stories** | ≥1 story roster link |

### Computation

- New `lib/character-creator-progress.ts` — wraps existing slot assignments + fields
- Internal scores (`character-bible-scores.ts`) **unchanged** — used inside Continuity Insights only
- Single `%` = completed items / applicable items (archetype-aware turnaround optional)

### Display

- Compact row in **Header**
- Full checklist expandable from header or top of gallery

---

## Creator workflows

### Child workflow (~10)

```
Create character → Name + pick type (Human / Animal) → Gallery (add Portrait)
→ Tap personality chips (Funny, Brave) → Add to Story / Create Story
→ Done — show progress “2 of 4 complete”
```

- Never sees Continuity Insights unless expanded
- Turnaround / expressions encouraged via empty slot prompts, not scores
- Relationships: “Add a friend” with simple preset

### Hobbyist workflow

```
Gallery fills over time → Personality + Relationships → Multiple stories
→ Expand Advanced for backstory → Expand Insights when preparing for AI/export
```

### Professional workflow

```
Full gallery + classification → Relationship web → Story assignments across project
→ Advanced details (version notes, appearance) → Continuity Insights for RGC/BBC metrics
→ Same schema as child — depth is optional sections
```

**Same page. Emergent complexity.** Aligned with [FINISHED_CREATIVE_WORK_PRINCIPLE.md](./FINISHED_CREATIVE_WORK_PRINCIPLE.md).

---

## Migration impact

### Schema

| Change | Required? |
|--------|-----------|
| Gallery slots | **No** — roles exist |
| Personality traits array | **Optional** — recommended additive column |
| Relationships | **Phase E** — [CHARACTER_RELATIONSHIPS_V1.md](./CHARACTER_RELATIONSHIPS_V1.md) |
| Classification V2 columns | **Optional** — [CHARACTER_CLASSIFICATION_V2.md](./CHARACTER_CLASSIFICATION_V2.md) |
| Character Bible tables | **Keep** — no replacement |

### Code / components

| V1 component | V2 disposition |
|--------------|----------------|
| `CharacterBibleView` | Reorder; remove tab nav as primary |
| `BibleSectionNav` | Remove from default or move inside Advanced |
| `ReferenceSection` | Merge into `CharacterGallery` |
| `TurnaroundSection` | Merge into `CharacterGallery` |
| `ExpressionsSection` | Merge into `CharacterGallery` |
| `IdentitySectionForm` | Split: header/classification/personality vs advanced |
| `DetailsSectionForm` | Move to Advanced (collapsed) |
| `CharacterBibleMetricsHeader` | Move to Continuity Insights |
| `ReferenceGraphInspector` | Move to Continuity Insights |
| `CharacterStoriesSection` | Enhance with Add / Create actions |

### Data / continuity

- Slot assignments unchanged
- Reference graph assembly unchanged
- Context packet unchanged
- Scoring functions unchanged — only **display location** moves

### Public portfolio

`/u/[username]/characters/[id]` may adopt simplified public subset (header + gallery + stories) — separate pass.

---

## Implementation recommendations

### Phasing

| Slice | Deliverable | Depends on |
|-------|-------------|------------|
| **C1** | V2 layout shell + Header + collapsed Advanced / Insights | — |
| **C2** | Unified `CharacterGallery` with inline Upload + Assign | — |
| **C3** | Personality chips | Optional traits column |
| **C4** | Stories — Add to Story + Create Story | Phase 2B patterns |
| **C5** | Creator progress checklist | C2, C3, C4 |
| **C6** | Classification V2 in Advanced section | [CHARACTER_CLASSIFICATION_V2.md](./CHARACTER_CLASSIFICATION_V2.md) |
| **C7** | Relationships section (live data) | Phase E + [CHARACTER_RELATIONSHIPS_V1.md](./CHARACTER_RELATIONSHIPS_V1.md) |
| **C8** | Generate on slot | Phase F (AI) |

**Suggested timing:** After **Phase A2–A3** (story workflow) or in parallel — character page is independent of comics/publish but aligns with creator-first IA.

### New components (planned)

| Component | Responsibility |
|-----------|----------------|
| `CharacterWorkspaceV2` | Page layout orchestrator |
| `CharacterHeader` | Name, type, style, compact progress |
| `CharacterGallery` | Unified slot grid |
| `CharacterGallerySlot` | Single slot — upload / assign / generate |
| `CharacterPersonalityChips` | Trait selection |
| `CharacterRelationshipsSection` | Placeholder → live graph |
| `CharacterStoriesPanel` | List + Add / Create |
| `CharacterAdvancedDetails` | Collapsed `<details>` wrapper |
| `CharacterContinuityInsights` | Collapsed metrics + graph + recommendations |
| `lib/character-creator-progress.ts` | Checklist + % for creators |

### Files likely touched

| File | Change |
|------|--------|
| `src/app/dashboard/characters/[id]/page.tsx` | Pass props to V2 layout |
| `src/components/character-bible/CharacterBibleView.tsx` | Refactor or replace with V2 |
| `src/lib/creator-vocabulary.ts` | Character-facing labels |
| `src/lib/character-bible-scores.ts` | No logic change; import only from Insights |

### Founder testing checklist (post-implementation)

- [ ] New character: Portrait + personality achievable **without scrolling past metrics**
- [ ] All 10 gallery slots actionable **without tab switch**
- [ ] Upload from slot assigns correct role
- [ ] Assign Existing opens picker; returns to same slot
- [ ] Progress shows Portrait ✓ after canonical set
- [ ] Continuity Insights collapsed by default; metrics still accurate when expanded
- [ ] Add to Story links character without leaving page
- [ ] Create Story from character page lands on story with character on roster
- [ ] Child tester can describe character without hearing “archetype” or “consistency score”
- [ ] Professional can still reach full details and internal metrics

---

## Relationship to Story page A1

Both apply the same principle: **creation first, planning/metrics collapsed**.

| Story page (A1 shipped) | Character page (V2 planned) |
|-------------------------|----------------------------|
| What's next → Chapters | Header → Gallery |
| Advanced story plan (collapsed) | Advanced character details (collapsed) |
| Metrics hidden until expanded | Continuity insights (collapsed) |
| Creator progress / finish path | Creator progress checklist |

---

## Rationale summary

| Audience | V1 pain | V2 answer |
|----------|---------|-----------|
| **Child** | Scores and tabs before pictures | Gallery + trait chips first |
| **Hobbyist** | Where are my missing images? | One gallery, every slot visible |
| **Professional** | Metrics useful but in the way | Insights available, not default |
| **Continuity engine** | Unchanged | Same slots, graph, packet, bibles |

**Simple on the surface. Continuity power underneath.**

---

## Document index

| Doc | Role |
|-----|------|
| [CHARACTER_CLASSIFICATION_V2.md](./CHARACTER_CLASSIFICATION_V2.md) | Type / Style / Traits in Advanced section |
| [CHARACTER_RELATIONSHIPS_V1.md](./CHARACTER_RELATIONSHIPS_V1.md) | Relationships section data model |
| [CREATIVE_FORMAT_V2.md](./CREATIVE_FORMAT_V2.md) | Remove character creative format |
| [PHASE_A1_IMPLEMENTATION_REPORT.md](./PHASE_A1_IMPLEMENTATION_REPORT.md) | Precedent for collapsed advanced pattern |

---

## Version

| Version | Date | Notes |
|---------|------|-------|
| 2.0 | 2026-06-14 | Founder UX review — gallery-first layout, progress simplification |
