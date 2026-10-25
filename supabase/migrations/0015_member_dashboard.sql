-- 0015: member_stats() for the stat tiles on /me as well as Semester Wrapped. One function, one round
-- trip: called with a member alone it covers all time (the /me tiles); with p_from and p_to it covers
-- that term (Wrapped, 0012). It adds two numbers that are always "as of now", whatever the bounds:
--   rank   the member's place by all-time points among public members with points, like the all-time
--          leaderboard (ties share a place); null until they have points, which /me shows as "unranked";
--   streak consecutive semesters with at least one attended event, counting Fall and Spring only:
--          Summer neither counts nor breaks a streak, and the current semester does not break it
--          before the member's first event in it.
-- Replaces the three-argument function from 0012 (a function cannot gain output columns in place).
-- Security definer so it reads past row level security; only the service key may call it, and the
-- site calls it for the signed-in member's own id. Safe to run again.

create or replace function public.semester_streak(p_user uuid) returns int
language plpgsql stable security definer set search_path = public as $$
declare
  done int[];
  cur int;
  n int := 0;
  l timestamp := now() at time zone 'Asia/Riyadh';
begin
  -- Each regular semester as one number, so consecutive ones differ by one: Spring y = 2y, Fall y = 2y + 1.
  select array_agg(distinct extract(year from s)::int * 2 + case when extract(month from s) = 8 then 1 else 0 end)
    into done
    from (select public.term_start(e.starts_at) at time zone 'Asia/Riyadh' as s
          from public.registrations r join public.events e on e.id = r.event_id
          where r.user_id = p_user and r.attended) t
    where extract(month from s) in (1, 8);
  if done is null then return 0; end if;
  -- The semester under way: Fall from August, otherwise Spring (June and July still count as Spring here).
  cur := extract(year from l)::int * 2 + case when extract(month from l) >= 8 then 1 else 0 end;
  if not (cur = any (done)) then cur := cur - 1; end if;
  while cur = any (done) loop
    n := n + 1;
    cur := cur - 1;
  end loop;
  return n;
end $$;

drop function if exists public.member_stats(uuid, timestamptz, timestamptz);
create function public.member_stats(p_user uuid, p_from timestamptz default null, p_to timestamptz default null)
returns table (events int, registered int, posts int, points int, competitions int, flag boolean,
  favourite_type text, rank int, streak int)
language sql stable security definer set search_path = public as $$
  with mine as (
    select e.type, e.starts_at, r.attended
    from public.registrations r join public.events e on e.id = r.event_id
    where r.user_id = p_user and (p_from is null or e.starts_at >= p_from) and (p_to is null or e.starts_at < p_to)
  ), awards as (
    select amount, category from public.points
    where user_id = p_user and (p_from is null or awarded_at >= p_from) and (p_to is null or awarded_at < p_to)
  ), totals as (
    select pt.user_id, sum(pt.amount) as total
    from public.points pt join public.profiles p on p.id = pt.user_id
    where p.onboarded and not p.suspended
    group by pt.user_id having sum(pt.amount) > 0
  )
  select
    (select count(*) from mine where attended)::int,
    (select count(*) from mine)::int,
    (select count(*) from public.posts where author_id = p_user and status = 'published'
      and (p_from is null or published_at >= p_from) and (p_to is null or published_at < p_to))::int,
    (select coalesce(sum(amount), 0) from awards)::int,
    (select coalesce(sum(amount), 0) from awards where category = 'competitions')::int,
    exists (select 1 from public.flag_solvers where user_id = p_user and approved
      and (p_from is null or created_at >= p_from) and (p_to is null or created_at < p_to)),
    (select type from mine where attended group by type order by count(*) desc, max(starts_at) desc limit 1),
    (select r.rank from (select user_id, (rank() over (order by total desc))::int as rank from totals) r
      where r.user_id = p_user),
    public.semester_streak(p_user)
$$;

revoke execute on function public.member_stats(uuid, timestamptz, timestamptz), public.semester_streak(uuid)
  from public, anon, authenticated;
grant execute on function public.member_stats(uuid, timestamptz, timestamptz), public.semester_streak(uuid)
  to service_role;
