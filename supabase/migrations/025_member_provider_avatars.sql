begin;
alter table public.profiles add column provider_avatar_url text;
create function public.sync_member_avatar() returns trigger language plpgsql security definer set search_path='' as $$
declare image_url text;begin
image_url=coalesce(new.raw_user_meta_data->>'avatar_url',new.raw_user_meta_data->>'picture');
update public.profiles set provider_avatar_url=case when image_url ~ '^https://[^/@[:space:]]+([/:?#]|$)' then image_url else null end where id=new.id;
return new;end;$$;
create trigger zz_member_avatar_sync after insert or update of raw_user_meta_data on auth.users for each row execute function public.sync_member_avatar();
update public.profiles p set provider_avatar_url=coalesce(u.raw_user_meta_data->>'avatar_url',u.raw_user_meta_data->>'picture') from auth.users u where u.id=p.id and coalesce(u.raw_user_meta_data->>'avatar_url',u.raw_user_meta_data->>'picture') ~ '^https://[^/@[:space:]]+([/:?#]|$)';
create or replace view public.member_directory with(security_invoker=true) as select id,display_name,role,division,avatar_path,providers,job_title,teams,access_role,badge_number,provider_avatar_url as avatar_url from public.profiles where is_active;
commit;
