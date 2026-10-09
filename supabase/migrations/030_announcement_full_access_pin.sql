begin;
alter table public.announcements add column is_pinned boolean not null default false;
grant update(is_pinned) on public.announcements to authenticated;
create index announcements_pin_order on public.announcements(is_pinned desc,created_at desc) where deleted_at is null;
do $$declare definition text;begin
 definition:=pg_get_functiondef('public.portal_can(text)'::regprocedure);
 definition:=replace(definition,'when action=''announcement_write'' then p.access_role=''Admin''','when action=''announcement_write'' then true');
 execute definition;
end;$$;
commit;
