# CharID Product Roadmap

**Product north star:** Creative Continuity Infrastructure — canon is the asset; future AI consumes Context Packets, never replaces canon.

**Horizon:** Next 60 days (rolling from June 2025)  
**Status:** Living document — update as slices ship.

See also:
- [AI_FOUNDATION_PHASE1.md](./AI_FOUNDATION_PHASE1.md) — canon / context packet architecture
- [CHARACTER_BIBLE_V1.md](./CHARACTER_BIBLE_V1.md) — Character Canon spec
- [CREATOR_SHOWCASE_V1_PLAN.md](./CREATOR_SHOWCASE_V1_PLAN.md) — Showcase publication layer
- [PORTFOLIO_V2_VISION.md](./PORTFOLIO_V2_VISION.md) — public presentation
- [docs/BRAND.md](./docs/BRAND.md) — brand identity

---

## What is shipped today

| Area | Status |
|------|--------|
| Auth, dashboard, characters, worlds, stories, chapters | Live |
| **Public homepage** (`/`) with marketing sections + auth-aware nav | Shipped |
| Character galleries + story images | Live |
| **Portfolio public access** (View Public Portfolio + owner preview) | Shipped |
| **Character Bible V1.1** (reference assets, slot assignments, inspector) | Shipped |
| **Character Bible** (data + scores + assembler + UI) | Shipped (Slice A–C); migration may require manual Supabase run |
| **CharacterContextPacket** | Shipped |
| World / Story bibles, combined packet | Not started |
| Showcase publication layer | Design only |
| Explore | Placeholder page |
| **Character Bible UX** (deep nav, chips, readiness labels) | Shipped | Phase 1 |
| **Privacy defaults** (private-by-default app layer) | Shipped | Phase 1; run SQL migrations |
| **Password security V1** (8+ complexity, live signup UX) | Shipped | Phase 1 |
| **Support System V1** (`support_tickets`, Help page) | Shipped | Phase 1; run SQL migrations |
| **Creator feedback V1** (character vision rating) | Shipped | Phase 1; run SQL migrations |
| **Founder analytics foundations** (views + doc) | Shipped | See [docs/FOUNDER_ANALYTICS.md](./docs/FOUNDER_ANALYTICS.md) |
| Founder admin dashboard UI | Not started | Query views with service_role for now |
| AI generation, chat, embeddings | Explicitly excluded |

---

## Six tracks

Work is grouped into six parallel tracks. **Build order below sequences the highest-impact items across tracks** — not every track runs at full speed every week.

---

## Track 1 — Product Core

*Canon architecture: Character → World → Story → Combined Context Packets*

### Character Bible

| Item | Impact | Status | Notes |
|------|--------|--------|-------|
| Migrations + types + assembler + scores | **High** | Done | `character_bible`, `asset_role`, `CharacterContextPacket` |
| Character Bible UI (sections, metrics, recommendations) | **High** | Done | `/dashboard/characters/[id]` |
| **UX polish:** deep nav, actionable chips, milestone labels | **High** | Done | Phase 1 |
| **Reference Asset System V1.1** (slot assignments, image-first assign roles) | **High** | Done | `character_image_slot_assignments`; gallery → assign roles |
| **Reference Graph Inspector** (canon completeness + scores) | **High** | Done | V1.1 — checklist + identity / graph / AI % |
| **AI role suggestions** (optional assign hints) | **Medium** | Future | Creator confirms; never auto-canon |
| **Extended asset roles** (outfit, age, version variants) | **Medium** | Future | Post–V1.1 |
| **Create flow:** slim create → redirect to Bible | **High** | Planned | Remove duplicate legacy modal path |
| **Privacy defaults:** private on create | **High** | Done | Phase 1 — app + migration |
| Character versions (V2) | Low | Future | `version_label` / `is_current` already version-ready |
| RFIM derived layer (`derived` in packet) | Low | Future | Post–Phase 1 |

### World Bible

