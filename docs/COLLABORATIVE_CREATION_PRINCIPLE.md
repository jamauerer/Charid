# Collaborative Creation Principle

**Status:** Official governing product principle (subordinate to north star and V3)  
**Date:** 2026-06-14  
**Authority:** [CHARID_NORTH_STAR_V1.md](./CHARID_NORTH_STAR_V1.md) · [CHARID_VISION_V3.md](./CHARID_VISION_V3.md)  
**Related:** [AI_CREATION_CONTROL_PRINCIPLE.md](./AI_CREATION_CONTROL_PRINCIPLE.md) · [FINISHED_CREATIVE_WORK_PRINCIPLE.md](./FINISHED_CREATIVE_WORK_PRINCIPLE.md) · [PRESERVE_INTENT_PRINCIPLE.md](./PRESERVE_INTENT_PRINCIPLE.md) · [PROJECT_UX_PROPOSAL.md](./PROJECT_UX_PROPOSAL.md) · [SCENE_ARCHITECTURE_V2.md](./SCENE_ARCHITECTURE_V2.md)

---

## The principle

**CharID is not a generator.**

**CharID is a creative collaborator.**

When a creator is uncertain — starting fresh, stuck mid-project, or exploring an idea — CharID may **propose** structure, content, and layout. The creator **always** decides what becomes canon.

Collaboration means **suggesting and organizing**, not **deciding and committing**.

---

## What CharID may propose

For any creator uncertainty, CharID may propose drafts across the full creative stack:

| Domain | Examples |
|--------|----------|
| **Project structures** | Work container, intent, suggested title |
| **Stories** | Title, arc, summary, format |
| **Chapters** | Titles, order, prose outline |
| **Scenes** | Beats, cast, place, slug lines |
| **Characters** | Names, roles, appearance notes |
| **Locations** | Named places, types, descriptions |
| **Maps** | Pin suggestions, region labels |
| **Relationships** | Bonds between characters |
| **Comic page layouts** | Panel count, grid, pacing |

Proposals may come from **AI**, **guided flows**, or **templates** — the control model is identical regardless of source.

---

## Required workflow

Every proposal follows the same pipeline:

```
Suggest → Review → Edit → Approve → Commit
```

| Step | Meaning | System rule |
|------|---------|-------------|
| **Suggest** | CharID offers a draft — structure, text, layout, or image | Stored as **proposal** or staging state until approved |
| **Review** | Creator sees the full suggestion in context | No hidden fields; no partial commits |
| **Edit** | Creator changes any part manually | Edits are first-class; not “fix AI mistakes” only |
| **Approve** | Creator explicitly accepts a unit into canon | Approval is intentional, per meaningful unit |
| **Commit** | Approved content writes to normal tables | Same schema as manual creation |

**Nothing becomes canon automatically.**

---

## Creator authority

Creators remain the **final authority** on every proposal:

| Choice | Supported |
|--------|-----------|
| **Accept everything** | Bulk approve after review (explicit action) |
| **Edit everything** | Any field editable before or after approve |
| **Reject everything** | Discard proposal; no orphan canon rows |
| **Create manually from scratch** | Full manual path; collaboration optional |

AI may **organize** and **recommend**. It may not **override** or **finalize**.

---

## One architecture, variable assistance

The **same workflow** must support:

| Creator | Typical session | Assistance level |
|---------|-----------------|------------------|
| **Child (~10)** | Comic in an afternoon | Heavy suggest — simple review UI, big approve buttons |
| **Hobbyist** | Illustrated story over weeks | Mixed — outline suggest, manual art |
| **Professional** | Multi-book franchise over years | Light touch — manual canon, AI for turnarounds or batch layout when chosen |

**The architecture remains shared; only the level of assistance changes.**

- Same tables, bibles, reference graph, and context packets  
- Same Project → Story → Scene → output chain  
- No separate “kids app” or “pro app”  
- No forked schema for AI-assisted vs manual creators  

Aligns with [FINISHED_CREATIVE_WORK_PRINCIPLE.md](./FINISHED_CREATIVE_WORK_PRINCIPLE.md) dual-audience rule and [AI_CREATION_CONTROL_PRINCIPLE.md](./AI_CREATION_CONTROL_PRINCIPLE.md) three creation styles.

---

## Proposal vs canon

| State | Creator sees | Persistence |
|-------|--------------|-------------|
| **Proposal** | “Suggested” badge, review panel, diff or preview | Staging buffer, draft rows, or JSON job result — **not** public portfolio |
| **Canon** | Normal workspace objects | Committed rows after Approve → Commit |

Regenerate, remove, and scoped retry apply **within** the proposal phase or to approved units without wiping unrelated work ([AI_CREATION_CONTROL_PRINCIPLE.md](./AI_CREATION_CONTROL_PRINCIPLE.md)).

