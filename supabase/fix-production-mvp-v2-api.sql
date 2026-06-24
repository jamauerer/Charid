-- Run in Supabase SQL Editor if production tables are not exposed to the Data API

grant select, insert, update, delete on public.novel_parts to authenticated;
grant select, insert, update, delete on public.novel_chapters to authenticated;
grant select, insert, update, delete on public.comic_issues to authenticated;
grant select, insert, update, delete on public.comic_pages to authenticated;
grant select, insert, update, delete on public.comic_panels to authenticated;
grant select, insert, update, delete on public.comic_art_direction to authenticated;
grant select, insert, update, delete on public.storybook_settings to authenticated;
grant select, insert, update, delete on public.storybook_spreads to authenticated;
grant select, insert, update, delete on public.screenplay_acts to authenticated;
grant select, insert, update, delete on public.screenplay_beats to authenticated;

grant select, insert, update, delete on public.novel_parts to service_role;
grant select, insert, update, delete on public.novel_chapters to service_role;
grant select, insert, update, delete on public.comic_issues to service_role;
grant select, insert, update, delete on public.comic_pages to service_role;
grant select, insert, update, delete on public.comic_panels to service_role;
grant select, insert, update, delete on public.comic_art_direction to service_role;
grant select, insert, update, delete on public.storybook_settings to service_role;
grant select, insert, update, delete on public.storybook_spreads to service_role;
grant select, insert, update, delete on public.screenplay_acts to service_role;
grant select, insert, update, delete on public.screenplay_beats to service_role;

notify pgrst, 'reload schema';
