-- Production Canvas Phase 2: link production rows to surfaces + page layout frames

alter table public.comic_panels
  add column if not exists surface_id uuid references public.production_surfaces(id) on delete set null,
  add column if not exists frame_x numeric not null default 0,
  add column if not exists frame_y numeric not null default 0,
  add column if not exists frame_width numeric,
  add column if not exists frame_height numeric,
  add column if not exists frame_rotation numeric not null default 0;

create unique index if not exists comic_panels_surface_id_unique_idx
  on public.comic_panels (surface_id)
  where surface_id is not null;

alter table public.storybook_spreads
  add column if not exists surface_id uuid references public.production_surfaces(id) on delete set null;

create unique index if not exists storybook_spreads_surface_id_unique_idx
  on public.storybook_spreads (surface_id)
  where surface_id is not null;

notify pgrst, 'reload schema';
