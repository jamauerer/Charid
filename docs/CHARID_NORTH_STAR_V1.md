# CharID North Star V1

**Status:** Highest-level product vision — **north star for all decisions**  
**Date:** 2026-06-14  
**Version:** 1.0  

**This document does not replace existing vision documents.** It sits **above** them and explains what CharID ultimately is. Detailed product authority remains [CHARID_VISION_V3.md](./CHARID_VISION_V3.md). Principles, phases, and architecture plans are **subordinate** to this north star and must align with it.

---

## Document hierarchy

```
CHARID_NORTH_STAR_V1.md          ← You are here — why CharID exists
        │
        ▼
CHARID_VISION_V3.md              ← What we build — IA, objects, UX philosophy
        │
        ├── FINISHED_CREATIVE_WORK_PRINCIPLE.md
        ├── COLLABORATIVE_CREATION_PRINCIPLE.md
        ├── GENERATE_COVER_WORKFLOW_V1.md
        ├── AI_CREATION_CONTROL_PRINCIPLE.md
        ├── PRESERVE_INTENT_PRINCIPLE.md
        ├── IMPLEMENTATION_PHASES_V3.md
        └── … (architecture, workspace, classification plans)
```

| Question | Document |
|----------|----------|
| **What is CharID ultimately?** | This document |
| **How is it structured and shipped?** | [CHARID_VISION_V3.md](./CHARID_VISION_V3.md) |
| **In what order do we build?** | [IMPLEMENTATION_PHASES_V3.md](./IMPLEMENTATION_PHASES_V3.md) |

---

## Core vision

CharID exists to help creators **realize their vision in professional quality** without losing **ownership**, **control**, or **creative intent**.

| CharID is | CharID is not |
|-----------|---------------|
| A **Creator Operating System** | An AI generator |
| A place to **finish and share** work | A prompt vending machine |
| A system that **remembers** your canon | A disposable image tool |

**The creator's finished work and universe are the product.** AI is a tool inside the platform.

---

## The creator spectrum

The **same architecture** must support:

| Creator | Example outcome |
|---------|-----------------|
| **Child (~10)** | A dragon comic in one afternoon |
| **Hobbyist** | A graphic novel over weeks |
| **Professional** | A multi-world franchise over years |

These are **not separate products**. They are **different entry points** into the same creative system.

**Emergent complexity:** Simple on day one. Depth when needed. One workflow from child to professional ([FINISHED_CREATIVE_WORK_PRINCIPLE.md](./FINISHED_CREATIVE_WORK_PRINCIPLE.md)).

---

## Product promise

A creator should be able to go from:

```
Idea → Creation → Finished Work → Publishing → Discovery
```

**without leaving CharID.**

| Stage | Creator feels |
|-------|---------------|
| **Idea** | “I want to make something” |
| **Creation** | Characters, worlds, stories come alive |
| **Finished work** | Comic, novel, illustrated book — complete inside the platform |
| **Publishing** | The world can see it |
| **Discovery** | Others find finished work worth reading |

Canonical build order: [IMPLEMENTATION_PHASES_V3.md](./IMPLEMENTATION_PHASES_V3.md) — workflow and finished outputs before AI monetization at scale.

---

## AI philosophy

**AI is a creative assistant. AI is not the creator.**

### AI may

| Capability | Examples |
|------------|----------|
| **Suggest** | Names, outlines, scene beats |
| **Organize** | Structure from description — draft only |
| **Enhance** | Sketch → refined illustration |
| **Refine** | Line quality, lighting, texture |
| **Accelerate** | Turnarounds, panel polish, batch tasks |

### AI may not

| Anti-pattern | Why |
|--------------|-----|
| **Override creator decisions** | Creator is creative director |
| **Redefine canon** | Approved work stays canon until creator changes it |
| **Substantially redesign** creator work without permission | Violates creative intent |

**Governing AI principles:**

- [AI_CREATION_CONTROL_PRINCIPLE.md](./AI_CREATION_CONTROL_PRINCIPLE.md) — review, approve, edit, remove, regenerate
- [PRESERVE_INTENT_PRINCIPLE.md](./PRESERVE_INTENT_PRINCIPLE.md) — Preserve Intent · Improve Execution

