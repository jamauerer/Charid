# Founder Dashboard V2 — Design

**Status:** Design only — not implemented  
**Date:** 2026-06-14  
**Authority:** [CHARID_VISION_V3.md](./CHARID_VISION_V3.md) · [FOUNDER_OPERATIONS_V1.md](./FOUNDER_OPERATIONS_V1.md)  
**Goal:** Transform founder tools from **diagnostics** into a **business control center** — the operational nerve center for CharID as a creator operating system.

---

## Design intent

V1 founder tools answer: *“Is the database healthy and what happened recently?”*

V2 must answer: *“How is the business performing, where are creators stuck, what needs my attention today, and is the platform safe and economical?”*

Aligned with V3 principles:

- **Creators are the product** — metrics emphasize universe-building progression (character → world → story → publish), not AI output volume.
- **Admin invisible to normal users** — control center is founder-only; language can stay internal/technical here.
- **Monetization-ready** — revenue section designed but not built until billing ships.

---

## Information architecture

```
/dashboard/admin                    ← Control Center (home)
├── /dashboard/admin/support        ← Support Operations (inbox + SLA)
├── /dashboard/admin/feedback       ← Creator Satisfaction
├── /dashboard/admin/moderation     ← Trust & Safety
├── /dashboard/admin/health         ← Platform Health (optional split from home)
└── /dashboard/admin/users          ← Future: user lookup, roles, suspension
```

**V2 navigation:** Add Support, Feedback, and Health to founder sidebar (V1 only has Admin + Moderation).

---

## Page layout — Control Center home

Single-screen **command view** with six zones. Founder opens `/dashboard/admin` and immediately sees what needs action.

```
┌─────────────────────────────────────────────────────────────────┐
│  CharID Control Center                          [Today ▼] [7d]   │
├─────────────────────────────────────────────────────────────────┤
│  ATTENTION REQUIRED (0–5 items)                                  │
│  • 3 open support tickets > 24h                                  │
│  • 2 escalated moderation items                                  │
│  • 1 low vision rating (≤2★) with notes                          │
├──────────────┬──────────────┬──────────────┬──────────────────────┤
│  GROWTH      │  CONTENT     │  SUPPORT     │  FEEDBACK            │
├──────────────┴──────────────┴──────────────┴──────────────────────┤
│  MODERATION  │  PLATFORM HEALTH │  REVENUE (future, greyed)      │
└─────────────────────────────────────────────────────────────────┘
```

**Interaction model:**

- Every metric card is clickable → drills into inbox, chart, or filtered list.
- **Attention Required** is a prioritized queue, not a static banner.
- Time range toggle: Today / 7d / 30d / All time (V1 is mostly all-time snapshots).

---

## Growth

*Is the creator base expanding and returning?*

### Primary metrics

| Metric | Definition | V1 status | V2 source |
|--------|------------|-----------|-----------|
| **Total users** | Profiles count | ✅ V1 | `v_founder_platform_overview` |
| **New users** | Signups in period | ⚠️ 7d only | `profiles.created_at` bucketed |
| **Daily active users (DAU)** | Distinct users with ≥1 meaningful event in 24h | ❌ | `founder_activity_events` (new) |
| **Weekly active users (WAU)** | Same, 7-day window | ❌ | Same |
| **Monthly active users (MAU)** | Same, 30-day window | ❌ | Same |

### Meaningful activity events (proposed)

Count toward DAU/WAU/MAU when a user:

- Creates or edits character, world, or story
- Uploads an asset
- Publishes or updates portfolio
- Submits support or feedback
- Logs in (optional — weaker signal)

**Do not** count raw page views alone — aligns with V3 “creator OS” not traffic blog.

### V2 visuals

- Line chart: signups + DAU over 30 days
- Stickiness: DAU/MAU ratio
- Cohort table: signup week → % active week 2, 4, 8

### Data model (new)

```sql
-- Proposed; not in codebase today
founder_activity_events (
  id, user_id, event_type, entity_type, entity_id, created_at
)
```

Or nightly snapshot table `founder_metric_snapshots (date, metric_key, value)`.

---

## Content

*Are creators building universes?*

### Primary metrics

| Metric | Definition | V1 status |
|--------|------------|-----------|
| **Characters** | Total count | ✅ |
| **Worlds** | Total count | ✅ |
| **Stories** | Total count | ✅ |
| **Published works** | Users with ≥1 public character or world | ✅ (as funnel) |
| **Public portfolios** | `profiles.is_public` | ✅ |
| **Chapters** | Total chapters | ❌ |
| **Assets uploaded** | character + world + story images | ⚠️ avg only; `v_founder_asset_counts` unused |

