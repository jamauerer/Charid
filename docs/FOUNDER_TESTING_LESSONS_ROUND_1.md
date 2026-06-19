# Founder Testing Lessons — Round 1

**Phase:** Founder Testing Round 1 — Product Vision Refinement  
**Date:** 2026-06-14  
**Authority:** [CHARID_VISION_V3.md](./CHARID_VISION_V3.md) · [FINISHED_CREATIVE_WORK_PRINCIPLE.md](./FINISHED_CREATIVE_WORK_PRINCIPLE.md)  
**Inputs:** Live founder pass · [FOUNDER_OPERATIONS_V1.md](./FOUNDER_OPERATIONS_V1.md) · [LINKING_WORKFLOW_AUDIT.md](./LINKING_WORKFLOW_AUDIT.md) · [TESTING_CHECKLIST_V1.md](./TESTING_CHECKLIST_V1.md)

**Note:** `docs/CREATOR_JOURNEY_AUDIT.md` was referenced in the brief but **does not exist** in the repo. Journey findings below are synthesized from Round 1 testing and the audits above.

---

## Summary

Founder testing confirms CharID’s **internal architecture is strong** and the **product direction is clarifying**. The platform excels at organizing canon (characters, worlds, stories) but **does not yet help creators finish and share work**. The largest pain is **workflow friction** — bouncing between unrelated pages. Phase 2B contextual linking (world/story modals) addresses part of this.

**Highest-priority gap:**

```
Story → Finished Work → Publish → Portfolio → Explore
```

Everything before the next implementation phase should be judged against that chain.

---

## What Worked

### Internal continuity architecture

| System | Verdict |
|--------|---------|
| **Character Bible** | Strong — identity, appearance, slots, reference images hold up under real use |
| **World Bible** | Strong — setting, rules, asset roles support worldbuilding |
| **Story Bible** | Strong — overview, timeline, events, character notes give narrative structure |
| **Reference Graph** | Works as automatic linking between entities and image slots |
| **Context Packet** | Assembles canon for future AI without creator-facing complexity |
| **Continuity systems** | Foundation is correct — keep, extend via Scenes and Assets later |

**Decision:** Do **not** replace these systems. Keep them **internal**. Continue hiding jargon from creators ([CHARID_VISION_V3.md](./CHARID_VISION_V3.md) terminology standards).

### Entity model and nesting

- **Character → World → Story** hierarchy is intuitive once explained.
- **Chapters** on stories provide a structural hook for future comics and novels.
- **Portfolio + public URL** (`/u/[username]`) works for profile-level publish.
- **Per-entity visibility** (`is_public`) aligns with creator ownership defaults.

### Phase 2B contextual linking (partial ship)

| Context | What works |
|---------|------------|
| **World page** | Add Existing Character · Create New Character — stay on world |
| **Story page** | Add Existing Character · Create New Character · Change World · Create New World — stay on story |

Validates the principle: *creators should not leave the object they are working on to create related content.*

### Founder operations

- Admin dashboard, support inbox, feedback inbox, moderation queue, database health — operational when service role is configured ([FOUNDER_OPERATIONS_V1.md](./FOUNDER_OPERATIONS_V1.md)).
- Testing checklist covers character, world, story, portfolio flows end-to-end.

### Vision clarity

- [FINISHED_CREATIVE_WORK_PRINCIPLE.md](./FINISHED_CREATIVE_WORK_PRINCIPLE.md) matches what founders observed: success = **finished work**, not asset count.
- Dual-audience requirement (child + professional) is achievable on **one workflow** with emergent complexity.

---

## What Was Confusing

### Creator-facing terminology

| Shown to creators | Should feel like |
|------------------|------------------|
| Story Bible | Story plan |
| Character Bible | Character details |
| Reference Graph / checklist | Automatic — or hidden in advanced view |
| Metrics / completeness scores | Optional; not primary story page chrome |

Children and hobbyists hit **internal vocabulary** before they hit creative flow.

### Navigation vs mental model

- Global **Characters** list is useful for power users but feels like the “main app” when the goal is **finish a story**.
- **Stories hub** (`/dashboard/stories`) is a placeholder — no unified “my in-progress work” view.
- **Create** modal offers Character / World / Story but not **“Make a comic”** or **“Finish this story”** — asset-first, not output-first.

### Publish vs public profile

- **Portfolio publish** (profile `is_public`) feels separate from **“publish this comic/story.”**
- Public pages show **entity cards**, not a **readable finished work** — creators unsure what “published” means to a reader.

