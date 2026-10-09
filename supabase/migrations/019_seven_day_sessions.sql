-- Limit portal and direct Supabase access to seven days after session creation.
-- Token refresh does not change auth.sessions.created_at.
begin;
create or replace function public.is_active_member() returns boolean
language sql stable security definer set search_path='' as $$
 select exists(select 1 from public.profiles p join auth.sessions s on s.user_id=p.id
 where p.id=auth.uid() and p.is_active
 and s.id::text=auth.jwt()->>'session_id'
 and s.created_at > now()-interval '7 days');
$$;
revoke all on function public.is_active_member() from public,anon;
grant execute on function public.is_active_member() to authenticated;
commit;
