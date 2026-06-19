# Monetization and AI Roadmap

> **Aligns with:** [CHARID_VISION_V3.md](./CHARID_VISION_V3.md) · [IMPLEMENTATION_PHASES_V3.md](./IMPLEMENTATION_PHASES_V3.md) (canonical product phases) · [FINISHED_CREATIVE_WORK_PRINCIPLE.md](./FINISHED_CREATIVE_WORK_PRINCIPLE.md) · [AI_CREATION_CONTROL_PRINCIPLE.md](./AI_CREATION_CONTROL_PRINCIPLE.md) · [FOUNDER_TESTING_LESSONS_ROUND_1.md](./FOUNDER_TESTING_LESSONS_ROUND_1.md). On conflict, V3 wins.

CharID prepares for sustainable AI without unlimited usage. **No AI generation ships until Phase F** ([IMPLEMENTATION_PHASES_V3.md](./IMPLEMENTATION_PHASES_V3.md)) — after creator workflow Phases A–D.

**Product priority:** Phases **A → B → C → D** (finish, comic, publish, explore) before billing, AI, marketplace, or infra expansion.

---

## Product rule (non-negotiable)

CharID is **not** an AI image generator.

The core product is **finished creative work** inside a connected universe:

**Idea → Story → Finished Work (comic, novel, …) → Publish → Portfolio** ([FINISHED_CREATIVE_WORK_PRINCIPLE.md](./FINISHED_CREATIVE_WORK_PRINCIPLE.md))

Internal chain: **Character → World → Story → Scene → Publishing** — bibles, reference graph, and context packets remain; they are hidden from creators.

AI is a **supporting capability** — panel art, turnarounds, scene stills — downstream of **approved** canon. Not the primary value proposition. AI may also **propose structure** (project, world, cast, outlines) before generation — creator must review, approve, edit, remove, or regenerate each part ([AI_CREATION_CONTROL_PRINCIPLE.md](./AI_CREATION_CONTROL_PRINCIPLE.md)).

Every AI feature must:
- Consume **credits**, never raw API budget directly from the user
- Be optional and contextual (inside story/comic/character workspaces — **not** a homepage prompt box)
- Preserve creator canon (bible + slot assignments as source of truth — **do not replace** internal architecture)
- Serve **finished work** (panel, cover, turnaround) — not disposable one-off generations
- **Never auto-commit** — structure assembly and generation require explicit creator approval per meaningful unit
- Support **manual-only** workflows with zero AI — same tables, same architecture
- Be visible to founders in cost and usage metrics before public launch

---

## Creator product track (parallel to monetization)

**Canonical order:** [IMPLEMENTATION_PHASES_V3.md](./IMPLEMENTATION_PHASES_V3.md). Monetization phases below map to **Phase F** unless a billing gate is legally required earlier.

| Phase | Focus | Status |
|-------|-------|--------|
| **A** | Creator workflow (finish path, stories hub, terminology) | **Next** |
| **B** | Comics (pages, panels, templates) | Planned |
| **C** | Publishing + portfolio reader | Planned |
| **D** | Explore | Planned |
| **E** | Projects · Scenes · Assets | Planned |
| **2B** | Contextual linking (world/story) | ✅ Shipped |
| **F** | Stripe · credits · AI | Deferred |
| **G–H** | Marketplace · POD | Deferred |

---

## Current baseline (Feb 2026)

| Area | Status |
|------|--------|
| Founder dashboard | V1.1 — operations cards, database health, funnel, support/feedback/moderation sections |
| Support inbox | `/dashboard/admin/support` |
| Feedback inbox | `/dashboard/admin/feedback` |
| Moderation queue | `/dashboard/admin/moderation` |
| Stripe / billing | Not started |
| Credit system | Not started |
| AI generation | Not started |
| Founder testing docs | `TESTING_CHECKLIST_V1.md`, `BETA_READINESS_PLAN.md`, `UX_BUGS_AND_CONFUSION.md` |

---

## Phase 1 — Founder Operations Complete

