# Founder Admin Audit

**Date:** 2026-06-14  
**Scope:** Read-only audit of founder/admin functionality. No code changes.  
**Symptoms reported:** Admin Dashboard shell loads; Moderation Queue shell loads; founder analytics do not load; app reports `SUPABASE_SERVICE_ROLE_KEY` missing.

---

## Executive summary

All founder admin **data** paths go through `createAdminClient()` (`src/lib/supabase/admin.ts`), which **throws** if `SUPABASE_SERVICE_ROLE_KEY` is unset. Route access is gated separately by `profiles.role = 'admin'` via `isFounderAdmin()` (`src/lib/founder-auth.ts`).

**What “loads” vs what works:**

| Surface | Page/route renders? | Data loads without service role? |
|---------|---------------------|----------------------------------|
| Admin Dashboard (`/dashboard/admin`) | Yes (for `role = admin`) | **No** — analytics + database health both fail |
| Moderation Queue | Yes | **No** — empty queue + error banner |
| Support Inbox | Yes | **No** — empty inbox + error banner |
| Feedback Inbox | Yes | **No** — empty inbox + error banner |

The reported symptom (analytics broken, moderation “loads”) matches this: **pages render; all server-side queries fail without the service role key.** Moderation appears to work because the UI shell and zero-state metrics still render.

**Immediate blocker:** Add `SUPABASE_SERVICE_ROLE_KEY` to `.env.local` (see `.env.example`), restart the dev server, and ensure founder views/tables are migrated and API-granted.

---

## 1. Features that require `service_role` (current implementation)

Every founder admin server action imports `createAdminClient()` after an `isFounderAdmin()` check. There are **no** admin RLS policies in migrations — cross-user reads/writes rely entirely on the service role bypassing RLS.

### 1.1 Founder Dashboard analytics

**Action:** `getFounderDashboardData()` — `src/app/actions/founder-analytics.ts`  
**Route:** `/dashboard/admin`  
**Requires service role for:**

| Query target | Purpose |
|--------------|---------|
| `v_founder_platform_overview` | Users, content counts, open tickets, avg rating |
| `v_founder_creator_activity` | Activation funnel inputs |
| `v_founder_support_summary` | Support KPIs |
| `v_founder_support_by_category` | Category breakdown |
| `v_founder_character_feedback_summary` | Feedback aggregates |
| `v_founder_content_metrics` | Public/private content split |
| `v_founder_moderation_summary` | Moderation KPIs |
| `support_tickets` | Recent tickets (all users) |
| `creator_feedback` | Rating distribution + recent entries |
| `moderation_queue` | Recent flags + category aggregation |
| `characters`, `worlds` | Published-work funnel |
| `character_images`, `world_images`, `story_images` | Asset completion funnel |

All founder views are granted **only** to `service_role` in migrations (`20250625000000_platform_hardening.sql`, `20250629000000_founder_admin_role.sql`, `20250630000000_moderation_queue.sql`) and fix scripts (`fix-platform-hardening-api.sql`, `fix-founder-admin-api.sql`, `fix-moderation-api.sql`).

### 1.2 Database health

**Action:** `getDatabaseHealth()` — `src/app/actions/database-health.ts`  
**Route:** Embedded in `/dashboard/admin`  
**Requires service role for:** Probing table/view existence via PostgREST (`HEAD` count queries) on 14 objects across Character Bible, World Bible, Story Bible, Support, Creator Feedback, Moderation, and Founder Analytics components.

Without the key, the health section shows `databaseHealthError` with the same missing-key message (items array is empty).

### 1.3 Support Inbox

**Actions:** `getSupportInboxData()`, `updateSupportTicketStatus()` — `src/app/actions/support-admin.ts`  
**Route:** `/dashboard/admin/support`  
**Requires service role for:**

- `SELECT *` on all `support_tickets` (RLS only allows users to read **own** tickets)
- `UPDATE` ticket status (no authenticated UPDATE grant or policy)
- `SELECT` all `profiles` (username/display name join)
- `storage.createSignedUrl()` on `support-attachments` for **other users’** screenshots (storage RLS is owner-only)

### 1.4 Feedback Inbox

**Action:** `getFeedbackInboxData()` — `src/app/actions/feedback-admin.ts`  
**Route:** `/dashboard/admin/feedback`  
**Requires service role for:**

- `SELECT *` on all `creator_feedback` (RLS only allows users to read **own** feedback)
- `SELECT` all `profiles`
- `SELECT` on `characters`, `worlds`, `stories` for entity labels (could work with user-scoped RLS only for own entities — insufficient for admin inbox)

