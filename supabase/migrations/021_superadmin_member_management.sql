-- Superadmins may manage protected accounts; retain at least one active Superadmin.
begin;
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
 if not remove_member and (new_name is null or length(trim(new_name)) not between 1 and 100 or new_role not in ('SAHD','Deputy','Chief','Advisor','Deputy Director','Director','Medical Student')
 or (new_division is not null and new_division not in ('Medical Service','Fire Department')) or new_teams is null or cardinality(new_teams)>4 or not(new_teams <@ array['Finance','Public Relation','Human Resource','Internal Affairs']::text[])
 or (new_position is not null and new_position<>'Trainee' and (new_division is null or (new_division='Medical Service' and new_position not in ('General Practitioner','Doctor Resident','Doctor Attending','Medical Student')) or (new_division='Fire Department' and new_position not in ('First Responder','Firefighter','Lieutenant','Captain'))))) then raise exception 'Invalid assignment';end if;
 if remove_member then update public.profiles set is_active=false where id=target_user;
 else update public.profiles set display_name=trim(new_name),role=new_role,division=new_division,job_title=new_position,teams=new_teams,access_role=new_access where id=target_user;end if;
 insert into public.assignment_audit(actor_id,target_id,previous_role,previous_division,new_role,new_division,details) values(actor.id,target_user,previous.role,previous.division,new_role,new_division,jsonb_build_object('action',case when remove_member then 'remove_member' else 'edit_member' end,'previous_access',previous.access_role,'access',new_access,'previous_name',previous.display_name,'name',new_name,'position',new_position,'teams',new_teams));
end;$$;
revoke all on function public.manage_portal_member(uuid,text,text,text,text,text[],text,boolean) from public,anon;grant execute on function public.manage_portal_member(uuid,text,text,text,text,text[],text,boolean) to authenticated;

commit;
