# Founder Operations V1

**Phase:** 2A — Founder Operations Completion  
**Date:** 2026-06-14  
**Authority:** [FOUNDER_ADMIN_AUDIT.md](./FOUNDER_ADMIN_AUDIT.md) · [CHARID_VISION_V3.md](./CHARID_VISION_V3.md) · [FOUNDER_TESTING_LESSONS_ROUND_1.md](./FOUNDER_TESTING_LESSONS_ROUND_1.md)  
**Verification method:** Code-path trace + workflow checklist. Live end-to-end pass assumes `SUPABASE_SERVICE_ROLE_KEY` is set, migrations applied, and founder account has `profiles.role = 'admin'`.

**Round 1 outcome:** Internal architecture validated. Next product priority is **Story → Finished Work → Publish → Portfolio**, not analytics expansion. See lessons doc for creator/founder pain points.

---

## Verification prerequisites

Before running founder workflows, confirm:

| Prerequisite | How to verify |
|--------------|---------------|
| `SUPABASE_SERVICE_ROLE_KEY` in `.env.local` | Restart dev server; Admin Dashboard analytics section populates (no amber service-role banner) |
| Platform hardening migration | `support_tickets`, `creator_feedback` exist; `fix-platform-hardening-api.sql` run |
| Founder admin migration | `profiles.role` column; `fix-founder-admin-api.sql` run |
| Moderation migration | `moderation_queue`; `fix-moderation-api.sql` run |
| Founder role | `UPDATE profiles SET role = 'admin' WHERE id = '…';` |
| Database health | Admin Dashboard → Database Health → all **Ready** (mirrors `supabase/DATABASE_HEALTHCHECK.sql`) |

**Verification status key**

| Symbol | Meaning |
|--------|---------|
| ✅ | Implemented; expected to work when prerequisites met |
| ⚠️ | Partial — works with limitations |
| ❌ | Not implemented |
| 🔲 | Requires live manual test after service role is set |

---

## Founder Dashboard verification

Route: `/dashboard/admin`  
Action: `getFounderDashboardData()` + `getDatabaseHealth()`  
UI: `FounderDashboard.tsx`

### Platform overview — 🔲 live test

| Metric | Source | Dashboard location | Status |
|--------|--------|-------------------|--------|
| Total users | `v_founder_platform_overview.total_users` | Overview | ✅ |
| New users (7d) | `v_founder_platform_overview.new_users_7d` | Overview | ✅ |
| Characters created | `v_founder_platform_overview.characters_created` | Overview + Content | ✅ |
| Worlds created | `v_founder_platform_overview.worlds_created` | Overview + Content | ✅ |
| Stories created | `v_founder_platform_overview.stories_created` | Overview + Content | ✅ |
| Public portfolios | `v_founder_creator_activity.users_with_public_portfolios` | Overview | ✅ |
| Open support tickets | `v_founder_platform_overview.support_tickets_open` | Overview + Operations | ✅ |
| Pending moderation | `v_founder_moderation_summary.pending_count` | Overview + Operations | ✅ |
| Avg character rating | `v_founder_platform_overview.avg_character_rating` | Overview + Feedback | ✅ |
| New feedback (7d) | `creator_feedback` count query | Operations | ✅ |

### User / content counts — 🔲 live test

All count metrics above pull from founder SQL views via service role. With key + migrations: **expected ✅**.

**Note:** “Total users” = rows in `profiles`, not raw `auth.users`. Users without a profile row are not counted.

### Database health card — 🔲 live test

| Component probed | Migration | Status |
|------------------|-----------|--------|
| Character Bible | `20250623000000_character_bible.sql` | ✅ probe exists |
| World Bible | `20250627000000_world_bible.sql` | ✅ |
| Story Bible | `20250631000000_story_bible.sql` | ✅ |
| Support | `20250625000000_platform_hardening.sql` | ✅ |
| Creator Feedback | same | ✅ |
| Moderation | `20250630000000_moderation_queue.sql` | ✅ |
| Founder Analytics | `20250629000000_founder_admin_role.sql` | ✅ (6 views) |

