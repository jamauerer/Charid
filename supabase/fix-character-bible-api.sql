-- Run in Supabase SQL Editor after 20250623000000_character_bible.sql
-- and 20250626000000_character_image_slot_assignments.sql

grant select, insert, update, delete on public.character_bible to authenticated;
grant select, insert, update, delete on public.character_bible to service_role;

grant select, insert, update, delete on public.character_image_slot_assignments to authenticated;
grant select, insert, update, delete on public.character_image_slot_assignments to service_role;

notify pgrst, 'reload schema';
