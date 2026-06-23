-- Expose credit_allocations to the Supabase Data API
-- Run in Supabase SQL Editor after 20250710000000_credit_allocations.sql

grant select on table public.credit_allocations to authenticated;
grant select, insert, update, delete on table public.credit_allocations to service_role;

notify pgrst, 'reload schema';
