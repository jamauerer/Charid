-- Production Canvas Phase 1: surfaces + document version history
-- Infrastructure only — no editor UI

-- ---------------------------------------------------------------------------
-- production_surfaces — shared canvas document owner (all surface kinds)
-- ---------------------------------------------------------------------------
create table if not exists public.production_surfaces (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  surface_kind text not null check (
    surface_kind in (
      'comic_panel',
      'storybook_spread',
      'comic_page_layout',
      'character_sheet',
      'lore_page',
      'worksheet',
      'portfolio_page',
      'marketing_page'
    )
  ),
  config_profile jsonb not null default '{}'::jsonb,
  width integer not null check (width > 0),
  height integer not null check (height > 0),
  canvas_document jsonb not null default '{}'::jsonb,
  canvas_document_version integer not null default 1 check (canvas_document_version >= 1),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists production_surfaces_project_kind_idx
  on public.production_surfaces (project_id, surface_kind);

create index if not exists production_surfaces_project_updated_idx
  on public.production_surfaces (project_id, updated_at desc);

-- ---------------------------------------------------------------------------
-- canvas_document_versions — immutable snapshots for undo / compile / AI audit
-- ---------------------------------------------------------------------------
create table if not exists public.canvas_document_versions (
  id uuid primary key default gen_random_uuid(),
  surface_id uuid not null references public.production_surfaces(id) on delete cascade,
  project_id uuid not null references public.projects(id) on delete cascade,
  schema_version integer not null check (schema_version >= 1),
  document_snapshot jsonb not null,
  revision_label text,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now()
);

create index if not exists canvas_document_versions_surface_created_idx
  on public.canvas_document_versions (surface_id, created_at desc);

create index if not exists canvas_document_versions_project_created_idx
  on public.canvas_document_versions (project_id, created_at desc);

-- ---------------------------------------------------------------------------
-- updated_at trigger for production_surfaces
-- ---------------------------------------------------------------------------
create or replace function public.set_production_surfaces_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists production_surfaces_updated_at on public.production_surfaces;
create trigger production_surfaces_updated_at
  before update on public.production_surfaces
  for each row
  execute function public.set_production_surfaces_updated_at();

-- ---------------------------------------------------------------------------
-- RLS — production_surfaces
-- ---------------------------------------------------------------------------
alter table public.production_surfaces enable row level security;

drop policy if exists "Users manage own production surfaces" on public.production_surfaces;
create policy "Users manage own production surfaces"
  on public.production_surfaces for all
  using (
    exists (
      select 1 from public.projects p
      where p.id = production_surfaces.project_id and p.user_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1 from public.projects p
      where p.id = production_surfaces.project_id and p.user_id = auth.uid()
    )
  );

-- ---------------------------------------------------------------------------
-- RLS — canvas_document_versions
-- ---------------------------------------------------------------------------
alter table public.canvas_document_versions enable row level security;

drop policy if exists "Users manage own canvas document versions" on public.canvas_document_versions;
create policy "Users manage own canvas document versions"
  on public.canvas_document_versions for all
  using (
    exists (
      select 1 from public.projects p
      where p.id = canvas_document_versions.project_id and p.user_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1 from public.projects p
      where p.id = canvas_document_versions.project_id and p.user_id = auth.uid()
    )
  );

-- ---------------------------------------------------------------------------
-- Grants
-- ---------------------------------------------------------------------------
grant select, insert, update, delete on public.production_surfaces to authenticated;
grant select, insert, update, delete on public.canvas_document_versions to authenticated;
grant select, insert, update, delete on public.production_surfaces to service_role;
grant select, insert, update, delete on public.canvas_document_versions to service_role;

notify pgrst, 'reload schema';
