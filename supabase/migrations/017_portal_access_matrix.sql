-- Apply after 016. View access crosses divisions; mutation access never follows view access.
begin;
create function public.portal_can(action text) returns boolean language sql stable security definer set search_path='' as $$
 select exists(select 1 from public.profiles p where p.id=auth.uid() and p.is_active and case
 when p.access_role='Superadmin' then true
 when action in ('view','consent_write','assistant','consultation_create') then true
 when action='announcement_write' then p.access_role='Admin'
 when action='consultation_full' then p.access_role='Admin' or (coalesce(p.job_title,'')<>'Trainee' and p.division in ('Medical Service','Fire Department'))
 when action='medical_write' then p.division='Medical Service' and (p.access_role='Admin' or coalesce(p.job_title,'')<>'Trainee')
 when action='fire_write' then p.division='Fire Department' and (p.access_role='Admin' or coalesce(p.job_title,'')<>'Trainee')
 else false end)
$$;
create function public.is_portal_superadmin() returns boolean language sql stable security definer set search_path='' as $$select exists(select 1 from public.profiles where id=auth.uid() and is_active and access_role='Superadmin')$$;
create function public.can_approve_consultation(consultation_id uuid) returns boolean language sql stable security definer set search_path='' as $$
 select exists(select 1 from public.profiles p join public.consultations c on c.id=consultation_id where p.id=auth.uid() and p.is_active and (p.access_role in ('Admin','Superadmin') or (public.portal_can('consultation_full') and ((c.mentions->'users') ? p.id::text or (c.mentions->'roles') ? p.role or (c.mentions->'divisions') ? p.division))))