**Goal:** One founder command center for growth, content, support, safety, and platform health — before monetization.

Expand `/dashboard/admin` into structured sections:

### Overview
- [x] Total users *(partial — via `v_founder_platform_overview`)*
- [ ] New users (day / week / month)
- [ ] Active users (DAU / WAU / MAU)
- [x] Published portfolios
- [x] Characters / worlds / stories created
- [ ] Unified overview strip with period toggles

### Growth
- [x] Signup funnel *(basic)*
- [ ] Activation funnel *(story → finished work → publish → portfolio)* — **update from asset-only funnel**
- [ ] **Completion funnel** — stories with published chapters / first comic publish
- [ ] Retention metrics (D1 / D7 / D30 return)
- [ ] Churn metrics (accounts inactive 30d+, downgrades when billing exists)

### Content
- [x] Character / world / story counts
- [ ] Image counts (character, world, story assets)
- [ ] Portfolio publish events over time
- [ ] Avg assets per entity (partial)

### Support
- [x] Open / in progress / resolved counts
- [x] Support inbox with status updates
- [ ] Average response time (first founder action → resolved)
- [ ] SLA-style aging buckets (24h / 72h / 7d open)

### Creator Feedback
- [x] Average ratings + distribution
- [x] Feedback inbox with rating filter
- [ ] Most common complaints (notes keyword / category tagging)
- [ ] Trends over time (weekly avg rating, volume)

### Moderation
- [x] Pending / escalated / approved / removed
- [x] Moderation queue UI
- [ ] Suspended accounts count + list
- [ ] Time-to-review metrics

### Platform Health
- [x] Database health (live probe)
- [ ] Queue health (moderation backlog depth, oldest pending)
- [ ] Storage health (bucket sizes, object counts — Supabase storage API or periodic job)
- [ ] API health (PostgREST reachability, last webhook success when Stripe exists)

### Revenue (placeholder)
- [ ] MRR, paying subscribers, plan mix — UI shell only until Phase 2

### Costs (placeholder)
- [ ] AI spend, storage, Supabase — UI shell only until Phase 4

**Deliverables:** Founder dashboard V2 schema (views + server actions), retention SQL, response-time tracking on support tickets (`first_response_at`, `resolved_at` columns).

**Dependencies:** `SUPABASE_SERVICE_ROLE_KEY`, migrations applied, founder admin role.

---

## Phase 2 — Stripe Billing Foundation

**Goal:** Subscriptions and customer self-service. **No AI connection.**

### Plans

| Plan | Price | Projects | Credits / month | AI |
|------|-------|----------|-----------------|-----|
| **Free** | $0 | 3 characters, 1 world, 1 story | 0 | None |
| **Creator** | $9/mo | Unlimited | 500 | Unlocks when Phase 5 ships |
| **Pro** | $19/mo | Unlimited | 1,500 | Unlocks when Phase 5 ships |
| **Studio** | $49/mo | Unlimited | 5,000 | Unlocks when Phase 5 ships |

Free tier: unlimited **uploads** (user-provided assets), no AI generation.

### Architecture

```
┌─────────────┐     checkout      ┌──────────────┐
│  CharID UI  │ ───────────────►  │    Stripe    │
│  /settings  │ ◄── portal ────── │   Customer   │
└──────┬──────┘     webhooks      └──────┬───────┘
       │                                  │
       ▼                                  ▼
┌──────────────────────────────────────────────────┐
│  subscriptions · stripe_customers · billing_events │
│  (Supabase — source of truth for entitlements)   │
└──────────────────────────────────────────────────┘
```

### Implementation checklist

