-- World Bible slot role names (Slice B) — extensible roles, assets → assign roles
-- Run after 20250627000000_world_bible.sql if Slice A was already applied with legacy names.

-- Migrate legacy role names to approved V1 roles
update public.world_image_slot_assignments
set slot_role = case slot_role
  when 'canonical' then 'canonical_reference'
  when 'map' then 'canonical_map'
  when 'location_primary' then 'location'
  else slot_role
end
where slot_role in ('canonical', 'map', 'location_primary');

alter table public.world_image_slot_assignments
  drop constraint if exists world_image_slot_assignments_slot_role_check;

alter table public.world_image_slot_assignments
  add constraint world_image_slot_assignments_slot_role_check
  check (
    slot_role = 'canonical_map'
    or slot_role = 'canonical_reference'
    or slot_role = 'location'
    or slot_role = 'environment'
    or slot_role = 'architecture'
    or slot_role = 'mood_board'
    or slot_role like 'location_%'
    or slot_role like 'faction_%'
    or slot_role like 'region_%'
    or slot_role like 'nation_%'
    or slot_role like 'species_%'
    or slot_role like 'organization_%'
    or slot_role like 'culture_%'
  );

notify pgrst, 'reload schema';
