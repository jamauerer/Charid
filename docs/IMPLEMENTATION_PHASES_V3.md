# Implementation Phases V3

**Status:** Official product implementation roadmap (subordinate to north star and V3)  
**Date:** 2026-06-14  
**Authority:** [CHARID_NORTH_STAR_V1.md](./CHARID_NORTH_STAR_V1.md) · [CHARID_VISION_V3.md](./CHARID_VISION_V3.md) · [ARCHITECTURE_COMPATIBILITY_REPORT.md](./ARCHITECTURE_COMPATIBILITY_REPORT.md) (accepted)  
**Related:** [FINISHED_CREATIVE_WORK_PRINCIPLE.md](./FINISHED_CREATIVE_WORK_PRINCIPLE.md) · [FOUNDER_TESTING_LESSONS_ROUND_1.md](./FOUNDER_TESTING_LESSONS_ROUND_1.md) · [MONETIZATION_AND_AI_ROADMAP.md](./MONETIZATION_AND_AI_ROADMAP.md) · [PRESERVE_INTENT_PRINCIPLE.md](./PRESERVE_INTENT_PRINCIPLE.md)

---

## Strategic shift

**North star:** [CHARID_NORTH_STAR_V1.md](./CHARID_NORTH_STAR_V1.md) — finish work creators are proud of; creator control; preserve intent. Phases A–H implement the north star through [CHARID_VISION_V3.md](./CHARID_VISION_V3.md).

**Architecture Compatibility Report accepted.** Continuity architecture is **frozen for redesign**:

| Keep (internal) | Status |
|-----------------|--------|
| Character Bible | ✅ No rewrite |
| World Bible | ✅ No rewrite |
| Story Bible | ✅ No rewrite |
| Reference Graph | ✅ No rewrite |
| Context Packet | ✅ No rewrite |
| Continuity / slot systems | ✅ Extend only |

**Primary work moves to:** creator workflow and **finished-work outputs**.

Monetization (Stripe, credits), AI generation, marketplace, POD, and additional founder infrastructure remain **lower priority** until Phases **A–D** deliver the child benchmark: *short comic → publish → portfolio reader*.

---

## Priority order (canonical)

| Rank | Focus | Phase |
|------|-------|-------|
| **1** | Story → Finished Work workflow | **A** |
| **2** | Comic architecture (pages, panels, chapters) | **B** |
| **3** | Publishing architecture | **C** |
| **4** | Portfolio reader experience | **C** (with publish) |
| **5** | Explore discovery experience | **D** |
| **6** | Contextual creation workflows | **A** (extend; 2B partial ship) |
| **7** | Project object | **E** |
| **8** | Scene object | **E** |
| **9** | Asset object | **E** |
| — | AI assisted creation | **F** (after A–E core) |
| — | Marketplace | **G** |
| — | Print on demand | **H** |

---

## Phase overview

```
A Creator Workflow ──► B Comics ──► C Publishing + Portfolio Reader
                                              │
                                              ▼
                                        D Explore
                                              │
                                              ▼
                              E Projects · Relationships · Scenes · Assets
                                              │
                                              ▼
                                    F AI Assisted Creation
                                              │
                              ┌───────────────┴───────────────┐
                              ▼                               ▼
                        G Marketplace                   H Print On Demand
```

**Parallel (non-blocking, do not precede A):** Founder ops maintenance · terminology pass · bug fixes · Phase 2B contextual linking polish.

**Explicitly deferred until Phase F+:** Stripe billing · credit ledger · AI providers · marketplace · POD · founder analytics V2 · extra infrastructure.

---

## Phase A — Creator Workflow

### Goal

Make the **story the hub** for finishing work. Creators see a clear path from in-progress story to “ready for comic/pages” without leaving context or hitting bible jargon.

### User benefit

- Know **what to do next** on any story
- Link cast and world **in place** (extend Phase 2B)
- Child-friendly surfaces: “Story plan” not “Story Bible”
- One place to see all in-progress stories

### Scope

