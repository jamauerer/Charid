# Preserve Intent Principle

**Status:** Official AI philosophy (subordinate to V3)  
**Date:** 2026-06-14  
**Version:** 1.0  
**Authority:** [CHARID_VISION_V3.md](./CHARID_VISION_V3.md)  
**Related:** [AI_CREATION_CONTROL_PRINCIPLE.md](./AI_CREATION_CONTROL_PRINCIPLE.md) · [FINISHED_CREATIVE_WORK_PRINCIPLE.md](./FINISHED_CREATIVE_WORK_PRINCIPLE.md) · [AI_PROVIDER_ARCHITECTURE.md](./AI_PROVIDER_ARCHITECTURE.md) · [PROTECTED_CREATOR_MODE_V1.md](./PROTECTED_CREATOR_MODE_V1.md)

---

## The principle

**Preserve Intent. Improve Execution.**

AI should **enhance** creator work — not **replace** creator decisions.

When a creator provides a sketch, layout, or reference, CharID AI treats it as **authoritative intent**. The model may raise rendering quality; it may not silently redesign what the creator meant.

| Input (creator intent) | Output (AI enhancement) |
|------------------------|-------------------------|
| Character sketch | Refined character — same pose, same identity |
| Map sketch | Refined world map — same geography, same landmarks |
| Comic layout | Professional comic page — same panel structure |
| Building sketch | Finished environment concept — same composition |
| Vehicle sketch | Production concept — same silhouette and design |

**One rule for everyone.** Child creators and professional creators follow the same standard. A child's drawing must remain **recognizably their drawing** after enhancement.

This is a **governing AI principle** for the platform — alongside [AI_CREATION_CONTROL_PRINCIPLE.md](./AI_CREATION_CONTROL_PRINCIPLE.md) (control) and [FINISHED_CREATIVE_WORK_PRINCIPLE.md](./FINISHED_CREATIVE_WORK_PRINCIPLE.md) (finish-first).

---

## What AI must preserve

When enhancing existing creator input, AI must preserve:

| Dimension | Meaning |
|-----------|---------|
| **Composition** | Framing, focal point, visual balance |
| **Layout** | Panel grid, page structure, spatial arrangement |
| **Colors** | Palette and color relationships — when possible |
| **Silhouette** | Readable shape identity at a glance |
| **Creator-defined landmarks** | Named places, map features, architectural anchors |
| **Creator-defined character traits** | Identity, costume, proportions, distinguishing features from bible + refs |

**Default mode:** img2img / control-net / reference-conditioned generation that **conditions on** creator assets — not text-only regeneration that ignores them.

---

## What AI may improve

AI may improve **execution quality** without changing **creative intent**:

| Dimension | Examples |
|-----------|----------|
| **Rendering quality** | Resolution, polish, finish |
| **Lighting** | Shading, atmosphere, time of day |
| **Anatomy** | Proportions, hands, faces — within preserved pose |
| **Texture** | Materials, surface detail |
| **Line quality** | Clean-up, ink weight, consistency |
| **Consistency** | Match to approved reference graph across panels |

Improvement means **better craft**, not **different art direction**.

---

## What AI must not do (without explicit request)

| Anti-pattern | Violation |
|--------------|-----------|
| Substantially redesign character appearance | Replaces intent |
| Move or remove map landmarks | Breaks creator geography |
| Change panel count or reading order | Replaces layout intent |
| Swap color palette to unrelated scheme | Breaks color preservation |
| Replace child's stick figure with unrelated photorealistic character | Child drawing no longer recognizable |
| Auto-apply “style transfer” to different genre | Redesign unless creator opts in |

**Explicit request required** for any operation labeled **Redesign**, **Reimagine**, or **New direction** — separate from **Enhance** or **Refine**.

---

## Scope — where this applies

Preserve Intent governs all AI that **transforms** creator-provided visual or structural input:

| Domain | Preserve | Improve |
|--------|----------|---------|
| **Characters** | Silhouette, traits, refs | Rendering, anatomy cleanup, turnaround consistency |
| **Worlds** | Mood, architecture identity | Atmosphere, detail, lighting |
| **Maps** | Layout, landmarks, regions | Line quality, labels, texture |
| **Assets** | Shape, design language | Materials, production polish |
| **Scenes** | Blocking, cast placement | Rendering, continuity with refs |
| **Comics** | Panel layout, composition | Ink, color, lettering polish |
| **Storyboards** | Shot framing, sequence | Line quality, clarity |

Structure-only AI (outline proposals, name suggestions) follows [AI_CREATION_CONTROL_PRINCIPLE.md](./AI_CREATION_CONTROL_PRINCIPLE.md). **Preserve Intent** applies when **creator artifacts** are the input.

---

## Dual audience — same rule

