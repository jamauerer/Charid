# Character Bible V1 — Design and Implementation Plan

Product architecture document — **design first, no implementation**.

**Priority:** Character Bible V1 is CharID's **current shipping target**. It builds the **Reference Graph** that the [Reference-First Identity Model (RFIM)](./CHARACTER_IDENTITY_LAYER.md) requires as Pillar A — plus creator-authored **Visual Identity Descriptors** (RFIM Pillar B, partial).

See also:
- [CHARACTER_IDENTITY_LAYER.md](./CHARACTER_IDENTITY_LAYER.md) — RFIM architecture; derived signals are **post–Bible V1**
- [CHARID_CORE_PRINCIPLE.md](./CHARID_CORE_PRINCIPLE.md)
- [REFERENCE_ASSETS_VISION.md](./REFERENCE_ASSETS_VISION.md)
- [CREATOR_SHOWCASE_V1_PLAN.md](./CREATOR_SHOWCASE_V1_PLAN.md)

**Characters are not prompts. Characters are long-term creative assets.**

**Images are references. Identity is the asset.**

**V1 builds the reference package. RFIM Phase 1 derives embeddings from it later.**

---

## Revision summary (approved)

| Change | Decision |
|--------|----------|
| RFIM alignment | Bible V1 = **Pillar A (Reference Graph)** + partial **Pillar B (Descriptors)** |
| Primary deliverable | Typed multi-view reference assets — not photoreal face analysis |
| Identity vs version data | Permanent identity on `characters`; version state on `character_bible` |
| `identity_archetype` | On `character_bible` — routes required graph nodes + future RFIM enrichments |
| Canonical image | `asset_role = 'canonical'`; `featured_image_id` must reference it |
| Reference graph | **Computed from** typed `character_images` + bible metadata (no separate graph table V1) |
| Progress metrics | **Reference Graph Completion**, **Character Bible Completion**, **CCS**, **AI Readiness** |
| Extended asset roles | `outfit_*`, `prop_*`, `companion_*`, `vehicle_*` — schema-ready, UI V1.5 |

---

## 1. Architecture

### Character Bible V1 in the RFIM stack

```text
┌─────────────────────────────────────────────────────────────────┐
│  CHARACTER BIBLE V1 (this document — ship now)                   │
│                                                                  │
│  PILLAR A — Reference Graph                                      │
│    canonical · reference gallery · turnaround_* · expression_* │
│    (+ reserved outfit/prop/companion/vehicle roles)              │
│                                                                  │
│  PILLAR B — Visual Identity Descriptors (creator-authored)       │
│    identity text · version state text · identity_archetype         │
└───────────────────────────────┬─────────────────────────────────┘
                                │ consumed by
┌───────────────────────────────▼─────────────────────────────────┐
│  RFIM IDENTITY LAYER (future — CHARACTER_IDENTITY_LAYER.md)      │
│  Pillar B derived: palette · VLM traits · semantic regions       │
│  Pillar C derived: fused SigLIP+DINOv2 · optional landmarks      │
└───────────────────────────────┬─────────────────────────────────┘
                                │
┌───────────────────────────────▼─────────────────────────────────┐
│  AI GENERATION (future)                                          │
│  compile Reference Graph + Descriptors + derived signals           │
└─────────────────────────────────────────────────────────────────┘
```

**V1 scope boundary:** Creators build the graph. CharID stores it. Scoring measures graph completeness. **No** derived analysis, embeddings, or generation in V1.

### Core principle

```text
┌─────────────────────────────────────────────────────────────────┐
│  CHARACTER IDENTITY (permanent — characters)                     │
│  name · species · core personality · permanent traits · backstory│
└───────────────────────────────┬─────────────────────────────────┘
                                │
┌───────────────────────────────▼─────────────────────────────────┐
│  CHARACTER BIBLE (version state + RFIM metadata — character_bible)│
│  identity_archetype · creative_format · age · appearance · wardrobe│
└───────────────────────────────┬─────────────────────────────────┘
                                │
┌───────────────────────────────▼─────────────────────────────────┐
│  REFERENCE GRAPH NODES (character_images + asset_role)           │
│  The typed visual reference package RFIM requires                  │
└─────────────────────────────────────────────────────────────────┘
```

