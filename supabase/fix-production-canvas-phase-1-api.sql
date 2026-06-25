-- Run in Supabase SQL Editor if canvas Phase 1 tables are not exposed to the Data API

grant select, insert, update, delete on public.production_surfaces to authenticated;
grant select, insert, update, delete on public.canvas_document_versions to authenticated;
grant select, insert, update, delete on public.production_surfaces to service_role;
grant select, insert, update, delete on public.canvas_document_versions to service_role;

notify pgrst, 'reload schema';
