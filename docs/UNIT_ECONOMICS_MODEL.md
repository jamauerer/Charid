# Unit Economics Model

**Status:** Financial model draft — not financial advice. Update quarterly with actual Stripe, Supabase, and provider invoices.

**Goal:** Determine whether CharID can become **sustainably profitable** without venture capital — supporting founder salary, reinvestment, and a small team while remaining creator-first.

**Related:** [AI_COST_MODEL.md](./AI_COST_MODEL.md) · [MONETIZATION_AND_AI_ROADMAP.md](./MONETIZATION_AND_AI_ROADMAP.md) · [AI_PROVIDER_ARCHITECTURE.md](./AI_PROVIDER_ARCHITECTURE.md) · [CREATOR_ECONOMY_AND_RIGHTS.md](./CREATOR_ECONOMY_AND_RIGHTS.md)

---

## Executive summary

| Question | Answer (base case) |
|----------|-------------------|
| Can subscription + credits cover AI COGS? | **Yes**, if blended COGS ≤ **$0.005/credit** and utilization ≤ **~70%** of allocation |
| Can one founder go full-time bootstrapped? | **~700 paying users** (~10k registered @ 7% conversion) — **~$6k+/mo net** before salary |
| Can CharID hire one engineer? | **~1,000+ paying** or **~$18k/mo net** after founder at market comp |
| Biggest margin risk | Heavy **turnaround/video** use on Studio tier; **100% credit utilization** by all payers |
| Path without VC | Low burn infra, credits gate AI, no paid ads until net-positive, credit packs as margin booster |

**Product constraint:** Every generation must remain profitable **after** AI + infra allocation + Stripe + support — enforced via credit pricing, not post-hoc subsidies.

---

## Model assumptions (base case)

| Input | Value | Notes |
|-------|-------|-------|
| Registered → paying conversion | 4% → 7% | Improves with maturity (100 → 10k users) |
| Plan mix (paying users) | 55% Creator · 35% Pro · 10% Studio | Indie-heavy early base |
| Monthly credit utilization | 55% of allocation | Not all payers max credits |
| Blended AI COGS | **$0.005 / credit consumed** | Flux Dev–weighted ([AI_COST_MODEL.md](./AI_COST_MODEL.md)) |
| Credit pack attach rate | 12% of payers / month | One-time top-ups |
| Avg credit pack purchase | See packs below | Weighted to mid pack |
| Stripe fees | 2.9% + $0.30 / transaction | US cards; +1% intl buffer in stress test |
| Churn (monthly) | 6% | Creator SaaS benchmark; improve with portfolio lock-in |
| Free tier AI | **Zero** | Non-negotiable for margin |

---

## Revenue

### Subscription plans

| Plan | Price | Monthly credits | Implied $/credit (if fully used) |
|------|-------|-----------------|----------------------------------|
| **Free** | $0 | 0 | — |
| **Creator** | $9 | 500 | $0.018 |
| **Pro** | $19 | 1,500 | $0.013 |
| **Studio** | $49 | 5,000 | $0.010 |

Free tier: 3 characters / 1 world / 1 story, unlimited **uploads**, no AI.

### Credit packs (one-time)

Packs priced **above** subscription implied rate to avoid cannibalizing MRR.

| Pack | Credits | Price | $/credit | vs Creator plan |
|------|---------|-------|----------|-----------------|
| **Starter** | 500 | **$14.99** | $0.030 | +67% premium |
| **Standard** | 1,500 | **$39.99** | $0.027 | +50% premium |
| **Studio boost** | 5,000 | **$119.99** | $0.024 | +44% premium |

Pack revenue is **high-margin** when purchased by users who already exhausted allocation (incremental, often video/turnaround).

### Blended revenue per paying user (subscription only)

Weighted plan mix:

```
0.55 × $9 + 0.35 × $19 + 0.10 × $49 = $4.95 + $6.65 + $4.90 = $16.50 MRR / payer
```

With 12% buying one pack @ $35 avg / month:

```
$16.50 + (0.12 × $35) = $20.70 / paying user / month
```

---

## Credit economics

### Credits per tier (monthly allocation)

| Tier | Credits / month | Resets |
|------|-----------------|--------|
| Free | 0 | — |
| Creator | 500 | Billing period |
| Pro | 1,500 | Billing period |
| Studio | 5,000 | Billing period |

Unused plan credits: **expire at period end** (recommended) or soft cap at 2× rollover — expiration protects COGS forecast.

