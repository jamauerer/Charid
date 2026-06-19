# Canon Scope & Precedent

**Status:** Locked — June 2026  
**Design only.** No implementation, no migrations, no code.

This document sits between [CANON_V1_SCHEMA.md](./CANON_V1_SCHEMA.md) and Continuity V1. It defines what happens when sources of truth disagree — the precedence rule Canon V1 named but did not specify, and the prerequisite Continuity V1 needs before it can define real warnings.

**Authority:** [CANON_V1_SCHEMA.md](./CANON_V1_SCHEMA.md) · [PROJECT_FIRST_CREATIVE_STUDIO_V1.md](./PROJECT_FIRST_CREATIVE_STUDIO_V1.md) · [COLLABORATIVE_CREATION_PRINCIPLE.md](./COLLABORATIVE_CREATION_PRINCIPLE.md) · [REFERENCE_IMAGE_STRATEGY.md](./REFERENCE_IMAGE_STRATEGY.md)

---

## 1. Canon authority model

**Rule: Canon wins provisionally. Creator wins finally.**

Canon is the authoritative source of truth at all times *except* when a creator actively overrides it through review.

Until a conflict is reviewed:

- AI context packets assemble using the **Canon value**, not the conflicting value.
- The conflicting value (e.g. a scene line, a generated image) is never silently adopted into Canon.
- The conflict is surfaced as a Continuity alert, not resolved by the system.

```text
Conflict Detected
↓
Canon value used in assembly (provisional)
↓
Continuity warning surfaced
↓
Creator reviews
↓
Update Canon | Update Source | Ignore
↓
Canon value finalized (or conflict marked resolved/ignored)
```

The system never decides. It defaults to Canon and waits.

---

## 2. Scope precedence

Pre precedence order, most to least authoritative:

```text
Character Canon
Story Canon
Setting Canon
Scene Canon
Style Canon
```

This order determines **which value populates the AI context packet** when two Canon layers disagree about the same fact, and **which side of a conflict is treated as Canon** when a non-Canon source (a scene, a generated asset) contradicts it.

Notes:

- Pre precedence governs *defaults during assembly*, not who is "right." A lower-pre precedence source contradicting a higher one is always a Continuity conflict, never a silent override — see Section 1.
- Style Canon sits lowest because it governs rendering, not facts. See Section 3 for the specific Identity vs. Style relationship, which is a stronger rule than ordinary precedence.

---

## 3. Identity vs. Style

**Identity Canon outranks Style Canon. Always. Not just by precedence order — by kind.**

Identity Canon includes:

```text
Name
Age
Hair
Eyes
Distinctive traits
Core appearance
```

Style Canon includes:

```text
Rendering
Lighting
Color treatment
Brushwork
Line style
Visual medium
```

**Style may reinterpret. Style may not redefine.**

A watercolor, comic, or realistic rendering of Jake may look different in texture and treatment — but it must still be recognizably Jake's stated identity facts. If a generated asset changes an identity fact (not just its rendering), that is an identity violation, not an acceptable stylistic interpretation.

---

## 4. Conflict workflows

For each conflict type: provisional behavior, alert behavior, resolution options.

### Character vs. Scene

```text
Provisional: Character Canon value used in assembly
Alert: "⚠ Continuity Conflict — Character Canon says X, Scene says Y"
Resolution: Update Canon | Update Scene | Ignore
```

### Character vs. Style (Identity violation)

```text
Provisional: Character Canon identity facts used in assembly
Alert: "⚠ Identity Continuity Warning — Generated output appears
        inconsistent with Character Canon"
Resolution: Update Canon | Regenerate manually | Ignore
Note: No auto-reject, no silent regeneration, no hidden correction.
```

### Setting vs. Scene

```text
Provisional: Setting Canon value used in assembly
Alert: "⚠ Continuity Conflict — Setting Canon says X, Scene says Y"
Resolution: Update Canon | Update Scene | Ignore
```

### Story vs. Scene

```text
Provisional: Story Canon value used in assembly
Alert: "⚠ Continuity Conflict — Story Canon says X, Scene says Y"
Resolution: Update Canon | Update Scene | Ignore
```

All workflows follow the same shape. There is one philosophy, applied consistently — not a special case per conflict type.

---

## 5. AI assembly behavior

**Rule: Contested facts are Canon-preferred. AI never invents conflict resolution.**

- While a conflict is unresolved, the context packet contains the Canon value (per Section 1 and Section 2).
- The AI is never given both conflicting values and asked to pick — that would reintroduce silent decision-making at a different layer.
- Once a creator resolves a conflict, the next context packet reflects the resolution. Context packets are snapshots; they do not need to be aware of conflict *history*, only the current resolved (or provisionally defaulted) state.

---

## 6. Generation behavior

**Identity violations become Continuity warnings. Nothing more, nothing less.**

- No auto-reject of generated assets.
- No silent regeneration.
- No hidden AI correction of identity facts.

A generated image that violates Identity Canon is treated exactly like any other Continuity conflict: surfaced, reviewed, resolved by the creator. This keeps generation-time behavior consistent with every other conflict workflow in this document — no special-casing for image generation just because it happens at a different stage of the pipeline.

---

## 7. Design principles

```text
Suggest → Review → Approve
Creator owns truth.
Canon is authoritative until reviewed.
Continuity is visible. Canon is hidden.
The system defaults. It never decides.
```

---

## Explicitly out of scope for this document

- **Timeline conflict resolution** — deferred to future phases (Continuity V1 Tier 3 and beyond). Not a precedence question; a much harder reasoning problem and not part of this design.
- **Fact lifecycle audit / recoverability** — deferred; not relevant pre-launch with no real user data at stake.
- **Omitted-facet UI treatment** — deferred; not relevant without a live UI surfacing it yet.

---

## Status

This document is a **prerequisite for Continuity V1**, not a replacement for it. Continuity V1 should now be written assuming:

- Scope precedence is fixed (Section 2)
- Canon-wins-provisionally is the default assembly behavior (Section 1)
- Identity violations are a defined alert type, not an open question (Sections 3, 4, 6)

```text
Canon V1
↓
Canon Scope Precedence (this document)
↓
Continuity V1
↓
Project Workspace V1
```

---

## Document map

| Document | Role |
|----------|------|
| [CANON_V1_SCHEMA.md](./CANON_V1_SCHEMA.md) | Hidden Canon layer |
| **This document** | Scope precedence & provisional resolution |
| Continuity V1 *(next)* | Visible alerts derived from this doc |
| [PROJECT_WORKSPACE_V1.md](./PROJECT_WORKSPACE_V1.md) | Project command center UI |
