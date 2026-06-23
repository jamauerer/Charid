-- Credit ledger foundation — accounts + append-only ledger (no auto-allocation yet)

-- ---------------------------------------------------------------------------
-- Credit accounts (one balance row per user)
-- ---------------------------------------------------------------------------

create table if not exists public.credit_accounts (
  user_id uuid primary key references auth.users(id) on delete cascade,
  current_balance integer not null default 0 check (current_balance >= 0),
  lifetime_granted integer not null default 0 check (lifetime_granted >= 0),
  lifetime_used integer not null default 0 check (lifetime_used >= 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists credit_accounts_user_id_idx
  on public.credit_accounts (user_id);

alter table public.credit_accounts enable row level security;

drop policy if exists "Users read own credit account" on public.credit_accounts;
create policy "Users read own credit account"
  on public.credit_accounts for select
  using (auth.uid() = user_id);

-- Inserts/updates via service_role (grantCredits, future allocation jobs)

-- ---------------------------------------------------------------------------
-- Credit ledger (append-only audit trail)
-- ---------------------------------------------------------------------------

create table if not exists public.credit_ledger (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  delta integer not null check (delta <> 0),
  reason text not null check (
    reason in (
      'monthly_allocation',
      'manual_adjustment',
      'ai_usage',
      'founder_grant'
    )
  ),
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists credit_ledger_user_id_created_idx
  on public.credit_ledger (user_id, created_at desc);

create index if not exists credit_ledger_reason_idx
  on public.credit_ledger (reason);

alter table public.credit_ledger enable row level security;

drop policy if exists "Users read own credit ledger" on public.credit_ledger;
create policy "Users read own credit ledger"
  on public.credit_ledger for select
  using (auth.uid() = user_id);

comment on table public.credit_accounts is
  'Running credit balance per user. Founder/admin bypass is application-level (unlimited).';

comment on table public.credit_ledger is
  'Append-only credit mutations — monthly_allocation, manual_adjustment, ai_usage, founder_grant.';

notify pgrst, 'reload schema';
