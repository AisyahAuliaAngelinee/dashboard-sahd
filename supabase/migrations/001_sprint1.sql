-- Run once in the selected Supabase project. No sample users/patient data seeded.
create table public.profiles (
 id uuid primary key references auth.users(id) on delete cascade,
 display_name text not null check(length(trim(display_name)) between 1 and 100),
 role text not null default 'Member', division text check(division in ('Medical Service','Fire Department')),
 avatar_path text, notifications_enabled boolean not null default true,
 providers text[] not null default '{}', created_at timestamptz not null default now()
);
alter table public.profiles enable row level security;
create policy profiles_read on public.profiles for select to authenticated using (true);
create policy profiles_own_update on public.profiles for update to authenticated using(id=auth.uid()) with check(id=auth.uid());
revoke all on public.profiles from anon,authenticated;
grant select on public.profiles to authenticated;
grant update(display_name,avatar_path,notifications_enabled) on public.profiles to authenticated;
create view public.member_directory with(security_invoker=true) as select id,display_name,role,division,avatar_path,providers from public.profiles;
grant select on public.member_directory to authenticated;
create function public.create_member_profile() returns trigger language plpgsql security definer set search_path='' as $$
begin
 insert into public.profiles(id,display_name,providers) values(new.id,left(coalesce(nullif(trim(new.raw_user_meta_data->>'display_name'),''),nullif(trim(new.raw_user_meta_data->>'full_name'),''),'Member'),100),array[case new.raw_app_meta_data->>'provider' when 'email' then 'Register' when 'google' then 'Google' when 'discord' then 'Discord' else 'Register' end]);
 return new;
end;$$;
create trigger on_auth_user_created after insert on auth.users for each row execute procedure public.create_member_profile();
-- Backfill accounts created before migration. No role/division from metadata is accepted.
insert into public.profiles(id,display_name,providers) select id,left(coalesce(nullif(trim(raw_user_meta_data->>'display_name'),''),nullif(trim(raw_user_meta_data->>'full_name'),''),'Member'),100),array[case raw_app_meta_data->>'provider' when 'email' then 'Register' when 'google' then 'Google' when 'discord' then 'Discord' else 'Register' end] from auth.users on conflict(id) do nothing;
create function public.sync_member_providers() returns trigger language plpgsql security definer set search_path='' as $$
begin
 update public.profiles set providers=(select array_agg(distinct case provider when 'email' then 'Register' when 'google' then 'Google' when 'discord' then 'Discord' else provider end) from auth.identities where user_id=coalesce(new.user_id,old.user_id)) where id=coalesce(new.user_id,old.user_id);
 return coalesce(new,old);
