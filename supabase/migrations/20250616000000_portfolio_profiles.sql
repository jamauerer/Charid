-- Portfolio profiles + character visibility

create table if not exists public.profiles (
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

alter table public.characters
  add column if not exists is_public boolean not null default true;

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

-- Public read for portfolio character photos (private bucket)
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

-- Public read for portfolio avatars
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

grant select on public.profiles to anon;
grant select, insert, update on public.profiles to authenticated;
grant select, insert, update, delete on public.profiles to service_role;

notify pgrst, 'reload schema';
