-- Platform Hardening — full repair (schema + API exposure)
-- Safe to run multiple times. Run entire file in Supabase SQL Editor.
--
-- Creates missing tables/views/storage, reapplies RLS + grants, reloads PostgREST.
-- Use when support_tickets / creator_feedback do not exist OR API returns PGRST205.

-- =============================================================================
-- 0. Preflight — hard dependencies
-- =============================================================================

do $$
begin
  if not exists (
    select 1 from information_schema.tables
    where table_schema = 'auth' and table_name = 'users'
  ) then
    raise exception 'auth.users is required (Supabase Auth must be enabled)';
  end if;
end $$;

-- =============================================================================
-- 1. Tables — support_tickets
-- =============================================================================

create table if not exists public.support_tickets (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  subject text not null,
  category text not null check (
    category in (
      'bug_report',
      'feature_request',
      'billing',
      'account',
      'ai_generation',
      'other'
    )
  ),
  message text not null,
  screenshot_path text,
  status text not null default 'open' check (
    status in ('open', 'in_progress', 'resolved')
  ),
  priority text not null default 'normal' check (
    priority in ('low', 'normal', 'high')
  ),
  created_at timestamptz not null default now(),
  resolved_at timestamptz
);

create index if not exists support_tickets_user_id_idx
  on public.support_tickets (user_id);

create index if not exists support_tickets_status_idx
  on public.support_tickets (status);

create index if not exists support_tickets_category_idx
  on public.support_tickets (category);

-- =============================================================================
-- 2. Tables — creator_feedback
-- =============================================================================

