-- 0011: the featured post of the month and the writers' leaderboard on /blog. Reviewers feature one
-- published post per month from the review page (/admin/posts/<id>); featured_month is the first day of
-- that Riyadh month, and the unique index keeps it to one post. The leaderboard ranks writers by posts
-- published this term, then by reads this term. Reads are counted per post and per Riyadh day, with no
-- names and no cookies: the post page sends one request after a reader has stayed a little while, and
-- /api/posts/<id>/read throttles repeats from the same address. Safe to run again.

alter table public.posts add column if not exists featured_month date;
create unique index if not exists posts_featured_month_once on public.posts (featured_month)
  where featured_month is not null;

create table if not exists public.post_reads (
  post_id uuid not null references public.posts(id) on delete cascade,
  day date not null,
  count int not null default 0,
  primary key (post_id, day)
);
-- Counts never reach a token directly: writers_leaderboard() returns the sums. The service key writes
-- through count_post_read() below.
alter table public.post_reads enable row level security;
grant all on public.post_reads to service_role;

-- One read of a published post, on today's Riyadh date. Unpublished posts and unknown ids count nothing.
create or replace function public.count_post_read(p_post uuid) returns void
language sql security definer set search_path = public as $$
  insert into public.post_reads (post_id, day, count)
    select id, (now() at time zone 'Asia/Riyadh')::date, 1 from public.posts where id = p_post and status = 'published'
  on conflict (post_id, day) do update set count = public.post_reads.count + 1
$$;

-- The top writers since p_since (the start of the term, from term_start() in 0006): members with at
-- least one post published since then, ranked by those posts, then by reads since then on all their
-- published posts, then by who joined first. Security definer because profiles and post_reads are not
-- readable by a visitor's token; it returns what a post's byline already shows, plus two counts.
create or replace function public.writers_leaderboard(p_since timestamptz, p_limit int default 5)
returns table (handle text, name text, avatar_url text, posts int, reads int)
language sql stable security definer set search_path = public as $$
  with recent as (
    select author_id, count(*)::int as posts from public.posts
    where status = 'published' and author_id is not null and published_at >= p_since
    group by author_id
  ), reads as (
    select p.author_id, sum(r.count)::int as reads
    from public.post_reads r join public.posts p on p.id = r.post_id
    where p.status = 'published' and r.day >= (p_since at time zone 'Asia/Riyadh')::date
    group by p.author_id
  )
  select pf.handle, pf.name, pf.avatar_url, w.posts, coalesce(rd.reads, 0)
  from recent w join public.profiles pf on pf.id = w.author_id left join reads rd on rd.author_id = w.author_id
  where pf.onboarded and not pf.suspended
  order by w.posts desc, coalesce(rd.reads, 0) desc, pf.created_at
  limit least(greatest(coalesce(p_limit, 5), 1), 20)
$$;

grant execute on function public.writers_leaderboard(timestamptz, int) to anon, authenticated;
revoke execute on function public.count_post_read(uuid) from public, anon, authenticated;
grant execute on function public.count_post_read(uuid) to service_role;
