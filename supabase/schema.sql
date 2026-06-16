-- Characters table
create table public.characters (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  gender text,
  age text,
  location text,
  backstory text,
  photo_path text,
  featured_image_id uuid,
  world_id uuid,
  is_public boolean not null default true,
  created_at timestamptz not null default now()
);

alter table public.characters enable row level security;

create policy "Users read own characters"
  on public.characters for select
  using (auth.uid() = user_id);

create policy "Users insert own characters"
  on public.characters for insert
  with check (auth.uid() = user_id);

create policy "Users update own characters"
  on public.characters for update
  using (auth.uid() = user_id);

create policy "Users delete own characters"
  on public.characters for delete
  using (auth.uid() = user_id);

create policy "Public characters are viewable"
  on public.characters for select
  using (
    is_public = true
    and exists (
      select 1 from public.profiles
      where profiles.id = characters.user_id
        and profiles.is_public = true
    )
  );

-- Character gallery images
create table public.character_images (
  id uuid primary key default gen_random_uuid(),
  character_id uuid not null references public.characters(id) on delete cascade,
  image_path text not null,
  caption text,
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

create index character_images_character_id_idx
  on public.character_images (character_id);

create index character_images_character_sort_idx
  on public.character_images (character_id, sort_order);

alter table public.characters
  add constraint characters_featured_image_id_fkey
  foreign key (featured_image_id)
  references public.character_images(id)
  on delete set null;

alter table public.character_images enable row level security;

create policy "Users read own character images"
  on public.character_images for select
  using (
    exists (
      select 1 from public.characters
      where characters.id = character_images.character_id
        and characters.user_id = auth.uid()
    )
  );

create policy "Users insert own character images"
  on public.character_images for insert
  with check (
    exists (
      select 1 from public.characters
      where characters.id = character_images.character_id
        and characters.user_id = auth.uid()
    )
  );

create policy "Users update own character images"
  on public.character_images for update
  using (
    exists (
      select 1 from public.characters
      where characters.id = character_images.character_id
        and characters.user_id = auth.uid()
    )
  );

create policy "Users delete own character images"
  on public.character_images for delete
  using (
    exists (
      select 1 from public.characters
      where characters.id = character_images.character_id
        and characters.user_id = auth.uid()
    )
  );

create policy "Public character images are viewable"
  on public.character_images for select
  using (
    exists (
      select 1
      from public.characters c
      inner join public.profiles p on p.id = c.user_id
      where c.id = character_images.character_id
        and c.is_public = true
        and p.is_public = true
    )
  );

grant select on public.character_images to anon;
grant select, insert, update, delete on public.character_images to authenticated;
grant select, insert, update, delete on public.character_images to service_role;

-- Worlds: containers for characters and future content (stories, locations, media)
create table public.worlds (
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

create index worlds_user_id_idx on public.worlds (user_id);
create index worlds_user_slug_idx on public.worlds (user_id, slug);

alter table public.characters
  add constraint characters_world_id_fkey
  foreign key (world_id)
  references public.worlds(id)
  on delete set null;

create index characters_world_id_idx on public.characters (world_id);

alter table public.worlds enable row level security;

create policy "Users read own worlds"
  on public.worlds for select
  using (auth.uid() = user_id);

create policy "Users insert own worlds"
  on public.worlds for insert
  with check (auth.uid() = user_id);

create policy "Users update own worlds"
  on public.worlds for update
  using (auth.uid() = user_id);

create policy "Users delete own worlds"
  on public.worlds for delete
  using (auth.uid() = user_id);

create policy "Public worlds are viewable"
  on public.worlds for select
  using (is_public = true);

grant select on public.worlds to anon;
grant select, insert, update, delete on public.worlds to authenticated;
grant select, insert, update, delete on public.worlds to service_role;

-- Profiles table
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  username text unique not null,
  display_name text,
  bio text,
  avatar_url text,
  is_public boolean not null default true,
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

create policy "Users read own profile"
  on public.profiles for select
  using (auth.uid() = id);

create policy "Users insert own profile"
  on public.profiles for insert
  with check (auth.uid() = id);

create policy "Users update own profile"
  on public.profiles for update
  using (auth.uid() = id);

create policy "Public profiles are viewable"
  on public.profiles for select
  using (is_public = true);

-- Required for Supabase Data API (new projects no longer auto-expose tables)
grant select on public.characters to anon;
grant select, insert, update, delete on public.characters to authenticated;
grant select, insert, update, delete on public.characters to service_role;

grant select on public.profiles to anon;
grant select, insert, update on public.profiles to authenticated;
grant select, insert, update, delete on public.profiles to service_role;

-- Refresh PostgREST schema cache so the API sees the new table
notify pgrst, 'reload schema';

-- Create the character-photos bucket in Storage UI first (private bucket),
-- then run the policies below.

create policy "Users upload own photos"
  on storage.objects for insert
  to authenticated
  with check (
    bucket_id = 'character-photos'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "Users read own photos"
  on storage.objects for select
  to authenticated
  using (
    bucket_id = 'character-photos'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "Users delete own photos"
  on storage.objects for delete
  to authenticated
  using (
    bucket_id = 'character-photos'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "Public read portfolio character photos"
  on storage.objects for select
  to anon, authenticated
  using (
    bucket_id = 'character-photos'
    and exists (
      select 1
      from public.characters c
      inner join public.profiles p on p.id = c.user_id
      where c.is_public = true
        and p.is_public = true
        and c.photo_path is not null
        and c.photo_path = storage.objects.name
    )
  );

create policy "Public read character gallery photos"
  on storage.objects for select
  to anon, authenticated
  using (
    bucket_id = 'character-photos'
    and exists (
      select 1
      from public.character_images ci
      inner join public.characters c on c.id = ci.character_id
      inner join public.profiles p on p.id = c.user_id
      where c.is_public = true
        and p.is_public = true
        and ci.image_path = storage.objects.name
    )
  );

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

create policy "Public read portfolio avatars"
  on storage.objects for select
  to anon, authenticated
  using (
    bucket_id = 'character-photos'
    and exists (
      select 1
      from public.profiles p
      where p.is_public = true
        and p.avatar_url is not null
        and p.avatar_url = storage.objects.name
    )
  );
