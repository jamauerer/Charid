# Canon Scope & Precedent

**Status:** Design only — **no implementation**  
**Date:** 2026-06-14  
**Purpose:** Conflict resolution rules between [CANON_V1_SCHEMA.md](./CANON_V1_SCHEMA.md) and Continuity V1  
**Prerequisite for:** Continuity V1 schema design

**Authority:** [CANON_V1_SCHEMA.md](./CANON_V1_SCHEMA.md) · [PROJECT_FIRST_CREATIVE_STUDIO_V1.md](./PROJECT_FIRST_CREATIVE_STUDIO_V1.md) · [COLLABORATIVE_CREATION_PRINCIPLE.md](./COLLABORATIVE_CREATION_PRINCIPLE.md) · [REFERENCE_IMAGE_STRATEGY.md](./REFERENCE_IMAGE_STRATEGY.md)

---

## Summary

When Canon slices disagree, CharID must behave predictably **before** a creator reviews the issue.

```text
Canon wins provisionally  →  system uses established Canon in assembly & generation
Creator wins finally     →  only explicit creator action resolves or supersedes
Continuity makes it visible  →  ⚠ alerts; never silent fixes
```

This document defines **which Canon slice applies**, **what happens while unresolved**, and **how creators clear conflicts** — without exposing Canon infrastructure.

---

## 1. Canon authority model

### Two-layer authority

| Layer | Role |
|-------|------|
| **Canon (provisional)** | Active facts in the memory layer — authoritative for assembly and generation **until** creator resolves a flagged conflict |
| **Creator (final)** | Only path to merge, supersede, or promote conflicting truths into stable Canon |

**Rule:** Canon wins provisionally. Creator wins finally.

### While a conflict is open

| System | Behavior |
|--------|----------|
| **Context assembly** | Uses **Canon-preferred** side per scope rules (§2–§3); contested facet may be **excluded** if no safe preference |
| **Generation** | Proceeds only on **non-contested** Canon; identity mismatches → Continuity warning, not hidden fix |
| **Continuity** | Surfaces ⚠; does not auto-pick a winner |
| **AI** | Never invents resolution; may **Suggest** a fix as proposal only |

### After creator resolves

| Resolution | Effect |
|------------|--------|
| Edit entity / fact | User-defined truth → active; conflicting fact **deprecated** |
| Approve proposal | Inferred → user-confirmed → active |
| Dismiss (explicit) | Conflict marked **acknowledged**; provisional rule unchanged until edited |
| Promote scene delta | Scene-only state → Character or Story Canon (explicit promotion) |

Unresolved conflicts **do not block** editing or manual creation. They **do** constrain how AI uses contested facets.

---

## 2. Scope precedence

Five Canon slices. Precedent answers: *for this question, which slice speaks first?*

### Precedent stack (default)

For **narrative moment truth** (who, what, where in this beat):

```text
Scene Canon  →  moment (highest specificity)
Character Canon  →  identity of people present
Setting Canon  →  place rules & linked location
Story Canon  →  arc framing, tone, roster emphasis
Style Canon  →  rendering only (lowest narrative authority)
```

For **identity truth** (persistent traits):

```text
Character Canon  →  always first
Style Canon  →  may reinterpret look, not identity
Scene Canon  →  state deltas only; do not override identity without promotion
Story Canon  →  role notes, not appearance
Setting Canon  →  no effect on character identity
```

For **place truth**:

```text
Setting Canon (location + world)  →  rules of place
Scene Canon  →  which place this moment uses
Story Canon  →  key locations (planning text), not moment override
```

For **visual generation** (assembly order, not conflict winner):

```text
Character identity refs → Setting place refs → Style refs → Scene beat text
```

(See [REFERENCE_IMAGE_STRATEGY.md](./REFERENCE_IMAGE_STRATEGY.md).)

### Cross-scope rules

