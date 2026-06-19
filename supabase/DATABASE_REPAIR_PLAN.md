# Database Repair Plan

Audit based on your reported table list vs. migrations in `supabase/migrations/`.

**Method:** Table presence is used to infer which migrations ran. Supabase SQL Editor runs do not write to `supabase_migrations` unless you use the CLI — treat this as a **logical** audit, not CLI migration history.

---

## Current state summary

### Confirmed present (migrations applied through character slot assignments)

| Table | Source migration |
|-------|------------------|
| `profiles` | `20250616000000_portfolio_profiles.sql` |
| `characters` | base schema + `20250615000000_expand_character_fields.sql` |
| `character_images` | `20250617000000_character_images.sql` |
| `character_bible` | `20250623000000_character_bible.sql` |
| `character_image_slot_assignments` | `20250626000000_character_image_slot_assignments.sql` |
| `worlds` | `20250618000000_worlds.sql` |
| `stories` | `20250619000000_stories.sql` |
| `story_characters` | `20250619000000_stories.sql` |
| `story_images` | `20250622000000_story_images.sql` |
| `chapters` | `20250620000000_chapters.sql` |

Also likely applied (column-only / no separate table):

- `20250621000000_story_project_type.sql` — `stories.project_type`
- `20250624000000_privacy_defaults_private.sql` — default `is_public` on profiles/characters/worlds

### Confirmed missing (migrations not applied)

| Table | Source migration |
|-------|------------------|
| `support_tickets` | `20250625000000_platform_hardening.sql` |
| `creator_feedback` | `20250625000000_platform_hardening.sql` |
| `world_bible` | `20250627000000_world_bible.sql` |
| `world_images` | `20250627000000_world_bible.sql` |
| `world_image_slot_assignments` | `20250627000000_world_bible.sql` |
| `moderation_queue` | `20250630000000_moderation_queue.sql` |
| `story_bible` | `20250631000000_story_bible.sql` |
| `story_image_slot_assignments` | `20250631000000_story_bible.sql` |

### Unknown / verify manually

| Item | Migration | How to check |
|------|-----------|--------------|
| `profiles.role` | `20250629000000_founder_admin_role.sql` | `select column_name from information_schema.columns where table_name = 'profiles' and column_name = 'role';` |
| `profiles.is_suspended` | `20250630000000_moderation_queue.sql` | Same pattern for `is_suspended` |
| Founder analytics views | `20250625000000`, `20250629000000`, `20250630000000` | `select viewname from pg_views where schemaname = 'public' and viewname like 'v_founder_%';` |

If `profiles.role` is missing, `20250629000000_founder_admin_role.sql` was not applied (or failed). That migration **requires** `support_tickets` and `creator_feedback` for `v_founder_platform_overview` — do not run it until platform hardening is complete.

---

## 1. Missing migrations

Run these in order (skip any whose tables already exist after healthcheck):

| Order | Migration file | Status (inferred) |
|-------|----------------|-------------------|
| — | `20250615000000_expand_character_fields.sql` | Applied |
| — | `20250616000000_portfolio_profiles.sql` | Applied |
| — | `20250617000000_character_images.sql` | Applied |
| — | `20250618000000_worlds.sql` | Applied |
| — | `20250619000000_stories.sql` | Applied |
| — | `20250620000000_chapters.sql` | Applied |
| — | `20250621000000_story_project_type.sql` | Likely applied |
| — | `20250622000000_story_images.sql` | Applied |
| — | `20250623000000_character_bible.sql` | Applied |
| — | `20250624000000_privacy_defaults_private.sql` | Likely applied |
| — | `20250626000000_character_image_slot_assignments.sql` | Applied |
| **1** | `20250625000000_platform_hardening.sql` | **Missing** |
| **2** | `20250627000000_world_bible.sql` | **Missing** |
| **3** | `20250628000000_world_slot_roles_v2.sql` | **Missing** (requires world bible) |
| **4** | `20250630000000_moderation_queue.sql` | **Missing** |
| **5** | `20250629000000_founder_admin_role.sql` | **Missing / blocked** (needs step 1) |
| **6** | `20250631000000_story_bible.sql` | **Missing** |

**Alternative for step 1:** `PLATFORM_HARDENING_REPAIR.sql` (idempotent; creates tables + grants + views if deps exist).

---

## 2. Missing tables

Required by current codebase but absent from your audit:

| Table | Feature impact |
|-------|----------------|
| `support_tickets` | Help / support form, founder dashboard support section |
| `creator_feedback` | Character vision feedback, founder feedback metrics |
| `world_bible` | World workspace canon metadata |
| `world_images` | World reference gallery |
| `world_image_slot_assignments` | World asset role assignment |
| `moderation_queue` | Safety scans, admin moderation queue |
| `story_bible` | Story workspace canon metadata |
| `story_image_slot_assignments` | Story asset role assignment |