### V2 visuals

- Stacked area: content created per week (characters, worlds, stories)
- Progression sankey: signup → character → world → story → publish (enhanced V1 funnel)
- Bible completion histogram: % characters with identity ≥80% complete (app-computed sample)

### Drill-downs

- Content → Characters → list sorted by last updated
- Published works → public URLs

---

## Support

*Are creators getting help?*

### Primary metrics

| Metric | Definition | V1 status |
|--------|------------|-----------|
| **Open tickets** | `status = open` | ✅ |
| **In progress** | `status = in_progress` | ✅ |
| **Unresolved issues** | open + in_progress | ✅ (derived) |
| **Response time** | Median time open → first in_progress | ❌ |
| **Resolution time** | Median time open → resolved | ❌ |
| **Tickets by category** | Category distribution | ✅ |
| **Stale tickets** | Open > 24h / 72h | ❌ |

### V2 inbox enhancements

| Feature | V1 | V2 |
|---------|----|----|
| Founder internal notes | ❌ | ✅ `founder_notes` |
| User-visible reply | ❌ | ✅ `founder_reply` + email hook |
| Priority edit | ❌ | ✅ low/normal/high |
| Assignee | ❌ | Optional |
| SLA badges | ❌ | Red if past threshold |

### Attention rules

- Open ticket > 24h → **Attention Required**
- Billing category → higher priority in queue sort

---

## Feedback

*Are creators satisfied with CharID’s preservation of their vision?*

### Primary metrics

| Metric | Definition | V1 status |
|--------|------------|-----------|
| **Creator satisfaction** | Avg vision rating (1–5) | ✅ |
| **Rating distribution** | 1–5 histogram | ✅ |
| **New feedback (7d)** | Recent submissions | ✅ |
| **Low ratings (≤2)** | Count + recent list | ⚠️ in SQL view, not UI |
| **Common complaints** | Themed notes clusters | ❌ |
| **Top requested features** | From support + feedback NLP | ❌ |

### V2 visuals

- Satisfaction trend line (30d rolling avg)
- Word cloud or tagged themes from `notes` (manual tags first, NLP later)
- Cross-link: low rating → character bible → moderation if needed

### Drill-down

- Feedback inbox with entity deep links (`/dashboard/characters/[id]`)
- Filter: rating, date, entity type

---

## Moderation

*Is the platform safe?*

### Primary metrics

| Metric | Definition | V1 status |
|--------|------------|-----------|
| **Pending reviews** | Queue pending count | ✅ |
| **Escalations** | Escalated count | ✅ |
| **Suspensions** | Users with `is_suspended` | ❌ aggregate |
| **Flagged (7d)** | New flags | ✅ |
| **Approved / removed** | Historical counts | ✅ |
| **Risk by category** | Category breakdown | ✅ |

### V2 queue enhancements

| Feature | V1 | V2 |
|---------|----|----|
| Status filters | pending only | pending / escalated / all / history |
| Content action on Remove | status only | hide asset, unpublish, or delete |
| Suspend enforcement | flag only | block login |
| Unsuspend | ❌ | ✅ admin action |
| Link to source entity | ❌ | ✅ |
| Scanner provider status | ❌ | show active scanner + last error |

### Attention rules

- Any escalated item → **Attention Required**
- CSAM/extremist categories → top of queue, red badge

---

## Revenue (future)

*Design only — do not build in Phase 2A.*

Greyed section on dashboard until Stripe/credits ship. Placeholder cards establish IA for when monetization goes live per [MONETIZATION_AND_AI_ROADMAP.md](./MONETIZATION_AND_AI_ROADMAP.md).

| Metric | Definition |
|--------|------------|
| **Subscribers** | Active paid plans |
| **MRR** | Monthly recurring revenue |
| **ARR** | MRR × 12 + annual plans |
| **Credit sales** | One-time credit pack revenue |
| **AI spend** | Provider cost attributable to period |
| **Gross margin** | Revenue − AI spend − infra (simplified) |

### Future data sources

- `subscriptions`, `credit_purchases`, `credit_ledger` (not in schema today)
- AI cost log per generation job
- Stripe webhooks → nightly rollup view `v_founder_revenue_summary`

### V2 UI treatment

- Section header: **Revenue** with badge `Coming soon`
- Skeleton cards with “—” values
- Tooltip: “Enables when billing Phase 1 ships”

---

## Platform Health

*Is the system reliable?*

### V1 → V2 expansion

