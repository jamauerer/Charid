# AI Creation Control Principle

**Status:** Official product principle (subordinate to V3) — **implements** [COLLABORATIVE_CREATION_PRINCIPLE.md](./COLLABORATIVE_CREATION_PRINCIPLE.md) for AI  
**Date:** 2026-06-14  
**Authority:** [CHARID_VISION_V3.md](./CHARID_VISION_V3.md)  
**Related:** [COLLABORATIVE_CREATION_PRINCIPLE.md](./COLLABORATIVE_CREATION_PRINCIPLE.md) · [FINISHED_CREATIVE_WORK_PRINCIPLE.md](./FINISHED_CREATIVE_WORK_PRINCIPLE.md) · [PRESERVE_INTENT_PRINCIPLE.md](./PRESERVE_INTENT_PRINCIPLE.md) · [AI_PROVIDER_ARCHITECTURE.md](./AI_PROVIDER_ARCHITECTURE.md) · [ARCHITECTURE_COMPATIBILITY_REPORT.md](./ARCHITECTURE_COMPATIBILITY_REPORT.md)

---

## The principle

**AI accelerates creation. AI never reduces creator control.**

CharID is not a one-shot generator. It is a creator operating system where AI may **propose** structure and content — and the creator **always** decides what stays.

---

## One architecture, three creation styles

CharID supports multiple creation styles using the **same underlying architecture** (bibles, reference graph, context packets, Projects, Stories, Characters, Worlds, Relationships, Scenes, Assets). There is **no separate beginner product** and **no separate professional product**.

| Style | Who uses it | What happens |
|-------|-------------|--------------|
| **1. Manual** | Professionals, detail-oriented creators, children drawing their own art | Every object created by hand; AI optional or unused |
| **2. AI starting point** | Fast starters, prompt-first creators | AI assembles structure from description; creator edits before anything is canon |
| **3. Hybrid** | Most creators over time | Some entities manual, some AI-assisted; mix per object or per scene |

All three paths read and write the **same tables**, **same bibles**, **same continuity layer**. Entry point differs; architecture does not.

---

## Dual audience, shared architecture

| Creator | Typical entry | Same architecture |
|---------|---------------|-------------------|
| **Child (~10)** | Template + optional AI assist for names/plot; manual panel art | Project → Story → Characters → Comic → Publish |
| **Professional** | Manual bible entry, manual refs; AI for turnarounds or batch panels only when chosen | Same hierarchy, full depth |

A child creates a comic in an afternoon. A professional builds every detail manually. **Both workflows coexist** — different entry points, not different backends.

Aligns with V3 Design Principle 0 ([FINISHED_CREATIVE_WORK_PRINCIPLE.md](./FINISHED_CREATIVE_WORK_PRINCIPLE.md)).

---

## Structure before generation

AI may help **before** images, pages, or media are generated. A creator can describe in **one prompt** (or a guided flow):

- World
- Characters
- Relationships
- Assets
- Story
- Scenes

CharID may **assemble a proposed structure** — no content generation required in this phase:

| Proposed object | Examples |
|-----------------|----------|
| **Project** | Universe container |
| **World** | Setting, rules sketch |
| **Characters** | Names, roles, appearance notes |
| **Relationships** | Friend, mentor, rival, daemon, family bonds |
| **Assets** | Sword, amulet, vehicle, artifact |
| **Story** | Title, arc summary |
| **Chapter outline** | Chapter titles and order |
| **Scene outline** | Beats per chapter: cast, location, event |

This assembly writes to the **same schema** manual creation uses. It is a **draft proposal**, not published canon.

### Creator control actions (required for every AI-assisted step)

After any AI assembly or generation, the creator must be able to:

| Action | Meaning |
|--------|---------|
| **Review** | See full proposed structure before commit |
| **Approve** | Accept object or section into canon |
| **Edit** | Change any field manually |
| **Remove** | Delete proposed or generated piece |
| **Regenerate** | Retry AI for that piece only — without overwriting unrelated work |

**No silent commits.** No “AI finished your comic” without explicit approval per meaningful unit (character, scene, panel, etc.).

---

## What AI must not do

| Anti-pattern | Why forbidden |
|--------------|---------------|
| Auto-publish AI output | Creator loses control of public canon |
| Replace bibles/graph with opaque model state | Breaks continuity architecture |
| Force AI path for child or pro | Manual path must remain first-class |
| One-shot prompt → finished comic with no edit step | Vending machine, not Creator OS |
| Separate “simple” schema for AI users | Forks architecture; violates dual-audience principle |
| Overwrite manual work on regenerate | Regenerate must be scoped to selected entity |