### Founder analytics views — code coverage

| View | Queried by dashboard? | In DB health probe? |
|------|----------------------|---------------------|
| `v_founder_platform_overview` | ✅ | ✅ |
| `v_founder_creator_activity` | ✅ | ✅ |
| `v_founder_content_metrics` | ✅ | ✅ |
| `v_founder_support_summary` | ✅ | ✅ |
| `v_founder_support_by_category` | ✅ | ❌ not probed |
| `v_founder_character_feedback_summary` | ✅ | ✅ |
| `v_founder_moderation_summary` | ✅ | ✅ |
| `v_founder_usage_counts` | ❌ not used (superseded by platform overview) | ❌ |
| `v_founder_asset_counts` | ❌ not used | ❌ |

### Additional dashboard sections (present in V1)

| Section | Status |
|---------|--------|
| Operations cards (support, feedback, moderation deep links) | ✅ |
| Creator funnel (signup → character → world → story → portfolio → published work) | ✅ |
| Activation rates (% of signups per stage) | ✅ |
| Completion rates (% with uploaded assets) | ✅ |
| Dropoff points | ✅ |
| Support (open/in progress/resolved, by category, recent tickets) | ✅ |
| Moderation (pending/escalated/approved/removed, risk categories, recent activity) | ✅ |
| Creator feedback (avg, distribution, recent) | ✅ |
| Content (public/private breakdown, avg assets) | ✅ |
| Future metrics placeholders | ⚠️ static “Coming soon” |

### Missing metrics (V1 dashboard)

Documented gaps relative to a full operations control center (see [FOUNDER_DASHBOARD_V2.md](./FOUNDER_DASHBOARD_V2.md)):

| Missing metric | Notes |
|----------------|-------|
| DAU / WAU / MAU | No activity tracking table or view |
| Daily/weekly new users trend | Only `new_users_7d` snapshot |
| Support response time | No `first_response_at` or SLA fields |
| Support founder notes | No column or UI |
| Ticket priority management | `priority` stored but not editable in inbox |
| Suspension count | No aggregate; no unsuspend UI |
| Revenue / MRR / AI spend | Placeholder section only |
| Storage usage | Not queried |
| Retention / cohorts | Placeholder only |
| Chapters / scenes / assets counts | Not on founder dashboard |
| `v_founder_usage_counts` / `v_founder_asset_counts` | Exist in DB but unused in UI |
| Low-rating feedback alert | View has `low_rating_count`; not surfaced in dashboard |
| Email / user contact on tickets | Not shown (only username/display name) |

---

## Support Operations

### User workflow trace

```
/dashboard/help
  → ContactSupportForm
  → submitSupportTicket() [RLS insert, authenticated client]
  → public.support_tickets
  → optional: storage.support-attachments/{user_id}/{ticket_id}.ext
  → optional: scanSavedText / scanUploadedImage → moderation_queue
  → getMySupportTickets() shows own tickets on Help page
```

| Step | Status | Notes |
|------|--------|-------|
| Submit ticket (subject, category, message) | ✅ | Categories: bug, feature, billing, account, AI, other |
| Upload screenshot (JPEG/PNG/WebP, ≤5 MB) | ✅ | Private bucket `support-attachments` |
| See own ticket on Help page | ✅ | Last 5 tickets listed |
| Reach Help from V3 nav | ❌ | Route exists; removed from sidebar — direct URL or bookmark only |

### Founder workflow trace

```
/dashboard/admin/support
  → getSupportInboxData() [service role]
  → SupportInbox
  → updateSupportTicketStatus() [service role]
```

