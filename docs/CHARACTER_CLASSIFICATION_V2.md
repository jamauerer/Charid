# Character Classification V2

**Status:** Approved UX correction — **planning only, no implementation**  
**Date:** 2026-06-14  
**Version:** 2.0  
**Authority:** [CHARID_VISION_V3.md](./CHARID_VISION_V3.md) · [FINISHED_CREATIVE_WORK_PRINCIPLE.md](./FINISHED_CREATIVE_WORK_PRINCIPLE.md)  
**Related:** [CHARACTER_IDENTITY_LAYER.md](../CHARACTER_IDENTITY_LAYER.md) · [ARCHITECTURE_COMPATIBILITY_REPORT.md](./ARCHITECTURE_COMPATIBILITY_REPORT.md) · [FOUNDER_TESTING_LESSONS_ROUND_1.md](./FOUNDER_TESTING_LESSONS_ROUND_1.md) · [CHARACTER_RELATIONSHIPS_V1.md](./CHARACTER_RELATIONSHIPS_V1.md)

---

## Purpose

Replace the creator-facing **Identity Archetype** control with a classification model a **10-year-old understands immediately** and a **professional creator never feels boxed by**.

**Continuity architecture is unchanged.** Character Bible, Reference Graph, Context Packet, and identity-layer routing remain. This document redesigns **what creators see and choose** — not what the engine stores underneath.

---

## Founder testing findings

| Finding | Evidence |
|---------|----------|
| **Identity Archetype mixes concepts** | Single dropdown combines body plan (`creature_quadruped`), art style (`humanoid_anime`), and narrative category (`humanoid_fantasy`) |
| **Technical language blocks children** | “Quadruped”, “Anthropomorphic”, “Creature (other)” require vocabulary most 10-year-olds do not have |
| **Species field duplicates archetype** | Free-text “Species / type” sits beside archetype with unclear division of responsibility |
| **Edge cases do not fit** | Daemons, wizards, dragons, ents, robots, aliens, and ordinary pets cannot be classified without forcing a wrong choice |
| **Professionals feel constrained** | Style locked to archetype bucket — a “Realistic human” cannot also be “Comic book style” without another archetype |

**Verdict:** The taxonomy works for **internal routing** (reference graph scoring, optional landmark analyzers). It fails as **creator-facing classification**.

---

## Current state (V1)

### UI (`IdentitySectionForm`)

| Field | Control | Example values |
|-------|---------|----------------|
| Species / type | Free text | Human, Dragon, Android |
| Identity archetype | Single dropdown (9 options) | Realistic human, Anime, Creature (quadruped) |
| Creative format | Free text | Anime, Watercolor, 3D |

### Database (`character_bible.identity_archetype`)

Check constraint enforces:

```
humanoid_realistic | humanoid_stylized | humanoid_anime | humanoid_comic |
humanoid_cartoon | humanoid_fantasy | anthropomorphic | creature_quadruped | creature_other
```

### Internal consumers (must keep working)

| System | Uses archetype for |
|--------|-------------------|
| `character-bible-scores.ts` | Reference graph completion weights |
| `assignable-image-roles.ts` | Which image slots apply |
| `assemble-reference-graph.ts` | Context packet / graph assembly |
| `CHARACTER_IDENTITY_LAYER.md` | Optional analyzer routing (landmarks, ArcFace) |

**Rule:** V2 creator fields **compile down** to V1 internal signals. Do not break scoring or graph assembly during migration.

---

## V2 creator model

Three **separate** sections replace Identity Archetype.

### 1. Character Type

**What kind of being is this?** — narrative / biological category, not art style.

| Option | Creator label | When to use |
|--------|---------------|-------------|
| `human` | Human | Real-world or fantasy humans |
| `animal` | Animal | Non-talking or naturally animal characters (dog, horse, owl) |
| `creature` | Creature | Dragons, monsters, ents, large fantasy beasts |
| `spirit` | Spirit | Ghosts, daemons, elemental beings, souls |
| `robot` | Robot | Androids, mechs, AI companions |
| `alien` | Alien | Extraterrestrial beings |
| `other` | Other | Anything else — free-text detail in Species field |

**Dropdown** — single select. Default: `human`.

Species / type (free text) **remains** for specificity: “Golden retriever”, “Red dragon”, “Panserbjørn daemon”.

---

### 2. Visual Style

**How does this character look in your art?** — rendering / medium, independent of character type.

| Option | Creator label |
|--------|---------------|
| `realistic` | Realistic |
| `comic_book` | Comic Book |
| `anime` | Anime |
| `cartoon` | Cartoon |
| `stylized` | Stylized |
| `painterly` | Painterly |
| `3d` | 3D |
| `other` | Other |

