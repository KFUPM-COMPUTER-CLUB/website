-- 0006: the public leaderboard (/leaderboard), built on the points ledger from 0005. Showing a name
-- is opt-in: a member ticks "Show me on the leaderboard" on /me/profile (show_on_leaderboard). Everyone
-- else in the top 20 still appears, as an anonymous row, so ranks and totals stay honest without
-- naming anyone who did not ask to be named. Safe to run again.

alter table public.profiles add column if not exists show_on_leaderboard boolean not null default false;

-- The public profile view gains the flag, so /u/<handle> shows a member's points only when they opted
-- in. "create or replace view" only allows new columns at the end, which is why it is last.
create or replace view public.profiles_public as
  select id, handle, name, bio, avatar_url, github, linkedin, major, year, show_in_contributors, created_at, committee_id,
    show_on_leaderboard
  from public.profiles where onboarded and not suspended;
grant select on public.profiles_public to anon, authenticated;

-- The start of the academic term a moment falls in, by the Riyadh calendar: August to December is
-- Fall, January to May Spring, June and July Summer. Same rule as termOf() in src/lib/content.ts.
create or replace function public.term_start(p_at timestamptz) returns timestamptz language sql stable as $$
  select make_timestamptz(extract(year from l)::int,
    case when extract(month from l) >= 8 then 8 when extract(month from l) <= 5 then 1 else 6 end, 1, 0, 0, 0, 'Asia/Riyadh')
  from (select p_at at time zone 'Asia/Riyadh' as l) t
$$;

-- The top 20 for a period ('term' or 'all') and a category ('all' or one of the points categories).
-- Security definer because the points table is readable only by its owner and officers; it returns
-- totals only, and a handle, name and photo only for members who opted in. Ties share a rank, and the
-- member who joined earlier is listed first among them. Unknown arguments return no rows.
create or replace function public.leaderboard(p_period text, p_category text)
returns table (rank int, handle text, name text, avatar_url text, total int)
language sql stable security definer set search_path = public as $$
  with totals as (
    select pt.user_id, sum(pt.amount)::int as total
    from public.points pt
    where (p_period = 'all' or (p_period = 'term' and pt.awarded_at >= public.term_start(now())))
      and (p_category = 'all' or pt.category = p_category)
    group by pt.user_id
  )
  select (rank() over (order by t.total desc))::int,
    case when p.show_on_leaderboard then p.handle end,
    case when p.show_on_leaderboard then p.name end,
    case when p.show_on_leaderboard then p.avatar_url end,
    t.total
  from totals t join public.profiles p on p.id = t.user_id
  where p.onboarded and not p.suspended and t.total > 0
  order by t.total desc, p.created_at
  limit 20
$$;

grant execute on function public.term_start(timestamptz), public.leaderboard(text, text) to anon, authenticated;
