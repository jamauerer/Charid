# Generate Cover Workflow V1

**Status:** Approved design — **planning only, no full implementation**  
**Date:** 2026-06-14 (v1.1)  
**Goal:** Creators should never feel blocked because a cover or reference image is missing.  
**Authority:** [COLLABORATIVE_CREATION_PRINCIPLE.md](./COLLABORATIVE_CREATION_PRINCIPLE.md) · [PRESERVE_INTENT_PRINCIPLE.md](./PRESERVE_INTENT_PRINCIPLE.md) · [REFERENCE_IMAGE_STRATEGY.md](./REFERENCE_IMAGE_STRATEGY.md) · [AI_PROVIDER_ARCHITECTURE.md](./AI_PROVIDER_ARCHITECTURE.md)

---

## Summary

When a **primary visual** is missing on any core entity, CharID presents the same four choices:

```
Upload  ·  Use Existing  ·  Generate  ·  Skip for now
```

| Action | Purpose |
|--------|---------|
| **Upload** | New file from device → storage → assign primary slot |
| **Use Existing** | Pick from **approved artwork already in CharID** — no re-upload, no regenerate |
| **Generate** | Opens Generate Cover flow (prompt / context / hybrid) |
| **Skip for now** | Dismisses prompt; entity saves without image |

**Use Existing** reinforces creator ownership: portraits, sketches, gallery items, and moodboard assets the creator already approved stay first-class sources for primary slots.

**Generate** supports three modes:

| Mode | Creator experience |
|------|-------------------|
| **Prompt-based** | Creator writes the image description |
| **Project-context** | CharID assembles prompt from existing canon |
| **Hybrid** | Suggested prompt from canon — **editable** before generate |

Before any generation runs, CharID **shows which references** will be used — grouped into **Creator References** and **CharID Context**. After generation: **preview → Accept · Edit · Regenerate · Reject** — nothing enters canon silently.

Applies to: **Projects · Stories · Worlds · Characters · Locations · Scenes**.

---

## Problem

| Today | Friction |
|-------|----------|
| World cover hero | Upload only ([`WorldCoverHero.tsx`](../src/components/world-bible/WorldCoverHero.tsx)) |
| Project / character / story | Upload on create or gallery; empty states say “No cover” |
| Locations | `cover_image_id` in schema; limited UI |
| Scenes | Workspace placeholder; no primary visual slot yet |
| Generation | Outcomes defined in provider architecture; **no unified empty-state Generate Cover** |
| Re-use | Creators must re-upload or regenerate art **already in CharID** |

Creators hit **visual dead ends** — especially children and prompt-shy hobbyists — before they can show their work on cards, portfolios, or story pages.

---

## Product principle

> **CharID proactively helps create missing visual assets while preserving creator intent and reusing approved work.**

| Rule | Source |
|------|--------|
| Never block creation on missing image | Skip for now always available |
| Reuse before regenerate | Use Existing for approved in-app artwork |
| Show references before generate | Transparency builds trust |
| Group refs: creator vs context | Preserve Intent + creator ownership |
| Hybrid default for context mode | Creator edits suggested prompt |
| Approve before canon | [COLLABORATIVE_CREATION_PRINCIPLE.md](./COLLABORATIVE_CREATION_PRINCIPLE.md) |
| Enhance sketches, don’t replace | [PRESERVE_INTENT_PRINCIPLE.md](./PRESERVE_INTENT_PRINCIPLE.md) |
| Approved image → reference slot | [REFERENCE_IMAGE_STRATEGY.md](./REFERENCE_IMAGE_STRATEGY.md) |

---

## Universal empty-state pattern

### When to show

Any **primary image slot** is empty:

| Entity | Primary visual | Storage (today) |
|--------|----------------|-----------------|
| **Project** | Cover | `projects.cover_image_path` |
| **Story** | Cover / featured | `stories.featured_image_id` + `cover` slot |
| **World** | Cover hero | `worlds.cover_image_path` |
| **Character** | Portrait | `characters.photo_path` |
| **Location** | Place image | `world_locations.cover_image_id` |
| **Scene** | Scene key visual (future) | `scene_images` or story/world ref link |

Also show on **create forms** as optional step — never required to save entity.

Every surface above uses the **same four-action row** — no entity-specific shortcuts that omit Use Existing.

### UI block (shared component: `MissingPrimaryImageActions`)

```
┌──────────────────────────────────────────────────────────────────────┐
│  [ empty art placeholder — entity-specific copy ]                     │
│                                                                       │
│  [ Upload ]  [ Use Existing ]  [ Generate ]  Skip for now           │
└──────────────────────────────────────────────────────────────────────┘
```

