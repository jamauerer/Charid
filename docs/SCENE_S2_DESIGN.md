# Scene S2 Design — AI Scene Suggestions

**Status:** Design (planning — approve before further build)  
**Date:** 2026-06-14  
**Version:** 1.0  
**Authority:** [AI_CREATION_CONTROL_PRINCIPLE.md](./AI_CREATION_CONTROL_PRINCIPLE.md) · [PRESERVE_INTENT_PRINCIPLE.md](./PRESERVE_INTENT_PRINCIPLE.md) · [COLLABORATIVE_CREATION_PRINCIPLE.md](./COLLABORATIVE_CREATION_PRINCIPLE.md) · [SCENE_ARCHITECTURE_V2.md](./SCENE_ARCHITECTURE_V2.md)  
**Related:** [SCENE_S2_IMPLEMENTATION_REPORT.md](./SCENE_S2_IMPLEMENTATION_REPORT.md) (reference implementation notes)

---

## Purpose

Scene S2 is CharID’s **first AI collaboration feature**. When creators are stuck mid-story, CharID proposes scene beats from existing canon. The creator **always** decides what becomes real.

**Goal:** AI helps creators continue stories — it never takes control.

**Decision test:** Does this feel like a collaborator suggesting ideas at the whiteboard, or like software auto-writing your story?

---

## Governing rules (non-negotiable)

| Rule | Meaning |
|------|---------|
| **No auto-commit** | AI never inserts into `scenes`, `scene_characters`, or any canon table |
| **No background canon** | No cron jobs, webhooks, or silent post-generation writes |
| **No hidden generation** | Every suggestion appears in an explicit review UI before any save |
| **Approve = commit** | Only the Approve action runs the same commit path as manual scene create |
| **Scoped regenerate** | Regenerating one suggestion must not overwrite other suggestions or existing scenes |
| **Canon in, proposals out** | Context is assembled from approved workspace data only — not raw chat history |

These implement [COLLABORATIVE_CREATION_PRINCIPLE.md](./COLLABORATIVE_CREATION_PRINCIPLE.md): **Suggest → Review → Edit → Approve → Commit**.

Preserve Intent ([PRESERVE_INTENT_PRINCIPLE.md](./PRESERVE_INTENT_PRINCIPLE.md)) does **not** apply to text-only outline suggestions — it applies when creator visual artifacts are transformed in later phases.

---

## Where “Need ideas?” appears

### Primary entry points

| Surface | Placement | Creator intent |
|---------|-----------|----------------|
| **Story workspace** | Scenes section, below scene list / empty state | “I’m stuck on what happens next in this story” |
| **Scene workspace** | Below current scene detail | “What could follow *this* moment?” |

Both surfaces show:

1. **Need ideas?** — section label + one-line hint  
2. **Generate scene suggestions** — primary action button  

Manual **Create scene** remains visible and equal — collaboration is optional, never the only path.

### Secondary entry point

| Surface | Placement | Creator intent |
|---------|-----------|----------------|
| **Chapter helper** (when chapters exist) | Below scene suggestions on story page | “Break this chapter into scene beats” |

Triggers the same generation pipeline with **chapter focus** injected into context (chapter title + excerpt). Still requires per-scene Approve.

### Where it must NOT appear (S2)

- Global dashboard or homepage prompt box  
- Project page (organizational only — no story canon)  
- Auto-trigger on story save, login, or idle  
- Post-Approve “CharID added 3 more scenes for you”  

---

## Context assembly

### Design principle

Suggestions use a **Scene Suggestion Context** object — a read-only slice of approved canon, not the full context packet exposed to creators. Internally it may reuse bible assemblers; creators never see “context packet” language.

### Required inputs

| Source | Fields used |
|--------|-------------|
| **Story** | Title, summary, `project_type` (format label) |
| **Story bible** | Summary, themes, tone (when present) |
| **Existing scenes** | Title + summary + sort order (avoid duplicates) |
| **Chapters** | Title + content excerpt (cap ~280 chars each) |
| **Cast** | Character id + name (story roster) |
| **Relationships** | Bond pairs + display labels among roster |
| **Locations** | `world_locations` id + name from linked worlds |
| **World** | Name, description |

### Optional focus (entry-point scoped)

| Trigger | Extra context |
|---------|---------------|
| Scene workspace | Current scene title + summary |
| Chapter helper | Focus chapter title + longer excerpt (~400 chars) |

### Explicit exclusions

- Unapproved AI proposal batches  
- Moderation queue content  
- Private notes marked “advanced” unless in bible canon fields  
- External prompts pasted by user (future “describe what you want” is S2.1 — still staging-only)  

### Context → prompt

Server assembles a structured text block (not shown to creator) containing story/world/cast/scene/chapter facts and instructions:

- Suggest **narrative beats**, not screenplay slug lines or panel layouts  
- Use character names **from the provided list** when possible  
- Use location names **from the provided list** when fitting  
- **Do not duplicate** existing scene titles or repeat the same beat  

---

## How suggestions are generated

### Pipeline

```
Creator clicks "Generate scene suggestions"
        ↓
Assert story owner + cast ≥ 1
        ↓
Assemble Scene Suggestion Context (canon only)
        ↓
LLM structure job OR template fallback
        ↓
Validate JSON (3–8 items, title + summary required)
        ↓
Resolve character names → ids, location names → ids or free text
        ↓
Write creative_proposal_batches (staging) — NOT scenes table
        ↓
Return batch to review UI
```

### Provider (S2)

| Mode | When | Behavior |
|------|------|----------|
| **OpenAI text** | `OPENAI_API_KEY` set | Chat completion, JSON mode, temperature ~0.85 |
| **Template fallback** | No key or LLM failure | Deterministic beats from cast/world (Founder test offline) |

