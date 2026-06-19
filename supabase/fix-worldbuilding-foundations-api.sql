-- Run in Supabase SQL Editor after 20250701000000_phase_a_worldbuilding_foundations.sql

grant select, insert, update, delete on public.character_relationships to authenticated;
grant select, insert, update, delete on public.character_relationships to service_role;

grant select, insert, update, delete on public.world_locations to authenticated;
grant select, insert, update, delete on public.world_locations to service_role;
grant select on public.world_locations to anon;

grant select, insert, update, delete on public.world_maps to authenticated;
grant select, insert, update, delete on public.world_maps to service_role;
grant select on public.world_maps to anon;

grant select, insert, update, delete on public.map_location_pins to authenticated;
grant select, insert, update, delete on public.map_location_pins to service_role;
grant select on public.map_location_pins to anon;

grant select, insert, update, delete on public.world_moodboards to authenticated;
grant select, insert, update, delete on public.world_moodboards to service_role;
grant select on public.world_moodboards to anon;

grant select, insert, update, delete on public.world_moodboard_items to authenticated;
grant select, insert, update, delete on public.world_moodboard_items to service_role;
grant select on public.world_moodboard_items to anon;

notify pgrst, 'reload schema';
