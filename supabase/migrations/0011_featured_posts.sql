-- 0011: the featured post of the month and the writers' leaderboard on /blog. Reviewers feature one
-- published post per month from the review page (/admin/posts/<id>); featured_month is the first day of
-- that Riyadh month, and the unique index keeps it to one post. The leaderboard ranks writers by posts
-- published this term and, like leaderboard() in 0006, names only members who opted in
-- (profiles.show_on_leaderboard). Safe to run again.

alter table public.posts add column if not exists featured_month date;
create unique index if not exists posts_featured_month_once on public.posts (featured_month)
  where featured_month is not null;

-- The top writers since p_since (the start of the term, from term_start() in 0006): members with at
-- least one post published since then, ranked by those posts, then by the newest of them, then by who
-- joined first. Security definer because profiles is not readable by a visitor's token; it returns the
-- post count, and a handle, name and photo only for members who opted in. Everyone else keeps their
-- place as an anonymous row, the same rule as /leaderboard.
create or replace function public.writers_leaderboard(p_since timestamptz, p_limit int default 5)
returns table (handle text, name text, avatar_url text, posts int)
language sql stable security definer set search_path = public as $$
  with recent as (
    select author_id, count(*)::int as posts, max(published_at) as latest from public.posts
    where status = 'published' and author_id is not null and published_at >= p_since
    group by author_id
  )
  select case when pf.show_on_leaderboard then pf.handle end,
    case when pf.show_on_leaderboard then pf.name end,
    case when pf.show_on_leaderboard then pf.avatar_url end,
    w.posts
  from recent w join public.profiles pf on pf.id = w.author_id
  where pf.onboarded and not pf.suspended
  order by w.posts desc, w.latest desc, pf.created_at
  limit least(greatest(coalesce(p_limit, 5), 1), 20)
$$;

grant execute on function public.writers_leaderboard(timestamptz, int) to anon, authenticated;
