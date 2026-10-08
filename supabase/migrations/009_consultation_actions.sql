-- Run after 008. Pending/Done status, owner edits and transactional soft deletion.
update public.consultations set status='Done' where status='Completed';
update public.consultations set status='Pending' where status='Scheduled';
create function public.edit_consultation(consultation_id uuid,input jsonb) returns public.consultations language plpgsql security definer set search_path='' as $$
declare result public.consultations;
begin
 update public.consultations set name=input->>'name',dob=nullif(input->>'dob','')::date,appointment_date=(input->>'date')::date,contact=input->>'contact',job=input->>'job',complaint=input->>'complaint',notes=input->>'notes',mentions=input->'mentions'
 where id=consultation_id and created_by=auth.uid() and deleted_at is null returning * into result;
 if not found then raise exception 'Forbidden';end if;
 return result;
end;$$;
-- Reuse validation for updates; creator snapshot and original division remain intact.
create function public.consultation_validate_edit() returns trigger language plpgsql security definer set search_path='' as $$
begin
 if new.created_by is distinct from old.created_by or new.division is distinct from old.division then raise exception 'Immutable owner';end if;
 if length(trim(new.name)) not between 1 and 200 or length(trim(new.complaint)) not between 1 and 5000 or length(new.notes)>10000 or length(new.contact)>100 or length(new.job)>200 then raise exception 'Invalid consultation';end if;
 if jsonb_typeof(new.mentions) is distinct from 'object' or jsonb_typeof(new.mentions->'users') is distinct from 'array' or jsonb_typeof(new.mentions->'roles') is distinct from 'array' or jsonb_typeof(new.mentions->'divisions') is distinct from 'array' then raise exception 'Invalid mentions';end if;
 if jsonb_array_length(new.mentions->'users')>100 or jsonb_array_length(new.mentions->'roles')>100 or jsonb_array_length(new.mentions->'divisions')>100 then raise exception 'Too many mentions';end if;
 if exists(select 1 from jsonb_array_elements_text(new.mentions->'users') x where not exists(select 1 from public.profiles p where p.id::text=x)) or exists(select 1 from jsonb_array_elements_text(new.mentions->'roles') x where not exists(select 1 from public.profiles p where p.role=x)) or exists(select 1 from jsonb_array_elements_text(new.mentions->'divisions') x where x not in ('Medical Service','Fire Department')) then raise exception 'Unknown mention';end if;
 new.created_by_name:=old.created_by_name;
 return new;
end;$$;
create trigger consultation_edit_validation before update of name,dob,appointment_date,contact,job,complaint,notes,mentions on public.consultations for each row execute function public.consultation_validate_edit();
create function public.consultation_update_mentions() returns trigger language plpgsql security definer set search_path='' as $$
begin
 insert into public.notifications(recipient_id,title,body,type,is_mentioned,target_path)
 select p.id,'Anda disebut dalam janji temu',new.name||' — '||left(new.complaint,200),'appointment',true,'/consultations/'||new.id::text from public.profiles p
 where ((new.mentions->'users') ? p.id::text or (new.mentions->'roles') ? p.role or (new.mentions->'divisions') ? p.division)
 and not exists(select 1 from public.consultation_recipients r where r.consultation_id=new.id and r.recipient_id=p.id);
 delete from public.consultation_recipients where consultation_id=new.id;
 insert into public.consultation_recipients select new.id,p.id from public.profiles p where (new.mentions->'users') ? p.id::text or (new.mentions->'roles') ? p.role or (new.mentions->'divisions') ? p.division;
 return new;
end;$$;
create trigger consultation_mentions_edited after update of mentions on public.consultations for each row when(old.mentions is distinct from new.mentions) execute function public.consultation_update_mentions();
create function public.complete_consultation(consultation_id uuid) returns public.consultations language plpgsql security definer set search_path='' as $$
declare result public.consultations;
begin
 update public.consultations c set status='Done' where c.id=consultation_id and c.deleted_at is null and c.status='Pending' and (c.created_by=auth.uid() or public.can_read_division(c.division) or exists(select 1 from public.consultation_recipients r where r.consultation_id=c.id and r.recipient_id=auth.uid())) returning * into result;
 if not found then raise exception 'Consultation unavailable';end if;
 return result;
end;$$;
create function public.trash_consultations(consultation_ids uuid[]) returns void language plpgsql security definer set search_path='' as $$
declare found_count integer;
begin
 if cardinality(consultation_ids) not between 1 and 1000 or auth.uid() is null then raise exception 'Invalid selection';end if;
 perform id from public.consultations where id=any(consultation_ids) and created_by=auth.uid() and deleted_at is null order by id for update;
 get diagnostics found_count=row_count;
 if found_count<>cardinality(consultation_ids) then raise exception 'Forbidden or unavailable';end if;
 update public.consultations set deleted_at=now(),deleted_by=auth.uid(),purge_after=now()+interval '30 days' where id=any(consultation_ids);
end;$$;
revoke all on function public.edit_consultation(uuid,jsonb),public.complete_consultation(uuid),public.trash_consultations(uuid[]) from public,anon;
grant execute on function public.edit_consultation(uuid,jsonb),public.complete_consultation(uuid),public.trash_consultations(uuid[]) to authenticated;
