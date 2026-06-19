# CharID Business Plan V1

**Status:** Founder reference — aligns product, revenue, costs, and growth with creator-first principles.  
**Related:** [CHARID_VISION.md](./CHARID_VISION.md) · [CREATOR_ECONOMY_AND_RIGHTS.md](./CREATOR_ECONOMY_AND_RIGHTS.md) · [UNIT_ECONOMICS_MODEL.md](./UNIT_ECONOMICS_MODEL.md) · [MONETIZATION_AND_AI_ROADMAP.md](./MONETIZATION_AND_AI_ROADMAP.md)

---

## Mission

Build the best platform for **finishing, publishing, and monetizing** creative work — comics, novels, motion, and entire universes.

**AI supports creativity. AI is not the product.**

**AI accelerates creation; AI never reduces creator control.** Manual, AI-assisted, and hybrid workflows share one architecture ([AI_CREATION_CONTROL_PRINCIPLE.md](./AI_CREATION_CONTROL_PRINCIPLE.md)).

The product is **finished creative work, continuity, canon, ownership, and publishing** — not asset generation for its own sake.

> **Aligns with:** [CHARID_VISION_V3.md](./CHARID_VISION_V3.md) · [FINISHED_CREATIVE_WORK_PRINCIPLE.md](./FINISHED_CREATIVE_WORK_PRINCIPLE.md) · [FOUNDER_TESTING_LESSONS_ROUND_1.md](./FOUNDER_TESTING_LESSONS_ROUND_1.md)

---

## Revenue Model

### Subscription Plans

#### Free

**Purpose:** Learn the platform · build a small project · upgrade when ready

| | |
|---|---|
| **Limits** | 3 characters · 1 world · 1 story · no AI generation · unlimited uploads |
| **Price** | **$0** |

---

#### Creator

**Purpose:** Independent creators

| | |
|---|---|
| **Price** | **$9/month** |
| **Includes** | Unlimited projects · **500 monthly credits** |

---

#### Pro

**Purpose:** Power creators

| | |
|---|---|
| **Price** | **$19/month** |
| **Includes** | Unlimited projects · **1,500 monthly credits** |

---

#### Studio

**Purpose:** Teams and serious creators

| | |
|---|---|
| **Price** | **$49/month** |
| **Includes** | Unlimited projects · **5,000 monthly credits** |

---

## Credit Economy

Creators never purchase AI directly.

Creators purchase **credits**.

Credits abstract:

- Provider cost
- Future provider changes
- Margin requirements

CharID chooses providers; creators choose **outcomes** ([AI_PROVIDER_ARCHITECTURE.md](./AI_PROVIDER_ARCHITECTURE.md)).

### Suggested credit costs

| Outcome | Credits |
|---------|---------|
| Character portrait | 5 |
| Expression | 3 |
| Turnaround view | 10 |
| Scene generation | 15 |
| Story illustration | 20 |
| Comic page | 25 |
| Story generation | 5 |
| Character chat | 1 |
| Video generation | 100 |

*Turnaround views are billed per view; a full multi-angle sheet is multiple actions.*

### Credit packs (one-time)

| Pack | Price |
|------|-------|
| 500 credits | **$5** |
| 1,500 credits | **$12** |
| 5,000 credits | **$35** |

Packs supplement monthly allocation — especially for bursts, turnarounds, and video.

---

## Unit economics goal

Every generation action must remain **profitable**.

**Target:** Revenue from credits should be at least **4× estimated AI cost**.

| | Example |
|---|---------|
| AI cost | $0.05 |
| Credit value (at point of use) | $0.20 |
| Gross margin | **75%** |

This margin funds:

- Infrastructure
- Moderation
- Support
- Development
- Founder income
- Hiring

Validate per-action math before Stripe launch ([UNIT_ECONOMICS_MODEL.md](./UNIT_ECONOMICS_MODEL.md) · [AI_COST_MODEL.md](./AI_COST_MODEL.md)). If blended retail credit value falls below 4× COGS for an outcome, **raise credit cost** or **restrict provider tier** — never subsidize unlimited generation.

