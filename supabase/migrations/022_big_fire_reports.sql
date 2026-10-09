-- Big Fire document format, write access, and thirty-day Trash retention.
begin;
alter table public.fire_reports add column draft jsonb not null default '{}'::jsonb,
 add column report_text text not null default '',add column created_by_name text not null default '',
 add column updated_at timestamptz not null default now(),add column deleted_by uuid references public.profiles(id),add column purge_after timestamptz;
grant update(title,status,draft,report_text,updated_at) on public.fire_reports to authenticated;
update public.fire_reports r set created_by_name=p.display_name from public.profiles p where p.id=r.created_by;
create function public.trash_fire_reports(report_ids uuid[]) returns void language plpgsql security definer set search_path='' as $$
begin
 if not public.is_active_member() or not public.portal_can('fire_write') or report_ids is null or cardinality(report_ids) not between 1 and 1000 or (select count(distinct x) from unnest(report_ids) x)<>cardinality(report_ids) then raise exception 'Forbidden selection';end if;
 perform id from public.fire_reports where id=any(report_ids) order by id for update;
 if (select count(*) from public.fire_reports where id=any(report_ids) and deleted_at is null)<>cardinality(report_ids) then raise exception 'Forbidden selection';end if;
 update public.fire_reports set deleted_at=now(),deleted_by=auth.uid(),purge_after=now()+interval '30 days',updated_at=now() where id=any(report_ids);
end;$$;
revoke all on function public.trash_fire_reports(uuid[]) from public,anon;
grant execute on function public.trash_fire_reports(uuid[]) to authenticated;
create or replace function public.list_trash() returns table(id uuid,kind text,title text,created_by uuid,created_by_name text,deleted_at timestamptz,purge_after timestamptz) language sql stable security definer set search_path='' as $$
 select t.* from (
 select r.id,'medical_report',coalesce(r.title,r.case_title),r.created_by,r.created_by_name,r.deleted_at,coalesce(r.purge_after,r.deleted_at+interval '30 days') from public.medical_reports r where r.deleted_at is not null
 union all select r.id,'fire_report',r.title,r.created_by,r.created_by_name,r.deleted_at,coalesce(r.purge_after,r.deleted_at+interval '30 days') from public.fire_reports r where r.deleted_at is not null
 union all select c.id,'patient_consent',coalesce(c.data->>'patientName','Patient Consent'),c.created_by,c.created_by_name,c.deleted_at,coalesce(c.purge_after,c.deleted_at+interval '30 days') from public.patient_consents c where c.deleted_at is not null
 union all select c.id,'consultation',c.name,c.created_by,c.created_by_name,c.deleted_at,coalesce(c.purge_after,c.deleted_at+interval '30 days') from public.consultations c where c.deleted_at is not null
 union all select a.id,'announcement',a.title,a.created_by,a.created_by_name,a.deleted_at,coalesce(a.purge_after,a.deleted_at+interval '30 days') from public.announcements a where a.deleted_at is not null
 ) t where public.is_active_member() and (t.created_by=auth.uid() or public.is_portal_superadmin()) order by t.deleted_at desc;
$$;
-- Preserve existing permission and storage-cleanup changes in these functions.
do $$declare definition text;begin
 select pg_get_functiondef('public.manage_trash(text,jsonb)'::regprocedure) into definition;
 definition=replace(definition,'when ''medical_report'' then ''medical_reports''','when ''fire_report'' then ''fire_reports'' when ''medical_report'' then ''medical_reports''');
 execute definition;
 select pg_get_functiondef('public.purge_expired_trash()'::regprocedure) into definition;
 definition=regexp_replace(definition,'\mBEGIN\M','BEGIN DELETE FROM public.fire_reports WHERE deleted_at IS NOT NULL AND coalesce(purge_after,deleted_at+interval ''30 days'')<=now();','i');
 execute definition;
end$$;
create index fire_report_trash on public.fire_reports(purge_after) where deleted_at is not null;
commit;
