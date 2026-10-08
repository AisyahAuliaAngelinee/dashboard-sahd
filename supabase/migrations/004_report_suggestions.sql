create table public.report_suggestion_requests(id uuid primary key default gen_random_uuid(),user_id uuid not null references public.profiles(id),created_at timestamptz not null default now());
alter table public.report_suggestion_requests enable row level security;
create index report_suggestion_user_time on public.report_suggestion_requests(user_id,created_at);
create function public.reserve_report_suggestion() returns void language plpgsql security definer set search_path='' as $$
begin
 if auth.uid() is null or not public.can_read_division('Medical Service') then raise exception 'Forbidden';end if;
 perform pg_advisory_xact_lock(hashtextextended(auth.uid()::text,0));
 if (select count(*) from public.report_suggestion_requests where user_id=auth.uid() and created_at>now()-interval '1 hour')>=20 then raise exception 'Generation limit reached';end if;
 insert into public.report_suggestion_requests(user_id) values(auth.uid());
end;$$;
revoke all on function public.reserve_report_suggestion() from public,anon;
grant execute on function public.reserve_report_suggestion() to authenticated;