### Credits per generation type

Aligned with [AI_PROVIDER_ARCHITECTURE.md](./AI_PROVIDER_ARCHITECTURE.md) outcomes. CharID sets price; router picks provider.

| Outcome | Credits | Est. AI COGS | Revenue @ $0.018/cr* | Gross margin (AI only) |
|---------|---------|--------------|----------------------|----------------------|
| Draft image | 1 | $0.003 | $0.018 | 83% |
| Character reference | 5 | $0.025 | $0.090 | 72% |
| Character reference (premium) | 8 | $0.040 | $0.144 | 72% |
| World asset | 5 | $0.025 | $0.090 | 72% |
| Story scene | 5 | $0.025 | $0.090 | 72% |
| Expression pack (3) | 25 | $0.075 | $0.450 | 83% |
| Turnaround (4 views) | 40 | $0.100 | $0.720 | 86% |
| Comic page (4 panels) | 35 | $0.100 | $0.630 | 84% |
| Story text assist (chapter) | 10 | $0.015 | $0.180 | 92% |
| Character chat (session) | 3 | $0.010 | $0.054 | 81% |
| Video 5s (720p) | 100 | $0.250 | $1.800 | 86% |

\*Blended Creator-tier credit value; Pro/Studio implied $/credit is lower — see **utilization risk** below.

### Per-action fully loaded profitability

Each job must cover **AI + infra + Stripe + support** allocation:

| Cost bucket | Allocation per credit consumed |
|-------------|-------------------------------|
| AI COGS | $0.005 |
| Infrastructure | $0.002 – $0.008 (scales down with volume) |
| Stripe | ~3% of credit retail value |
| Support / moderation | $0.001 – $0.003 |

**Example — Character reference (5 credits):**

| Line | Amount |
|------|--------|
| Retail value (@ $0.018/cr) | $0.090 |
| AI COGS | −$0.025 |
| Infra + ops (@ $0.004/cr × 5) | −$0.020 |
| Stripe (3%) | −$0.003 |
| Support (@ $0.002/cr × 5) | −$0.010 |
| **Contribution margin** | **~$0.032 (36%)** |

**Example — Video 5s (100 credits):**

| Line | Amount |
|------|--------|
| Retail (@ $0.018/cr) | $1.800 |
| AI COGS | −$0.250 |
| Infra + ops | −$0.400 |
| Stripe | −$0.054 |
| Support | −$0.200 |
| **Contribution margin** | **~$0.896 (50%)** |

**Rule:** Video and premium GPT paths only on **Pro/Studio** or **credit packs** — never on Creator monthly allocation alone at heavy use.

### Credit pack pricing rationale

| Pack | Target buyer | Purpose |
|------|--------------|---------|
| 500 @ $14.99 | Creator tier | Turnaround burst without upgrade |
| 1,500 @ $39.99 | Pro tier | Scene/comic month overflow |
| 5,000 @ $119.99 | Studio / video | Video + turnaround production |

---

## Costs

### Infrastructure (monthly estimates)

| Service | 100 users | 1k users | 5k users | 10k users |
|---------|-----------|----------|----------|-----------|
| **Supabase** (DB + auth + storage) | $25 | $75 | $275 | $599 |
| **Vercel** (hosting) | $20 | $20 | $150 | $350 |
| **Storage** (100GB → 2TB) | $15 | $80 | $400 | $900 |
| **Bandwidth / egress** | $10 | $50 | $200 | $500 |
| **Email** (Resend/Postmark) | $0 | $20 | $40 | $80 |
| **Domain / misc** | $5 | $10 | $20 | $30 |
| **Total infra** | **~$75** | **~$255** | **~$1,085** | **~$2,459** |

Assumes efficient assets (WebP), private default, no public CDN abuse.

### AI (variable — scales with credits consumed)

```
AI spend = Σ (credits_consumed × $0.005) + video/chat premium overhead
```

| Category | COGS driver | Control |
|----------|-------------|---------|
| **Images** | Flux Dev / Schnell | Router defaults |
| **Turnarounds** | 4× image pipeline | 40 credits / job |
| **Story generation** | LLM tokens (cheap) | 10 credits / chapter assist |
| **Character chat** | LLM session | 3 credits / session; cap/day |
| **Video** | Runway/Kling | 100+ credits; pack or Studio only |

**Platform AI budget caps (founder alerts):**

