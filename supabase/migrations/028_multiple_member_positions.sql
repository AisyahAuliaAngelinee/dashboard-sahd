begin;
create function public.valid_member_positions(d text,p text) returns boolean language sql immutable set search_path='' as $$select p is null or p='Trainee' or (d is not null and d in ('Medical Service','Fire Department') and cardinality(string_to_array(p,', ')) between 1 and 10 and cardinality(string_to_array(p,', '))=(select count(distinct x) from unnest(string_to_array(p,', ')) x) and string_to_array(p,', ') <@ (array['Deputy','Chief','Advisor','Deputy Director','Director']::text[] || case when d='Medical Service' then array['General Practitioner','Doctor Resident','Doctor Attending','Medical Student']::text[] else array['First Responder','Firefighter','Lieutenant','Captain']::text[] end))$$;
alter table public.profiles drop constraint profiles_job_title_check;
alter table public.profiles add constraint profiles_job_title_check check(public.valid_member_positions(division,job_title));
create or replace function public.assign_member_directory(target_user uuid,new_role text,new_division text,new_job_title text,new_teams text[]) returns void
language plpgsql security definer set search_path='' as $$
declare actor public.profiles%rowtype; previous public.profiles%rowtype;
begin
 if not public.is_active_member() then raise exception 'Forbidden';end if;
 select * into actor from public.profiles where id=auth.uid();
 if actor.access_role not in ('Admin','Superadmin') then raise exception 'Forbidden';end if;
 select * into previous from public.profiles where id=target_user and is_active for update;
 if not found then raise exception 'Member not found';end if;
 if actor.access_role='Superadmin' and (target_user=actor.id or previous.access_role='Superadmin') then
  if new_role is null or new_role<>'SAHD'
   or (new_division is not null and new_division not in ('Medical Service','Fire Department'))
   or new_teams is null or cardinality(new_teams)>4 or not(new_teams <@ array['Finance','Public Relation','Human Resource','Internal Affairs']::text[])
   or not public.valid_member_positions(new_division,new_job_title) then raise exception 'Invalid assignment';end if;
  update public.profiles set role=new_role,division=new_division,job_title=new_job_title,teams=new_teams where id=target_user;
  insert into public.assignment_audit(actor_id,target_id,previous_role,previous_division,new_role,new_division,details)
  values(actor.id,target_user,previous.role,previous.division,new_role,new_division,jsonb_build_object('action','organization_assignment','previous_access',previous.access_role,'access',previous.access_role,'previous_position',previous.job_title,'position',new_job_title,'previous_teams',previous.teams,'teams',new_teams));
 else
  perform public.manage_portal_member(target_user,previous.display_name,case when new_role in ('Admin','Member') then 'SAHD' else new_role end,new_division,new_job_title,new_teams,case when new_role='Admin' then 'Admin' when new_role='Member' then 'Member' else previous.access_role end,false);
 end if;
end;$$;
revoke all on function public.assign_member_directory(uuid,text,text,text,text[]) from public,anon;
grant execute on function public.assign_member_directory(uuid,text,text,text,text[]) to authenticated;
create or replace function public.manage_portal_member(target_user uuid,new_name text,new_role text,new_division text,new_position text,new_teams text[],new_access text,remove_member boolean default false) returns void
language plpgsql security definer set search_path='' as $$
declare actor public.profiles%rowtype; previous public.profiles%rowtype;
begin
 select * into actor from public.profiles where id=auth.uid();
 if not actor.is_active or actor.access_role not in ('Admin','Superadmin') or actor.id is null then raise exception 'Forbidden';end if;
 if not public.is_active_member() then raise exception 'Forbidden';end if;
 -- Serialize protected-account changes so concurrent removals cannot remove the final Superadmin.
 perform id from public.profiles where access_role='Superadmin' and is_active order by id for update;
 select * into actor from public.profiles where id=auth.uid();
 if not actor.is_active or actor.access_role not in ('Admin','Superadmin') or not public.is_active_member() then raise exception 'Forbidden';end if;
 if target_user=actor.id and actor.access_role<>'Superadmin' then raise exception 'Self management disabled';end if;
 select * into previous from public.profiles where id=target_user and is_active for update;
 if not found then raise exception 'Member not found';end if;
 if previous.access_role='Superadmin' and actor.access_role<>'Superadmin' then raise exception 'Superadmin cannot be changed here';end if;
 if new_access is null or (new_access not in ('Member','Admin') and not(new_access='Superadmin' and actor.access_role='Superadmin' and previous.access_role='Superadmin')) then raise exception 'Invalid access';end if;
 if previous.access_role='Superadmin' and (remove_member or new_access<>'Superadmin') and not exists(select 1 from public.profiles where access_role='Superadmin' and is_active and id<>target_user) then raise exception 'Last Superadmin protected';end if;
 if not remove_member and (new_name is null or length(trim(new_name)) not between 1 and 100 or new_role is null or new_role<>'SAHD'
 or (new_division is not null and new_division not in ('Medical Service','Fire Department')) or new_teams is null or cardinality(new_teams)>4 or not(new_teams <@ array['Finance','Public Relation','Human Resource','Internal Affairs']::text[])
 or not public.valid_member_positions(new_division,new_position)) then raise exception 'Invalid assignment';end if;
 if remove_member then update public.profiles set is_active=false where id=target_user;
 else update public.profiles set display_name=trim(new_name),role=new_role,division=new_division,job_title=new_position,teams=new_teams,access_role=new_access where id=target_user;end if;
 insert into public.assignment_audit(actor_id,target_id,previous_role,previous_division,new_role,new_division,details) values(actor.id,target_user,previous.role,previous.division,new_role,new_division,jsonb_build_object('action',case when remove_member then 'remove_member' else 'edit_member' end,'previous_access',previous.access_role,'access',new_access,'previous_name',previous.display_name,'name',new_name,'position',new_position,'teams',new_teams));
end;$$;
revoke all on function public.manage_portal_member(uuid,text,text,text,text,text[],text,boolean) from public,anon;grant execute on function public.manage_portal_member(uuid,text,text,text,text,text[],text,boolean) to authenticated;

commit;
