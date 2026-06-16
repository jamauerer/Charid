-- Worlds: creator-owned containers for characters and future content
--
-- Future tables can attach to worlds(id), for example:
--   stories (world_id), locations (world_id), timelines (world_id),
--   media (world_id), comics (world_id), videos (world_id), pdfs (world_id)

create table if not exists public.worlds (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  slug text not null,
  description text,
  cover_image_path text,
  is_public boolean not null default true,
  created_at timestamptz not null default now(),
  unique (user_id, slug)
);

create index if not exists worlds_user_id_idx
  on public.worlds (user_id);

create index if not exists worlds_user_slug_idx
  on public.worlds (user_id, slug);

alter table public.characters
  add column if not exists world_id uuid references public.worlds(id) on delete set null;

create index if not exists characters_world_id_idx
  on public.characters (world_id);

alter table public.worlds enable row level security;

drop policy if exists "Users read own worlds" on public.worlds;
create policy "Users read own worlds"
  on public.worlds for select
  using (auth.uid() = user_id);

drop policy if exists "Users insert own worlds" on public.worlds;
create policy "Users insert own worlds"
  on public.worlds for insert
  with check (auth.uid() = user_id);

drop policy if exists "Users update own worlds" on public.worlds;
create policy "Users update own worlds"
  on public.worlds for update
  using (auth.uid() = user_id);

drop policy if exists "Users delete own worlds" on public.worlds;
create policy "Users delete own worlds"
  on public.worlds for delete
  using (auth.uid() = user_id);

drop policy if exists "Public worlds are viewable" on public.worlds;
create policy "Public worlds are viewable"
  on public.worlds for select
  using (is_public = true);

drop policy if exists "Public read world cover photos" on storage.objects;
create policy "Public read world cover photos"
  on storage.objects for select
  to anon, authenticated
  using (
    bucket_id = 'character-photos'
    and exists (
      select 1
      from public.worlds w
      where w.is_public = true
        and w.cover_image_path is not null
        and w.cover_image_path = storage.objects.name
    )
  );

grant select on public.worlds to anon;
grant select, insert, update, delete on public.worlds to authenticated;
grant select, insert, update, delete on public.worlds to service_role;

notify pgrst, 'reload schema';
