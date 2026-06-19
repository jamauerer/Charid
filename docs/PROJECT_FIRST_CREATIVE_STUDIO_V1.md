# Project-First Creative Studio V1

**Status:** Product direction locked — **planning only, no implementation in this document**  
**Date:** 2026-06-14  
**North star:** A project-first creative studio that helps creators finish consistent, professional-quality stories across any medium.

**Related:** [PROJECT_WORKSPACE_V1.md](./PROJECT_WORKSPACE_V1.md) · [PROJECT_CENTERED_INFORMATION_ARCHITECTURE.md](./PROJECT_CENTERED_INFORMATION_ARCHITECTURE.md) · [PROJECT_UX_PROPOSAL.md](./PROJECT_UX_PROPOSAL.md) · [CHARID_NORTH_STAR_V1.md](./CHARID_NORTH_STAR_V1.md) · [COLLABORATIVE_CREATION_PRINCIPLE.md](./COLLABORATIVE_CREATION_PRINCIPLE.md) · [FINISHED_CREATIVE_WORK_PRINCIPLE.md](./FINISHED_CREATIVE_WORK_PRINCIPLE.md)

---

## Purpose

This document defines the **future direction of CharID** before further implementation.

The goal is **not** to build more features.

The goal is to **simplify the creator experience** while strengthening **consistency** and **project completion**.

Every feature should be evaluated against:

> Does this help creators finish consistent, professional-quality work faster?

If not, deprioritize it.

---

## North star

CharID is:

> A project-first creative studio that helps creators finish consistent, professional-quality stories across any medium.

### Optimize for

1. **Finishing projects**
2. **Consistency**
3. **Ease of use**
4. **Creative guidance**

### Do not optimize for

- Database management
- Excessive worldbuilding
- Complex setup
- AI replacing creators

**AI is a collaborator, not an autonomous creator.**

Workflow rule (all AI surfaces):

```text
Suggest → Review → Approve
```

Never auto-commit, auto-rewrite, or auto-publish.

---

## Core architecture

### Project is the root object

Everything belongs to a **Project**.

Remove the idea that **World** is the central organizing concept.

Projects become the **primary workspace and navigation model**.

World does not disappear from the data model — it becomes **Setting** infrastructure, surfaced progressively, and fully expressed only for **Worldbuilding** project type.

---

## Project structure

Base structure (logical — not every type uses every section):

```text
Project
├─ Stories
│   ├─ Chapters
│   └─ Scenes
│
├─ Characters
│
├─ Setting
│   ├─ Locations
│   ├─ Culture
│   ├─ Timeline
│   └─ Notes
│
├─ Assets
│
└─ Notes
```

**Project type** determines workspace structure, default sections, AI guidance, framework suggestions, and completion tracking.

Underlying **data model remains shared** — presentation and gates differ by type.

---

## Project types

At project creation:

```text
What are you creating?

○ Novel
○ Screenplay
○ Film
○ Graphic Novel / Comic
○ Children's Book
○ Worldbuilding Project
○ Other
```

Maps to existing `ProjectWorkIntent` where possible; **Film** may align with Screenplay + `film_animation` story format.

### Example structures (creator-facing)

| Type | Primary sections |
|------|----------------|
| **Novel** | Characters · Chapters · Scenes · Notes |
| **Screenplay / Film** | Characters · Scenes · Locations · Notes |
| **Graphic novel / Comic** | Characters · Story · Scenes · Pages · Assets |
| **Children's book** | Characters · Story · Pages · Illustrations · Assets |
| **Worldbuilding** | Characters · Locations · Culture · Timeline · Maps · Lore |

**Worldbuilding** is a **project type**, not a top-level nav destination.

---

## Progressive complexity

Principle:

> **Beginner by default. Expert by expansion.**

### Default (new users)

```text
Story
Characters
Scenes
Assets
```

### Advanced (appear when useful)

```text
Locations
Timeline
Culture
Lore
Maps
```

Do not force Tolkien-level worldbuilding.

Implementation pattern: collapsed **Setting** section with unlock hints — *“Add a location when a scene needs a place”* — not empty mandatory wizard steps.

---

## Canon system

**Canon is hidden infrastructure.** Creators do not manage canon directly.

The system builds canon from project data.

### Project canon (internal)

```text
Project Canon
├─ Character Canon
├─ Story Canon
├─ Scene Canon
├─ Style Canon
└─ Setting Canon
```

Canon provides: consistency, continuity, generation context, project memory.

### Canon rules

| Source | Examples |
|--------|----------|
| **User-defined** | Character appearance, personality, style, setting, story goals |
| **System-generated** | Prompt fragments, continuity checks, framework progress, suggestions |
| **System-inferred** | Proposed canon facts — **require confirmation** |

**Never silently modify canon.**

### Relationship to shipped systems (v0.8)

| Today | Canon direction |
|-------|-----------------|
| Character / World / Story **Bibles** | Proto-canon stores — remain internal |
| **Reference Graph** | Canon linkage for images and entities |
| **Context Packets** | Assembled canon for AI — not creator-facing |
| Scene **suggestion staging** | Correct Suggest → Review → Approve pattern |

