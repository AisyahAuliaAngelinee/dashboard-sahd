begin;
create function public.can_write_plastic() returns boolean language sql stable security definer set search_path='' as $$select exists(select 1 from public.profiles p where p.id=auth.uid() and p.is_active and coalesce(p.job_title,'')<>'Trainee')$$;
revoke all on function public.can_write_plastic() from public,anon;grant execute on function public.can_write_plastic() to authenticated;
create table public.plastic_reports(id uuid primary key default gen_random_uuid(),title text not null,draft jsonb not null,report_text text not null,created_by uuid not null references public.profiles(id),created_by_name text not null,created_at timestamptz not null default now(),updated_at timestamptz not null default now(),deleted_at timestamptz,deleted_by uuid references public.profiles(id),purge_after timestamptz);
alter table public.plastic_reports enable row level security;
revoke all on public.plastic_reports from anon,authenticated;
grant select,insert on public.plastic_reports to authenticated;
grant update(title,draft,report_text,updated_at) on public.plastic_reports to authenticated;
create policy plastic_read on public.plastic_reports for select to authenticated using(public.is_active_member() and (deleted_at is null or created_by=auth.uid() or public.is_portal_superadmin()));
create policy plastic_insert on public.plastic_reports for insert to authenticated with check(public.is_active_member() and public.can_write_plastic() and created_by=auth.uid());
create policy plastic_update on public.plastic_reports for update to authenticated using(public.is_active_member() and public.can_write_plastic() and deleted_at is null) with check(public.is_active_member() and public.can_write_plastic());
create function public.trash_plastic_reports(report_ids uuid[]) returns void language plpgsql security definer set search_path='' as $$begin
if not public.is_active_member() or not public.can_write_plastic() or report_ids is null or cardinality(report_ids) not between 1 and 1000 or (select count(distinct x) from unnest(report_ids) x)<>cardinality(report_ids) then raise exception 'Forbidden';end if;
perform id from public.plastic_reports where id=any(report_ids) order by id for update;
if (select count(*) from public.plastic_reports where id=any(report_ids) and deleted_at is null)<>cardinality(report_ids) then raise exception 'Unavailable selection';end if;
update public.plastic_reports set deleted_at=now(),deleted_by=auth.uid(),purge_after=now()+interval '30 days',updated_at=now() where id=any(report_ids);end;$$;
revoke all on function public.trash_plastic_reports(uuid[]) from public,anon;grant execute on function public.trash_plastic_reports(uuid[]) to authenticated;
do $$declare definition text;begin
select pg_get_functiondef('public.list_trash()'::regprocedure) into definition;
definition=replace(definition,'union all select r.id,''fire_report''','union all select p.id,''plastic_report'',p.title,p.created_by,p.created_by_name,p.deleted_at,coalesce(p.purge_after,p.deleted_at+interval ''30 days'') from public.plastic_reports p where p.deleted_at is not null union all select r.id,''fire_report''');execute definition;
select pg_get_functiondef('public.manage_trash(text,jsonb)'::regprocedure) into definition;
definition=replace(definition,'when ''fire_report'' then ''fire_reports''','when ''plastic_report'' then ''plastic_reports'' when ''fire_report'' then ''fire_reports''');execute definition;
select pg_get_functiondef('public.purge_expired_trash()'::regprocedure) into definition;
definition=regexp_replace(definition,'\mBEGIN\M','BEGIN DELETE FROM public.plastic_reports WHERE deleted_at IS NOT NULL AND coalesce(purge_after,deleted_at+interval ''30 days'')<=now();','i');execute definition;
end$$;
create index plastic_created on public.plastic_reports(created_at desc) where deleted_at is null;
create index plastic_trash on public.plastic_reports(purge_after) where deleted_at is not null;
commit;