### 1.5 Moderation Queue

**Actions:** `getModerationQueueData()`, `approveModerationItem()`, `removeModerationItem()`, `escalateModerationItem()`, `suspendUserFromModeration()` — `src/app/actions/moderation-admin.ts`  
**Route:** `/dashboard/admin/moderation`  
**Requires service role for:**

- `SELECT` on `v_founder_moderation_summary`
- `SELECT *` on `moderation_queue` (RLS: **insert only** for own rows; **no SELECT** for authenticated)
- `UPDATE` on `moderation_queue` (no authenticated UPDATE grant)
- `UPDATE (is_suspended, suspended_at)` on `profiles` (granted to `service_role` only in `fix-moderation-api.sql`)
- `SELECT` all `profiles`
- `storage.createSignedUrl()` on flagged image buckets/paths owned by other users

---

## 2. Features that could use RLS + admin role checks instead

`profiles.role = 'admin'` is checked in server actions and `src/app/dashboard/admin/layout.tsx`, but **is not enforced in Postgres RLS today**. The following could be migrated to authenticated client + admin policies, reducing (not eliminating) service role dependency:

| Feature | RLS-feasible? | Notes |
|---------|---------------|-------|
| **Support Inbox — list/update tickets** | **Yes** | Add `SELECT`/`UPDATE` policies: `exists (select 1 from profiles where id = auth.uid() and role = 'admin')` |
| **Feedback Inbox — list feedback** | **Yes** | Admin `SELECT` on `creator_feedback` |
| **Moderation Queue — list/review** | **Yes** | Admin `SELECT`/`UPDATE` on `moderation_queue` |
| **Suspend user** | **Yes** | Admin `UPDATE` on `profiles.is_suspended` (replace service_role-only grant) |
| **Founder summary views** | **Partial** | Views could become `security invoker` with underlying admin policies, or replaced by `SECURITY DEFINER` RPCs that verify admin role |
| **Cross-user storage signed URLs** | **Hard** | Private buckets (`support-attachments`, character/world/story images) need admin storage policies **or** service role for signed URLs |
| **Funnel / cross-table analytics** | **Hard** | Many aggregate queries across all users; RLS admin policies work but multiply policy checks; materialized views or RPCs may be cleaner |
| **Database health probes** | **Partial** | Admin-only RPC returning probe results avoids service role for health checks |
| **Auth gate (`isFounderAdmin`)** | **Already app-layer** | Should remain; RLS is defense-in-depth |

**Recommendation:** Keep `SUPABASE_SERVICE_ROLE_KEY` for storage signed URLs and heavy aggregate analytics in the near term. Migrate inboxes + moderation actions to admin RLS policies as a security hardening step so a bug in server actions cannot expose data without DB-level enforcement.

---

## 3. Feature verification

### 3.1 Support Inbox

| Item | Status |
|------|--------|
| Route | `/dashboard/admin/support` — **exists** |
| UI | `SupportInbox.tsx` — **complete** (list, expand, status transitions) |
| Server actions | `getSupportInboxData`, `updateSupportTicketStatus` — **implemented** |
| Sidebar link | **Missing** — reachable only from Admin Dashboard “Support inbox →” link |
| Works without service role | **No** |
| Works without migrations | **No** — needs `support_tickets` + `fix-platform-hardening-api.sql` |

### 3.2 Feedback Inbox

| Item | Status |
|------|--------|
| Route | `/dashboard/admin/feedback` — **exists** |
| UI | `FeedbackInbox.tsx` — **complete** (rating filter, list) |
| Server actions | `getFeedbackInboxData` — **read-only** (no admin actions on feedback) |
| Sidebar link | **Missing** — Admin Dashboard link only |
| Works without service role | **No** |
| Works without migrations | **No** — needs `creator_feedback` + platform hardening grants |

### 3.3 Moderation Queue

| Item | Status |
|------|--------|
| Route | `/dashboard/admin/moderation` — **exists** |
| Sidebar link | **Yes** — founder sidebar “Moderation” |
| UI | `ModerationQueue.tsx` — **complete** (approve/remove/escalate/suspend) |
| Server actions | Full CRUD on queue + suspend — **implemented** |
| Status filter UI | **Partial** — server accepts filter param but page always passes `"pending"`; no UI to view all/escalated |
| Works without service role | **No** |
| Works without migrations | **No** — needs `20250630000000_moderation_queue.sql` + `fix-moderation-api.sql` |

### 3.4 Founder Dashboard

