create table if not exists public.medical_reports (
 id uuid primary key default gen_random_uuid(),
 created_by uuid not null references public.profiles(id),
 case_title text not null check(length(case_title) between 1 and 2000),
 category text not null check(category in ('minor','major')),
 draft jsonb not null,
 report_text text not null check(length(report_text)<=100000),
 created_at timestamptz not null default now(),
 updated_at timestamptz not null default now()
);
alter table public.medical_reports enable row level security;
create policy medical_report_read on public.medical_reports for select to authenticated using(public.can_read_division('Medical Service'));
create policy medical_report_insert on public.medical_reports for insert to authenticated with check(created_by=auth.uid() and public.can_read_division('Medical Service'));
create policy medical_report_update on public.medical_reports for update to authenticated using(created_by=auth.uid() and public.can_read_division('Medical Service')) with check(created_by=auth.uid() and public.can_read_division('Medical Service'));
revoke all on public.medical_reports from anon,authenticated;
grant select,insert on public.medical_reports to authenticated;
grant update(case_title,category,draft,report_text,updated_at) on public.medical_reports to authenticated;
create index medical_reports_created on public.medical_reports(created_at desc);

insert into storage.buckets(id,name,public,file_size_limit,allowed_mime_types) values('radiology','radiology',false,20971520,array['image/png']) on conflict(id) do nothing;
create policy radiology_read on storage.objects for select to authenticated using(bucket_id='radiology' and public.can_read_division('Medical Service'));
create policy radiology_insert on storage.objects for insert to authenticated with check(bucket_id='radiology' and public.can_read_division('Medical Service') and (storage.foldername(name))[1]=auth.uid()::text);
create table public.radiology_generation_requests(id uuid primary key default gen_random_uuid(),user_id uuid not null references public.profiles(id),created_at timestamptz not null default now());
alter table public.radiology_generation_requests enable row level security;
create index radiology_request_user_time on public.radiology_generation_requests(user_id,created_at);
create function public.reserve_radiology_generation() returns void language plpgsql security definer set search_path='' as $$
begin
 if auth.uid() is null or not public.can_read_division('Medical Service') then raise exception 'Forbidden';end if;
 perform pg_advisory_xact_lock(hashtextextended(auth.uid()::text,0));
 if (select count(*) from public.radiology_generation_requests where user_id=auth.uid() and created_at>now()-interval '1 hour')>=3 then raise exception 'Generation limit reached';end if;
 insert into public.radiology_generation_requests(user_id) values(auth.uid());
end;$$;
revoke all on function public.reserve_radiology_generation() from public,anon;
grant execute on function public.reserve_radiology_generation() to authenticated;
