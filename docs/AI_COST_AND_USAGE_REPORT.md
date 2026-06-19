# AI Cost and Usage Report

**Date:** 2026-06-14  
**Status:** Audit report — pre–OpenAI enable  
**Scope:** All AI-related code paths in the CharID repository as implemented today  
**Related:** [AI_COST_MODEL.md](./AI_COST_MODEL.md) · [AI_PROVIDER_ARCHITECTURE.md](./AI_PROVIDER_ARCHITECTURE.md) · [SCENE_S2_DESIGN.md](./SCENE_S2_DESIGN.md) · [SECURITY_AUDIT_V1.md](./SECURITY_AUDIT_V1.md) · [MONETIZATION_AND_AI_ROADMAP.md](./MONETIZATION_AND_AI_ROADMAP.md)

---

## Executive summary

CharID has **one live OpenAI integration**: Scene S2 text suggestions (`gpt-4o-mini` chat completions). Everything else is either **template fallback**, **stub moderation**, or **UI-only placeholders** for future image/cover generation.

| Question | Answer |
|----------|--------|
| Live OpenAI features | Scene suggestions + per-item regenerate only |
| API calls per “Generate scene suggestions” | **1** chat completion (3–8 scenes in one JSON response) |
| Default model | **`gpt-4o-mini`** |
| Cost per generate (typical) | **~$0.0005–$0.002** |
| Calls when key missing? | **No** — template fallback, $0 |
| High-volume risk? | **Yes** — no rate limits, credits, or usage logging |

**Before enabling `OPENAI_API_KEY`:** set OpenAI org spend limits, plan app-level rate limits, and avoid enabling image APIs until cover generation is credit-gated.

---

## 1. Live AI integrations

### 1.1 OpenAI (implemented)

| Feature | User action | API calls | Endpoint | Code path |
|---------|-------------|-----------|----------|-----------|
| **Generate scene suggestions** | Story / scene workspace → “Generate scene suggestions” | **1** | `POST /v1/chat/completions` | `generateSceneSuggestions` → `generateSceneSuggestionDrafts` → `openAIChatCompletion` |
| **Regenerate one suggestion** | Staging row → “Regenerate” | **1** | Same | `regenerateSceneSuggestionItem` → `generateSceneSuggestionDrafts({ single: true })` |
| **Chapter-scoped generate** | “Break this chapter into scenes?” | **1** | Same | `SceneChapterSuggestPanel` → `generateSceneSuggestions({ chapterId })` |

**Shared client:** `src/lib/ai/openai-chat.ts`  
**Shared generator:** `src/lib/ai/generate-scene-suggestions.ts`

**Not charged OpenAI on:**

- Approve / Edit / Delete staging items  
- Manual scene create  
- Background jobs (none exist)

### 1.2 Not OpenAI (implemented)

| System | Provider | Behavior |
|--------|----------|----------|
| **Content moderation** | `MODERATION_SCANNER` env: `stub` (default) or `heuristic` | No external API; post-save scan only |
| **Cover generation** | None | UI placeholders; Generate disabled / “coming soon” |
| **Character / world / story images** | None | Upload + gallery only |
| **Embeddings, video, voice** | None | Not implemented |

### 1.3 Planned (design only)

| Feature | Doc | Expected pattern | Relative cost |
|---------|-----|------------------|---------------|
| Chapter suggestions (dedicated) | [SCENE_S2_DESIGN.md](./SCENE_S2_DESIGN.md) | 1 batched text completion | ~Same as scene generate |
| Cover generation | [GENERATE_COVER_WORKFLOW_V1.md](./GENERATE_COVER_WORKFLOW_V1.md) | 1+ image API calls | **~$0.005–$0.19 / image** |
| Comic panels | [AI_COST_MODEL.md](./AI_COST_MODEL.md) | 1–4 images / page | **~$0.10 / page** (Flux Dev × 4) |
| Credit gating | [MONETIZATION_AND_AI_ROADMAP.md](./MONETIZATION_AND_AI_ROADMAP.md) | Pre-reserve credits per action | Not implemented |

---

## 2. Template fallback

Only **scene suggestions** use fallback templates.

| Trigger | Result |
|---------|--------|
| `OPENAI_API_KEY` unset | No HTTP call; `templateSuggestions()` |
| OpenAI HTTP error | Fallback after failed request |
| Invalid / empty JSON | Fallback |
| Valid JSON with 0 usable items | Fallback |

**Template pool** (examples): Dawn Patrol, The Forecast, Meeting a Mentor, Contest Day, Sunset Session, The Wipeout, Celebration on the Beach — filtered to avoid duplicate titles vs existing scenes.

**Internal tracking:** `SceneSuggestionGenerationResult.source` is `"openai"` | `"template"`. **Not shown in creator UI today.**

**Dev-only signal:** `console.warn` on OpenAI failure when `NODE_ENV === development`.

---

## 3. Model and environment configuration

