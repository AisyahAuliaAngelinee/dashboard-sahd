begin;

-- Position does not gate report access; report writing still follows division.
create or replace function public.portal_can(action text) returns boolean
language sql stable security definer set search_path='' as $$
 select exists(select 1 from public.profiles p where p.id=auth.uid() and p.is_active and case
 when action='medical_write' then p.division='Medical Service'
 when action='fire_write' then p.division='Fire Department'
 when p.access_role='Superadmin' then true
 when action in ('view','consent_write','assistant','consultation_create','consultation_full','announcement_write') then true
 else false end)
$$;

create or replace function public.can_write_plastic() returns boolean
language sql stable security definer set search_path='' as $$
 select exists(select 1 from public.profiles p where p.id=auth.uid() and p.is_active)
$$;

commit;