| Item | Impact | Status | Notes |
|------|--------|--------|-------|
| `world_bible` migration + types | **High** | Started | See [WORLD_BIBLE_V1.md](./WORLD_BIBLE_V1.md) + `20250627000000_world_bible.sql` |
| `world_images` + slot assignments (asset-first) | **High** | Started | Mirrors Character Bible V1.1 pattern |
| World asset → assign roles pattern | **High** | Not started | Same philosophy as Character Bible V1.1 |
| `assembleWorldCanon()` + scores | **High** | Not started | |
| `WorldContextPacket` assembler | **High** | Not started | |
| World Bible UI on `/dashboard/worlds/[id]` | **Medium** | Not started | Reuse Character Bible UX patterns |
| Cultures / factions (structured) | **Medium** | Future | Phase 2 world bible |
| `world_cultures` deep schema | Low | Future | |

### Story Bible

| Item | Impact | Status | Notes |
|------|--------|--------|-------|
| `story_bible` migration (premise, themes) | **High** | Not started | |
| Story reference package types (key scene, motif, cover) | **Medium** | Partial | `story_images.asset_type` exists; extend types |
| Timeline / major events tables | **Medium** | Future | |
| `assembleStoryCanon()` + scores | **High** | Not started | |
| `StoryContextPacket` assembler | **High** | Not started | Embeds roster via `story_characters` |
| Story Bible UI on story detail | **Medium** | Not started | |
| Scene Canon (`scene_bible`) | Low | Future | Story → Chapter → Scene hierarchy |

### Context Packets

| Item | Impact | Status | Notes |
|------|--------|--------|-------|
| `CharacterContextPacket` | **High** | Done | |
| `WorldContextPacket` | **High** | Not started | After World Bible Slice A+B |
| `StoryContextPacket` | **High** | Not started | After Story Bible Slice A+B |
| `CombinedContextPacket` | **High** | Not started | Fire / Ashlands / Lost Ember continuity example |
| `assertMinimumReadiness()` gate | **Medium** | Future | For future AI endpoints |
| SceneContextPacket | Low | Future | |

---

## Track 2 — UI / UX

*Creator-facing polish, workflow clarity, public presentation*

| Item | Impact | Status | Notes |
|------|--------|--------|-------|
| **Character Bible workflow launchers** (recs + chips) | **High** | Done | Phase 1 — deep nav, scroll, highlight |
| **Reference asset cards** (Assign Role per image) | **High** | Done | V1.1 — images → roles workflow |
| **Progressive readiness labels** (Started → AI Ready) | **High** | Done | Phase 1 |
| **Privacy UX:** private-by-default copy + toggles | **High** | Done | Phase 1 — app + migration |
| **Public homepage** (`/`) + logo → home | **High** | Done | Marketing sections, auth-aware nav |
| **Native select / dropdown dark mode** | **Medium** | Done | Phase 1 — `selectClassName` + globals.css |
| **Modal / menu z-index consistency** | **Medium** | Planned | Card menus vs modals vs sidebar |
| **Portfolio V2** (projects by type, featured work) | **Medium** | Design only | [PORTFOLIO_V2_VISION.md](./PORTFOLIO_V2_VISION.md) |
| **Public portfolio layout refresh** | **Medium** | Planned | Header, projects grid, characters |
| **Dashboard empty states + onboarding hints** | **Medium** | Planned | “Build your Character Bible” |
| **Branding refresh** (tokens, gradients, typography) | **Low** | Partial | [docs/BRAND.md](./docs/BRAND.md) exists |
| **Logo + favicon rollout** | **Low** | Partial | Brand assets in `public/brand/`; align app icons |
| **Mobile / responsive Bible layout** | **Low** | Planned | |
| **Estimated score gains on recommendations** | Low | Future | Phase C UX enhancement |

---

## Track 3 — Founder Analytics

*Internal visibility for product iteration — not creator-facing*

| Item | Impact | Status | Notes |
|------|--------|--------|-------|
| **Admin route + auth gate** (`/admin`, service role or allowlist) | **High** | Not started | Founder-only |
| **Usage metrics** (DAU/WAU, signups, retention) | **High** | Not started | Supabase auth + event table or PostHog |
| **Content metrics** (characters, worlds, stories, bible completion %) | **High** | Not started | Aggregate from canon tables |
| **Funnel metrics** (signup → first character → bible >50% → world → story) | **Medium** | Not started | |
| **Cost metrics** (storage GB, bandwidth, Supabase tier) | **Medium** | Not started | Manual + API where available |
| **Admin dashboard UI** (cards + tables) | **Medium** | Not started | Read-only v1 |
| **Support ticket metrics** (volume, open/resolved, categories) | **Medium** | Not started | See Track 5 — Support System V1 |
| **Canon satisfaction metrics** (character / world / story ratings) | **Medium** | Not started | See Track 5 — Bible feedback |
| **Generation satisfaction metrics** (thumbs, drift reasons) | **Medium** | Future | After AI generation ships |
| **Intent preservation dashboard** (aggregate satisfaction vs readiness scores) | **Medium** | Future | Cross-reference canon scores + feedback |
| **Alerts** (error rate, failed migrations, spike) | Low | Future | |
| **Creator-facing analytics** | Low | Future | Out of scope for founder track |