### World required before story feels heavy

- For a child making a afternoon comic, **world + story + character** is three concepts before page 1.
- Professionals accept world scope; children need a **template path** that collapses steps (future: “Start a comic” story template with implicit world).

### Missing “what’s next?”

- Rich bibles and chapters without a **finish checklist** leave creators organizing indefinitely.
- No visible path from story page → **make pages** → **publish** → **share link**.

---

## Missing Workflows

### P0 — Highest priority (blocks the benchmark)

| Workflow | Status | Gap |
|----------|--------|-----|
| **Story → Finished Work** | ❌ | No comic editor, no graphic novel flow, no illustrated story composer, no novel export path |
| **Finished Work → Publish** | ❌ | No “Publish this story/chapter/issue” CTA; no draft vs live reader |
| **Publish → Portfolio** | ⚠️ | Portfolio is profile-first; weak “featured finished work” |
| **Portfolio → Explore** | ❌ | Explore not shipped; no discovery of finished comics |

**Canonical missing chain:**

```
Story → Finished Work → Publish → Portfolio → Explore
```

This is the **#1 creator workflow gap** discovered in Round 1.

### P1 — Contextual creation (partially addressed)

| Workflow | Status |
|----------|--------|
| World: Create / Add Character | ✅ Phase 2B |
| Story: Create / Add Character | ✅ Phase 2B |
| Story: Create / Change World | ✅ Phase 2B |
| Scene: Create / Add Character / Add Asset | ❌ Design only |
| Chapter: Create Scene | ❌ Design only |
| Comic panel: Add Character / Asset | ❌ Not started |

**Remaining contextual gaps:** global Create without world context; no in-chapter or in-panel creation yet.

### P2 — Finished work formats (documented, not built)

| Format | Target creator |
|--------|----------------|
| **Comic** | Child benchmark — short issue in an afternoon |
| **Graphic novel** | Hobbyist / pro — longer paginated work |
| **Illustrated story** | Hybrid text + images |
| **Novel** | Text-first with story plan export |
| **Motion comic** | Post-comic animation ([CREATOR_MEDIA_EXPANSION.md](./CREATOR_MEDIA_EXPANSION.md)) |
| **Film project** | Storyboard / shot list from scenes (future) |

### P3 — Future continuity (planning only — do not implement yet)

| System | Doc | Notes |
|--------|-----|-------|
| **Project → Story → Chapter → Scene** | [SCENE_ARCHITECTURE_V1.md](./SCENE_ARCHITECTURE_V1.md) | Scene = continuity layer for characters, assets, locations, **events** |
| **Asset system** | [ASSET_SYSTEM_V1.md](./ASSET_SYSTEM_V1.md) | Sword, amulet, vehicle, spaceship, artifact — owner + history |
| **Publishing expansion** | V3 + [CREATOR_ECONOMY_AND_RIGHTS.md](./CREATOR_ECONOMY_AND_RIGHTS.md) | Digital sell, POD, platform fees, creator retains IP |

---

## Creator Pain Points

| Pain point | Severity | Evidence |
|------------|----------|----------|
| **Cannot finish a comic inside CharID** | Critical | No pages/panels; external tools required |
| **Page-hopping to link characters/worlds** | High → Medium | Was critical pre–2B; improved on world/story pages |
| **No publish moment for finished work** | Critical | Only profile + entity flags |
| **Portfolio doesn’t showcase finished reading** | High | Cards, not comic reader |
| **Too much bible jargon** | High | Slows child path; pros tolerate more |
| **Unclear “done” state for a story** | High | Chapters exist; no completion workflow |
| **Orphan characters from global Create** | Medium | No world pre-selected from sidebar |
| **Change world unlinks characters silently** | Medium | Needs preview before confirm |

---

## Founder Pain Points

| Pain point | Severity | Notes |
|------------|----------|-------|
| **Analytics without service role** | High | Blocks admin verification — env/config, not product |
| **Metrics measure creation, not completion** | High | Characters/worlds/stories counts ≠ published comics |
| **No completion funnel in dashboard** | Medium | Cannot see Story → Publish drop-off |
| **Roadmap tension: AI/billing vs finish path** | Medium | Round 1 says prioritize finish/publish over infra |
| **CREATOR_JOURNEY_AUDIT missing** | Low | Process gap; this doc partially fills it |
| **Credit economics docs disagree** | Medium | Blocks Stripe — separate from Round 1 product findings |

---

