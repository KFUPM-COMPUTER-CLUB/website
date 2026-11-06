-- 0017: a suspended account loses its role in the database, not only on the site. Suspending set
-- profiles.suspended and the middleware answered 403, but my_role() and has_role() never looked at it,
-- so a suspended officer or admin could still read every policy-protected row (emails and phones,
-- WhatsApp links, registrations, unpublished events) straight from the Data API with their own token.
--
--   my_role()    null for a suspended profile, as for no session at all;
--   role_rank()  the same ladder as ROLE_RANK in src/lib/types.ts, with 'member' named, and null for an
--                unknown or missing role (it used to rank those 0, like a member);
--   has_role()   false when either side is unranked, so has_role('member') is false for the anon key and
--                for a suspended account, and a policy that someday asks for 'member' admits members only.
--
-- A member's own rows (id = auth.uid()) stay readable, so the middleware can still see the suspension.
-- The suspend action on /admin/members also bans the account in Supabase Auth, which ends its
-- sessions. Same signatures, so the grants from 0001 still apply. Safe to run again.

create or replace function public.role_rank(r text) returns int language sql immutable as $$
  select case r when 'admin' then 4 when 'officer' then 3 when 'reviewer' then 2 when 'editor' then 1 when 'member' then 0 end
$$;
create or replace function public.my_role() returns text language sql stable security definer set search_path = public as $$
  select case
    when auth.uid() is null then null
    when exists (select 1 from public.profiles where id = auth.uid() and suspended) then null
    else coalesce((select role from public.user_roles where user_id = auth.uid()), 'member')
  end
$$;
create or replace function public.has_role(min_role text) returns boolean language sql stable security definer set search_path = public as $$
  select coalesce(public.role_rank(public.my_role()) >= public.role_rank(min_role), false)
$$;
