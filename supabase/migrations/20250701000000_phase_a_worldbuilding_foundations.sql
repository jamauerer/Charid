-- Phase A continuation: relationships, locations, maps, moodboards
-- Character Relationships V1 · World Locations V1 · World Maps V1 · World Moodboards V1

-- ---------------------------------------------------------------------------
-- character_relationships — typed bonds between characters (user-scoped V1)
-- ---------------------------------------------------------------------------
create table if not exists public.character_relationships (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  from_character_id uuid not null references public.characters(id) on delete cascade,
  to_character_id uuid not null references public.characters(id) on delete cascade,
  relationship_type text not null,
  custom_label text,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (from_character_id <> to_character_id),
  unique (from_character_id, to_character_id, relationship_type)
);

create index if not exists character_relationships_user_idx
  on public.character_relationships (user_id);

create index if not exists character_relationships_from_idx
  on public.character_relationships (from_character_id);

create index if not exists character_relationships_to_idx
  on public.character_relationships (to_character_id);

-- ---------------------------------------------------------------------------
-- world_locations — named places within a world
-- ---------------------------------------------------------------------------
create table if not exists public.world_locations (
  id uuid primary key default gen_random_uuid(),
  world_id uuid not null references public.worlds(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  location_type text not null default 'custom',
  description text,
  cover_image_id uuid references public.world_images(id) on delete set null,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists world_locations_world_idx
  on public.world_locations (world_id);

create index if not exists world_locations_user_idx
  on public.world_locations (user_id);

-- ---------------------------------------------------------------------------
-- world_maps — static map images per world (V1)
-- ---------------------------------------------------------------------------
create table if not exists public.world_maps (
  id uuid primary key default gen_random_uuid(),
  world_id uuid not null references public.worlds(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  image_id uuid references public.world_images(id) on delete set null,
  title text not null default 'World Map',
  map_type text not null default 'static'
    check (map_type in ('static', 'interactive')),
  is_primary boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists world_maps_world_idx
  on public.world_maps (world_id);

create unique index if not exists world_maps_primary_unique_idx
  on public.world_maps (world_id)
  where is_primary = true;

-- ---------------------------------------------------------------------------
-- map_location_pins — pin locations on a map (percent coordinates 0–100)
-- ---------------------------------------------------------------------------
create table if not exists public.map_location_pins (
  id uuid primary key default gen_random_uuid(),
  map_id uuid not null references public.world_maps(id) on delete cascade,
  location_id uuid references public.world_locations(id) on delete set null,
  label text not null,
  pin_x numeric(5, 2) not null check (pin_x >= 0 and pin_x <= 100),
  pin_y numeric(5, 2) not null check (pin_y >= 0 and pin_y <= 100),
  created_at timestamptz not null default now()
);

create index if not exists map_location_pins_map_idx
  on public.map_location_pins (map_id);

-- ---------------------------------------------------------------------------
-- world_moodboards — one moodboard per world in V1
-- ---------------------------------------------------------------------------
create table if not exists public.world_moodboards (
  id uuid primary key default gen_random_uuid(),
  world_id uuid not null references public.worlds(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null default 'Moodboard',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (world_id)
);

create index if not exists world_moodboards_user_idx
  on public.world_moodboards (user_id);

-- ---------------------------------------------------------------------------
-- world_moodboard_items — images in a moodboard grid
-- ---------------------------------------------------------------------------
create table if not exists public.world_moodboard_items (
  id uuid primary key default gen_random_uuid(),
  moodboard_id uuid not null references public.world_moodboards(id) on delete cascade,
  world_image_id uuid not null references public.world_images(id) on delete cascade,
  caption text,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  unique (moodboard_id, world_image_id)
);

create index if not exists world_moodboard_items_board_idx
  on public.world_moodboard_items (moodboard_id);

-- ---------------------------------------------------------------------------
-- Backfill primary maps from existing canonical_map slot assignments
-- ---------------------------------------------------------------------------
insert into public.world_maps (world_id, user_id, image_id, title, is_primary)
select wia.world_id, w.user_id, wia.image_id, 'World Map', true
from public.world_image_slot_assignments wia
join public.worlds w on w.id = wia.world_id
where wia.slot_role = 'canonical_map'
  and not exists (
    select 1 from public.world_maps wm where wm.world_id = wia.world_id
  );

-- ---------------------------------------------------------------------------
-- RLS — character_relationships
-- ---------------------------------------------------------------------------
alter table public.character_relationships enable row level security;

drop policy if exists "Users manage own character relationships" on public.character_relationships;
create policy "Users manage own character relationships"
  on public.character_relationships for all
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

-- ---------------------------------------------------------------------------
-- RLS — world_locations
-- ---------------------------------------------------------------------------
alter table public.world_locations enable row level security;

drop policy if exists "Users manage own world locations" on public.world_locations;
create policy "Users manage own world locations"
  on public.world_locations for all
  using (
    exists (
      select 1 from public.worlds w
      where w.id = world_locations.world_id and w.user_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1 from public.worlds w
      where w.id = world_locations.world_id and w.user_id = auth.uid()
    )
  );

drop policy if exists "Public read world locations" on public.world_locations;
create policy "Public read world locations"
  on public.world_locations for select
  using (
    exists (
      select 1 from public.worlds w
      where w.id = world_locations.world_id and w.is_public = true
    )
  );

-- ---------------------------------------------------------------------------
-- RLS — world_maps
-- ---------------------------------------------------------------------------
alter table public.world_maps enable row level security;

drop policy if exists "Users manage own world maps" on public.world_maps;
create policy "Users manage own world maps"
  on public.world_maps for all
  using (
    exists (
      select 1 from public.worlds w
      where w.id = world_maps.world_id and w.user_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1 from public.worlds w
      where w.id = world_maps.world_id and w.user_id = auth.uid()
    )
  );

drop policy if exists "Public read world maps" on public.world_maps;
create policy "Public read world maps"
  on public.world_maps for select
  using (
    exists (
      select 1 from public.worlds w
      where w.id = world_maps.world_id and w.is_public = true
    )
  );

-- ---------------------------------------------------------------------------
-- RLS — map_location_pins
-- ---------------------------------------------------------------------------
alter table public.map_location_pins enable row level security;

drop policy if exists "Users manage own map pins" on public.map_location_pins;
create policy "Users manage own map pins"
  on public.map_location_pins for all
  using (
    exists (
      select 1
      from public.world_maps wm
      join public.worlds w on w.id = wm.world_id
      where wm.id = map_location_pins.map_id and w.user_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1
      from public.world_maps wm
      join public.worlds w on w.id = wm.world_id
      where wm.id = map_location_pins.map_id and w.user_id = auth.uid()
    )
  );

drop policy if exists "Public read map pins" on public.map_location_pins;
create policy "Public read map pins"
  on public.map_location_pins for select
  using (
    exists (
      select 1
      from public.world_maps wm
      join public.worlds w on w.id = wm.world_id
      where wm.id = map_location_pins.map_id and w.is_public = true
    )
  );

-- ---------------------------------------------------------------------------
-- RLS — world_moodboards
-- ---------------------------------------------------------------------------
alter table public.world_moodboards enable row level security;

drop policy if exists "Users manage own world moodboards" on public.world_moodboards;
create policy "Users manage own world moodboards"
  on public.world_moodboards for all
  using (
    exists (
      select 1 from public.worlds w
      where w.id = world_moodboards.world_id and w.user_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1 from public.worlds w
      where w.id = world_moodboards.world_id and w.user_id = auth.uid()
    )
  );

drop policy if exists "Public read world moodboards" on public.world_moodboards;
create policy "Public read world moodboards"
  on public.world_moodboards for select
  using (
    exists (
      select 1 from public.worlds w
      where w.id = world_moodboards.world_id and w.is_public = true
    )
  );

-- ---------------------------------------------------------------------------
-- RLS — world_moodboard_items
-- ---------------------------------------------------------------------------
alter table public.world_moodboard_items enable row level security;

drop policy if exists "Users manage own moodboard items" on public.world_moodboard_items;
create policy "Users manage own moodboard items"
  on public.world_moodboard_items for all
  using (
    exists (
      select 1
      from public.world_moodboards mb
      join public.worlds w on w.id = mb.world_id
      where mb.id = world_moodboard_items.moodboard_id and w.user_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1
      from public.world_moodboards mb
      join public.worlds w on w.id = mb.world_id
      where mb.id = world_moodboard_items.moodboard_id and w.user_id = auth.uid()
    )
  );

drop policy if exists "Public read moodboard items" on public.world_moodboard_items;
create policy "Public read moodboard items"
  on public.world_moodboard_items for select
  using (
    exists (
      select 1
      from public.world_moodboards mb
      join public.worlds w on w.id = mb.world_id
      where mb.id = world_moodboard_items.moodboard_id and w.is_public = true
    )
  );