**Dropdown** — single select. Default: `stylized`.

Professionals can pair any Character Type with any Visual Style (e.g. Creature + Comic Book for Smaug; Human + Realistic for Gandalf; Spirit + Stylized for Pan).

---

### 3. Special Traits

**What makes this character unusual?** — optional narrative / ability tags.

| Option | Creator label |
|--------|---------------|
| `talking` | Talking |
| `magical` | Magical |
| `flying` | Flying |
| `shape_shifting` | Shape-shifting |
| `companion` | Companion |
| `immortal` | Immortal |
| `mechanical` | Mechanical |
| `supernatural` | Supernatural |
| `other` | Other |

**Multi-select** — zero or more. Never required.

Replaces implicit meaning buried in “anthropomorphic” (talking animal) and “fantasy humanoid” (magical human).

---

## Language to remove from creator UI

| Remove | Replace with |
|--------|--------------|
| Identity Archetype | Character Type + Visual Style + Special Traits |
| Quadruped | Animal or Creature + optional traits |
| Anthropomorphic | Animal + Talking (trait) — or Creature if fantasy beast |
| Humanoid Creature | Creature or Spirit |
| Creature (other) | Creature + Species text |
| Identity archetype (label) | *(hidden — internal only)* |

---

## Internal mapping (server-side)

V2 fields compile to existing `identity_archetype` for continuity layer compatibility until a full internal refactor (optional, Phase F+).

### Suggested compile function

```typescript
// lib/compile-identity-archetype.ts (planned)
function compileIdentityArchetype(input: {
  characterType: CharacterType;
  visualStyle: VisualStyle;
  specialTraits: SpecialTrait[];
}): IdentityArchetype
```

### Mapping matrix (default routes)

| Character Type | Visual Style | Traits | → Internal archetype |
|----------------|--------------|--------|----------------------|
| Human | Realistic | — | `humanoid_realistic` |
| Human | Anime | — | `humanoid_anime` |
| Human | Comic Book | — | `humanoid_comic` |
| Human | Cartoon | — | `humanoid_cartoon` |
| Human | Stylized / Painterly / 3D / Other | — | `humanoid_stylized` |
| Human | any | Magical / Supernatural / Immortal | `humanoid_fantasy` |
| Animal | any | Talking | `anthropomorphic` |
| Animal | any | (none) | `creature_quadruped` * |
| Creature | any | — | `creature_other` |
| Spirit | any | — | `humanoid_fantasy` or `creature_other` † |
| Robot | any | — | `humanoid_stylized` ‡ |
| Alien | any | — | `humanoid_fantasy` or `humanoid_stylized` |
| Other | any | — | `humanoid_stylized` (safe default) |

\* Non-quadruped animals (bird, snake) may route to `creature_other` when species text suggests non-mammal — optional heuristic, never shown to creator.

† Spirit/daemon: prefer `humanoid_fantasy` when human-adjacent form; `creature_other` for wholly non-human spirits.

‡ Robot: internal routing may gain `robot` archetype later; until then `humanoid_stylized` + `mechanical` trait.

**Product rule:** Creators never see internal archetype values. Admin and identity-layer docs may reference them.

---

## Character examples — V2 classification

| Character | Type | Visual Style | Special Traits | Species (text) | Internal route |
|-----------|------|--------------|----------------|----------------|----------------|
| **Real-world human** | Human | Realistic | — | Human | `humanoid_realistic` |
| **Real-world dog** | Animal | Realistic | Companion | Golden retriever | `creature_quadruped` |
| **Dragon (Smaug)** | Creature | Comic Book | Talking, Flying, Magical | Dragon | `creature_other` |
| **Pan (His Dark Materials daemon)** | Spirit | Stylized | Shape-shifting, Companion | Pine marten daemon | `humanoid_fantasy` |
| **Gandalf** | Human | Realistic | Magical, Immortal | Wizard | `humanoid_fantasy` |
| **Treebeard** | Creature | Painterly | Talking, Immortal | Ent | `creature_other` |
| **Gollum** | Human | Realistic | — | Hobbit-like | `humanoid_stylized` |
| **Robot companion** | Robot | 3D | Mechanical, Companion | Service droid | `humanoid_stylized` |
| **Alien explorer** | Alien | Stylized | — | Zephron | `humanoid_fantasy` |
| **Talking fox (Disney-style)** | Animal | Cartoon | Talking | Fox | `anthropomorphic` |

### UX verification checklist

- [ ] A 10-year-old can classify their pet dog without reading “quadruped”
- [ ] A 10-year-old can classify a dragon without choosing “Creature (other)”
- [ ] Pan (daemon) fits without forcing “Animal” or “Human”
- [ ] Gandalf fits without a separate “Wizard” type — Species + traits carry specificity
- [ ] Professional can set Human + Comic Book without switching to a different archetype bucket
- [ ] “Other” on each dimension prevents hard dead-ends

