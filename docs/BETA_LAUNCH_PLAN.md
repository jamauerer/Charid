# Beta Launch Plan

Paid beta and public launch readiness — **after** billing, credits, and founder operations are live.

Distinct from [BETA_READINESS_PLAN.md](./BETA_READINESS_PLAN.md) (pre-monetization creator testing without AI).

**Product rule:** CharID prioritizes **finished creative work** (comic, graphic novel, illustrated story, novel, motion comic, film project) over asset accumulation. AI is optional and credit-gated. See [FINISHED_CREATIVE_WORK_PRINCIPLE.md](./FINISHED_CREATIVE_WORK_PRINCIPLE.md).

---

## Launch gates (all required)

- [ ] Phase 1 founder dashboard operational (growth, support, moderation, health)
- [ ] Phase 2 Stripe billing live in production (test mode validated first)
- [ ] Phase 3 credit ledger with monthly allocation on subscription
- [ ] Phase 4 credit economics signed off ([AI_COST_MODEL.md](./AI_COST_MODEL.md))
- [ ] Phase 5 at least one AI flow shipped (character reference gen) with hard caps
- [ ] `DATABASE_HEALTHCHECK.sql` — all Ready
- [ ] Founder testing checklist complete ([TESTING_CHECKLIST_V1.md](./TESTING_CHECKLIST_V1.md))

---

## Onboarding

- [ ] First-run path: start story → add characters → **finish first comic** → publish → portfolio
- [ ] Free tier limits explained before first create (3 / 1 / 1)
- [ ] Upgrade prompt at limit — not before
- [ ] Billing page explains credits vs uploads ("Your art, unlimited. AI uses credits.")
- [ ] No AI on homepage or signup — bible/portfolio first
- [ ] Welcome email with public portfolio URL pattern `/u/[username]`

---

## Moderation

- [ ] All AI outputs scanned before visible in workspace
- [ ] High-risk outputs queued for founder review
- [ ] User-uploaded assets still scanned (existing flow)
- [ ] Suspension workflow documented and tested
- [ ] CSAM / illegal content escalation path (founder runbook)
- [ ] Moderation SLA target (e.g. review within 24h for escalated)

---

## Support

- [ ] Support inbox monitored daily
- [ ] Categories cover billing, AI credits, bugs, account
- [ ] Template responses for common issues
- [ ] Average response time tracked (Phase 1 metric)
- [ ] Refund policy documented (subscription + unused credits)
- [ ] Status page or banner for known outages (optional)

---

## Billing

- [ ] Stripe products: Free (implicit), Creator, Pro, Studio
- [ ] Customer portal: upgrade, downgrade, cancel, invoices
- [ ] Webhooks idempotent (`billing_events` dedup)
- [ ] Failed payment → grace period → downgrade to Free
- [ ] Project limit enforcement when downgraded (grandfather or archive policy decided)
- [ ] Tax / invoices (Stripe Tax if required)
- [ ] Founder MRR dashboard matches Stripe dashboard ±1%

---

## AI usage

- [ ] Credits visible in UI before any generate action
- [ ] Confirm dialog showing credit cost per action
- [ ] Insufficient credits → upgrade or wait for renewal (no silent overage)
- [ ] Failed generation → credits refunded automatically
- [ ] Daily platform COGS alert for founder
- [ ] No API keys in client; all generation server-side
- [ ] Rate limits per user (e.g. 50 jobs/day max regardless of credits)
- [ ] AI outputs labeled as AI-generated where legally required

---

## Creator testing

- [ ] 5–10 trusted creators complete full flows on paid plans
- [ ] At least 2 creators exhaust partial credit allocation — validate UX
- [ ] Feedback logged in [UX_BUGS_AND_CONFUSION.md](./UX_BUGS_AND_CONFUSION.md)
- [ ] Portfolio publish + public URL verified for beta cohort
- [ ] Mobile smoke test on portfolio and character workspace

---

## Analytics

- [ ] Founder dashboard: DAU/WAU, funnel, retention
- [ ] Conversion: free → paid tracked
- [ ] Credit burn by tier and action type
- [ ] Support volume by category
- [ ] Churn and downgrade reasons (optional survey on cancel)

---

## Legal requirements

- [ ] Terms of Service — AI usage, content ownership, acceptable use
- [ ] Privacy Policy — data, AI providers, subprocessors list
- [ ] Refund policy published
- [ ] Age requirement (13+ or 16+ — decide and enforce)
- [ ] DMCA / copyright process for public portfolios
- [ ] GDPR basics if EU creators (export/delete account)
- [ ] AI disclosure: user owns prompts/bible; provider terms for generated assets
- [ ] Stripe merchant agreement and business entity in place

---

## Launch sequence

| Week | Activity |
|------|----------|
| −4 | Internal paid beta (founder + 2 creators) |
| −3 | Fix Critical from UX log; verify billing webhooks |
| −2 | Expand to 10 creators; monitor COGS daily |
| −1 | Legal pages live; support runbook ready |
| 0 | Public launch — Free + paid plans; AI character gen only |
| +2 | Retrospective; tune credit costs; plan world/story gen |

---

## Success metrics (90 days post-launch)

| Metric | Target |
|--------|--------|
| Paid conversion (free → paid) | >5% of active creators |
| Gross margin (AI COGS) | >50% blended |
| Support tickets / 100 users | <10 open at once |
| Moderation escalations unresolved 48h | 0 |
| Portfolio publish rate | >30% of activated users |
| NPS or vision rating avg | >3.5/5 |

---

## Out of scope for launch

- Social features / following
- Marketplace / asset sales
- Unlimited AI
- Video generation in base plans
- Mobile native apps
- Team / studio seats

---

## Related documents

| Doc | When |
|-----|------|
| [BETA_READINESS_PLAN.md](./BETA_READINESS_PLAN.md) | Now — pre-monetization testing |
| [MONETIZATION_AND_AI_ROADMAP.md](./MONETIZATION_AND_AI_ROADMAP.md) | Build phases |
| [AI_COST_MODEL.md](./AI_COST_MODEL.md) | Before pricing lock |
| [TESTING_CHECKLIST_V1.md](./TESTING_CHECKLIST_V1.md) | Founder verification |
