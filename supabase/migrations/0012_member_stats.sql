-- 0012: member_stats(), the numbers behind Semester Wrapped (/me/wrapped and its image). For one member
-- and one term [p_from, p_to): events attended and reserved (by the event's start), posts first
-- published, points awarded (the ledger from 0005, by awarded_at, so the total matches the term
-- leaderboard), points from competitions, whether they solved the flag, and the event type they
-- attended most (ties go to the type of their latest event). Only the service key may call it: the
-- site calls it for the signed-in member's own id, and a token must not ask about anyone else. Safe to
-- run again.

create or replace function public.member_stats(p_user uuid, p_from timestamptz, p_to timestamptz)
returns table (events int, registered int, posts int, points int, competitions int, flag boolean, favourite_type text)
language sql stable set search_path = public as $$
  with mine as (
    select e.type, e.starts_at, r.attended
    from public.registrations r join public.events e on e.id = r.event_id
    where r.user_id = p_user and e.starts_at >= p_from and e.starts_at < p_to
  )
  select
    (select count(*) from mine where attended)::int,
    (select count(*) from mine)::int,
    (select count(*) from public.posts
      where author_id = p_user and status = 'published' and published_at >= p_from and published_at < p_to)::int,
    (select coalesce(sum(amount), 0) from public.points
      where user_id = p_user and awarded_at >= p_from and awarded_at < p_to)::int,
    (select coalesce(sum(amount), 0) from public.points
      where user_id = p_user and category = 'competitions' and awarded_at >= p_from and awarded_at < p_to)::int,
    exists (select 1 from public.flag_solvers
      where user_id = p_user and approved and created_at >= p_from and created_at < p_to),
    (select type from mine where attended group by type order by count(*) desc, max(starts_at) desc limit 1)
$$;

revoke execute on function public.member_stats(uuid, timestamptz, timestamptz) from public, anon, authenticated;
grant execute on function public.member_stats(uuid, timestamptz, timestamptz) to service_role;