| Action | Behavior |
|--------|----------|
| **Upload** | Existing file picker → storage → assign primary slot |
| **Use Existing** | Opens **approved-image picker** scoped to entity + linked canon (see below) |
| **Generate** | Opens Generate Cover flow (below) |
| **Skip for now** | Dismisses prompt; entity saves without image; card shows placeholder until filled |

**Skip** must not nag on every visit — show gentle reminder on entity page only, not modal loops.

When a primary image **already exists**, surfaces may show **Replace** (upload) and **Use Existing** without forcing the full empty-state block.

---

## Use Existing flow

Creators often already have approved artwork inside CharID. **Use Existing** assigns one of those assets to the primary slot without a new upload or generation job.

### Picker scope (by entity)

| Entity | Picker includes |
|--------|-----------------|
| **Project** | Project gallery · covers from linked stories/worlds/characters |
| **Story** | Story gallery + slot assignments · roster portraits · world moodboard |
| **World** | World gallery + moodboard + map · location covers |
| **Character** | Character gallery + slot assignments (`canonical`, turnaround, …) |
| **Location** | Location gallery · world environment refs · moodboard |
| **Scene** | Scene refs (future) · cast canonical portraits · linked location image · story gallery |

### Picker rules

- Show **thumbnail + label + source** (e.g. “Jake — Main portrait · Character gallery”)
- Only **approved** assets ([REFERENCE_IMAGE_STRATEGY.md](./REFERENCE_IMAGE_STRATEGY.md)) — no moderation-pending or discarded generations
- Creator selects one image → **preview assign** → Confirm · Cancel
- Assigning copies or links per existing storage pattern (`photo_path`, `cover_image_id`, slot assignment)
- **No silent assign** — confirm step required

---

## Generate Cover flow

### Step 1 — Choose mode

```
How would you like to generate?

○ Describe it yourself          (prompt-based)
○ Use my project context        (project-context)
● Suggested from your work      (hybrid — default when canon exists)
```

Default selection:

- **Hybrid** when ≥1 context field exists  
- **Prompt-based** when entity is net-new with no linked canon  

### Step 2 — References panel (always visible)

Grouped to reinforce **Preserve Intent** and **creator ownership**:

```
References CharID will use
──────────────────────────

Creator References
  ✓ Main portrait — Jake (canonical slot)
  ✓ Uploaded sketch — dragon pose reference
  ✓ Approved story moodboard image
  ○ Turnaround — none

CharID Context
  ✓ Story summary: How I Surf
  ✓ Character description: Jake — friendly surfer kid
  ✓ Relationship: Jake ↔ older mentor surfer
  ✓ Location: Pleasure Point
  ✓ World: California Coast — coastal town tone
  ○ Map — none

[ thumbnail previews for image refs ]
```

#### Creator References

Assets the creator **uploaded or explicitly approved** into CharID:

| Type | Examples |
|------|----------|
| Uploaded sketches | Gallery items, rough comps |
| Uploaded photos | Reference photos, real-world inspo |
| Approved images | Slot-assigned portraits, turnarounds, moodboard items, accepted generations |

These are **img2img anchors** when present ([PRESERVE_INTENT_PRINCIPLE.md](./PRESERVE_INTENT_PRINCIPLE.md)).

#### CharID Context

Structured canon CharID assembles from descriptions and relationships — not re-uploaded files:

| Type | Examples |
|------|----------|
| Descriptions | Character personality, world blurb, location type |
| Relationships | Bond labels between cast members |
| Story summaries | Story bible, scene “what happens”, chapter excerpts |
| Locations | Linked place names + descriptions |
| World data | World tone, themes, map metadata (text) |

#### Panel rules

- List **every** reference included in the job, in the correct group  
- Mark missing optional refs with neutral copy — not errors  
- Creator can **toggle off** a reference before generate (both groups)  
- Image refs show thumbnail + slot or source label  
- Copy principle: *“Your approved references first. CharID adds context from your canon.”*

### Step 3 — Prompt

| Mode | Prompt field |
|------|--------------|
| **Prompt-based** | Empty textarea — creator writes all |
| **Project-context** | Read-only assembled prompt + “Edit prompt” expand |
| **Hybrid** | Pre-filled suggested prompt — **editable** |

Example hybrid prompt (Project cover):

```
Cover illustration for "Children's Dragon Comic": a friendly dragon 
and child adventurer in a bright mountain village, graphic novel 
style, warm colors, inviting composition for a children's comic.
```