CharID's differentiator is **consistency across media and formats** (realistic, anime, comic, creature, anthro). The Reference Graph is the **portable identity substrate** — the same structure InstantCharacter, IP-Adapter multi-ref, and StoryDiffusion-style pipelines expect: **multiple typed views of the same character**.

### Identity vs version data

**Permanent identity** — `characters`:

| Field | RFIM use |
|-------|----------|
| Name, species, core personality, permanent features, backstory | Pillar B descriptors (creator authority) |

**Version state + RFIM metadata** — `character_bible`:

| Field | RFIM use |
|-------|----------|
| `identity_archetype` | Routes required graph nodes + future optional enrichments |
| `creative_format` | Creator label (anime, comic, etc.) — UX + future adapters |
| age, height, build, hair, eyes, clothing, … | Pillar B version-state descriptors |

**Reference graph nodes** — `character_images.asset_role`:

| Role family | Graph node type |
|-------------|-----------------|
| `canonical` | Primary identity anchor — 1 per version |
| `reference` | Gallery nodes — unlimited |
| `turnaround_*` | View-angle nodes — 1 per slot |
| `expression_*` | Emotion nodes — 1 per slot |
| `outfit_*`, `prop_*`, … | Extended nodes — V1.5 UI |

### What Character Bible V1 delivers for RFIM

| RFIM need | Bible V1 provides |
|-----------|-------------------|
| Multi-view references | Turnaround + expression slots + reference gallery |
| Canonical anchor | Dedicated `canonical` slot |
| Typed roles for compilation | `asset_role` prefix convention |
| Version scope | One `character_bible` row = current version |
| Archetype routing | `identity_archetype` on bible row |
| Creator descriptors | Identity + Details text fields |
| Graph assembly API | `assembleReferenceGraph()` — pure function |
| Readiness metrics | Reference Graph Completion + archetype-aware AI Readiness |

### What Character Bible V1 does NOT include

- SigLIP/DINOv2 fusion, landmarks, ArcFace, depth maps (RFIM Phase 1)
- VLM trait extraction, semantic regions (RFIM Phase 2)
- AI generation or adapter compilation (RFIM Phase 3)
- Public showcase publishing (Creator Showcase V1)
- Character version picker UI (V2)

---

## 2. Reference Graph (Pillar A)

### Definition

The **Reference Graph** is the set of typed visual references for one character version, plus metadata linking them to the same identity.

**V1 storage model:** The graph is **not** a separate table. It is **materialized at read time** from:

```text
characters              → identity descriptors (Pillar B partial)
character_bible         → version descriptors + identity_archetype
character_images        → graph nodes (asset_role, sort_order, image_path)
characters.featured_image_id → pointer to canonical node
```

**V2+ (Identity Layer):** Optional cached `reference_graph_json` on `character_identity_layers` for derived-signal jobs. Bible V1 remains source of truth.

### Graph node model

```typescript
// src/types/reference-graph.ts (proposed)

export type ReferenceGraphNodeType =
  | "canonical"
  | "reference"
  | "turnaround"
  | "expression"
  | "extended"; // outfit_*, prop_*, companion_*, vehicle_*

export type ReferenceGraphNode = {
  imageId: string;
  assetRole: string;           // e.g. turnaround_front, expression_neutral
  assetRoleLabel: string | null;
  nodeType: ReferenceGraphNodeType;
  slotKey: string | null;      // turnaround_front | expression_happy | null for gallery
  sortOrder: number;
  imagePath: string;
  url: string | null;          // resolved at assembly time
  isFeatured: boolean;         // featured_image_id match
};

export type ReferenceGraph = {
  characterId: string;
  bibleId: string;
  identityArchetype: IdentityArchetype;
  creativeFormat: string | null;
  versionLabel: string;        // "current" in V1
  nodes: ReferenceGraphNode[];
  nodeCountByType: Record<ReferenceGraphNodeType, number>;
  descriptors: VisualIdentityDescriptors;
};
```

