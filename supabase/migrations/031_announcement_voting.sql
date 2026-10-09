begin;
create table public.announcement_votes(
 announcement_id uuid not null references public.announcements(id) on delete cascade,
 poll_id uuid not null,user_id uuid not null references public.profiles(id) on delete cascade,
 option_index integer not null check(option_index between 0 and 9),
 updated_at timestamptz not null default now(),primary key(announcement_id,poll_id,user_id)
);
alter table public.announcement_votes enable row level security;
grant select on public.announcement_votes to authenticated;
create policy announcement_votes_read on public.announcement_votes for select to authenticated using(public.portal_can('view') and exists(select 1 from public.announcements a where a.id=announcement_id and a.deleted_at is null and a.status='published'));
create function public.cast_announcement_vote(announcement uuid,poll uuid,choice integer) returns void language plpgsql security definer set search_path='' as $$
declare config jsonb;
begin
 if not public.is_active_member() then raise exception 'Forbidden';end if;
 select n->'attrs' into config from public.announcements a cross join lateral jsonb_array_elements(a.body_json->'content') n where a.id=announcement and a.deleted_at is null and a.status='published' and n->>'type'='poll' and n->'attrs'->>'id'=poll::text for update of a;
 if config is null or (config->>'closesAt')::timestamptz<=now() or choice is null or choice<0 or choice>=jsonb_array_length(config->'options') then raise exception 'Voting closed or invalid choice';end if;
 insert into public.announcement_votes(announcement_id,poll_id,user_id,option_index) values(announcement,poll,auth.uid(),choice) on conflict(announcement_id,poll_id,user_id) do update set option_index=excluded.option_index,updated_at=now();
end;$$;
revoke all on function public.cast_announcement_vote(uuid,uuid,integer) from public,anon;grant execute on function public.cast_announcement_vote(uuid,uuid,integer) to authenticated;
create function public.protect_announcement_polls() returns trigger language plpgsql security definer set search_path='' as $$
declare oldpoll jsonb;newpoll jsonb;
begin
 for oldpoll in select n from jsonb_array_elements(old.body_json->'content') n where n->>'type'='poll' loop
 if exists(select 1 from public.announcement_votes where announcement_id=old.id and poll_id=(oldpoll->'attrs'->>'id')::uuid) then
 select n into newpoll from jsonb_array_elements(new.body_json->'content') n where n->>'type'='poll' and n->'attrs'->>'id'=oldpoll->'attrs'->>'id';
 if newpoll is distinct from oldpoll then raise exception 'Voting that has responses cannot be edited or removed';end if;
 end if;end loop;return new;
end;$$;
create trigger announcement_polls_protect before update of body_json on public.announcements for each row execute function public.protect_announcement_polls();
commit;
