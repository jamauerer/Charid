-- Phase 1: workspace content defaults to private
-- Run manually in Supabase SQL Editor alongside fix-*-api.sql if needed.

alter table public.profiles
  alter column is_public set default false;

alter table public.characters
  alter column is_public set default false;

alter table public.worlds
  alter column is_public set default false;

-- Existing rows are unchanged. New inserts without is_public will be private.
