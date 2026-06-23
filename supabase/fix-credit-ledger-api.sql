-- Expose credit ledger tables to the Supabase Data API
-- Run in Supabase SQL Editor after 20250709000000_credit_ledger.sql

grant usage on schema public to anon, authenticated, service_role;

grant select on table public.credit_accounts to authenticated;
grant select on table public.credit_ledger to authenticated;

grant select, insert, update, delete on table public.credit_accounts to service_role;
grant select, insert, update, delete on table public.credit_ledger to service_role;

notify pgrst, 'reload schema';