- [ ] Stripe products + prices (test + live mode)
- [ ] `stripe_customers` — `user_id`, `stripe_customer_id`
- [ ] `subscriptions` — plan, status, period, `stripe_subscription_id`
- [ ] Checkout session action (`/api/stripe/checkout`)
- [ ] Customer portal action (`/api/stripe/portal`)
- [ ] Webhook handler (`/api/stripe/webhook`) — `checkout.session.completed`, `customer.subscription.updated`, `customer.subscription.deleted`, `invoice.paid`
- [ ] Entitlement middleware — enforce project limits on Free
- [ ] Settings → Billing UI (current plan, upgrade, manage)
- [ ] Founder revenue metrics — MRR, subscribers by plan, churn, new subs (7d)

### Environment

```env
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=
STRIPE_PRICE_CREATOR=
STRIPE_PRICE_PRO=
STRIPE_PRICE_STUDIO=
```

**Do not connect AI.** Subscription only gates project limits and future credit allocation.

---

## Phase 3 — Credit System

**Goal:** All AI usage flows through credits. AI never touches money directly.

### Tables

#### `credit_accounts`
| Column | Purpose |
|--------|---------|
| `user_id` | Owner |
| `balance` | Current spendable credits |
| `monthly_allocation` | Plan grant (reset each period) |
| `period_start` / `period_end` | Billing alignment |
| `updated_at` | Last mutation |

#### `credit_transactions`
| Column | Purpose |
|--------|---------|
| `id` | UUID |
| `user_id` | Owner |
| `amount` | Signed (+ grant, − usage) |
| `type` | `monthly_allocation`, `purchase`, `usage`, `expiration`, `refund`, `admin_adjustment` |
| `reference_type` | `generation`, `subscription`, `purchase`, etc. |
| `reference_id` | Entity id |
| `metadata` | Provider, model, job id |
| `created_at` | Timestamp |

### Rules

1. **Subscribe** → webhook allocates monthly credits to `credit_accounts`
2. **Generate** → debit credits atomically before job starts; rollback on failure
3. **Purchase top-up** (optional later) → Stripe one-time → credit grant
4. **Expire** → unused promotional credits at period end (configurable; plan credits may roll or reset)
5. **Refund** → admin or failed-job automatic credit return

### Creator-facing
- Credits remaining (header or settings)
- Usage history (date, action, credits, entity link)

### Founder-facing
- Credits issued vs consumed (platform totals)
- Revenue from credit purchases (when top-ups exist)
- Burn rate by tier

**Dependencies:** Phase 2 live; credit costs defined in Phase 4.

---

## Phase 4 — AI Cost Modeling

**Goal:** Choose providers and credit pricing with positive margin.

See **[AI_COST_MODEL.md](./AI_COST_MODEL.md)** for provider comparison, per-action costs, tier economics, and break-even analysis.

**Output:** Credit price sheet (e.g. 1 credit ≈ $0.01 COGS target), which actions cost how many credits, which providers are in/out for MVP.

**Dependencies:** None for research; blocks Phase 5 pricing and Phase 3 allocation tuning.

---

## Phase 5 — AI Image Generation

**Gate:** Billing ✓ · Credits ✓ · Founder metrics ✓ · Moderation wired for AI outputs ✓

### Scope (credit-gated)

| Feature | Workspace | Notes |
|---------|-----------|-------|
| **Assemble from idea** | Create / Story | Propose project, world, cast, assets, chapter/scene **outline** — review before commit; no media yet |
| Character generation | Character | Canonical / reference — bible-informed prompts; after identity approved |
| Turnaround generation | Character | Multi-view sheet; high credit cost |
| Expression generation | Character | Variants for same character |
| World asset generation | World | Environment / prop references |
| Story scene generation | Story | Scene stills tied to **approved** scene outline |
| Comic page generation | Story | Panels from approved scene + refs; per-panel approve/regenerate |

### Per job
1. Check entitlement (paid plan or credits > 0)
2. For **structure assembly**: write to staging/review UI — commit only on creator approve
3. Reserve credits (`credit_transactions` pending)
4. Queue job (async — do not block UI)
5. Run provider API (Phase 4 selection)
6. Store result in existing image tables + slot suggestion — **never overwrite manual work without confirm**
7. Moderation scan on output
8. Confirm or release credit reservation