create table if not exists public.creator_feedback (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  entity_type text not null check (
    entity_type in ('character', 'world', 'story', 'generation')
  ),
  entity_id uuid not null,
  feedback_type text not null default 'vision_rating' check (
    feedback_type in ('vision_rating', 'generation_quality', 'other')
  ),
  rating smallint check (rating >= 1 and rating <= 5),
  notes text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists creator_feedback_entity_idx
  on public.creator_feedback (entity_type, entity_id);

create index if not exists creator_feedback_user_id_idx
  on public.creator_feedback (user_id);

create index if not exists creator_feedback_type_idx
  on public.creator_feedback (feedback_type);

-- =============================================================================
-- 3. RLS + policies
-- =============================================================================

alter table public.support_tickets enable row level security;
alter table public.creator_feedback enable row level security;

drop policy if exists "Users read own support tickets" on public.support_tickets;
create policy "Users read own support tickets"
  on public.support_tickets for select
  using (auth.uid() = user_id);

drop policy if exists "Users insert own support tickets" on public.support_tickets;
create policy "Users insert own support tickets"
  on public.support_tickets for insert
  with check (auth.uid() = user_id);

drop policy if exists "Users read own creator feedback" on public.creator_feedback;
create policy "Users read own creator feedback"
  on public.creator_feedback for select
  using (auth.uid() = user_id);

drop policy if exists "Users insert own creator feedback" on public.creator_feedback;
create policy "Users insert own creator feedback"
  on public.creator_feedback for insert
  with check (auth.uid() = user_id);

-- =============================================================================
-- 4. Storage — support screenshot bucket
-- =============================================================================

insert into storage.buckets (id, name, public)
values ('support-attachments', 'support-attachments', false)
on conflict (id) do nothing;

drop policy if exists "Users upload own support attachments" on storage.objects;
create policy "Users upload own support attachments"
  on storage.objects for insert
  with check (
    bucket_id = 'support-attachments'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

drop policy if exists "Users read own support attachments" on storage.objects;
create policy "Users read own support attachments"
  on storage.objects for select
  using (
    bucket_id = 'support-attachments'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

-- =============================================================================
-- 5. Founder analytics views (requires core platform tables)
-- =============================================================================

do $$
declare
  deps_ok boolean;
begin
  select
    exists (
      select 1 from information_schema.tables
      where table_schema = 'public' and table_name = 'profiles'
    )
    and exists (
      select 1 from information_schema.tables
      where table_schema = 'public' and table_name = 'characters'
    )
    and exists (
      select 1 from information_schema.tables
      where table_schema = 'public' and table_name = 'worlds'
    )
    and exists (
      select 1 from information_schema.tables
      where table_schema = 'public' and table_name = 'stories'
    )
  into deps_ok;

  if not deps_ok then
    raise notice
      'Skipping v_founder_usage_counts — requires profiles, characters, worlds, stories';
  else
    execute $view$
      create or replace view public.v_founder_usage_counts as
      select
        (select count(*)::bigint from public.profiles) as profiles,
        (select count(*)::bigint from public.characters) as characters,
        (select count(*)::bigint from public.worlds) as worlds,
        (select count(*)::bigint from public.stories) as stories
    $view$;
  end if;

  -- These views only depend on hardening tables (always created above)
  execute $view$
    create or replace view public.v_founder_support_summary as
    select
      count(*) filter (where status = 'open')::bigint as open_tickets,
      count(*) filter (where status = 'in_progress')::bigint as in_progress_tickets,
      count(*) filter (where status = 'resolved')::bigint as resolved_tickets,
      count(*)::bigint as total_tickets
    from public.support_tickets
  $view$;

  execute $view$
    create or replace view public.v_founder_support_by_category as
    select
      category,
      count(*)::bigint as ticket_count
    from public.support_tickets
    group by category
    order by ticket_count desc
  $view$;

  execute $view$
    create or replace view public.v_founder_character_feedback_summary as
    select
      count(*)::bigint as response_count,
      round(avg(rating)::numeric, 2) as avg_rating,
      count(*) filter (where rating = 5)::bigint as five_star_count,
      count(*) filter (where rating <= 2)::bigint as low_rating_count
    from public.creator_feedback
    where entity_type = 'character'
      and feedback_type = 'vision_rating'
      and rating is not null
  $view$;
end $$;

-- =============================================================================
-- 6. API grants + PostgREST schema reload
-- =============================================================================

grant usage on schema public to anon, authenticated, service_role;

grant select, insert on table public.support_tickets to authenticated;
grant select, insert on table public.creator_feedback to authenticated;

grant select, insert, update, delete on table public.support_tickets to service_role;
grant select, insert, update, delete on table public.creator_feedback to service_role;

do $$
begin
  if exists (
    select 1 from information_schema.views
    where table_schema = 'public' and table_name = 'v_founder_usage_counts'
  ) then
    grant select on public.v_founder_usage_counts to service_role;
  end if;

  grant select on public.v_founder_support_summary to service_role;
  grant select on public.v_founder_support_by_category to service_role;
  grant select on public.v_founder_character_feedback_summary to service_role;
end $$;

notify pgrst, 'reload schema';

-- =============================================================================
-- 7. Verification (safe — does not reference missing relations)
-- =============================================================================

select
  t.table_name,
  case when t.table_name is not null then 'Ready' else 'Missing' end as table_status,
  coalesce(c.relrowsecurity, false) as rls_enabled,
  coalesce(p.policy_count, 0) as policy_count,
  case
    when t.table_name is null then 'Missing'
    when not coalesce(c.relrowsecurity, false) then 'Missing'
    when coalesce(p.policy_count, 0) < 2 then 'Missing'
    when not has_table_privilege('authenticated', 'public.' || t.table_name, 'SELECT') then 'Missing'
    when not has_table_privilege('authenticated', 'public.' || t.table_name, 'INSERT') then 'Missing'
    else 'Ready'
  end as api_status
from (
  values ('support_tickets'), ('creator_feedback')
) as expected(table_name)
left join information_schema.tables t
  on t.table_schema = 'public'
 and t.table_name = expected.table_name
left join pg_class c
  on c.relname = expected.table_name
 and c.relnamespace = 'public'::regnamespace
left join (
  select tablename, count(*)::int as policy_count
  from pg_policies
  where schemaname = 'public'
  group by tablename
) p on p.tablename = expected.table_name
order by expected.table_name;

select
  expected.name as view_name,
  case when v.viewname is not null then 'Ready' else 'Missing' end as view_status
from (
  values
    ('v_founder_usage_counts'),
    ('v_founder_support_summary'),
    ('v_founder_support_by_category'),
    ('v_founder_character_feedback_summary')
) as expected(name)
left join pg_views v
  on v.schemaname = 'public'
 and v.viewname = expected.name
order by expected.name;

select
  case
    when bool_and(table_status = 'Ready' and api_status = 'Ready')
    then 'ALL READY — restart dev server and retry support / feedback in app'
    else 'ISSUES FOUND — review table_status and api_status rows above'
  end as repair_result
from (
  select
    case when exists (
      select 1 from information_schema.tables
      where table_schema = 'public' and table_name = 'support_tickets'
    ) then 'Ready' else 'Missing' end as table_status,
    case
      when exists (
        select 1 from information_schema.tables
        where table_schema = 'public' and table_name = 'support_tickets'
      )
      and has_table_privilege('authenticated', 'public.support_tickets', 'SELECT')
      and has_table_privilege('authenticated', 'public.support_tickets', 'INSERT')
      then 'Ready' else 'Missing'
    end as api_status
  union all
  select
    case when exists (
      select 1 from information_schema.tables
      where table_schema = 'public' and table_name = 'creator_feedback'
    ) then 'Ready' else 'Missing' end,
    case
      when exists (
        select 1 from information_schema.tables
        where table_schema = 'public' and table_name = 'creator_feedback'
      )
      and has_table_privilege('authenticated', 'public.creator_feedback', 'SELECT')
      and has_table_privilege('authenticated', 'public.creator_feedback', 'INSERT')
      then 'Ready' else 'Missing'
    end
) checks;
