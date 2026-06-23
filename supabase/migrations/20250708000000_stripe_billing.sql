-- Stripe billing foundation: customers, subscriptions, webhook idempotency

-- ---------------------------------------------------------------------------
-- Stripe customers (one Stripe customer per CharID user)
-- ---------------------------------------------------------------------------

create table if not exists public.stripe_customers (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  stripe_customer_id text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint stripe_customers_user_id_key unique (user_id),
  constraint stripe_customers_stripe_customer_id_key unique (stripe_customer_id)
);

create index if not exists stripe_customers_user_id_idx
  on public.stripe_customers (user_id);

alter table public.stripe_customers enable row level security;

drop policy if exists "Users read own stripe customer" on public.stripe_customers;
create policy "Users read own stripe customer"
  on public.stripe_customers for select
  using (auth.uid() = user_id);

drop policy if exists "Users insert own stripe customer" on public.stripe_customers;
create policy "Users insert own stripe customer"
  on public.stripe_customers for insert
  with check (auth.uid() = user_id);

-- ---------------------------------------------------------------------------
-- Subscriptions (source of truth for plan entitlements — no credits yet)
-- ---------------------------------------------------------------------------

create table if not exists public.subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  stripe_customer_id text not null,
  stripe_subscription_id text not null,
  stripe_price_id text not null,
  plan text not null default 'free' check (plan in ('free', 'basic', 'pro')),
  status text not null,
  cancel_at_period_end boolean not null default false,
  current_period_start timestamptz,
  current_period_end timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint subscriptions_user_id_key unique (user_id),
  constraint subscriptions_stripe_subscription_id_key unique (stripe_subscription_id)
);

create index if not exists subscriptions_user_id_idx
  on public.subscriptions (user_id);

create index if not exists subscriptions_status_idx
  on public.subscriptions (status);

alter table public.subscriptions enable row level security;

drop policy if exists "Users read own subscription" on public.subscriptions;
create policy "Users read own subscription"
  on public.subscriptions for select
  using (auth.uid() = user_id);

-- ---------------------------------------------------------------------------
-- Billing events (idempotent Stripe webhook processing)
-- ---------------------------------------------------------------------------

create table if not exists public.billing_events (
  id uuid primary key default gen_random_uuid(),
  stripe_event_id text not null,
  event_type text not null,
  payload jsonb not null default '{}'::jsonb,
  processed_at timestamptz not null default now(),
  constraint billing_events_stripe_event_id_key unique (stripe_event_id)
);

create index if not exists billing_events_event_type_idx
  on public.billing_events (event_type);

alter table public.billing_events enable row level security;

-- Webhook writes use service_role only — no user policies

comment on table public.stripe_customers is
  'Maps CharID users to Stripe Customer IDs for checkout and portal.';

comment on table public.subscriptions is
  'Synced from Stripe webhooks — plan and status for billing UI (no feature gates yet).';

comment on table public.billing_events is
  'Processed Stripe webhook events for idempotency and audit.';

notify pgrst, 'reload schema';