---

## What CharID must not do

| Anti-pattern | Violation |
|--------------|-----------|
| Auto-commit AI or template output | Skips Review → Approve |
| “Your comic is done” without per-unit approval | Generator, not collaborator |
| Hide proposed content until after commit | Skips Review |
| Force collaboration path to create | Manual-from-scratch must stay equal |
| Separate canon store for AI users | Breaks shared architecture |
| Overwrite manual work on bulk regenerate | Creator authority |

---

## UX implications

| Surface | Collaborator behavior | Manual escape hatch |
|---------|----------------------|---------------------|
| **Start New Project** | “Describe My Idea” → proposed structure | Story / Character / World / Artwork manual starts |
| **Story workspace** | “Suggest outline” → proposed scenes/chapters | Add scene/chapter by hand |
| **Scene workspace** | Suggest cast, location, beat | Empty scene, fill manually |
| **Comic** | Suggest page layout | Blank page, drag panels |
| **Empty states** | “Not sure? Describe your idea” | “Start blank” — **equal prominence** |
| **Missing cover / portrait** | Generate with grouped references panel | Upload · Use Existing · Generate · Skip — [GENERATE_COVER_WORKFLOW_V1.md](./GENERATE_COVER_WORKFLOW_V1.md) |

Collaboration is **secondary and optional** in entry UX — never the only path ([PROJECT_UX_PROPOSAL.md](./PROJECT_UX_PROPOSAL.md)).

---

## Architecture implications

| Requirement | Implementation direction |
|-------------|-------------------------|
| Proposal staging | Job result → review UI → transactional commit |
| Scoped approve | Per entity: character, scene, panel, relationship |
| Source metadata | Optional `source: manual \| proposed \| generated` for analytics — not creator jargon |
| Context on suggest | Proposals use approved canon only — continuity stack unchanged |
| Scene-first chain | Proposals target same objects as [SCENE_ARCHITECTURE_V2.md](./SCENE_ARCHITECTURE_V2.md) |

---

## Relationship to other principles

| Principle | Role |
|-----------|------|
| **North Star** | CharID is a Creator OS, not a generator — this principle operationalizes that |
| **Finished creative work** | Collaboration serves **finish**, not asset accumulation |
| **AI creation control** | AI-specific rules (regenerate scope, credits, providers) **implement** this principle for AI |
| **Preserve intent** | On approved generation, preserve creator composition — [PRESERVE_INTENT_PRINCIPLE.md](./PRESERVE_INTENT_PRINCIPLE.md) |
| **Collaborative creation (this doc)** | Governing model for **all** proposals — AI, guided, or template |

When AI-specific detail conflicts, **this principle wins on creator authority**; [AI_CREATION_CONTROL_PRINCIPLE.md](./AI_CREATION_CONTROL_PRINCIPLE.md) wins on provider and credit mechanics.

---

## Decision test

*Does this feature let the creator **review, edit, approve, or reject** every proposed unit before it becomes canon — with a clear manual alternative?*

If anything commits without explicit approval, or manual creation is demoted, the feature violates this principle.

---

## Document index

| Doc | Role |
|-----|------|
| [CHARID_NORTH_STAR_V1.md](./CHARID_NORTH_STAR_V1.md) | Why CharID exists |
| [CHARID_VISION_V3.md](./CHARID_VISION_V3.md) | Product structure and UX philosophy |
| [AI_CREATION_CONTROL_PRINCIPLE.md](./AI_CREATION_CONTROL_PRINCIPLE.md) | AI implementation of collaborative creation |
| [FINISHED_CREATIVE_WORK_PRINCIPLE.md](./FINISHED_CREATIVE_WORK_PRINCIPLE.md) | Finish-first · dual audience |
| [PROJECT_UX_PROPOSAL.md](./PROJECT_UX_PROPOSAL.md) | “Describe My Idea” as optional collaborator entry |
| [SCENE_ARCHITECTURE_V2.md](./SCENE_ARCHITECTURE_V2.md) | Scene as proposal/commit unit |
| [SCENE_IMPLEMENTATION_DIRECTIVES.md](./SCENE_IMPLEMENTATION_DIRECTIVES.md) | Binding S1 rules + Giant Wave test |
| [GENERATE_COVER_WORKFLOW_V1.md](./GENERATE_COVER_WORKFLOW_V1.md) | Upload · Use Existing · Generate · Skip for missing visuals |

---

## Version

| Version | Date | Notes |
|---------|------|-------|
| 1.0 | 2026-06-14 | Initial governing principle — Suggest → Review → Edit → Approve → Commit; shared architecture, variable assistance |
