# Vision Alignment Report

**Audit date:** 2026-06-14  
**Governing document:** [CHARID_VISION_V3.md](./CHARID_VISION_V3.md)  
**Purpose:** Identify gaps between V3 (Creator Operating System) and existing plans, code, and copy.

---

## Summary

CharID’s **shipped product** is still **character-first** (dashboard defaults to Characters, “Character Studio” tagline, bible-forward UI). **V3** defines a **story- and scene-centric Creator OS** with Projects, Assets, and hidden internal jargon.

Most **business, rights, AI, and media docs** align on ownership, credit-gating, and anti-prompt-box positioning. **Conflicts** cluster around navigation, core loop wording, creator-facing terminology, and missing Project/Scene/Asset objects.

**Missing document:** `CHARID_PRODUCT_ROADMAP.md` — not found; `MONETIZATION_AND_AI_ROADMAP.md` partially fills this role but is billing/AI-weighted.

**Missing architecture docs:** No standalone Scene or Project schema docs; continuity lives in code (`assemble-*-context.ts`) and [AI_PROVIDER_ARCHITECTURE.md](./AI_PROVIDER_ARCHITECTURE.md).

---

## Fully aligned

Documents and areas that match V3 without material conflict:

| Document / area | Alignment |
|-----------------|-----------|
| [CHARID_VISION_V3.md](./CHARID_VISION_V3.md) | Source of truth (post 3.1 authority section) |
| [CREATOR_ECONOMY_AND_RIGHTS.md](./CREATOR_ECONOMY_AND_RIGHTS.md) | Creator ownership, private default, opt-in public/remix/commercial |
| [CHARID_BUSINESS_PLAN_V1.md](./CHARID_BUSINESS_PLAN_V1.md) | Credits abstract providers; AI not the product; tier structure |
| [AI_COST_MODEL.md](./AI_COST_MODEL.md) | Credit economics, no unlimited generation, margin discipline |
| [AI_PROVIDER_ARCHITECTURE.md](./AI_PROVIDER_ARCHITECTURE.md) | Creators choose outcomes; Continuity Layer; hidden providers |
| [CREATOR_MEDIA_EXPANSION.md](./CREATOR_MEDIA_EXPANSION.md) | Media downstream of canon; Character → World → Story → Publishing |
| [UNIT_ECONOMICS_MODEL.md](./UNIT_ECONOMICS_MODEL.md) | Sustainable bootstrap; credits before AI |
| [BETA_LAUNCH_PLAN.md](./BETA_LAUNCH_PLAN.md) | No AI homepage; bible-first; moderation/support/billing gates |
| [BETA_READINESS_PLAN.md](./BETA_READINESS_PLAN.md) | Pre-monetization testing; no AI scope creep |
| [SAFETY_MODERATION_V1.md](./SAFETY_MODERATION_V1.md) | Admin/moderation founder-only routes |
| Founder admin / moderation | `/dashboard/admin/*` gated by `profiles.role` — matches V3 |
| Privacy defaults | `is_public = false` migrations — matches V3 private default |

---

## Partially aligned

| Document / area | What fits V3 | Gap |
|-----------------|--------------|-----|
| [CHARID_VISION.md](./CHARID_VISION.md) | Competitor contrast, anti-AI-generator, ownership | Old loop omits Scene/Project; superseded banner added |
| [MONETIZATION_AND_AI_ROADMAP.md](./MONETIZATION_AND_AI_ROADMAP.md) | Phasing, credits, founder ops | Was “Continuity → Portfolio” loop; updated to V3 loop; no Project/Scene phases |
| [BRAND.md](./BRAND.md) | Dossier/passport feel, not AI SaaS | Tagline “character identity platform” — narrower than Creator OS |
| [TESTING_CHECKLIST_V1.md](./TESTING_CHECKLIST_V1.md) | End-to-end creator flows | Uses “Character Bible / World Bible / Story Bible” in checklist language |
| [FOUNDER_DASHBOARD_V1.md](./FOUNDER_DASHBOARD_V1.md) | Ops without creator jargon in nav | “Continuity metrics” internal naming |
| [FOUNDER_ANALYTICS.md](./FOUNDER_ANALYTICS.md) | Admin-only analytics | Continuity index placeholder — fine internal |
| **Shipped navigation** (`DashboardSidebar.tsx`) | Worlds, Portfolio, Explore, Settings | **Characters first**; no Create, Projects, Stories, Assets; tagline “Character Studio” |
| **Shipped routes** | World → story nesting | No top-level Stories; no Project; story not default home |
| **UI components** | Rich character/world/story workspaces | `CharacterBibleView`, `ReferenceGraphInspector` — **internal terms in creator UI** |
| [AI_COST_MODEL.md](./AI_COST_MODEL.md) vs [CHARID_BUSINESS_PLAN_V1.md](./CHARID_BUSINESS_PLAN_V1.md) | Both credit-based | Different credit **pack prices** and per-action costs — needs single canonical sheet |
| **Explore** | Route exists | V3 future discoverability — OK if empty/placeholder; avoid AI feed positioning |

