-- Expose moderation tables to the Supabase Data API
-- Run in Supabase SQL Editor after 20250630000000_moderation_queue.sql

grant insert on public.moderation_queue to authenticated;
grant select, insert, update, delete on public.moderation_queue to service_role;
grant select on public.v_founder_moderation_summary to service_role;
grant update (is_suspended, suspended_at) on public.profiles to service_role;

notify pgrst, 'reload schema';
