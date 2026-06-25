-- Run in Supabase SQL Editor after Phase 2 migration if new columns are not exposed

-- Phase 1 tables (idempotent)
grant select, insert, update, delete on public.production_surfaces to authenticated;
grant select, insert, update, delete on public.canvas_document_versions to authenticated;
grant select, insert, update, delete on public.production_surfaces to service_role;
grant select, insert, update, delete on public.canvas_document_versions to service_role;

notify pgrst, 'reload schema';