| Deliverable | Notes |
|-------------|-------|
| **Finish path on story page** | Single “What’s next” CTA — creator copy: Create → Finish |
| **Story status UX** | Extend statuses; tie to finish path resolver |
| **Stories hub** | `/dashboard/stories` — continue labels, last edited |
| **Terminology pass** | Idea → Story → Create → Finish; hide bible/graph on default path |
| **Contextual creation (extend 2B)** | Same modal pattern; fix orphan global Create |
| **Create → Comic** | First-class entry (phased A4a–d) — see [PHASE_A_IMPLEMENTATION_PLAN.md](./PHASE_A_IMPLEMENTATION_PLAN.md) |
| **Chapters-first layout** | What's next → Chapters → Characters before advanced plan |
| **Look & feel stub** | Optional; maps to story bible internally |

### Dependencies

- Existing: stories, chapters, story_characters, Phase 2B modals
- [LINKING_WORKFLOW_AUDIT.md](./LINKING_WORKFLOW_AUDIT.md) patterns
- No new continuity tables required

### Estimated complexity

**Moderate** — mostly UX, routing, copy, and light story-page orchestration. No bible rewrite.

### Founder testing checkpoints

- [ ] Story page shows finish checklist; updates as cast/chapters fill
- [ ] `/dashboard/stories` lists all user stories with status and deep link
- [ ] No “Story Bible” / “Reference Graph” on default story view
- [ ] World/story contextual add/create still works (2B regression pass)
- [ ] New creator can start from “Make a comic” template without dead ends
- [ ] Professional can ignore checklist and use full story plan sections
- [ ] Log issues in `UX_BUGS_AND_CONFUSION.md`

**Exit criterion:** Founder can articulate next step from any story without leaving the story page.

**Implementation plan:** [PHASE_A_IMPLEMENTATION_PLAN.md](./PHASE_A_IMPLEMENTATION_PLAN.md)

---

## Phase B — Comics

### Goal

Ship **comic architecture**: chapters contain **pages** contain **panels** — the data model and editor for finished visual work.

### User benefit

- Build a short comic **inside CharID** (child benchmark enabler)
- Templates (4-panel, 6-page children’s book, etc.) reduce blank-page friction
- Reuse character references in panels
- Hobbyist can grow to 20–40 pages without external tools

### Scope

| Deliverable | Notes |
|-------------|-------|
| **Schema** | `comic_pages` (or `pages`) under `chapters`; `panels` under pages; sort order |
| **Panel model** | Art ref (upload or character slot ref), caption/dialogue, layout template id |
| **Comic editor UI** | Story → chapter → page list → panel composer |
| **Templates** | Page layouts per [CHARID_VISION_V3.md](./CHARID_VISION_V3.md) comic templates |
| **Character refs in panel** | Pick from story roster; link to canonical slots |
| **Draft state** | All comic work private until Phase C publish |

### Dependencies

- **Phase A** — story hub and finish path point to “add pages”
- Existing `chapters` table (attach child tables)
- Character images + slot assignments (read-only refs in panels)
- Continuity stack unchanged — panels **read** context packets later (Phase F)

### Estimated complexity

**High** — new schema, editor UI, template system, storage for panel art. Additive only; moderate migration risk.

### Founder testing checkpoints

- [ ] Create chapter → add pages → add panels without leaving story context
- [ ] Apply 4-panel template; fill all cells; refresh persists
- [ ] Link character from story roster into panel
- [ ] Upload panel art; displays in grid and single-page preview
- [ ] 6-page children’s book template completable in one session (founder time trial)
- [ ] No regression on plain-text chapter content (backward compatible or migrated gracefully)
- [ ] `DATABASE_HEALTHCHECK.sql` updated for new tables

**Exit criterion:** Founder produces a 4–8 page comic draft entirely in-app (publish not required yet).

---

## Phase C — Publishing

### Goal

**Publish finished work** — distinct from portfolio profile toggle. Ship **publishing architecture** and **portfolio reader experience**.

### User benefit

- “Publish this chapter/issue” with clear draft vs live
- Public **reads** the comic — not just entity cards
- Portfolio showcases **finished work** first
- Child can share `/u/username` link that shows readable comic