| Situation | Winner (provisional) | Notes |
|----------|----------------------|-------|
| Scene beat vs Story tone | Both apply — no conflict unless scene contradicts established tone | Tone conflict → Story vs Scene workflow (§4) |
| Scene cast vs Character existence | Character must exist | Scene cannot invent character without approve |
| Scene location vs Setting type | Scene picks **instance**; Setting owns **rules** | “Interior only” location + exterior scene → Setting vs Scene |
| Story roster vs Scene cast | Scene cast ⊆ story-linked cast (soft) | Extra character in scene → alert, not auto-remove |
| Project style vs Story style override | Story override if flagged | Else Project Style Canon |
| Scene style flag vs Project style | Scene for that beat only | Identity refs unchanged |

### Same scope, same facet

Latest **user-defined** edit at that scope wins. Tie between user-defined text and approved image → **conflict** (no automatic preference).

### Inferred vs established

Unapproved inferred facts **never** beat active Canon. They do not participate in provisional wins.

---

## 3. Identity vs Style

**Identity Canon outranks Style Canon.**

| Identity Canon | Style Canon |
|----------------|-------------|
| Who: species, face, body, hair, scars | How drawn: linework, palette, medium |
| Approved identity reference slots | Style presets, moodboard, style refs |
| Persistent across project | May vary by story/scene **only** with explicit override |

### Rules

| Rule | Meaning |
|------|---------|
| **Style may reinterpret** | Same character in watercolor vs ink — identity facts unchanged |
| **Style may not redefine** | Style cannot change hair color, age, species, name |
| **Conflict** | Generated image matches style but violates identity → identity violation (§6) |
| **Provisional assembly** | Identity refs always included if approved; style refs layered on top |
| **Contested identity** | Exclude facet or use Character Canon text/refs only — never style guess |

Style-only conflicts (e.g. project cartoon vs scene dream-sequence painterly) use **Style override flag** on scene; Continuity informational unless identity also contested.

---

## 4. Conflict workflows

Each pair: **provisional behavior** · **Continuity alert** · **creator options**

---

### Character vs Scene

**Example:** Character Canon: healthy leg. Scene: Jake walks with a cast. No prior injury scene.

| Phase | Behavior |
|-------|----------|
| **Provisional** | Scene Canon wins **for this moment** (cast, beat). Character Canon unchanged globally. |
| **Assembly (scene job)** | Include scene beat + character identity; **omit** or footnote injury if unresolved. |
| **Continuity** | ⚠ *“Jake’s injury in [scene] isn’t in character profile — permanent or this scene only?”* |
| **Creator options** | (a) Edit scene (b) Add character note (c) **Promote** to Character Canon (d) Mark one-scene only / dismiss |

---

### Character vs Style

**Example:** Character: red hair in bible. Style ref / generation: blonde in painterly test.

| Phase | Behavior |
|-------|----------|
| **Provisional** | **Character identity** wins for hair color in context packet. |
| **Assembly** | Identity refs + text hair color; style refs without hair override. |
| **Continuity** | ⚠ *“Style reference may conflict with [character] hair color”* |
| **Creator options** | (a) Update style ref (b) Confirm intentional reinterpret (story override) (c) Regenerate with identity-weighted prompt (d) Edit character if blonde is intended |

**Rule:** Never silently recolor to match style.

---

### Setting vs Scene

**Example:** Location Canon: *Pleasure Point — indoor café only*. Scene: surfers on the beach @ Pleasure Point.

| Phase | Behavior |
|-------|----------|
| **Provisional** | Scene **moment place** used for beat text; Setting **rules** flag violation. |
| **Assembly** | Scene location label + Setting canon for linked location; contested environment facts **excluded** from place refs. |
| **Continuity** | ⚠ *“Pleasure Point needs a setting profile”* or *“Scene place conflicts with location rules”* |
| **Creator options** | (a) Change scene location (b) Split location (outdoor vs indoor) (c) Edit location rules (d) Approve exception note on scene |

---

### Story vs Scene

**Example:** Story tone: lighthearted children’s book. Scene summary: implied death / heavy violence.

| Phase | Behavior |
|-------|----------|
| **Provisional** | **Scene beat** is true for moment; Story tone remains for framing elsewhere. |
| **Assembly (scene)** | Full scene summary; story tone included as context — no auto-censorship. |
| **Continuity** | ⚠ *“This scene may not match story tone”* (severity by project type) |
| **Creator options** | (a) Edit scene (b) Edit story tone/summary (c) Mark intentional shift (d) Dismiss |

