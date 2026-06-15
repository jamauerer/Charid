-- Character galleries: multi-image support
-- Does not require public.profiles (uses characters.is_public only)

-- Visibility flag for public gallery access (harmless if already present)
alter table public.characters
  add column if not exists is_public boolean not null default true;

create table if not exists public.character_images (
  id uuid primary key default gen_random_uuid(),
  character_id uuid not null references public.characters(id) on delete cascade,
  image_path text not null,
  caption text,
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

create index if not exists character_images_character_id_idx
  on public.character_images (character_id);

create index if not exists character_images_character_sort_idx
  on public.character_images (character_id, sort_order);

alter table public.characters
  add column if not exists featured_image_id uuid;

-- Migrate existing single photos into character_images
insert into public.character_images (character_id, image_path, caption, sort_order)
select c.id, c.photo_path, 'Main Portrait', 0
from public.characters c
where c.photo_path is not null
  and not exists (
    select 1 from public.character_images ci
    where ci.character_id = c.id and ci.image_path = c.photo_path
  );

-- Link featured_image_id to migrated rows
update public.characters c
set featured_image_id = ci.id
from public.character_images ci
where ci.character_id = c.id
  and c.photo_path is not null
  and ci.image_path = c.photo_path
  and c.featured_image_id is null;

-- Featured image FK (nullable; cleared if image deleted)
do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'characters_featured_image_id_fkey'
  ) then
    alter table public.characters
      add constraint characters_featured_image_id_fkey
      foreign key (featured_image_id)
      references public.character_images(id)
      on delete set null;
  end if;
end $$;

alter table public.character_images enable row level security;

drop policy if exists "Users read own character images" on public.character_images;
create policy "Users read own character images"
  on public.character_images for select
  using (
    exists (
      select 1 from public.characters
      where characters.id = character_images.character_id
        and characters.user_id = auth.uid()
    )
  );

drop policy if exists "Users insert own character images" on public.character_images;
create policy "Users insert own character images"
  on public.character_images for insert
  with check (
    exists (
      select 1 from public.characters
      where characters.id = character_images.character_id
        and characters.user_id = auth.uid()
    )
  );

drop policy if exists "Users update own character images" on public.character_images;
create policy "Users update own character images"
  on public.character_images for update
  using (
    exists (
      select 1 from public.characters
      where characters.id = character_images.character_id
        and characters.user_id = auth.uid()
    )
  );

drop policy if exists "Users delete own character images" on public.character_images;
create policy "Users delete own character images"
  on public.character_images for delete
  using (
    exists (
      select 1 from public.characters
      where characters.id = character_images.character_id
        and characters.user_id = auth.uid()
    )
  );

-- Public read: any gallery image belonging to a public character
drop policy if exists "Public character images are viewable" on public.character_images;
create policy "Public character images are viewable"
  on public.character_images for select
  using (
    exists (
      select 1
      from public.characters c
      where c.id = character_images.character_id
        and c.is_public = true
    )
  );

-- Public storage read for gallery images on public characters
drop policy if exists "Public read character gallery photos" on storage.objects;
create policy "Public read character gallery photos"
  on storage.objects for select
  to anon, authenticated
  using (
    bucket_id = 'character-photos'
    and exists (
      select 1
      from public.character_images ci
      inner join public.characters c on c.id = ci.character_id
      where c.is_public = true
        and ci.image_path = storage.objects.name
    )
  );

grant select on public.character_images to anon;
grant select, insert, update, delete on public.character_images to authenticated;
grant select, insert, update, delete on public.character_images to service_role;

notify pgrst, 'reload schema';
