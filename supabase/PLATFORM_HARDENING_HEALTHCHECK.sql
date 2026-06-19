-- Platform Hardening healthcheck
-- Run in Supabase SQL Editor after migrations + fix-platform-hardening-api.sql
-- Returns Ready / Missing for tables, RLS, policies, API grants, and founder views.

with checks as (
  -- Tables
  select
    'table:support_tickets' as component,
    exists (
      select 1
      from information_schema.tables
      where table_schema = 'public'
        and table_name = 'support_tickets'
    ) as object_exists
  union all
  select
    'table:creator_feedback',
    exists (
      select 1
      from information_schema.tables
      where table_schema = 'public'
        and table_name = 'creator_feedback'
    )
  union all

  -- RLS enabled
  select
    'rls:support_tickets',
    coalesce(
      (
        select c.relrowsecurity
        from pg_class c
        join pg_namespace n on n.oid = c.relnamespace
        where n.nspname = 'public'
          and c.relname = 'support_tickets'
          and c.relkind = 'r'
      ),
      false
    )
  union all
  select
    'rls:creator_feedback',
    coalesce(
      (
        select c.relrowsecurity
        from pg_class c
        join pg_namespace n on n.oid = c.relnamespace
        where n.nspname = 'public'
          and c.relname = 'creator_feedback'
          and c.relkind = 'r'
      ),
      false
    )
  union all

  -- RLS policies (minimum required for creator flows)
  select
    'policy:support_tickets_select',
    exists (
      select 1 from pg_policies
      where schemaname = 'public'
        and tablename = 'support_tickets'
        and policyname = 'Users read own support tickets'
    )
  union all
  select
    'policy:support_tickets_insert',
    exists (
      select 1 from pg_policies
      where schemaname = 'public'
        and tablename = 'support_tickets'
        and policyname = 'Users insert own support tickets'
    )
  union all
  select
    'policy:creator_feedback_select',
    exists (
      select 1 from pg_policies
      where schemaname = 'public'
        and tablename = 'creator_feedback'
        and policyname = 'Users read own creator feedback'
    )
  union all
  select
    'policy:creator_feedback_insert',
    exists (
      select 1 from pg_policies
      where schemaname = 'public'
        and tablename = 'creator_feedback'
        and policyname = 'Users insert own creator feedback'
    )
  union all

  -- PostgREST grants — authenticated (creator UI)
  select
    'grant:authenticated_support_tickets_select',
    exists (
      select 1
      from information_schema.role_table_grants
      where table_schema = 'public'
        and table_name = 'support_tickets'
        and grantee = 'authenticated'
        and privilege_type = 'SELECT'
    )
  union all
  select
    'grant:authenticated_support_tickets_insert',
    exists (
      select 1
      from information_schema.role_table_grants
      where table_schema = 'public'
        and table_name = 'support_tickets'
        and grantee = 'authenticated'
        and privilege_type = 'INSERT'
    )
  union all
  select
    'grant:authenticated_creator_feedback_select',
    exists (
      select 1
      from information_schema.role_table_grants
      where table_schema = 'public'
        and table_name = 'creator_feedback'
        and grantee = 'authenticated'
        and privilege_type = 'SELECT'
    )
  union all
  select
    'grant:authenticated_creator_feedback_insert',
    exists (
      select 1
      from information_schema.role_table_grants
      where table_schema = 'public'
        and table_name = 'creator_feedback'
        and grantee = 'authenticated'
        and privilege_type = 'INSERT'
    )
  union all

  -- Storage bucket for support screenshots
  select
    'storage:support-attachments_bucket',
    exists (
      select 1 from storage.buckets where id = 'support-attachments'
    )
  union all

  -- Founder analytics views (platform hardening migration)
  select
    'view:v_founder_usage_counts',
    exists (
      select 1
      from information_schema.views
      where table_schema = 'public'
        and table_name = 'v_founder_usage_counts'
    )
  union all
  select
    'view:v_founder_support_summary',
    exists (
      select 1
      from information_schema.views
      where table_schema = 'public'
        and table_name = 'v_founder_support_summary'
    )
  union all
  select
    'view:v_founder_support_by_category',
    exists (
      select 1
      from information_schema.views
      where table_schema = 'public'
        and table_name = 'v_founder_support_by_category'
    )
  union all
  select
    'view:v_founder_character_feedback_summary',
    exists (
      select 1
      from information_schema.views
      where table_schema = 'public'
        and table_name = 'v_founder_character_feedback_summary'
    )
  union all

  -- Founder analytics views (founder admin migration — depends on hardening tables)
  select
    'view:v_founder_platform_overview',
    exists (
      select 1
      from information_schema.views
      where table_schema = 'public'
        and table_name = 'v_founder_platform_overview'
    )
  union all
  select
    'view:v_founder_creator_activity',
    exists (
      select 1
      from information_schema.views
      where table_schema = 'public'
        and table_name = 'v_founder_creator_activity'
    )
  union all
  select
    'view:v_founder_content_metrics',
    exists (
      select 1
      from information_schema.views
      where table_schema = 'public'
        and table_name = 'v_founder_content_metrics'
    )
  union all
  select
    'view:v_founder_asset_counts',
    exists (
      select 1
      from information_schema.views
      where table_schema = 'public'
        and table_name = 'v_founder_asset_counts'
    )
  union all

  -- service_role grants on founder views (PostgREST / admin client)
  select
    'grant:service_role_v_founder_support_summary',
    exists (
      select 1
      from information_schema.role_table_grants
      where table_schema = 'public'
        and table_name = 'v_founder_support_summary'
        and grantee = 'service_role'
        and privilege_type = 'SELECT'
    )
  union all
  select
    'grant:service_role_v_founder_platform_overview',
    exists (
      select 1
      from information_schema.role_table_grants
      where table_schema = 'public'
        and table_name = 'v_founder_platform_overview'
        and grantee = 'service_role'
        and privilege_type = 'SELECT'
    )
)

select
  component,
  case when object_exists then 'Ready' else 'Missing' end as status,
  case
    when component like 'grant:%' and not object_exists then
      'Run supabase/fix-platform-hardening-api.sql (and fix-founder-admin-api.sql for founder admin views)'
    when component like 'table:%' and not object_exists then
      'Run supabase/migrations/20250625000000_platform_hardening.sql'
    when component like 'view:v_founder_platform%' and not object_exists then
      'Run supabase/migrations/20250629000000_founder_admin_role.sql'
    when component like 'view:%' and not object_exists then
      'Run supabase/migrations/20250625000000_platform_hardening.sql'
    when component like 'policy:%' and not object_exists then
      'Re-run platform hardening migration (RLS policies missing)'
    when component like 'rls:%' and not object_exists then
      'Re-run platform hardening migration (RLS not enabled)'
    when component like 'storage:%' and not object_exists then
      'Re-run platform hardening migration (storage bucket missing)'
    else null
  end as remediation
from checks
order by
  case when object_exists then 1 else 0 end,
  component;

-- Summary row (all must be Ready for platform hardening to work in the app)
select
  case
    when bool_and(object_exists) then 'ALL READY'
    else 'ISSUES FOUND — see rows with status Missing above'
  end as overall_status
from checks;