---

## Creator control

Creators always own **creative direction**.

Every AI-generated or AI-assisted result must support:

| Action | Meaning |
|--------|---------|
| **Approve** | Accept into canon |
| **Edit** | Change any field manually |
| **Regenerate** | Retry scoped to this piece only |
| **Reject** | Discard — keep original |

**The creator remains the creative director.** No silent commits. No “AI finished your comic.”

---

## Preserve intent

CharID should **improve execution** while **preserving vision**.

| Creator input | CharID enhancement |
|---------------|-------------------|
| Child sketch | Professional illustration — still *their* character |
| Hand-drawn map | Professional map — same landmarks |
| Comic layout | Professional comic page — same panel structure |

**The creator's idea remains recognizable.** A child's drawing stays recognizably theirs after enhancement.

Full principle: [PRESERVE_INTENT_PRINCIPLE.md](./PRESERVE_INTENT_PRINCIPLE.md).

---

## Simplicity first

A child should be able to create:

```
Character → Story → Comic → Publish
```

with **minimal friction**.

| Rule | Detail |
|------|--------|
| **No required jargon** | No “bible”, “graph”, or “archetype” on default paths |
| **Visual first** | Pictures before metadata |
| **What's next** | Every workspace answers the next step |
| **Advanced optional** | Depth available — never required on day one |

Child benchmark: [FINISHED_CREATIVE_WORK_PRINCIPLE.md](./FINISHED_CREATIVE_WORK_PRINCIPLE.md) · [PROTECTED_CREATOR_MODE_V1.md](./PROTECTED_CREATOR_MODE_V1.md) (future independent use).

---

## Professional depth

Professional creators should build without hitting architectural limits:

```
Projects
 → Worlds
 → Locations
 → Characters
 → Relationships
 → Assets
 → Stories
 → Scenes
 → Comics
 → Publishing
```

Same objects. Same continuity layer. Greater scale.

References: [PROJECT_CENTERED_INFORMATION_ARCHITECTURE.md](./PROJECT_CENTERED_INFORMATION_ARCHITECTURE.md) · [CHARACTER_RELATIONSHIPS_V1.md](./CHARACTER_RELATIONSHIPS_V1.md) · [SCENE_ARCHITECTURE_V1.md](./SCENE_ARCHITECTURE_V1.md) · [ASSET_SYSTEM_V1.md](./ASSET_SYSTEM_V1.md).

---

## Continuity

**Continuity is a platform capability.** Creators should experience:

> **“CharID remembers.”**

The following remain **internal architecture** — powerful underneath, hidden by default:

| Internal system | Creator experience |
|-----------------|-------------------|
| Character Bible | Character details |
| World Bible | World details |
| Story Bible | Story plan |
| Reference Graph | *(automatic)* |
| Context Packet | *(automatic)* |

Continuity supports finished work — it must **not dominate** the creator experience ([ARCHITECTURE_COMPATIBILITY_REPORT.md](./ARCHITECTURE_COMPATIBILITY_REPORT.md)).

---

## Visual first

Creators think **visually**.

Prioritize on every workspace:

| Surface | Examples |
|---------|------------|
| **Images** | Portraits, references, covers |
| **Galleries** | Character gallery, world gallery |
| **Maps** | World maps — optional, first-class |
| **Mood boards** | Tone and atmosphere |

**Before** advanced metadata, consistency scores, and analytics.

Workspace plans: [CHARACTER_WORKSPACE_V2.md](./CHARACTER_WORKSPACE_V2.md) · [WORLD_WORKSPACE_V2.md](./WORLD_WORKSPACE_V2.md).

---

## Worlds are places

Worlds should feel **explorable** — not like database records.

Future world experience includes:

| Element | Purpose |
|---------|---------|
| **Cover images** | Identity at a glance |
| **Maps** | Geography — static now, interactive later |
| **Mood boards** | Atmosphere |
| **Locations** | Forest, village, castle — named places |

**Worlds are places, not records.**

Stories and worlds relate **many-to-many** — a story may span Oxford, Cittàgazze, and beyond ([PROJECT_CENTERED_INFORMATION_ARCHITECTURE.md](./PROJECT_CENTERED_INFORMATION_ARCHITECTURE.md)).

