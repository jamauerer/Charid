# AI Cost Model

Research document for CharID Phase 4. **Estimates only** — verify against provider dashboards before locking credit pricing. Prices reflect public API rates as of **June 2026**.

**CharID rule:** Users spend **credits**. The platform absorbs provider COGS and must maintain margin per tier.

---

## Assumptions

| Assumption | Value |
|------------|-------|
| Target credit COGS | ~$0.008–0.012 per credit (internal) |
| Retail credit value (implied) | ~$0.018–0.025 per credit (via subscription) |
| Primary image resolution | 1024×1024 (character refs, scenes) |
| Turnaround sheet | 4–6 images (front/side/back + canonical) |
| Comic page | 1–4 panel images |
| Video (future) | 5s clip default |

---

## Provider summary

| Provider | Best for | Billing model | CharID fit |
|----------|----------|---------------|------------|
| **OpenAI GPT Image** | Prompt adherence, editing | Per image (token-derived) | Character refs, bible-guided edits |
| **Replicate (Flux / SDXL)** | Cost-effective batch | Per image or GPU-second | Turnarounds, world assets, volume |
| **Flux (BFL direct / fal.ai)** | Quality / speed tiers | Per image | Production character scenes |
| **SDXL** | Budget drafts | Per image (~$0.003) | Low-credit previews only |
| **Kling (via Replicate)** | Motion / short clips | Per second (~$0.05/s) | Story animatics — post-MVP |
| **Runway** | Cinematic video | Credits ($0.01/credit) | Premium story video — post-MVP |
| **Luma (Ray3 API)** | I2V / V2V | Per video (resolution-based) | World flythrough — post-MVP |

**MVP recommendation:** Replicate **Flux Dev** or **Schnell** for bulk; **GPT Image 1 Mini / 1.5** for bible-faithful character generation. Defer video to Phase 5b.

---

## OpenAI Images (GPT Image family)

DALL·E 3 API deprecated May 2026. Use GPT Image models.

| Model | Quality | ~Cost / image (1024²) | Use case |
|-------|---------|------------------------|----------|
| GPT Image 1 Mini | Low | $0.005 | Draft previews |
| GPT Image 1 Mini | Medium | ~$0.017 | Quick iterations |
| GPT Image 1.5 | Standard | $0.04 | Production character |
| GPT Image 1.5 | High | up to $0.19 | Hero canonical only |
| GPT Image 2 | Standard | $0.04–0.08 | Future default |

### CharID action estimates (OpenAI 1.5 standard)

| Action | Images | Est. COGS |
|--------|--------|-----------|
| Single character ref | 1 | $0.04 |
| Turnaround sheet | 4 | $0.16 |
| Expression set (3) | 3 | $0.12 |
| World establishing shot | 1 | $0.04 |
| Story scene | 1 | $0.04 |
| Comic page (4 panels) | 4 | $0.16 |

---

## Replicate

Official models use **flat per-output** pricing (predictable).

| Model | Cost / image | Notes |
|-------|--------------|-------|
| FLUX.1 Schnell | $0.003 | Fast, lower fidelity |
| SDXL | $0.005–0.015 | Budget (GPU time varies) |
| FLUX.1 Dev | $0.025 | Balanced quality |
| FLUX 1.1 Pro | $0.04 | Production |
| Ideogram v3 Quality | $0.09 | Text-heavy (avoid for MVP) |

### Video (Replicate-hosted)

| Model | Cost | 5s clip |
|-------|------|---------|
| Kling 2.1 Standard | ~$0.05/s | ~$0.25 |
| Wan 720p | ~$0.25/s | ~$1.25 |

---

## Flux (direct / fal.ai)

| Model | fal.ai | Replicate | Notes |
|-------|--------|-----------|-------|
| Flux 2 Schnell | $0.003 | $0.003 | Drafts |
| Flux 2 Dev | $0.025 | $0.030 | **Recommended MVP workhorse** |
| Flux 2 Pro | $0.05 | $0.055 | Hero assets |

---

## SDXL

| Variant | ~Cost | CharID role |
|---------|-------|-------------|
| SDXL base | $0.003–0.005 | "Sketch" tier — 1 credit previews |
| Not for canonical slots | — | Never auto-assign to Canonical role |

---

## Kling

Access typically via Replicate or official API partners.

| Output | Est. cost | CharID credits (draft) |
|--------|-----------|------------------------|
| 5s 720p clip | $0.25–0.50 | 50–100 credits |
| 10s clip | $0.50–1.00 | 100–200 credits |

**Verdict:** Not viable for Creator tier heavy use. Pro/Studio only, or post-MVP.

---

## Runway

API: **1 credit = $0.01 USD**

| Model | Credits / second | 5s cost |
|-------|------------------|---------|
| gen4_turbo | 5 | $0.25 (500 credits) |
| gen4.5 | 12 | $0.60 |
| gen3a_turbo (deprecated Jul 2026) | 5 | $0.25 |

**Verdict:** Premium story marketing clips only. Not included in base monthly allocations.

