-- Superadmins can edit organizational assignments without changing protected access levels.
begin;
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
  if new_role is null or new_role not in ('SAHD','Deputy','Chief','Advisor','Deputy Director','Director','Medical Student')
   or (new_division is not null and new_division not in ('Medical Service','Fire Department'))
   or new_teams is null or cardinality(new_teams)>4 or not(new_teams <@ array['Finance','Public Relation','Human Resource','Internal Affairs']::text[])
   or (new_job_title is not null and new_job_title<>'Trainee' and (new_division is null
    or (new_division='Medical Service' and new_job_title not in ('General Practitioner','Doctor Resident','Doctor Attending','Medical Student'))
    or (new_division='Fire Department' and new_job_title not in ('First Responder','Firefighter','Lieutenant','Captain')))) then raise exception 'Invalid assignment';end if;
  update public.profiles set role=new_role,division=new_division,job_title=new_job_title,teams=new_teams where id=target_user;
  insert into public.assignment_audit(actor_id,target_id,previous_role,previous_division,new_role,new_division,details)
  values(actor.id,target_user,previous.role,previous.division,new_role,new_division,jsonb_build_object('action','organization_assignment','previous_access',previous.access_role,'access',previous.access_role,'previous_position',previous.job_title,'position',new_job_title,'previous_teams',previous.teams,'teams',new_teams));
 else
  perform public.manage_portal_member(target_user,previous.display_name,case when new_role in ('Admin','Member') then 'SAHD' else new_role end,new_division,new_job_title,new_teams,case when new_role='Admin' then 'Admin' when new_role='Member' then 'Member' else previous.access_role end,false);
 end if;
end;$$;
revoke all on function public.assign_member_directory(uuid,text,text,text,text[]) from public,anon;
grant execute on function public.assign_member_directory(uuid,text,text,text,text[]) to authenticated;
commit;
