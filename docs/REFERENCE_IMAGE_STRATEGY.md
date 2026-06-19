# Reference Image Strategy

**Status:** Approved strategy — guides continuity and future generation  
**Date:** 2026-06-14  
**Goal:** **CharID remembers.**  
**Related:** [PRESERVE_INTENT_PRINCIPLE.md](./PRESERVE_INTENT_PRINCIPLE.md) · [AI_CREATION_CONTROL_PRINCIPLE.md](./AI_CREATION_CONTROL_PRINCIPLE.md) · [GENERATE_COVER_WORKFLOW_V1.md](./GENERATE_COVER_WORKFLOW_V1.md) · [ARCHITECTURE_COMPATIBILITY_REPORT.md](./ARCHITECTURE_COMPATIBILITY_REPORT.md) · [PHASE_A_CONTINUATION_REPORT.md](./PHASE_A_CONTINUATION_REPORT.md)

---

## Core principle

> **Approved images become continuity references.**

When a creator uploads, assigns, or accepts an image into a reference slot, that image is **canon** — not a one-off attachment for a single action.

| Rule | Meaning |
|------|---------|
| **Approve once** | Slot assignment = “this is how it looks” |
| **Reuse automatically** | Generation and exports pull from the reference graph — no re-upload per request |
| **Preserve intent** | New outputs must align with approved refs, not replace them silently ([PRESERVE_INTENT_PRINCIPLE.md](./PRESERVE_INTENT_PRINCIPLE.md)) |
| **Creator stays in control** | AI proposes; creator approves before an image enters the reference set ([AI_CREATION_CONTROL_PRINCIPLE.md](./AI_CREATION_CONTROL_PRINCIPLE.md)) |

Internal machinery (already in the codebase direction): **Reference Graph** → **Context Packet** → generation provider. Creators see galleries and slots; the system sees typed references.

---

## Why this exists

Creators should **not** manually re-upload reference images for every generation.

CharID **automatically selects** approved references and **assembles generation context** from:

- Character slot assignments (`canonical`, turnarounds, expressions, …)
- World slot assignments and moodboard items (`canonical_map`, `mood_board`, locations, …)
- Story roster and (future) scene context
- Bible text (identity, personality, rules, tone)

The product promise: build your bible once; CharID carries it forward.

---

## Character generation hierarchy

Priority order when assembling character-facing generation context:

### 1. Full body reference

**Use when:** full figure, action, outfit consistency, turnaround consistency, comic panels showing body.

| Reference type | Slot / source (today → target) |
|----------------|--------------------------------|
| Turnarounds | `turnaround_front`, `turnaround_left`, `turnaround_right`, `turnaround_back` |
| Poses | Gallery + future pose slots / scene refs |
| Outfits | Future `outfit_*` asset roles; wardrobe variants linked to character |

**Primary anchor:** turnaround set when present; else `canonical` portrait as fallback for body tasks (with explicit quality limits).

### 2. Face reference

**Use when:** dialogue shots, emotional beats, closeups, expression-driven panels.

| Reference type | Slot / source |
|----------------|---------------|
| Canonical portrait | `canonical` |
| Expressions | `expression_neutral`, `expression_happy`, `expression_angry`, `expression_sad`, `expression_surprised` |
| Emotions / closeups | Expression slots + gallery overflow tagged as face refs |

**Selection rule:** Match requested emotion to nearest expression slot; fall back to `canonical`, then neutral.

### 3. Style reference

**Use when:** linework, rendering, comic vs painterly look — **without** changing who the character is.

| Reference type | Slot / source |
|----------------|---------------|
| Comic style | Future project/story `style_reference` or world moodboard slice |
| Rendering style | World moodboard + character gallery images tagged `reference` |
| Linework | Dedicated style ref images (future); moodboard as interim |

**Rule:** Style refs **modulate rendering**, not identity. Identity comes from full body + face hierarchy first.

### Character selection algorithm (conceptual)

```
1. Determine task type: full_body | face | style_overlay
2. Full body → turnarounds (all available) → canonical
3. Face → expression[requested] → expression_neutral → canonical
4. Style → story/world style refs → moodboard samples (weighted low)
5. Attach bible text: species, permanent features, personality, archetype
6. Never include unapproved / pending moderation images
```

---

## World generation hierarchy

Priority order for place, environment, and tone:

### 1. Canonical map

**Use when:** geography, travel, “where on the map,” wide establishing shots tied to place.

| Source | Today |
|--------|--------|
| `canonical_map` slot | World gallery + World Map section |
| `world_maps` + pins | Linked to `world_locations` when pinned |

### 2. Moodboard

**Use when:** color, atmosphere, lighting, genre feel — not a specific named place.

| Source | Today |
|--------|--------|
| `world_moodboards` items | Upload + gallery pull |
| `mood_board` slot | Single anchor mood image (gallery) |

**Rule:** Prefer moodboard **collection** for style variance; use slot for one strong default.