| Item | Status |
|------|--------|
| Route | `/dashboard/admin` — **exists** |
| Sidebar link | **Yes** — founder sidebar “Admin” |
| UI | `FounderDashboard.tsx` — **extensive** (operations cards, funnel, support/moderation/feedback sections, future metrics placeholders) |
| Analytics data | **Blocked** without `SUPABASE_SERVICE_ROLE_KEY` |
| Inbox deep links | **Yes** — support, feedback, moderation |
| Future metrics | **Placeholder only** (cost, storage, AI, revenue, retention) |

### 3.5 Database Health

| Item | Status |
|------|--------|
| Location | Section on `/dashboard/admin` (not a separate route) |
| Action | `getDatabaseHealth()` |
| Mirrors | `supabase/DATABASE_HEALTHCHECK.sql` (partial — app probes 7 component groups, not every healthcheck row) |
| Works without service role | **No** |
| Objects **not** probed by app but used by analytics | `v_founder_usage_counts`, `v_founder_support_by_category`, `v_founder_asset_counts` |

---

## 4. Where support tickets are stored

| Layer | Detail |
|-------|--------|
| **Table** | `public.support_tickets` |
| **Migration** | `supabase/migrations/20250625000000_platform_hardening.sql` |
| **Columns** | `id`, `user_id`, `subject`, `category`, `message`, `screenshot_path`, `status`, `priority`, `created_at`, `resolved_at` |
| **Categories** | `bug_report`, `feature_request`, `billing`, `account`, `ai_generation`, `other` |
| **Statuses** | `open`, `in_progress`, `resolved` |
| **Screenshot storage** | Supabase Storage bucket `support-attachments` (private); path `{user_id}/{ticket_id}.{ext}` |
| **User submit** | `submitSupportTicket()` — `src/app/actions/support.ts` (authenticated client + RLS insert) |
| **User read own** | `getMySupportTickets()` — same action file; RLS select own rows |
| **User UI** | `/dashboard/help` — `ContactSupportForm` + recent tickets list |
| **Founder read/update** | `support-admin.ts` via service role |
| **Moderation side effect** | Ticket subject/message → `scanSavedText()`; screenshot → `scanUploadedImage()` → may insert into `moderation_queue` |
| **Founder views** | `v_founder_support_summary`, `v_founder_support_by_category`; also referenced in `v_founder_platform_overview` |

---

## 5. Where creator feedback is stored

| Layer | Detail |
|-------|--------|
| **Table** | `public.creator_feedback` |
| **Migration** | `supabase/migrations/20250625000000_platform_hardening.sql` |
| **Columns** | `id`, `user_id`, `entity_type`, `entity_id`, `feedback_type`, `rating`, `notes`, `metadata`, `created_at` |
| **Entity types** | `character`, `world`, `story`, `generation` |
| **Feedback types** | `vision_rating`, `generation_quality`, `other` |
| **Production usage today** | Character **vision_rating** only (1–5 stars + optional notes) |
| **User submit** | `submitCharacterVisionFeedback()` — `src/app/actions/creator-feedback.ts` |
| **User read own** | `getLatestCharacterVisionFeedback()` — same file |
| **User UI** | `CharacterBibleFeedback` on character bible — `/dashboard/characters/[id]` |
| **Founder read** | `feedback-admin.ts`, `founder-analytics.ts` via service role |
| **Founder view** | `v_founder_character_feedback_summary` |
| **Not implemented** | World/story/generation feedback UI; generation quality thumbs |

---

## 6. Where moderation flags are stored

| Layer | Detail |
|-------|--------|
| **Table** | `public.moderation_queue` |
| **Migration** | `supabase/migrations/20250630000000_moderation_queue.sql` |
| **Columns** | `id`, `user_id`, `content_type` (`image`/`text`), `entity_type`, `entity_id`, `field_name`, `storage_bucket`, `storage_path`, `content_preview`, `status`, `risk_score`, `risk_categories`, `scanner_result`, `reviewer_id`, `reviewer_note`, `reviewed_at`, `created_at` |
| **Statuses** | `pending`, `approved`, `removed`, `escalated` |
| **Insert path** | `enqueueModerationItem()` — `src/lib/moderation/enqueue.ts` (uses **user’s** authenticated Supabase client; RLS insert own rows only) |
| **Scan triggers** | `scanSavedText()` / `scanUploadedImage()` — called from characters, worlds, stories, bibles, chapters, profile, support, images actions |
| **Creators cannot read queue** | By design — no SELECT policy for authenticated |
| **Founder read/review** | `moderation-admin.ts` via service role |
| **Founder view** | `v_founder_moderation_summary` |
| **Account suspension** | `profiles.is_suspended`, `profiles.suspended_at` (migration `20250630000000_moderation_queue.sql`); updated via service role in `suspendUserFromModeration()` |
| **Enforcement of suspension** | **Not audited in depth** — flag exists; verify auth/middleware blocks suspended users separately |

