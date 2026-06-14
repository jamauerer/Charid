-- Run this in Supabase SQL Editor if the dashboard shows:
-- "Could not find the table 'public.characters' in the schema cache"

grant select on public.characters to anon;
grant select, insert, update, delete on public.characters to authenticated;
grant select, insert, update, delete on public.characters to service_role;

notify pgrst, 'reload schema';
