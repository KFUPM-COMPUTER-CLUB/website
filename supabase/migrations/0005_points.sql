-- 0005: points. Members earn points for attending events, publishing posts, solving the flag and
-- placing in competitions, and officers can award or take back points by hand. Points are a ledger,
-- one row per award and never a running total, so every total is a sum that can be explained row by
-- row and cannot drift. The leaderboard, badges and dashboard stats build on this table.
--
-- Automatic awards are triggers rather than API code, so every path that changes the underlying row
-- keeps the points in step: the attendance button, the review page, approving a flag solver, the
-- audit log's undo, a cascade from a deleted event. Ticking attendance adds the award and unticking
-- removes it; a post earns its points while it is published; an approved flag solver with an account
-- earns the flag once. Manual awards (auto = false) are only ever written by /api/admin/points.
-- Safe to run again.

create table if not exists public.points (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  amount int not null check (amount <> 0 and amount between -1000 and 1000),
  category text not null check (category in ('events', 'posts', 'flag', 'competitions', 'other')),
  reason text not null default '' check (char_length(reason) <= 200),
  -- An award tied to an event or a post goes with it when that row is deleted.
  event_id uuid references public.events(id) on delete cascade,
  post_id uuid references public.posts(id) on delete cascade,
  auto boolean not null default false,
  awarded_by uuid references public.profiles(id) on delete set null,
  -- The moment the points count for, which decides the term on the leaderboard: the event's start,
  -- the post's first publish, the flag submission, or the time of a manual award.
  awarded_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);
create index if not exists points_user_idx on public.points (user_id, awarded_at desc);
create index if not exists points_awarded_idx on public.points (awarded_at desc);
-- One automatic award per member per thing, so a trigger firing twice (or this file running again)
-- never pays twice. The flag has no reference, hence the zero uuid.
create unique index if not exists points_auto_once on public.points
  (user_id, category, coalesce(event_id, post_id, '00000000-0000-0000-0000-000000000000'::uuid)) where auto;

-- What each automatic award is worth. Competitions have no fixed value: officers enter the amount
-- for each placing on /admin/points. Changing a value here applies to new awards only.
create or replace function public.point_value(p_category text) returns int language sql immutable as $$
  select case p_category when 'events' then 10 when 'posts' then 25 when 'flag' then 50 else 0 end
$$;

-- ── Automatic awards ─────────────────────────────────────────────────────
-- Each sync_* function makes the ledger agree with the source rows for one member and one thing,
-- whatever changed: it removes the award when the condition no longer holds and adds it (once) when
-- it does. The triggers below call them with the old and the new values, so moving a row between
-- members or events is handled too. Security definer so an award never depends on the writer's
-- grants; execute is revoked from tokens at the end of the file.

create or replace function public.sync_attendance_points(p_user uuid, p_event uuid) returns void
language plpgsql security definer set search_path = public as $$
begin
  if p_user is null or p_event is null then return; end if;
  if exists (select 1 from public.registrations where user_id = p_user and event_id = p_event and attended) then
    insert into public.points (user_id, amount, category, reason, event_id, auto, awarded_at)
      select p_user, public.point_value('events'), 'events', 'Attended ' || e.title, e.id, true, e.starts_at
      from public.events e where e.id = p_event
      on conflict do nothing;
  else
    delete from public.points where auto and category = 'events' and user_id = p_user and event_id = p_event;
  end if;
end $$;

create or replace function public.sync_post_points(p_post uuid) returns void
language plpgsql security definer set search_path = public as $$
declare p public.posts;
begin
  select * into p from public.posts where id = p_post;
  -- The author may have changed, so whoever holds this post's award and is not its published author loses it.
  delete from public.points where auto and category = 'posts' and post_id = p_post
    and (p.id is null or p.status <> 'published' or user_id is distinct from p.author_id);
  if p.status = 'published' and p.author_id is not null then
    insert into public.points (user_id, amount, category, reason, post_id, auto, awarded_at)
      values (p.author_id, public.point_value('posts'), 'posts', 'Published ' || p.title, p.id, true, coalesce(p.published_at, now()))
      on conflict do nothing;
  end if;
end $$;

create or replace function public.sync_flag_points(p_user uuid) returns void
language plpgsql security definer set search_path = public as $$
declare first_solve timestamptz;
begin
  if p_user is null then return; end if;
  select min(created_at) into first_solve from public.flag_solvers where user_id = p_user and approved;
  if first_solve is null then
    delete from public.points where auto and category = 'flag' and user_id = p_user;
  else
    insert into public.points (user_id, amount, category, reason, auto, awarded_at)
      values (p_user, public.point_value('flag'), 'flag', 'Solved the site flag', true, first_solve)
      on conflict do nothing;
  end if;
end $$;

create or replace function public.registrations_points() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  if tg_op <> 'INSERT' then perform public.sync_attendance_points(old.user_id, old.event_id); end if;
  if tg_op <> 'DELETE' then perform public.sync_attendance_points(new.user_id, new.event_id); end if;
  return null;
end $$;
drop trigger if exists registrations_points on public.registrations;
create trigger registrations_points after insert or delete or update of attended, user_id, event_id
  on public.registrations for each row execute function public.registrations_points();

create or replace function public.posts_points() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  perform public.sync_post_points(case when tg_op = 'DELETE' then old.id else new.id end);
  return null;
end $$;
drop trigger if exists posts_points on public.posts;
create trigger posts_points after insert or delete or update of status, author_id
  on public.posts for each row execute function public.posts_points();

create or replace function public.flag_solvers_points() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  if tg_op <> 'INSERT' then perform public.sync_flag_points(old.user_id); end if;
  if tg_op <> 'DELETE' then perform public.sync_flag_points(new.user_id); end if;
  return null;
end $$;
drop trigger if exists flag_solvers_points on public.flag_solvers;
create trigger flag_solvers_points after insert or delete or update of approved, user_id
  on public.flag_solvers for each row execute function public.flag_solvers_points();

-- Award what already happened before this table existed.
select public.sync_attendance_points(user_id, event_id) from public.registrations where attended;
select public.sync_post_points(id) from public.posts where status = 'published';
select public.sync_flag_points(user_id) from (select distinct user_id from public.flag_solvers where approved) s;

-- ── Reading totals ───────────────────────────────────────────────────────
-- A member's total for public pages, which never read the table itself. Security definer because a
-- visitor's token can read no one's rows; it returns one number, and only while the profile is public.
create or replace function public.member_points(p_user uuid) returns int
language sql stable security definer set search_path = public as $$
  select coalesce(sum(pt.amount), 0)::int
  from public.points pt join public.profiles p on p.id = pt.user_id
  where pt.user_id = p_user and p.onboarded and not p.suspended
$$;

-- ── Access ───────────────────────────────────────────────────────────────
-- Members read their own awards, officers read all. Writes go through the API with the service key
-- (manual awards) or happen in the triggers above: no write policies.
alter table public.points enable row level security;
select public._policy('points_read', 'points', 'select', 'user_id = auth.uid() or public.has_role(''officer'')');
grant select on public.points to anon, authenticated;
grant all on public.points to service_role;
grant execute on function public.member_points(uuid), public.point_value(text) to anon, authenticated;
revoke execute on function public.sync_attendance_points(uuid, uuid), public.sync_post_points(uuid),
  public.sync_flag_points(uuid), public.registrations_points(), public.posts_points(),
  public.flag_solvers_points() from public, anon, authenticated;
