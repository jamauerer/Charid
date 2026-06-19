-- Creative proposal staging — shared approval architecture for AI suggestions
-- Authority: COLLABORATIVE_CREATION_PRINCIPLE · AI_CREATION_CONTROL_PRINCIPLE
-- S2: scene_suggestion kind. Future: chapter, character, location, cover, comic_page

create table if not exists public.creative_proposal_batches (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  proposal_kind text not null,
  story_id uuid references public.stories(id) on delete cascade,
  world_id uuid references public.worlds(id) on delete set null,
  scene_id uuid references public.scenes(id) on delete set null,
  chapter_id uuid references public.chapters(id) on delete set null,
  status text not null default 'active',
  items jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint creative_proposal_batches_kind_check check (
    proposal_kind in (
      'scene_suggestion',
      'chapter_suggestion',
      'character_suggestion',
      'location_suggestion',
      'cover_suggestion',
      'comic_page_suggestion'
    )
  ),
  constraint creative_proposal_batches_status_check check (
    status in ('active', 'dismissed')
  )
);

create index if not exists creative_proposal_batches_story_kind_idx
  on public.creative_proposal_batches (story_id, proposal_kind, status);

create index if not exists creative_proposal_batches_user_idx
  on public.creative_proposal_batches (user_id);

alter table public.creative_proposal_batches enable row level security;

drop policy if exists "Users manage own creative proposal batches" on public.creative_proposal_batches;
create policy "Users manage own creative proposal batches"
  on public.creative_proposal_batches for all
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

grant select, insert, update, delete on public.creative_proposal_batches to authenticated;
grant select, insert, update, delete on public.creative_proposal_batches to service_role;

comment on table public.creative_proposal_batches is
  'Staging buffer for AI/guided proposals. Nothing commits to canon until explicit Approve.';

notify pgrst, 'reload schema';
