-- Expose platform hardening tables to the Supabase Data API
-- Run in Supabase SQL Editor after 20250625000000_platform_hardening.sql
--
-- If issues persist, run PLATFORM_HARDENING_REPAIR.sql (full repair + verification).

grant usage on schema public to anon, authenticated, service_role;

grant select, insert on table public.support_tickets to authenticated;
grant select, insert on table public.creator_feedback to authenticated;

grant select, insert, update, delete on table public.support_tickets to service_role;
grant select, insert, update, delete on table public.creator_feedback to service_role;

grant select on public.v_founder_usage_counts to service_role;
grant select on public.v_founder_support_summary to service_role;
grant select on public.v_founder_support_by_category to service_role;
grant select on public.v_founder_character_feedback_summary to service_role;

notify pgrst, 'reload schema';
