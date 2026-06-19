# AI Foundation Phase 1 — Architecture Before AI

Product architecture document — **design first**.

Prepare CharID for future AI generation and consistency systems **without building generation or chat**. Characters, worlds, stories, and assets are **AI context** — structured canon, not raw prompts.

See also:
- [CHARACTER_BIBLE_V1.md](./CHARACTER_BIBLE_V1.md) — Character Bible (RFIM Phase 0, **current priority**)
- [CHARACTER_IDENTITY_LAYER.md](./CHARACTER_IDENTITY_LAYER.md) — RFIM derived signals (post-foundation)
- [CHARID_CORE_PRINCIPLE.md](./CHARID_CORE_PRINCIPLE.md)
- [REFERENCE_ASSETS_VISION.md](./REFERENCE_ASSETS_VISION.md)
- [CREATOR_SHOWCASE_V1_PLAN.md](./CREATOR_SHOWCASE_V1_PLAN.md)

**Do not build:** image generation, chat, embeddings, landmarks, 3D reconstruction.

**Do build (foundation):** bible data models, reference assets, scoring, context packet **assemblers** (read-only JSON).

---

## 1. Architecture

### Core principle

```text
Workspace objects     ≠  content to publish
Workspace objects     =  structured canon for future AI

Future AI consumes    →  Context Packets
Never                 →  prompt-only workflows
```

CharID remains fully useful before AI exists: creators organize canon, track bible completion, and see AI readiness — the same data later powers generation.

### System layers

```text
┌─────────────────────────────────────────────────────────────────┐
│  CREATIVE WORKSPACE (dashboard — private by default)             │
│  Characters · Worlds · Stories · Chapters · Assets               │
└───────────────────────────────┬─────────────────────────────────┘
                                │
┌───────────────────────────────▼─────────────────────────────────┐
│  BIBLE LAYER (structured canon — Phase 1 foundation)             │
│  Character Bible V1 · World Bible V1 · Story Bible V1            │
│  Text descriptors + typed reference assets + completion scores   │
└───────────────────────────────┬─────────────────────────────────┘
                                │
┌───────────────────────────────▼─────────────────────────────────┐
│  CONTEXT PACKET LAYER (read-only assembly — design + implement)  │
│  assembleCharacterContext · assembleWorldContext ·               │
│  assembleStoryContext · assembleCombinedContext                  │
└───────────────────────────────┬─────────────────────────────────┘
                                │
┌───────────────────────────────▼─────────────────────────────────┐
│  IDENTITY LAYER (future — RFIM Phase 1+)                         │
│  Derived embeddings · regions · landmarks — NOT in this phase    │
└───────────────────────────────┬─────────────────────────────────┘
                                │
┌───────────────────────────────▼─────────────────────────────────┐
│  AI GENERATION / CHAT (future — not Phase 1)                     │
└─────────────────────────────────────────────────────────────────┘
```

### Three bibles — parallel pattern

Each bible follows the same architecture:

| Layer | Character | World | Story |
|-------|-----------|-------|-------|
| **Anchor table** | `characters` | `worlds` | `stories` |
| **Bible extension** | `character_bible` | `world_bible` | `story_bible` |
| **Reference assets** | `character_images` + `asset_role` | `world_images` + `asset_type` | `story_images` + `asset_type` |
| **Graph / canon assembly** | `assembleReferenceGraph()` | `assembleWorldCanon()` | `assembleStoryCanon()` |
| **Scoring** | `character-bible-scores.ts` | `world-bible-scores.ts` | `story-bible-scores.ts` |
| **Context packet** | `CharacterContextPacket` | `WorldContextPacket` | `StoryContextPacket` |

### Future generation flow (not implemented)

```text
Character Bible  ──┐
World Bible      ──┼──► Combined Context Packet ──► AI Generation (future)
Story Bible      ──┘
```

All future AI entry points must accept a **Context Packet** (or reject with readiness errors). No bypass via raw user prompts alone.

### RFIM compatibility (Character only in Phase 1)

Character Bible V1 builds **RFIM Pillar A + B** (reference graph + creator descriptors). Identity Layer derived data attaches later without bible schema changes.

| RFIM need | AI Foundation Phase 1 |
|-----------|-------------------------|
| `identity_archetype` | `character_bible.identity_archetype` |
| Canonical + multi-view refs | `character_images.asset_role` |
| Visual descriptors | Identity + version text fields |
| Fused embeddings | **Not stored** — assembler leaves `derived: null` |
| Landmarks / reconstruction | **Not stored** |

