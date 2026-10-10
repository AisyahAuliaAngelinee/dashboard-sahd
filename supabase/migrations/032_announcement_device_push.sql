begin;
create table public.announcement_push_subscriptions(id uuid primary key default gen_random_uuid(),user_id uuid not null references public.profiles(id) on delete cascade,endpoint text not null unique,keys jsonb not null,enabled boolean not null default true,created_at timestamptz not null default now());
alter table public.announcement_push_subscriptions enable row level security;
create policy push_own on public.announcement_push_subscriptions for all to authenticated using(user_id=auth.uid() and public.is_active_member()) with check(user_id=auth.uid() and public.is_active_member());
grant select,insert,delete on public.announcement_push_subscriptions to authenticated;grant update(enabled,keys) on public.announcement_push_subscriptions to authenticated;
create table public.announcement_push_jobs(id uuid primary key default gen_random_uuid(),announcement_id uuid not null references public.announcements(id) on delete cascade,subscription_id uuid not null references public.announcement_push_subscriptions(id) on delete cascade,attempts integer not null default 0,next_attempt_at timestamptz not null default now(),sent_at timestamptz,unique(announcement_id,subscription_id));
alter table public.announcement_push_jobs enable row level security;
create function public.enqueue_announcement_push() returns trigger language plpgsql security definer set search_path='' as $$begin
 if new.status='published' and (TG_OP='INSERT' or old.status is distinct from 'published') then
 insert into public.announcement_push_jobs(announcement_id,subscription_id) select new.id,s.id from public.announcement_push_subscriptions s join public.profiles p on p.id=s.user_id where s.enabled and p.is_active on conflict do nothing;
 end if;return new;end;$$;
create trigger announcement_push_enqueue after insert or update of status on public.announcements for each row execute function public.enqueue_announcement_push();
create function public.claim_announcement_push(batch_size integer default 100) returns table(job_id uuid,subscription_id uuid,endpoint text,keys jsonb,title text,announcement_id uuid) language sql security definer set search_path='' as $$
 with claimed as (update public.announcement_push_jobs j set attempts=j.attempts+1,next_attempt_at=now()+interval '2 minutes' where j.id in(select q.id from public.announcement_push_jobs q join public.announcement_push_subscriptions s on s.id=q.subscription_id join public.profiles p on p.id=s.user_id join public.announcements a on a.id=q.announcement_id where q.sent_at is null and q.attempts<5 and q.next_attempt_at<=now() and s.enabled and p.is_active and a.deleted_at is null and a.status='published' order by q.next_attempt_at limit least(greatest(batch_size,1),100) for update of q skip locked) returning j.*)
 select c.id,s.id,s.endpoint,s.keys,a.title,a.id from claimed c join public.announcement_push_subscriptions s on s.id=c.subscription_id join public.announcements a on a.id=c.announcement_id;
$$;
revoke all on function public.claim_announcement_push(integer) from public,anon,authenticated;grant execute on function public.claim_announcement_push(integer) to service_role;
grant all on public.announcement_push_subscriptions,public.announcement_push_jobs to service_role;
commit;
