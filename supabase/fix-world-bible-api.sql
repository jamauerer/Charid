-- Run in Supabase SQL Editor after 20250627000000_world_bible.sql

grant select, insert, update, delete on public.world_bible to authenticated;
grant select, insert, update, delete on public.world_bible to service_role;

grant select, insert, update, delete on public.world_images to authenticated;
grant select, insert, update, delete on public.world_images to service_role;
grant select on public.world_images to anon;

grant select, insert, update, delete on public.world_image_slot_assignments to authenticated;
grant select, insert, update, delete on public.world_image_slot_assignments to service_role;
grant select on public.world_image_slot_assignments to anon;

notify pgrst, 'reload schema';