World and Story bibles use the same **reference asset + descriptor** pattern; they do not use `identity_archetype` or RFIM graph slots.

### Privacy

Bibles are **workspace-private** (aligned with Creator Showcase privacy model). Context packets are owner-scoped. Public showcase publishes curated subsets later — not raw bible canon.

---

## 2. Database additions

**Proposed only — implement incrementally per slice below.**

### 2.1 Character Bible V1 (priority — see [CHARACTER_BIBLE_V1.md](./CHARACTER_BIBLE_V1.md))

**`characters`** — add identity fields; move `age` off:

```text
species, core_personality, permanent_features  -- NEW
-- age → character_bible
```

**`character_bible`** — NEW (1:1):

```text
character_id PK, user_id
identity_archetype, creative_format
age, height, build, hair, eyes, clothing, accessories, scars_tattoos, other_details
created_at, updated_at
```

**`character_images`** — add:

```text
asset_role, asset_role_label
```

### 2.2 World Bible V1

**`worlds`** — keep `name`, `slug`, `description` (short card blurb). Extended canon moves to `world_bible`.

**`world_bible`** — NEW (1:1):

```text
world_bible
├── world_id              uuid PK FK → worlds(id) ON DELETE CASCADE
├── user_id               uuid NOT NULL
├── summary               text NULL          -- extended world overview (AI canon)
├── locations             text NULL          -- key places, geography (V1 text; V2 structured rows)
├── cultures              text NULL          -- peoples, societies, customs
├── rules                 text NULL          -- magic, tech, physics, constraints
├── history               text NULL          -- optional world backstory
├── created_at, updated_at
```

**`world_images`** — NEW (mirror `story_images`):

```text
world_images
├── id                    uuid PK
├── world_id              uuid FK
├── image_path            text NOT NULL
├── caption               text NULL
├── asset_type            text NOT NULL DEFAULT 'reference'
│                         CHECK (asset_type IN (
│                           'cover', 'map', 'location', 'mood_board', 'reference', 'other'
│                         ))
├── sort_order            integer DEFAULT 0
├── created_at            timestamptz
```

**`worlds.featured_image_id`** — optional FK → `world_images` (canonical cover separate from legacy `cover_image_path` migration path).

**V1 migration note:** Backfill `world_images` from existing `cover_image_path` as `asset_type = 'cover'`.

### 2.3 Story Bible V1

**`stories`** — keep `title`, `slug`, `summary`, `status`, `project_type`, `featured_image_id`.

**`story_bible`** — NEW (1:1):

```text
story_bible
├── story_id              uuid PK FK → stories(id) ON DELETE CASCADE
├── user_id               uuid NOT NULL
├── themes                text NULL          -- thematic through-lines
├── timeline              text NULL          -- chronological overview
├── major_events          text NULL          -- plot beats, turning points
├── tone                  text NULL          -- optional mood / genre notes
├── created_at, updated_at
```

**Key characters:** use existing **`story_characters`** junction — no duplicate roster.

**`story_images`** — already proposed in `20250622000000_story_images.sql`:

```text
asset_type: cover | reference | mood_board | key_scene | other
```

Ensure migration is applied; bible scoring treats `story_images` as reference asset graph.

### 2.4 Identity Layer tables (future — NOT Phase 1)

Do **not** create `character_identity_layers` until RFIM Phase 1. Bible schema is sufficient for compatibility.

### 2.5 RLS sketch

| Table | Owner | Public |
|-------|-------|--------|
| `character_bible`, `world_bible`, `story_bible` | CRUD via parent ownership | None |
| `world_images` | Via `worlds.user_id` | Legacy world public policies only |
| `character_images`, `story_images` | Existing patterns | Legacy public policies |

### 2.6 Storage

Unchanged bucket: `character-photos`.

```text
{user_id}/characters/{id}/...
{user_id}/worlds/{id}/...
{user_id}/worlds/{world_id}/stories/{story_id}/...
```

---

## 3. UI additions

### 3.1 Character Bible V1 (priority)

**Route:** `/dashboard/characters/[id]` → Character Bible layout.

| UI | Purpose |
|----|---------|
| Metrics header | Reference Graph Completion, CCS, BBC, AI Readiness |
| Archetype selector | `identity_archetype`, `creative_format` |
| Tabs | Identity · Reference Graph · Turnaround · Expressions · Details |
| Slot upload UI | canonical, turnaround_*, expression_* |
| Recommendations | Missing graph nodes + descriptor gaps |

Full spec: [CHARACTER_BIBLE_V1.md](./CHARACTER_BIBLE_V1.md).

### 3.2 World Bible V1

