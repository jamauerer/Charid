-- Project UX Phase A: work_intent on projects (creator-facing work type)

alter table public.projects
  add column if not exists work_intent text
  check (
    work_intent is null
    or work_intent in (
      'comic',
      'novel',
      'picture_book',
      'screenplay',
      'worldbuilding',
      'exploring'
    )
  );

comment on column public.projects.work_intent is
  'Creator intent at project creation (comic, novel, etc.). Distinct from stories.project_type.';

notify pgrst, 'reload schema';