Future: route through [AI_PROVIDER_ARCHITECTURE.md](./AI_PROVIDER_ARCHITECTURE.md) orchestrator with credit reserve — **deferred** until Publishing MVP + Security Audit approved.

### Output shape (per suggestion)

| Field | Required | Notes |
|-------|----------|-------|
| **Title** | Yes | Short scene name, e.g. “Dawn Patrol” |
| **What happens** | Yes | 1–2 sentences, summary field |
| **Characters** | Optional | Resolved to roster ids; default first cast member if unresolved |
| **Location** | Optional | Linked `world_location_id` or free-text `location_label` |

### How many suggestions

| Parameter | Value |
|-----------|-------|
| **Default batch size** | 5 suggestions |
| **Allowed range** | 3–8 |
| **Regenerate one** | Exactly 1 replacement |
| **New generate** | Dismisses prior active batch for same story (one review set at a time) |

### Example (Founder test)

**Story:** How I Surf · **Cast:** Jake · **World:** California Coast  

| Title | What happens |
|-------|--------------|
| Dawn Patrol | Jake arrives before sunrise and sees perfect conditions. |
| The Forecast | News of a large winter swell begins spreading. |
| Meeting a Mentor | An older surfer shares advice. |
| Contest Day | Jake enters his first competition. |

---

## Review UX

### Staging presentation

After generation, suggestions appear in a **staging panel** — visually distinct from canon scene cards:

- **Suggested** badge on each row  
- Copy: “Nothing saves until you approve”  
- Canon scenes above; staging below (same story page)  

Each row shows: **Title · Summary · Character chips · Location · Actions**

### Creator actions

| Action | Scope | Effect |
|--------|-------|--------|
| **Approve** | One item | `commitSceneRecord()` → real `scenes` + `scene_characters`; item marked `approved` in batch |
| **Edit** | One item | Modal (same fields as manual create); updates staging payload only |
| **Delete** | One item | Marks item `discarded`; no canon change |
| **Regenerate** | One pending item | LLM/template replaces that row only; excludes other pending + existing scene titles |
| **Clear all** | Whole batch | Batch `dismissed`; no canon change |

**Nothing else commits.** Closing the browser, refreshing, or navigating away loses nothing in canon (staging may persist in DB until dismissed).

### Bulk approve (explicit deferral)

S2 does **not** include “Approve all.” Bulk accept is a future explicit action requiring a confirmation step — per [AI_CREATION_CONTROL_PRINCIPLE.md](./AI_CREATION_CONTROL_PRINCIPLE.md).

---

## Staging architecture (shared with future features)

Scene S2 establishes the pattern for all AI/guided proposals:

| Concept | S2 value | Future kinds |
|---------|----------|--------------|
| `creative_proposal_batches.proposal_kind` | `scene_suggestion` | `chapter_suggestion`, `character_suggestion`, `location_suggestion`, `cover_suggestion`, `comic_page_suggestion` |
| `items` JSONB | Scene payload | Type-specific payload per kind |
| Item status | `pending` · `approved` · `discarded` | Same |
| Commit | Approve → normal insert | Kind-specific commit handler |

One approval architecture. Scene S2 proves it.

---

## Relationship to manual Scene S1

| Path | Commit moment |
|------|---------------|
| **Manual Create scene** | Creator is the approver — immediate commit on Save |
| **AI suggestion** | Staging until Approve |

Both use the same commit function and schema. Creators should not perceive two different “scene types.”

---

## Error and edge cases

| Case | Behavior |
|------|----------|
| No cast | Block generate; message: add characters first |
| Scenes table missing | Friendly migration message |
| LLM returns invalid JSON | Fall back to template suggestions |
| Approve after edit | Uses latest staging payload |
| Duplicate title on approve | Slug suffix logic (same as manual create) |
| Moderation flag on approved text | Post-commit scan (same as manual save — never blocks approve UI) |

---

## Success criteria (Founder test)

1. **California Coast Surf Stories** → **How I Surf** (Jake in cast)  
2. Generate scene suggestions  
3. Approve some, edit some, delete some, regenerate one  
4. Confirm: canon scene count increases **only** after Approve  
5. Confirm: workflow feels collaborative, not controlling  

**Child test (qualitative):** A 10-year-old understands that gray “Suggested” cards are ideas, and green/canonical cards are their real story.

---

## Explicitly out of scope (S2)

- Credit gating / billing  
- “Describe what you want” freeform prompt field  
- Chapter/character/location suggestion kinds (same architecture, different phase)  
- Auto-suggest on empty scene list  
- Scene images, comic panels, publishing  
- Screenplay-specific suggestion fields  

---

## Document index

| Doc | Role |
|-----|------|
| [SCENE_ARCHITECTURE_V2.md](./SCENE_ARCHITECTURE_V2.md) | Scene model + AI collaboration section |
| [COLLABORATIVE_CREATION_PRINCIPLE.md](./COLLABORATIVE_CREATION_PRINCIPLE.md) | Suggest → Review → Approve → Commit |
| [AI_CREATION_CONTROL_PRINCIPLE.md](./AI_CREATION_CONTROL_PRINCIPLE.md) | Control actions, no silent commits |
| [PUBLISHING_MVP_ARCHITECTURE.md](./PUBLISHING_MVP_ARCHITECTURE.md) | Next gate after Scene S2 |
| [FINISHED_WORK_ARCHITECTURE.md](./FINISHED_WORK_ARCHITECTURE.md) | Bridge to publish |

---

## Version

| Version | Date | Notes |
|---------|------|-------|
| 1.0 | 2026-06-14 | Initial Scene S2 design — entry points, context, generation, review, staging architecture |
