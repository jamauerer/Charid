-- Main portrait vertical focal positioning for character cards
alter table public.characters
  add column if not exists portrait_focal_y numeric not null default 50;