### Scope

| Deliverable | Notes |
|-------------|-------|
| **Publish model** | `published_at`, `publish_status` on story/chapter/page aggregate |
| **Publish CTA** | Story/chapter “Publish” with confirmation and preview |
| **Public comic reader** | Route e.g. `/u/[username]/…/read` — scroll/swipe pages |
| **Draft vs live** | Anonymous readers see published only; owner sees draft preview |
| **Portfolio featured work** | Published comics/stories lead profile |
| **First-publish flow** | Post-publish: copy link, optional portfolio polish |
| **OG / share metadata** | Cover panel for social cards |
| **Export (optional MVP)** | PDF or image bundle for pros — can slip to post-MVP if needed |

### Dependencies

- **Phase B** — pages/panels exist to publish
- Existing `profiles.is_public`, entity visibility flags
- Public RLS policies extended for published snapshots or live read

### Estimated complexity

**Moderate–High** — publish state machine, public reader SPA, portfolio query changes. No continuity rewrite.

### Founder testing checkpoints

- [ ] Publish chapter; logged-out reader sees pages only (not draft panels)
- [ ] Unpublish or revert draft; public reader updates
- [ ] Portfolio home leads with published comic, not character count
- [ ] Publish flow distinct from “make portfolio public” — both documented in UI
- [ ] Share link works on mobile viewport
- [ ] Child benchmark script: afternoon comic → publish → share URL (founder simulates with checklist)
- [ ] Completion funnel metric: `first_published_comic_at` capturable for founder dashboard

**Exit criterion:** End-to-end **Story → Finished Work → Publish → Portfolio reader** works for one comic.

---

## Phase D — Discovery (Explore)

### Goal

**Explore** surfaces **finished public work** — comics and stories readers can discover — not raw character gens or AI feeds.

### User benefit

- Creators find audience for published work
- Readers browse featured/trending **comics and stories**
- Opt-in discoverability per [CREATOR_ECONOMY_AND_RIGHTS.md](./CREATOR_ECONOMY_AND_RIGHTS.md)

### Scope

| Deliverable | Notes |
|-------------|-------|
| **Explore index** | `/explore` or `/dashboard/explore` — curated/algorithmic list of published works |
| **Filters** | Comics, worlds, creators; no prompt-box content |
| **Featured slots** | Founder-curated row (admin tool or config) |
| **Search (basic)** | Title, creator username |
| **Empty state** | Honest when catalog small |

### Dependencies

- **Phase C** — published works with reader URLs exist to index
- Moderation policy for public catalog

### Estimated complexity

**Moderate** — read-heavy queries, UI grid, admin curation hook. No new creator objects.

### Founder testing checkpoints

- [ ] Explore shows only opt-in public **published** works
- [ ] Click through opens public reader — not character edit page
- [ ] Private/draft work never appears
- [ ] Featured row updatable by founder admin
- [ ] Performance acceptable with seed catalog (50+ published items test)

**Exit criterion:** External reader can discover and read a published comic without a direct link.

---

## Phase E — Projects / Scenes / Assets / Relationships

### Goal

Add **Project**, **Scene**, **Asset**, and **Relationship** as first-class creator objects — **composing on** bibles and graphs, not replacing them.

### User benefit

- **Project:** Pro-scale universe container (multiple worlds/stories)
- **Scene:** Beat-level continuity — characters, assets, locations, events
- **Asset:** Movable props (sword, amulet, ship) with ownership history
- **Relationship:** Typed bonds between characters (friend, mentor, daemon, …) — project-scoped, scene-aware

### Scope

| Object | Reference doc | Ship order within E |
|--------|---------------|---------------------|
| **Project** | V3 Core objects | E1 — optional FK on worlds/stories |
| **Scene** | [SCENE_ARCHITECTURE_V1.md](./SCENE_ARCHITECTURE_V1.md) | E2 — under chapters |
| **Asset** | [ASSET_SYSTEM_V1.md](./ASSET_SYSTEM_V1.md) | E3 — after scenes |
| **Relationship** | [CHARACTER_RELATIONSHIPS_V1.md](./CHARACTER_RELATIONSHIPS_V1.md) | E2–E4 — with project + scenes |

