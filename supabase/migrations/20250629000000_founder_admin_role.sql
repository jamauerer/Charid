-- Founder admin role on profiles

alter table public.profiles
  add column if not exists role text not null default 'user'
  check (role in ('user', 'admin'));

create index if not exists profiles_role_idx on public.profiles (role);

-- ---------------------------------------------------------------------------
-- Extended founder analytics views
-- ---------------------------------------------------------------------------

create or replace view public.v_founder_platform_overview as
select
  (select count(*)::bigint from public.profiles) as total_users,
  (
    select count(*)::bigint from public.profiles
    where created_at >= now() - interval '7 days'
  ) as new_users_7d,
  (select count(*)::bigint from public.characters) as characters_created,
  (select count(*)::bigint from public.worlds) as worlds_created,
  (select count(*)::bigint from public.stories) as stories_created,
  (
    select count(*)::bigint from public.support_tickets
    where status = 'open'
  ) as support_tickets_open,
  (
    select round(avg(rating)::numeric, 2)
    from public.creator_feedback
    where entity_type = 'character'
      and feedback_type = 'vision_rating'
      and rating is not null
  ) as avg_character_rating;

create or replace view public.v_founder_creator_activity as
select
  (select count(distinct user_id)::bigint from public.characters) as users_with_characters,
  (select count(distinct user_id)::bigint from public.worlds) as users_with_worlds,
  (select count(distinct user_id)::bigint from public.stories) as users_with_stories,
  (
    select count(*)::bigint from public.profiles where is_public = true
  ) as users_with_public_portfolios;

create or replace view public.v_founder_content_metrics as
select
  (select count(*)::bigint from public.characters) as total_characters,
  (select count(*)::bigint from public.worlds) as total_worlds,
  (select count(*)::bigint from public.stories) as total_stories,
  (select count(*)::bigint from public.profiles) as total_portfolio_profiles,
  (select count(*)::bigint from public.characters where is_public = true) as public_characters,
  (select count(*)::bigint from public.characters where is_public = false) as private_characters,
  (select count(*)::bigint from public.worlds where is_public = true) as public_worlds,
  (select count(*)::bigint from public.worlds where is_public = false) as private_worlds,
  (select count(*)::bigint from public.profiles where is_public = true) as public_profiles,
  (select count(*)::bigint from public.profiles where is_public = false) as private_profiles,
  coalesce(
    (
      select round(avg(image_count)::numeric, 1)
      from (
        select count(*)::numeric as image_count
        from public.character_images
        group by character_id
      ) counts
    ),
    0
  ) as avg_assets_per_character,
  coalesce(
    (
      select round(avg(image_count)::numeric, 1)
      from (
        select count(*)::numeric as image_count
        from public.world_images
        group by world_id
      ) counts
    ),
    0
  ) as avg_assets_per_world;

create or replace view public.v_founder_asset_counts as
select
  (select count(*)::bigint from public.character_images) as character_images,
  (select count(*)::bigint from public.world_images) as world_images,
  (
    (select count(*)::bigint from public.character_images)
    + (select count(*)::bigint from public.world_images)
  ) as total_uploaded_assets;

grant select on public.v_founder_platform_overview to service_role;
grant select on public.v_founder_creator_activity to service_role;
grant select on public.v_founder_content_metrics to service_role;
grant select on public.v_founder_asset_counts to service_role;

notify pgrst, 'reload schema';