**Canon V1 schema** (priority #4): document how bibles + graph + scenes roll up to Project Canon without new creator UI.

---

## Continuity system

**Continuity is visible. Canon is hidden.**

Creators see human-readable attention items, not graph nodes:

```text
⚠ Marco needs a profile
⚠ Pleasure Point needs a setting profile
⚠ Jake's board is damaged
```

Continuity surfaces at **project level** (and story level when in story workspace).

Creator always understands:

- What is established
- What is inconsistent
- What needs attention

**Continuity V1 schema** (priority #5): rules engine over existing entities — scores, gaps, cross-scene conflicts — surfaced in Project Workspace Zone 1–2.

---

## Story frameworks

Frameworks are **optional**. They guide structure and AI; never forced.

```text
Freeform
Hero's Journey
Three Act Structure
Save the Cat
Dan Harmon Story Circle
```

Enable: progress tracking, missing-stage detection, smarter suggestions.

Example:

```text
Hero's Journey

Ordinary World ✓
Call to Adventure ✓
Refusal ✗
Mentor ✗
```

Lives under **Story** or **Project Notes** — not a separate product surface in V1.

---

## Style system

Style is critical for consistency. Creators define style **visually** whenever possible.

### Universal asset rule

Whenever an asset is needed:

```text
Upload  ·  Choose Existing  ·  Generate
```

Use this pattern **everywhere**: character images, covers, illustrations, location images, references, moodboards.

### Style selection

```text
Choose a Style

○ Soft Watercolor
○ Storybook Illustration
○ Cartoon
○ Graphic Novel
○ Realistic
○ Upload Reference
```

System converts selections into **Style Canon**. Users think visually; system thinks structurally.

---

## Project workspace

Project is the **primary creator experience**.

Must answer:

1. What exists?
2. What is missing?
3. What should I work on next?
4. How complete is the project?
5. How do I finish it?

Detailed layout: **[PROJECT_WORKSPACE_V1.md](./PROJECT_WORKSPACE_V1.md)** — aligned with this direction.

### Zone 1 — Project header

```text
How I Surf

Children's Book

72% Complete

Suggested Next Step:
Create a Call to Adventure scene
```

### Zone 2 — At-a-glance

```text
Characters 3    Scenes 12    Assets 8    Locations 1
```

Empty sections **remain visible** (count shows 0 — not hidden tabs).

### Zone 3 — Expandable roadmap

```text
▼ Characters
▼ Story
▶ Setting
▶ Assets
```

Project type controls order and labels.

---

## AI philosophy

AI helps creators when **stuck**.

| AI may | AI never |
|--------|----------|
| Suggest ideas, scenes, structure, organization, missing pieces | Auto-commit, auto-rewrite, auto-publish |

Single staging surfaces per story (see [CREATOR_FLOW_CONSOLIDATION.md](./CREATOR_FLOW_CONSOLIDATION.md)). Project-level AI suggests **next step** only — not parallel generation pipelines.

---

## Immediate priorities (sequenced)

Do **not** introduce additional major systems until these foundations are complete.

| # | Priority | Notes |
|---|----------|-------|
| 1 | **Remove World as required concept** | Story create still requires `world_id`; URLs world-nested |
| 2 | **Stories, scenes, characters without world dependency** | Nullable world + default setting per project; soft gates |
| 3 | **Project-type-driven workspaces** | Implement [PROJECT_WORKSPACE_V1.md](./PROJECT_WORKSPACE_V1.md) PW1–PW4 |
| 4 | **Canon V1 schema** | Design doc: bible → Project Canon rollup; no creator canon UI |
| 5 | **Continuity V1 schema** | Design doc: visible alerts from existing data |
| 6 | **Project Workspace V1** | Hybrid layout (locked in design proposal) |
| 7 | **Implement incrementally** | One phase per checkpoint; build must pass |

### Suggested implementation order

```text
Phase A — UX without schema change
  · Project Workspace PW1–PW3 (roadmap, what's next, rollups)
  · Sidebar: demote Worlds to "All settings" or remove from primary nav
  · Creator copy: World → Setting everywhere user-facing

Phase B — Soft world decoupling
  · Story create: project + optional setting (not world picker first)
  · Default world per project (internal) for legacy paths

Phase C — Design-only foundations
  · Canon V1 schema document
  · Continuity V1 schema document
  · Framework + Style canon mapping (design)

Phase D — Schema only when designs signed off
  · No migration until Canon/Continuity V1 approved
```

---

## What stays out of scope until foundations land

- Marketplace, discovery, publishing
- New AI providers or autonomous agents
- Project rollup URLs for stories/scenes (optional later)
- Forcing story frameworks
- Creator-facing canon editor
- Tolkien-default worldbuilding flows

---

## Success metric

Every feature:

> Does this help creators finish consistent, professional-quality work faster?

**Founder test (unchanged):**  
California Coast Surf Stories → How I Surf — understood from **project screen** in five seconds, with a clear next step into scenes.

---

## Document map

| Document | Role |
|----------|------|
| **This doc** | Locked product direction |
| [CANON_V1_SCHEMA.md](./CANON_V1_SCHEMA.md) | Hidden canon layer schema |
| [CANON_SCOPE_PRECEDENCE.md](./CANON_SCOPE_PRECEDENCE.md) | Scope precedence & conflict resolution (locked — June 2026) |
| [PROJECT_WORKSPACE_V1.md](./PROJECT_WORKSPACE_V1.md) | Workspace layout & migration |
| [CREATOR_FLOW_CONSOLIDATION.md](./CREATOR_FLOW_CONSOLIDATION.md) | Story-level UX consolidation |
| Continuity V1 *(next)* | Visible continuity schema — requires [CANON_SCOPE_PRECEDENCE.md §1–§4](./CANON_SCOPE_PRECEDENCE.md#1-canon-authority-model) |
