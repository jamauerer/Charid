# Creative Format V2

**Status:** Approved UX correction — **planning only, no implementation**  
**Date:** 2026-06-14  
**Version:** 2.0  
**Authority:** [CHARID_VISION_V3.md](./CHARID_VISION_V3.md) · [FINISHED_CREATIVE_WORK_PRINCIPLE.md](./FINISHED_CREATIVE_WORK_PRINCIPLE.md)  
**Related:** [CHARACTER_CLASSIFICATION_V2.md](./CHARACTER_CLASSIFICATION_V2.md) · [PROJECT_CENTERED_INFORMATION_ARCHITECTURE.md](./PROJECT_CENTERED_INFORMATION_ARCHITECTURE.md) · [PROJECT_TYPES_VISION.md](../PROJECT_TYPES_VISION.md)

---

## Purpose

Replace ambiguous **Creative Format** with fields that answer the question creators actually ask:

> **What am I making?**

—not—

> What rendering style am I choosing?

**Continuity architecture is unchanged.** Story Bible, Character Bible, and context assembly remain. This document separates **output intent** (what finished work looks like) from **visual medium** (how it is drawn).

---

## Founder testing findings

| Finding | Detail |
|---------|--------|
| **“Creative Format” is ambiguous** | Character Identity section asks for “Creative format” as free text (`Anime, Watercolor, 3D`) — creators unsure if this means output type or art style |
| **Mixed concerns on one field** | Output medium (comic vs novel), art style (anime vs realistic), and rendering technique (3D vs sketch) collapsed into one input |
| **Duplication with story settings** | `stories.project_type` already encodes novel / graphic_novel / childrens_book / film_animation — character-level format conflicts |
| **Wrong placement** | Format of a **finished work** belongs on Story or Project — not on every Character |
| **Child confusion** | A 10-year-old making a comic should choose “Comic” once — not re-specify format per character |

**Verdict:** Deprecate character-level Creative Format. Introduce **Primary Output** at work level and **Visual Medium** as optional look-and-feel.

---

## Current state (V1)

### Character level (`character_bible.creative_format`)

| Aspect | Detail |
|--------|--------|
| UI | Free-text input on Identity section |
| Placeholder | “e.g. Anime, Watercolor, 3D” |
| Storage | Nullable `text` column |
| Consumers | Reference graph descriptors, metrics header, context packet |

### Story level (`stories.project_type`)

Check constraint (schema):

```
novel | graphic_novel | film_animation | childrens_book | other
```

Used for finish-path comic detection (`childrens_book`, `graphic_novel`), public badges, and future content-unit routing (chapters vs pages).

### Problem

Two overlapping systems — character free text + story enum — neither asks clearly **“What am I making?”**

---

## V2 model

### Primary Output

**What finished work are you creating?** — set at **Story** or **Project** level (not Character).

| Option | Creator label | Typical content units |
|--------|---------------|----------------------|
| `comic` | Comic | Pages, panels |
| `novel` | Novel | Chapters, prose |
| `film` | Film | Scenes, shots |
| `animation` | Animation | Scenes, frames |
| `illustrated_book` | Illustrated Book | Spreads, chapters + art |
| `game` | Game | Scenes, assets (future) |
| `mixed_media` | Mixed Media | Flexible |

**Dropdown** — single select. Required when starting a story (or project).

Maps to existing `stories.project_type` with expanded, clearer labels:

| V2 Primary Output | → Current `project_type` (interim) |
|-------------------|----------------------------------|
| Comic | `graphic_novel` or `childrens_book` (subtype later) |
| Novel | `novel` |
| Film | `film_animation` |
| Animation | `film_animation` (split in schema later) |
| Illustrated Book | `childrens_book` or new value |
| Game | `other` until game schema exists |
| Mixed Media | `other` |

---

### Visual Medium (optional)

**How should this work look?** — art / rendering style for the **work**, not the biology of a character.

| Option | Creator label |
|--------|---------------|
| `realistic` | Realistic |
| `comic_book` | Comic Book |
| `anime` | Anime |
| `cartoon` | Cartoon |
| `watercolor` | Watercolor |
| `oil_painting` | Oil Painting |
| `sketch` | Sketch |
| `3d` | 3D |

**Dropdown** — optional. Single select. Can live on:

- **Story** — default look for all characters in this work (recommended V2.0)
- **Project** — franchise-wide default (when Project entity ships)
- **Character** — override only when one character renders differently (advanced)

**Alignment with [CHARACTER_CLASSIFICATION_V2.md](./CHARACTER_CLASSIFICATION_V2.md):** Character **Visual Style** describes how *that character* is drawn; Story **Visual Medium** describes the *work’s* default aesthetic. Usually they match; overrides are allowed for ensemble casts.

---

## Creator mental model

```
Primary Output     →  "I'm making a COMIC"
Visual Medium      →  "It looks like COMIC BOOK art" (optional)
Character Type     →  "This character is a DRAGON"        (Character Classification V2)
Character Style    →  "Drawn in COMIC BOOK style"         (usually inherits from work)
```

A child path:

1. Create → Make a comic
2. Primary Output = **Comic** (pre-set)
3. Visual Medium = **Cartoon** (optional template default)
4. Add characters — Visual Style defaults from story medium

---

## Examples

| Creator intent | Primary Output | Visual Medium | Notes |
|----------------|----------------|---------------|-------|
| Afternoon 6-page comic | Comic | Cartoon | Child benchmark |
| Graphic novel series | Comic | Comic Book | Pro path |
| YA novel | Novel | — | No visual medium required |
| His Dark Materials (multi-format IP) | Mixed Media | Realistic | Project-level; stories may vary |
| Animated short | Animation | 3D | Scenes drive structure |
| Picture book | Illustrated Book | Watercolor | Maps near `childrens_book` |
| Film treatment | Film | — | Storyboard later via Scenes |

---

## Deprecations

| V1 field | V2 disposition |
|----------|----------------|
| `character_bible.creative_format` | **Deprecate** — migrate to Character Visual Style + Story Visual Medium |
| Identity “Creative format” input | **Remove** from character Identity section |
| `stories.project_type` | **Evolve** — rename creator label to Primary Output; expand enum |

**Do not delete columns** until backfill and compile layer prove stable.

---

## Migration recommendations

### Phase 1 — Story-level fields (additive)

```sql
alter table public.stories
  add column if not exists primary_output text
    check (primary_output in (
      'comic','novel','film','animation',
      'illustrated_book','game','mixed_media'
    )),
  add column if not exists visual_medium text
    check (visual_medium in (
      'realistic','comic_book','anime','cartoon',
      'watercolor','oil_painting','sketch','3d'
    ));
```

Backfill `primary_output` from `project_type`:

| `project_type` | → `primary_output` |
|----------------|-------------------|
| `novel` | `novel` |
| `graphic_novel` | `comic` |
| `childrens_book` | `illustrated_book` |
| `film_animation` | `film` |
| `other` | `mixed_media` |

### Phase 2 — Character creative_format backfill

| `creative_format` (text, heuristic) | → Character `visual_style` | → Story `visual_medium` |
|-------------------------------------|------------------------------|-------------------------|
| anime, Anime | anime | anime |
| comic, Comic | comic_book | comic_book |
| cartoon, Cartoon | cartoon | cartoon |
| watercolor, Watercolor | painterly | watercolor |
| 3D, 3d | 3d | 3d |
| *(empty)* | stylized | null |

Copy story medium from first character only when story medium is null.

### Phase 3 — UI

- Remove Creative Format from `IdentitySectionForm`
- Add Primary Output + Visual Medium to story create/edit (`EditStoryForm`, `StoryForm`, future `ComicCreateFlow`)
- Show Primary Output on story workspace header (creator label, not `project_type` slug)
- Update `resolveStoryFinishPath` comic detection to read `primary_output = 'comic'` when available

### Phase 4 — Consolidate enums (optional)

- Merge `project_type` into `primary_output` or make `project_type` a generated column
- Single source of truth for content-unit routing (chapters vs pages)

**No migration required until implementation is approved and scheduled.**

---

## Implementation recommendations

| Priority | Work | Suggested phase |
|----------|------|-----------------|
| **P1** | Story create/edit: Primary Output dropdown | Phase A4 (Create → Comic) or A2 |
| **P1** | Optional Visual Medium on story | Phase A5 (Look & feel strip) |
| **P2** | Remove character Creative Format input | With [CHARACTER_CLASSIFICATION_V2.md](./CHARACTER_CLASSIFICATION_V2.md) |
| **P2** | Update finish-path + badges to use `primary_output` | Phase A |
| **P3** | Project-level defaults | Phase E |
| **Defer** | Game / Mixed Media content units | Phase E+ |

### Files likely touched (implementation)

| File | Change |
|------|--------|
| `src/types/story.ts` | Add `PrimaryOutput`, `VisualMedium` types |
| `src/app/dashboard/EditStoryForm.tsx` | Primary Output + Visual Medium |
| `src/components/character-bible/IdentitySectionForm.tsx` | Remove creative_format |
| `src/lib/story-finish-path.ts` | Comic detection via `primary_output` |
| `src/lib/assemble-reference-graph.ts` | Read story medium, not character format |

### Relationship to canonical workflow

From [FINISHED_CREATIVE_WORK_PRINCIPLE.md](./FINISHED_CREATIVE_WORK_PRINCIPLE.md):

```
Idea → Story → Characters → Images → Comic → Publish
```

**Primary Output** names the destination (Comic, Novel, …). **Visual Medium** names the look. Neither replaces Story as the hub — they clarify what “Finish” means for that story.

---

## Rationale summary

| Problem (V1) | Solution (V2) |
|--------------|---------------|
| One ambiguous free-text field | Two purposeful dropdowns |
| Format on character | Output on story / project |
| Style mixed with medium | Visual Medium separate from Primary Output |
| Child asks “what am I making?” | Primary Output = Comic / Novel / … |

**Creators choose the finished work. The continuity layer keeps canonical either way.**

---

## Version

| Version | Date | Notes |
|---------|------|-------|
| 2.0 | 2026-06-14 | Founder UX correction — Primary Output + Visual Medium |