**Rule:** Continuity **warns**; does not block save. Creator owns tone choices.

---

### Workflow summary

```text
Detect conflict
  → Apply provisional precedence (§2–§3)
  → Surface Continuity ⚠
  → Optional Suggest (proposal)
  → Creator: Edit | Promote | Approve proposal | Dismiss
  → Deprecate loser / confirm winner → conflict cleared
```

All fixes via **Suggest → Review → Approve** when system-initiated.

---

## 5. AI assembly behavior

### Unresolved conflicts in context packets

| Rule | Behavior |
|------|----------|
| **Canon-preferred** | Include winning side per §2 provisional rules |
| **Contested facet** | **Exclude** both values, or include **non-contested** Character/Setting identity only |
| **Never invent** | AI must not merge, average, or guess (e.g. “brownish” hair) |
| **Flag in packet metadata** | Internal `conflictsPresent: true` — not shown to creator as Canon |
| **Combined jobs** | Multi-character: per-character identity; omit contested scene deltas |

### Packet inclusion matrix

| Conflict type | Typical assembly |
|---------------|------------------|
| Character vs Scene (injury) | Identity + scene title/summary; **exclude** injury from character block until promoted |
| Character vs Style | Identity text + refs; style refs **without** contested attribute |
| Setting vs Scene | Scene place string; **omit** conflicting location image refs |
| Story vs Scene | Both strings; no automatic rewrite |

### Suggest path

AI may propose resolution text → **staging only** → same approval workflow as scene suggestions. Proposal **does not** enter packet as Canon until approved.

---

## 6. Generation behavior

### Identity violations

When output **likely contradicts** active Character or Setting identity Canon:

| Step | Behavior |
|------|----------|
| 1 | Generation may complete (creator may want draft) |
| 2 | **Continuity warning** — not auto-rejection |
| 3 | Asset **not** promoted to reference slot without creator approve |
| 4 | No silent regeneration to “fix” identity |
| 5 | No hidden correction in post-processing |

### Style vs identity in generation

- Provider prompt: identity anchors **required** when refs exist
- Style modifiers **appended**, not substituted
- Mismatch → ⚠ *“Generated image may not match [character] references”*

### Forbidden

| Forbidden | |
|-----------|---|
| Auto-reject generation | |
| Auto-regenerate until match | |
| Auto-assign to canonical slot | |
| Silent text “correction” in scene/character rows | |

---

## 7. Design principles

| Principle | Implication |
|-----------|------------|
| **Canon is hidden** | Creators see Continuity alerts, not fact IDs or graphs |
| **Continuity is visible** | Every provisional conflict has a human-readable ⚠ |
| **Canon is authoritative until reviewed** | Assembly uses precedence rules; not “empty until fixed” |
| **Creator owns truth** | Only explicit edit or approve changes active Canon |
| **Suggest → Review → Approve** | System never silently resolves |
| **Identity beats style** | Rendering serves identity, not reverse |
| **Scene beats moment; Character persists** | Promotion required to merge scene delta into identity |
| **Deprecation over erase** | Resolved conflicts leave audit trail |

---

## Document map

| Document | Role |
|----------|------|
| [CANON_V1_SCHEMA.md](./CANON_V1_SCHEMA.md) | What Canon is; fact lifecycle; high-level conflicts |
| **This doc** | Scope precedence & provisional resolution — **input to Continuity V1** |
| Continuity V1 *(next)* | Alert types, severity, placement, dismissal |
| [COLLABORATIVE_CREATION_PRINCIPLE.md](./COLLABORATIVE_CREATION_PRINCIPLE.md) | Approval workflow |

---

## Out of scope

- Alert copy and UI placement
- Storage for conflict records
- Timeline / simultaneity engine
- Implementation tasks

---

## Success criteria

Continuity V1 can be designed when this doc answers:

1. Which side wins **provisionally** for each conflict pair?  
2. What goes **in or out** of context packets while ⚠ is open?  
3. What may generation do **without** creator approve?  
4. What options does the creator get **in plain language**?