**Route:** `/dashboard/worlds/[id]` → add **World Bible** section or tabbed layout (alongside existing edit, characters, stories).

| Section | Fields / UI |
|---------|-------------|
| **Overview** | Summary (extended), link to short `description` on card |
| **Locations** | Textarea — key places |
| **Cultures** | Textarea |
| **Rules** | Textarea — magic, tech, constraints |
| **Reference assets** | `WorldGalleryManager` — map, location, mood_board, reference |
| **Metrics** | World Bible Completion, AI Readiness |

Reuse patterns from `StoryGalleryManager` / `CharacterGalleryManager`.

### 3.3 Story Bible V1

**Route:** `/dashboard/worlds/[id]/stories/[storyId]` → Story Bible layout.

| Section | Fields / UI |
|---------|-------------|
| **Canon** | Summary (from `stories.summary`), themes, tone |
| **Timeline** | Textarea |
| **Major events** | Textarea |
| **Key characters** | Existing `StoryCharacterSection` — roster links |
| **Reference assets** | `StoryGalleryManager` (live if migration applied) |
| **Metrics** | Story Bible Completion, AI Readiness |

Chapters remain workspace writing surface — **not** in Story Bible V1 scope (chapter content excluded from AI readiness gates).

### 3.4 Shared UI patterns

| Pattern | Use |
|---------|-----|
| Bible metrics header | All three bibles |
| Section guidance text | "Why this matters for consistency / future AI" |
| Readiness checklist | Archetype-aware (character) or fixed (world/story) |
| No AI buttons | Readiness is progress only until generation ships |

### 3.5 Dashboard hints (optional V1.5)

Character / world / story cards show small **AI Ready** or **Bible %** badge.

---

## 4. Context Packet structure

**Design + read-only assemblers.** Packets are TypeScript types + pure functions — no LLM calls, no generation.

### 4.1 Shared types

```typescript
// src/types/context-packet.ts (proposed)

export type ReadinessScores = {
  bibleCompletion: number;       // 0–100
  aiReadiness: number;           // 0–100
  aiReadinessTier: "not_ready" | "partial" | "mostly" | "ready";
};

export type ReferenceAsset = {
  id: string;
  assetRoleOrType: string;
  caption: string | null;
  url: string | null;
  sortOrder: number;
};

export type ContextPacketMeta = {
  assembledAt: string;           // ISO timestamp
  schemaVersion: "1.0";
  userId: string;
};
```

### 4.2 Character Context Packet

```typescript
export type CharacterContextPacket = ContextPacketMeta & {
  kind: "character";
  characterId: string;
  bibleId: string;

  identity: {
    name: string;
    species: string | null;
    corePersonality: string | null;
    permanentFeatures: string | null;
    backstory: string | null;
  };

  descriptors: {
    identityArchetype: string;
    creativeFormat: string | null;
    age: string | null;
    height: string | null;
    build: string | null;
    hair: string | null;
    eyes: string | null;
    clothing: string | null;
    accessories: string | null;
    scarsTattoos: string | null;
    otherDetails: string | null;
  };

  referenceGraph: {
    nodes: ReferenceAsset[];
    canonicalId: string | null;
  };

  readiness: ReadinessScores;

  // RFIM compatibility — null until Identity Layer Phase 1
  derived: null | {
    fusedEmbeddingUri?: string;
    semanticRegions?: unknown[];
  };
};
```

**Assembler:**

```text
assembleCharacterContextPacket(characterId) → CharacterContextPacket
  → loads character, character_bible, character_images
  → calls assembleReferenceGraph()
  → calls computeCharacterBibleScores()
```

### 4.3 World Context Packet

```typescript
export type WorldContextPacket = ContextPacketMeta & {
  kind: "world";
  worldId: string;

  canon: {
    name: string;
    slug: string;
    shortDescription: string | null;  // worlds.description
    summary: string | null;
    locations: string | null;
    cultures: string | null;
    rules: string | null;
    history: string | null;
  };

  referenceAssets: ReferenceAsset[];

  readiness: ReadinessScores;

  derived: null;
};
```

**Assembler:** `assembleWorldContextPacket(worldId)`

### 4.4 Story Context Packet

```typescript
export type StoryContextPacket = ContextPacketMeta & {
  kind: "story";
  storyId: string;
  worldId: string;

  canon: {
    title: string;
    slug: string;
    summary: string | null;
    status: string;
    projectType: string;
    themes: string | null;
    timeline: string | null;
    majorEvents: string | null;
    tone: string | null;
  };

  keyCharacters: {
    characterId: string;
    name: string;
    // Future: embed CharacterContextPacket subset or URI
  }[];

  referenceAssets: ReferenceAsset[];

  readiness: ReadinessScores;

  derived: null;
};
```

