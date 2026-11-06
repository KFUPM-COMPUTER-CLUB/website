-- 0016: member_points() honours the leaderboard opt-in. It is security definer and callable with the
-- public anon key, and it only checked onboarded and suspended, so anyone could read the total of a member
-- who never ticked "Show me on the leaderboard" (POST /rest/v1/rpc/member_points with an id from
-- profiles_public), and match the totals of the anonymous leaderboard rows back to people.
-- leaderboard(), writers_leaderboard() and profile_badges() already apply the opt-in in SQL; this
-- brings member_points() in line: a member who has not opted in gets 0, however it is called.
-- /u/<handle> still skips the call for them. Safe to run again.

create or replace function public.member_points(p_user uuid) returns int
language sql stable security definer set search_path = public as $$
  select coalesce(sum(pt.amount), 0)::int
  from public.points pt join public.profiles p on p.id = pt.user_id
  where pt.user_id = p_user and p.onboarded and not p.suspended and p.show_on_leaderboard
$$;
grant execute on function public.member_points(uuid) to anon, authenticated;
