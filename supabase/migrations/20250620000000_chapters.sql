-- Chapters v1: plain-text chapters inside stories
-- NOT a full writing platform — no rich text, AI, collaboration, or version history.
--
-- Future tables can attach to chapters(id):
--   chapter_media, chapter_blocks, chapter_revisions, chapter_ai_sessions

create table if not exists public.chapters (
  id uuid primary key default gen_random_uuid(),
  story_id uuid not null references public.stories(id) on delete cascade,
  title text not null,
  content text not null default '',
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

create index if not exists chapters_story_id_idx
  on public.chapters (story_id);

create index if not exists chapters_story_sort_idx
  on public.chapters (story_id, sort_order);

alter table public.chapters enable row level security;

-- Owner CRUD via story ownership
drop policy if exists "Users read own chapters" on public.chapters;
create policy "Users read own chapters"
  on public.chapters for select
  using (
    exists (
      select 1 from public.stories s
      where s.id = chapters.story_id and s.user_id = auth.uid()
    )
  );

drop policy if exists "Users insert own chapters" on public.chapters;
create policy "Users insert own chapters"
  on public.chapters for insert
  with check (
    exists (
      select 1 from public.stories s
      where s.id = chapters.story_id and s.user_id = auth.uid()
    )
  );

drop policy if exists "Users update own chapters" on public.chapters;
create policy "Users update own chapters"
  on public.chapters for update
  using (
    exists (
      select 1 from public.stories s
      where s.id = chapters.story_id and s.user_id = auth.uid()
    )
  );

drop policy if exists "Users delete own chapters" on public.chapters;
create policy "Users delete own chapters"
  on public.chapters for delete
  using (
    exists (
      select 1 from public.stories s
      where s.id = chapters.story_id and s.user_id = auth.uid()
    )
  );

-- Public read when parent story's world is public
drop policy if exists "Public chapters are viewable" on public.chapters;
create policy "Public chapters are viewable"
  on public.chapters for select
  using (
    exists (
      select 1
      from public.stories s
      inner join public.worlds w on w.id = s.world_id
      where s.id = chapters.story_id
        and w.is_public = true
    )
  );

grant select on public.chapters to anon;
grant select, insert, update, delete on public.chapters to authenticated;
grant select, insert, update, delete on public.chapters to service_role;

notify pgrst, 'reload schema';
