-- Expand character model: gender, age, location, backstory
-- Migrates existing physical_description data into backstory

alter table public.characters
  add column if not exists gender text,
  add column if not exists age text,
  add column if not exists location text,
  add column if not exists backstory text;

update public.characters
set backstory = physical_description
where backstory is null
  and physical_description is not null
  and physical_description <> '';

alter table public.characters
  drop column if exists physical_description;

notify pgrst, 'reload schema';