---

## Conflicts

| # | V3 says | Conflict location | Severity |
|---|---------|-------------------|----------|
| 1 | **Story is primary workspace** | Dashboard home = `/dashboard` → Characters; New Character modal primary CTA | **High** |
| 2 | **Nav:** Create, Projects, Stories, Characters, Worlds, Assets | Nav: Characters, Worlds, Portfolio, Explore, Help | **High** |
| 3 | **Never show** Bible / Reference Graph in UI | Widespread `*Bible*` components, `ReferenceGraphInspector`, error strings “Character Bible” | **High** |
| 4 | **Scene** is first-class continuity hub | Scenes not in schema; timeline/events only as story bible foundation | **Medium** — V3 marks future |
| 5 | **Project** top-level container | No `projects` table or UI; worlds float independently | **Medium** — V3 marks future |
| 6 | **Asset** independent with ownership history | Images tied to character/world/story; no asset entity | **Medium** |
| 7 | Core loop **Scene → Outputs** | Older docs: “Continuity → Portfolio” without Scene | **Low** — being updated |
| 8 | Brand: **Creator operating system** | Sidebar “Character Studio”; BRAND “character identity platform” | **Medium** |
| 9 | **CHARID_PRODUCT_ROADMAP.md** referenced in audit | **File does not exist** | **Low** — process gap |
| 10 | Credit pack **$5 / $12 / $35** (Business Plan) vs **$14.99+** (Unit Economics) | Two canonical economics docs disagree | **High** for Stripe launch |
| 11 | Admin shows “Character Bible” in database health | Founder-facing OK short-term; conflicts terminology standard if copied to creator UI | **Low** |

---

## Recommended updates

### Immediate (documentation — done or in progress)

- [x] Add **Product authority** to [CHARID_VISION_V3.md](./CHARID_VISION_V3.md)
- [x] Supersede banner on [CHARID_VISION.md](./CHARID_VISION.md)
- [x] Align core loop + V3 link on [MONETIZATION_AND_AI_ROADMAP.md](./MONETIZATION_AND_AI_ROADMAP.md)
- [ ] Add V3 authority footer to: Business Plan, AI Provider Architecture, Creator Economy, Beta Launch, Media Expansion
- [ ] **Reconcile credit economics** — pick one canonical source (recommend: Business Plan for user-facing, Unit Economics for founder modeling) or merge into single `CREDIT_ECONOMICS.md`
- [ ] Create **CHARID_PRODUCT_ROADMAP.md** — product phases only (IA, scenes, comics) separate from monetization/AI phases OR rename MONETIZATION doc sections clearly

### Terminology pass (creator-facing)

| Current (UI) | V3 creator-facing |
|--------------|-------------------|
| Character Bible | Character · Details (or “Character profile”) |
| World Bible | World · Details |
| Story Bible | Story · Plan / Overview |
| Reference Graph | Remove from UI or “Connections” (optional advanced) |
| Character Studio (tagline) | “Creator studio” or drop tagline |
| BibleSectionNav | SectionNav (internal rename) |

Files to touch (non-exhaustive): `CharacterBibleView.tsx`, world/story bible components, dashboard error strings, `TESTING_CHECKLIST_V1.md`.

### Navigation (Phase 1 implementation)

1. Add **Create** entry (modal with Character / World / Story / Scene / Asset / Project)
2. Reorder nav toward V3: **Create → Projects** (stub) **→ Stories → Characters → Worlds → Assets** (stub) **→ Portfolio → Explore**
3. Change default dashboard route from character list to **Projects** or **Stories** when ready — not before Projects/Stories list exists
4. Keep **Admin / Moderation** admin-gated only

### Architecture docs to add (future)

