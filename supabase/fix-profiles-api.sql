-- Run in Supabase SQL Editor if profiles table is not exposed to the Data API

grant select on public.profiles to anon;
grant select, insert, update on public.profiles to authenticated;
grant select, insert, update, delete on public.profiles to service_role;

notify pgrst, 'reload schema';
