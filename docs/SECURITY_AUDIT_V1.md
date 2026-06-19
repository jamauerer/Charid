# Security Audit V1

**Status:** Audit report (planning — no code changes)  
**Date:** 2026-06-14  
**Version:** 1.0  
**Scope:** CharID platform as implemented in repository — auth, permissions, admin, moderation, storage, public content, logging, rate limits  
**Authority:** [SAFETY_MODERATION_V1.md](./SAFETY_MODERATION_V1.md) · [PROTECTED_CREATOR_MODE_V1.md](./PROTECTED_CREATOR_MODE_V1.md) · [FOUNDER_ADMIN_AUDIT.md](./FOUNDER_ADMIN_AUDIT.md)

---

## Executive summary

CharID has a **solid owner-scoped RLS baseline** for workspace tables and a **thoughtful moderation philosophy** (scan after save, never auto-delete). Gaps cluster around:

1. **Admin enforcement** — app-layer `role = admin` without matching Postgres RLS; heavy reliance on `SUPABASE_SERVICE_ROLE_KEY`  
2. **Public content boundaries** — portfolio/world gates exist; **stories and chapters lack per-entity publish control**  
3. **Suspension** — `profiles.is_suspended` can be set by admin but is **not enforced** on login/dashboard  
4. **Rate limits and audit logging** — largely **absent**  
5. **Storage** — private buckets with owner-scoped policies; public reads use signed URLs with limited admin path review  

**Recommendation:** Address findings in this order before Publishing MVP ships: (1) public read model + RLS, (2) admin RLS hardening, (3) suspension enforcement, (4) rate limits on auth/AI/upload, (5) audit log for admin actions.

**Decision test for fixes:** Does the change protect creators and readers without blocking finish → publish?

---

## 1. Authentication

### Current implementation

| Layer | Mechanism |
|-------|-----------|
| Identity | Supabase Auth (email/password) |
| Session | `@supabase/ssr` — server client with cookies |
| Protected routes | Server components / actions call `supabase.auth.getUser()` |
| Login/signup | `/login`, `/signup` |

### Findings

| ID | Severity | Finding |
|----|----------|---------|
| AUTH-01 | **High** | `profiles.is_suspended` not checked in middleware, login, or dashboard layout — suspended users retain full access |
| AUTH-02 | Medium | No MFA / passkey support (acceptable for beta; document for production) |
| AUTH-03 | Medium | No explicit session invalidation on suspend |
| AUTH-04 | Low | No account deletion / GDPR export flow documented in app |

### Recommendations

- Enforce suspension in `middleware.ts` (or shared auth guard): redirect to `/suspended` with support link  
- On suspend admin action: optionally revoke refresh tokens via Supabase Admin API  
- Document account lifecycle (signup → suspend → delete) before public beta  

---

## 2. Permissions & RLS

### Current pattern

- **Workspace tables:** RLS policies scoped to `auth.uid() = user_id` or ownership via join (e.g. scenes → stories → user)  
- **Public read:** Additional `SELECT` policies when parent world `is_public = true` (characters, worlds, scenes)  
- **Profiles:** Public read when `is_public = true`  
- **Admin cross-user access:** **No RLS policies** — uses service role in server actions  

### Findings

| ID | Severity | Finding |
|----|----------|---------|
| RLS-01 | **High** | Founder admin actions (`support-admin`, `feedback-admin`, `moderation-admin`, `founder-analytics`) bypass RLS via service role — bug in app-layer `isFounderAdmin()` check would expose all user data |
| RLS-02 | **High** | `getPublicStory()` does not filter `stories.is_public` — any story under a **public world** on a **public portfolio** is readable (stories may lack `is_public` column today) |
| RLS-03 | **High** | `getPublicChaptersByStory()` returns **all** chapters when story chain is public — no draft/publish distinction |
| RLS-04 | Medium | Scene public RLS exists in migration; public reader not built — risk when Publishing MVP adds scene reader without finished_work gate |
| RLS-05 | Medium | `creative_proposal_batches` — owner-only RLS (good); verify no public policy added accidentally |
| RLS-06 | Low | Project RLS owner-scoped — no public project pages (good) |

### Recommendations

- Add Postgres admin policies: `EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')` on `support_tickets`, `creator_feedback`, `moderation_queue`  
- Introduce publish manifest ([FINISHED_WORK_ARCHITECTURE.md](./FINISHED_WORK_ARCHITECTURE.md)) — public reads query `finished_works` not raw workspace  
- Until manifest ships: add `stories.is_public` + enforce in `getPublicStory` and RLS  
- Defense in depth: keep service role for aggregates but reduce scope over time ([FOUNDER_ADMIN_AUDIT.md](./FOUNDER_ADMIN_AUDIT.md))  

---

## 3. Founder / admin routes

### Current implementation

| Route | Gate |
|-------|------|
| `/dashboard/admin/*` | `AdminLayout` → `isFounderAdmin()` → `profiles.role = 'admin'` |
| Sidebar link | Shown when role admin |
| Data access | `createAdminClient()` requires `SUPABASE_SERVICE_ROLE_KEY` |

