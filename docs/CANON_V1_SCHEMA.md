# Canon V1 Schema

**Status:** Design only — **no implementation, no migrations, no code**  
**Date:** 2026-06-14  
**Goal:** Define Canon as the hidden consistency layer of CharID  
**Authority:** [PROJECT_FIRST_CREATIVE_STUDIO_V1.md](./PROJECT_FIRST_CREATIVE_STUDIO_V1.md) · [COLLABORATIVE_CREATION_PRINCIPLE.md](./COLLABORATIVE_CREATION_PRINCIPLE.md) · [REFERENCE_IMAGE_STRATEGY.md](./REFERENCE_IMAGE_STRATEGY.md) · [AI_PROVIDER_ARCHITECTURE.md](./AI_PROVIDER_ARCHITECTURE.md)

**Companion (future):** [Continuity V1 schema](./CONTINUITY_V1_SCHEMA.md) — visible alerts derived from Canon; requires [CANON_SCOPE_PRECEDENCE.md](./CANON_SCOPE_PRECEDENCE.md).

---

## Executive summary

**Canon** is CharID’s **hidden memory layer** for a project. It holds the established truths that generation, exports, and continuity checks depend on — across characters, stories, scenes, settings, images, and future outputs (comic pages, illustrations, audio).

Creators **do not manage Canon directly**. They edit normal workspace objects (characters, scenes, images). The system **derives, stores, and assembles** Canon from approved data.

**Continuity** (separate system) translates Canon gaps and conflicts into **visible, human-readable attention** — e.g. *“Jake’s board is damaged”* — without exposing graph nodes or fact tables.

**Hard rules:**

| Rule | Meaning |
|------|---------|
| Canon is hidden | No “Canon editor” or fact browser in creator UI |
| Continuity is visible | Alerts and progress only |
| Inferred ≠ Canon | System-inferred facts never enter Canon silently |
| Approval gate | All inferred facts: **Suggest → Review → Approve** |
| Creator authority | User-defined commits override inferred proposals until explicitly confirmed |

---

## Design principles

1. **Project-scoped memory** — Canon rolls up to Project; stories and scenes inherit with explicit scope rules.
2. **Same data model, layered view** — Existing rows (characters, bibles, scenes, slot assignments) remain source of truth; Canon is the **semantic layer** over them.
3. **Facts, not files** — Canon expresses **what is true**; assets are evidence linked to facts.
4. **Provenance always** — Every canon fact records how it entered (user edit, approved proposal, approved image slot).
5. **Deprecation, not deletion** — Superseded facts become deprecated for audit and timeline; they do not drive generation.
6. **Assembly is read-only** — AI and exports **read** Canon via context packets; they never write Canon except through defined approval paths.

---

## 1. Project Canon architecture

### Role

**Project Canon** is the root aggregate — the union of all scoped canon within one project, plus project-level facts (style defaults, notes, framework progress).

```text
Project Canon
├─ Character Canon[]     (by character_id)
├─ Story Canon[]         (by story_id)
├─ Scene Canon[]         (by scene_id, nested under story)
├─ Setting Canon         (locations, worlds, maps — project aggregate)
├─ Style Canon           (project + story overrides)
└─ Project Meta Canon    (work_intent, goals, notes — non-narrative)
```

Project Canon is **not a creator-facing object**. It is assembled on demand for:

- Continuity evaluation
- AI context packets
- Cross-story consistency checks
- Future export pipelines

### Scope hierarchy

When facts at different scopes conflict, **narrower scope wins for specificity**; **higher scope wins for defaults**:

```text
Project  →  default style, global setting rules, shared cast traits
Story    →  tone, themes, roster emphasis, story-level style override
Scene    →  moment truth: who, what, where, when, damage state
Character →  identity: appearance, personality, persistent traits
Setting  →  place rules: geography, culture, map position
Style    →  rendering intent (may override at story/scene for one sequence)
```

**Resolution order for assembly:** Character identity → Setting place → Scene moment → Story tone → Project style default.

### Rollup (conceptual)

| Source (v0.8 reality) | Canon slice |
|----------------------|-------------|
| `projects` row | Project Meta Canon |
| `characters` + `character_bible` + slot assignments | Character Canon |
| `stories` + `story_bible` + story images | Story Canon |
| `scenes` + `scene_characters` + location links | Scene Canon |
| `worlds` + `world_bible` + `world_locations` + maps + moodboards | Setting Canon |
| Moodboards, style refs, project/story image roles | Style Canon |

