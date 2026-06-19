-- Run in Supabase SQL Editor after 20250706000000_creative_proposal_staging.sql

grant select, insert, update, delete on public.creative_proposal_batches to authenticated;
grant select, insert, update, delete on public.creative_proposal_batches to service_role;

notify pgrst, 'reload schema';