| Step | Expected with service role | Gap |
|------|---------------------------|-----|
| Open support inbox | ✅ | Not in founder sidebar — link from Admin Dashboard only |
| View ticket list (all users) | ✅ | Max 200 tickets, newest first |
| View ticket detail (message) | ✅ | Expand row |
| View creator identity | ✅ | Display name + @username |
| View screenshot | ✅ | Signed URL via service role (1h TTL) |
| Mark in progress | ✅ | Sets `status = in_progress` |
| Mark resolved | ✅ | Sets `status = resolved`, `resolved_at = now()` |
| Reopen | ✅ | Clears `resolved_at` |
| **Add founder notes** | ❌ | **No `founder_notes` column; no UI; no server action** |
| Change priority | ❌ | `priority` always `normal` on create; no admin update |
| Reply to user / email | ❌ | No messaging or notification system |
| Assign ticket | ❌ | No assignee field |
| Filter by category/status | ❌ | Full list only |

### Support — what works / fails / missing

**Works (with service role + migrations):**

- End-to-end ticket creation by users (RLS, no service role needed on submit)
- Founder inbox listing, expand, status transitions
- Screenshot upload and founder preview (service role signed URL)
- Dashboard aggregates: open count, category breakdown, recent tickets table
- Automatic moderation scan enqueue on submit (if scanner flags content)

**Fails without service role:**

- Entire founder inbox (empty list + error banner)
- Dashboard support sections (zeros / empty)

**Missing workflow pieces:**

1. Founder internal notes (requested in Phase 2A spec — **not built**)
2. User notification on status change
3. Priority triage UI
4. Sidebar nav link to Support Inbox
5. Help page discoverability in V3 IA

---

## Feedback Operations

### User workflow trace

```
/dashboard/characters/[id]
  → CharacterBibleView → CharacterBibleFeedback
  → submitCharacterVisionFeedback() [RLS insert]
  → public.creator_feedback
     (entity_type=character, feedback_type=vision_rating, rating, notes)
  → getLatestCharacterVisionFeedback() on page reload
```

| Step | Status | Notes |
|------|--------|-------|
| Submit 1–5 star rating | ✅ | Required to submit |
| Submit optional notes (≤2000 chars) | ✅ | Stored in `notes` |
| Re-submit updates | ⚠️ | Inserts **new row** each submit — no upsert; inbox shows all entries |
| World / story / generation feedback | ❌ | Schema supports; no UI |

### Founder workflow trace

```
/dashboard/admin/feedback
  → getFeedbackInboxData(ratingFilter?)
  → FeedbackInbox
```

| Step | Expected with service role | Gap |
|------|---------------------------|-----|
| Open feedback inbox | ✅ | Dashboard link only; not in sidebar |
| See all vision ratings | ✅ | Max 200, newest first |
| Filter by star rating | ✅ | URL query `?rating=1` … `5` |
| See rating | ✅ | `N/5` display |
| See comments (notes) | ✅ | Shown when present |
| See creator identity | ✅ | Display name + @username |
| See entity linkage | ⚠️ | Entity **name** shown (character/world/story title); **no link** to entity or character bible |
| Respond to feedback | ❌ | Read-only inbox |
| Export / analytics drill-down | ❌ | Dashboard has distribution; inbox has no charts |

### Feedback — gaps

| Gap | Severity |
|-----|----------|
| No deep link to character from inbox row | Medium |
| Multiple submissions per character inflate counts | Low |
| No world/story feedback capture | Expected (future) |
| `v_founder_character_feedback_summary.low_rating_count` not shown in UI | Low |
| No “common complaints” NLP / tagging | Future (V2) |

---

## Moderation Operations

### Content → queue trace

```
User saves content or uploads image
  → scanSavedText() / scanUploadedImage()
  → getContentScanner() [default: MODERATION_SCANNER=stub → never flags]
  → if flagged: enqueueModerationItem() → moderation_queue [RLS insert own row]
```

**Testing moderation enqueue locally:**

Set `MODERATION_SCANNER=heuristic` and include `__moderation_flag_test__` in saved text (e.g. support ticket message or character field).

| Scanner mode | Flags content? |
|--------------|----------------|
| `stub` (default) | ❌ Never — queue stays empty in normal use |
| `heuristic` | ✅ Test string only |
| Production provider | ❌ Not implemented |