### Findings

| ID | Severity | Finding |
|----|----------|---------|
| ADM-01 | **High** | Admin authorization is **app-layer only** — no DB-level role enforcement on mutations |
| ADM-02 | Medium | Support/Feedback inbox routes lack sidebar links — security by obscurity, not RBAC granularity |
| ADM-03 | Medium | Single `admin` role — no moderator vs super-admin split |
| ADM-04 | Medium | `SUPABASE_SERVICE_ROLE_KEY` missing → admin UI renders empty shells; error messages sanitized in V2 (`founder-messages.ts`) — good |
| ADM-05 | Low | No admin action audit trail |

### Recommendations

- Migrate inbox + moderation mutations to authenticated client + admin RLS  
- Add `admin_audit_log` table: actor_id, action, target_type, target_id, metadata, created_at  
- Split roles: `moderator` (queue only) vs `admin` (suspend, analytics) — future  
- Require service role only for cross-user storage signed URLs and heavy aggregates  

---

## 4. Moderation routes

### Current implementation

| Component | Path |
|-----------|------|
| Queue UI | `/dashboard/admin/moderation` — `ModerationQueue.tsx` |
| Actions | Approve, Remove, Escalate, Suspend — `moderation-admin.ts` |
| Enqueue | Post-save scan — `scan-text.ts`, `scan-image.ts`, `enqueue.ts` |
| Scanner | Pluggable stub/heuristic — `scanner.ts` |

### Findings

| ID | Severity | Finding |
|----|----------|---------|
| MOD-01 | Medium | **Remove** marks queue row — content removal from storage/DB not fully implemented (noted in SAFETY_MODERATION_V1) |
| MOD-02 | Medium | `moderation_queue` RLS: authenticated users can INSERT own flags; SELECT for users **denied** — correct; admin relies on service role |
| MOD-03 | Medium | AI scene suggestions in staging — **not scanned** on generate (should scan before display or on approve) |
| MOD-04 | Low | Scanner default `stub` always safe — production needs real provider before scale |
| MOD-05 | Low | Suspend does not cascade to hide public portfolio content immediately if cached URLs exist |

### Recommendations

- Scan AI-generated staging text on batch write; block approve if escalated (policy choice)  
- Implement content removal workflow V2: delete storage object + mark entity hidden  
- Wire production moderation provider before open beta  
- On suspend: force `profiles.is_public = false` and unpublish finished works (policy)  

---

## 5. Storage access

### Buckets (observed)

| Bucket | Use | Access pattern |
|--------|-----|----------------|
| `character-photos` | Character portraits | Owner upload; signed URLs for public characters |
| `world-*` / story images | Reference assets | Owner-scoped |
| `support-attachments` | Ticket screenshots | Private; owner + admin via service role signed URL |

### Findings

| ID | Severity | Finding |
|----|----------|---------|
| STO-01 | Medium | Public portfolio uses **time-limited signed URLs** (e.g. 3600s) — URLs leak in HTML; acceptable for MVP; not true public CDN |
| STO-02 | Medium | Admin moderation views other users’ images via service role signed URLs — necessary; must stay server-only |
| STO-03 | Medium | No virus scanning on upload — rely on type/size validation only |
| STO-04 | Low | 5 MB limit on profile/character photos — documented in profile actions |
| STO-05 | **High** | If story/world public without publish gate, referenced private images might leak via public story gallery — verify `getPublicStoryImages` filters |

### Recommendations

- Audit `getPublicStoryImages` and public gallery paths — only images explicitly public or in published finished work  
- Consider public bucket for **published** cover assets only (post-Publishing MVP)  
- Add upload rate limit per user (see §8)  

---

## 6. Published vs private content

### Current model

| Entity | Visibility control |
|--------|-------------------|
| Portfolio | `profiles.is_public` |
| Character | `characters.is_public` |
| World | `worlds.is_public` |
| Story | **No dedicated flag** — visible via public world + portfolio |
| Chapter | **All chapters** if story reachable |
| Scene | RLS public via story/world chain — **no reader** yet |
| Bible / workspace | Owner-only |
| AI staging | Owner-only (`creative_proposal_batches`) |

### Findings

| ID | Severity | Finding |
|----|----------|---------|
| PUB-01 | **Critical** | Workspace draft content can become **de facto public** when creator sets world + portfolio public — no story-level or chapter-level publish intent |
| PUB-02 | **High** | Preview mode (`?preview=1`) on portfolio — verify owner-only; cannot leak draft worlds/characters |
| PUB-03 | Medium | Public story page exposes reference asset gallery — may be creator workspace material, not “published edition” |
| PUB-04 | Medium | No robots/noindex on draft or preview URLs |
| PUB-05 | Low | `is_public` on child entities inconsistent — story characters filtered to public; story itself is not |

### Recommendations