| Check | V1 | V2 |
|-------|----|----|
| Migration / table probes | ✅ 7 groups | ✅ + grants + RLS |
| Storage buckets | ❌ | bucket exists, object count, size estimate |
| Moderation queue depth | ⚠️ via moderation metrics | explicit health tile |
| API health | ❌ | Supabase status + app error rate |
| Background jobs | ❌ | scan queue backlog, failed jobs |
| Service role configured | ❌ | env probe (boolean, no secret exposure) |

### Health states

- **Green** — all critical paths Ready
- **Yellow** — non-critical missing (e.g. story bible on partial deploy)
- **Red** — support/moderation/auth broken

### V2 layout

Dedicated `/dashboard/admin/health` with:

- Component matrix (V1 cards)
- Last checked timestamp
- One-click copy: remediation SQL filename
- Link to runbook (`DATABASE_REPAIR_PLAN.md`)

---

## Attention Required — unified queue

V2 centerpiece. Aggregates cross-system items needing founder action:

| Source | Condition | Action link |
|--------|-----------|-------------|
| Support | Open > 24h | `/dashboard/admin/support?id=…` |
| Support | Priority high | same |
| Moderation | Pending or escalated | `/dashboard/admin/moderation` |
| Feedback | Rating ≤ 2 with notes | `/dashboard/admin/feedback?rating=1` |
| Health | Any component Missing | health detail |
| Revenue | Charge failure (future) | billing admin |

Sort: severity → age → category.

---

## Metric mapping: V1 → V2

| V2 section | V1 coverage | Net new |
|------------|-------------|---------|
| Growth | Total users, new 7d | DAU, WAU, MAU, trends, cohorts |
| Content | Counts, funnel, public/private | Chapters, asset totals, bible completion |
| Support | Counts, categories, inbox | SLA, notes, replies, stale alerts |
| Feedback | Avg, distribution, inbox | Trends, themes, feature extraction |
| Moderation | Queue + summary | Suspension ops, content takedown, filters |
| Revenue | Placeholder | Full panel (future) |
| Platform Health | DB probes | Storage, API, env, jobs |

---

## UX principles

1. **Action-first** — every widget answers “what do I do?” not only “what is the number?”
2. **One control center** — reduce hopping; deep links for detail work
3. **Time context** — trends over snapshots; default 7d for ops, 30d for growth
4. **Creator-language in feedback** — internal admin can say “Character Bible” but creator-facing exports use V3 terminology
5. **No revenue theater** — grey out until real data; avoid fake zeros

---

## Implementation phases (recommended)

### Phase 2B — Operations hardening (no new analytics pipeline)

- Service role in all envs
- Support founder notes + priority
- Suspension enforce + unsuspend
- Moderation filters + entity links
- Sidebar nav completion
- Remove → hide content action

### Phase 2C — Activity + SLA

- `founder_activity_events` ingestion
- DAU/WAU/MAU views
- Support `first_response_at` + SLA cards
- Metric snapshot cron

### Phase 3 — Business panel

- Stripe + credits schema
- Revenue section live
- AI cost attribution
- Gross margin dashboard

---

## Wireframe — metric card pattern

```
┌─────────────────────────┐
│ OPEN SUPPORT TICKETS    │
│ 3          ↑1 vs yday   │
│ 2 stale >24h            │
│ [Open inbox →]          │
└─────────────────────────┘
```

- Primary number large
- Delta vs prior period (when snapshots exist)
- Secondary context line
- Explicit CTA

---

## Success criteria for V2

Founder can, in under 5 minutes:

1. See whether the platform grew and retained creators this week
2. Triage all open support and moderation items
3. Spot satisfaction regressions from feedback
4. Confirm database, storage, and queues are healthy
5. (Future) See unit economics when revenue ships

---

## Related documents

- [FOUNDER_ADMIN_AUDIT.md](./FOUNDER_ADMIN_AUDIT.md) — architecture and blockers
- [FOUNDER_OPERATIONS_V1.md](./FOUNDER_OPERATIONS_V1.md) — V1 workflow verification
- [FOUNDER_ANALYTICS.md](./FOUNDER_ANALYTICS.md) — SQL view reference
- [TESTING_CHECKLIST_V1.md](./TESTING_CHECKLIST_V1.md) — manual test pass
- [FOUNDER_DASHBOARD_V1.md](./FOUNDER_DASHBOARD_V1.md) — V1 implementation notes (if present)

---

## Summary

**Founder Dashboard V2** elevates CharID founder tooling from a migration-aware diagnostic dashboard to an **operational control center**: growth and engagement, creator content progression, support SLAs, satisfaction intelligence, trust & safety, platform reliability, and a reserved revenue panel. V1 provides the skeleton (inboxes, views, funnel); V2 adds **time series, attention queues, actionable workflows, and business metrics** aligned with the Creator Operating System vision.
