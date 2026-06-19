-- Database healthcheck — codebase-critical tables
-- Run as ONE script in Supabase SQL Editor (single statement; no CTE scope leaks).
--
-- Result set:
--   result_kind = 'table'   → one row per table with status Ready / Missing
--   result_kind = 'summary' → one overall row (__OVERALL__)

WITH expected (table_name, migration_file) AS (
  VALUES
    ('character_bible',                    '20250623000000_character_bible.sql'),
    ('character_image_slot_assignments',   '20250626000000_character_image_slot_assignments.sql'),
    ('support_tickets',                    '20250625000000_platform_hardening.sql'),
    ('creator_feedback',                   '20250625000000_platform_hardening.sql'),
    ('world_bible',                        '20250627000000_world_bible.sql'),
    ('story_bible',                        '20250631000000_story_bible.sql'),
    ('moderation_queue',                   '20250630000000_moderation_queue.sql')
),

table_check AS (
  SELECT
    e.table_name,
    e.migration_file,
    EXISTS (
      SELECT 1
      FROM information_schema.tables t
      WHERE t.table_schema = 'public'
        AND t.table_name = e.table_name
    ) AS table_exists,
    COALESCE(c.relrowsecurity, false) AS rls_enabled,
    COALESCE(p.policy_count, 0) AS policy_count
  FROM expected e
  LEFT JOIN pg_class c
    ON c.relname = e.table_name
   AND c.relnamespace = 'public'::regnamespace
   AND c.relkind = 'r'
  LEFT JOIN (
    SELECT tablename, COUNT(*)::int AS policy_count
    FROM pg_policies
    WHERE schemaname = 'public'
    GROUP BY tablename
  ) p ON p.tablename = e.table_name
),

detail AS (
  SELECT
    table_name,
    migration_file,
    CASE WHEN table_exists THEN 'Ready' ELSE 'Missing' END AS status,
    CASE WHEN table_exists THEN rls_enabled ELSE NULL END AS rls_enabled,
    CASE WHEN table_exists THEN policy_count ELSE NULL END AS policy_count,
    CASE
      WHEN NOT table_exists THEN 'Run migration: ' || migration_file
      WHEN NOT rls_enabled THEN 'RLS disabled — re-run migration for this table'
      WHEN policy_count = 0 THEN 'No RLS policies — re-run migration for this table'
      ELSE NULL
    END AS remediation
  FROM table_check
),

summary AS (
  SELECT COUNT(*) FILTER (WHERE status = 'Missing') AS missing_count
  FROM detail
)

SELECT
  result_kind,
  table_name,
  migration_file,
  status,
  rls_enabled,
  policy_count,
  remediation
FROM (
  SELECT
    0 AS sort_order,
    CASE
      WHEN d.status = 'Missing' THEN 0
      WHEN d.status = 'Ready' THEN 1
      ELSE 2
    END AS status_sort,
    'table'::text AS result_kind,
    d.table_name,
    d.migration_file,
    d.status,
    d.rls_enabled,
    d.policy_count,
    d.remediation
  FROM detail d

  UNION ALL

  SELECT
    1 AS sort_order,
    0 AS status_sort,
    'summary'::text AS result_kind,
    '__OVERALL__'::text AS table_name,
    NULL::text AS migration_file,
    CASE
      WHEN s.missing_count = 0
      THEN 'ALL READY — database matches codebase requirements for checked tables'
      ELSE
        s.missing_count::text
        || ' table(s) Missing — follow remediation rows above and DATABASE_REPAIR_PLAN.md'
    END AS status,
    NULL::boolean AS rls_enabled,
    NULL::int AS policy_count,
    NULL::text AS remediation
  FROM summary s
) results
ORDER BY sort_order, status_sort, table_name;
