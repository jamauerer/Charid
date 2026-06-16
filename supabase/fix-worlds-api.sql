-- Run in Supabase SQL Editor if worlds table is not exposed to the Data API

grant select on public.worlds to anon;
grant select, insert, update, delete on public.worlds to authenticated;
grant select, insert, update, delete on public.worlds to service_role;

notify pgrst, 'reload schema';
