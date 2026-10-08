-- Run after 002_medical_reports.sql.
alter table public.medical_reports add column if not exists title text not null default '';
alter table public.medical_reports add column if not exists payment_status text not null default 'unpaid' check(payment_status in ('paid','unpaid'));
alter table public.medical_reports add column if not exists created_by_name text not null default '';
alter table public.medical_reports add column if not exists deleted_at timestamptz;
alter table public.medical_reports add column if not exists deleted_by uuid references public.profiles(id);
alter table public.medical_reports add column if not exists purge_after timestamptz;
update public.medical_reports r set title=coalesce(nullif(r.draft->'fields'->>'Patient Name',''),r.case_title),created_by_name=coalesce((select p.display_name from public.profiles p where p.id=r.created_by),'Member') where title='';
grant update(title,payment_status) on public.medical_reports to authenticated;
drop policy medical_report_update on public.medical_reports;
create policy medical_report_update on public.medical_reports for update to authenticated using(created_by=auth.uid() and deleted_at is null and public.can_read_division('Medical Service')) with check(created_by=auth.uid() and deleted_at is null and public.can_read_division('Medical Service'));
create function public.trash_medical_reports(report_ids uuid[]) returns void language plpgsql security definer set search_path='' as $$
begin
 if auth.uid() is null or not public.can_read_division('Medical Service') then raise exception 'Forbidden';end if;
 if cardinality(report_ids)<1 or cardinality(report_ids)>1000 then raise exception 'Invalid selection';end if;
 perform id from public.medical_reports where id=any(report_ids) for update;
 if (select count(*) from public.medical_reports where id=any(report_ids) and created_by=auth.uid() and deleted_at is null)<>cardinality(report_ids) then raise exception 'Invalid selection or ownership';end if;
 update public.medical_reports set deleted_at=now(),deleted_by=auth.uid(),purge_after=now()+interval '30 days',updated_at=now() where id=any(report_ids);
end;$$;
revoke all on function public.trash_medical_reports(uuid[]) from public,anon;
grant execute on function public.trash_medical_reports(uuid[]) to authenticated;
create index if not exists medical_reports_active on public.medical_reports(created_at desc) where deleted_at is null;
