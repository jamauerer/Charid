-- Story Planning v1: organizational stories within worlds
-- NOT a writing platform — no chapters, rich text, AI, or collaboration.
--
-- Future tables can attach to stories(id):
--   chapters, media, comics, videos, timelines

create table if not exists public.stories (
  id uuid primary key default gen_random_uuid(),
  world_id uuid not null references public.worlds(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  slug text not null,
  summary text,
  status text not null default 'Idea'
    check (status in ('Idea', 'Planning', 'In Progress', 'Complete')),
  created_at timestamptz not null default now(),
  unique (world_id, slug)
);

create index if not exists stories_world_id_idx on public.stories (world_id);
create index if not exists stories_user_id_idx on public.stories (user_id);
create index if not exists stories_world_status_idx on public.stories (world_id, status);

create table if not exists public.story_characters (
  story_id uuid not null references public.stories(id) on delete cascade,
  character_id uuid not null references public.characters(id) on delete cascade,
  primary key (story_id, character_id)
);

create index if not exists story_characters_character_id_idx
  on public.story_characters (character_id);

alter table public.stories enable row level security;
alter table public.story_characters enable row level security;

-- Owner CRUD on stories
drop policy if exists "Users read own stories" on public.stories;
create policy "Users read own stories"
  on public.stories for select using (auth.uid() = user_id);

drop policy if exists "Users insert own stories" on public.stories;
create policy "Users insert own stories"
  on public.stories for insert with check (auth.uid() = user_id);

drop policy if exists "Users update own stories" on public.stories;
create policy "Users update own stories"
  on public.stories for update using (auth.uid() = user_id);

drop policy if exists "Users delete own stories" on public.stories;
create policy "Users delete own stories"
  on public.stories for delete using (auth.uid() = user_id);

-- Public read when parent world is public
drop policy if exists "Public stories are viewable" on public.stories;
create policy "Public stories are viewable"
  on public.stories for select
  using (
    exists (
      select 1 from public.worlds w
      where w.id = stories.world_id and w.is_public = true
    )
  );

-- story_characters: owner via story
drop policy if exists "Users read own story characters" on public.story_characters;
create policy "Users read own story characters"
  on public.story_characters for select
  using (
    exists (
      select 1 from public.stories s
      where s.id = story_characters.story_id and s.user_id = auth.uid()
    )
  );

drop policy if exists "Users insert own story characters" on public.story_characters;
create policy "Users insert own story characters"
  on public.story_characters for insert
  with check (
    exists (
      select 1 from public.stories s
      where s.id = story_characters.story_id and s.user_id = auth.uid()
    )
  );

drop policy if exists "Users delete own story characters" on public.story_characters;
create policy "Users delete own story characters"
  on public.story_characters for delete
  using (
    exists (
      select 1 from public.stories s
      where s.id = story_characters.story_id and s.user_id = auth.uid()
    )
  );

-- Public read when story + world are public
drop policy if exists "Public story characters are viewable" on public.story_characters;
create policy "Public story characters are viewable"
  on public.story_characters for select
  using (
    exists (
      select 1
      from public.stories s
      inner join public.worlds w on w.id = s.world_id
      where s.id = story_characters.story_id
        and w.is_public = true
    )
  );

grant select on public.stories to anon;
grant select, insert, update, delete on public.stories to authenticated;
grant select, insert, update, delete on public.stories to service_role;

grant select on public.story_characters to anon;
grant select, insert, update, delete on public.story_characters to authenticated;
grant select, insert, update, delete on public.story_characters to service_role;

notify pgrst, 'reload schema';
