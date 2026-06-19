-- Run in Supabase SQL Editor after 20250702000000_project_stage_1.sql

grant select on public.projects to anon;
grant select, insert, update, delete on public.projects to authenticated;
grant select, insert, update, delete on public.projects to service_role;

grant select on public.story_worlds to anon;
grant select, insert, update, delete on public.story_worlds to authenticated;
grant select, insert, update, delete on public.story_worlds to service_role;

notify pgrst, 'reload schema';
