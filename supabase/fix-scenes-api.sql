-- Run in Supabase SQL Editor after 20250704000000_scene_s1.sql

grant select on public.scenes to anon;
grant select, insert, update, delete on public.scenes to authenticated;
grant select, insert, update, delete on public.scenes to service_role;

grant select on public.scene_characters to anon;
grant select, insert, update, delete on public.scene_characters to authenticated;
grant select, insert, update, delete on public.scene_characters to service_role;

notify pgrst, 'reload schema';