### Node type mapping (`asset_role` → graph)

| `asset_role` pattern | `nodeType` | `slotKey` |
|----------------------|------------|-----------|
| `canonical` | canonical | `canonical` |
| `reference` | reference | null |
| `turnaround_front` … `turnaround_back` | turnaround | role suffix |
| `expression_neutral` … `expression_surprised` | expression | role suffix |
| `outfit_*`, `prop_*`, `companion_*`, `vehicle_*` | extended | full role string |
| `other` | reference | null |

### Graph assembly (V1 API)

```typescript
// src/lib/assemble-reference-graph.ts (proposed)

assembleReferenceGraph(
  character: Character,
  bible: CharacterBible,
  images: CharacterImageWithUrl[]
): ReferenceGraph
```

**Rules:**

1. Sort nodes: canonical first, then turnaround order, expressions, reference gallery by `sort_order`
2. Validate: at most one node per slot role (`canonical`, each `turnaround_*`, each `expression_*`)
3. Attach `descriptors` from character + bible text fields
4. Compute `nodeCountByType` for scoring

**Future RFIM Phase 1** calls the same function, then passes `ReferenceGraph` to embedding jobs.

### Archetype-aware required nodes

Not every character needs human expression slots. Requirements depend on `identity_archetype`:

| Archetype | Required nodes (Reference Graph Completion) | Recommended nodes |
|-----------|-----------------------------------------------|-------------------|
| `humanoid_realistic` | canonical | turnaround_front, expression_neutral, ≥2 reference |
| `humanoid_stylized` | canonical | turnaround_front, expression_neutral, ≥1 reference |
| `humanoid_anime` | canonical | turnaround_front, expression_neutral, ≥2 reference |
| `humanoid_comic` | canonical | turnaround_front, ≥1 reference |
| `humanoid_cartoon` | canonical | turnaround_front, ≥1 reference |
| `humanoid_fantasy` | canonical | turnaround_front, ≥1 reference |
| `anthropomorphic` | canonical | turnaround_front, expression_neutral, ≥1 reference |
| `creature_quadruped` | canonical | ≥2 reference (full-body refs) |
| `creature_other` | canonical | ≥1 reference |

Expression slots **hidden in UI** when archetype is `creature_quadruped` or `creature_other` (not required, not scored).

Turnaround slots **recommended but optional** for creatures — full-body `reference` images satisfy the graph.

### Reference Graph Completion (RGC)

**Primary V1 progress metric for RFIM readiness.**

```text
RGC = weighted sum of archetype-required nodes present
    + bonus for recommended nodes
    → 0–100
```

Example weights for `humanoid_anime`:

| Node | Weight |
|------|--------|
| canonical | 30% |
| turnaround_front | 20% |
| expression_neutral | 15% |
| turnaround (other 3 views) | 5% each (15% total) |
| ≥ 2 reference images | 10% |
| other expressions | 2% each (bonus cap 10%) |

Creature archetypes substitute reference-gallery weights for turnaround/expression weights.

**Display:** "Reference Graph 72%" alongside CCS in bible header.

---

## 3. Visual Identity Descriptors (Pillar B — creator-authored)

RFIM Pillar B includes machine-extracted traits later. **Bible V1 delivers the creator-authored subset:**

```typescript
export type VisualIdentityDescriptors = {
  // Permanent (characters)
  name: string;
  species: string | null;
  corePersonality: string | null;
  permanentFeatures: string | null;
  backstory: string | null;
  // Version state (character_bible)
  age: string | null;
  height: string | null;
  build: string | null;
  hair: string | null;
  eyes: string | null;
  clothing: string | null;
  accessories: string | null;
  scarsTattoos: string | null;
  otherDetails: string | null;
  // RFIM metadata
  identityArchetype: IdentityArchetype;
  creativeFormat: string | null;
};
```

