-- Run after 20250629000000_founder_admin_role.sql

grant select on public.v_founder_platform_overview to service_role;
grant select on public.v_founder_creator_activity to service_role;
grant select on public.v_founder_content_metrics to service_role;
grant select on public.v_founder_asset_counts to service_role;

notify pgrst, 'reload schema';