| Stage | Monthly AI cap |
|-------|----------------|
| Beta | $500 |
| 1k users | $2,000 |
| 5k users | $8,000 |
| 10k users | $18,000 |

### Support

| Scale | Model | Monthly cost |
|-------|-------|--------------|
| &lt; 500 users | Founder + docs | $0 cash (time cost) |
| 500 – 2k | Founder + templates | $200 – $500 |
| 2k – 10k | Part-time CS | $800 – $1,500 |
| 10k+ | Dedicated support | $3,500 – $5,000 |

Allocate **$0.50 – $2.00 / paying user / month** in scenarios.

### Moderation

| Scale | Cost |
|-------|------|
| Early | Heuristic + OpenAI Moderation API ~$50 – $200/mo |
| Growth | + founder review time; optional contractor $500/mo |
| Scale | Semi-automated + 0.25 FTE trust & safety |

### Staff (cash compensation)

| Stage | Roles | Monthly burn |
|-------|-------|--------------|
| **Pre-revenue** | Founder only | $0 salary (sweat) |
| **Survival** | Founder draw | $4,000 |
| **Full-time founder** | Founder | $8,000 – $10,000 |
| **Small team** | Founder + engineer | $18,000 – $22,000 |
| **Growth** | + support + marketing | $28,000 – $35,000 |

Engineer = $8k – $12k/mo contract or salary depending on location.

---

## Founder compensation model

| Stage | Monthly target | Requires (approx.) |
|-------|----------------|---------------------|
| **Survival income** | $4,000 | ~300 paying / ~5k registered @ 6% |
| **Full-time founder** | $10,000 | ~700 paying / ~10k registered @ 7% |
| **Founder + 1 engineer** | $20,000 net after ops | ~1,200 paying / ~17k registered |
| **Growth team (3 FTE)** | $35,000+ net | ~2,500+ paying / ~35k registered |

*Net = revenue − infra − AI − Stripe − support − moderation − **before** founder salary.*

Bootstrapped rule: **Founder salary is paid from net margin, not revenue.** Reinvest only after 3-month rolling net positive.

---

## Scenario models

**Definitions:** “Users” = registered accounts. Paying = active subscribers. Revenue = MRR + credit packs. Costs = infra + AI + Stripe + support + moderation (no founder salary in **Net ops** row).

**Average credits allocated per payer:**  
`(0.55×500 + 0.35×1500 + 0.10×5000) = 1,050 credits/mo`

**Credits consumed per payer:** `1,050 × 55% utilization = 578 credits`

---

### Scenario A — 100 users

| Metric | Value |
|--------|-------|
| Paying users (4%) | **4** |
| MRR (subs) | $66 |
| Credit packs (12% × 4 × $35) | $17 |
| **Total revenue** | **~$83/mo** |
| Infra | $75 |
| AI (4 × 578 × $0.005) | $12 |
| Stripe + support + mod | $25 |
| **Total costs** | **~$112/mo** |
| **Net ops (pre-founder)** | **−$29/mo** |
| Gross margin (rev − AI) | 86% |
| Net margin | **Negative** |
| Founder income capacity | **$0** |
| Hiring capacity | **0** |

*Expected: pre-profit validation phase. Do not spend on ads.*

---

### Scenario B — 1,000 users

| Metric | Value |
|--------|-------|
| Paying users (5%) | **50** |
| MRR (subs) | $825 |
| Credit packs | $210 |
| **Total revenue** | **~$1,035/mo** |
| Infra | $255 |
| AI (50 × 578 × $0.005) | $145 |
| Stripe (~3%) | $31 |
| Support + moderation | $175 |
| **Total costs** | **~$606/mo** |
| **Net ops (pre-founder)** | **~$429/mo** |
| Gross margin (rev − AI) | 86% |
| Net margin | **~41%** |
| Founder income capacity | **Survival partial (~$429)** |
| Hiring capacity | **0** |

---

### Scenario C — 5,000 users

| Metric | Value |
|--------|-------|
| Paying users (6%) | **300** |
| MRR (subs) | $4,950 |
| Credit packs | $1,260 |
| **Total revenue** | **~$6,210/mo** |
| Infra | $1,085 |
| AI (300 × 578 × $0.005) | $867 |
| Stripe | $186 |
| Support + moderation | $750 |
| **Total costs** | **~$2,888/mo** |
| **Net ops (pre-founder)** | **~$3,322/mo** |
| Gross margin (rev − AI) | 86% |
| Net margin | **~53%** |
| Founder income capacity | **Survival (~$4k) — tight** |
| Hiring capacity | **0 FTE; 1 contractor possible** |