---

## Stories are finished works

Stories should guide creators toward **completion**.

The platform must answer at every stage:

> **“What should I do next?”**

Examples: Add first chapter · Continue story · Add characters · Ready to create your comic · Ready to share.

Shipped direction: [PHASE_A1_IMPLEMENTATION_REPORT.md](./PHASE_A1_IMPLEMENTATION_REPORT.md) · [PHASE_A_IMPLEMENTATION_PLAN.md](./PHASE_A_IMPLEMENTATION_PLAN.md).

Creator-facing spine:

```
Idea → Story → Create → Finish
```

---

## Relationships matter

Characters are defined not only by **traits** but by **relationships**.

Future architecture includes typed bonds:

Friend · Enemy · Family · Mentor · Companion · Daemon · Custom · …

Relationships become **continuity-aware context** for scenes, stories, and future AI — without replacing character identity fields.

Full plan: [CHARACTER_RELATIONSHIPS_V1.md](./CHARACTER_RELATIONSHIPS_V1.md).

---

## Protected Creator Mode

Children should use CharID **safely and independently** (future).

Safety applies across:

```
Creation → Discovery → Publishing → Monetization → Social interaction
```

Not generation alone.

Full vision: [PROTECTED_CREATOR_MODE_V1.md](./PROTECTED_CREATOR_MODE_V1.md) — evaluated after comics, publishing, portfolio reader, and Explore.

---

## Long-term goal

### Success is not

How much content AI generated.

### Success is

**How many creators finished and shared work they are proud of.**

| Metric that matters | Metric that does not |
|--------------------|----------------------|
| Finished comics published | Raw image generation count |
| Creators who complete a story arc | Asset accumulation without finish |
| Portfolio shares that creators are proud of | Prompt volume |

Aligns with [FINISHED_CREATIVE_WORK_PRINCIPLE.md](./FINISHED_CREATIVE_WORK_PRINCIPLE.md).

---

## Decision test

Before approving **any feature**, ask:

| # | Question | If no → |
|---|----------|---------|
| 1 | Does this **increase creator control**? | Reconsider |
| 2 | Does this help creators **finish work**? | Reconsider |
| 3 | Does this **preserve creative intent**? | Reconsider |
| 4 | Is it **understandable to a child**? | Simplify or hide |
| 5 | Does it still **support professional creators**? | Reconsider |

**All five should be yes** — or the feature needs redesign, deferral, or an explicit advanced-only path that does not block the child benchmark.

---

## Quick reference — north star vs detail

| Topic | North star (this doc) | Detail doc |
|-------|----------------------|------------|
| What CharID is | Creator OS · finish · control · intent | [CHARID_VISION_V3.md](./CHARID_VISION_V3.md) |
| Finish workflow | Idea → Creation → Finished Work → Publish | [FINISHED_CREATIVE_WORK_PRINCIPLE.md](./FINISHED_CREATIVE_WORK_PRINCIPLE.md) |
| AI control | Approve · edit · regenerate · reject | [AI_CREATION_CONTROL_PRINCIPLE.md](./AI_CREATION_CONTROL_PRINCIPLE.md) |
| AI enhancement | Preserve Intent · Improve Execution | [PRESERVE_INTENT_PRINCIPLE.md](./PRESERVE_INTENT_PRINCIPLE.md) |
| Build order | A → B → C → D → E → F | [IMPLEMENTATION_PHASES_V3.md](./IMPLEMENTATION_PHASES_V3.md) |
| Character page | Visual first · gallery | [CHARACTER_WORKSPACE_V2.md](./CHARACTER_WORKSPACE_V2.md) |
| World page | Places · maps · locations | [WORLD_WORKSPACE_V2.md](./WORLD_WORKSPACE_V2.md) |
| Safety (future) | Independent child use | [PROTECTED_CREATOR_MODE_V1.md](./PROTECTED_CREATOR_MODE_V1.md) |

---

## Version

| Version | Date | Notes |
|---------|------|-------|
| 1.0 | 2026-06-14 | Initial north star — highest-level product vision |
