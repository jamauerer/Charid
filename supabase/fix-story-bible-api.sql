-- Expose story bible tables to the Supabase Data API
-- Run in Supabase SQL Editor after 20250631000000_story_bible.sql

grant select, insert, update on public.story_bible to authenticated;
grant select, insert, update, delete on public.story_image_slot_assignments to authenticated;
grant select, insert, update, delete on public.story_bible to service_role;
grant select, insert, update, delete on public.story_image_slot_assignments to service_role;

notify pgrst, 'reload schema';