---

## Track 4 — Future Platform

*Public discovery, social layer, AI — after canon foundation*

| Item | Impact | Status | Notes |
|------|--------|--------|-------|
| **Privacy + private-by-default migration** | **High** | Planned | Prerequisite for Showcase |
| **Showcase publication layer** (`showcase_entries`) | **High** | Design only | [CREATOR_SHOWCASE_V1_PLAN.md](./CREATOR_SHOWCASE_V1_PLAN.md) |
| **Publish to Showcase flow** | **High** | Not started | Explicit publish; no inheritance |
| **Showcase public page** (replace raw portfolio filesystem) | **Medium** | Not started | Featured work, typed sections |
| **Explore** (community browse) | **Medium** | Placeholder | `/dashboard/explore` stub only |
| **Identity Layer** (RFIM embeddings, `derived` in packets) | **Medium** | Design only | [CHARACTER_IDENTITY_LAYER.md](./CHARACTER_IDENTITY_LAYER.md) |
| **First AI experiments** (packet-in → structured out) | **Medium** | Not started | After Combined Context Packet |
| **Follows** | Low | Excluded V1 | Showcase plan defers |
| **Likes** | Low | Excluded V1 | |
| **Comments** | Low | Excluded V1 | |
| **Notifications / payments** | Low | Future | |

---

## Track 5 — Creator Feedback & Support

*Feedback loops before AI generation — measure whether CharID preserves creator intent*

**North star metric:** Are creators satisfied that their canon accurately represents their vision?

Feedback data feeds Founder Analytics (Track 3). It is **research and product signal**, not a public social layer.

### Support System V1

| Item | Impact | Status | Notes |
|------|--------|--------|-------|
| **`support_tickets` table** + RLS | **High** | Done | Phase 1 |
| **Contact Support UI** | **High** | Done | `/dashboard/help` |
| **Character vision rating** | **High** | Done | `creator_feedback` table |
| **Ticket categories** | **High** | Done | Bug Report · Feature Request · Billing · Account · AI Generation · Other |
| **Optional screenshot upload** | **Medium** | Done | `support-attachments` bucket |
| **Creator ticket history** (optional v1.1) | Low | Partial | Recent tickets on Help page |
| **Founder: open / resolved tickets** | **High** | Not started | Admin dashboard table + filters |
| **Founder: ticket category breakdown** | **Medium** | Not started | Bar chart or ranked list |
| **Founder: most common issues** | **Medium** | Not started | Aggregate by category + keyword scan on subjects (manual v1) |
| **Email / Slack notify on new ticket** | Low | Future | Founder alert on high-priority categories |

**Suggested schema (`support_tickets`):**

```text
id, user_id, subject, category, message, screenshot_path,
status (open | in_progress | resolved), created_at, resolved_at
```

### Character Bible Feedback

| Item | Impact | Status | Notes |
|------|--------|--------|-------|
| **Vision rating prompt** | **High** | Done | 1–5 stars on Character Bible |
| **Optional notes field** | **High** | Done | “What is missing or incorrect?” |
| **`creator_feedback` table** | **High** | Done | Future-ready for world/story/generation |
| **Inline UI on Character Bible** | **Medium** | Done | Below bible sections |
| **Re-prompt on major bible changes** | Low | Future | Re-ask after significant score jump or new canonical image |
| **Founder: character consistency ratings** | **Medium** | Not started | Avg rating, distribution, notes sample in admin |

**Timing:** Ship alongside or immediately after Character Bible UX polish (Phase 1 complete). Valuable **before** AI generation — establishes baseline intent satisfaction on canon alone.

### World Bible Feedback

