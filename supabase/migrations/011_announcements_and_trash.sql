-- Apply after migrations 001–010. Published announcements and owner/admin Trash.
begin;
alter table public.announcements add column if not exists body_json jsonb;
alter table public.announcements add column if not exists created_by_name text;
alter table public.patient_consents add column if not exists deleted_by uuid references public.profiles(id);
alter table public.patient_consents add column if not exists purge_after timestamptz;
update public.patient_consents set purge_after=deleted_at+interval '30 days',deleted_by=created_by where deleted_at is not null and purge_after is null;
update public.announcements a set created_by_name=p.display_name from public.profiles p where a.created_by=p.id and a.created_by_name is null;
create or replace function public.is_portal_admin() returns boolean language sql stable security definer set search_path='' as $$ select exists(select 1 from public.profiles where id=auth.uid() and role='Admin'); $$;
revoke all on function public.is_portal_admin() from public,anon; grant execute on function public.is_portal_admin() to authenticated;
create policy announcement_insert on public.announcements for insert to authenticated with check(created_by=auth.uid() and deleted_at is null and status='published');
create policy announcement_edit on public.announcements for update to authenticated using(deleted_at is null and (created_by=auth.uid() or public.is_portal_admin())) with check(deleted_at is null and (created_by=auth.uid() or public.is_portal_admin()));
grant insert(title,subtitle,body_json,body_text,status,created_by,published_at),update(title,subtitle,body_json,body_text) on public.announcements to authenticated;
create or replace function public.validate_announcement() returns trigger language plpgsql security definer set search_path='' as $$
begin
 if length(btrim(new.title)) not between 1 and 200 or length(coalesce(new.subtitle,''))>500 or length(coalesce(new.body_text,''))>100000 or new.body_json is null or new.body_json->>'type'<>'doc' or octet_length(new.body_json::text)>200000 then raise exception 'Invalid announcement';end if;
 if TG_OP='INSERT' then select display_name into new.created_by_name from public.profiles where id=new.created_by;new.published_at=now();end if;
 return new;
end;$$;
create trigger announcement_validate before insert or update of title,subtitle,body_json,body_text on public.announcements for each row execute function public.validate_announcement();
create or replace function public.notify_announcement() returns trigger language plpgsql security definer set search_path='' as $$
begin
 insert into public.notifications(recipient_id,title,body,type,target_path) select id,new.title,left(coalesce(nullif(new.subtitle,''),new.body_text),140),'announcement','/announcements/'||new.id::text from public.profiles;
 return new;
end;$$;
create trigger announcement_notify after insert on public.announcements for each row when (new.status='published') execute function public.notify_announcement();
create or replace function public.trash_announcements(item_ids uuid[]) returns void language plpgsql security definer set search_path='' as $$
begin
 if auth.uid() is null or cardinality(item_ids) not between 1 and 1000 then raise exception 'Invalid selection';end if;
 perform 1 from public.announcements where id=any(item_ids) order by id for update;
 if (select count(*) from public.announcements where id=any(item_ids) and deleted_at is null and (created_by=auth.uid() or public.is_portal_admin()))<>cardinality(item_ids) then raise exception 'Forbidden selection';end if;
 update public.announcements set deleted_at=now(),deleted_by=auth.uid(),purge_after=now()+interval '30 days' where id=any(item_ids);
end;$$;
create or replace function public.trash_patient_consents(consent_ids uuid[]) returns void language plpgsql security definer set search_path='' as $$
begin
 if auth.uid() is null or not public.can_read_division('Medical Service') or cardinality(consent_ids) not between 1 and 1000 then raise exception 'Forbidden';end if;
 perform 1 from public.patient_consents where id=any(consent_ids) order by id for update;
 if (select count(*) from public.patient_consents where id=any(consent_ids) and created_by=auth.uid() and deleted_at is null)<>cardinality(consent_ids) then raise exception 'Forbidden selection';end if;
 update public.patient_consents set deleted_at=now(),deleted_by=auth.uid(),purge_after=now()+interval '30 days',updated_at=now() where id=any(consent_ids);
