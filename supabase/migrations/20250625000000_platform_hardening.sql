-- Phase 1 Platform Hardening: support, creator feedback, founder analytics views

-- ---------------------------------------------------------------------------
-- Support tickets
-- ---------------------------------------------------------------------------

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

alter table public.support_tickets enable row level security;

drop policy if exists "Users read own support tickets" on public.support_tickets;
create policy "Users read own support tickets"
  on public.support_tickets for select
  using (auth.uid() = user_id);

drop policy if exists "Users insert own support tickets" on public.support_tickets;
create policy "Users insert own support tickets"
  on public.support_tickets for insert
  with check (auth.uid() = user_id);

-- ---------------------------------------------------------------------------
-- Creator feedback (character, world, story, generation — future-ready)
-- ---------------------------------------------------------------------------

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

alter table public.creator_feedback enable row level security;

drop policy if exists "Users read own creator feedback" on public.creator_feedback;
create policy "Users read own creator feedback"
  on public.creator_feedback for select
  using (auth.uid() = user_id);

drop policy if exists "Users insert own creator feedback" on public.creator_feedback;
create policy "Users insert own creator feedback"
  on public.creator_feedback for insert
  with check (auth.uid() = user_id);

-- ---------------------------------------------------------------------------
-- Support screenshot storage bucket (private)
-- ---------------------------------------------------------------------------

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

-- ---------------------------------------------------------------------------
-- Founder analytics views (query with service_role / admin tooling)
-- ---------------------------------------------------------------------------

create or replace view public.v_founder_usage_counts as
select
  (select count(*)::bigint from public.profiles) as profiles,
  (select count(*)::bigint from public.characters) as characters,
  (select count(*)::bigint from public.worlds) as worlds,
  (select count(*)::bigint from public.stories) as stories;

create or replace view public.v_founder_support_summary as
select
  count(*) filter (where status = 'open')::bigint as open_tickets,
  count(*) filter (where status = 'in_progress')::bigint as in_progress_tickets,
  count(*) filter (where status = 'resolved')::bigint as resolved_tickets,
  count(*)::bigint as total_tickets
from public.support_tickets;

create or replace view public.v_founder_support_by_category as
select
  category,
  count(*)::bigint as ticket_count
from public.support_tickets
group by category
order by ticket_count desc;

create or replace view public.v_founder_character_feedback_summary as
select
  count(*)::bigint as response_count,
  round(avg(rating)::numeric, 2) as avg_rating,
  count(*) filter (where rating = 5)::bigint as five_star_count,
  count(*) filter (where rating <= 2)::bigint as low_rating_count
from public.creator_feedback
where entity_type = 'character'
  and feedback_type = 'vision_rating'
  and rating is not null;
