-- Project Type v1: capture creator intent on stories
-- No workflow branching — display and storage only.

alter table public.stories
  add column if not exists project_type text not null default 'novel'
    check (project_type in (
      'novel',
      'graphic_novel',
      'film_animation',
      'childrens_book',
      'other'
    ));

create index if not exists stories_project_type_idx
  on public.stories (project_type);

notify pgrst, 'reload schema';
