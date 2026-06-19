# Protected Creator Mode V1

**Status:** Future architecture and product vision — **no implementation**  
**Date:** 2026-06-14  
**Version:** 1.0  
**Authority:** [CHARID_VISION_V3.md](./CHARID_VISION_V3.md) · [FINISHED_CREATIVE_WORK_PRINCIPLE.md](./FINISHED_CREATIVE_WORK_PRINCIPLE.md)  
**Related:** [SAFETY_MODERATION_V1.md](./SAFETY_MODERATION_V1.md) — platform moderation pipeline (complementary, not a substitute)

---

## Principle

A child should be able to use CharID **independently on a tablet** without exposure to inappropriate content, unsafe interactions, or uncontrolled spending.

**Protected Creator Mode** is a **platform-wide safety model**, not just a content filter.

Safety must apply across the full creator lifecycle — creation, discovery, publishing, monetization, and social interaction — not only AI generation.

This document establishes **future direction only**. It does not authorize implementation in current product phases.

---

## Goals

Protected Creator Mode supports:

| Audience | Intent |
|----------|--------|
| **Children** | Independent creative use with age-appropriate boundaries |
| **Teens** | Expanded creative freedom within youth-appropriate limits |
| **Families** | Parent oversight without forking the product |
| **Schools** (future) | Institutional controls layered on the same architecture |

**Architecture constraint:** Protected accounts use the **same underlying creator architecture** as hobbyists and professionals — story, characters, world, chapters, comics, portfolio. Safety is enforced through **account mode, rating limits, and policy gates**, not a separate app or data model fork.

Aligned with [FINISHED_CREATIVE_WORK_PRINCIPLE.md](./FINISHED_CREATIVE_WORK_PRINCIPLE.md): one workflow from child to professional; complexity and permissions emerge as the creator grows.

---

## Safety layers

Protected Creator Mode is organized as four independent but coordinated layers. All four must pass review before any future social, monetization, or discovery feature ships.

### Content safety

Protected Creator Mode should **block**:

| Category | Scope |
|----------|--------|
| Sexual content | Text, imagery, prompts |
| Sexualized imagery | Generated and uploaded |
| Fetish content | All surfaces |
| Graphic violence | Creation and consumption |
| Gore | Creation and consumption |
| Self-harm content | Creation and consumption |
| Extremist content | Creation and consumption |
| Drug glorification | Creation and consumption |

Safety applies to:

| Surface | Requirement |
|---------|-------------|
| **Generation** | Pre-generation policy; post-generation scan |
| **Uploads** | Scan on ingest; quarantine when flagged |
| **Portfolio content** | Published work must meet account rating |
| **Explore content** | Only age-appropriate catalog entries |
| **Recommendations** | Filtered by account rating and mode |

**Relationship to existing moderation:** [SAFETY_MODERATION_V1.md](./SAFETY_MODERATION_V1.md) defines the platform moderation queue and admin review pipeline. Protected Creator Mode adds **account-level policy** that is stricter by default and applies proactively — before content reaches public surfaces.

### Discovery safety

Protected accounts should only discover **age-appropriate content**.

**Future rating system:**

| Rating | Typical use |
|--------|-------------|
| **G** | All-ages; protected child accounts |
| **PG** | Mild thematic elements; youth accounts |
| **PG-13** | Teen-appropriate with parental discretion |
| **Standard** | Default hobbyist and professional experience |

**Explore** (Phase D and beyond) must respect account rating limits. Recommendations, search results, and featured work inherit the same ceiling.

### Social safety

Future architecture should assume:

| Rule | Rationale |
|------|-----------|
| **No direct messaging** | Eliminates unsupervised stranger contact |
| **No private creator-to-child communication** | Adults cannot initiate private channels with protected accounts |
| **No unrestricted contact from strangers** | Follow, comment, and collaboration require policy review |

**Product principle:** All future social systems — comments, follows, collaborations, notifications, sharing — must be reviewed against this layer **before design approval**. Social features are not additive; they are gated by Protected Creator Mode policy.

### Spending safety

Future family controls should support:

| Control | Behavior |
|---------|----------|
| **No purchases** | Hard block on all paid actions |
| **Approval required** | Parent must approve each purchase or credit pack |
| **Monthly spending limits** | Cap on currency spent per billing period |
| **Monthly credit limits** | Cap on AI credits consumed per billing period |

Spending safety applies when monetization and AI credits ship (Phase F and related billing work). Protected accounts default to **no purchases** until a parent explicitly enables spending with limits.

---

## Family accounts

**Future concept** — not part of current schema or UI.

```
Parent Account
├ Child Account
├ Child Account
└ Child Account
```

Parents may control:

