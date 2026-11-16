begin;

-- All active members can use operational modules regardless of position or division.
-- Account administration and privileged trash management remain separately enforced.
create or replace function public.portal_can(action text) returns boolean
language sql stable security definer set search_path='' as $$
 select exists(select 1 from public.profiles p where p.id=auth.uid() and p.is_active and (
  action in ('view','consent_write','assistant','consultation_create','consultation_full','announcement_write','medical_write','fire_write')
  or p.access_role='Superadmin'
 ))
$$;

create or replace function public.can_approve_consultation(consultation_id uuid) returns boolean
language sql stable security definer set search_path='' as $$
 select public.portal_can('consultation_full') and exists(
  select 1 from public.consultations c where c.id=consultation_id and c.deleted_at is null
 )
$$;

commit;
