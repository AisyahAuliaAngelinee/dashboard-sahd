-- Report metadata foundation; the Big Fire document format is still pending.
begin;
create table public.fire_reports (
 id uuid primary key default gen_random_uuid(),
 title text not null check(length(trim(title)) between 1 and 2000),
 status text not null default 'resolved' check(status in ('pending','resolved')),
 created_by uuid not null references public.profiles(id),
 created_at timestamptz not null default now(),
 deleted_at timestamptz
);
alter table public.fire_reports enable row level security;
create policy fire_report_read on public.fire_reports for select to authenticated using(public.can_read_division('Fire Department'));
revoke all on public.fire_reports from anon,authenticated;
grant select on public.fire_reports to authenticated;
create index fire_report_dashboard on public.fire_reports(created_at) where deleted_at is null and status='resolved';
do $$declare t text;begin
 foreach t in array array['medical_reports','fire_reports'] loop
  if not exists(select 1 from pg_publication_tables where pubname='supabase_realtime' and schemaname='public' and tablename=t) then execute format('alter publication supabase_realtime add table public.%I',t);end if;
 end loop;
end$$;
commit;