$$;
revoke all on function public.portal_can(text),public.is_portal_superadmin(),public.can_approve_consultation(uuid) from public,anon;grant execute on function public.portal_can(text),public.is_portal_superadmin(),public.can_approve_consultation(uuid) to authenticated;
-- Replace the named legacy policies rather than combining them with permissive old rules.
drop policy medical_report_read on public.medical_reports;drop policy medical_report_insert on public.medical_reports;drop policy medical_report_update on public.medical_reports;
create policy medical_report_read on public.medical_reports for select to authenticated using(public.portal_can('view') and (deleted_at is null or created_by=auth.uid() or public.is_portal_superadmin()));
create policy medical_report_insert on public.medical_reports for insert to authenticated with check(created_by=auth.uid() and public.portal_can('medical_write'));
create policy medical_report_update on public.medical_reports for update to authenticated using(deleted_at is null and public.portal_can('medical_write')) with check(public.portal_can('medical_write'));
drop policy fire_report_read on public.fire_reports;
create policy fire_report_read on public.fire_reports for select to authenticated using(public.portal_can('view') and (deleted_at is null or created_by=auth.uid() or public.is_portal_superadmin()));
create policy fire_report_insert on public.fire_reports for insert to authenticated with check(created_by=auth.uid() and public.portal_can('fire_write'));
create policy fire_report_update on public.fire_reports for update to authenticated using(deleted_at is null and public.portal_can('fire_write')) with check(public.portal_can('fire_write'));
grant insert on public.fire_reports to authenticated;grant update(title,status) on public.fire_reports to authenticated;
drop policy consent_read on public.patient_consents;drop policy consent_insert on public.patient_consents;drop policy consent_update on public.patient_consents;
create policy consent_read on public.patient_consents for select to authenticated using(public.portal_can('view') and deleted_at is null);
create policy consent_insert on public.patient_consents for insert to authenticated with check(created_by=auth.uid() and public.portal_can('consent_write'));
create policy consent_update on public.patient_consents for update to authenticated using(public.portal_can('consent_write') and deleted_at is null) with check(public.portal_can('consent_write'));
revoke update on public.patient_consents from authenticated;grant update(data,updated_at) on public.patient_consents to authenticated;
drop policy consultation_read on public.consultations;drop policy consultation_insert on public.consultations;
create policy consultation_read on public.consultations for select to authenticated using(public.portal_can('view') and deleted_at is null);
create policy consultation_insert on public.consultations for insert to authenticated with check(created_by=auth.uid() and public.portal_can('consultation_create'));
drop policy announcement_insert on public.announcements;drop policy announcement_edit on public.announcements;
create policy announcement_insert on public.announcements for insert to authenticated with check(created_by=auth.uid() and public.portal_can('announcement_write'));
create policy announcement_edit on public.announcements for update to authenticated using(deleted_at is null and public.portal_can('announcement_write')) with check(public.portal_can('announcement_write'));
drop policy radiology_read on storage.objects;drop policy radiology_insert on storage.objects;
create policy radiology_read on storage.objects for select to authenticated using(bucket_id='radiology' and public.portal_can('view'));
create policy radiology_insert on storage.objects for insert to authenticated with check(bucket_id='radiology' and public.portal_can('medical_write') and (storage.foldername(name))[1]=auth.uid()::text);
-- Preserve document validation and transaction logic, replacing only legacy permission expressions.
do $$declare fn record; definition text;begin
 for fn in select p.oid,p.proname from pg_proc p join pg_namespace n on n.oid=p.pronamespace where n.nspname='public' and p.proname in ('consultation_prepare','create_report_consent','trash_medical_reports','trash_patient_consents','trash_announcements','trash_consultations','edit_consultation','complete_consultation','cancel_consultation','list_trash','manage_trash','reserve_report_suggestion','manage_portal_member') loop
 definition=pg_get_functiondef(fn.oid);
 if fn.proname='consultation_prepare' then definition=replace(definition,'public.can_read_division(new.division)', 'public.portal_can(''consultation_create'')');end if;
 if fn.proname='create_report_consent' then definition=replace(definition,'public.can_read_division(''Medical Service'')','public.portal_can(''medical_write'')');definition=replace(definition,' and created_by=auth.uid()','');end if;
 if fn.proname='trash_medical_reports' then definition=replace(definition,'public.can_read_division(''Medical Service'')','public.portal_can(''medical_write'')');definition=replace(definition,' and created_by=auth.uid()','');end if;
 if fn.proname='trash_patient_consents' then definition=replace(definition,'(created_by=auth.uid() or public.is_portal_admin())','public.portal_can(''consent_write'')');end if;
 if fn.proname='trash_announcements' then definition=replace(definition,'(created_by=auth.uid() or public.is_portal_admin())','public.portal_can(''announcement_write'')');end if;
 if fn.proname in ('trash_consultations','edit_consultation') then definition=replace(definition,'created_by=auth.uid()','(created_by=auth.uid() or public.portal_can(''consultation_full''))');if fn.proname='edit_consultation' then definition=regexp_replace(definition,'\mBEGIN\M','BEGIN IF NOT public.portal_can(''consultation_full'') THEN RAISE EXCEPTION ''Forbidden''; END IF;','i');end if;end if;
 if fn.proname in ('complete_consultation','cancel_consultation') then definition=replace(definition,'(c.created_by=auth.uid() or public.can_read_division(c.division) or exists(select 1 from public.consultation_recipients r where r.consultation_id=c.id and r.recipient_id=auth.uid()))','public.can_approve_consultation(c.id)');end if;
 if fn.proname in ('list_trash','manage_trash') then definition=replace(definition,'public.is_portal_admin()','public.is_portal_superadmin()');end if;
 if fn.proname='reserve_report_suggestion' then definition=replace(definition,'public.can_read_division(''Medical Service'')','public.portal_can(''assistant'')');end if;
 if fn.proname='manage_portal_member' then definition=replace(definition,'''Deputy Director'', ''Director''','''Deputy Director'', ''Director'', ''Medical Student''');definition=replace(definition,'''Deputy Director'',''Director''','''Deputy Director'',''Director'',''Medical Student''');end if;
 execute definition;
 end loop;
end$$;
commit;
