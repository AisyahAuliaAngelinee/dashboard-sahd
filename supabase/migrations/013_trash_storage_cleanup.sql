-- Deleted report files are removed through the Storage API, never by deleting storage.objects rows.
begin;
create table public.storage_cleanup_queue(path text primary key,queued_at timestamptz not null default now());
alter table public.storage_cleanup_queue enable row level security;
revoke all on public.storage_cleanup_queue from anon,authenticated;
grant select,delete on public.storage_cleanup_queue to service_role;
create function public.queue_deleted_report_files() returns trigger language plpgsql security definer set search_path='' as $$
declare attachment jsonb;file_path text;
begin
 for attachment in select x from jsonb_array_elements(case when jsonb_typeof(old.draft->'attachments')='array' then old.draft->'attachments' else '[]'::jsonb end) x union all select old.draft->'radiology' where old.draft->'radiology' is not null loop
 file_path=attachment->>'path';
 if file_path like old.created_by::text||'/%' and file_path not like '%..%' then insert into public.storage_cleanup_queue(path) values(file_path) on conflict(path) do nothing;end if;
 end loop;
 return old;
end;$$;
create trigger deleted_report_files after delete on public.medical_reports for each row execute function public.queue_deleted_report_files();
create function public.ready_storage_cleanup() returns table(path text) language sql stable security definer set search_path='' as $$
 select q.path from public.storage_cleanup_queue q where not exists(
 select 1 from public.medical_reports r where r.draft->'radiology'->>'path'=q.path or exists(select 1 from jsonb_array_elements(case when jsonb_typeof(r.draft->'attachments')='array' then r.draft->'attachments' else '[]'::jsonb end) a where a->>'path'=q.path)
 ) order by q.queued_at limit 500;
$$;
revoke all on function public.ready_storage_cleanup() from public,anon,authenticated;
grant execute on function public.ready_storage_cleanup() to service_role;
commit;