---

## 7. Auth model (founder access)

| Mechanism | Implementation |
|-----------|----------------|
| Role storage | `profiles.role` — `'user'` \| `'admin'` (`20250629000000_founder_admin_role.sql`) |
| App check | `isFounderAdmin()` reads role via authenticated server client |
| Route guard | `src/app/dashboard/admin/layout.tsx` → `forbidden()` if not admin |
| Sidebar visibility | `DashboardShell` passes `isAdmin={profile?.role === 'admin'}` |
| Promoting a founder | Manual SQL: `UPDATE profiles SET role = 'admin' WHERE username = '…';` (documented in `DATABASE_REPAIR_PLAN.md`) |
| Service role | Separate from user role — env var on server; not tied to `profiles.role` |

**Important:** A user with `role = 'admin'` but **without** `SUPABASE_SERVICE_ROLE_KEY` can open all admin routes but sees **no operational data**.

---

## 8. Required environment variables

| Variable | Required for | Notes |
|----------|--------------|-------|
| `NEXT_PUBLIC_SUPABASE_URL` | All Supabase | Already required for app |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | User-facing app | Already required |
| **`SUPABASE_SERVICE_ROLE_KEY`** | **All founder admin data** | Server-only; documented in `.env.example` line 4 |
| `NEXT_PUBLIC_SITE_URL` | General app | Not founder-specific |

**Setup steps (local):**

1. Copy service role key from Supabase → Project Settings → API → `service_role` (secret).
2. Add to `.env.local`: `SUPABASE_SERVICE_ROLE_KEY=eyJ…`
3. Restart Next.js dev server (env is read at startup).
4. Ensure migrations + fix SQL scripts have been applied (see §9).

---

## 9. Migration / API dependencies

Founder admin assumes this migration order (from `DATABASE_REPAIR_PLAN.md`):

1. `20250625000000_platform_hardening.sql` — `support_tickets`, `creator_feedback`, support views  
2. `fix-platform-hardening-api.sql` — PostgREST grants  
3. `20250629000000_founder_admin_role.sql` — `profiles.role`, extended analytics views (**requires step 1**)  
4. `fix-founder-admin-api.sql` — view grants  
5. `20250630000000_moderation_queue.sql` — `moderation_queue`, suspension columns  
6. `fix-moderation-api.sql` — moderation grants  

Optional bible/story migrations are probed by Database Health but are not required for inbox/moderation core loops.

Verify in Supabase SQL Editor: `supabase/DATABASE_HEALTHCHECK.sql` or the live Database Health section on Admin Dashboard (once service role is set).

---

## 10. Routes map

| Route | Purpose | In sidebar? |
|-------|---------|-------------|
| `/dashboard/admin` | Founder Dashboard + Database Health | Admin (founder) |
| `/dashboard/admin/moderation` | Moderation Queue | Moderation (founder) |
| `/dashboard/admin/support` | Support Inbox | **No** — dashboard link only |
| `/dashboard/admin/feedback` | Feedback Inbox | **No** — dashboard link only |
| `/dashboard/help` | User support submit (not admin) | Removed from V3 nav; route still exists |

**Missing routes (not implemented):**

- Dedicated `/dashboard/admin/health` (health is embedded in main admin page — acceptable)
- User management / role assignment UI
- Founder audit log
- Cost/AI/revenue dashboards (placeholders only)

---

## 11. Missing UI / UX gaps

| Gap | Severity |
|-----|----------|
| Sidebar links for Support + Feedback inboxes | Low — dashboard links exist |
| Moderation status filter (all / escalated / resolved) | Low — hardcoded `pending` |
| Clear error when service role missing on sub-pages | Medium — amber banner; easy to miss vs dashboard banner |
| No in-app way to grant `admin` role | Expected — SQL only |
| Future metrics section | Informational placeholders only |
| Suspension enforcement visibility | Unknown — no admin UI to unsuspend |
| Feedback inbox: no link to character/entity | Low — shows entity label only |

---

## 12. Blockers (prioritized)