---

## What AI may do

| Capability | Control preserved |
|------------|-------------------|
| Propose project/world/story/scene **structure** from text | Creator approves each layer |
| Generate **starting** character/world/story bible fields | Editable; stored in same bible tables |
| Generate reference images after structure approved | Credit-gated; slot assignment suggested, not forced; **Preserve Intent** on creator uploads ([PRESERVE_INTENT_PRINCIPLE.md](./PRESERVE_INTENT_PRINCIPLE.md)) |
| Generate panel/page art from approved scene + refs | Per-panel approve/regenerate/remove; layout and composition preserved |
| Enhance sketch → refined asset | Default Preserve Intent mode; Redesign requires explicit opt-in |
| Suggest chapter/scene order | Outline only until creator confirms |

AI uses **context packets** assembled from approved canon — never bypasses the continuity stack ([ARCHITECTURE_COMPATIBILITY_REPORT.md](./ARCHITECTURE_COMPATIBILITY_REPORT.md)).

---

## UX implications (planning)

| Surface | Manual path | AI path |
|---------|-------------|---------|
| **Create modal** | Character · World · Story · … (existing) | “Start from an idea” → structure assembly → review |
| **Story page** | Add character, write plan, build pages by hand | “Suggest outline” → review scenes → edit |
| **Character page** | Upload / draw references | “Generate look” after identity approved |
| **Empty states** | “Create manually” | “Describe your idea” — equal prominence, not default-only AI |

**Entry points differ; destination is the same workspace.**

---

## Relationship to other principles

| Principle | Interaction |
|-------------|-------------|
| **Finished creative work** | AI serves finish (panels, covers), never replaces finish workflow |
| **Dual audience** | AI optional for child; manual path for pro — same product |
| **Continuity architecture** | AI reads/writes bibles and graphs — does not replace them |
| **Credit gating** | AI costs credits; manual creation does not |
| **Not an AI generator** | No homepage prompt box; AI inside workspaces after structure review |
| **Preserve Intent** | AI improves execution; preserves composition, layout, silhouette — [PRESERVE_INTENT_PRINCIPLE.md](./PRESERVE_INTENT_PRINCIPLE.md) |

---

## Decision test

*Does this feature let the creator **review, approve, edit, remove, or regenerate** every AI-influenced part — or does it take control away to save clicks?*

If control is reduced, the feature violates this principle regardless of how fast it feels.

---

## Implementation notes (future — not in scope now)

- **Structure assembly** job type: LLM → validated JSON → staging UI → user approve → insert into normal tables
- **Regenerate** must target `entity_id` + `field` or scoped generation job — never full-project overwrite
- **Audit trail**: optional `source: manual | ai_proposed | ai_generated` on rows for founder analytics — not shown to creators as jargon
- Phase 5 AI in [MONETIZATION_AND_AI_ROADMAP.md](./MONETIZATION_AND_AI_ROADMAP.md) ships **after** approve/edit UX is designed

---

## Document index

| Doc | Role |
|-----|------|
| [COLLABORATIVE_CREATION_PRINCIPLE.md](./COLLABORATIVE_CREATION_PRINCIPLE.md) | Governing collaborator workflow |
| [CHARID_VISION_V3.md](./CHARID_VISION_V3.md) | Governing vision · AI philosophy |
| [AI_PROVIDER_ARCHITECTURE.md](./AI_PROVIDER_ARCHITECTURE.md) | Provider routing · outcome actions |
| [FINISHED_CREATIVE_WORK_PRINCIPLE.md](./FINISHED_CREATIVE_WORK_PRINCIPLE.md) | Finish-first · dual audience |
| [PRESERVE_INTENT_PRINCIPLE.md](./PRESERVE_INTENT_PRINCIPLE.md) | Preserve Intent · Improve Execution |
| [MONETIZATION_AND_AI_ROADMAP.md](./MONETIZATION_AND_AI_ROADMAP.md) | Credit gates · AI phases |

---

## Version

| Version | Date | Notes |
|---------|------|-------|
| 1.0 | 2026-06-14 | Initial principle — three creation styles, structure-before-generation, creator control actions |
| 1.1 | 2026-06-14 | Preserve Intent cross-ref · enhancement vs redesign |