| Item | Impact | Status | Notes |
|------|--------|--------|-------|
| **Vision rating prompt** | **Medium** | Future | “How well does this world represent your vision?” — same 1–5 scale |
| **Optional notes** | **Medium** | Future | Reuse `creator_feedback` with `entity_type = 'world'` |
| **Inline UI on World Bible** | **Medium** | Future | After World Bible UI ships |
| **Founder: world consistency ratings** | **Medium** | Future | Aggregate in admin |

### Story Bible Feedback

| Item | Impact | Status | Notes |
|------|--------|--------|-------|
| **Vision rating prompt** | **Medium** | Future | “How well does this story represent your vision?” — same 1–5 scale |
| **Optional notes** | **Medium** | Future | Reuse `creator_feedback` with `entity_type = 'story'` |
| **Inline UI on Story Bible** | **Medium** | Future | After Story Bible UI ships |
| **Founder: story consistency ratings** | **Medium** | Future | Aggregate in admin |

### AI Generation Feedback (Future)

| Item | Impact | Status | Notes |
|------|--------|--------|-------|
| **Thumbs up / thumbs down** on every generation | **High** | Future | Required UI affordance on generation result |
| **“What was wrong?” taxonomy** | **High** | Future | Face · Hair · Outfit · Body · Location · Mood · Other |
| **`generation_feedback` table** | **High** | Future | Links to generation id, context packet snapshot ref, rating, reasons[] |
| **Founder: generation satisfaction rate** | **High** | Future | % positive; trend over time |
| **Founder: drift reason breakdown** | **High** | Future | Which failure modes dominate — informs Identity Layer priorities |
| **Correlate feedback with readiness scores** | **Medium** | Future | Does higher AI readiness → higher generation satisfaction? |

**Principle:** Every generation is a learning event. Negative feedback with structured reasons is as valuable as positive signal for continuity infrastructure.

### Founder Analytics Integration (Feedback Layer)

Track in admin dashboard alongside usage and content metrics:

| Metric | Source | Goal |
|--------|--------|------|
| Support volume | `support_tickets` | Operational load; pain points before scale |
| Open vs resolved tickets | `support_tickets.status` | Support health |
| Ticket categories | `support_tickets.category` | Product priority signal |
| Character consistency ratings | `creator_feedback` (character) | Baseline intent satisfaction |
| World consistency ratings | `creator_feedback` (world) | World canon quality |
| Story consistency ratings | `creator_feedback` (story) | Story canon quality |
| Generation satisfaction | `generation_feedback` | AI continuity success rate |
| Intent preservation index | Derived | Weighted blend of canon ratings + generation thumbs-up |

**Dashboard sections (proposed):**

```text
Support        — open count, resolved this week, top categories
Canon Quality  — avg character/world/story rating, recent notes
Generation     — satisfaction %, top drift reasons (when live)
```

---

## Track 6 — Platform Operations

*Permanent infrastructure track — security, support, analytics, cost, admin*

Platform Operations runs alongside product tracks. Phase 1 hardening established the foundation; this track owns ongoing operational maturity.

### Security

| Item | Impact | Status | Notes |
|------|--------|--------|-------|
| Password policy V1 (8+ complexity, shared validator) | **High** | Done | `src/lib/password-policy.ts` |
| Email confirmation (production) | **High** | Config | Supabase dashboard — not enforced in app code |
| Password reset flow | **High** | Not started | Forgot password + `/auth/reset` |
| CAPTCHA on auth forms | **Medium** | Not started | Supabase + hCaptcha/Turnstile |
| Session inactivity timeout | **Medium** | Not started | Supabase Auth settings |
| MFA (TOTP) | **Medium** | Future | |
| Privacy defaults (private workspace) | **High** | Done | App + migration; RLS inheritance Phase 2 |
| RLS + storage policies audit | **High** | Ongoing | Characters, worlds, support attachments |

### Support

| Item | Impact | Status | Notes |
|------|--------|--------|-------|
| `support_tickets` + Contact Support UI | **High** | Done | `/dashboard/help` |
| Founder ticket dashboard | **Medium** | Not started | Open/resolved, categories |
| Email notify on new ticket | **Low** | Future | |

### Analytics

| Item | Impact | Status | Notes |
|------|--------|--------|-------|
| Usage + support + feedback SQL views | **High** | Done | [docs/FOUNDER_ANALYTICS.md](./docs/FOUNDER_ANALYTICS.md) |
| Founder admin UI | **Medium** | Not started | Query views via service_role |
| Bible completion snapshots | **Medium** | Future | Computed metrics persistence |
| Funnel metrics | **Medium** | Future | Signup → character → bible |
| Intent preservation index | **Medium** | Future | Ratings + readiness + generation |

