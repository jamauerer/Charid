# AI Provider Architecture

**Status:** Architecture spec — pre-implementation.  
**Product rule:** Creators choose **outcomes**. CharID chooses **providers**.  
**Related:** [AI_COST_MODEL.md](./AI_COST_MODEL.md) · [MONETIZATION_AND_AI_ROADMAP.md](./MONETIZATION_AND_AI_ROADMAP.md) · [AI_CREATION_CONTROL_PRINCIPLE.md](./AI_CREATION_CONTROL_PRINCIPLE.md) · [CHARID_VISION_V3.md](./CHARID_VISION_V3.md)

**Control rule:** AI accelerates creation, never reduces it. Structure assembly and generation both require creator **review · approve · edit · remove · regenerate** — same architecture for manual and AI paths.

---

## Purpose

CharID must support multiple AI backends (OpenAI, Flux, Replicate, Kling, Runway, Luma, ElevenLabs, others) **without exposing provider complexity to creators**. Routing, cost, credits, fallbacks, and observability are platform concerns — hidden behind outcome-based actions inside character, world, and story workspaces.

---

## Stack

```
┌─────────────────────────────────────────────────────────────┐
│  Creator                                                     │
│  (never sees provider names, API keys, or model IDs)         │
└───────────────────────────────┬─────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────┐
│  Character / World / Story workspace                         │
│  Outcome actions: Generate Character, Turnaround, Scene…     │
└───────────────────────────────┬─────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────┐
│  CharID Continuity Layer                                     │
│  Bibles · slot assignments · reference graphs · context      │
│  (assemble-*-context, combined context packet — server-only) │
└───────────────────────────────┬─────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────┐
│  Generation Orchestrator                                     │
│  Credit reserve → job queue → moderation → persist assets    │
└───────────────────────────────┬─────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────┐
│  Provider Router                                             │
│  Category + outcome + flags + health → primary / fallback    │
└───────────────────────────────┬─────────────────────────────┘
                                │
          ┌─────────────────────┼─────────────────────┐
          ▼                     ▼                     ▼
   ┌─────────────┐       ┌─────────────┐       ┌─────────────┐
   │  OpenAI     │       │  Replicate  │       │  Runway     │
   │  Flux/fal   │       │  Kling      │       │  Luma       │
   │  ElevenLabs │       │  …          │       │  …          │
   └─────────────┘       └─────────────┘       └─────────────┘
```

---

## Creator-facing outcomes (stable API)

These are the **only** generation entry points in the product UI. Wording and credit costs stay constant when providers change.

| Outcome | Workspace | Description |
|---------|-----------|-------------|
| **Assemble from idea** | Create / Story | Propose project, world, characters, assets, story, chapter/scene outlines from text — **structure only**; creator reviews before commit |
| **Generate Character** | Character | Canonical / reference image from bible + slots (after identity approved) |
| **Generate Turnaround** | Character | Multi-view sheet (front, side, back, etc.) |
| **Generate World Asset** | World | Environment, prop, or establishing reference |
| **Generate Scene** | Story | Story still tied to **approved** scene outline |
| **Generate Comic Page** | Story | Multi-panel layout from scene context; per-panel approve/regenerate |
| **Generate Cover** | Project · Story · World · Character · Location · Scene | Primary missing visual — prompt, context, or hybrid ([GENERATE_COVER_WORKFLOW_V1.md](./GENERATE_COVER_WORKFLOW_V1.md)) |
| **Generate Video** | Story / World | Short clip (future; highest credit tier) |

**Manual creation** uses the same workspaces and tables — no AI outcome required. Hybrid workflows mix outcomes per entity.

Optional future outcomes (same pattern): **Edit Character**, **Edit Scene**, **Generate Voice**, **Upscale Asset** — each maps to a provider category, not a vendor.

---

## Provider categories

Internal taxonomy used by the router. One outcome may invoke one or more categories (e.g. turnaround = multiple image generation calls).

| Category | Purpose | Example providers |
|----------|---------|-------------------|
| **Image Generation** | Text/image → image | OpenAI GPT Image, Flux, Replicate, fal.ai |
| **Image Editing** | Inpaint, relight, background | OpenAI edits, Flux fill |
| **Turnaround Generation** | Orchestrated multi-view pipeline | Router composes Image Generation + continuity rules |
| **Video Generation** | T2V, I2V, short clips | Kling, Runway, Luma |
| **Voice Generation** | TTS, character voice | ElevenLabs, OpenAI audio |
| **Embeddings** | Similarity, search, continuity checks | OpenAI, Cohere (internal only) |
| **Moderation** | Pre/post generation safety | OpenAI Moderation, Rekognition, heuristic stub (today) |

**Moderation** runs on inputs and outputs; it is not a creator-facing outcome. It uses the same provider abstraction for swap-ability ([`src/lib/moderation/scanner.ts`](../src/lib/moderation/scanner.ts) already uses a pluggable provider pattern).

---

## 1. Provider abstraction layer

Every vendor implements a small, category-specific interface. No Supabase or UI imports inside adapters.

### Core types (conceptual)

