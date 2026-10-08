-- Run after 009. Done is terminal; cancellation requires a reason.
alter table public.consultations add column cancellation_reason text not null default '';
update public.consultations set status='Canceled',cancellation_reason='Keterangan pembatalan belum tersedia.' where status='Cancelled';
create function public.consultation_status_guard() returns trigger language plpgsql set search_path='' as $$
begin
 if tg_op='INSERT' then
  if new.status<>'Pending' then raise exception 'New consultations must be Pending';end if;
 else
  if old.status='Done' and new.status is distinct from old.status then raise exception 'Done consultation cannot change status';end if;
  if new.status is distinct from old.status and not(old.status='Pending' and new.status in ('Done','Canceled')) then raise exception 'Invalid status transition';end if;
 end if;
 if new.status='Canceled' and (length(trim(new.cancellation_reason))<1 or length(new.cancellation_reason)>2000) then raise exception 'Cancellation reason is required';end if;
 return new;
end;$$;
create trigger consultation_status_protection before insert or update of status,cancellation_reason on public.consultations for each row execute function public.consultation_status_guard();
create function public.cancel_consultation(consultation_id uuid,reason text) returns public.consultations language plpgsql security definer set search_path='' as $$
declare result public.consultations;
begin
 if reason is null or length(trim(reason))<1 or length(reason)>2000 then raise exception 'Invalid cancellation reason';end if;
 update public.consultations c set status='Canceled',cancellation_reason=trim(reason) where c.id=consultation_id and c.deleted_at is null and c.status='Pending' and (c.created_by=auth.uid() or public.can_read_division(c.division) or exists(select 1 from public.consultation_recipients r where r.consultation_id=c.id and r.recipient_id=auth.uid())) returning * into result;
 if not found then raise exception 'Consultation unavailable';end if;
 return result;
end;$$;
revoke all on function public.cancel_consultation(uuid,text) from public,anon;
grant execute on function public.cancel_consultation(uuid,text) to authenticated;
