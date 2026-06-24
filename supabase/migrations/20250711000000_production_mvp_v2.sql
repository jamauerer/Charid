-- Production MVP v2: format-specific production structures (CRUD + reorder only)
-- Novel: parts → chapters | Comic: issues → pages → panels | Storybook: settings + spreads
-- Screenplay: acts → beats | No scene mapping, no compile/export tables

-- ---------------------------------------------------------------------------
-- Novel
-- ---------------------------------------------------------------------------
create table if not exists public.novel_parts (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  name text not null,
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

create index if not exists novel_parts_project_sort_idx
  on public.novel_parts (project_id, sort_order);

create table if not exists public.novel_chapters (
  id uuid primary key default gen_random_uuid(),
  part_id uuid not null references public.novel_parts(id) on delete cascade,
  name text not null,
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

create index if not exists novel_chapters_part_sort_idx
  on public.novel_chapters (part_id, sort_order);

-- ---------------------------------------------------------------------------
-- Graphic novel
-- ---------------------------------------------------------------------------
create table if not exists public.comic_issues (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  name text not null,
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

create index if not exists comic_issues_project_sort_idx
  on public.comic_issues (project_id, sort_order);

create table if not exists public.comic_pages (
  id uuid primary key default gen_random_uuid(),
  issue_id uuid not null references public.comic_issues(id) on delete cascade,
  name text not null,
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

create index if not exists comic_pages_issue_sort_idx
  on public.comic_pages (issue_id, sort_order);

create table if not exists public.comic_panels (
  id uuid primary key default gen_random_uuid(),
  page_id uuid not null references public.comic_pages(id) on delete cascade,
  name text not null,
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

create index if not exists comic_panels_page_sort_idx
  on public.comic_panels (page_id, sort_order);

create table if not exists public.comic_art_direction (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  art_style text not null default '',
  notes text not null default '',
  created_at timestamptz not null default now(),
  unique (project_id)
);

-- ---------------------------------------------------------------------------
-- Children's storybook
-- ---------------------------------------------------------------------------
create table if not exists public.storybook_settings (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  age_range text not null default '',
  reading_level text not null default '',
  educational_goals text not null default '',
  created_at timestamptz not null default now(),
  unique (project_id)
);

create table if not exists public.storybook_spreads (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  name text not null,
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

create index if not exists storybook_spreads_project_sort_idx
  on public.storybook_spreads (project_id, sort_order);

-- ---------------------------------------------------------------------------
-- Screenplay
-- ---------------------------------------------------------------------------
create table if not exists public.screenplay_acts (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  name text not null,
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

create index if not exists screenplay_acts_project_sort_idx
  on public.screenplay_acts (project_id, sort_order);

create table if not exists public.screenplay_beats (
  id uuid primary key default gen_random_uuid(),
  act_id uuid not null references public.screenplay_acts(id) on delete cascade,
  name text not null,
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

create index if not exists screenplay_beats_act_sort_idx
  on public.screenplay_beats (act_id, sort_order);

-- ---------------------------------------------------------------------------
-- RLS — project-scoped roots
-- ---------------------------------------------------------------------------
alter table public.novel_parts enable row level security;
alter table public.comic_issues enable row level security;
alter table public.comic_art_direction enable row level security;
alter table public.storybook_settings enable row level security;
alter table public.storybook_spreads enable row level security;
alter table public.screenplay_acts enable row level security;

drop policy if exists "Users manage own novel parts" on public.novel_parts;
create policy "Users manage own novel parts"
  on public.novel_parts for all
  using (
    exists (
      select 1 from public.projects p
      where p.id = novel_parts.project_id and p.user_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1 from public.projects p
      where p.id = novel_parts.project_id and p.user_id = auth.uid()
    )
  );

drop policy if exists "Users manage own comic issues" on public.comic_issues;
create policy "Users manage own comic issues"
  on public.comic_issues for all
  using (
    exists (
      select 1 from public.projects p
      where p.id = comic_issues.project_id and p.user_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1 from public.projects p
      where p.id = comic_issues.project_id and p.user_id = auth.uid()
    )
  );

drop policy if exists "Users manage own comic art direction" on public.comic_art_direction;
create policy "Users manage own comic art direction"
  on public.comic_art_direction for all
  using (
    exists (
      select 1 from public.projects p
      where p.id = comic_art_direction.project_id and p.user_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1 from public.projects p
      where p.id = comic_art_direction.project_id and p.user_id = auth.uid()
    )
  );

drop policy if exists "Users manage own storybook settings" on public.storybook_settings;
create policy "Users manage own storybook settings"
  on public.storybook_settings for all
  using (
    exists (
      select 1 from public.projects p
      where p.id = storybook_settings.project_id and p.user_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1 from public.projects p
      where p.id = storybook_settings.project_id and p.user_id = auth.uid()
    )
  );

drop policy if exists "Users manage own storybook spreads" on public.storybook_spreads;
create policy "Users manage own storybook spreads"
  on public.storybook_spreads for all
  using (
    exists (
      select 1 from public.projects p
      where p.id = storybook_spreads.project_id and p.user_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1 from public.projects p
      where p.id = storybook_spreads.project_id and p.user_id = auth.uid()
    )
  );

drop policy if exists "Users manage own screenplay acts" on public.screenplay_acts;
create policy "Users manage own screenplay acts"
  on public.screenplay_acts for all
  using (
    exists (
      select 1 from public.projects p
      where p.id = screenplay_acts.project_id and p.user_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1 from public.projects p
      where p.id = screenplay_acts.project_id and p.user_id = auth.uid()
    )
  );

-- ---------------------------------------------------------------------------
-- RLS — nested entities
-- ---------------------------------------------------------------------------
alter table public.novel_chapters enable row level security;
alter table public.comic_pages enable row level security;
alter table public.comic_panels enable row level security;
alter table public.screenplay_beats enable row level security;

drop policy if exists "Users manage own novel chapters" on public.novel_chapters;
create policy "Users manage own novel chapters"
  on public.novel_chapters for all
  using (
    exists (
      select 1
      from public.novel_parts np
      inner join public.projects p on p.id = np.project_id
      where np.id = novel_chapters.part_id and p.user_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1
      from public.novel_parts np
      inner join public.projects p on p.id = np.project_id
      where np.id = novel_chapters.part_id and p.user_id = auth.uid()
    )
  );

drop policy if exists "Users manage own comic pages" on public.comic_pages;
create policy "Users manage own comic pages"
  on public.comic_pages for all
  using (
    exists (
      select 1
      from public.comic_issues ci
      inner join public.projects p on p.id = ci.project_id
      where ci.id = comic_pages.issue_id and p.user_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1
      from public.comic_issues ci
      inner join public.projects p on p.id = ci.project_id
      where ci.id = comic_pages.issue_id and p.user_id = auth.uid()
    )
  );

drop policy if exists "Users manage own comic panels" on public.comic_panels;
create policy "Users manage own comic panels"
  on public.comic_panels for all
  using (
    exists (
      select 1
      from public.comic_pages cp
      inner join public.comic_issues ci on ci.id = cp.issue_id
      inner join public.projects p on p.id = ci.project_id
      where cp.id = comic_panels.page_id and p.user_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1
      from public.comic_pages cp
      inner join public.comic_issues ci on ci.id = cp.issue_id
      inner join public.projects p on p.id = ci.project_id
      where cp.id = comic_panels.page_id and p.user_id = auth.uid()
    )
  );

drop policy if exists "Users manage own screenplay beats" on public.screenplay_beats;
create policy "Users manage own screenplay beats"
  on public.screenplay_beats for all
  using (
    exists (
      select 1
      from public.screenplay_acts sa
      inner join public.projects p on p.id = sa.project_id
      where sa.id = screenplay_beats.act_id and p.user_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1
      from public.screenplay_acts sa
      inner join public.projects p on p.id = sa.project_id
      where sa.id = screenplay_beats.act_id and p.user_id = auth.uid()
    )
  );

-- ---------------------------------------------------------------------------
-- Grants
-- ---------------------------------------------------------------------------
grant select, insert, update, delete on public.novel_parts to authenticated;
grant select, insert, update, delete on public.novel_chapters to authenticated;
grant select, insert, update, delete on public.comic_issues to authenticated;
grant select, insert, update, delete on public.comic_pages to authenticated;
grant select, insert, update, delete on public.comic_panels to authenticated;
grant select, insert, update, delete on public.comic_art_direction to authenticated;
grant select, insert, update, delete on public.storybook_settings to authenticated;
grant select, insert, update, delete on public.storybook_spreads to authenticated;
grant select, insert, update, delete on public.screenplay_acts to authenticated;
grant select, insert, update, delete on public.screenplay_beats to authenticated;

grant select, insert, update, delete on public.novel_parts to service_role;
grant select, insert, update, delete on public.novel_chapters to service_role;
grant select, insert, update, delete on public.comic_issues to service_role;
grant select, insert, update, delete on public.comic_pages to service_role;
grant select, insert, update, delete on public.comic_panels to service_role;
grant select, insert, update, delete on public.comic_art_direction to service_role;
grant select, insert, update, delete on public.storybook_settings to service_role;
grant select, insert, update, delete on public.storybook_spreads to service_role;
grant select, insert, update, delete on public.screenplay_acts to service_role;
grant select, insert, update, delete on public.screenplay_beats to service_role;

notify pgrst, 'reload schema';