- Ship [FINISHED_WORK_ARCHITECTURE.md](./FINISHED_WORK_ARCHITECTURE.md) + [PUBLISHING_MVP_ARCHITECTURE.md](./PUBLISHING_MVP_ARCHITECTURE.md) before marketing “publish”  
- Deprecate implicit public story access; redirect to finished work reader  
- Preview: signed token or session owner check — not query param alone long-term  
- Add `X-Robots-Tag: noindex` on non-published pages  

---

## 7. Audit logging

### Current state

| Event | Logged? |
|-------|---------|
| User login | Supabase Auth logs only |
| Content save | No structured app audit |
| Moderation action | Queue row updated; no separate audit |
| Admin suspend | Updates profile; no audit table |
| AI generation | No job log |
| Publish | Not implemented |

### Findings

| ID | Severity | Finding |
|----|----------|---------|
| LOG-01 | **High** | No **`admin_audit_log`** — cannot forensically review suspend/approve/remove |
| LOG-02 | Medium | No **`ai_generation_log`** — cost, abuse, and debug difficult |
| LOG-03 | Medium | Founder analytics reads broad aggregates — no PII minimization doc |
| LOG-04 | Low | Console.error in moderation catch — not centralized |

### Recommendations

- `admin_audit_log` — required before beta  
- `ai_proposal_log` — batch id, user_id, story_id, source (openai/template), token count — no prompt storage in V1 if privacy concern  
- `publish_log` — finished_work_id, revision, actor  
- Ship logs to founder-only views; retention policy 90 days  

---

## 8. Rate limits

### Current state

**No application-level rate limiting** observed on:

- Login / signup  
- Password reset  
- Support ticket submit  
- Image upload  
- AI scene suggestion generate  
- Public portfolio reads  

Supabase may enforce platform limits; not documented in app.

### Findings

| ID | Severity | Finding |
|----|----------|---------|
| RATE-01 | **High** | AI generate endpoint abusable — unbounded OpenAI cost if key present |
| RATE-02 | **High** | Upload endpoints abusable for storage exhaustion |
| RATE-03 | Medium | Public read endpoints — scraping portfolio/story/chapter |
| RATE-04 | Medium | Support form spam |
| RATE-05 | Low | No CAPTCHA on signup |

### Recommendations (MVP)

| Endpoint | Suggested limit |
|----------|-----------------|
| `generateSceneSuggestions` | 10 / hour / user |
| Image upload | 30 / hour / user |
| Support ticket | 5 / day / user |
| Login attempts | Supabase + optional IP throttle |
| Public reads | CDN/cache; optional per-IP soft limit |

Implement via Upstash Redis, Supabase Edge Function, or middleware counter — design only until approved.

---

## 9. Scene S2 / AI collaboration (security lens)

| Control | Status |
|---------|--------|
| Staging not public | ✅ Owner RLS on `creative_proposal_batches` |
| No auto-commit | ✅ Approve-only commit path |
| Prompt injection via canon | Low risk — canon is user-owned; still sanitize LLM output JSON |
| API key exposure | ✅ Server-only `OPENAI_API_KEY` |
| Cross-user batch access | ✅ user_id scoping on all actions |

**Recommendation:** Add rate limit + optional credit gate before open beta AI.

---

## 10. Publishing MVP (security prerequisites)

Before shipping public reader:

| Prerequisite | Audit ID |
|--------------|----------|
| Finished work manifest gates all public content | PUB-01, RLS-02, RLS-03 |
| Public image paths reviewed | STO-05 |
| Admin audit for unpublish/suspend | LOG-01 |
| Rate limits on public routes | RATE-03 |

---

## 11. Priority matrix

| Priority | Items | Blocker for |
|----------|-------|-------------|
| **P0** | PUB-01, RLS-02, RLS-03, AUTH-01 | Publishing MVP |
| **P1** | RLS-01, ADM-01, LOG-01, RATE-01, RATE-02 | Open beta |
| **P2** | MOD-01, MOD-03, STO-01, ADM-05 | Scale |
| **P3** | AUTH-02, RATE-05, LOG-04 | Hardening |

---

## 12. Explicit deferrals (per product priority)

Do **not** block Scene S2 / Publishing MVP design approval on:

- Marketplace security  
- Stripe / billing PCI scope  
- POD fulfillment  
- Multi-tenant team permissions  

Do **block public launch** on P0 + P1 items above.

---

## Document index

| Doc | Role |
|-----|------|
| [FOUNDER_ADMIN_AUDIT.md](./FOUNDER_ADMIN_AUDIT.md) | Detailed admin/service-role audit |
| [SAFETY_MODERATION_V1.md](./SAFETY_MODERATION_V1.md) | Moderation philosophy |
| [PUBLISHING_MVP_ARCHITECTURE.md](./PUBLISHING_MVP_ARCHITECTURE.md) | Publish model fixes PUB-* |
| [PROTECTED_CREATOR_MODE_V1.md](./PROTECTED_CREATOR_MODE_V1.md) | Child safety — future |

---

## Version

| Version | Date | Notes |
|---------|------|-------|
| 1.0 | 2026-06-14 | Initial security audit — report only, no implementation |