end;$$;
create trigger identity_provider_sync after insert or update or delete on auth.identities for each row execute procedure public.sync_member_providers();
create function public.can_read_division(target text) returns boolean language sql stable security definer set search_path='' as $$ select exists(select 1 from public.profiles where id=auth.uid() and division=target) $$;
create table public.announcements(id uuid primary key default gen_random_uuid(),title text not null,subtitle text,body_text text,status text not null default 'draft',created_by uuid references public.profiles(id),created_at timestamptz not null default now(),published_at timestamptz,deleted_at timestamptz,deleted_by uuid references public.profiles(id),purge_after timestamptz);
create table public.consultations(id uuid primary key default gen_random_uuid(),name text not null,complaint text not null default '',doctor_name text,appointment_date date not null,status text not null default 'Pending',division text not null check(division in ('Medical Service','Fire Department')),created_by uuid references public.profiles(id),created_at timestamptz not null default now(),deleted_at timestamptz,deleted_by uuid references public.profiles(id),purge_after timestamptz);
create table public.procedures(id uuid primary key default gen_random_uuid(),category text not null check(category in ('minor','major')),status text not null default 'pending',report_final boolean not null default false,performed_at timestamptz,division text not null default 'Medical Service',deleted_at timestamptz);
create table public.notifications(id uuid primary key default gen_random_uuid(),recipient_id uuid not null references public.profiles(id),title text not null,body text,type text not null check(type in ('announcement','appointment','mention')),is_mentioned boolean not null default false,target_path text not null check(target_path~'^/(announcements|consultations|reports)/[a-zA-Z0-9-]+$'),read_at timestamptz,created_at timestamptz not null default now());
alter table public.announcements enable row level security;
alter table public.consultations enable row level security;
alter table public.procedures enable row level security;
alter table public.notifications enable row level security;
create policy announcement_read on public.announcements for select to authenticated using(status='published' and deleted_at is null);
create policy consultation_read on public.consultations for select to authenticated using(public.can_read_division(division) and deleted_at is null);
create policy procedure_read on public.procedures for select to authenticated using(public.can_read_division(division) and deleted_at is null);
create policy notification_read on public.notifications for select to authenticated using(recipient_id=auth.uid());
create policy notification_update on public.notifications for update to authenticated using(recipient_id=auth.uid()) with check(recipient_id=auth.uid());
revoke all on public.announcements,public.consultations,public.procedures,public.notifications from anon,authenticated;
grant select on public.announcements,public.consultations,public.procedures,public.notifications to authenticated;
grant update(read_at) on public.notifications to authenticated;
create index consultation_schedule on public.consultations(division,appointment_date,created_at) where deleted_at is null;
create index completed_procedures on public.procedures(performed_at) where deleted_at is null and status='completed' and report_final=true;
create index notifications_recipient on public.notifications(recipient_id,created_at desc);
create table public.assignment_audit(id uuid primary key default gen_random_uuid(),actor_id uuid not null references public.profiles(id),target_id uuid not null references public.profiles(id),previous_role text,previous_division text,new_role text,new_division text,created_at timestamptz not null default now());
alter table public.assignment_audit enable row level security;
create policy assignment_audit_admin_read on public.assignment_audit for select to authenticated using(exists(select 1 from public.profiles where id=auth.uid() and role='Admin'));
grant select on public.assignment_audit to authenticated;
create function public.assign_member(target_user uuid,new_role text,new_division text) returns void language plpgsql security definer set search_path='' as $$
declare previous public.profiles%rowtype;
begin
 if not exists(select 1 from public.profiles where id=auth.uid() and role='Admin') then raise exception 'Forbidden';end if;
 if target_user=auth.uid() then raise exception 'Self assignment disabled';end if;
 if new_role not in ('Member','General Doctor','Specialist','Pharmacist','Firefighter','Admin') or (new_division is not null and new_division not in ('Medical Service','Fire Department')) then raise exception 'Invalid assignment';end if;
 select * into previous from public.profiles where id=target_user for update;
 if not found then raise exception 'Member not found';end if;
 update public.profiles set role=new_role,division=new_division where id=target_user;
 insert into public.assignment_audit(actor_id,target_id,previous_role,previous_division,new_role,new_division) values(auth.uid(),target_user,previous.role,previous.division,new_role,new_division);
end;$$;
revoke all on function public.assign_member(uuid,text,text) from public,anon;
grant execute on function public.assign_member(uuid,text,text) to authenticated;
insert into storage.buckets(id,name,public,file_size_limit,allowed_mime_types) values('avatars','avatars',false,2097152,array['image/png','image/jpeg','image/webp']);
create policy avatar_read on storage.objects for select to authenticated using(bucket_id='avatars');
create policy avatar_insert on storage.objects for insert to authenticated with check(bucket_id='avatars' and (storage.foldername(name))[1]=auth.uid()::text);
create policy avatar_delete on storage.objects for delete to authenticated using(bucket_id='avatars' and (storage.foldername(name))[1]=auth.uid()::text);
-- Bootstrap the first admin manually via trusted SQL after creating your own verified user.
-- UPDATE public.profiles SET role='Admin' WHERE id='<your verified user UUID>';