---

## Luma (Ray3 API)

Pay-as-you-go (separate from consumer subscriptions).

| Type | 720p 5s | 1080p 5s |
|------|---------|----------|
| T2V / I2V (SDR) | ~$0.30 | ~$1.20 |
| V2V | ~$1.44 | ~$2.16 |

**Verdict:** World flythrough / trailer tier. Studio add-on or credit pack.

---

## CharID credit pricing (proposed)

Map internal COGS to user-facing credits. Round for UX.

| Action | Provider (MVP) | Est. COGS | Credits charged | Implied $/credit @ COGS |
|--------|----------------|-----------|-----------------|-------------------------|
| Draft image | SDXL / Schnell | $0.003 | 1 | $0.003 |
| Character reference | Flux Dev | $0.025 | 5 | $0.005 |
| Character reference (premium) | GPT Image 1.5 | $0.04 | 8 | $0.005 |
| Turnaround (4 views) | Flux Dev × 4 | $0.10 | 40 | $0.0025 |
| Expression pack (3) | Flux Dev × 3 | $0.075 | 25 | $0.003 |
| World asset | Flux Dev | $0.025 | 5 | $0.005 |
| Story scene | Flux Dev | $0.025 | 5 | $0.005 |
| Comic page (4 panels) | Flux Dev × 4 | $0.10 | 35 | $0.0029 |
| Video 5s (future) | Kling / Runway turbo | $0.25+ | 100+ | $0.0025 |

---

## Cost per tier (monthly)

Plan credits from roadmap: Free 0 · Creator 500 · Pro 1,500 · Studio 5,000.

**Scenario A — moderate use (all Flux Dev @ 5 credits/image)**

| Tier | Credits | ~Images | Est. COGS | Revenue | Gross margin |
|------|---------|---------|-----------|---------|--------------|
| Free | 0 | 0 | $0 | $0 | — |
| Creator | 500 | 100 | $2.50 | $9 | **72%** |
| Pro | 1,500 | 300 | $7.50 | $19 | **61%** |
| Studio | 5,000 | 1,000 | $25 | $49 | **49%** |

**Scenario B — heavy turnaround use (40 credits each)**

| Tier | Turnarounds/mo | Est. COGS | Revenue | Gross margin |
|------|----------------|-----------|---------|--------------|
| Creator | 12 | $3.00 | $9 | 67% |
| Pro | 37 | $9.25 | $19 | 51% |
| Studio | 125 | $31 | $49 | 37% |

**Scenario C — mixed (70% single refs, 30% turnarounds)**

| Tier | Est. COGS | Revenue | Gross margin |
|------|-----------|---------|--------------|
| Creator | ~$3.50 | $9 | ~61% |
| Pro | ~$10 | $19 | ~47% |
| Studio | ~$32 | $49 | ~35% |

*Margin excludes Supabase, Stripe (~3%), support, storage, and founder time.*

---

## Break-even estimates

| Metric | Estimate |
|--------|----------|
| Avg COGS per paying user (mixed use) | $4–8/mo |
| Stripe + infra per user | ~$1–2/mo |
| Break-even subscribers (infra only) | ~50–100 Creator @ $9 |
| Safe AI burn cap (platform monthly) | Set founder alert at $500 COGS until Phase 1 cost dashboard live |

**Power user risk:** One Studio user consuming 5,000 credits on turnarounds ≈ $31 COGS — still under $49, but monitor.

**Abuse risk:** Free tier must have **zero** AI API routes; project limits enforced server-side.

---

## Financial viability by provider

| Provider | Viable for MVP? | Reason |
|----------|-----------------|--------|
| Flux Dev (Replicate/fal) | **Yes** | Best cost/quality for volume |
| SDXL / Schnell | **Yes** | Draft tier only |
| GPT Image 1.5 | **Yes (selective)** | Premium character, higher credit cost |
| GPT Image High | **Caution** | $0.19/image destroys margin |
| Kling / Runway / Luma video | **Defer** | COGS too high for included credits |
| Ideogram / Flux Pro | **Optional** | Studio upsell only |

---

## Recommended credit economics (lock before Phase 2)

1. **1 credit ≈ $0.005 COGS target** (blended)
2. **Creator 500 credits** ≈ $2.50–4 COGS budget
3. **Never expose provider choice to users** — founder picks backend per action type
4. **Turnaround = highest credit cost** — discourages spam, reflects true COGS
5. **Video not included** in base plans at launch; sell credit packs later
6. Re-run this model quarterly — provider prices move

---

## Related

- [MONETIZATION_AND_AI_ROADMAP.md](./MONETIZATION_AND_AI_ROADMAP.md) — Phases 2–5
- OpenAI: [Image generation pricing](https://platform.openai.com/docs/pricing)
- Replicate: [replicate.com/pricing](https://replicate.com/pricing)
- Runway: [docs.dev.runwayml.com/guides/pricing](https://docs.dev.runwayml.com/guides/pricing)
- Luma: [lumalabs.ai/api](https://lumalabs.ai/api)