| Cross-cutting | Notes |
|---------------|-------|
| Context packet extension | Add scene/asset/relationship slices |
| Reference graph extension | New node types + character ↔ character edges |
| Contextual creation | Add/link scene/asset in scene workspace |
| Comic ↔ scene link | Optional `scene_id` on panels (retrofit) |

### Dependencies

- **Phases A–C** — comic and publish MVP prove workflow before depth
- Accepted continuity stack (no bible replacement)

### Estimated complexity

**Moderate–High** per object — three additive migrations + UIs. **Low** risk to existing bibles if additive discipline holds.

### Founder testing checkpoints

- [ ] Create project; assign world; existing worlds without project still work
- [ ] Create scenes in chapter; link cast subset from story roster
- [ ] Create asset; assign owner; appear in scene
- [ ] Add relationship between two characters; visible on both character pages and story cast
- [ ] Scene shows relationship context when rival/mentor pair present
- [ ] Transfer asset ownership; history visible
- [ ] Context packet includes scene when assembling for story+scene id
- [ ] Comic panel can reference scene (if linked)
- [ ] Manual-only path still works with zero scenes/assets

**Exit criterion:** Professional workflow: project → story → chapter → scenes → comic panels with asset continuity.

---

## Phase F — AI Assisted Creation

### Goal

Credit-gated AI that **accelerates** setup and art — **never reduces control** ([AI_CREATION_CONTROL_PRINCIPLE.md](./AI_CREATION_CONTROL_PRINCIPLE.md)) and **preserves creator intent** when enhancing existing work ([PRESERVE_INTENT_PRINCIPLE.md](./PRESERVE_INTENT_PRINCIPLE.md)). Includes billing foundation if not already required for closed beta.

### User benefit

- Optional “start from an idea” structure assembly
- Generate panel art, turnarounds, covers from **approved** canon
- Manual creators unaffected — zero credits, same tables

### Scope

| Deliverable | Notes |
|-------------|-------|
| **Stripe + subscriptions** | Per [MONETIZATION_AND_AI_ROADMAP.md](./MONETIZATION_AND_AI_ROADMAP.md) Phase 2 |
| **Credit ledger** | Phase 3 |
| **Structure assembly** | Propose project/world/cast/outlines → review → approve |
| **Image generation** | Panel, character ref, cover — contextual in workspace; **Preserve Intent** default on enhancement |
| **Enhance vs Redesign** | Enhance preserves composition/layout; Redesign explicit opt-in only |
| **Approve / edit / remove / regenerate** | Required per entity |
| **Provider router** | [AI_PROVIDER_ARCHITECTURE.md](./AI_PROVIDER_ARCHITECTURE.md) |

### Dependencies

- **Phases A–E** — workflows and objects AI writes into must exist
- Moderation wired for AI outputs
- Cost model signed off ([AI_COST_MODEL.md](./AI_COST_MODEL.md))

### Estimated complexity

**High** — billing webhooks, credits, job queue, providers, review UX.

### Founder testing checkpoints

- [ ] Manual comic path works with AI disabled / free tier
- [ ] Structure proposal → review → approve creates normal rows
- [ ] Regenerate panel does not overwrite unrelated panels
- [ ] Enhance sketch → refined output preserves recognizable intent (child drawing test)
- [ ] Redesign path requires explicit creator opt-in — separate from Enhance
- [ ] Credits debited atomically; refunded on failure
- [ ] No AI on homepage; no silent publish of AI output
- [ ] COGS visible in founder dashboard

**Exit criterion:** Hybrid creator completes comic using mix of manual panels and one AI-generated panel with full control.

---

## Phase G — Marketplace

### Goal

Creators **sell digital work** — comics, books, packs — with creator ownership and CharID platform fees.

### User benefit

- Monetize published comics/stories inside platform
- Readers purchase without leaving CharID ecosystem (or licensed download)

### Scope

