-- Role remains an organizational designation. Admin remains the existing access role.
begin;
alter table public.profiles add column if not exists job_title text;
alter table public.profiles add column if not exists teams text[] not null default '{}';
alter table public.profiles add constraint profiles_job_title_check check (
 job_title is null or (division is not null and division='Medical Service' and job_title in ('General Practitioner','Doctor Resident','Doctor Attending','Trainee','Medical Student'))
 or (division is not null and division='Fire Department' and job_title in ('First Responder','Firefighter','Lieutenant','Captain'))
);
alter table public.profiles add constraint profiles_teams_check check (teams <@ array['Finance','Public Relation','Human Resource','Internal Affairs']::text[]);
create or replace view public.member_directory with(security_invoker=true) as
 select id,display_name,role,division,avatar_path,providers,job_title,teams from public.profiles;
grant select on public.member_directory to authenticated;
alter table public.assignment_audit add column if not exists details jsonb;
create function public.assign_member_directory(target_user uuid,new_role text,new_division text,new_job_title text,new_teams text[]) returns void
language plpgsql security definer set search_path='' as $$
declare previous public.profiles%rowtype;
begin
 if not exists(select 1 from public.profiles where id=auth.uid() and role='Admin') then raise exception 'Forbidden';end if;
 if target_user=auth.uid() then raise exception 'Self assignment disabled';end if;
 if new_role not in ('Admin','Member','SAHD','Deputy','Chief','Advisor','Deputy Director','Director')
 or (new_division is not null and new_division not in ('Medical Service','Fire Department'))
 or new_teams is null or cardinality(new_teams)>4 or not (new_teams <@ array['Finance','Public Relation','Human Resource','Internal Affairs']::text[])
 then raise exception 'Invalid assignment';end if;
 if new_job_title is not null and (new_division is null
 or (new_division='Medical Service' and new_job_title not in ('General Practitioner','Doctor Resident','Doctor Attending','Trainee','Medical Student'))
 or (new_division='Fire Department' and new_job_title not in ('First Responder','Firefighter','Lieutenant','Captain'))) then raise exception 'Invalid position';end if;
 select * into previous from public.profiles where id=target_user for update;
 if not found then raise exception 'Member not found';end if;
 update public.profiles set role=new_role,division=new_division,job_title=new_job_title,teams=new_teams where id=target_user;
 insert into public.assignment_audit(actor_id,target_id,previous_role,previous_division,new_role,new_division,details)
 values(auth.uid(),target_user,previous.role,previous.division,new_role,new_division,jsonb_build_object('previous_position',previous.job_title,'position',new_job_title,'previous_teams',previous.teams,'teams',new_teams));
end;$$;
revoke all on function public.assign_member_directory(uuid,text,text,text,text[]) from public,anon;
grant execute on function public.assign_member_directory(uuid,text,text,text,text[]) to authenticated;
-- Prevent the old three-field RPC from leaving a position assigned to the wrong division.
create or replace function public.assign_member(target_user uuid,new_role text,new_division text) returns void
language plpgsql security definer set search_path='' as $$
begin
 perform public.assign_member_directory(target_user,new_role,new_division,null,'{}'::text[]);
end;$$;
commit;
