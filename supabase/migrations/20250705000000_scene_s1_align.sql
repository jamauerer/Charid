-- Scene S1 align — chapter/world links, character role
-- Authority: SCENE_ARCHITECTURE_V2 · SCENE_IMPLEMENTATION_DIRECTIVES

alter table public.scenes
  add column if not exists chapter_id uuid references public.chapters(id) on delete set null;

alter table public.scenes
  add column if not exists world_id uuid references public.worlds(id) on delete set null;

create index if not exists scenes_chapter_idx on public.scenes (chapter_id);
create index if not exists scenes_world_idx on public.scenes (world_id);

alter table public.scene_characters
  add column if not exists role text not null default 'present';

comment on column public.scenes.world_location_id is 'Optional link to world_locations (location_id in product spec)';
comment on column public.scene_characters.role is 'S1 default: present. Future: speaking, pov, antagonist, narrator';

notify pgrst, 'reload schema';
