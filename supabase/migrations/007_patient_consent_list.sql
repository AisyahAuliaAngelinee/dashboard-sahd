alter table public.patient_consents add column created_by_name text;
update public.patient_consents c set created_by_name=p.display_name from public.profiles p where c.created_by=p.id;
create function public.trash_patient_consents(consent_ids uuid[]) returns void language plpgsql security definer set search_path='' as $$
begin
 if auth.uid() is null or not public.can_read_division('Medical Service') then raise exception 'Forbidden';end if;
 if cardinality(consent_ids)<1 or cardinality(consent_ids)>1000 then raise exception 'Invalid selection';end if;
 if (select count(*) from public.patient_consents where id=any(consent_ids) and created_by=auth.uid() and deleted_at is null)<>cardinality(consent_ids) then raise exception 'Forbidden selection';end if;
 update public.patient_consents set deleted_at=now(),updated_at=now() where id=any(consent_ids) and created_by=auth.uid() and deleted_at is null;
end;$$;
revoke all on function public.trash_patient_consents(uuid[]) from public,anon;
grant execute on function public.trash_patient_consents(uuid[]) to authenticated;