## Vision Adjustments

Round 1 observations incorporated into governing docs:

| # | Observation | Adjustment |
|---|-------------|------------|
| **1** | Dual audience: 10-year-old + professional | **Core principle** in V3: same workflow, emergent complexity |
| **2** | Primary goal = finished creative work | Mission, roadmaps, activation funnels reframed around outputs (comic, novel, etc.) not asset counts |
| **3** | Keep internal architecture | Explicit “do not replace bibles / reference graph / context packet” in planning docs |
| **4** | Workflow friction is #1 UX pain | Roadmap elevates contextual creation; 2B marked partial win; extend pattern to chapters/scenes/comics |
| **5** | Story → Publish chain is top gap | Documented as P0; implementation order resequenced |
| **6** | Project → Story → Chapter → Scene | Planning docs updated; Scene connects characters, assets, locations, **events** — no implementation |
| **7** | Asset system future | [ASSET_SYSTEM_V1.md](./ASSET_SYSTEM_V1.md) confirmed; document only |
| **8** | Publishing vision | Portfolio, public, digital sell, POD — creator ownership, platform fees — document only |
| **9** | AI creation control | Manual / AI / hybrid; structure before generation; review · approve · edit · remove · regenerate — [AI_CREATION_CONTROL_PRINCIPLE.md](./AI_CREATION_CONTROL_PRINCIPLE.md) |

**Files updated from Round 1 + AI control:**

- [CHARID_VISION_V3.md](./CHARID_VISION_V3.md) — v3.2–3.3
- [IMPLEMENTATION_PHASES_V3.md](./IMPLEMENTATION_PHASES_V3.md) — **new** canonical build order
- [FINISHED_CREATIVE_WORK_PRINCIPLE.md](./FINISHED_CREATIVE_WORK_PRINCIPLE.md) — v1.1–1.2
- [MONETIZATION_AND_AI_ROADMAP.md](./MONETIZATION_AND_AI_ROADMAP.md) — creator product track
- [VISION_ALIGNMENT_REPORT.md](./VISION_ALIGNMENT_REPORT.md) — Round 1 addendum
- [SCENE_ARCHITECTURE_V1.md](./SCENE_ARCHITECTURE_V1.md) — events in scene model
- [BETA_LAUNCH_PLAN.md](./BETA_LAUNCH_PLAN.md) · [CHARID_BUSINESS_PLAN_V1.md](./CHARID_BUSINESS_PLAN_V1.md) — finished-work emphasis
- [FOUNDER_OPERATIONS_V1.md](./FOUNDER_OPERATIONS_V1.md) — Round 1 reference

---

## Updated Priorities

**Superseded by:** [IMPLEMENTATION_PHASES_V3.md](./IMPLEMENTATION_PHASES_V3.md) (canonical). Summary:

| Phase | Build |
|-------|-------|
| **A** | Story → Finished Work workflow |
| **B** | Comic architecture |
| **C** | Publishing + portfolio reader |
| **D** | Explore |
| **E** | Project · Scene · Asset |
| **F** | AI (+ billing/credits) |
| **G–H** | Marketplace · POD |

**Deferred until A–D:** AI generation · billing · credits · marketplace · extra infrastructure.

---

## Decision tests (post–Round 1)

1. *Can a 10-year-old finish a short comic and publish to portfolio without leaving CharID?*
2. *Can a professional run the same workflow at greater depth without a different product?*
3. *Does this reduce page-hopping while inside a world or story?*
4. *Does this shorten Story → Finished Work → Publish — or add another asset silo?*
5. *Are we exposing internal systems (bible, graph, packet) to creators?* → Should be **no** on default paths.
6. *Does AI let the creator review, approve, edit, remove, and regenerate every proposed part?* → Required **yes** ([AI_CREATION_CONTROL_PRINCIPLE.md](./AI_CREATION_CONTROL_PRINCIPLE.md)).

---

## Next actions before implementation

1. **Lock P0 scope** — comic MVP: chapters → pages → panels → publish → portfolio reader.
2. **Run Round 2 testing** against comic prototype when available (child + hobbyist scripts).
3. **Add completion metrics** to founder dashboard (stories with published chapters, time-to-first-publish).
4. **Terminology sprint** — quick win parallel to comic build.
5. **Reconcile credit economics** before Stripe (unchanged from prior audit).

---

## Version

| Version | Date | Notes |
|---------|------|-------|
| 1.0 | 2026-06-14 | Round 1 — vision refinement from founder testing |