### 3. Location references

**Use when:** named places — forest, village, castle — and scene setting.

| Source | Today |
|--------|--------|
| `world_locations` | Named places (description; cover image future) |
| `location`, `environment`, `architecture` slots | World gallery |
| Map pins | Pin label + optional `location_id` |

**Selection rule:** Scene names a location → location record + cover/slot image → environment → architecture → map crop (future).

---

## Story / comic generation hierarchy

When generating story art (scene stills, panels, chapter illustrations):

| Priority | Source | Role |
|----------|--------|------|
| **1** | Character references | Cast in scene — face/body hierarchy per character |
| **2** | World references | Map + location + environment for setting |
| **3** | Style references | Project/world moodboard + output format (`project_type`: novel, graphic_novel, …) |
| **4** | Current scene context | Chapter, scene beat, cast list, relationships (future Scenes layer) |

**Assembly entry point (today):** `assembleCombinedContextPacket(worldId, storyId, characterIds)` — world + story + character packets.

**Future extension:** Scene slice adds beat text, primary location, panel layout hints, relationship pairs present in shot.

### Comic-specific note

For `graphic_novel` / `childrens_book` project types:

- Prefer **face + expression** refs for dialogue panels
- Prefer **turnaround + location** for action/wide panels
- Pull **style** from world moodboard + story-level override when set

---

## Approved vs pending

Only **approved** images enter generation context.

| State | Enters reference graph? | Used in generation? |
|-------|-------------------------|---------------------|
| Assigned to slot (creator action) | Yes | Yes |
| Gallery only, unassigned | Optional weak ref | Only if no slot fills task |
| Moderation pending / removed | No | No |
| Generated, not yet accepted | No | No — creator must approve into slot |

Moderation and safety layers ([SAFETY_MODERATION_V1.md](./SAFETY_MODERATION_V1.md)) gate the graph before any provider call.

---

## Creator experience (target)

| Today | Target |
|-------|--------|
| Upload / assign per slot in workspace | Same — this **is** approving references |
| Generate button disabled on slots (Phase A) | Generate → grouped references panel → preview → **Approve to slot** |
| Manual re-upload if user generates elsewhere | **Eliminated** — CharID reads slots; **Use Existing** for primary slots ([GENERATE_COVER_WORKFLOW_V1.md](./GENERATE_COVER_WORKFLOW_V1.md)) |
| Context packet assembly (server) | Automatic ref selection by hierarchy above |
| Creator picks refs per generation | Optional **override**, not required default |

**Copy principle:** “CharID uses your approved references.” Not “upload reference images again.”

---

## Mapping to current schema

| Hierarchy layer | Tables / slots |
|-----------------|----------------|
| Character full body | `character_image_slot_assignments` → turnaround roles |
| Character face | `canonical`, expression roles |
| Character style | `character_images` gallery + future style role |
| World map | `world_maps`, `canonical_map`, `map_location_pins` |
| World mood | `world_moodboards`, `world_moodboard_items`, `mood_board` |
| World location | `world_locations`, `location` / `environment` / `architecture` slots |
| Story context | `story_bible`, `story_characters`, chapters → future scenes |

Relationships ([PHASE_A_CONTINUATION_REPORT.md](./PHASE_A_CONTINUATION_REPORT.md)) enrich text context for two-character shots; they do not replace image refs.

---

## Non-goals (this strategy)

- Replacing bibles or the reference graph with flat file folders
- Requiring professionals to manage provider-specific ref IDs
- Using unapproved or cross-user images as refs
- Letting style refs override identity without explicit creator opt-in

---

## Success criteria

CharID remembers when:

1. A creator assigns a turnaround once — later panel generation uses it without re-upload
2. World moodboard sets tone — comic pages inherit palette/atmosphere automatically
3. A location is named in a scene — the right place ref is selected from the world graph
4. New team members (future) open a story and see the same approved refs, not ad-hoc uploads

**One line:** Upload and approve in the workspace; CharID assembles the rest.

---

## Related documents

| Doc | Role |
|-----|------|
| [PRESERVE_INTENT_PRINCIPLE.md](./PRESERVE_INTENT_PRINCIPLE.md) | Why approved refs must not drift |
| [AI_CREATION_CONTROL_PRINCIPLE.md](./AI_CREATION_CONTROL_PRINCIPLE.md) | Creator approves before canon |
| [AI_PROVIDER_ARCHITECTURE.md](./AI_PROVIDER_ARCHITECTURE.md) | Provider layer consumes context packets |
| [CHARACTER_WORKSPACE_V2.md](./CHARACTER_WORKSPACE_V2.md) | Gallery-first = reference-first |
| [WORLD_WORKSPACE_V2.md](./WORLD_WORKSPACE_V2.md) | Map, mood, location surfaces |
| [IMPLEMENTATION_PHASES_V3.md](./IMPLEMENTATION_PHASES_V3.md) | Generation phases (future) |