| Doc | Contents |
|-----|----------|
| `PROJECT_ARCHITECTURE.md` | Schema, nesting, migration from world-centric model |
| `SCENE_ARCHITECTURE.md` | Scene entity, links to panels/shots, asset ownership history |
| `ASSET_CONTINUITY_ARCHITECTURE.md` | Asset table, scene ownership events, Moon Amulet pattern |

### Documents — line-level edits

| File | Change |
|------|--------|
| [CREATOR_ECONOMY_AND_RIGHTS.md](./CREATOR_ECONOMY_AND_RIGHTS.md) | Loop: add Scene; link V3 authority |
| [CREATOR_MEDIA_EXPANSION.md](./CREATOR_MEDIA_EXPANSION.md) | Replace “Story Bible” in creator-facing prose with “Story plan” |
| [BRAND.md](./BRAND.md) | Add: “Evolution to Creator Operating System per V3”; soften character-only positioning |
| [BETA_READINESS_PLAN.md](./BETA_READINESS_PLAN.md) | Onboarding: “dashboard → create” not only “create character” |
| [AI_PROVIDER_ARCHITECTURE.md](./AI_PROVIDER_ARCHITECTURE.md) | Rename “Continuity Layer” → OK internal; note V3 “Continuity Engine” alias |

---

## Terminology standards (confirmed)

### Creator-facing

**Project · Story · Character · World · Scene · Asset**

Also: Create, Portfolio, Explore, Chapter, Page, Panel, Publish.

### Internal only

**Character Bible · World Bible · Story Bible · Reference Graph · Context Packet · Continuity Engine**

Must **not** appear in creator navigation or primary page titles.

Full table: [CHARID_VISION_V3.md — Terminology standards](./CHARID_VISION_V3.md#terminology-standards)

---

## Recommended implementation order

Aligned with [IMPLEMENTATION_PHASES_V3.md](./IMPLEMENTATION_PHASES_V3.md):

| Order | Initiative | Notes |
|-------|------------|-------|
| **—** | Continuity architecture | **Frozen** — report accepted |
| **A–D** | Workflow · comics · publish · explore | **Current focus** |
| **E** | Project · Scene · Asset | After comic MVP |
| **F–H** | AI · marketplace · POD | Deferred |

---

## Shipped product snapshot (audit reference)

| V3 object | Shipped? | Location |
|-----------|----------|----------|
| Character | Yes | `/dashboard/characters/[id]` |
| World | Yes | `/dashboard/worlds/[id]` |
| Story | Yes | `/dashboard/worlds/[id]/stories/[storyId]` |
| Project | No | — |
| Scene | Partial | Story bible timeline/events only |
| Asset (standalone) | No | Images per entity |
| Comic page/panel | No | Chapters only |
| Portfolio | Yes | `/dashboard/portfolio`, `/u/[username]` |
| Create flow | No | New Character modal only |

---

## Next actions

1. Founder approves V3.2 + Round 1 lessons as governing direction.
2. **Scope Creator P0:** comic MVP (chapter → page → panel → publish → portfolio reader).
3. Reconcile credit pack + per-action pricing before Stripe.
4. **Terminology pass** — parallel quick win.
5. Re-run this audit after comic + publish MVP ships.

---

## Founder Testing Round 1 addendum (2026-06-14)

| Finding | Doc update |
|---------|------------|
| Dual audience (child + pro) | V3.2 Design Principle 0 |
| Finished work > assets | V3 mission, FINISHED_CREATIVE_WORK_PRINCIPLE, roadmaps |
| Keep internal architecture | V3 “Internal architecture” section; do not replace bibles |
| Workflow friction #1 pain | Phase 2B shipped; extend to comic pages |
| Story → Publish top gap | V3, FOUNDER_TESTING_LESSONS_ROUND_1, roadmap resequence |
| Scene/Asset/POD | Planning docs only; implement after comic MVP |
| AI creation control | Manual / AI / hybrid; structure before generation — V3.3 |

See [FOUNDER_TESTING_LESSONS_ROUND_1.md](./FOUNDER_TESTING_LESSONS_ROUND_1.md) · [AI_CREATION_CONTROL_PRINCIPLE.md](./AI_CREATION_CONTROL_PRINCIPLE.md).

---

## Version

| Version | Date | Notes |
|---------|------|-------|
| 1.0 | 2026-06-14 | Initial audit vs CHARID_VISION_V3 3.1 |
| 1.1 | 2026-06-14 | Round 1 addendum — finish/publish priority, roadmap resequence |
| 1.2 | 2026-06-14 | AI creation control — shared architecture for manual and AI paths |
