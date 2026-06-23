-- Monthly credit allocation idempotency — one grant per user per billing period

create table if not exists public.credit_allocations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  plan text not null check (plan in ('basic', 'pro')),
  billing_period_start timestamptz not null,
  billing_period_end timestamptz,
  credits_granted integer not null check (credits_granted > 0),
  created_at timestamptz not null default now(),
  constraint credit_allocations_user_period_key unique (user_id, billing_period_start)
);

create index if not exists credit_allocations_user_id_idx
  on public.credit_allocations (user_id);

create index if not exists credit_allocations_period_start_idx
  on public.credit_allocations (billing_period_start desc);

alter table public.credit_allocations enable row level security;

drop policy if exists "Users read own credit allocations" on public.credit_allocations;
create policy "Users read own credit allocations"
  on public.credit_allocations for select
  using (auth.uid() = user_id);

comment on table public.credit_allocations is
  'Idempotency ledger for monthly subscription credit grants — unique (user_id, billing_period_start).';

notify pgrst, 'reload schema';
