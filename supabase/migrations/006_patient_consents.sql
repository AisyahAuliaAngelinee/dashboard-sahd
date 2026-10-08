create table public.patient_consents (
 id uuid primary key default gen_random_uuid(),created_by uuid not null references public.profiles(id),data jsonb not null,
 share_token uuid not null unique default gen_random_uuid(),created_at timestamptz not null default now(),updated_at timestamptz not null default now(),deleted_at timestamptz
);
alter table public.patient_consents enable row level security;
create policy consent_read on public.patient_consents for select to authenticated using(public.can_read_division('Medical Service') and deleted_at is null);
create policy consent_insert on public.patient_consents for insert to authenticated with check(created_by=auth.uid() and public.can_read_division('Medical Service'));
create policy consent_update on public.patient_consents for update to authenticated using(created_by=auth.uid() and public.can_read_division('Medical Service') and deleted_at is null) with check(created_by=auth.uid());
grant select,insert,update on public.patient_consents to authenticated;
create function public.read_shared_consent(token uuid) returns jsonb language sql stable security definer set search_path='' as $$ select data from public.patient_consents where share_token=token and deleted_at is null; $$;
revoke all on function public.read_shared_consent(uuid) from public;
grant execute on function public.read_shared_consent(uuid) to anon,authenticated;
