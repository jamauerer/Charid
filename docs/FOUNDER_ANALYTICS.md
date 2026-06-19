# Founder Analytics Foundations

Phase 1 stores platform hardening data correctly so a founder admin dashboard can query it later without schema redesign.

## Data sources

| Domain | Table / view | Access |
|--------|----------------|--------|
| Usage counts | `v_founder_usage_counts` | service_role |
| Support summary | `v_founder_support_summary`, `v_founder_support_by_category` | service_role |
| Character vision ratings | `creator_feedback` + `v_founder_character_feedback_summary` | service_role |
| Raw tickets | `support_tickets` | service_role (admin); users see own rows via RLS |

## Usage metrics

`v_founder_usage_counts` aggregates:

- Profiles (proxy for registered users with a profile row)
- Characters
- Worlds
- Stories

Query example (Supabase SQL Editor with service role or future `/admin`):

```sql
select * from public.v_founder_usage_counts;
```

## Content metrics (bible completion)

Bible completion, identity strength, and AI readiness are **computed at runtime** from character bible assemblers (`computeCharacterBibleScores`). They are not persisted yet.

**Phase 2 option:** nightly job writing to `founder_metric_snapshots` or materialized aggregates.

Until then, founder tooling should call existing server-side bundle/score functions for content quality metrics.

## Feedback metrics

### Character consistency satisfaction

`creator_feedback` with:

- `entity_type = 'character'`
- `feedback_type = 'vision_rating'`
- `rating` 1–5
- optional `notes`

Summary view:

```sql
select * from public.v_founder_character_feedback_summary;
```

### Future: world / story / generation

Same table, different `entity_type`:

| entity_type | feedback_type | metadata (future) |
|-------------|---------------|-------------------|
| `world` | `vision_rating` | — |
| `story` | `vision_rating` | — |
| `generation` | `generation_quality` | `{ "thumb": "up" \| "down", "reasons": ["face_changed", ...] }` |

## Support metrics

```sql
select * from public.v_founder_support_summary;
select * from public.v_founder_support_by_category;
```

Track open vs resolved volume and category distribution for product prioritization.

## Continuity intent index (future)

Derived metric combining:

1. Average character vision rating (`creator_feedback`)
2. Average AI readiness score (computed)
3. Generation thumbs-up rate (future)

Goal: measure whether CharID preserves creator intent end-to-end.

## Admin dashboard (not built in Phase 1)

Recommended sections when `/admin` ships:

1. **Usage** — cards from `v_founder_usage_counts`
2. **Support** — open/resolved + category chart
3. **Canon quality** — avg character rating + sample notes
4. **Content** — bible completion histogram (app-computed)
5. **Continuity** — placeholder until generation feedback exists

## Migrations

Run in order:

1. `supabase/migrations/20250625000000_platform_hardening.sql`
2. `supabase/fix-platform-hardening-api.sql`

Views are granted to `service_role` only — not exposed to authenticated users via PostgREST in production admin queries.
