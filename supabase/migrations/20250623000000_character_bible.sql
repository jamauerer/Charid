-- Character Bible V1 (AI Foundation Slice A)
-- RFIM Phase 0: reference graph nodes + creator descriptors
-- character_bible row = implicit "current version" (V2 → character_versions)

-- ---------------------------------------------------------------------------
-- Permanent identity fields on characters (stable across future versions)
-- ---------------------------------------------------------------------------
alter table public.characters
  add column if not exists species text,
  add column if not exists core_personality text,
  add column if not exists permanent_features text;

-- ---------------------------------------------------------------------------
-- character_bible — version-scoped state (one current row per character in V1)
-- ---------------------------------------------------------------------------
create table if not exists public.character_bible (
  character_id uuid primary key references public.characters(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  identity_archetype text not null default 'humanoid_stylized'
    check (identity_archetype in (
      'humanoid_realistic',
      'humanoid_stylized',
      'humanoid_anime',
      'humanoid_comic',
      'humanoid_cartoon',
      'humanoid_fantasy',
      'anthropomorphic',
      'creature_quadruped',
      'creature_other'
    )),
  creative_format text,
  version_label text not null default 'Current',
  is_current boolean not null default true,
  age text,
  height text,
  build text,
  hair text,
  eyes text,
  clothing text,
  accessories text,
  scars_tattoos text,
  other_details text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists character_bible_user_id_idx
  on public.character_bible (user_id);

-- Backfill bible rows for existing characters.
-- Age may live on characters (pre-migration) or character_bible (post-migration / partial run).
do $$
begin
  if exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'characters'
      and column_name = 'age'
  ) then
    -- Migrate age from characters → character_bible for rows missing a bible entry
    insert into public.character_bible (character_id, user_id, age)
    select c.id, c.user_id, c.age
    from public.characters c
    where not exists (
      select 1 from public.character_bible cb where cb.character_id = c.id
    );

    -- Backfill age on bible rows created before age was migrated
    update public.character_bible cb
    set age = c.age
    from public.characters c
    where cb.character_id = c.id
      and cb.age is null
      and c.age is not null;

    alter table public.characters drop column age;
  else
    -- characters.age already removed — create missing bible rows without age
    insert into public.character_bible (character_id, user_id)
    select c.id, c.user_id
    from public.characters c
    where not exists (
      select 1 from public.character_bible cb where cb.character_id = c.id
    );
  end if;
end $$;

-- ---------------------------------------------------------------------------
-- character_images — typed reference graph nodes (asset_role)
-- ---------------------------------------------------------------------------
alter table public.character_images
  add column if not exists asset_role text not null default 'reference',
  add column if not exists asset_role_label text;

alter table public.character_images
  drop constraint if exists character_images_asset_role_check;

alter table public.character_images
  add constraint character_images_asset_role_check
  check (
    asset_role = 'reference'
    or asset_role = 'canonical'
    or asset_role = 'other'
    or asset_role like 'turnaround_%'
    or asset_role like 'expression_%'
    or asset_role like 'outfit_%'
    or asset_role like 'prop_%'
    or asset_role like 'companion_%'
    or asset_role like 'vehicle_%'
  );

create index if not exists character_images_character_role_idx
  on public.character_images (character_id, asset_role);

-- Promote featured image to canonical role
update public.character_images ci
set asset_role = 'canonical'
from public.characters c
where c.featured_image_id = ci.id
  and ci.asset_role = 'reference';

-- First gallery image per character becomes canonical when none set
update public.character_images ci
set asset_role = 'canonical'
from (
  select distinct on (character_id) id, character_id
  from public.character_images
  order by character_id, sort_order asc, created_at asc
) first_img
where ci.id = first_img.id
  and not exists (
    select 1 from public.character_images c2
    where c2.character_id = ci.character_id
      and c2.asset_role = 'canonical'
  );

-- Sync featured_image_id to canonical row where missing
update public.characters c
set featured_image_id = ci.id
from public.character_images ci
where ci.character_id = c.id
  and ci.asset_role = 'canonical'
  and c.featured_image_id is distinct from ci.id
  and c.featured_image_id is null;

-- ---------------------------------------------------------------------------
-- RLS — character_bible (workspace-private)
-- ---------------------------------------------------------------------------
alter table public.character_bible enable row level security;

drop policy if exists "Users read own character bible" on public.character_bible;
create policy "Users read own character bible"
  on public.character_bible for select
  using (auth.uid() = user_id);

drop policy if exists "Users insert own character bible" on public.character_bible;
create policy "Users insert own character bible"
  on public.character_bible for insert
  with check (auth.uid() = user_id);

drop policy if exists "Users update own character bible" on public.character_bible;
create policy "Users update own character bible"
  on public.character_bible for update
  using (auth.uid() = user_id);

drop policy if exists "Users delete own character bible" on public.character_bible;
create policy "Users delete own character bible"
  on public.character_bible for delete
  using (auth.uid() = user_id);

grant select, insert, update, delete on public.character_bible to authenticated;
grant select, insert, update, delete on public.character_bible to service_role;

notify pgrst, 'reload schema';