**Implied credit value (reference):**

| Source | $/credit |
|--------|----------|
| Creator plan ($9 ÷ 500) | $0.018 |
| Pro plan ($19 ÷ 1,500) | $0.013 |
| Studio plan ($49 ÷ 5,000) | $0.010 |
| 500 pack ($5 ÷ 500) | $0.010 |
| 5,000 pack ($35 ÷ 5,000) | $0.007 |

High-credit outcomes (video, comic page) should be priced so that even at Studio implied rates, COGS stays ≤ 25% of credit revenue.

---

## Cost categories

### Infrastructure

- Supabase
- Vercel
- Storage
- Bandwidth
- Email
- Monitoring

### AI

- Image generation
- Image editing
- Story generation
- Character chat
- Video generation

### Operations

- Support
- Moderation
- Legal
- Accounting

### Team

- Founder salary
- Contractors
- Employees

---

## Growth scenarios

### Stage 1 — 100 users

| | |
|---|---|
| **Target** | Validate product |
| **Goal** | Cover platform costs |
| **Founder income** | Minimal |

---

### Stage 2 — 1,000 users

| | |
|---|---|
| **Goal** | Founder salary |
| **Target** | **$4,000–$10,000 MRR** |
| **Possible** | Full-time founder |

---

### Stage 3 — 5,000 users

| | |
|---|---|
| **Goal** | Hire first employees |
| **Target** | **$25,000–$50,000+ MRR** |
| **Possible** | Support · engineering · moderation |

---

### Stage 4 — 10,000+ users

| | |
|---|---|
| **Goal** | Sustainable creator platform |
| **Possible** | Multiple employees · dedicated support · advanced AI systems · mobile apps |

*Scenario detail and margin math: [UNIT_ECONOMICS_MODEL.md](./UNIT_ECONOMICS_MODEL.md)*

---

## AI provider strategy

CharID should **not** depend on a single AI company.

| Category | Providers |
|----------|-----------|
| **Image** | OpenAI · Flux · Replicate |
| **Video** | Kling · Runway · Luma |
| **Voice** | ElevenLabs |
| **Moderation** | OpenAI Moderation · future alternatives |

Routing, fallbacks, and cost tracking: [AI_PROVIDER_ARCHITECTURE.md](./AI_PROVIDER_ARCHITECTURE.md).

---

## Creator rights

Creators own:

- Characters
- Worlds
- Stories
- Uploaded assets
- Generated assets

| Setting | Default |
|---------|---------|
| **Privacy** | Private |
| **Public** | Opt-in |
| **Remix** | Opt-in |
| **Commercial rights** | Per subscription and platform terms |

Full policy: [CREATOR_ECONOMY_AND_RIGHTS.md](./CREATOR_ECONOMY_AND_RIGHTS.md).

---

## Success metrics

CharID succeeds when:

1. Creators **stay** because continuity is valuable.
2. AI costs remain **predictable**.
3. The platform is **profitable**.
4. Creators **retain ownership**.
5. Revenue supports founder income, growth, employees, and long-term sustainability.

**The goal is not maximum extraction.**

**The goal is a sustainable creator-first platform.**

---

## Implementation sequence (summary)

1. Founder testing — [TESTING_CHECKLIST_V1.md](./TESTING_CHECKLIST_V1.md)
2. Stripe subscriptions — [MONETIZATION_AND_AI_ROADMAP.md](./MONETIZATION_AND_AI_ROADMAP.md) Phase 2
3. Credit ledger — Phase 3
4. AI (credit-gated) — Phase 5
5. Paid beta — [BETA_LAUNCH_PLAN.md](./BETA_LAUNCH_PLAN.md)

**Do not ship AI before billing and credits.**

---

## Version

| Version | Date | Notes |
|---------|------|-------|
| 1.0 | 2026-06-14 | Initial business plan |