| Control | Effect |
|---------|--------|
| **Content rating** | Maximum G, PG, or PG-13 per child |
| **Publishing permissions** | Allow, require approval, or block publish |
| **Discoverability** | Portfolio public, unlisted, or private |
| **Spending limits** | See [Spending safety](#spending-safety) |
| **Generation limits** | Daily or monthly AI credit caps |

Child accounts inherit the same story → comic → publish workflow described in [FINISHED_CREATIVE_WORK_PRINCIPLE.md](./FINISHED_CREATIVE_WORK_PRINCIPLE.md). Parent controls are **permissions and ceilings**, not a different creator experience.

---

## Rating philosophy

Account modes map to rating ceilings:

| Account mode | Maximum rating | Default experience |
|--------------|------------------|-------------------|
| **Protected Creator** | **G** | Simplest UI depth; strictest content and discovery filters |
| **Youth Creator** | **PG** | Expanded themes; still no Standard-only content |
| **Standard Creator** | **Standard** | Full platform experience |

Ratings apply consistently to:

| Domain | Enforcement point |
|--------|-------------------|
| **Generation** | Prompt policy + output scan |
| **Publishing** | Work must be rated; cannot exceed account ceiling |
| **Discovery** | Explore, search, recommendations filtered by viewer ceiling |
| **Recommendations** | Same filter as discovery |

Creators may **rate their published work** (future). Viewers never see work above their account ceiling. Protected Creator accounts never see Standard-rated catalog entries regardless of creator intent.

---

## Product principle

Protected Creator Mode should feel **safe enough that a parent is comfortable allowing a child to use CharID independently** — on a tablet, without constant supervision.

Safety must apply to:

```
Creation → Discovery → Publishing → Monetization → Social interaction
```

**Not just AI generation.**

This aligns with [CHARID_VISION_V3.md](./CHARID_VISION_V3.md) Design Principle 0 (dual audience, one workflow): a child uses the same platform as a professional, but Protected Creator Mode ensures the **boundaries** match independent use — not just simpler copy.

Independent tablet use is the **acceptance test** for Protected Creator Mode. If a feature cannot pass that test under Protected settings, it does not ship to protected accounts until it can.

---

## Relationship to current architecture

| System | Role today | Protected Creator Mode (future) |
|--------|------------|--------------------------------|
| Story / World / Character bibles | Continuity and planning | Unchanged — same objects |
| Moderation queue | Flag → admin review | Stricter defaults; proactive block for protected accounts |
| Portfolio / publish flags | Entity visibility | Gated by rating + parent publish permission |
| Explore | Not shipped (Phase D) | Must ship with rating filters |
| AI generation | Deferred (Phase F) | Hard policy layer before credits bill |
| Billing / credits | Deferred | Family spending controls |

**No continuity redesign.** Protected Creator Mode adds account mode, family linkage, rating metadata, and policy enforcement — not a parallel product.

---

## Implementation priority

This document establishes **future direction only**.

Protected Creator Mode is **not part of**:

| Phase | Focus |
|-------|-------|
| **A** | Creator workflow |
| **B** | Comics |
| **C** | Publishing + portfolio reader |
| **D** | Explore |

Implementation should be **evaluated after** the following are complete:

1. **Comics** (Phase B) — finished work exists to rate and publish  
2. **Publishing** (Phase C) — portfolio reader exposes content to viewers  
3. **Portfolio reader** (Phase C) — public surfaces require content policy  
4. **Explore** (Phase D) — discovery requires rating-aware catalog  

**Rationale:** Safety layers depend on surfaces that do not exist yet. Building Protected Creator Mode before publish and explore would enforce policy on an incomplete product. Building publish and explore **without** a Protected Creator Mode plan would create retrofit risk.

Canonical build order remains [IMPLEMENTATION_PHASES_V3.md](./IMPLEMENTATION_PHASES_V3.md). This document does not amend phase scope or sequencing.

---

## Future evaluation checklist

When Protected Creator Mode enters roadmap planning, verify:

| Question | Required answer |
|----------|-----------------|
| Can a protected account create without seeing Standard content? | Yes |
| Can a protected account publish only G-rated work (unless parent raises ceiling)? | Yes |
| Does Explore respect viewer rating on day one? | Yes |
| Are social features blocked or policy-reviewed for protected accounts? | Yes |
| Do spending and credit controls exist before monetization reaches children? | Yes |
| Does the child path still match [FINISHED_CREATIVE_WORK_PRINCIPLE.md](./FINISHED_CREATIVE_WORK_PRINCIPLE.md)? | Yes — same workflow, different permissions |

---

## Document index

| Doc | Relationship |
|-----|--------------|
| [CHARID_VISION_V3.md](./CHARID_VISION_V3.md) | Governing vision — dual audience, child-simple principle |
| [FINISHED_CREATIVE_WORK_PRINCIPLE.md](./FINISHED_CREATIVE_WORK_PRINCIPLE.md) | Child benchmark and canonical workflow |
| [SAFETY_MODERATION_V1.md](./SAFETY_MODERATION_V1.md) | Moderation queue and admin review (operational) |
| [AI_CREATION_CONTROL_PRINCIPLE.md](./AI_CREATION_CONTROL_PRINCIPLE.md) | Creator control over AI — policy layer complements |
| [IMPLEMENTATION_PHASES_V3.md](./IMPLEMENTATION_PHASES_V3.md) | Canonical phases — **unchanged by this document** |

---

## Version

| Version | Date | Notes |
|---------|------|-------|
| 1.0 | 2026-06-14 | Initial future vision — safety layers, family accounts, rating philosophy, post–Phase D priority |
