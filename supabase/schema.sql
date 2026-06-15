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
