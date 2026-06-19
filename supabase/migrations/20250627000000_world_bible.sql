-- World Bible V1 foundation (Slice A)
-- Assets → assign roles pattern (mirrors character_image_slot_assignments)

-- ---------------------------------------------------------------------------
-- world_bible — version-scoped world canon metadata
-- ---------------------------------------------------------------------------
create table if not exists public.world_bible (
  world_id uuid primary key references public.worlds(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  genre text,
  tone text,
  themes text,
  rules text,
  era text,
  climate text,
  overview text,
  version_label text not null default 'Current',
  is_current boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists world_bible_user_id_idx
  on public.world_bible (user_id);

-- Backfill bible rows for existing worlds
insert into public.world_bible (world_id, user_id, overview)
select w.id, w.user_id, w.description
from public.worlds w
where not exists (
  select 1 from public.world_bible wb where wb.world_id = w.id
);

-- ---------------------------------------------------------------------------
-- world_images — reusable reference gallery assets
-- ---------------------------------------------------------------------------
create table if not exists public.world_images (
  id uuid primary key default gen_random_uuid(),
  world_id uuid not null references public.worlds(id) on delete cascade,
  image_path text not null,
  caption text,
  sort_order integer not null default 0,
  asset_role text not null default 'reference'
    check (asset_role in ('reference', 'other')),
  asset_role_label text,
  created_at timestamptz not null default now()
);

create index if not exists world_images_world_id_idx
  on public.world_images (world_id);

-- ---------------------------------------------------------------------------
-- world_image_slot_assignments — flexible role assignment
-- ---------------------------------------------------------------------------
create table if not exists public.world_image_slot_assignments (
  id uuid primary key default gen_random_uuid(),
  world_id uuid not null references public.worlds(id) on delete cascade,
  image_id uuid not null references public.world_images(id) on delete cascade,
  slot_role text not null check (
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
  ),
  source text not null default 'assigned' check (
    source in ('uploaded', 'generated', 'assigned')
  ),
  created_at timestamptz not null default now(),
  unique (world_id, slot_role)
);

create index if not exists world_image_slot_assignments_world_idx
  on public.world_image_slot_assignments (world_id);

create index if not exists world_image_slot_assignments_image_idx
  on public.world_image_slot_assignments (image_id);

-- ---------------------------------------------------------------------------
-- RLS — world_bible
-- ---------------------------------------------------------------------------
alter table public.world_bible enable row level security;

drop policy if exists "Users read own world bible" on public.world_bible;
create policy "Users read own world bible"
  on public.world_bible for select
  using (
    exists (
      select 1 from public.worlds w
      where w.id = world_bible.world_id and w.user_id = auth.uid()
    )
  );

drop policy if exists "Users insert own world bible" on public.world_bible;
create policy "Users insert own world bible"
  on public.world_bible for insert
  with check (
    exists (
      select 1 from public.worlds w
      where w.id = world_bible.world_id and w.user_id = auth.uid()
    )
  );

drop policy if exists "Users update own world bible" on public.world_bible;
create policy "Users update own world bible"
  on public.world_bible for update
  using (
    exists (
      select 1 from public.worlds w
      where w.id = world_bible.world_id and w.user_id = auth.uid()
    )
  );

drop policy if exists "Users delete own world bible" on public.world_bible;
create policy "Users delete own world bible"
  on public.world_bible for delete
  using (
    exists (
      select 1 from public.worlds w
      where w.id = world_bible.world_id and w.user_id = auth.uid()
    )
  );

-- ---------------------------------------------------------------------------
-- RLS — world_images
-- ---------------------------------------------------------------------------
alter table public.world_images enable row level security;

drop policy if exists "Users manage own world images" on public.world_images;
create policy "Users manage own world images"
  on public.world_images for all
  using (
    exists (
      select 1 from public.worlds w
      where w.id = world_images.world_id and w.user_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1 from public.worlds w
      where w.id = world_images.world_id and w.user_id = auth.uid()
    )
  );

drop policy if exists "Public read world images" on public.world_images;
create policy "Public read world images"
  on public.world_images for select
  using (
    exists (
      select 1 from public.worlds w
      where w.id = world_images.world_id and w.is_public = true
    )
  );

-- ---------------------------------------------------------------------------
-- RLS — world_image_slot_assignments
-- ---------------------------------------------------------------------------
alter table public.world_image_slot_assignments enable row level security;

drop policy if exists "Users manage own world slot assignments" on public.world_image_slot_assignments;
create policy "Users manage own world slot assignments"
  on public.world_image_slot_assignments for all
  using (
    exists (
      select 1 from public.worlds w
      where w.id = world_image_slot_assignments.world_id and w.user_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1 from public.worlds w
      where w.id = world_image_slot_assignments.world_id and w.user_id = auth.uid()
    )
  );

-- Public worlds: allow read of slot assignments (for public world pages)
drop policy if exists "Public read world slot assignments" on public.world_image_slot_assignments;
create policy "Public read world slot assignments"
  on public.world_image_slot_assignments for select
  using (
    exists (
      select 1 from public.worlds w
      where w.id = world_image_slot_assignments.world_id and w.is_public = true
    )
  );

-- Storage: public read for images on public worlds
drop policy if exists "Public read world gallery photos" on storage.objects;
create policy "Public read world gallery photos"
  on storage.objects for select
  to anon, authenticated
  using (
    bucket_id = 'character-photos'
    and exists (
      select 1
      from public.world_images wi
      join public.worlds w on w.id = wi.world_id
      where w.is_public = true
        and wi.image_path = storage.objects.name
    )
  );

notify pgrst, 'reload schema';