| Deliverable | Notes |
|-------------|-------|
| Digital product listings | Linked to published work |
| Checkout + entitlements | Stripe Connect or equivalent |
| Creator payout reporting | |
| Rights metadata | [CREATOR_ECONOMY_AND_RIGHTS.md](./CREATOR_ECONOMY_AND_RIGHTS.md) |
| Moderation + disputes | |

### Dependencies

- **Phase C** — publish pipeline proven
- **Phase F** — payments infrastructure (may share Stripe)
- Legal: ToS, refund policy

### Estimated complexity

**High** — payments, rights, fraud, support load.

### Founder testing checkpoints

- [ ] List published comic for sale; purchase as second user
- [ ] Buyer gets reader/download access; creator sees revenue
- [ ] Delist removes purchase path; existing buyers retain access (policy-defined)
- [ ] Platform fee matches business plan
- [ ] Dispute/refund runbook tested once

**Exit criterion:** One real digital sale end-to-end in staging.

---

## Phase H — Print On Demand

### Goal

Creators **order** and **sell** physical books/comics via POD partners.

### User benefit

- Proof copy for creator
- Readers buy physical edition; creator royalties; CharID platform fee

### Scope

| Deliverable | Notes |
|-------------|-------|
| Print-ready export | Bleed, dimensions from comic pages |
| Partner integration | API or manual fulfillment v1 |
| Creator order flow | |
| Public purchase flow | |
| Royalty + fee accounting | |

### Dependencies

- **Phase B–C** — paginated comic with publish
- **Phase G** (recommended) — payments maturity
- Partner contract

### Estimated complexity

**High** — print specs, partner API, fulfillment ops.

### Founder testing checkpoints

- [ ] Export 24-page comic meets partner PDF spec
- [ ] Founder orders proof copy; acceptable print quality
- [ ] Test purchase flow; tracking visible
- [ ] Royalty statement matches order

**Exit criterion:** One physical proof book from CharID comic in founder’s hands.

---

## Explicitly lower priority (until Phase A–D complete)

| Area | Defer to | Rationale |
|------|----------|-----------|
| AI image/video generation | Phase F | Serves finished work; not the blocker |
| Stripe / credits | Phase F | Free finish+publish path first |
| Marketplace | Phase G | Needs publish pipeline |
| POD | Phase H | Needs comic + optional marketplace |
| Founder analytics V2 | After Phase C | Completion funnel first; vanity metrics later |
| Additional AI providers | Phase F+ | One provider proves control UX |
| Project / Scene / Asset | Phase E | After comic MVP |
| Continuity redesign | **Never** | Architecture report accepted |

---

## Shipped baseline (do not re-litigate)

| Item | Status |
|------|--------|
| Character / World / Story bibles | ✅ Shipped |
| Reference graph + context packets | ✅ Shipped |
| Phase 2B contextual linking | ✅ Shipped |
| V3 navigation + Create modal | ✅ Shipped |
| Chapters (plain text) | ✅ Shipped |
| Portfolio profile + public URL | ✅ Shipped |

---

## Document index

| Doc | Role |
|-----|------|
| [ARCHITECTURE_COMPATIBILITY_REPORT.md](./ARCHITECTURE_COMPATIBILITY_REPORT.md) | Why continuity stays |
| [FINISHED_CREATIVE_WORK_PRINCIPLE.md](./FINISHED_CREATIVE_WORK_PRINCIPLE.md) | Finish-first benchmark |
| [MONETIZATION_AND_AI_ROADMAP.md](./MONETIZATION_AND_AI_ROADMAP.md) | Phase F billing/AI detail |
| [SCENE_ARCHITECTURE_V1.md](./SCENE_ARCHITECTURE_V1.md) | Phase E2 design |
| [ASSET_SYSTEM_V1.md](./ASSET_SYSTEM_V1.md) | Phase E3 design |
| [TESTING_CHECKLIST_V1.md](./TESTING_CHECKLIST_V1.md) | Base founder flows |

---

## Version

| Version | Date | Notes |
|---------|------|-------|
| 1.0 | 2026-06-14 | Initial V3 implementation phases — post architecture acceptance |
