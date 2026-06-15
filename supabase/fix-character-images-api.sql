-- Run in Supabase SQL Editor if character_images is not exposed to the Data API

grant select on public.character_images to anon;
grant select, insert, update, delete on public.character_images to authenticated;
grant select, insert, update, delete on public.character_images to service_role;

notify pgrst, 'reload schema';