No new storage requirement in V1 design — rollup is a **view** over existing entities plus future **canon fact registry** for inferred truths that do not map 1:1 to a column.

### Project Meta Canon

Facts about the work container, not narrative:

- Work intent / project type
- Title, description, cover
- Optional story framework selection + progress (future)
- Creator notes (project `description`, future notes field)
- Completion weights (derived, not stored as canon facts)

---

## 2. Character Canon

### Purpose

Established **who this person/creature is** — identity stable across stories, scenes, and generated images.

### Fact categories

| Category | Examples | Typical source |
|----------|----------|----------------|
| **Identity** | Name, species, archetype | `characters` row |
| **Personality** | Core personality, backstory | `characters.core_personality`, bible |
| **Appearance** | Hair, eyes, build, scars, clothing default | `character_bible`, permanent features |
| **Visual evidence** | Canonical portrait, turnarounds, expressions | Reference graph / slot assignments |
| **Relationships** | Bonds to other characters (labels, not full prose) | `character_relationships` |
| **Story role** | Cast membership per story | `story_characters` — scoped to Story Canon but referenced |

### Character Canon boundaries

**In Canon:**

- Approved profile fields and bible descriptors
- Images assigned to reference slots (`canonical`, turnarounds, expressions)
- User-confirmed inferred traits (e.g. AI-suggested eye color after approve)

**Not in Canon:**

- Draft character form values before save
- Unassigned gallery uploads
- Pending moderation images
- Scene-only staging (until scene approved and promoted if cross-scene)

### Versioning (future-ready)

Character Bible already models `version_label` / `is_current`. Canon reads **current version only** for generation; deprecated versions remain for history.

---

## 3. Story Canon

### Purpose

Established **what this narrative is** — arc, tone, and planning context for scenes and chapters.

### Fact categories

| Category | Examples | Typical source |
|----------|----------|----------------|
| **Identity** | Title, slug, status, format (`project_type`) | `stories` |
| **Summary** | Logline, synopsis | `stories.summary`, `story_bible.summary` |
| **Tone & theme** | Themes, tone, major events | `story_bible` |
| **Planning** | Timeline notes, key characters/locations (text) | `story_bible` |
| **Roster** | Linked characters | `story_characters` |
| **Structure** | Chapters (order, titles) | `chapters` |
| **Visual** | Cover, story reference images | Story reference graph |
| **Framework** | Hero’s Journey stage completion (future) | Framework progress store |

### Story Canon boundaries

Story Canon **does not duplicate** full Character or Setting Canon — it **references** entity IDs and holds story-specific emphasis (e.g. *“In this story, Kai is protagonist”*).

Scene facts **override moment detail** but do not erase character identity.

---

## 4. Scene Canon

### Purpose

Established **what happens in this moment** — the primary unit for narrative continuity and scene-level AI.

### Fact categories

| Category | Examples | Typical source |
|----------|----------|----------------|
| **Beat** | Title, summary (what happens) | `scenes` |
| **Order** | `sort_order`, optional `chapter_id` | `scenes` |
| **Cast** | Characters present, optional role | `scene_characters` |
| **Place** | `world_location_id`, `location_label`, `world_id` hint | `scenes` |
| **State deltas** | Injury, costume change, prop state (future explicit fields) | User-defined or approved inferred |
| **Links** | Story, project | FKs |

### Scene Canon entry paths

| Path | Enters Canon when |
|------|-------------------|
| Manual create/edit | Save on scene row → immediate (user-defined) |
| Scene suggestion approve | Staging batch approve → commit scene → user-defined |
| AI-inferred moment detail | Proposal record → **Approve** → promoted fact or scene field update |

### Scene vs chapter

Chapters hold **prose structure** (Story Canon). Scenes hold **beats** (Scene Canon). For screenplay-first projects, Scene Canon may be primary; chapters optional.

---

## 5. Setting Canon

### Purpose

Established **where and how the world works** — places, rules, and environmental consistency.

Setting Canon subsumes what creators today reach through **Worlds** (implementation detail hidden behind **Setting** in product language).

### Fact categories

| Category | Examples | Typical source |
|----------|----------|----------------|
| **World identity** | Name, summary, rules | `worlds`, `world_bible` |
| **Locations** | Named places, types, descriptions | `world_locations` |
| **Geography** | Map pins, regions | `world_maps` |
| **Atmosphere** | Moodboard items, palette, tone refs | `world_moodboards` |
| **Culture / timeline / lore** | Bible fields, notes (future structured) | `world_bible`, project notes |
| **Visual evidence** | Canonical map, location images | World reference graph |

### Setting scope

