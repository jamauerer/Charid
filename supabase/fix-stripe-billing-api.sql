-- Expose Stripe billing tables to the Supabase Data API
-- Run in Supabase SQL Editor after 20250708000000_stripe_billing.sql

grant usage on schema public to anon, authenticated, service_role;

grant select, insert on table public.stripe_customers to authenticated;
grant select on table public.subscriptions to authenticated;

grant select, insert, update, delete on table public.stripe_customers to service_role;
grant select, insert, update, delete on table public.subscriptions to service_role;
grant select, insert, update, delete on table public.billing_events to service_role;

notify pgrst, 'reload schema';
