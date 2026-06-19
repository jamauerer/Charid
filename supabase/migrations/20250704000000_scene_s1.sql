-- Scene S1: atomic narrative moments under stories
-- Authority: SCENE_ARCHITECTURE_V2 · SCENE_IMPLEMENTATION_DIRECTIVES

create table if not exists public.scenes (
  id uuid primary key default gen_random_uuid(),
  story_id uuid not null references public.stories(id) on delete cascade,
  project_id uuid references public.projects(id) on delete set null,
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  slug text not null,
  summary text not null default '',
  location_label text,
  world_location_id uuid references public.world_locations(id) on delete set null,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (story_id, slug)
);

create index if not exists scenes_story_sort_idx
  on public.scenes (story_id, sort_order);

create index if not exists scenes_project_idx
  on public.scenes (project_id);

create index if not exists scenes_user_idx
  on public.scenes (user_id);

-- ---------------------------------------------------------------------------
-- scene_characters — cast present in this moment
-- ---------------------------------------------------------------------------
create table if not exists public.scene_characters (
  scene_id uuid not null references public.scenes(id) on delete cascade,
  character_id uuid not null references public.characters(id) on delete cascade,
  sort_order integer not null default 0,
  primary key (scene_id, character_id)
);

create index if not exists scene_characters_character_idx
  on public.scene_characters (character_id);

-- ---------------------------------------------------------------------------
-- RLS — scenes (owner via story)
-- ---------------------------------------------------------------------------
alter table public.scenes enable row level security;

drop policy if exists "Users manage own scenes" on public.scenes;
create policy "Users manage own scenes"
  on public.scenes for all
  using (
    exists (
      select 1 from public.stories s
      where s.id = scenes.story_id and s.user_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1 from public.stories s
      where s.id = scenes.story_id and s.user_id = auth.uid()
    )
  );

drop policy if exists "Public scenes are viewable" on public.scenes;
create policy "Public scenes are viewable"
  on public.scenes for select
  using (
    exists (
      select 1
      from public.stories s
      inner join public.worlds w on w.id = s.world_id
      where s.id = scenes.story_id and w.is_public = true
    )
  );

-- ---------------------------------------------------------------------------
-- RLS — scene_characters (owner via scene → story)
-- ---------------------------------------------------------------------------
alter table public.scene_characters enable row level security;

drop policy if exists "Users manage own scene characters" on public.scene_characters;
create policy "Users manage own scene characters"
  on public.scene_characters for all
  using (
    exists (
      select 1
      from public.scenes sc
      inner join public.stories s on s.id = sc.story_id
      where sc.id = scene_characters.scene_id and s.user_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1
      from public.scenes sc
      inner join public.stories s on s.id = sc.story_id
      where sc.id = scene_characters.scene_id and s.user_id = auth.uid()
    )
  );

drop policy if exists "Public scene characters are viewable" on public.scene_characters;
create policy "Public scene characters are viewable"
  on public.scene_characters for select
  using (
    exists (
      select 1
      from public.scenes sc
      inner join public.stories s on s.id = sc.story_id
      inner join public.worlds w on w.id = s.world_id
      where sc.id = scene_characters.scene_id and w.is_public = true
    )
  );

grant select on public.scenes to anon;
grant select, insert, update, delete on public.scenes to authenticated;
grant select, insert, update, delete on public.scenes to service_role;

grant select on public.scene_characters to anon;
grant select, insert, update, delete on public.scene_characters to authenticated;
grant select, insert, update, delete on public.scene_characters to service_role;

notify pgrst, 'reload schema';