**No unlimited generation.** Hard caps per tier + per-day safety limits for founders.

---

## Phase 6 — Beta Launch Readiness

See **[BETA_LAUNCH_PLAN.md](./BETA_LAUNCH_PLAN.md)** for onboarding, moderation, support, billing, AI usage, legal, and analytics checklist.

Distinct from `BETA_READINESS_PLAN.md` (pre-monetization creator testing) — this phase is **paid beta / public launch** with billing and credits enabled.

---

## Recommended build order

```
Architecture accepted ──► IMPLEMENTATION_PHASES_V3.md
         │
Phases A→D ──► Creator workflow · Comics · Publish · Explore  (product first)
         │
Phase E ──► Projects · Scenes · Assets
         │
Phase F ──► Stripe · credits · AI  (MONETIZATION phases 2–5 map here)
         │
Phases G–H ──► Marketplace · POD
```

**Rationale:** Finish path before monetization; billing/AI in Phase F after publish works. See [IMPLEMENTATION_PHASES_V3.md](./IMPLEMENTATION_PHASES_V3.md).

---

## Estimated implementation effort

| Phase | Scope | Effort (1 dev) | Risk |
|-------|--------|----------------|------|
| **1** | Founder dashboard V2 | 2–3 weeks | Low — extends existing patterns |
| **2** | Stripe billing | 2–3 weeks | Medium — webhooks, idempotency, test mode |
| **3** | Credit ledger | 1–2 weeks | Medium — atomic debits, reconciliation |
| **4** | Cost model doc | 3–5 days | Low — research + spreadsheet |
| **5** | AI generation MVP | 4–8 weeks | **High** — providers, queues, moderation, UX |
| **6** | Launch readiness | 1–2 weeks + ongoing | Medium — legal, ops, support load |

**Total to first credit-gated character gen:** ~8–12 weeks after Phase 1.

---

## Risks and dependencies

| Risk | Impact | Mitigation |
|------|--------|------------|
| Service role key missing | Founder analytics + inboxes fail | Document in `.env.example`; fail with clear message |
| AI provider price changes | Margin erosion | Credits abstract COGS; adjust credit costs not list prices |
| Unlimited usage before credits | Runaway API bill | Phase 5 gate enforced in code review |
| Stripe webhook drift | Wrong entitlements | Idempotent events table; replay tooling |
| Free tier abuse (storage) | Storage cost | Soft caps + founder storage metrics (Phase 1) |
| AI outputs bypass moderation | Safety / legal | Scan before persist; queue review for high risk |
| Product becomes "AI tool" | Brand drift | UI: bible-first; AI as "Generate reference" not homepage hero |
| RLS without admin policies | Requires service role forever | Optional Phase 2b: admin RLS policies reduce key exposure |

### Hard dependencies

- Phase 5 → Phase 2, 3, 4 complete
- Phase 3 → Phase 2 (subscription → allocation)
- Phase 2 → Stripe account + products configured
- Phase 1 → `SUPABASE_SERVICE_ROLE_KEY` + founder views migrated

---

## Document index

| Document | Purpose |
|----------|---------|
| [AI_COST_MODEL.md](./AI_COST_MODEL.md) | Provider costs, margins, credit economics |
| [BETA_LAUNCH_PLAN.md](./BETA_LAUNCH_PLAN.md) | Paid beta / launch checklist |
| [BETA_READINESS_PLAN.md](./BETA_READINESS_PLAN.md) | Pre-monetization creator testing |
| [TESTING_CHECKLIST_V1.md](./TESTING_CHECKLIST_V1.md) | Founder verification flows |
| [DATABASE_REPAIR_PLAN.md](../supabase/DATABASE_REPAIR_PLAN.md) | Schema sync |

---

## Next action

1. Execute **Phase A** per [IMPLEMENTATION_PHASES_V3.md](./IMPLEMENTATION_PHASES_V3.md).
2. Run **Phase 4** cost model research in parallel (doc only — no code).
3. Defer Stripe until **Phase F** unless legally required for beta.
