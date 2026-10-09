begin;
insert into storage.buckets(id,name,public,file_size_limit,allowed_mime_types) values('fire-attachments','fire-attachments',false,4194304,array['image/png','image/jpeg','image/webp','application/pdf','application/vnd.openxmlformats-officedocument.wordprocessingml.document','text/plain','text/csv','video/mp4','video/webm','video/quicktime']);
create policy fire_attachment_read on storage.objects for select to authenticated using(bucket_id='fire-attachments' and public.is_active_member() and public.portal_can('view'));
create policy fire_attachment_upload on storage.objects for insert to authenticated with check(bucket_id='fire-attachments' and public.is_active_member() and public.portal_can('fire_write') and (storage.foldername(name))[1]=auth.uid()::text);
create function public.validate_fire_attachments() returns trigger language plpgsql security definer set search_path='' as $$
declare a jsonb;begin
if not(new.draft ? 'attachments') then return new;end if;
if jsonb_typeof(new.draft->'attachments') is distinct from 'array' or jsonb_array_length(new.draft->'attachments')>20 then raise exception 'Invalid attachments';end if;
for a in select x from jsonb_array_elements(new.draft->'attachments') x loop
if length(coalesce(a->>'name','')) not between 1 and 200 then raise exception 'Invalid name';end if;
if a->>'kind'='link' then
if coalesce(a->>'url','') !~ '^https?://[^/@[:space:]]+([/:?#]|$)' or length(a->>'url')>2000 then raise exception 'Invalid link';end if;
elsif a->>'kind' in ('file','image','video') then
if coalesce(a->>'path','') !~* '^[0-9a-f-]{36}/[0-9a-f-]{36}\.(png|jpg|webp|pdf|docx|txt|csv|mp4|webm|mov)$' or not exists(select 1 from storage.objects o where o.bucket_id='fire-attachments' and o.name=a->>'path') then raise exception 'Invalid file';end if;
else raise exception 'Invalid kind';end if;
end loop;return new;end;$$;
create trigger fire_attachments_validate before insert or update of draft on public.fire_reports for each row execute function public.validate_fire_attachments();
create table public.fire_storage_cleanup(path text primary key,queued_at timestamptz not null default now());
alter table public.fire_storage_cleanup enable row level security;
revoke all on public.fire_storage_cleanup from anon,authenticated;grant select,delete on public.fire_storage_cleanup to service_role;
create function public.queue_fire_files() returns trigger language plpgsql security definer set search_path='' as $$
declare a jsonb;begin
for a in select x from jsonb_array_elements(coalesce(old.draft->'attachments','[]'::jsonb)) x where x->>'kind' in ('file','image','video') loop
if TG_OP='DELETE' or not(coalesce(new.draft->'attachments','[]'::jsonb) @> jsonb_build_array(jsonb_build_object('path',a->>'path'))) then insert into public.fire_storage_cleanup(path) values(a->>'path') on conflict do nothing;end if;end loop;return old;end;$$;
create trigger fire_files_removed after delete or update of draft on public.fire_reports for each row execute function public.queue_fire_files();
create function public.ready_fire_storage_cleanup() returns table(path text) language sql stable security definer set search_path='' as $$select q.path from public.fire_storage_cleanup q where not exists(select 1 from public.fire_reports r where coalesce(r.draft->'attachments','[]'::jsonb) @> jsonb_build_array(jsonb_build_object('path',q.path))) order by q.queued_at limit 500$$;
revoke all on function public.ready_fire_storage_cleanup() from public,anon,authenticated;grant execute on function public.ready_fire_storage_cleanup() to service_role;
commit;
