begin;
do $migration$ declare f record; definition text;begin
for f in select p.oid from pg_proc p join pg_namespace n on n.oid=p.pronamespace where n.nspname='public' and p.proname in ('consultation_notify','consultation_update_mentions','can_approve_consultation','validate_position_mentions') loop
 definition:=pg_get_functiondef(f.oid);
 definition:=replace(definition,'(new.mentions->''positions'') ? p.job_title','(new.mentions->''positions'') ?| string_to_array(p.job_title,'', '')');
 definition:=replace(definition,'(c.mentions->''positions'') ? p.job_title','(c.mentions->''positions'') ?| string_to_array(p.job_title,'', '')');
 definition:=replace(definition,'p.job_title=x#>>''{}''','(x#>>''{}'')=any(string_to_array(p.job_title,'', ''))');
 execute definition;
end loop;end;$migration$;
commit;