| # | Blocker | Impact | Fix |
|---|---------|--------|-----|
| 1 | **`SUPABASE_SERVICE_ROLE_KEY` not set** | All founder data empty; analytics + health fail | Set env var, restart server |
| 2 | **Migrations not applied** | PGRST205 / “table not found” errors | Run migrations + fix-*-api.sql per §9 |
| 3 | **`profiles.role` not `admin`** | 403 on all `/dashboard/admin/*` | SQL role promotion |
| 4 | **No admin RLS policies** | Total reliance on service role + app checks | Hardening (see recommendations) |
| 5 | **Storage policies owner-only** | Even with admin RLS, previews need service role or new storage policies | Storage admin policies or keep service role for signed URLs |

---

## 13. Recommendations

### Immediate (unblock founder testing)

1. Set `SUPABASE_SERVICE_ROLE_KEY` in `.env.local` and production/staging secrets.
2. Run `DATABASE_HEALTHCHECK.sql` in Supabase; fix any `Missing` components.
3. Promote founder account: `UPDATE profiles SET role = 'admin' WHERE …`.
4. Submit a test support ticket via `/dashboard/help` and a test vision rating on a character to validate end-to-end pipelines.

### Short term (product)

1. Add Support + Feedback links to founder sidebar (or Operations submenu).
2. Add moderation queue status tabs (pending / escalated / all).
3. Surface the same service-role error component on all admin sub-pages prominently (not only on main dashboard).
4. Document production env in deployment checklist (`BETA_READINESS_PLAN.md` already mentions this).

### Security / architecture

1. Add Postgres RLS policies for admin `SELECT`/`UPDATE` on `support_tickets`, `creator_feedback`, `moderation_queue`, and `profiles.is_suspended`.
2. Keep service role for: storage signed URLs across tenants, bulk analytics, and database health probes **or** replace with `SECURITY DEFINER` RPCs.
3. Never expose `SUPABASE_SERVICE_ROLE_KEY` to client bundles — current `admin.ts` is server-only ✓.
4. Add admin storage policies for `support-attachments` read if moving off service role for inbox screenshots.

### Long term

1. Persist founder metric snapshots (see `FOUNDER_ANALYTICS.md` Phase 2).
2. Build cost/AI/revenue panels when billing exists.
3. Admin user-management UI instead of manual SQL role updates.
4. Verify and surface `is_suspended` enforcement in auth middleware.

---

## 14. File reference

| Area | Key files |
|------|-----------|
| Service role client | `src/lib/supabase/admin.ts` |
| Admin role check | `src/lib/founder-auth.ts` |
| Analytics | `src/app/actions/founder-analytics.ts` |
| Database health | `src/app/actions/database-health.ts` |
| Support admin | `src/app/actions/support-admin.ts` |
| Feedback admin | `src/app/actions/feedback-admin.ts` |
| Moderation admin | `src/app/actions/moderation-admin.ts` |
| User support submit | `src/app/actions/support.ts` |
| User feedback submit | `src/app/actions/creator-feedback.ts` |
| Moderation enqueue | `src/lib/moderation/enqueue.ts` |
| Admin layout guard | `src/app/dashboard/admin/layout.tsx` |
| UI | `src/components/admin/FounderDashboard.tsx`, `SupportInbox.tsx`, `FeedbackInbox.tsx`, `ModerationQueue.tsx` |
| Migrations | `20250625000000_platform_hardening.sql`, `20250629000000_founder_admin_role.sql`, `20250630000000_moderation_queue.sql` |

---

## 15. Current status summary

| Component | Route | UI | Server | DB schema | Blocked by missing service role? |
|-----------|-------|-----|--------|-----------|----------------------------------|
| Founder Dashboard | ✓ | ✓ | ✓ | ✓ (if migrated) | **Yes** |
| Database Health | ✓ (embedded) | ✓ | ✓ | ✓ | **Yes** |
| Support Inbox | ✓ | ✓ | ✓ | ✓ | **Yes** |
| Feedback Inbox | ✓ | ✓ | ✓ | ✓ | **Yes** |
| Moderation Queue | ✓ | ✓ | ✓ | ✓ | **Yes** |
| User → support pipeline | ✓ | ✓ | ✓ (RLS) | ✓ | No |
| User → feedback pipeline | ✓ | ✓ | ✓ (RLS) | ✓ | No |
| User → moderation flags | ✓ | N/A | ✓ (RLS insert) | ✓ | No |

**Bottom line:** Founder admin **UI and routing are largely complete** for V1.1. Operational functionality is **100% dependent on `SUPABASE_SERVICE_ROLE_KEY`** plus applied migrations. Setting the env var is the primary fix for the reported analytics failure; moderation and inboxes are affected equally even if the page shell appears to load.