---

### Scenario D — 10,000 users

| Metric | Value |
|--------|-------|
| Paying users (7%) | **700** |
| MRR (subs) | $11,550 |
| Credit packs | $2,940 |
| **Total revenue** | **~$14,490/mo** |
| Infra | $2,459 |
| AI (700 × 578 × $0.005) | $2,023 |
| Stripe | $435 |
| Support + moderation | $1,900 |
| **Total costs** | **~$6,817/mo** |
| **Net ops (pre-founder)** | **~$7,673/mo** |
| Gross margin (rev − AI) | 86% |
| Net margin | **~53%** |
| Founder income capacity | **Full-time founder (~$8–10k)** |
| Hiring capacity | **Part-time eng OR full-time at lower comp** |

---

### Scenario summary table

| Scenario | Users | Paying | Revenue/mo | Costs/mo | Net ops | Net margin | Founder FT? | Hire? |
|----------|-------|--------|------------|----------|---------|------------|-------------|-------|
| **A** | 100 | 4 | $83 | $112 | −$29 | — | No | No |
| **B** | 1,000 | 50 | $1,035 | $606 | $429 | 41% | No | No |
| **C** | 5,000 | 300 | $6,210 | $2,888 | $3,322 | 53% | Survival | Contractor |
| **D** | 10,000 | 700 | $14,490 | $6,817 | $7,673 | 53% | **Yes** | Part-time |

---

## Sensitivity analysis

| Stress | Impact | Mitigation |
|--------|--------|------------|
| **80% credit utilization** | AI +37% | Hard monthly caps; pack upsell |
| **Turnaround-heavy mix** | AI +20–40% | 40-credit price; router uses Flux not GPT |
| **Conversion only 3%** | Revenue −40% | Portfolio virality; founder-led onboarding |
| **Churn 10%/mo** | MRR leak | Bible lock-in, annual plans (−20% price) |
| **Studio 20% of payers** | AI +15%, revenue +25% | Monitor Studio COGS weekly |
| **Video in base plans** | **Margin collapse** | Video = packs / Studio overflow only |
| **Intl Stripe +2%** | Net −2% | Price includes buffer |

---

## Path to profitability without VC

```
Phase 1 — Founder testing (now)
  Revenue: $0          Burn: ~$75/mo infra
  Goal: retention, not growth

Phase 2 — Stripe + credits (no AI)
  Revenue: first subs   Prove billing

Phase 3 — AI (image only, credit-gated)
  Target: 50 paying @ $1k MRR, net ops positive

Phase 4 — 300 paying (Scenario C)
  Founder survival salary from net ops

Phase 5 — 700 paying (Scenario D)
  Full-time founder + part-time help

Phase 6 — 1,200+ paying
  First engineer from net ops > $20k/mo
```

**No VC required if:**
- Growth is organic (portfolio links, creator word-of-mouth)
- AI stays credit-gated with **no free-tier generation**
- Founder salary scales with net ops, not hope
- Credit packs capture power-user margin

**VC optional only for:** accelerated marketing, team size, or video infrastructure pre-revenue — not for core survival.

---

## KPIs to track (Founder Dashboard — future)

| KPI | Target |
|-----|--------|
| MRR | Growing 8%+ mo/mo early |
| Paying conversion | ≥ 5% |
| ARPU (paying) | ≥ $20/mo with packs |
| AI COGS / revenue | ≤ 15% |
| Infra / revenue | ≤ 20% at scale |
| Net margin (pre-founder) | ≥ 50% at 5k+ users |
| Credits consumed / allocated | 45–65% sweet spot |
| LTV / CAC | LTV > 3× CAC when paid acquisition starts |

---

## Decisions to lock before Stripe

1. **Credit pack prices** — $14.99 / $39.99 / $119.99
2. **Plan credits** — 500 / 1,500 / 5,000 (unchanged)
3. **Unused credits expire** — yes, at period end
4. **Video not in Creator included credits** at launch — packs or Studio
5. **Annual plans** — 2 months free (improves LTV, helps bootstrap cash)

---

## Version

| Version | Date | Notes |
|---------|------|-------|
| 0.1 | 2026-06-14 | Initial unit economics pre-Stripe |

**Next update:** After 90 days of billing data — replace assumptions with actuals from Stripe + `ai_job_steps` COGS.
