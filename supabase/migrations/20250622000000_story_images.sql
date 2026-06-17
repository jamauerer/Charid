-- Story Reference Assets v1: gallery + featured cover
-- Visibility inherits from parent world (stories have no is_public flag)

create table if not exists public.story_images (
  id uuid primary key default gen_random_uuid(),
  story_id uuid not null references public.stories(id) on delete cascade,
  image_path text not null,
  caption text,
  asset_type text not null default 'reference'
    check (asset_type in ('cover', 'reference', 'mood_board', 'key_scene', 'other')),
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

create index if not exists story_images_story_id_idx
  on public.story_images (story_id);

create index if not exists story_images_story_sort_idx
  on public.story_images (story_id, sort_order);

create index if not exists story_images_asset_type_idx
  on public.story_images (story_id, asset_type);

alter table public.stories
  add column if not exists featured_image_id uuid;

-- Featured image FK (nullable; cleared if image deleted)
do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'stories_featured_image_id_fkey'
  ) then
    alter table public.stories
      add constraint stories_featured_image_id_fkey
      foreign key (featured_image_id)
      references public.story_images(id)
      on delete set null;
  end if;
end $$;

alter table public.story_images enable row level security;

-- Owner CRUD via parent story
drop policy if exists "Users read own story images" on public.story_images;
create policy "Users read own story images"
  on public.story_images for select
  using (
    exists (
      select 1 from public.stories s
      where s.id = story_images.story_id
        and s.user_id = auth.uid()
    )
  );

drop policy if exists "Users insert own story images" on public.story_images;
create policy "Users insert own story images"
  on public.story_images for insert
  with check (
    exists (
      select 1 from public.stories s
      where s.id = story_images.story_id
        and s.user_id = auth.uid()
    )
  );

drop policy if exists "Users update own story images" on public.story_images;
create policy "Users update own story images"
  on public.story_images for update
  using (
    exists (
      select 1 from public.stories s
      where s.id = story_images.story_id
        and s.user_id = auth.uid()
    )
  );

drop policy if exists "Users delete own story images" on public.story_images;
create policy "Users delete own story images"
  on public.story_images for delete
  using (
    exists (
      select 1 from public.stories s
      where s.id = story_images.story_id
        and s.user_id = auth.uid()
    )
  );

-- Public read when parent world is public
drop policy if exists "Public story images are viewable" on public.story_images;
create policy "Public story images are viewable"
  on public.story_images for select
  using (
    exists (
      select 1
      from public.stories s
      inner join public.worlds w on w.id = s.world_id
      where s.id = story_images.story_id
        and w.is_public = true
    )
  );

-- Public storage read for gallery images on public worlds
drop policy if exists "Public read story gallery photos" on storage.objects;
create policy "Public read story gallery photos"
  on storage.objects for select
  to anon, authenticated
  using (
    bucket_id = 'character-photos'
    and exists (
      select 1
      from public.story_images si
      inner join public.stories s on s.id = si.story_id
      inner join public.worlds w on w.id = s.world_id
      where w.is_public = true
        and si.image_path = storage.objects.name
    )
  );

grant select on public.story_images to anon;
grant select, insert, update, delete on public.story_images to authenticated;
grant select, insert, update, delete on public.story_images to service_role;

notify pgrst, 'reload schema';