```typescript
// Internal only — never exported to client

type ProviderCategory =
  | "image_generation"
  | "image_editing"
  | "video_generation"
  | "voice_generation"
  | "embeddings"
  | "moderation";

type ProviderId =
  | "openai"
  | "replicate"
  | "flux_fal"
  | "kling"
  | "runway"
  | "luma"
  | "elevenlabs"
  | "internal_heuristic";

interface ProviderAdapter<C extends ProviderCategory> {
  id: ProviderId;
  category: C;
  execute(request: CategoryRequest[C]): Promise<CategoryResult[C]>;
  estimateCost(request: CategoryRequest[C]): ProviderCostEstimate;
  healthCheck(): Promise<ProviderHealth>;
}
```

### Adapter responsibilities

- Translate **CharID normalized requests** (prompt bundle from Continuity Layer, dimensions, seed policy) → vendor API shape
- Return **normalized results**: asset bytes or URL, latency, vendor job id, token/image counts for cost
- Never expose vendor ids to HTTP responses or client components
- Read API keys from server env only (`OPENAI_API_KEY`, `REPLICATE_API_TOKEN`, etc.)

### Registry

`ProviderRegistry` registers adapters at startup:

```
register("image_generation", "replicate_flux_dev", FluxDevAdapter)
register("image_generation", "openai_gpt_image_15", GptImageAdapter)
register("moderation", "openai_moderation", OpenAIModAdapter)
```

---

## 2. Provider routing service

`ProviderRouter` selects **which adapter** runs for a given job.

### Inputs

| Input | Source |
|-------|--------|
| `outcome` | UI action (Generate Character, …) |
| `category` | Derived from outcome pipeline step |
| `continuityProfile` | Character / world / story ids + quality tier |
| `subscriptionTier` | Free / Creator / Pro / Studio |
| `featureFlags` | Per-provider enablement |
| `providerHealth` | Recent success rate, latency |
| `founderOverrides` | Optional forced provider for debugging (admin only) |

### Routing policy (example)

| Outcome | Primary | Fallback | Notes |
|---------|---------|----------|-------|
| Generate Character (draft) | Replicate Flux Schnell | SDXL | Low credits |
| Generate Character (production) | OpenAI GPT Image 1.5 | Flux Dev | Bible fidelity |
| Generate Turnaround | Flux Dev × N | GPT Image 1.5 | Same character seed policy |
| Generate World Asset | Flux Dev | Schnell | |
| Generate Scene | Flux Dev | GPT Image 1.5 | Story context injection |
| Generate Comic Page | Flux Dev (panel loop) | — | Single orchestrated job |
| Generate Video | Runway gen4_turbo | Kling via Replicate | Pro/Studio only |
| Moderation (text/image) | OpenAI Moderation | Heuristic stub | Already pluggable |

Policies live in **config** (DB or versioned JSON), not hardcoded in UI — founders change routing without deploy when possible.

### Routing algorithm

```
1. Resolve outcome → pipeline steps (each step has a category)
2. For each step:
   a. Filter adapters: category match + feature flag on + tier allowed
   b. Sort by: health score → cost target → latency SLO
   c. Try primary; on retryable failure, try fallback chain
   d. Record attempt in ai_jobs + provider_cost_events
3. Return normalized assets to Orchestrator
```

Creators see: **“Generating…” → success / retry / insufficient credits** — never provider names.

---

## 3. CharID Continuity Layer

Sits **above** the router. Already partially implemented:

- `assemble-character-context`, `assemble-world-context`, `assemble-story-context`
- `assemble-combined-context` (server-only context packet)
- Bibles, slot assignments, reference graphs

### Responsibilities

- Build **prompt packages** from canon (not raw user prompt alone)
- Attach reference images by slot role (canonical, turnaround, etc.)
- Enforce **character consistency** constraints passed to adapters as structured fields
- Strip sensitive/internal fields before any client exposure
- Version context snapshots on each job (`context_snapshot_id` for audit)

The Continuity Layer output is the **single input** to `ProviderRouter` — adapters do not query Supabase directly.

---

## 4. Credit accounting (provider-independent)

Credits are charged by **outcome**, not by vendor COGS.

```
Creator clicks "Generate Turnaround" (40 credits)
        │
        ▼
CreditService.reserve(userId, 40, jobId)
        │
        ▼
Orchestrator runs pipeline (1–N provider calls)
        │
        ├── success → CreditService.commit(jobId)
        └── failure → CreditService.release(jobId)
```

| Rule | Detail |
|------|--------|
| Quote | Fixed credits per outcome (see [AI_COST_MODEL.md](./AI_COST_MODEL.md)) |
| Reserve | Before any provider call |
| Commit | After assets persisted + moderation pass (or policy-defined partial) |
| Release | On hard failure or timeout |
| Provider switch | **No change** to credit charge mid-job |

Tables: `credit_accounts`, `credit_transactions` ([Phase 3 roadmap](./MONETIZATION_AND_AI_ROADMAP.md)).

---

## 5. Cost tracking per provider

Founder-facing COGS is tracked separately from creator credits.

### `ai_jobs`