Included in `ReferenceGraph.descriptors` at assembly time. Future Identity Layer adds `extractedTraits`, `palette`, `silhouetteClass` without changing V1 schema.

### Descriptor Completion

```text
descriptor_completion = filled descriptor fields / archetype-relevant field count
```

Identity fields always count; version fields always count for humanoid archetypes.

---

## 4. UX flow

Character detail → **Character Bible** at `/dashboard/characters/[id]`.

### Page layout (reference-graph-centric)

```text
┌──────────────────────────────────────────────────────────────────┐
│  CHARACTER BIBLE                                                 │
│  Fire · humanoid_anime · Anime                                   │
│                                                                  │
│  Character Consistency Score          72                         │
│  Reference Graph 68%  ·  Bible Completion 71%  ·  AI Ready 54%  │
│                                                                  │
│  Reference package:                                              │
│  ✓ Canonical   ✓ Turnaround front   ○ Turnaround back            │
│  ✓ Expr neutral   ○ Expr happy   · 4 reference images            │
│                                                                  │
│  Next: Add turnaround back · Add expression: Happy               │
├──────────────────────────────────────────────────────────────────┤
│  [Identity] [Reference Graph] [Turnaround] [Expressions] [Details]│
├──────────────────────────────────────────────────────────────────┤
│  (active section)                                                │
└──────────────────────────────────────────────────────────────────┘
```

Tab rename: **Reference** → **Reference Graph** — shows canonical slot + gallery + node list with roles.

### Section guidance (RFIM-aligned)

#### Identity + Archetype

> **Why this matters:** Identity defines who your character is across every story and medium. **Archetype** tells CharID which reference views matter for your character type — anime, creature, anthro, and more — so the reference graph fits your art form.

**Fields:**

| Field | Table |
|-------|-------|
| Name, species, core personality, permanent features, backstory | `characters` |
| **Identity archetype** | `character_bible` |
| **Creative format** (optional label) | `character_bible` |
| Gender, location | `characters` — optional, not scored |

**Archetype selector** — required after first bible save. Default inferred from species text heuristics; creator confirms.

#### Reference Graph

> **Why this matters:** The reference graph is CharID's memory of how your character looks. Future consistency tools — and AI generation — use these typed images together, not one photo alone. Build the same package an animator would: canonical portrait, views, expressions, and supporting refs.

- **Canonical slot** (required node)
- **Reference gallery** (unlimited `reference` nodes)
- Live **graph summary**: node counts, missing required slots

#### Turnaround / Expressions

> **Why this matters:** Multi-view nodes are the strongest signal for keeping your character on-model from new angles. These become direct inputs to CharID's future identity layer.

Slot UI unchanged; hidden when archetype excludes them.

#### Details (version state)

> **Why this matters:** Version details describe how your character looks **right now** — age, outfit, acquired scars. They pair with reference images to form the full descriptor set RFIM sends to future AI.

---

## 5. Database additions

**Proposed only — no migrations in this document.**

### `characters` — permanent identity

```text
characters
├── name, species, core_personality, permanent_features, backstory
├── gender, location                    -- optional
├── featured_image_id                   -- MUST → canonical character_images row
├── photo_path                          -- legacy sync
├── world_id, is_public
└── created_at

-- MOVE OFF characters:
-- age → character_bible.age
```

### `character_bible` — version state + RFIM metadata

```text
character_bible
├── character_id          uuid PK FK
├── user_id               uuid NOT NULL
├── identity_archetype    text NOT NULL DEFAULT 'humanoid_stylized'
├── creative_format       text NULL
├── age, height, build, hair, eyes
├── clothing, accessories, scars_tattoos, other_details
├── created_at, updated_at
```

**`identity_archetype` values:**

```text
humanoid_realistic | humanoid_stylized | humanoid_anime | humanoid_comic
humanoid_cartoon | humanoid_fantasy | anthropomorphic
creature_quadruped | creature_other
```