### Cost Tracking

| Item | Impact | Status | Notes |
|------|--------|--------|-------|
| Supabase storage/bandwidth snapshot | **Medium** | Not started | Manual dashboard + doc |
| Per-user storage attribution | **Low** | Future | character-photos, support-attachments |
| Cost alerts | **Low** | Future | |

### Admin Tools

| Item | Impact | Status | Notes |
|------|--------|--------|-------|
| `/admin` route + auth gate | **High** | Not started | Allowlist or service role |
| Support ticket management | **Medium** | Not started | Update status/priority |
| User/content browser | **Low** | Future | Read-only v1 |

---

## Impact summary

### High impact (do first)

- Character Bible UX + create/privacy alignment
- Workspace private-by-default (DB + RLS + UI)
- World Bible Slice A+B (schema + assembler + packet)
- Story Bible Slice A+B (schema + assembler + packet)
- Combined Context Packet
- Founder admin shell + core metrics
- Support System V1 + Character Bible feedback (pre-AI baseline)

### Medium impact (days 30–60 and parallel where safe)

- World / Story Bible UI
- Portfolio V2 presentation layer
- Funnel + cost analytics
- Canon feedback for world + story (after respective bibles ship)
- Support ticket category analytics in admin
- Showcase schema + publish flow (start design → implement)
- Explore MVP (curated public showcase entries only)

### Low impact (defer or fit in gaps)

- Branding refresh + logo/favicon alignment
- Score delta badges on recommendations
- Scene Canon
- Social features (follows, likes, comments)
- Character versions UI
- AI generation feedback (depends on generation shipping)
- Generation ↔ readiness correlation studies

---

## Recommended 60-day build order

Assumes ~1 primary builder; adjust parallelism if capacity increases.

### Week 1–2 (Days 1–14) — Character Canon complete + privacy foundation

**Theme:** Make Character Bible the gold-standard workflow; stop accidental public exposure.

| # | Deliverable | Track |
|---|-------------|-------|
| 1 | Run / verify Character Bible SQL in Supabase | Product Core |
| 2 | Character Bible UX Phase A (deep nav, clickable chips, milestone labels) | UI/UX |
| 3 | Slim create → redirect to Bible; retire dashboard Edit modal | UI/UX + Core |
| 4 | Privacy Tier 1: `is_public DEFAULT false`, app inserts private, UI defaults private | Product Core + Platform |
| 5 | Dropdown / select audit (dark mode, z-index on card menus) | UI/UX |

**Exit criteria:** New character is private, lands in Bible, recommendations/chips navigate to slots; no silent public creates.

---

### Week 3–4 (Days 15–28) — World Canon backend + founder visibility

**Theme:** Second canon layer; internal metrics to guide World Bible UI.

| # | Deliverable | Track |
|---|-------------|-------|
| 6 | `world_bible` + `world_images` migrations + fix SQL | Product Core |
| 7 | World types, `assembleWorldCanon()`, scores, `WorldContextPacket` | Product Core |
| 8 | Privacy Tier 2: remove anon RLS inheritance on stories/chapters/story_images | Platform |
| 9 | Founder admin shell + usage + content metrics (v1) | Analytics |
| 9b | `support_tickets` + Contact Support UI | Feedback |
| 9c | Character Bible vision rating (1–5 + notes) | Feedback |
| 10 | World Bible UI (minimal): Overview + reference assets sections | UI/UX + Core |

**Exit criteria:** `assembleWorldContextPacket(worldId)` returns valid JSON; worlds private by default; founder can see user/content counts; creators can submit support tickets and rate character vision accuracy.

---

### Week 5–6 (Days 29–42) — Story Canon + Combined Context

**Theme:** Full story continuity; first cross-entity packet.

| # | Deliverable | Track |
|---|-------------|-------|
| 11 | `story_bible` migration + extend `story_images` asset types | Product Core |
| 12 | Story types, `assembleStoryCanon()`, scores, `StoryContextPacket` | Product Core |
| 13 | `assembleCombinedContextPacket({ worldId, storyId, characterIds })` | Product Core |
| 14 | Story Bible UI (minimal): Premise, themes, roster, assets | UI/UX + Core |
| 15 | Funnel metrics in admin (signup → character → bible completion) | Analytics |
| 15b | Admin: support ticket dashboard (open/resolved, categories) | Feedback + Analytics |
| 15c | Admin: character consistency rating aggregates | Feedback + Analytics |

