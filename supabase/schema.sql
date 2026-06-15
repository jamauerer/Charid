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

-- Required for Supabase Data API (new projects no longer auto-expose tables)
grant select on public.characters to anon;
grant select, insert, update, delete on public.characters to authenticated;
grant select, insert, update, delete on public.characters to service_role;

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