| Scope | Rule |
|-------|------|
| **World-scoped** | Default — location belongs to one world |
| **Project-scoped** | Aggregated view: all worlds linked to project |
| **Scene-scoped** | Scene links one location for **this moment**; does not redefine world rules |

### Worldbuilding project type

For `work_intent = worldbuilding`, Setting Canon is **primary**; Story/Scene Canon may be empty. Project Canon still rolls up Setting + Character.

---

## 6. Style Canon

### Purpose

Established **how things should look** when generated or exported — distinct from **who** (Character) and **where** (Setting).

Style affects linework, palette, rendering, and illustration tone **without** changing identity facts.

### Fact categories

| Category | Examples | Source |
|----------|----------|--------|
| **Project style preset** | Soft watercolor, storybook, cartoon (future) | Project meta |
| **Reference images** | Style refs, moodboard slices | Moodboards, `style_reference` slots (future) |
| **Format coupling** | Comic vs painterly defaults from `work_intent` | Project + story format |
| **Story override** | One story in painterly mini-series | Story-level style refs |
| **Scene override** | Dream sequence in different style | Scene-level flag (future, rare) |

### Style vs Character reference hierarchy

Per [REFERENCE_IMAGE_STRATEGY.md](./REFERENCE_IMAGE_STRATEGY.md):

1. **Identity refs** (face/body) define *who*
2. **Style refs** modulate *rendering* only
3. Style Canon **must not** overwrite Character Canon appearance facts

### Style Canon entry

| Path | Rule |
|------|------|
| Visual picker / upload + slot approve | User-defined |
| “Choose a Style” preset | User-defined → maps to Style Canon facts |
| AI style suggestion | Inferred → **Approve** before affecting generation |

---

## 7. Canon fact lifecycle

Canon is modeled as **facts** — atomic established truths with metadata. V1 defines the lifecycle; storage may remain implicit in entity columns until a fact registry is justified.

### Fact shape (conceptual)

```text
CanonFact
├─ id
├─ project_id
├─ scope: project | story | scene | character | setting | style
├─ subject: entity ref (e.g. character_id, scene_id)
├─ facet: identity | appearance | personality | beat | place | tone | style | …
├─ key: normalized predicate (e.g. "hair_color", "summary", "location")
├─ value: string | structured JSON | asset_ref
├─ provenance: user | system_inferred | system_generated
├─ status: active | deprecated
├─ approval_state: n/a | pending | approved | rejected
├─ superseded_by: fact_id | null
├─ source_ref: table.row | proposal_id | slot_assignment_id
└─ timestamps
```

Not every field requires its own row today — lifecycle states still apply to **how truth enters Canon**, whether stored as column or fact row.

### Lifecycle states

```text
                    ┌─────────────────┐
                    │  user-defined   │
                    │  (direct edit)  │
                    └────────┬────────┘
                             │ save / commit
                             ▼
┌──────────────┐      ┌─────────────────┐      ┌──────────────┐
│  inferred   │─────▶│  active canon   │─────▶│ deprecated │
│  (proposal) │approve│  (truth)       │supersede│ (history)  │
└──────────────┘      └─────────────────┘      └──────────────┘
       │ reject              │
       ▼                     │ user edit replaces value
  (discarded)                └──────────────────────────▶ deprecated + new active
```

| State | Definition | In AI assembly? | In Continuity? |
|-------|------------|-----------------|----------------|
| **user-defined** | Creator saved via normal workspace | Yes | Yes |
| **system-inferred** | System proposed; **not approved** | **No** | Optional hint (“Suggested: …”) — not canon |
| **user-confirmed** | Inferred fact explicitly approved | Yes | Yes |
| **deprecated** | Superseded or user removed | **No** | No (audit only) |

### system-generated (non-fact)

Internal artifacts **never appear as Canon facts**:

- Prompt fragments assembled at runtime
- Embedding vectors
- Provider model IDs
- Raw API responses

These may **read** Canon; they do not **become** Canon.

### Promotion rules

| Event | Result |
|-------|--------|
| User edits character hair | New user-defined fact; old value deprecated if tracked |
| User approves scene suggestion | Scene row commit → Scene Canon (user-defined via approved draft) |
| AI proposes “Marco is left-handed” | Inferred fact, pending — **not** in Character Canon until approve |
| User rejects proposal | Inferred fact discarded; no Canon change |
| User deletes scene | Scene facts deprecated; not deleted from audit trail |
| Slot assignment approved | Visual evidence fact linked to Character/Setting/Style Canon |

---

## 8. Canon approval workflow

