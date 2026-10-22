-- 0003: committee membership. An admin puts a member in a committee (/admin/members), and a
-- committee grants its members a minimum role (grants_role), so one setting gives a whole team its
-- access: Media & Marketing gets officer, which covers the media library, posts and events. The
-- effective role is worked out in src/middleware.ts as the higher of the member's own role and the
-- committee's. Admin is never granted this way. Safe to run again.

alter table public.committees add column if not exists grants_role text not null default 'member';
alter table public.committees drop constraint if exists committees_grants_role_check;
alter table public.committees add constraint committees_grants_role_check
  check (grants_role in ('member', 'editor', 'reviewer', 'officer'));

alter table public.profiles add column if not exists committee_id uuid references public.committees(id) on delete set null;
create index if not exists profiles_committee_idx on public.profiles (committee_id);

-- A member can always read their own committee, even one hidden from the Community page, so the
-- grant never disappears because an officer un-ticked "visible".
select public._policy('committees_read', 'committees', 'select',
  'visible or public.has_role(''officer'') or id = (select committee_id from public.profiles where id = auth.uid())');

-- The public profile view gains the committee so the Community page and /u/<handle> can show it.
-- "create or replace view" only allows new columns at the end, which is why committee_id is last.
create or replace view public.profiles_public as
  select id, handle, name, bio, avatar_url, github, linkedin, major, year, show_in_contributors, created_at, committee_id
  from public.profiles where onboarded and not suspended;
grant select on public.profiles_public to anon, authenticated;