### Step 4 — Generate → Preview

- Credit cost shown before confirm ([AI_PROVIDER_ARCHITECTURE.md](./AI_PROVIDER_ARCHITECTURE.md))  
- Job runs via orchestrator — creator sees progress  
- **No auto-assign** to entity on completion  

### Step 5 — Review result

```
[ Generated image preview ]

[ Accept as cover ]  [ Regenerate ]  [ Edit prompt & try again ]  [ Discard ]
```

| Action | Result |
|--------|--------|
| **Accept** | Upload to storage → assign primary slot → enter reference graph if applicable |
| **Regenerate** | New job; same prompt unless edited |
| **Edit prompt** | Return to step 3 |
| **Discard** | No storage write |

If creator uploaded a sketch first, generation runs in **Preserve Intent** mode ([PRESERVE_INTENT_PRINCIPLE.md](./PRESERVE_INTENT_PRINCIPLE.md)).

---

## Future enhancement (not V1)

**Generation source selection** — let creators choose how much canon scopes a Generate job:

| Source | Scope |
|--------|--------|
| **Entire Project** | All linked stories, worlds, characters |
| **Story** | Single story + its cast, locations, scenes |
| **Chapter** | Chapter content + story context |
| **Scene** | Scene beat + cast + location only |

V1 uses **entity-default scope** from context assembly (below). Source picker ships when orchestrator supports scoped context packets without ambiguity.

---

## Context assembly by entity

Server action: `assembleGenerateCoverContext(entityType, entityId)` → `{ creatorRefs[], contextRefs[], suggestedPrompt, imageRefs[] }`.

Returns references **pre-grouped** for the References panel.

### Project

| Input | Group |
|-------|-------|
| Title, work intent, description | CharID Context |
| Existing project gallery images | Creator References |
| Story titles + summaries (top N) | CharID Context |
| World / character names + descriptions | CharID Context |
| Character portraits (approved slots) | Creator References |

**Output use:** Project card / overview hero cover.

### Story

| Input | Group |
|-------|-------|
| Title, summary, format | CharID Context |
| Project title | CharID Context |
| Roster names + descriptions | CharID Context |
| Roster portraits (approved) | Creator References |
| World setting text | CharID Context |
| Story bible themes / tone | CharID Context |
| Gallery / cover slot images | Creator References |

**Output use:** Story card featured image / `cover` slot.

### World

| Input | Group |
|-------|-------|
| Name, description | CharID Context |
| Location names + descriptions | CharID Context |
| Gallery + moodboard + map images | Creator References |
| Slot assignments (`canonical_reference`, `environment`, …) | Creator References |

**Output use:** World cover hero ([`WorldCoverHero`](../src/components/world-bible/WorldCoverHero.tsx)).

### Character

| Input | Group |
|-------|-------|
| Name, species, personality, backstory snippet | CharID Context |
| Uploaded sketches / gallery / `canonical` slot | Creator References |
| World name + tone (optional) | CharID Context |

**Output use:** `characters.photo_path` / canonical portrait.

If sketches exist → **Hybrid + Preserve Intent** default (enhance, don’t redesign).

### Location

| Input | Group |
|-------|-------|
| Name, type, description | CharID Context |
| Parent world description | CharID Context |
| World moodboard slice | Creator References |
| Location gallery / cover | Creator References |

**Output use:** `world_locations.cover_image_id`.

### Scene

| Input | Group |
|-------|-------|
| Title, summary | CharID Context |
| Cast names + descriptions | CharID Context |
| Cast canonical portraits | Creator References |
| Location label or linked place + image | Context + Creator (if image) |
| Story bible themes | CharID Context |
| World moodboard style refs | Creator References |

**Output use:** Scene key visual / `scene_reference` story slot (future).

---

## Suggested prompt construction

Internal template (not shown raw to creator in context-only mode):

```
{assetKind} for "{entityTitle}":
{assembledTextContext}.
Visual style: {projectType or worldMood or "consistent with existing references"}.
Composition: suitable for {cover | portrait | establishing shot | scene key visual}.
```

`assembledTextContext` = deterministic join of **CharID Context** lines — same inputs as References panel. **Creator References** influence img2img and style anchoring, not necessarily verbatim prompt text.

**Hybrid mode** may optionally use LLM to polish template output into natural language — still shown editable before generate.

---

## Provider outcome mapping

Add to creator-facing outcomes ([AI_PROVIDER_ARCHITECTURE.md](./AI_PROVIDER_ARCHITECTURE.md)):