| Column | Purpose |
|--------|---------|
| `id` | Job uuid |
| `user_id` | Creator |
| `outcome` | Generate Character, … |
| `entity_type` / `entity_id` | Character, world, story |
| `status` | queued, running, succeeded, failed |
| `credits_charged` | Creator debit |
| `context_snapshot_id` | Continuity audit |

### `ai_job_steps`

| Column | Purpose |
|--------|---------|
| `job_id` | Parent |
| `step_index` | Pipeline order |
| `category` | image_generation, … |
| `provider_id` | Internal id |
| `provider_job_id` | Vendor reference |
| `latency_ms` | Performance |
| `estimated_cost_usd` | From adapter.estimateCost |
| `actual_cost_usd` | Reconciled from invoice/webhook if available |
| `status` | success / failed / fallback |

Founder dashboard (Phase 1): COGS by provider, by outcome, by tier — feeds **Costs** placeholder section.

---

## 6. Fallback providers

| Trigger | Behavior |
|---------|----------|
| HTTP 5xx / timeout | Retry once same provider, then fallback |
| Rate limit (429) | Immediate fallback |
| Content policy reject | No fallback; surface safe message to creator |
| Moderation block | Fail job; release credits per policy |
| All adapters fail | Fail job; release credits; log incident |

Fallback chains are **ordered lists** in routing config per outcome step. Example:

```yaml
generate_character_production:
  - openai_gpt_image_15
  - replicate_flux_dev
  - replicate_flux_schnell
```

Never fallback to a lower **commercial-rights** provider without tier check.

---

## 7. Feature flags per provider

Flags stored in `ai_provider_config` (or env + DB override):

| Flag | Purpose |
|------|---------|
| `enabled` | Master kill switch |
| `allowed_tiers` | e.g. video: pro, studio only |
| `max_daily_jobs` | Platform safety cap |
| `beta_only` | Founder/admin test |
| `weight` | Load balancing among healthy primaries |

Founder toggles providers in admin without code deploy (Phase 1 platform health extension).

Environment defaults for secrets; DB for operational toggles.

---

## 8. Provider performance metrics

Emit from every `ai_job_step`:

| Metric | Use |
|--------|-----|
| Success rate (24h / 7d) | Router health score |
| p50 / p95 latency | SLO monitoring |
| Fallback rate | Provider reliability |
| Cost per outcome | Margin analysis |
| Moderation flag rate | Safety tuning |

Founder views:

- `v_founder_ai_provider_summary` (future SQL view)
- Alerts: COGS daily cap, error rate spike, single-provider dependency

Creators never see these.

---

## Generation orchestrator (glue layer)

Server-only service coordinating the full flow:

```
1. Auth + tier + entitlement check
2. Continuity Layer → context packet
3. CreditService.reserve
4. Enqueue job (async worker or edge function)
5. ProviderRouter.run(pipeline)
6. Moderation scan (output)
7. Persist to character_images / world_images / story_images
8. Suggest slot assignment (creator confirms)
9. CreditService.commit or release
10. Revalidate workspace paths
```

Jobs must be **async** — providers exceed HTTP timeout for video and multi-image turnarounds.

---

## Security and compliance

- API keys server-only; never in client bundles
- Context packets server-only ([architecture exposure audit](../src/lib/assemble-combined-context.ts))
- Private bible content sent to providers only during user-initiated jobs; covered in ToS subprocessors list
- Moderation on input and output before public visibility
- Rate limits per user and platform regardless of credits

---

## Implementation phases (no AI until gates met)

| Phase | Deliverable |
|-------|-------------|
| **3** | Credit ledger + reserve/commit |
| **4** | Routing config + cost estimates locked |
| **5a** | Image adapters (Replicate Flux + OpenAI) + router + character outcome |
| **5b** | Turnaround orchestration + world/story outcomes |
| **5c** | Video adapters (Runway/Kling/Luma) + tier gates |
| **5d** | Voice (ElevenLabs) if needed |
| **1** | Founder COGS dashboard from `ai_job_steps` |

---

## Directory layout (proposed)

```
src/lib/ai/
  types.ts                 # Normalized requests/results
  registry.ts              # ProviderRegistry
  router.ts                # ProviderRouter
  orchestrator.ts          # Job lifecycle
  outcomes.ts              # Outcome → pipeline definitions
  credit-bridge.ts         # CreditService integration
  adapters/
    openai-image.ts
    replicate-flux.ts
    runway-video.ts
    elevenlabs-voice.ts
    openai-moderation.ts
    ...
```

Existing moderation remains under `src/lib/moderation/` but implements the same `ProviderAdapter<"moderation">` interface over time.

---

## Decision checklist (anti–feature creep)

Before adding a provider or outcome:

1. Does it strengthen Character → World → Story → Portfolio?
2. Is there a credit price with positive margin ([AI_COST_MODEL.md](./AI_COST_MODEL.md))?
3. Is the creator action an **outcome**, not a model picker?
4. Can we swap the vendor without UI changes?
5. Are fallbacks and flags defined?

If any answer is no, defer.

---

## Version

| Version | Date | Notes |
|---------|------|-------|
| 0.1 | 2026-06-14 | Initial architecture pre-implementation |