---

## Relationship to other fields

| Field | V2 role |
|-------|---------|
| **Species / type** (free text) | Specific name — “Dragon”, “Hobbit”, “Pine marten” |
| **Character Type** | Broad category for creators and internal routing |
| **Visual Style** | Art rendering — drives reference expectations, not biology |
| **Special Traits** | Narrative abilities — drives story and optional analyzer hints |
| **Creative format** (character) | **Deprecated** — see [CREATIVE_FORMAT_V2.md](./CREATIVE_FORMAT_V2.md); move output intent to Story / Project |
| **Permanent features / personality** | Unchanged — still in Identity section |

---

## Migration recommendations

**No migration required until implementation is scheduled.** Recommended phased approach:

### Phase 1 — Additive schema

```sql
-- character_bible (additive)
alter table public.character_bible
  add column if not exists character_type text
    check (character_type in ('human','animal','creature','spirit','robot','alien','other')),
  add column if not exists visual_style text
    check (visual_style in ('realistic','comic_book','anime','cartoon','stylized','painterly','3d','other')),
  add column if not exists special_traits text[] default '{}';

-- Keep identity_archetype — populated by compile function on save
```

### Phase 2 — Backfill from V1

| Old `identity_archetype` | → character_type | → visual_style | → special_traits |
|--------------------------|------------------|----------------|------------------|
| `humanoid_realistic` | human | realistic | [] |
| `humanoid_anime` | human | anime | [] |
| `humanoid_comic` | human | comic_book | [] |
| `humanoid_cartoon` | human | cartoon | [] |
| `humanoid_stylized` | human | stylized | [] |
| `humanoid_fantasy` | human | stylized | [magical] |
| `anthropomorphic` | animal | stylized | [talking] |
| `creature_quadruped` | animal | stylized | [] |
| `creature_other` | creature | stylized | [] |

Re-run compile on save so `identity_archetype` stays in sync for graph/scoring.

### Phase 3 — UI swap

- Replace Identity Archetype dropdown with three V2 controls in `IdentitySectionForm`
- Update `CharacterBibleMetricsHeader` to show Type + Style, not archetype label
- Hide internal archetype from all creator surfaces

### Phase 4 — Optional internal cleanup (deferred)

- Relax or replace `identity_archetype` check constraint when compile layer is proven
- Extend archetype enum for `robot` if identity layer needs distinct routing

**Do not drop `identity_archetype` until** reference graph, context packet, and identity-layer docs are updated to read V2 fields directly or via compile layer.

---

## Implementation recommendations

| Priority | Work | Phase suggestion |
|----------|------|------------------|
| **P1** | `types/character-classification-v2.ts` — enums + labels | With character UX pass |
| **P1** | `lib/compile-identity-archetype.ts` — V2 → V1 mapping | With character UX pass |
| **P1** | Update `IdentitySectionForm` — three sections | With character UX pass |
| **P2** | Migration + backfill script | Same release as UI |
| **P2** | Update `assemble-reference-graph.ts` to expose V2 in descriptors | Same release |
| **P3** | Unit tests for compile matrix + example characters | Same release |
| **Defer** | Identity Layer analyzer routing from V2 traits | Phase F (AI) |

**Not in Phase A–D scope** unless bundled as a small UX pass alongside character work. Fits naturally after **Phase A** creator workflow or as part of **Phase E** when Project-centered IA lands.

### Files likely touched (implementation)

| File | Change |
|------|--------|
| `src/types/identity-archetype.ts` | Keep for internal; add V2 types file |
| `src/components/character-bible/IdentitySectionForm.tsx` | Replace archetype dropdown |
| `src/app/actions/character-bible.ts` | Save V2 fields + compile archetype |
| `src/lib/character-bible-scores.ts` | No change if archetype still compiled |
| `src/components/character-bible/CharacterBibleMetricsHeader.tsx` | Display Type / Style |

---

## Rationale summary

| Audience | Need | V2 answer |
|----------|------|-----------|
| **Child (~10)** | Pick what my character **is** in plain words | Human, Animal, Dragon → Creature |
| **Hobbyist** | Separate **look** from **kind** | Visual Style independent of Type |
| **Professional** | Specific, combinable tags | Traits + Species text + Other escape hatches |
| **Continuity engine** | Stable internal routing | Compiled `identity_archetype` unchanged |

**Simple on the surface. Powerful underneath.**

---

## Version

| Version | Date | Notes |
|---------|------|-------|
| 2.0 | 2026-06-14 | Founder UX correction — replace Identity Archetype with Type / Style / Traits |
