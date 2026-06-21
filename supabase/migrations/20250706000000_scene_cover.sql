-- Scene cover image + manual focal positioning for timeline cards

alter table public.scenes
  add column if not exists cover_image_path text,
  add column if not exists cover_focal_x numeric not null default 50,
  add column if not exists cover_focal_y numeric not null default 50;

notify pgrst, 'reload schema';
