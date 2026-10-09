-- Apply after 015. Access level is separate from organizational role.
begin;
alter table public.profiles add column access_role text not null default 'Member' check(access_role in ('Member','Admin','Superadmin'));
alter table public.profiles add column is_active boolean not null default true;
update public.profiles set access_role='Admin',role='SAHD' where role='Admin';
alter table public.profiles alter column role set default 'SAHD';
alter table public.profiles drop constraint profiles_job_title_check;
alter table public.profiles add constraint profiles_job_title_check check(job_title is null or job_title='Trainee' or (division is not null and division='Medical Service' and job_title in ('General Practitioner','Doctor Resident','Doctor Attending','Medical Student')) or (division is not null and division='Fire Department' and job_title in ('First Responder','Firefighter','Lieutenant','Captain')));
alter table public.profiles alter column job_title set default 'Trainee';
create or replace view public.member_directory with(security_invoker=true) as select id,display_name,role,division,avatar_path,providers,job_title,teams,access_role from public.profiles where is_active;
create or replace function public.is_portal_admin() returns boolean language sql stable security definer set search_path='' as $$select exists(select 1 from public.profiles where id=auth.uid() and is_active and access_role in ('Admin','Superadmin'))$$;
create function public.is_active_member() returns boolean language sql stable security definer set search_path='' as $$select exists(select 1 from public.profiles where id=auth.uid() and is_active)$$;
revoke all on function public.is_active_member() from public,anon;grant execute on function public.is_active_member() to authenticated;
-- Existing sessions of removed members also lose access through RLS.
do $$declare tab record;begin
 for tab in select tablename from pg_tables where schemaname='public' and rowsecurity loop
 execute format('create policy active_members_only on public.%I as restrictive for all to authenticated using(public.is_active_member()) with check(public.is_active_member())',tab.tablename);
 end loop;
end$$;
create policy active_portal_storage on storage.objects as restrictive for all to authenticated using(public.is_active_member()) with check(public.is_active_member());
create function public.manage_portal_member(target_user uuid,new_name text,new_role text,new_division text,new_position text,new_teams text[],new_access text,remove_member boolean default false) returns void
language plpgsql security definer set search_path='' as $$
declare actor public.profiles%rowtype; previous public.profiles%rowtype;
begin
 select * into actor from public.profiles where id=auth.uid();
 if not actor.is_active or actor.access_role not in ('Admin','Superadmin') or actor.id is null then raise exception 'Forbidden';end if;
 if target_user=actor.id then raise exception 'Self management disabled';end if;
 select * into previous from public.profiles where id=target_user and is_active for update;
 if not found then raise exception 'Member not found';end if;
 if previous.access_role='Superadmin' then raise exception 'Superadmin cannot be changed here';end if;
 if new_access not in ('Member','Admin') then raise exception 'Invalid access';end if;
 if not remove_member and (new_name is null or length(trim(new_name)) not between 1 and 100 or new_role not in ('SAHD','Deputy','Chief','Advisor','Deputy Director','Director')
 or (new_division is not null and new_division not in ('Medical Service','Fire Department')) or new_teams is null or cardinality(new_teams)>4 or not(new_teams <@ array['Finance','Public Relation','Human Resource','Internal Affairs']::text[])
 or (new_position is not null and new_position<>'Trainee' and (new_division is null or (new_division='Medical Service' and new_position not in ('General Practitioner','Doctor Resident','Doctor Attending','Medical Student')) or (new_division='Fire Department' and new_position not in ('First Responder','Firefighter','Lieutenant','Captain'))))) then raise exception 'Invalid assignment';end if;
 if remove_member then update public.profiles set is_active=false where id=target_user;
 else update public.profiles set display_name=trim(new_name),role=new_role,division=new_division,job_title=new_position,teams=new_teams,access_role=new_access where id=target_user;end if;
 insert into public.assignment_audit(actor_id,target_id,previous_role,previous_division,new_role,new_division,details) values(actor.id,target_user,previous.role,previous.division,new_role,new_division,jsonb_build_object('action',case when remove_member then 'remove_member' else 'edit_member' end,'previous_access',previous.access_role,'access',new_access,'previous_name',previous.display_name,'name',new_name,'position',new_position,'teams',new_teams));
end;$$;
revoke all on function public.manage_portal_member(uuid,text,text,text,text,text[],text,boolean) from public,anon;grant execute on function public.manage_portal_member(uuid,text,text,text,text,text[],text,boolean) to authenticated;
-- Route legacy assignment RPCs through the same authorization instead of leaving role-based access behind.
create or replace function public.assign_member_directory(target_user uuid,new_role text,new_division text,new_job_title text,new_teams text[]) returns void language plpgsql security definer set search_path='' as $$declare p public.profiles%rowtype;begin select * into p from public.profiles where id=target_user;perform public.manage_portal_member(target_user,p.display_name,case when new_role in ('Admin','Member') then 'SAHD' else new_role end,new_division,new_job_title,new_teams,case when new_role='Admin' then 'Admin' when new_role='Member' then 'Member' else p.access_role end,false);end;$$;
create or replace function public.can_read_division(target text) returns boolean language sql stable security definer set search_path='' as $$select exists(select 1 from public.profiles where id=auth.uid() and is_active and division=target)$$;
drop policy assignment_audit_admin_read on public.assignment_audit;
create policy assignment_audit_admin_read on public.assignment_audit for select to authenticated using(public.is_portal_admin());
-- Gate previously granted security-definer mutation RPCs, including those bypassing RLS.
do $$declare fn record; definition text;begin
 for fn in select p.oid from pg_proc p join pg_namespace n on n.oid=p.pronamespace join pg_language l on l.oid=p.prolang where n.nspname='public' and p.prosecdef and l.lanname='plpgsql' and p.proname in ('trash_announcements','trash_patient_consents','manage_trash','trash_medical_reports','trash_consultations','edit_consultation','complete_consultation','cancel_consultation','create_report_consent','reserve_report_suggestion','reserve_case_assistant') loop
 definition=pg_get_functiondef(fn.oid);
 definition=regexp_replace(definition,'\mBEGIN\M','BEGIN IF NOT public.is_active_member() THEN RAISE EXCEPTION ''Forbidden''; END IF;','i');
 execute definition;
 end loop;
end$$;
do $$declare definition text;begin
 definition=pg_get_functiondef('public.list_trash()'::regprocedure);
 definition=replace(definition,'auth.uid() is not null','public.is_active_member()');
 execute definition;
end$$;
commit;
-- Superadmin bootstrap is intentionally a trusted SQL operation, never accepted from signup metadata.