### Founder workflow trace

```
/dashboard/admin/moderation
  → getModerationQueueData("pending")  [hardcoded filter]
  → ModerationQueue
  → approveModerationItem / removeModerationItem / escalateModerationItem
  → suspendUserFromModeration
```

| Action | Updates queue? | Affects live content? | Sets reviewer? |
|--------|---------------|----------------------|----------------|
| **Approve** | `status = approved` | ❌ No — content remains published | ✅ `reviewer_id`, `reviewed_at`, optional `reviewer_note` |
| **Remove** | `status = removed` | ❌ No — **does not delete/hide source content** | ✅ |
| **Escalate** | `status = escalated` | ❌ No | ✅ |
| **Suspend account** | N/A | Sets `profiles.is_suspended = true` | ⚠️ Note saved to pending queue rows only |

### Moderation — what works / fails / missing

**Works (with service role + flagged items in queue):**

- Queue list with risk score, categories, content preview
- Image preview via signed URL (service role)
- Approve / remove / escalate with optional reviewer note
- Suspend user flag on profile
- Dashboard moderation summary + recent activity

**Fails / limitations:**

- **Default scanner never flags** — empty queue in production-like dev
- **Remove does not remove content** — queue status only; images/text stay live
- **Approve does not unhide anything** — nothing was hidden on flag
- **Suspend not enforced** — `is_suspended` not checked in `middleware.ts` or auth flow
- **No unsuspend** — no admin action or UI
- **Queue filter** — page always loads `pending` only; escalated/approved history not browsable in UI
- **No link to source entity** — entity_type/id shown but no navigation

---

## Platform Health

| Check | V1 behavior | Status |
|-------|-------------|--------|
| Table/view existence | 7 component groups, 14 objects | ✅ |
| RLS policy verification | ❌ Not in app probe (in `DATABASE_HEALTHCHECK.sql` only) | ⚠️ |
| Storage bucket health | ❌ Not probed | ❌ |
| Service role grant verification | ❌ Not in app probe | ⚠️ |
| PostgREST schema cache | Indirect via probe errors | ⚠️ |

**With service role:** health cards populate Ready/Warning/Missing per component.  
**Without service role:** entire section errors; no cards.

---

## Founder Metrics

### Implemented (V1)

| Category | Metrics |
|----------|---------|
| Growth | Total users, new users 7d |
| Content | Characters, worlds, stories; public/private splits; avg assets per character/world |
| Activation | Funnel counts + % rates + dropoff |
| Support | Open, in progress, resolved, by category |
| Feedback | Avg rating, distribution, recent, new 7d |
| Moderation | Pending, escalated, approved, removed, flagged 7d, risk categories |
| Health | 7-component migration readiness |

### Not implemented

| Category | Metrics |
|----------|---------|
| Engagement | DAU, WAU, MAU, session length |
| Support SLA | First response time, mean time to resolve |
| Feedback intelligence | Themed complaints, feature request extraction |
| Moderation ops | Suspension count, reinstatements, content takedowns |
| Economics | Revenue, MRR, credits, AI cost, margin |
| Infrastructure | Storage bytes, queue depth, API latency |

---

## Missing Features

Priority list for Phase 2B+:

1. **`SUPABASE_SERVICE_ROLE_KEY` in all environments** — unblocks everything (config, not feature)
2. **Support founder notes** — schema + inbox UI + optional user-visible reply
3. **Suspension enforcement** — block dashboard/login when `is_suspended`
4. **Unsuspend admin action**
5. **Moderation content actions** — remove/hide should affect source asset or unpublish
6. **Production moderation scanner** — replace stub default
7. **Support + Feedback sidebar links**
8. **Help page link** — V3 nav or Settings entry
9. **Moderation queue filters** — pending / escalated / all / history
10. **Feedback → entity deep links**
11. **Admin RLS policies** — defense-in-depth (see audit)
12. **Activity events table** — prerequisite for DAU/WAU/MAU

