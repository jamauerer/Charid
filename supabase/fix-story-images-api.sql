-- Run in Supabase SQL Editor if story_images is not exposed to the Data API

grant select on public.story_images to anon;
grant select, insert, update, delete on public.story_images to authenticated;
grant select, insert, update, delete on public.story_images to service_role;

notify pgrst, 'reload schema';
