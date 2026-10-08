-- Consultation fields and atomic notification fan-out.
alter table public.consultations add column dob date, add column contact text not null default '', add column job text not null default '', add column notes text not null default '', add column created_by_name text not null default '', add column mentions jsonb not null default '{"users":[],"roles":[],"divisions":[]}';
update public.consultations c set created_by_name=p.display_name from public.profiles p where p.id=c.created_by;
create table public.consultation_recipients(consultation_id uuid references public.consultations(id) on delete cascade,recipient_id uuid references public.profiles(id) on delete cascade,primary key(consultation_id,recipient_id));
alter table public.consultation_recipients enable row level security;
create policy consultation_recipient_read on public.consultation_recipients for select to authenticated using(recipient_id=auth.uid());
grant select on public.consultation_recipients to authenticated;
drop policy consultation_read on public.consultations;
create policy consultation_read on public.consultations for select to authenticated using(deleted_at is null and (public.can_read_division(division) or created_by=auth.uid() or exists(select 1 from public.consultation_recipients r where r.consultation_id=consultations.id and r.recipient_id=auth.uid())));
create policy consultation_insert on public.consultations for insert to authenticated with check(created_by=auth.uid() and public.can_read_division(division));
grant insert on public.consultations to authenticated;
create function public.consultation_notify() returns trigger language plpgsql security definer set search_path='' as $$
begin
 if jsonb_typeof(new.mentions->'users')<>'array' or jsonb_typeof(new.mentions->'roles')<>'array' or jsonb_typeof(new.mentions->'divisions')<>'array' then raise exception 'Invalid mentions';end if;
 if exists(select 1 from jsonb_array_elements_text(new.mentions->'users') x where not exists(select 1 from public.profiles p where p.id::text=x)) or exists(select 1 from jsonb_array_elements_text(new.mentions->'roles') x where not exists(select 1 from public.profiles p where p.role=x)) or exists(select 1 from jsonb_array_elements_text(new.mentions->'divisions') x where x not in ('Medical Service','Fire Department')) then raise exception 'Unknown mention';end if;
 insert into public.consultation_recipients select new.id,p.id from public.profiles p where (new.mentions->'users') ? p.id::text or (new.mentions->'roles') ? p.role or (new.mentions->'divisions') ? p.division;
 insert into public.notifications(recipient_id,title,body,type,is_mentioned,target_path)
 select p.id,case when r.recipient_id is not null then 'Anda disebut dalam janji temu' else 'Janji temu baru' end,new.name || ' — ' || left(new.complaint,200),'appointment',r.recipient_id is not null,'/consultations/'||new.id::text
 from public.profiles p left join public.consultation_recipients r on r.consultation_id=new.id and r.recipient_id=p.id where p.division=new.division or r.recipient_id is not null;
 return new;
end;$$;
create trigger consultation_created after insert on public.consultations for each row execute function public.consultation_notify();
-- Resolve author snapshot from the authenticated profile, never from form input.
create function public.consultation_prepare() returns trigger language plpgsql security definer set search_path='' as $$
begin
 if new.created_by is distinct from auth.uid() or not public.can_read_division(new.division) then raise exception 'Forbidden';end if;
 if length(trim(new.name)) not between 1 and 200 or length(trim(new.complaint)) not between 1 and 5000 or length(new.notes)>10000 or length(new.contact)>100 or length(new.job)>200 then raise exception 'Invalid consultation';end if;
 if jsonb_typeof(new.mentions)<>'object' or jsonb_typeof(new.mentions->'users') is distinct from 'array' or jsonb_typeof(new.mentions->'roles') is distinct from 'array' or jsonb_typeof(new.mentions->'divisions') is distinct from 'array' then raise exception 'Invalid mentions';end if;
 if jsonb_array_length(new.mentions->'users')>100 or jsonb_array_length(new.mentions->'roles')>100 or jsonb_array_length(new.mentions->'divisions')>100 then raise exception 'Too many mentions';end if;
 select display_name into new.created_by_name from public.profiles where id=auth.uid();
 return new;
end;$$;
create trigger consultation_before_create before insert on public.consultations for each row execute function public.consultation_prepare();
-- Create a consent and attach its share link in one transaction. The report must belong to the creator.
create function public.create_report_consent(consent_data jsonb,report_id uuid) returns public.patient_consents language plpgsql security definer set search_path='' as $$
declare result public.patient_consents;link jsonb;path text;
begin
 if not public.can_read_division('Medical Service') then raise exception 'Forbidden';end if;
 perform 1 from public.medical_reports where id=report_id and created_by=auth.uid() and deleted_at is null for update;
 if not found then raise exception 'Report unavailable';end if;
 insert into public.patient_consents(created_by,created_by_name,data) select auth.uid(),display_name,consent_data from public.profiles where id=auth.uid() returning * into result;
 path:='/share/consent/'||result.share_token::text;
 link:=jsonb_build_object('id',result.id,'token',result.share_token,'name',consent_data->>'patientName');
 update public.medical_reports set draft=jsonb_set(jsonb_set(jsonb_set(draft,'{consentLinks}',coalesce(draft->'consentLinks','[]'::jsonb)||jsonb_build_array(link)),'{preview}',to_jsonb(report_text||E'\nPatient Consent : '||path)),'{previewHtml}',case when coalesce(draft->>'previewHtml','')<>'' then to_jsonb((draft->>'previewHtml')||'<p>Patient Consent : '||path||'</p>') else 'null'::jsonb end),report_text=report_text||E'\nPatient Consent : '||path,updated_at=now() where id=report_id;
 return result;
end;$$;
revoke all on function public.create_report_consent(jsonb,uuid) from public,anon;
grant execute on function public.create_report_consent(jsonb,uuid) to authenticated;
-- Enable subscriptions only once for tables missing from the publication.
do $$ declare t text;begin foreach t in array array['notifications','consultations'] loop
 if not exists(select 1 from pg_publication_tables where pubname='supabase_realtime' and schemaname='public' and tablename=t) then execute format('alter publication supabase_realtime add table public.%I',t);end if;
end loop;end $$;
