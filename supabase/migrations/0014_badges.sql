-- 0014: badges. A catalogue of milestones and one row per badge a member holds. Three are automatic,
-- kept in step by triggers like the points in 0005: First post (a published post), 5 events (five
-- published events attended) and Flag solver (an approved solve). Two are awarded by officers on
-- /admin/badges: Hackathon winner and Top writer of the semester, each with a reference ("Techathon
-- 2026", "Fall 2026"). Badges show on /me and, while the member leaves "Show my badges" ticked
-- (profiles.show_badges, off by default, a member opts in), on their public profile. Every award, change and removal is in
-- the audit log; the automatic ones cannot be undone there. Safe to run again.

create table if not exists public.badges (
  key text primary key,
  name text not null,
  description text not null default '',
  awarded_by text not null check (awarded_by in ('auto', 'officer')),
  sort int not null default 0
);
insert into public.badges (key, name, description, awarded_by, sort) values
  ('first_post', 'First post', 'Published a first post on the blog.', 'auto', 1),
  ('five_events', '5 events', 'Attended five club events.', 'auto', 2),
  ('flag_solver', 'Flag solver', 'Found the flag hidden on the site.', 'auto', 3),
  ('hackathon_winner', 'Hackathon winner', 'Placed at a club hackathon.', 'officer', 4),
  ('top_writer', 'Top writer of the semester', 'Chosen by the blog team for a semester.', 'officer', 5)
on conflict (key) do update set name = excluded.name, description = excluded.description,
  awarded_by = excluded.awarded_by, sort = excluded.sort;

create table if not exists public.member_badges (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  badge text not null references public.badges(key) on delete cascade,
  awarded_at timestamptz not null default now(),
  -- What it was for: the first post's title, or the hackathon or semester an officer typed.
  reference text check (char_length(reference) <= 120),
  auto boolean not null default false,
  awarded_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now()
);
create index if not exists member_badges_user_idx on public.member_badges (user_id, awarded_at desc);
-- One automatic badge of each kind per member. Officer badges may repeat (two hackathon wins).
create unique index if not exists member_badges_auto_once on public.member_badges (user_id, badge) where auto;

alter table public.profiles add column if not exists show_badges boolean not null default false;

-- ── Automatic badges ─────────────────────────────────────────────────────
-- One automatic badge for one member: present when p_at is set (dated p_at), gone when it is null. A
-- badge the member already holds takes the new date and reference, so unpublishing a first post while a
-- later one stays up moves the badge to that post instead of keeping the old title. An award, change or
-- removal writes an audit row with no actor, so the log shows the system did it; a call that changes
-- nothing writes nothing, which keeps the backfill below safe to run again.
create or replace function public.set_auto_badge(p_user uuid, p_badge text, p_at timestamptz, p_reference text)
returns void language plpgsql security definer set search_path = public as $$
declare prev public.member_badges; r public.member_badges;
begin
  if p_at is null then
    delete from public.member_badges where user_id = p_user and badge = p_badge and auto returning * into r;
    if found then
      insert into public.audit_log (action, table_name, row_id, before) values ('delete', 'member_badges', r.id::text, to_jsonb(r));
    end if;
  else
    -- The row as it was, for the audit's "before"; locked so it cannot change before the upsert.
    select * into prev from public.member_badges where user_id = p_user and badge = p_badge and auto for update;
    insert into public.member_badges (user_id, badge, awarded_at, reference, auto)
      values (p_user, p_badge, p_at, left(p_reference, 120), true)
      on conflict (user_id, badge) where auto do update
        set awarded_at = excluded.awarded_at, reference = excluded.reference
        where (member_badges.awarded_at, member_badges.reference) is distinct from (excluded.awarded_at, excluded.reference)
      returning * into r;
    -- No row back means the badge was already up to date.
    if found and prev.id is null then
      insert into public.audit_log (action, table_name, row_id, after) values ('insert', 'member_badges', r.id::text, to_jsonb(r));
    elsif found then
      insert into public.audit_log (action, table_name, row_id, before, after)
        values ('update', 'member_badges', r.id::text, to_jsonb(prev), to_jsonb(r));
    end if;
  end if;
end $$;

-- Makes a member's three automatic badges agree with their posts, attendance and flag, whatever changed.
-- Each badge is dated by the moment it was earned: the first publish, the start of the fifth attended
-- event, the first approved solve. Only published events count, like the ones on the timeline.
create or replace function public.sync_member_badges(p_user uuid) returns void
language plpgsql security definer set search_path = public as $$
declare first_post record; fifth timestamptz; solved timestamptz;
begin
  if p_user is null then return; end if;
  select title, coalesce(published_at, created_at) as at into first_post from public.posts
    where author_id = p_user and status = 'published' order by coalesce(published_at, created_at) limit 1;
  perform public.set_auto_badge(p_user, 'first_post', first_post.at, first_post.title);
  select e.starts_at into fifth from public.registrations r join public.events e on e.id = r.event_id
    where r.user_id = p_user and r.attended and e.published order by e.starts_at offset 4 limit 1;
  perform public.set_auto_badge(p_user, 'five_events', fifth, null);
  select min(created_at) into solved from public.flag_solvers where user_id = p_user and approved;
  perform public.set_auto_badge(p_user, 'flag_solver', solved, null);
end $$;

create or replace function public.badges_on_change() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  if tg_table_name = 'events' then
    -- Publishing, hiding or moving an event changes what counts for 5 events, so everyone who attended it.
    perform public.sync_member_badges(r.user_id) from public.registrations r where r.event_id = new.id and r.attended;
  elsif tg_table_name = 'posts' then
    if tg_op <> 'INSERT' then perform public.sync_member_badges(old.author_id); end if;
    if tg_op <> 'DELETE' then perform public.sync_member_badges(new.author_id); end if;
  else
    if tg_op <> 'INSERT' then perform public.sync_member_badges(old.user_id); end if;
    if tg_op <> 'DELETE' then perform public.sync_member_badges(new.user_id); end if;
  end if;
  return null;
end $$;
-- The title is the First post badge's reference, so a rename of that post updates it.
drop trigger if exists posts_badges on public.posts;
create trigger posts_badges after insert or delete or update of status, author_id, published_at, title
  on public.posts for each row execute function public.badges_on_change();
drop trigger if exists registrations_badges on public.registrations;
create trigger registrations_badges after insert or delete or update of attended, user_id, event_id
  on public.registrations for each row execute function public.badges_on_change();
drop trigger if exists flag_solvers_badges on public.flag_solvers;
create trigger flag_solvers_badges after insert or delete or update of approved, user_id
  on public.flag_solvers for each row execute function public.badges_on_change();
-- An admin form saves every field, so only a real change of these two is worth a sync. A deleted event
-- needs nothing here: its registrations go with it and their own trigger runs.
drop trigger if exists events_badges on public.events;
create trigger events_badges after update of published, starts_at on public.events for each row
  when (old.published is distinct from new.published or old.starts_at is distinct from new.starts_at)
  execute function public.badges_on_change();

-- Award what members already earned before this table existed.
select public.sync_member_badges(id) from public.profiles;

-- ── Reading ──────────────────────────────────────────────────────────────
-- A member's badges for their public profile. Security definer because a visitor's token cannot read
-- profiles or member_badges; it returns nothing unless the profile is public and shows its badges.
create or replace function public.profile_badges(p_user uuid)
returns table (badge text, name text, description text, awarded_at timestamptz, reference text)
language sql stable security definer set search_path = public as $$
  select mb.badge, b.name, b.description, mb.awarded_at, mb.reference
  from public.member_badges mb join public.badges b on b.key = mb.badge join public.profiles p on p.id = mb.user_id
  where mb.user_id = p_user and p.onboarded and not p.suspended and p.show_badges
  order by mb.awarded_at desc
$$;

-- New tables are not exposed to the Data API by default and RLS is on, so grants and read policies
-- are explicit. The catalogue is public; a member reads their own badges and officers read all.
-- Writes go through /api/admin/badges or the triggers above: no write policies.
alter table public.badges enable row level security;
alter table public.member_badges enable row level security;
grant select on public.badges, public.member_badges to anon, authenticated;
grant all on public.badges, public.member_badges to service_role;
select public._policy('badges_read', 'badges', 'select', 'true');
select public._policy('member_badges_read', 'member_badges', 'select', 'user_id = auth.uid() or public.has_role(''officer'')');
grant execute on function public.profile_badges(uuid) to anon, authenticated;
revoke execute on function public.set_auto_badge(uuid, text, timestamptz, text), public.sync_member_badges(uuid),
  public.badges_on_change() from public, anon, authenticated;
