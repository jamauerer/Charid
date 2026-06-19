-- Project Stage 1: universe container + story ↔ world N:M junction
-- Keeps stories.world_id during transition (dual-model support).

-- ---------------------------------------------------------------------------
-- projects — named creative universes (Dragon Quest, Middle-earth, Marvel, …)
-- ---------------------------------------------------------------------------
create table if not exists public.projects (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  slug text not null,
  description text,
  cover_image_path text,
  is_default boolean not null default false,
  is_public boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, slug)
);

create index if not exists projects_user_id_idx on public.projects (user_id);
create index if not exists projects_user_default_idx
  on public.projects (user_id, is_default)
  where is_default = true;

-- ---------------------------------------------------------------------------
-- story_worlds — N:M Story ↔ World (primary world mirrors stories.world_id)
-- ---------------------------------------------------------------------------
create table if not exists public.story_worlds (
  story_id uuid not null references public.stories(id) on delete cascade,
  world_id uuid not null references public.worlds(id) on delete cascade,
  role text not null default 'primary'
    check (role in ('primary', 'secondary', 'visited', 'parallel')),
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  primary key (story_id, world_id)
);

create index if not exists story_worlds_world_id_idx on public.story_worlds (world_id);
create index if not exists story_worlds_story_role_idx
  on public.story_worlds (story_id, role);

-- ---------------------------------------------------------------------------
-- Scope columns — nullable during transition; backfilled below
-- ---------------------------------------------------------------------------
alter table public.stories
  add column if not exists project_id uuid references public.projects(id) on delete set null;

alter table public.worlds
  add column if not exists project_id uuid references public.projects(id) on delete set null;

alter table public.characters
  add column if not exists project_id uuid references public.projects(id) on delete set null;

alter table public.character_relationships
  add column if not exists project_id uuid references public.projects(id) on delete set null;

create index if not exists stories_project_id_idx on public.stories (project_id);
create index if not exists worlds_project_id_idx on public.worlds (project_id);
create index if not exists characters_project_id_idx on public.characters (project_id);
create index if not exists character_relationships_project_idx
  on public.character_relationships (project_id);

-- ---------------------------------------------------------------------------
-- Backfill: one default personal project per user with existing content
-- ---------------------------------------------------------------------------
insert into public.projects (user_id, title, slug, is_default)
select distinct u.user_id, 'My Universe', 'my-universe', true
from (
  select user_id from public.stories
  union
  select user_id from public.worlds
  union
  select user_id from public.characters
) u
where not exists (
  select 1 from public.projects p
  where p.user_id = u.user_id and p.is_default = true
);

update public.stories s
set project_id = p.id
from public.projects p
where s.project_id is null
  and p.user_id = s.user_id
  and p.is_default = true;

update public.worlds w
set project_id = p.id
from public.projects p
where w.project_id is null
  and p.user_id = w.user_id
  and p.is_default = true;

update public.characters c
set project_id = p.id
from public.projects p
where c.project_id is null
  and p.user_id = c.user_id
  and p.is_default = true;

insert into public.story_worlds (story_id, world_id, role, sort_order)
select s.id, s.world_id, 'primary', 0
from public.stories s
on conflict (story_id, world_id) do nothing;

update public.character_relationships cr
set project_id = c.project_id
from public.characters c
where cr.project_id is null
  and c.id = cr.from_character_id
  and c.project_id is not null;

-- ---------------------------------------------------------------------------
-- RLS — projects
-- ---------------------------------------------------------------------------
alter table public.projects enable row level security;

drop policy if exists "Users read own projects" on public.projects;
create policy "Users read own projects"
  on public.projects for select
  using (auth.uid() = user_id);

drop policy if exists "Users insert own projects" on public.projects;
create policy "Users insert own projects"
  on public.projects for insert
  with check (auth.uid() = user_id);

drop policy if exists "Users update own projects" on public.projects;
create policy "Users update own projects"
  on public.projects for update
  using (auth.uid() = user_id);

drop policy if exists "Users delete own projects" on public.projects;
create policy "Users delete own projects"
  on public.projects for delete
  using (auth.uid() = user_id);

drop policy if exists "Public projects are viewable" on public.projects;
create policy "Public projects are viewable"
  on public.projects for select
  using (is_public = true);

-- ---------------------------------------------------------------------------
-- RLS — story_worlds (owner via story; public via story + world)
-- ---------------------------------------------------------------------------
alter table public.story_worlds enable row level security;

drop policy if exists "Users manage own story worlds" on public.story_worlds;
create policy "Users manage own story worlds"
  on public.story_worlds for all
  using (
    exists (
      select 1 from public.stories s
      where s.id = story_worlds.story_id and s.user_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1 from public.stories s
      where s.id = story_worlds.story_id and s.user_id = auth.uid()
    )
  );

drop policy if exists "Public story worlds are viewable" on public.story_worlds;
create policy "Public story worlds are viewable"
  on public.story_worlds for select
  using (
    exists (
      select 1
      from public.stories s
      inner join public.worlds w on w.id = story_worlds.world_id
      where s.id = story_worlds.story_id
        and w.is_public = true
    )
  );

grant select on public.projects to anon;
grant select, insert, update, delete on public.projects to authenticated;
grant select, insert, update, delete on public.projects to service_role;

grant select on public.story_worlds to anon;
grant select, insert, update, delete on public.story_worlds to authenticated;
grant select, insert, update, delete on public.story_worlds to service_role;

notify pgrst, 'reload schema';
