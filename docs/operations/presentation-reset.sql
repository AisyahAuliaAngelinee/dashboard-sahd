-- MANUAL OPERATION ONLY: authorized presentation reset for project hfcpsevrffbzqskfwnno.
-- Run only after the production deployment is ready. Never place this file in migrations.
-- Preserves auth.users, profiles, assignment_audit, schema, policies, buckets, and avatars.
begin;
set local lock_timeout='5s';
do $$begin
 if (select count(*) from public.profiles where id in ('94a54084-416a-4dac-ab7f-955d0f35a76b','aa5f56fb-6d36-4165-996f-e46aeab0a17d'))<>2 then raise exception 'Expected both owner profiles';end if;
 if exists(select 1 from storage.objects where bucket_id<>'avatars') then raise exception 'Remove operational files via Storage API before reset; never delete storage.objects through SQL';end if;
end$$;
update public.profiles set access_role='Superadmin',division='Medical Service',job_title='Doctor Resident',is_active=true where id in ('94a54084-416a-4dac-ab7f-955d0f35a76b','aa5f56fb-6d36-4165-996f-e46aeab0a17d');
delete from public.medical_reports;
delete from public.fire_reports;
delete from public.patient_consents;
delete from public.consultation_recipients;
delete from public.consultations;
delete from public.announcements;
delete from public.notifications;
delete from public.procedures;
delete from public.radiology_generation_requests;
delete from public.report_suggestion_requests;
-- No operational objects exist; clear obsolete cleanup jobs after DELETE triggers have run.
delete from public.storage_cleanup_queue;
delete from public.announcement_storage_cleanup;
commit;
select id,display_name,access_role,division,job_title from public.profiles where id in ('94a54084-416a-4dac-ab7f-955d0f35a76b','aa5f56fb-6d36-4165-996f-e46aeab0a17d');
