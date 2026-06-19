-- Story Bible Foundation V1: canon state + slot assignments for story assets

create table if not exists public.story_bible (
  story_id uuid primary key references public.stories(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  summary text,
  themes text,
  tone text,
  timeline text,
  major_events text,
  key_characters text,
  key_locations text,
  notes text,
  version_label text not null default 'Current',
  is_current boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists story_bible_user_id_idx on public.story_bible (user_id);

alter table public.story_bible enable row level security;

drop policy if exists "Users read own story bible" on public.story_bible;
create policy "Users read own story bible"
  on public.story_bible for select
  using (auth.uid() = user_id);

drop policy if exists "Users insert own story bible" on public.story_bible;
create policy "Users insert own story bible"
  on public.story_bible for insert
  with check (auth.uid() = user_id);

drop policy if exists "Users update own story bible" on public.story_bible;
create policy "Users update own story bible"
  on public.story_bible for update
  using (auth.uid() = user_id);

-- Story image slot assignments (assets → assign roles)
create table if not exists public.story_image_slot_assignments (
  id uuid primary key default gen_random_uuid(),
  story_id uuid not null references public.stories(id) on delete cascade,
  image_id uuid not null references public.story_images(id) on delete cascade,
  slot_role text not null,
  source text not null default 'assigned'
    check (source in ('uploaded', 'generated', 'assigned')),
  created_at timestamptz not null default now(),
  unique (story_id, slot_role),
  unique (story_id, image_id, slot_role)
);

create index if not exists story_image_slot_assignments_story_id_idx
  on public.story_image_slot_assignments (story_id);

create index if not exists story_image_slot_assignments_image_id_idx
  on public.story_image_slot_assignments (image_id);

alter table public.story_image_slot_assignments enable row level security;

drop policy if exists "Users read own story slot assignments" on public.story_image_slot_assignments;
create policy "Users read own story slot assignments"
  on public.story_image_slot_assignments for select
  using (
    exists (
      select 1 from public.stories s
      where s.id = story_image_slot_assignments.story_id
        and s.user_id = auth.uid()
    )
  );

drop policy if exists "Users insert own story slot assignments" on public.story_image_slot_assignments;
create policy "Users insert own story slot assignments"
  on public.story_image_slot_assignments for insert
  with check (
    exists (
      select 1 from public.stories s
      where s.id = story_image_slot_assignments.story_id
        and s.user_id = auth.uid()
    )
  );

drop policy if exists "Users update own story slot assignments" on public.story_image_slot_assignments;
create policy "Users update own story slot assignments"
  on public.story_image_slot_assignments for update
  using (
    exists (
      select 1 from public.stories s
      where s.id = story_image_slot_assignments.story_id
        and s.user_id = auth.uid()
    )
  );

drop policy if exists "Users delete own story slot assignments" on public.story_image_slot_assignments;
create policy "Users delete own story slot assignments"
  on public.story_image_slot_assignments for delete
  using (
    exists (
      select 1 from public.stories s
      where s.id = story_image_slot_assignments.story_id
        and s.user_id = auth.uid()
    )
  );

-- Backfill story_bible rows for existing stories
insert into public.story_bible (story_id, user_id, summary)
select s.id, s.user_id, s.summary
from public.stories s
where not exists (
  select 1 from public.story_bible sb where sb.story_id = s.id
);