---

## Recommended Improvements

### Immediate (after service role configured)

1. Run live pass using checklist below; log results in `UX_BUGS_AND_CONFUSION.md`.
2. Set `MODERATION_SCANNER=heuristic` in dev; create test flag via support ticket message.
3. Confirm `DATABASE_HEALTHCHECK.sql` all Ready matches Admin Dashboard health cards.

### Short term (operations completion)

1. Add `founder_notes` (internal) and optional `founder_reply` (user-visible) to `support_tickets`.
2. Enforce `is_suspended` in middleware + show suspension message.
3. Wire **Remove** moderation action to hide/delete storage object or unpublish entity.
4. Add Support + Feedback to founder sidebar.
5. Add entity links in Feedback Inbox and Moderation Queue.
6. Moderation status tabs on queue page.

### Medium term (control center — see V2 design)

1. `founder_events` or analytics pipeline for DAU/WAU/MAU.
2. Support SLA timestamps (`first_response_at`, `resolved_at` already partial).
3. Scheduled metric snapshots for trends.
4. Revenue panel when Stripe/credits ship.

---

## Live verification checklist

Run after `SUPABASE_SERVICE_ROLE_KEY` is set. Mark pass/fail in this doc or `TESTING_CHECKLIST_V1.md`.

### Dashboard

- [ ] `/dashboard/admin` loads without service-role error banner
- [ ] Overview counts match Supabase SQL spot-check
- [ ] Database Health all Ready
- [ ] Funnel numbers non-zero if test data exists
- [ ] Operations cards link to inboxes

### Support

- [ ] User submits ticket at `/dashboard/help` with screenshot
- [ ] Ticket appears in user’s recent list
- [ ] Founder sees ticket in `/dashboard/admin/support`
- [ ] Screenshot renders in expanded view
- [ ] Status: open → in progress → resolved
- [ ] Dashboard open count decrements on resolve

### Feedback

- [ ] User submits vision rating + notes on character bible
- [ ] Founder sees entry in `/dashboard/admin/feedback`
- [ ] Rating filter works (`?rating=5`)
- [ ] Creator name and character name visible

### Moderation

- [ ] Set `MODERATION_SCANNER=heuristic`
- [ ] Submit support ticket with `__moderation_flag_test__` in message
- [ ] Item appears in `/dashboard/admin/moderation`
- [ ] Approve sets status; item leaves pending list
- [ ] (Separate test) Escalate, Remove, Suspend — verify DB rows updated
- [ ] Confirm suspended user can still access app (expected fail — enforcement missing)

---

## File reference

| Workflow | User entry | Founder entry | Storage |
|----------|------------|---------------|---------|
| Support | `support.ts`, `/dashboard/help` | `support-admin.ts`, `/dashboard/admin/support` | `support_tickets`, `support-attachments` |
| Feedback | `creator-feedback.ts`, character bible | `feedback-admin.ts`, `/dashboard/admin/feedback` | `creator_feedback` |
| Moderation | `enqueue.ts`, scan-* | `moderation-admin.ts`, `/dashboard/admin/moderation` | `moderation_queue`, `profiles.is_suspended` |
| Analytics | — | `founder-analytics.ts`, `/dashboard/admin` | founder views |
| Health | — | `database-health.ts` | migration probes |

---

## Summary

Founder operations **V1 is architecturally complete** for read/review workflows. The primary historical blocker was missing `SUPABASE_SERVICE_ROLE_KEY`. Once configured:

- **Dashboard, health, inboxes, and moderation actions should work** for data that exists.
- **Support** lacks founder notes and priority management.
- **Feedback** works for character vision ratings; entity links are text-only.
- **Moderation** actions update queue state only; default scanner produces no flags; suspension is not enforced.

Next design target: [FOUNDER_DASHBOARD_V2.md](./FOUNDER_DASHBOARD_V2.md) — operational control center.