| Outcome | Entity | Provider category |
|---------|--------|-------------------|
| **Generate Cover** | Project, Story, World | Image Generation |
| **Generate Portrait** | Character | Image Generation (+ img2img if sketch) |
| **Generate Location Image** | Location | Image Generation |
| **Generate Scene Visual** | Scene | Image Generation |

Single UX label in empty states: **Generate** — routed by entity type internally.

---

## Where surfaces appear (rollout)

**Rollout order unchanged** — Scene S2 ships before Generate Cover implementation.

| Surface | Priority | Notes |
|---------|----------|-------|
| World cover hero | **P1** | Four-action empty state (Upload live first) |
| Character portrait empty | **P1** | Character workspace + create form |
| Story featured / cover | **P1** | Story page + StoryCard empty |
| Project overview cover | **P2** | Project card + overview |
| Location card empty | **P2** | World locations grid |
| Scene workspace | **P3** | After Scene S1 — primary visual slot |
| Create modal optional step | **P3** | Post-save “Add a cover?” — not blocking |

Shared components: `MissingPrimaryImageActions` · `ImagePickerModal` (Use Existing + gallery assignment) · `GenerateCoverDialog` · `GenerateCoverReferencesPanel`.

---

## Implementation phases

| Phase | Deliverable |
|-------|-------------|
| **G0** | This document + context assembler spec + shared component contracts |
| **G1** | Shared empty-state UI (**Upload · Use Existing · Generate · Skip**) on World + Character |
| **G2** | `assembleGenerateCoverContext` + **Use Existing** picker for World, Character, Story |
| **G3** | Generate dialog: grouped references panel + hybrid prompt + preview approve |
| **G4** | Project + Location surfaces |
| **G5** | Scene visual generation (post Scene S1) |
| **G6** | img2img / Preserve Intent path when creator sketch uploaded first |
| **G7** | Generation source selection (Project / Story / Chapter / Scene) — **future** |

**Dependencies:** AI orchestrator + credit reserve ([AI_PROVIDER_ARCHITECTURE.md](./AI_PROVIDER_ARCHITECTURE.md)). UI shell can ship earlier with Use Existing / Generate disabled until backend live.

---

## Anti-patterns

| Do not | Why |
|--------|-----|
| Auto-set generated image as cover | Violates approval model |
| Hide which refs were used | Breaks trust |
| Flatten creator uploads with system context | Hides ownership; weakens Preserve Intent |
| Force re-upload of in-app approved art | Friction; ignores existing gallery |
| Require image to save entity | Blocks child fast path |
| Different UX per entity | Fragmented product |
| Text-only gen ignoring uploaded sketch | Violates Preserve Intent |
| Force Generate when Upload or Use Existing preferred | Collaboration, not generator |

---

## Decision test

*Can a creator with approved artwork already in CharID assign it as a project cover in under thirty seconds — or, with no art skills, generate a cover in under two minutes — seeing exactly which creator refs and canon context were used — and reject the result without side effects?*

If not, the workflow violates this spec.

---

## Related documents

| Doc | Role |
|-----|------|
| [COLLABORATIVE_CREATION_PRINCIPLE.md](./COLLABORATIVE_CREATION_PRINCIPLE.md) | Approve before commit |
| [PRESERVE_INTENT_PRINCIPLE.md](./PRESERVE_INTENT_PRINCIPLE.md) | Sketch → enhanced portrait |
| [REFERENCE_IMAGE_STRATEGY.md](./REFERENCE_IMAGE_STRATEGY.md) | Accept → reference slot |
| [AI_PROVIDER_ARCHITECTURE.md](./AI_PROVIDER_ARCHITECTURE.md) | Orchestrator + outcomes |
| [SCENE_IMPLEMENTATION_DIRECTIVES.md](./SCENE_IMPLEMENTATION_DIRECTIVES.md) | Scene visual in G5 |
| [SCENE_S1_IMPLEMENTATION_REPORT.md](./SCENE_S1_IMPLEMENTATION_REPORT.md) | Rollout: S2 → Generate Cover |
| [VISUAL_IDENTITY_PHASE_1.md](./VISUAL_IDENTITY_PHASE_1.md) | Empty-state visual tone |

---

## Version

| Version | Date | Notes |
|---------|------|-------|
| 1.0 | 2026-06-14 | Initial Generate Cover workflow — six entities, three modes, references panel |
| 1.1 | 2026-06-14 | **Use Existing** action; References panel grouped (Creator References · CharID Context); future generation source selection |
