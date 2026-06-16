-- Run in Supabase SQL Editor if chapters table is not exposed to the Data API

grant select on public.chapters to anon;
grant select, insert, update, delete on public.chapters to authenticated;
grant select, insert, update, delete on public.chapters to service_role;

notify pgrst, 'reload schema';
