-- Project-scoped story ordering for creator-controlled display on project pages.

alter table public.stories
  add column if not exists project_sort_order integer not null default 0;

create index if not exists stories_project_sort_idx
  on public.stories (project_id, project_sort_order);

with ranked as (
  select
    id,
    row_number() over (
      partition by project_id
      order by created_at asc
    ) - 1 as ord
  from public.stories
  where project_id is not null
)
update public.stories s
set project_sort_order = ranked.ord
from ranked
where s.id = ranked.id;
