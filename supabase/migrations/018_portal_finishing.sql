-- Apply after 017. Position mentions, announcement attachments and first-join tutorial.
begin;
alter table public.profiles add column tutorial_completed_at timestamptz;
-- Existing members already know the portal; only future members start automatically.
update public.profiles set tutorial_completed_at=now();
grant update(tutorial_completed_at) on public.profiles to authenticated;
alter table public.announcements add column attachments jsonb not null default '[]';
grant insert(attachments),update(attachments) on public.announcements to authenticated;
insert into storage.buckets(id,name,public,file_size_limit,allowed_mime_types) values('announcement-attachments','announcement-attachments',false,4194304,array['image/png','image/jpeg','image/webp','application/pdf','application/vnd.openxmlformats-officedocument.wordprocessingml.document','text/plain','text/csv']);
create policy announcement_attachment_read on storage.objects for select to authenticated using(bucket_id='announcement-attachments' and public.portal_can('view'));
create policy announcement_attachment_upload on storage.objects for insert to authenticated with check(bucket_id='announcement-attachments' and public.portal_can('announcement_write') and (storage.foldername(name))[1]=auth.uid()::text);
create function public.validate_announcement_attachments() returns trigger language plpgsql security definer set search_path='' as $$
declare a jsonb;begin
 if jsonb_typeof(new.attachments) is distinct from 'array' or jsonb_array_length(new.attachments)>20 then raise exception 'Invalid attachments';end if;
 for a in select x from jsonb_array_elements(new.attachments) x loop
 if jsonb_typeof(a) is distinct from 'object' or length(coalesce(a->>'name','')) not between 1 and 200 or a->>'kind' is null then raise exception 'Invalid attachment';end if;
 if a->>'kind'='link' then
 if coalesce(a->>'url','') !~ '^https?://[^/@[:space:]]+([/:?#]|$)' or length(a->>'url')>2000 then raise exception 'Invalid link';end if;
 elsif a->>'kind' in ('file','image') then
 if coalesce(a->>'path','') !~* '^[0-9a-f-]{36}/[0-9a-f-]{36}\.(png|jpg|webp|pdf|docx|txt|csv)$' or not exists(select 1 from storage.objects o where o.bucket_id='announcement-attachments' and o.name=a->>'path') then raise exception 'Invalid file';end if;
 else raise exception 'Invalid attachment kind';end if;
 end loop;return new;end;$$;
create trigger announcement_attachments_validate before insert or update of attachments on public.announcements for each row execute function public.validate_announcement_attachments();
create function public.validate_position_mentions() returns trigger language plpgsql security definer set search_path='' as $$
begin
 if new.mentions ? 'positions' then
 if jsonb_typeof(new.mentions->'positions') is distinct from 'array' or jsonb_array_length(new.mentions->'positions')>100 then raise exception 'Invalid positions';end if;
 if exists(select 1 from jsonb_array_elements(new.mentions->'positions') x where jsonb_typeof(x)<>'string' or not exists(select 1 from public.profiles p where p.is_active and p.job_title=x#>>'{}')) then raise exception 'Unknown position';end if;
 end if;return new;end;$$;
create trigger consultation_positions_validate before insert or update of mentions on public.consultations for each row execute function public.validate_position_mentions();
create or replace function public.consultation_notify() returns trigger language plpgsql security definer set search_path='' as $$
begin
 if exists(select 1 from jsonb_array_elements_text(new.mentions->'users') x where not exists(select 1 from public.profiles p where p.is_active and p.id::text=x)) or exists(select 1 from jsonb_array_elements_text(new.mentions->'roles') x where not exists(select 1 from public.profiles p where p.is_active and p.role=x)) or exists(select 1 from jsonb_array_elements_text(new.mentions->'divisions') x where x not in ('Medical Service','Fire Department')) then raise exception 'Unknown mention';end if;
 insert into public.consultation_recipients select new.id,p.id from public.profiles p where p.is_active and ((new.mentions->'users') ? p.id::text or (new.mentions->'roles') ? p.role or (new.mentions->'divisions') ? p.division or (new.mentions->'positions') ? p.job_title);
 insert into public.notifications(recipient_id,title,body,type,is_mentioned,target_path)
 select p.id,case when r.recipient_id is not null then 'Anda disebut dalam janji temu' else 'Janji temu baru' end,new.name||' — '||left(new.complaint,200),'appointment',r.recipient_id is not null,'/consultations/'||new.id::text from public.profiles p left join public.consultation_recipients r on r.consultation_id=new.id and r.recipient_id=p.id where p.is_active and (p.division=new.division or r.recipient_id is not null);return new;end;$$;
create or replace function public.consultation_update_mentions() returns trigger language plpgsql security definer set search_path='' as $$
begin
 insert into public.notifications(recipient_id,title,body,type,is_mentioned,target_path) select p.id,'Anda disebut dalam janji temu',new.name||' — '||left(new.complaint,200),'appointment',true,'/consultations/'||new.id::text from public.profiles p where p.is_active and ((new.mentions->'users') ? p.id::text or (new.mentions->'roles') ? p.role or (new.mentions->'divisions') ? p.division or (new.mentions->'positions') ? p.job_title) and not exists(select 1 from public.consultation_recipients r where r.consultation_id=new.id and r.recipient_id=p.id);
 delete from public.consultation_recipients where consultation_id=new.id;
 insert into public.consultation_recipients select new.id,p.id from public.profiles p where p.is_active and ((new.mentions->'users') ? p.id::text or (new.mentions->'roles') ? p.role or (new.mentions->'divisions') ? p.division or (new.mentions->'positions') ? p.job_title);return new;end;$$;
create or replace function public.can_approve_consultation(consultation_id uuid) returns boolean language sql stable security definer set search_path='' as $$
 select exists(select 1 from public.profiles p join public.consultations c on c.id=consultation_id where p.id=auth.uid() and p.is_active and (p.access_role in ('Admin','Superadmin') or (public.portal_can('consultation_full') and ((c.mentions->'users') ? p.id::text or (c.mentions->'roles') ? p.role or (c.mentions->'divisions') ? p.division or (c.mentions->'positions') ? p.job_title))))
$$;
create table public.announcement_storage_cleanup(path text primary key,queued_at timestamptz not null default now());
alter table public.announcement_storage_cleanup enable row level security;
revoke all on public.announcement_storage_cleanup from anon,authenticated;grant select,delete on public.announcement_storage_cleanup to service_role;
create function public.queue_announcement_files() returns trigger language plpgsql security definer set search_path='' as $$
declare a jsonb;begin
 for a in select x from jsonb_array_elements(old.attachments) x where x->>'kind' in ('file','image') loop
 if TG_OP='DELETE' or not(new.attachments @> jsonb_build_array(jsonb_build_object('path',a->>'path'))) then insert into public.announcement_storage_cleanup(path) values(a->>'path') on conflict do nothing;end if;end loop;return old;end;$$;
create trigger announcement_files_removed after delete or update of attachments on public.announcements for each row execute function public.queue_announcement_files();
create function public.ready_announcement_storage_cleanup() returns table(path text) language sql stable security definer set search_path='' as $$select q.path from public.announcement_storage_cleanup q where not exists(select 1 from public.announcements a where a.attachments @> jsonb_build_array(jsonb_build_object('path',q.path))) order by q.queued_at limit 500$$;
revoke all on function public.ready_announcement_storage_cleanup() from public,anon,authenticated;grant execute on function public.ready_announcement_storage_cleanup() to service_role;
commit;