---

## 3. Missing views

All founder views are missing if their source migrations never ran:

### From `20250625000000_platform_hardening.sql`

- `v_founder_usage_counts`
- `v_founder_support_summary`
- `v_founder_support_by_category`
- `v_founder_character_feedback_summary`

### From `20250629000000_founder_admin_role.sql`

- `v_founder_platform_overview`
- `v_founder_creator_activity`
- `v_founder_content_metrics`
- `v_founder_asset_counts`

### From `20250630000000_moderation_queue.sql`

- `v_founder_moderation_summary`

---

## 4. Missing storage buckets / policies

| Bucket | Created by | Purpose |
|--------|------------|---------|
| `character-photos` | Manual / `schema.sql` (not in numbered migrations) | Character, world, story image uploads — **likely exists** if uploads work |
| `support-attachments` | `20250625000000_platform_hardening.sql` | Support ticket screenshots — **missing** |

Storage policies added by migrations (re-applied when you run the migration):

- `support-attachments` — upload/read own folder (`20250625000000`)
- `character-photos` — public world gallery read (`20250627000000_world_bible.sql`)

Verify bucket:

```sql
select id, name, public from storage.buckets order by id;
```

---

## 5. Safe execution order

Run each migration file **in full** in the Supabase SQL Editor, then its matching **fix-*-api.sql** grant file. After each step, run **`supabase/DATABASE_HEALTHCHECK.sql`** (single statement — paste and run the whole file).

**Reading the healthcheck result:**

| `result_kind` | `table_name` | Expected |
|---------------|--------------|----------|
| `table` | each codebase table | `status` = `Ready` or `Missing` |
| `summary` | `__OVERALL__` | `status` starts with `ALL READY` when repair is complete |

```
Already done (do not rerun unless healthcheck fails):
  ✓ 20250615000000 → 20250626000000  (core + character bible)

Step 1 — Platform hardening
  → supabase/migrations/20250625000000_platform_hardening.sql
     OR supabase/PLATFORM_HARDENING_REPAIR.sql  (preferred: idempotent)
  → supabase/fix-platform-hardening-api.sql

Step 2 — World bible
  → supabase/migrations/20250627000000_world_bible.sql
  → supabase/fix-world-bible-api.sql

Step 3 — World slot roles v2
  → supabase/migrations/20250628000000_world_slot_roles_v2.sql

Step 4 — Moderation
  → supabase/migrations/20250630000000_moderation_queue.sql
  → supabase/fix-moderation-api.sql

Step 5 — Founder admin (after step 1 — views reference support_tickets / creator_feedback)
  → supabase/migrations/20250629000000_founder_admin_role.sql
  → supabase/fix-founder-admin-api.sql

Step 6 — Story bible
  → supabase/migrations/20250631000000_story_bible.sql
  → supabase/fix-story-bible-api.sql

Optional — Re-confirm character bible API grants (if character workspace errors):
  → supabase/fix-character-bible-api.sql

Final:
  → supabase/DATABASE_HEALTHCHECK.sql  (7 table rows Ready + __OVERALL__ ALL READY)
  → Restart Next.js dev server
```

### Dependency notes

- **Do not run** `20250629000000_founder_admin_role.sql` before `20250625000000` — `v_founder_platform_overview` selects from `support_tickets` and `creator_feedback`.
- **Do not run** `20250628000000_world_slot_roles_v2.sql` before `20250627000000_world_bible.sql` — it alters `world_image_slot_assignments`.
- Migrations use `IF NOT EXISTS` / `DROP POLICY IF EXISTS` — safe to rerun individual files if a step failed partway.
- If a script fails mid-file inside a transaction, earlier statements in that transaction roll back — rerun the whole file.

### Promote founder admin (after step 5)

```sql
UPDATE public.profiles SET role = 'admin' WHERE username = 'yourusername';
```

---

## Quick verification

```sql
-- All codebase-critical tables
select table_name
from information_schema.tables
where table_schema = 'public'
  and table_name in (
    'character_bible',
    'character_image_slot_assignments',
    'support_tickets',
    'creator_feedback',
    'world_bible',
    'world_images',
    'world_image_slot_assignments',
    'story_bible',
    'story_image_slot_assignments',
    'moderation_queue'
  )
order by table_name;
-- Expected after full repair: 10 rows

-- Run full healthcheck (single script — do not split on semicolons)
-- supabase/DATABASE_HEALTHCHECK.sql
-- Expect: result_kind = 'table' rows with status Ready, then result_kind = 'summary' / __OVERALL__ / ALL READY
```