All paths that could add **new truth** follow collaborative creation:

```text
Suggest → Review → Edit (optional) → Approve → Commit to Canon
```

### Workflow by source

| Source | Suggest | Review | Approve | Commit target |
|--------|--------|--------|--------|---------------|
| Manual form save | — | — | Implicit (intentional edit) | Entity row → Canon |
| Scene / creative proposals | Staging batch | Story/project UI | Per-item approve | `scenes`, etc. |
| AI text suggestion (future) | Proposal record | Inline diff | Approve / reject | Fact registry or field |
| AI image generation | Preview | Image picker | Accept into slot | Reference graph |
| Bulk import (future) | Import staging | Review table | Bulk approve | Multiple facts |
| Continuity “fix” suggestion | Continuity panel | Creator confirms | Approve | Same as above |

### Bulk approve

Allowed **only** as explicit creator action after full review (e.g. approve all pending scene suggestions). Never default-on.

### Reject and discard

Reject **never** writes Canon. Staging cleared; inferred facts marked rejected or deleted from proposal store.

### Re-approval

Editing an approved proposal before commit does not require re-approval. After commit, changes go through **user-defined** edit path or new proposal if system-initiated.

---

## 9. Canon data ownership

### Ownership matrix

| Data | Owner | Canon role |
|------|-------|------------|
| `projects` | Creator | Project Meta Canon |
| `characters`, `character_bible` | Creator | Character Canon |
| `stories`, `story_bible`, `chapters` | Creator | Story Canon |
| `scenes`, `scene_characters` | Creator | Scene Canon |
| `worlds`, `world_bible`, locations, maps | Creator | Setting Canon |
| Image slot assignments | Creator (approve) | Visual evidence in entity Canon |
| `creative_proposal_batches` | Creator approves | Pre-Canon staging only |
| Context packets | System (assembled) | Read-only snapshot; not Canon |
| Continuity alerts | System (derived) | Read Canon; write attention state only |
| Moderation flags | Platform | Blocks Canon promotion until cleared |

### Tenancy and isolation

- Canon facts are **always scoped to `project_id`** and **`user_id`**
- Cross-project Canon merge **forbidden** without explicit future “import” flow (itself a proposal)
- Public portfolio displays **subset** of Canon — never full graph

### Who may write Canon

| Actor | May write |
|-------|-----------|
| **Creator** | User-defined path; approve inferred |
| **System** | Deprecate on supersede; assemble packets; **never** silent active fact |
| **AI provider** | Proposals only — same staging as CharID AI |
| **Admin / moderation** | Block or quarantine; not replace creator truth |

---

## 10. AI context assembly rules

Canon feeds AI **only through assembled context packets** ([AI_PROVIDER_ARCHITECTURE.md](./AI_PROVIDER_ARCHITECTURE.md)). Providers never query raw tables.

### Inclusion rules

| Include | Exclude |
|---------|---------|
| Active user-defined facts | Pending inferred facts |
| User-confirmed inferred facts | Rejected proposals |
| Approved reference images (per slot strategy) | Unassigned gallery images |
| Current bible version | Deprecated facts / old versions |
| Scene cast + summary for target scene | Other scenes’ full text (unless packet scope = story) |
| Setting for scene’s linked location | Entire world bible when only beach needed |

### Assembly order (deterministic)

```text
1. Project Meta     (work_intent, format defaults)
2. Style Canon      (project → story override → scene override)
3. Character Canon (each cast member: identity → appearance → refs)
4. Setting Canon    (scene place → world rules → map ref if needed)
5. Story Canon      (tone, themes, summary — framing only)
6. Scene Canon      (target beat — highest narrative specificity)
7. System hints     (framework stage, continuity warnings — not canon facts)
```

### Packet types (existing direction)

| Packet | Primary Canon slices |
|--------|---------------------|
| CharacterContextPacket | Character |
| WorldContextPacket | Setting |
| StoryContextPacket | Story + roster refs |
| CombinedContextPacket | Merged for multi-entity generation |
| Scene suggestion context | Story + cast + Setting slice + **no** unapproved scenes |

### Freshness

- Assemble at request time; `assembledAt` timestamp
- Invalidate on approve/commit affecting scoped entities
- Never cache packets across users or projects

### Safety

- Moderation-blocked assets excluded even if assigned
- Private project Canon never leaks to public generation endpoints
- Log `context_snapshot_id` for audit — not shown to creator

---

## 11. Canon conflict resolution rules

**Detailed precedence and provisional behavior:** [CANON_SCOPE_PRECEDENCE.md](./CANON_SCOPE_PRECEDENCE.md) — prerequisite for Continuity V1.

