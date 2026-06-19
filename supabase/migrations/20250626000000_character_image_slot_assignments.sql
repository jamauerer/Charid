-- Flexible reference assignment: one image → many slots; slots reference gallery assets

create table if not exists public.character_image_slot_assignments (
  id uuid primary key default gen_random_uuid(),
  character_id uuid not null references public.characters(id) on delete cascade,
  image_id uuid not null references public.character_images(id) on delete cascade,
  slot_role text not null check (
    slot_role = 'canonical'
    or slot_role like 'turnaround_%'
    or slot_role like 'expression_%'
  ),
  source text not null default 'assigned' check (
    source in ('uploaded', 'generated', 'assigned')
  ),
  created_at timestamptz not null default now(),
  unique (character_id, slot_role)
);

create index if not exists character_image_slot_assignments_character_idx
  on public.character_image_slot_assignments (character_id);

create index if not exists character_image_slot_assignments_image_idx
  on public.character_image_slot_assignments (image_id);

alter table public.character_image_slot_assignments enable row level security;

drop policy if exists "Users read own slot assignments" on public.character_image_slot_assignments;
create policy "Users read own slot assignments"
  on public.character_image_slot_assignments for select
  using (
    exists (
      select 1 from public.characters c
      where c.id = character_image_slot_assignments.character_id
        and c.user_id = auth.uid()
    )
  );

drop policy if exists "Users insert own slot assignments" on public.character_image_slot_assignments;
create policy "Users insert own slot assignments"
  on public.character_image_slot_assignments for insert
  with check (
    exists (
      select 1 from public.characters c
      where c.id = character_image_slot_assignments.character_id
        and c.user_id = auth.uid()
    )
  );

drop policy if exists "Users update own slot assignments" on public.character_image_slot_assignments;
create policy "Users update own slot assignments"
  on public.character_image_slot_assignments for update
  using (
    exists (
      select 1 from public.characters c
      where c.id = character_image_slot_assignments.character_id
        and c.user_id = auth.uid()
    )
  );

drop policy if exists "Users delete own slot assignments" on public.character_image_slot_assignments;
create policy "Users delete own slot assignments"
  on public.character_image_slot_assignments for delete
  using (
    exists (
      select 1 from public.characters c
      where c.id = character_image_slot_assignments.character_id
        and c.user_id = auth.uid()
    )
  );

-- Backfill from legacy asset_role slot values
insert into public.character_image_slot_assignments (character_id, image_id, slot_role, source)
select
  ci.character_id,
  ci.id,
  ci.asset_role,
  'uploaded'
from public.character_images ci
where ci.asset_role = 'canonical'
   or ci.asset_role like 'turnaround_%'
   or ci.asset_role like 'expression_%'
on conflict (character_id, slot_role) do nothing;

-- Normalize legacy rows: keep slot in assignments, restore gallery role
update public.character_images
set asset_role = 'reference'
where asset_role = 'canonical'
   or asset_role like 'turnaround_%'
   or asset_role like 'expression_%';