| Variable | Default | Purpose |
|----------|---------|---------|
| `OPENAI_API_KEY` | *(empty)* | Server-only gate; no calls if missing |
| `OPENAI_TEXT_MODEL` | **`gpt-4o-mini`** | Scene suggestion chat completions |
| `MODERATION_SCANNER` | **`stub`** | Not OpenAI; optional `heuristic` for local flag tests |

From `.env.example`:

```env
OPENAI_API_KEY=
OPENAI_TEXT_MODEL=gpt-4o-mini
```

**Request parameters (scene suggestions):**

| Parameter | Value |
|-----------|-------|
| Model | `OPENAI_TEXT_MODEL` or `gpt-4o-mini` |
| Temperature | **0.85** (scene generate); default **0.8** in client if not overridden |
| Response format | **`json_object`** |
| Messages | 1 system + 1 user |

**No image, embedding, or moderation models are configured in application code.**

---

## 4. Estimated cost per action

**Verify all rates on [OpenAI pricing](https://platform.openai.com/docs/pricing) before budgeting.** Estimates below use typical **gpt-4o-mini** chat pricing (~**$0.15 / 1M input tokens**, ~**$0.60 / 1M output tokens**) as of mid-2026.

### 4.1 Generate scene suggestions — **LIVE**

| Metric | Estimate |
|--------|----------|
| OpenAI API calls | **1** |
| Input tokens | ~800–3,500 (system ~350 + story/world/cast/scenes/chapters/relationships) |
| Output tokens | ~400–1,200 (3–8 scenes in JSON) |
| **COGS per click** | **~$0.0005–$0.002** |
| Typical founder test story | **~$0.001** |

Context size grows with chapter count, existing scene count, and bible text — large workspaces approach the high end but remain sub-cent.

### 4.2 Regenerate one scene suggestion — **LIVE**

| Metric | Estimate |
|--------|----------|
| OpenAI API calls | **1** |
| Output tokens | ~80–200 (single scene) |
| **COGS per click** | **~$0.0003–$0.001** |

### 4.3 Chapter suggestions — **FUTURE**

Not a separate implementation today. The chapter helper button calls **Generate scene suggestions** with chapter focus — **same 1 call / ~same cost**.

If a dedicated `chapter_suggestion` proposal kind ships (same staging architecture):

| Metric | Estimate |
|--------|----------|
| API calls | Likely **1** batched completion |
| Input | Similar or larger (full chapter prose) |
| **COGS** | **~$0.001–$0.003** per generate |

### 4.4 Cover generation — **FUTURE**

No provider wired. Planning estimates from [AI_COST_MODEL.md](./AI_COST_MODEL.md):

| Action | MVP provider (planned) | Est. COGS |
|--------|------------------------|-----------|
| Draft cover preview | GPT Image 1 Mini low | **~$0.005** |
| Production cover | GPT Image 1.5 standard | **~$0.04** |
| Hero / high quality | GPT Image 1.5 high | **up to ~$0.19** |
| Budget alternative | Flux Dev (Replicate/fal) | **~$0.025** |

Cover will be **20–400× more expensive per action** than scene text suggestions.

### 4.5 Other planned actions (reference)

From [AI_COST_MODEL.md](./AI_COST_MODEL.md) — **not implemented**:

| Action | Est. COGS | Notes |
|--------|-----------|-------|
| Character reference (Flux Dev) | $0.025 | 1 image |
| Turnaround sheet (4 views) | $0.10 | 4 images |
| Comic page (4 panels) | $0.10 | 4 images |
| Video 5s | $0.25+ | Post-MVP |

### 4.6 Proposed credit mapping (not enforced)

Scene suggestions have **no credit charge today**. For future alignment with [AI_COST_MODEL.md](./AI_COST_MODEL.md):

| Action | Est. COGS | Suggested credits (draft) |
|--------|-----------|-------------------------|
| Generate scene suggestions | ~$0.001 | **0–1** (free tier friendly) or bundled in Creator |
| Regenerate scene | ~$0.0005 | **0** or count toward same bucket |
| Cover generate | ~$0.04 | **5–8** |
| Comic page | ~$0.10 | **35–40** |

---

## 5. Behavior when `OPENAI_API_KEY` is missing

| Step | Behavior |
|------|----------|
| `openAIChatCompletion` | Returns immediately with error; **no `fetch`** |
| `generateSceneSuggestionDrafts` | Falls back to templates |
| Creator experience | Suggestions still appear; workflow unchanged |
| Cost | **$0** OpenAI spend |

**Security:** Key is server-only (`OPENAI_API_KEY`), not exposed via `NEXT_PUBLIC_*`.

**Operational gap:** Invalid or expired keys attempt one failed HTTP call per user action, then fallback — still no UI indication.

---

## 6. Usage volume and abuse risk

### 6.1 Current controls

| Control | Status |
|---------|--------|
| Rate limits (app) | **None** |
| Credit gating | **None** |
| Per-user daily caps | **None** |
| Usage / token logging | **None** |
| OpenAI org spend limits | **External** (must set in OpenAI dashboard) |
| Auth required | **Yes** — logged-in story owner only |

### 6.2 Abuse scenarios (key enabled)

| Scenario | Approx. calls | Approx. cost |
|----------|---------------|--------------|
| Enthusiastic creator (10 generates + 20 regenerates/session) | 30 | **~$0.03** |
| Heavy day (100 generates + 200 regenerates) | 300 | **~$0.30–$0.60** |
| Scripted abuse (10,000 calls/day) | 10,000 | **~$10–$20/day** (text only) |

Text suggestions are **cheap per call**; risk is **unbounded repetition**, not a single expensive request.

### 6.3 Future high-blast-radius features

When cover and comic generation ship without gates:

| Feature | Single-action COGS | Risk if unlimited |
|---------|-------------------|-------------------|
| Cover generate | ~$0.04+ | **High** |
| Comic page (4 panels) | ~$0.10+ | **Very high** |
| Video clip | ~$0.25+ | **Critical** |

[SECURITY_AUDIT_V1.md](./SECURITY_AUDIT_V1.md) recommends **~10 scene generates / hour / user** before open beta.

---

## 7. Architecture map

```
Creator UI
    │
    ├─ Generate scene suggestions ──► scene-suggestions.ts (server action)
    │                                      │
    │                                      ▼
    │                              generate-scene-suggestions.ts
    │                                      │
    │                         ┌────────────┴────────────┐
    │                         ▼                         ▼
    │                  openAIChatCompletion      templateSuggestions
    │                  (1× chat completion)       ($0 fallback)
    │
    ├─ Approve / Edit / Delete ──► Supabase staging + commitSceneRecord
    │                              (no OpenAI)
    │
    ├─ Cover “Generate” ──► UI only (no provider)
    │
    └─ Upload / save text ──► scan-text.ts ──► stub/heuristic scanner
                               (no OpenAI)
```

**Files:**

| Path | Role |
|------|------|
| `src/lib/ai/openai-chat.ts` | Sole OpenAI HTTP client |
| `src/lib/ai/generate-scene-suggestions.ts` | Scene LLM + template fallback |
| `src/app/actions/scene-suggestions.ts` | Server actions + Supabase staging |
| `src/lib/moderation/scanner.ts` | Pluggable scanner (not OpenAI) |

---

## 8. Recommendations before enabling OpenAI

### P0 — Before setting `OPENAI_API_KEY` in production

1. **OpenAI dashboard:** Hard monthly spend cap + email alerts.  
2. **Confirm scope:** Only `gpt-4o-mini` chat will be used — no image API keys in the same project unless intentional.  
3. **Founder test:** Generate once; verify suggestions differ from template pool (Dawn Patrol, etc.).

### P1 — Before open beta

4. **App rate limits** on `generateSceneSuggestions` and `regenerateSceneSuggestionItem` (e.g. 10/hour/user).  
5. **Usage log** — `user_id`, action, `source`, model, estimated tokens, timestamp (no full prompt storage if privacy concern).  
6. **UI or admin signal** for `openai` vs `template` source.

### P2 — Before cover / image AI

7. **Credit reserve** per [MONETIZATION_AND_AI_ROADMAP.md](./MONETIZATION_AND_AI_ROADMAP.md).  
8. **Separate provider routing** per [AI_PROVIDER_ARCHITECTURE.md](./AI_PROVIDER_ARCHITECTURE.md).  
9. **Never enable image generation** without per-action cost display.

### Explicit deferrals

Do not enable billing, marketplace, POD, or multi-provider routing until:

- Scene S2 stable  
- [PUBLISHING_MVP_ARCHITECTURE.md](./PUBLISHING_MVP_ARCHITECTURE.md) approved  
- [FINISHED_WORK_ARCHITECTURE.md](./FINISHED_WORK_ARCHITECTURE.md) approved  
- [SECURITY_AUDIT_V1.md](./SECURITY_AUDIT_V1.md) P0/P1 addressed  

---

## 9. Decision test

*Does enabling this API key move creators closer to finishing and sharing work — at a predictable cost with bounded abuse risk?*

Scene text suggestions: **yes**, at ~$0.001 per use.  
Without rate limits and logging: **abuse risk is acceptable for private beta only**, not public launch.

---

## Document index

| Doc | Role |
|-----|------|
| [AI_COST_MODEL.md](./AI_COST_MODEL.md) | Image/video COGS and credit proposals |
| [AI_PROVIDER_ARCHITECTURE.md](./AI_PROVIDER_ARCHITECTURE.md) | Future provider routing |
| [SCENE_S2_IMPLEMENTATION_REPORT.md](./SCENE_S2_IMPLEMENTATION_REPORT.md) | Scene S2 ship notes |
| [SECURITY_AUDIT_V1.md](./SECURITY_AUDIT_V1.md) | RATE-01, LOG-02 |

---

## Version

| Version | Date | Notes |
|---------|------|-------|
| 1.0 | 2026-06-14 | Initial audit — one live OpenAI integration (scene suggestions), cost estimates, abuse risk |