end;$$;
create or replace function public.list_trash() returns table(id uuid,kind text,title text,created_by uuid,created_by_name text,deleted_at timestamptz,purge_after timestamptz) language sql stable security definer set search_path='' as $$
 select t.* from (
 select r.id,'medical_report',coalesce(r.title,r.case_title),r.created_by,r.created_by_name,r.deleted_at,coalesce(r.purge_after,r.deleted_at+interval '30 days') from public.medical_reports r where r.deleted_at is not null
 union all select c.id,'patient_consent',coalesce(c.data->>'patientName','Patient Consent'),c.created_by,c.created_by_name,c.deleted_at,coalesce(c.purge_after,c.deleted_at+interval '30 days') from public.patient_consents c where c.deleted_at is not null
 union all select c.id,'consultation',c.name,c.created_by,c.created_by_name,c.deleted_at,coalesce(c.purge_after,c.deleted_at+interval '30 days') from public.consultations c where c.deleted_at is not null
 union all select a.id,'announcement',a.title,a.created_by,a.created_by_name,a.deleted_at,coalesce(a.purge_after,a.deleted_at+interval '30 days') from public.announcements a where a.deleted_at is not null
 ) t where auth.uid() is not null and (t.created_by=auth.uid() or public.is_portal_admin()) order by t.deleted_at desc;
$$;
create or replace function public.manage_trash(operation text,items jsonb) returns void language plpgsql security definer set search_path='' as $$
declare item jsonb;tablename text;record_id uuid;owner_id uuid;deleted timestamptz;expires timestamptz;
begin
 if auth.uid() is null or operation is null or operation not in ('restore','delete') or items is null or jsonb_typeof(items)<>'array' or jsonb_array_length(items) not between 1 and 1000 then raise exception 'Invalid request';end if;
 if (select count(distinct (x->>'kind',x->>'id')) from jsonb_array_elements(items) x)<>jsonb_array_length(items) then raise exception 'Duplicate selection';end if;
 for item in select x from jsonb_array_elements(items) x order by x->>'kind',x->>'id' loop
 tablename=case item->>'kind' when 'medical_report' then 'medical_reports' when 'patient_consent' then 'patient_consents' when 'consultation' then 'consultations' when 'announcement' then 'announcements' end;
 if tablename is null then raise exception 'Unknown module';end if;
 record_id=(item->>'id')::uuid;owner_id=null;deleted=null;expires=null;
 execute format('select created_by,deleted_at,coalesce(purge_after,deleted_at+interval ''30 days'') from public.%I where id=$1 for update',tablename) into owner_id,deleted,expires using record_id;
 if owner_id is null or deleted is null or (owner_id<>auth.uid() and not public.is_portal_admin()) then raise exception 'Forbidden selection';end if;
 if operation='restore' then
 if expires<=now() then raise exception 'Expired';end if;
 execute format('update public.%I set deleted_at=null,deleted_by=null,purge_after=null where id=$1',tablename) using record_id;
 else execute format('delete from public.%I where id=$1',tablename) using record_id;end if;
 end loop;
end;$$;
revoke all on function public.trash_announcements(uuid[]),public.trash_patient_consents(uuid[]),public.list_trash(),public.manage_trash(text,jsonb) from public,anon;
grant execute on function public.trash_announcements(uuid[]),public.trash_patient_consents(uuid[]),public.list_trash(),public.manage_trash(text,jsonb) to authenticated;
create or replace function public.purge_expired_trash() returns void language plpgsql security definer set search_path='' as $$
begin
 delete from public.medical_reports where deleted_at is not null and coalesce(purge_after,deleted_at+interval '30 days')<=now();
 delete from public.patient_consents where deleted_at is not null and coalesce(purge_after,deleted_at+interval '30 days')<=now();
 delete from public.consultations where deleted_at is not null and coalesce(purge_after,deleted_at+interval '30 days')<=now();
 delete from public.announcements where deleted_at is not null and coalesce(purge_after,deleted_at+interval '30 days')<=now();
end;$$;
revoke all on function public.purge_expired_trash() from public,anon,authenticated;
do $$begin if not exists(select 1 from pg_publication_tables where pubname='supabase_realtime' and schemaname='public' and tablename='announcements') then alter publication supabase_realtime add table public.announcements;end if;end$$;
commit;