| Creator | Example | Preserve Intent outcome |
|---------|---------|-------------------------|
| **Child (~10)** | Crayon character on paper → phone photo upload | Enhanced but still *their* character — same smile, same cape |
| **Hobbyist** | Rough map with labeled forest and village | Cleaner map — forest and village in same places |
| **Professional** | Thumbnail storyboard → production frame | Same shot size and angle — higher finish |

No “child mode” that secretly redesigns. No “pro mode” that skips preservation. **Enhance** vs **Redesign** is a creator choice, not a tier feature.

---

## UX implications (planning)

### Action labels (creator-facing)

| Action | Behavior |
|--------|----------|
| **Enhance** / **Refine** | Preserve Intent — default for sketch → finished |
| **Clean up lines** | Preserve composition + silhouette |
| **Improve quality** | Preserve layout + colors when possible |
| **Redesign** | Explicit opt-in — may change intent; requires confirmation |

Never label a Preserve-Intent job as “Generate new version” without showing side-by-side intent vs output.

### Review flow

1. Creator provides input (upload, sketch, layout)
2. AI proposes enhancement — **preview before replace**
3. Creator: **Accept · Edit · Regenerate · Keep original**
4. Accepted output writes to slot — original retained in history when feasible

Aligns with approve / edit / remove / regenerate from [AI_CREATION_CONTROL_PRINCIPLE.md](./AI_CREATION_CONTROL_PRINCIPLE.md).

### Side-by-side test

Founder and creator QA for any enhancement feature:

> *Would the creator recognize this as their work?*

If no — the feature violates Preserve Intent.

---

## Technical implications (planning)

| Requirement | Direction |
|-------------|-----------|
| **Input conditioning** | Creator image/layout required for enhancement jobs — not optional |
| **Control signals** | Composition, pose, edge, depth, or layout controls per job type |
| **Context packet** | Include creator traits, landmarks, relationships — intent metadata |
| **Job types** | `enhance` (preserve) vs `redesign` (explicit) — separate API paths |
| **Provider routing** | [AI_PROVIDER_ARCHITECTURE.md](./AI_PROVIDER_ARCHITECTURE.md) — route by outcome + preserve flag |
| **Audit** | Store source asset id on generated output — trace intent chain |
| **Moderation** | [PROTECTED_CREATOR_MODE_V1.md](./PROTECTED_CREATOR_MODE_V1.md) — policy layer independent of preserve |

---

## Relationship to other principles

| Principle | Interaction |
|-----------|-------------|
| **AI Creation Control** | Control = *who decides*; Preserve Intent = *what changes* when AI runs |
| **Finished creative work** | Enhancement serves finish — sketch → page — without replacing creator vision |
| **Dual audience** | Same preserve rule; child drawings sacred |
| **Continuity architecture** | Preserved traits feed reference graph; AI must not bypass graph |
| **Not an AI generator** | CharID refines creator work — does not substitute a generic image |

---

## Decision tests

### Test 1 — Intent

*Does this feature treat creator input as authoritative layout/identity — or as optional inspiration?*

If optional inspiration by default → violates Preserve Intent.

### Test 2 — Recognition

*Would a child recognize their drawing after enhancement?*

If not → violates Preserve Intent.

### Test 3 — Redesign boundary

*Can the creator request substantial redesign explicitly — separate from enhance?*

If redesign is the only path → violates creator control; if redesign is silent → violates Preserve Intent.

---

## Phase F alignment

Preserve Intent is **required** before any Phase F enhancement ships ([IMPLEMENTATION_PHASES_V3.md](./IMPLEMENTATION_PHASES_V3.md)):

- Character ref enhancement
- Map / world image refinement
- Panel layout → finished page
- Asset / environment concept polish
- Storyboard frame cleanup

Structure assembly (text → outline) is governed by AI Creation Control. **Image transformation** is governed by Preserve Intent.

---

## Document index

| Doc | Role |
|-----|------|
| [CHARID_VISION_V3.md](./CHARID_VISION_V3.md) | Governing vision · AI philosophy |
| [AI_CREATION_CONTROL_PRINCIPLE.md](./AI_CREATION_CONTROL_PRINCIPLE.md) | Review, approve, edit, remove, regenerate |
| [AI_PROVIDER_ARCHITECTURE.md](./AI_PROVIDER_ARCHITECTURE.md) | Provider routing · job types |
| [CHARACTER_WORKSPACE_V2.md](./CHARACTER_WORKSPACE_V2.md) | Gallery slot Enhance action |
| [WORLD_WORKSPACE_V2.md](./WORLD_WORKSPACE_V2.md) | Map / gallery Enhance action |

---

## Version

| Version | Date | Notes |
|---------|------|-------|
| 1.0 | 2026-06-14 | Initial governing AI principle — Preserve Intent · Improve Execution |