**Assembler:** `assembleStoryContextPacket(storyId)`

**Note:** Key character entries are IDs + names in V1. Combined packet may inline full character packets when requested.

### 4.5 Combined Context Packet

```typescript
export type CombinedContextPacket = ContextPacketMeta & {
  kind: "combined";

  world: WorldContextPacket;
  story: StoryContextPacket;
  characters: CharacterContextPacket[];

  // Aggregate readiness — weakest link or weighted average (product choice)
  readiness: ReadinessScores & {
    characterReadiness: Record<string, number>;
  };

  derived: null;
};
```

**Assembler:**

```typescript
assembleCombinedContextPacket({
  worldId: string;
  storyId: string;
  characterIds?: string[];  // default: story roster from story_characters
}): CombinedContextPacket
```

**Future AI rule:** Generation endpoints require `CombinedContextPacket` (or single-entity packet for character-only tasks). `assertMinimumReadiness(packet, tier)` gates calls.

### 4.6 Example JSON (combined — abbreviated)

```json
{
  "kind": "combined",
  "schemaVersion": "1.0",
  "assembledAt": "2026-06-14T12:00:00Z",
  "world": {
    "kind": "world",
    "worldId": "...",
    "canon": {
      "name": "Aethermoor",
      "summary": "Floating archipelago world...",
      "rules": "Magic requires spoken true names..."
    },
    "referenceAssets": [{ "assetRoleOrType": "map", "url": "..." }],
    "readiness": { "bibleCompletion": 65, "aiReadiness": 55, "aiReadinessTier": "partial" }
  },
  "story": {
    "kind": "story",
    "storyId": "...",
    "canon": {
      "title": "The Windbinder's Oath",
      "themes": "Duty vs freedom",
      "timeline": "Year 402: expedition begins..."
    },
    "keyCharacters": [{ "characterId": "...", "name": "Fire" }],
    "referenceAssets": [{ "assetRoleOrType": "key_scene", "url": "..." }],
    "readiness": { "bibleCompletion": 70, "aiReadiness": 60, "aiReadinessTier": "partial" }
  },
  "characters": [
    {
      "kind": "character",
      "characterId": "...",
      "identity": { "name": "Fire", "species": "Human" },
      "referenceGraph": {
        "nodes": [{ "assetRoleOrType": "canonical", "url": "..." }],
        "canonicalId": "..."
      },
      "descriptors": { "identityArchetype": "humanoid_anime" },
      "readiness": { "bibleCompletion": 68, "aiReadiness": 54, "aiReadinessTier": "partial" },
      "derived": null
    }
  ],
  "readiness": {
    "bibleCompletion": 68,
    "aiReadiness": 54,
    "aiReadinessTier": "partial",
    "characterReadiness": { "...": 54 }
  },
  "derived": null
}
```

---

## 5. Scoring model (World + Story — proposed)

Character scoring: [CHARACTER_BIBLE_V1.md §6](./CHARACTER_BIBLE_V1.md).

### 5.1 World Bible Completion

| Section | Weight |
|---------|--------|
| Summary | 25% |
| Locations | 25% |
| Cultures | 20% |
| Rules | 20% |
| Reference assets (≥1 non-cover) | 10% |

### 5.2 World AI Readiness

| Checkpoint | Weight |
|------------|--------|
| Summary filled | 25% |
| Rules filled | 25% |
| Locations filled | 20% |
| ≥1 reference asset | 15% |
| Map or location asset | 15% |

### 5.3 Story Bible Completion

| Section | Weight |
|---------|--------|
| Summary | 20% |
| Themes | 15% |
| Timeline | 20% |
| Major events | 20% |
| ≥1 key character linked | 15% |
| Reference assets (≥1) | 10% |

### 5.4 Story AI Readiness

| Checkpoint | Weight |
|------------|--------|
| Summary + themes | 25% |
| Timeline | 20% |
| Major events | 20% |
| ≥2 key characters | 15% |
| ≥1 key_scene or cover asset | 20% |

---

## 6. Migration plan

Implement in **slices** — one bible at a time. Do not single mega-migration.

### Slice A — Character Bible (first)

```text
1. YYYYMMDD_character_identity_fields.sql
2. YYYYMMDD_character_bible.sql
3. YYYYMMDD_character_images_asset_role.sql
4. fix-character-bible-api.sql
```