### `character_images` — reference graph nodes

```text
character_images
├── ... existing ...
├── asset_role            text NOT NULL DEFAULT 'reference'
├── asset_role_label      text NULL
```

Pattern CHECK unchanged (see prior revision): `canonical`, `reference`, `turnaround_*`, `expression_*`, `outfit_*`, `prop_*`, `companion_*`, `vehicle_*`, `other`.

**Graph integrity (app-enforced):**

- One `canonical` per character (V1; per version in V2)
- One image per slot role for turnaround / expression
- `featured_image_id` updated whenever canonical slot changes

### No `reference_graph` table in V1

Graph is computed. Optional materialized JSON belongs on future `character_identity_layers.reference_graph_json` when derived analysis ships.

---

## 6. Scoring model

```text
src/lib/character-bible-scores.ts
  computeCharacterBibleScores(...) → {
    referenceGraphCompletion: number   // RGC — RFIM primary
    bibleCompletion: number              // BBC
    consistencyScore: number             // CCS
    aiReadiness: number
    graphSummary: GraphSlotSummary[]
    recommendations: Recommendation[]
  }
```

Also exports:

```text
src/lib/assemble-reference-graph.ts
  assembleReferenceGraph(...) → ReferenceGraph
```

### 6.1 Reference Graph Completion (RGC)

Archetype-weighted required + recommended nodes (§2). **Headline sub-metric for RFIM progress.**

### 6.2 Character Bible Completion (BBC)

Five sections × 20%:

| Section | Weight |
|---------|--------|
| Identity + archetype | 20% |
| Reference graph (canonical + gallery) | 20% |
| Turnaround | 20% (or archetype-adjusted) |
| Expressions | 20% (or N/A → weight redistributed for creatures) |
| Details | 20% |

For creature archetypes, turnaround/expression section weights **redistribute** to reference gallery + details.

### 6.3 Character Consistency Score (CCS)

Unchanged intent — visual consistency weighted:

```text
CCS = 0.15 × identity + 0.10 × reference_gallery + 0.15 × canonical
    + 0.25 × turnaround + 0.25 × expressions + 0.10 × details
```

Creature archetypes: turnaround + expression terms use **reference body coverage** substitutes (≥1 full-body ref, ≥2 refs).

### 6.4 AI Readiness (RFIM-aligned, archetype-aware)

Checkpoints vary by archetype — **never require human expression slots for creatures**.

**Humanoid / anthro minimum:**

| Checkpoint | Weight |
|------------|--------|
| Name + species | 10% |
| Core personality | 10% |
| Canonical node | 25% |
| Turnaround front | 15% |
| Expression neutral | 15% |
| Version details (hair, eyes, build) | 15% |
| ≥ 2 reference nodes | 10% |

**Creature minimum:**

| Checkpoint | Weight |
|------------|--------|
| Name + species | 15% |
| Canonical node | 30% |
| ≥ 2 reference nodes (full-body) | 30% |
| Version / identity descriptors | 25% |

Tiers unchanged: Not ready / Partially / Mostly / Ready.

### 6.5 Recommendations

Prioritize **missing reference graph nodes** first, then descriptors:

```text
priority = RGC gap (0.6) + CCS gap (0.25) + AI readiness gap (0.15)
```

Examples:

- "Add canonical portrait — required reference graph anchor"
- "Add turnaround: Back — strengthens multi-view graph"
- "Set identity archetype to match your character type"

---

## 7. Future character versions

Unchanged conceptually. `character_images.character_version_id` scopes graph nodes per version in V2. `assembleReferenceGraph()` accepts `versionId`.

---

## 8. Future AI integration (RFIM handoff)

Bible V1 output is the **input** to RFIM Phase 1:

```text
assembleReferenceGraph(character, bible, images)
        ↓
ReferenceGraph { nodes, descriptors, identityArchetype }
        ↓
[RFIM Phase 1] fuse SigLIP+DINOv2 across nodes
[RFIM Phase 2] semantic regions, optional landmarks
[RFIM Phase 3] compile to generation adapters
```

