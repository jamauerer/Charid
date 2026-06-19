-- Safety & Moderation V1: queue, risk scores, account suspension flag

-- ---------------------------------------------------------------------------
-- Account suspension (admin action from moderation)
-- ---------------------------------------------------------------------------

alter table public.profiles
  add column if not exists is_suspended boolean not null default false;

alter table public.profiles
  add column if not exists suspended_at timestamptz;

-- ---------------------------------------------------------------------------
-- Moderation queue — flagged content awaiting human review
-- ---------------------------------------------------------------------------

create table if not exists public.moderation_queue (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  content_type text not null check (content_type in ('image', 'text')),
  entity_type text not null,
  entity_id uuid,
  field_name text,
  storage_bucket text,
  storage_path text,
  content_preview text,
  status text not null default 'pending' check (
    status in ('pending', 'approved', 'removed', 'escalated')
  ),
  risk_score numeric(5, 4) not null default 0 check (
    risk_score >= 0 and risk_score <= 1
  ),
  risk_categories text[] not null default '{}'::text[],
  scanner_result jsonb not null default '{}'::jsonb,
  reviewer_id uuid references auth.users(id),
  reviewer_note text,
  reviewed_at timestamptz,
  created_at timestamptz not null default now()
);

create index if not exists moderation_queue_status_idx
  on public.moderation_queue (status, created_at desc);

create index if not exists moderation_queue_user_id_idx
  on public.moderation_queue (user_id);

create index if not exists moderation_queue_entity_idx
  on public.moderation_queue (entity_type, entity_id);

alter table public.moderation_queue enable row level security;

-- Creators never read the queue; server actions insert flagged items on their behalf.
drop policy if exists "Users insert own moderation queue items" on public.moderation_queue;
create policy "Users insert own moderation queue items"
  on public.moderation_queue for insert
  with check (auth.uid() = user_id);

-- ---------------------------------------------------------------------------
-- Founder summary view
-- ---------------------------------------------------------------------------

create or replace view public.v_founder_moderation_summary as
select
  count(*) filter (where status = 'pending') as pending_count,
  count(*) filter (where status = 'escalated') as escalated_count,
  count(*) filter (where content_type = 'image' and status = 'pending') as pending_images,
  count(*) filter (where content_type = 'text' and status = 'pending') as pending_text,
  count(*) filter (where created_at >= now() - interval '7 days') as flagged_7d
from public.moderation_queue;