Backfill: empty `character_bible` per character; `asset_role = 'reference'`; promote featured → `canonical`.

### Slice B — Context packet foundation

```text
(no migration — TypeScript only)
src/types/context-packet.ts
src/lib/assemble-reference-graph.ts
src/lib/assemble-character-context.ts
src/lib/character-bible-scores.ts
```

### Slice C — World Bible

```text
1. YYYYMMDD_world_bible.sql
2. YYYYMMDD_world_images.sql
3. fix-world-bible-api.sql
```

Backfill: `world_bible` rows; migrate `cover_image_path` → `world_images` cover.

### Slice D — Story Bible

```text
1. YYYYMMDD_story_bible.sql
2. (apply 20250622000000_story_images.sql if not already)
3. fix-story-bible-api.sql
```

Backfill: `story_bible` rows per story.

### Slice E — World + Story context assemblers

```text
src/lib/world-bible-scores.ts
src/lib/story-bible-scores.ts
src/lib/assemble-world-context.ts
src/lib/assemble-story-context.ts
src/lib/assemble-combined-context.ts
```

### Slice F — World + Story Bible UI

World bible tabs + story bible tabs on existing dashboard routes.

### Rollback

Each slice is additive. Rollback = hide UI + stop calling assemblers; bible tables remain harmless.

---

## 7. Implementation order

| Order | Slice | Deliverable | Unlocks |
|-------|-------|-------------|---------|
| **1** | A | Character Bible migrations | RFIM-ready reference graph storage |
| **2** | B | Character graph + scores + character context assembler | First context packet; AI integration hook |
| **3** | — | Character Bible UI | Creator-facing foundation |
| **4** | C | World Bible migrations | World canon storage |
| **5** | F (world) | World Bible UI + world scores | World context packet input |
| **6** | D | Story Bible migrations | Story canon storage |
| **7** | F (story) | Story Bible UI + story scores | Story context packet input |
| **8** | E | Combined context assembler | Scene-level AI context |
| **9** | — | Readiness badges on cards | Cross-bible visibility |

**Explicitly not in Phase 1:** embeddings, landmarks, chat, image generation, Identity Layer tables, public bible exposure.

---

## 8. Smallest implementation slice

### Recommendation: **Slice A + B (Character Bible data + Character Context Packet assembler)**

This is the minimum vertical cut that:

1. Stores structured character canon (identity, descriptors, typed reference graph)
2. Computes completion + AI readiness scores
3. Produces a **`CharacterContextPacket`** JSON document future AI can consume
4. Satisfies RFIM compatibility (`identity_archetype`, canonical refs, descriptors)
5. Delivers user value **today** (bible progress) without any AI features

**Includes:**

- Migrations: `character_bible`, identity fields, `asset_role`
- `assembleReferenceGraph()` + `assembleCharacterContextPacket()`
- `computeCharacterBibleScores()`
- Unit tests for graph assembly + packet shape

**Excludes (defer to next PRs):**

- Full Character Bible UI polish (can ship minimal after assembler)
- World Bible, Story Bible
- Combined context packet
- Identity Layer derived fields

### Why not start with all three bibles?

World and Story bibles reuse the same patterns but **Character Bible is the RFIM critical path** and the richest existing asset model (`character_images` already live). Shipping character foundation first validates context packet design before duplicating across world/story.

### Second slice (after character vertical)

**Slice A + B + Character Bible UI** — creators can build reference graphs interactively.

### Third slice

**World Bible (C + world UI + world context assembler)** — enables world-aware combined packets.

---

## 9. Success criteria (AI Foundation Phase 1 complete)

- [ ] All three bibles have schema + scoring + UI
- [ ] `assembleCombinedContextPacket()` returns valid JSON for a populated world/story/roster
- [ ] Every packet includes `readiness` scores and `derived: null`
- [ ] No generation or chat endpoints shipped
- [ ] Character reference graph compatible with RFIM Phase 1 (no migration required)
- [ ] System useful to creators with zero AI features enabled

---

## Summary

| Question | Answer |
|----------|--------|
| What is AI Foundation Phase 1? | Bible layer + context packet assemblers — not AI itself |
| Priority | **Character Bible V1** first |
| Core rule | Future AI consumes **Context Packets**, not prompts alone |
| RFIM | Character bible stores archetype + refs + descriptors; no embeddings yet |
| Smallest slice | Character migrations + graph assembly + `CharacterContextPacket` |
| Next after slice | Character Bible UI → World Bible → Story Bible → Combined assembler |

---

*Document status: Approved architecture — implement incrementally per slices. No generation or chat.*
