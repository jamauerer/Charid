-- Run in Supabase SQL Editor if stories tables are not exposed to the Data API

grant select on public.stories to anon;
grant select, insert, update, delete on public.stories to authenticated;
grant select, insert, update, delete on public.stories to service_role;

grant select on public.story_characters to anon;
grant select, insert, update, delete on public.story_characters to authenticated;
grant select, insert, update, delete on public.story_characters to service_role;

notify pgrst, 'reload schema';