### Character Context Packet (future — excerpt)

```json
{
  "reference_graph": {
    "identity_archetype": "humanoid_anime",
    "creative_format": "anime",
    "nodes": [
      { "asset_role": "canonical", "url": "..." },
      { "asset_role": "turnaround_front", "url": "..." },
      { "asset_role": "expression_neutral", "url": "..." }
    ]
  },
  "descriptors": {
    "name": "Fire",
    "species": "Human",
    "hair": "Spiked blue",
    "core_personality": "..."
  },
  "derived": null
}
```

V1 ships `reference_graph` + `descriptors` only. `derived` populated by Identity Layer later.

---

## 9. Recommended implementation order

| Step | Deliverable | RFIM pillar |
|------|-------------|-------------|
| **1** | Migration: identity fields on `characters`; move `age` | B |
| **2** | Migration: `character_bible` + `identity_archetype`, `creative_format` | B |
| **3** | Migration: `character_images.asset_role` + CHECK; backfill; canonical migration | **A** |
| **4** | Types: `ReferenceGraph`, `IdentityArchetype`, `VisualIdentityDescriptors` | A, B |
| **5** | `assemble-reference-graph.ts` | **A** |
| **6** | `character-bible-scores.ts` — RGC, BBC, CCS, AI Readiness (archetype-aware) | A, B |
| **7** | Actions: identity, bible, archetype update; canonical enforcement | A, B |
| **8** | Actions: slot upload/replace, role assignment | **A** |
| **9** | `CharacterBibleMetricsHeader` — RGC + CCS + graph slot summary | A |
| **10** | Section UI: Identity+Archetype, Reference Graph, Turnaround, Expressions, Details | A, B |
| **11** | Refactor `/dashboard/characters/[id]` | — |
| **12** | Create flow → bible with archetype prompt | B |
| **13** | Unit tests: graph assembly + archetype scoring fixtures | A |

### Migration SQL order

```text
1. YYYYMMDD_character_identity_fields.sql
2. YYYYMMDD_character_bible.sql              -- includes identity_archetype, creative_format
3. YYYYMMDD_character_images_asset_role.sql
4. fix-character-bible-api.sql
```

### Success criteria (V1)

- [ ] `assembleReferenceGraph()` returns typed nodes for any character with images
- [ ] Archetype drives required slots, hidden UI, and scoring weights
- [ ] Canonical slot enforced; `featured_image_id` always canonical
- [ ] Reference Graph Completion visible and accurate per archetype
- [ ] Creator can build a complete multi-view package without AI features
- [ ] RFIM Phase 1 can consume graph output without schema migration

### Explicitly deferred → RFIM / later bible versions

| Item | Target |
|------|--------|
| Fused SigLIP+DINOv2 embeddings | RFIM Phase 1 |
| VLM traits, palette extraction | RFIM Phase 1 |
| Semantic regions UI | RFIM Phase 2 |
| Landmarks, ArcFace | RFIM Phase 2 (optional branch) |
| Outfit/prop/companion/vehicle slot UI | Bible V1.5 |
| Version picker | Bible V2 |
| AI generation | RFIM Phase 3 |

---

## Summary

| Question | Answer |
|----------|--------|
| What is Bible V1? | Builder for **RFIM Pillar A (Reference Graph)** + creator **Pillar B descriptors** |
| Primary data | Typed `character_images` nodes + identity/bible text + `identity_archetype` |
| Graph storage | Computed via `assembleReferenceGraph()` — no graph table V1 |
| Key metric | **Reference Graph Completion** (archetype-aware) |
| All formats? | Yes — archetype routes required nodes (creatures ≠ human expression slots) |
| Identity Layer | Consumes bible output in RFIM Phase 1 — not part of V1 ship |
| Next step | Migrations 1–3 + `assemble-reference-graph.ts` + bible UI |

---

*Document status: RFIM-aligned — Character Bible V1 priority. No code, migrations, or implementation implied.*