**Exit criteria:** Combined packet resolves Fire + Ashlands + story roster example; StoryContextPacket includes roster refs.

---

### Week 7–8 (Days 43–56) — Presentation layer prep + polish

**Theme:** Bridge workspace canon to public presentation; portfolio refresh.

| # | Deliverable | Track |
|---|-------------|-------|
| 16 | `showcase_entries` schema + RLS (design → implement) | Platform |
| 17 | Publish to Showcase v0 (single entry type: character or story) | Platform |
| 18 | Portfolio V2 Phase 1: projects grouped by `project_type` on `/u/[username]` | UI/UX |
| 19 | Readiness badges on character/world cards (dashboard) | UI/UX + Core |
| 20 | Logo + favicon aligned to [docs/BRAND.md](./docs/BRAND.md) | UI/UX |
| 20b | World Bible vision rating (reuse `canon_feedback`) | Feedback |

**Exit criteria:** Creator can explicitly publish one work to showcase; public page shows curated entry, not full workspace graph.

---

### Week 9 (Days 57–60) — Buffer, QA, documentation

| # | Deliverable | Track |
|---|-------------|-------|
| 21 | End-to-end continuity test (character + world + story → combined packet) | Product Core |
| 22 | Migration guide + README update for all new SQL files | Docs |
| 23 | Explore page MVP (list published showcase entries only) OR defer | Platform |
| 24 | Cost metrics snapshot in admin | Analytics |

---

## 60-day outcomes (target state)

By day 60, CharID should offer:

```text
✓ Character Bible     — polished workflow, private by default
✓ World Bible         — backend + minimal UI + WorldContextPacket
✓ Story Bible         — backend + minimal UI + StoryContextPacket
✓ Combined Context    — merge character + world + story canon
✓ Privacy model       — workspace private; explicit publish path started
✓ Founder dashboard   — usage, content, funnel, support + canon satisfaction
✓ Creator feedback      — Contact Support + Character Bible vision rating
✓ Public portfolio    — improved layout; showcase v0 beginning

✗ AI generation      — still not shipped (by design)
✗ Generation feedback — thumbs / drift taxonomy (waits on AI)
✗ World/Story feedback UI — schema ready; UI follows bible ships
✗ Scene Canon        — designed, not built
✗ Social layer       — follows / likes / comments deferred
```

---

## Dependency graph (simplified)

```text
Privacy defaults ──► Showcase publish
        │
Character Bible UX ──► World Bible UI (reuse patterns)
        │
Character Bible feedback ──► World/Story feedback (same canon_feedback table)
        │
Support System V1 ──► Founder admin (ticket + satisfaction dashboards)
        │
Character ContextPacket ──► WorldContextPacket ──► StoryContextPacket
        │                                              │
        └──────────────────► CombinedContextPacket ◄───┘
                                      │
                              Future AI experiments
                                      │
                              Generation feedback (thumbs + drift reasons)
                                      │
                              Intent preservation metrics
```

---

## What explicitly waits until after day 60

- Scene Canon (chapter → scene hierarchy)
- RFIM Identity Layer (embeddings, landmarks, `derived` population)
- AI image generation, chat, or prompt-only endpoints
- AI generation feedback (thumbs up/down, drift taxonomy)
- Follows, likes, comments, notifications
- Full Showcase section taxonomy (Graphic Novels, Film, etc.)
- Character versions (multi-version reference graphs)
- Creator-facing analytics

---

## How to use this document

1. **Weekly:** Pick items from the current 2-week block; mark done in PR descriptions.
2. **When scope slips:** Protect High impact Product Core + privacy; defer Low impact branding and social.
3. **When a slice ships:** Update “What is shipped today” and move items to Done in track tables.
4. **Before World Bible:** Complete Character Bible UX + privacy — World reuses both patterns.
5. **Before AI generation:** Ship Support V1 + Character Bible feedback — establish intent baseline and support channel first.

---

*Last updated: June 2025 — includes Creator Feedback & Support track; Phase 1 UX/privacy marked done.*
