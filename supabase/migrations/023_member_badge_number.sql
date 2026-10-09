begin;
alter table public.profiles add column badge_number text default null check (badge_number is null or badge_number ~ '^[A-Za-z0-9-]{1,20}$');
grant update(badge_number) on public.profiles to authenticated;
create or replace view public.member_directory with(security_invoker=true) as select id,display_name,role,division,avatar_path,providers,job_title,teams,access_role,badge_number from public.profiles where is_active;
commit;