A **conflict** exists when two **active** facts assert incompatible truths for the same subject + facet at the same or overlapping scope.

### Conflict classes

| Class | Example |
|-------|---------|
| **Identity** | Character hair “black” vs approved image showing blonde |
| **Moment** | Scene says board broken; earlier scene says board intact (no repair) |
| **Place** | Scene @ Malibu; location canon says interior only |
| **Cast** | Character in two scenes at same timeline index (future) |
| **Style** | Project watercolor; scene requests photoreal without override flag |

### Resolution precedence

When assembling Canon or Continuity checks:

```text
1. Explicit user-defined fact beats unapproved inferred
2. Narrower scope beats wider (scene > story > project) for moment truth
3. User-defined at same scope: latest intentional edit wins
4. Visual slot assignment beats free-text appearance when both “active” → Continuity alert (not silent pick)
5. Deprecated facts never participate
6. Unresolved → Continuity surfaces ⚠; AI packet omits contested facet or uses only user-defined side
```

### Automatic resolution (forbidden)

| Action | Allowed? |
|--------|----------|
| Silently pick AI guess | **No** |
| Silently prefer image over text | **No** — alert creator |
| Auto-merge characters | **No** |
| Auto-deprecate user fact | **No** — user edit or approve only |

### Conflict workflow

```text
Detect → Surface in Continuity (visible)
      → Optional AI Suggest fix (proposal)
      → Creator Review → Approve → Canon update → conflict cleared
```

### Cross-story conflicts

Shared Character Canon across stories in one project:

- Character identity is **project-stable**
- Story-specific role notes live in Story Canon
- Scene state deltas **do not** mutate Character Canon unless user promotes (*“Jake lost arm — permanent”*)

---

## Relationship to shipped systems (v0.8)

Conceptual mapping only — not an implementation plan.

| Shipped today | Canon V1 role |
|---------------|---------------|
| Character / World / Story **Bibles** | Primary text stores for entity Canon |
| **Reference graphs** + slot assignments | Visual evidence facts |
| **Context packets** (`assemble-*`) | Canon read path for AI |
| **Scene suggestion staging** | Pre-Canon; approve → Scene Canon |
| **creative_proposal_batches** | Generalized proposal store pattern |
| Bible **scores** | Readiness signals → Continuity inputs, not Canon |
| **Moderation queue** | Gate before visual facts enter Canon |

---

## Glossary

| Term | Meaning |
|------|---------|
| **Canon** | Hidden established truth for a project |
| **Canon fact** | Atomic truth with provenance and lifecycle |
| **Continuity** | Visible attention layer over Canon |
| **Provenance** | How a fact entered (user, inferred, generated) |
| **Staging** | Pre-Canon proposal storage |
| **Scope** | Project, story, scene, character, setting, style |
| **Deprecated** | Superseded; excluded from assembly |
| **Context packet** | Immutable assembled Canon slice for one AI job |

---

## Out of scope (Canon V1 design)

- SQL tables, migrations, API routes
- Continuity alert copy and UI ([CONTINUITY_V1_SCHEMA.md](./CONTINUITY_V1_SCHEMA.md) — separate)
- Project Workspace layout ([PROJECT_WORKSPACE_V1.md](./PROJECT_WORKSPACE_V1.md))
- Story framework storage detail
- Public portfolio Canon exposure rules (beyond: subset only)
- Implementation sequencing and engineering tasks

---

## Success criteria

Canon V1 design succeeds if engineering and product can answer:

1. **What is Canon vs Continuity vs staging?** — Clear separation
2. **When does a scene suggestion become truth?** — Approve → commit
3. **Can AI see unapproved guesses?** — No
4. **What happens when text and image disagree?** — Continuity alert; no silent merge
5. **What is Project Canon?** — Rollup view + project meta; memory of the whole work

---

## Document map

| Document | Role |
|----------|------|
| [PROJECT_FIRST_CREATIVE_STUDIO_V1.md](./PROJECT_FIRST_CREATIVE_STUDIO_V1.md) | Locked product direction |
| **This doc** | Hidden Canon layer schema |
| Continuity V1 *(next)* | Visible alerts derived from Canon |
| [COLLABORATIVE_CREATION_PRINCIPLE.md](./COLLABORATIVE_CREATION_PRINCIPLE.md) | Approval workflow authority |
| [REFERENCE_IMAGE_STRATEGY.md](./REFERENCE_IMAGE_STRATEGY.md) | Visual Canon evidence rules |
