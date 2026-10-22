-- KFUPM Computer Club: database schema.
-- Run this once in the Supabase SQL editor (or with the Supabase CLI). Idempotent: safe to run again.
-- Every table has row level security. Public pages read published rows with the anon key; writes go
-- through the site's API routes with the service key after a role check.

create extension if not exists pgcrypto;

-- ── Profiles ────────────────────────────────────────────────────────────────
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  handle text unique check (handle ~ '^[a-z0-9_]{3,24}$'),
  name text,
  email text,
  phone text,
  major text,
  year text,
  kfupm_email text,
  github text,
  linkedin text,
  bio text check (char_length(bio) <= 400),
  avatar_url text,
  show_in_contributors boolean not null default false,
  onboarded boolean not null default false,
  suspended boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists profiles_handle_idx on public.profiles (lower(handle));

-- ── Roles ───────────────────────────────────────────────────────────────────
-- member < editor < reviewer < officer < admin. A signed-in user without a row is a member.
create table if not exists public.user_roles (
  user_id uuid primary key references public.profiles(id) on delete cascade,
  role text not null check (role in ('member', 'editor', 'reviewer', 'officer', 'admin')),
  granted_by uuid,
  created_at timestamptz not null default now()
);

create or replace function public.role_rank(r text) returns int language sql immutable as $$
  select case r when 'admin' then 4 when 'officer' then 3 when 'reviewer' then 2 when 'editor' then 1 else 0 end
$$;
create or replace function public.my_role() returns text language sql stable security definer set search_path = public as $$
  select case when auth.uid() is null then null else coalesce((select role from public.user_roles where user_id = auth.uid()), 'member') end
$$;
create or replace function public.has_role(min_role text) returns boolean language sql stable security definer set search_path = public as $$
  select coalesce(public.role_rank(public.my_role()) >= public.role_rank(min_role), false)
$$;

-- A profile row appears the moment a user signs up, so onboarding only has to fill it in.
create or replace function public.handle_new_user() returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, email, name, avatar_url)
  values (new.id, new.email, coalesce(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name', new.raw_user_meta_data->>'user_name'), new.raw_user_meta_data->>'avatar_url')
  on conflict (id) do nothing;
  return new;
end $$;
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created after insert on auth.users for each row execute function public.handle_new_user();

-- Public shape of a profile: no phone, no email.
create or replace view public.profiles_public as
  select id, handle, name, bio, avatar_url, github, linkedin, major, year, show_in_contributors, created_at
  from public.profiles where onboarded and not suspended;
grant select on public.profiles_public to anon, authenticated;

create or replace function public.member_count() returns bigint language sql stable security definer set search_path = public as $$
  select count(*) from public.profiles where onboarded and not suspended
$$;

-- ── Media ───────────────────────────────────────────────────────────────────
-- One row per uploaded file. `key` is stable (seed photos keep their file name) and content rows point at it.
create table if not exists public.media (
  key text primary key,
  kind text not null check (kind in ('image', 'pdf')),
  alt text not null default '',
  width int, height int, bytes int,
  sizes jsonb not null default '{}'::jsonb,   -- {"480": url, "960": url, "1600": url} or {"file": url}
  path text not null,                          -- storage path of the original
  tags text[] not null default '{}',
  uploaded_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now()
);

-- ── Content ─────────────────────────────────────────────────────────────────
create table if not exists public.events (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  title text not null,
  type text not null default 'Other',
  starts_at timestamptz not null,
  ends_at timestamptz,
  all_day boolean not null default true,
  location text not null default '',
  cover_key text references public.media(key) on delete set null,
  summary text not null default '',
  x_url text,
  register_url text,
  capacity int,
  registration_open boolean not null default false,
  featured boolean not null default false,
  published boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists events_starts_idx on public.events (starts_at);

create table if not exists public.registrations (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references public.events(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  email_copy boolean not null default false,
  attended boolean not null default false,
  created_at timestamptz not null default now(),
  unique (event_id, user_id)
);

create table if not exists public.posts (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  title text not null,
  excerpt text not null default '',
  content_html text not null default '',
  content_json jsonb,
  dir text not null default 'ltr' check (dir in ('ltr', 'rtl')),
  category text not null default 'News',
  tags text[] not null default '{}',
  author_id uuid references public.profiles(id) on delete set null,
  author_name text,
  status text not null default 'draft' check (status in ('draft', 'submitted', 'changes_requested', 'published', 'unpublished')),
  published_at timestamptz,
  cover_key text references public.media(key) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists posts_status_idx on public.posts (status, published_at desc);

create table if not exists public.post_reviews (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references public.posts(id) on delete cascade,
  reviewer_id uuid references public.profiles(id) on delete set null,
  comment text not null default '',
  status_set text,
  created_at timestamptz not null default now()
);

create table if not exists public.officer_terms (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete set null,
  name text not null,
  title text not null,
  committee text not null default '',
  term text not null,
  major text,
  photo_key text references public.media(key) on delete set null,
  linkedin text,
  sort int not null default 0,
  is_current boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists public.highlights (
  id uuid primary key default gen_random_uuid(),
  photo_key text references public.media(key) on delete set null,
  title text not null,
  date date not null,
  line text not null default '',
  post_url text,
  sort int not null default 0,
  visible boolean not null default true
);

create table if not exists public.stories (
  id uuid primary key default gen_random_uuid(),
  photo_key text references public.media(key) on delete set null,
  title text not null,
  date date not null,
  text text not null default '',
  post_url text,
  sort int not null default 0,
  visible boolean not null default true
);

create table if not exists public.strip_photos (
  photo_key text primary key references public.media(key) on delete cascade,
  label text not null default '',
  post_url text,
  sort int not null default 0,
  visible boolean not null default true
);

create table if not exists public.impact_semesters (
  id uuid primary key default gen_random_uuid(),
  term text not null unique,
  total_sar int,
  total_is_minimum boolean not null default false,
  photo_key text references public.media(key) on delete set null,
  sort int not null default 0
);
create table if not exists public.impact_items (
  id uuid primary key default gen_random_uuid(),
  semester_id uuid not null references public.impact_semesters(id) on delete cascade,
  name text not null,
  prize_sar int,
  detail text,
  source_url text,
  sort int not null default 0
);

create table if not exists public.partners (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  kind text not null default 'company' check (kind in ('company', 'kfupm_unit', 'student_club', 'visited')),
  what text,
  url text,
  source_url text,
  logo_key text references public.media(key) on delete set null,
  handle text,
  mark boolean not null default false,
  square boolean not null default false,
  tall boolean not null default false,
  sort int not null default 0,
  visible boolean not null default true
);

create table if not exists public.faq (
  id uuid primary key default gen_random_uuid(),
  q_en text not null,
  a_en text not null,
  q_ar text,
  a_ar text,
  sort int not null default 0,
  visible boolean not null default true
);

-- Key/value settings. Public keys are readable by everyone; the rest only by admins.
create table if not exists public.settings (
  key text primary key,
  value jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);
create or replace function public.setting_is_public(k text) returns boolean language sql immutable as $$
  select k in ('site', 'links', 'home', 'banner', 'made_by', 'faq_intro')
$$;

create table if not exists public.flag_solvers (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(name) <= 40),
  handle text check (char_length(handle) <= 40),
  user_id uuid references public.profiles(id) on delete set null,
  approved boolean not null default false,
  created_at timestamptz not null default now()
);

-- ── Operations ──────────────────────────────────────────────────────────────
create table if not exists public.email_queue (
  id uuid primary key default gen_random_uuid(),
  to_email text not null,
  subject text not null,
  html text not null,
  kind text not null default 'other' check (kind in ('welcome', 'status', 'registration', 'other')),
  priority int not null default 5,          -- lower sends first; welcome = 1
  status text not null default 'queued' check (status in ('queued', 'sent', 'failed')),
  attempts int not null default 0,
  error text,
  scheduled_for date not null default current_date,
  sent_at timestamptz,
  created_at timestamptz not null default now()
);
create index if not exists email_queue_status_idx on public.email_queue (status, scheduled_for, priority);

create table if not exists public.audit_log (
  id uuid primary key default gen_random_uuid(),
  actor_id uuid references public.profiles(id) on delete set null,
  action text not null,                       -- insert | update | delete | role | status | other
  table_name text not null,
  row_id text,
  before jsonb,
  after jsonb,
  undone_at timestamptz,
  created_at timestamptz not null default now()
);
create index if not exists audit_log_created_idx on public.audit_log (created_at desc);

create table if not exists public.rate_limits (
  key text not null,
  window_start timestamptz not null,
  count int not null default 0,
  primary key (key, window_start)
);
-- Returns true while the caller is under the limit for this key and window.
create or replace function public.hit_rate_limit(p_key text, p_limit int, p_window_seconds int) returns boolean
language plpgsql security definer set search_path = public as $$
declare w timestamptz := to_timestamp(floor(extract(epoch from now()) / p_window_seconds) * p_window_seconds); c int;
begin
  insert into public.rate_limits (key, window_start, count) values (p_key, w, 1)
    on conflict (key, window_start) do update set count = public.rate_limits.count + 1 returning count into c;
  delete from public.rate_limits where window_start < now() - interval '1 day';
  return c <= p_limit;
end $$;

create table if not exists public.keepalive (id int primary key, pinged_at timestamptz not null default now());
insert into public.keepalive (id) values (1) on conflict do nothing;

-- updated_at bookkeeping
create or replace function public.touch_updated_at() returns trigger language plpgsql as $$ begin new.updated_at = now(); return new; end $$;
do $$ declare t text; begin
  foreach t in array array['profiles', 'events', 'posts', 'settings'] loop
    execute format('drop trigger if exists touch_%1$s on public.%1$s; create trigger touch_%1$s before update on public.%1$s for each row execute function public.touch_updated_at();', t);
  end loop;
end $$;

-- Contributors: members with published posts who opted in.
create or replace view public.contributors as
  select p.id, p.handle, p.name, p.avatar_url, count(po.id)::int as posts
  from public.profiles p join public.posts po on po.author_id = p.id and po.status = 'published'
  where p.show_in_contributors and p.onboarded and not p.suspended
  group by p.id, p.handle, p.name, p.avatar_url;
grant select on public.contributors to anon, authenticated;

-- ── Row level security ──────────────────────────────────────────────────────
do $$ declare t text; begin
  foreach t in array array['user_roles','profiles','media','events','registrations','posts','post_reviews','officer_terms','highlights','stories','strip_photos','impact_semesters','impact_items','partners','faq','settings','flag_solvers','email_queue','audit_log','rate_limits','keepalive'] loop
    execute format('alter table public.%I enable row level security', t);
  end loop;
end $$;

-- helper to (re)create a policy
create or replace function public._policy(p_name text, p_table text, p_cmd text, p_using text, p_check text default null) returns void language plpgsql as $$
begin
  execute format('drop policy if exists %I on public.%I', p_name, p_table);
  if p_cmd = 'insert' then
    execute format('create policy %I on public.%I for insert with check (%s)', p_name, p_table, coalesce(p_check, p_using));
  elsif p_cmd in ('update') then
    execute format('create policy %I on public.%I for update using (%s) with check (%s)', p_name, p_table, p_using, coalesce(p_check, p_using));
  else
    execute format('create policy %I on public.%I for %s using (%s)', p_name, p_table, p_cmd, p_using);
  end if;
end $$;

do $$ begin
  perform public._policy('roles_self_read', 'user_roles', 'select', 'user_id = auth.uid() or public.has_role(''admin'')');
end $$;

do $$ begin
  perform public._policy('profiles_self_read', 'profiles', 'select', 'id = auth.uid() or public.has_role(''admin'')');
  perform public._policy('profiles_self_update', 'profiles', 'update', 'id = auth.uid()', 'id = auth.uid() and suspended = false');
  perform public._policy('profiles_self_insert', 'profiles', 'insert', 'id = auth.uid()');
end $$;

do $$ begin
  perform public._policy('media_public_read', 'media', 'select', 'true');
  perform public._policy('media_member_insert', 'media', 'insert', 'auth.uid() is not null and uploaded_by = auth.uid()');
  perform public._policy('media_officer_write', 'media', 'update', 'public.has_role(''officer'')');
  perform public._policy('media_officer_delete', 'media', 'delete', 'public.has_role(''officer'')');
end $$;

do $$ begin
  perform public._policy('events_public_read', 'events', 'select', 'published or public.has_role(''officer'')');
  perform public._policy('events_officer_write', 'events', 'all', 'public.has_role(''officer'')');
end $$;

do $$ begin
  perform public._policy('registrations_read', 'registrations', 'select', 'true');
  perform public._policy('registrations_self_insert', 'registrations', 'insert', 'user_id = auth.uid()');
  perform public._policy('registrations_self_delete', 'registrations', 'delete', 'user_id = auth.uid() or public.has_role(''officer'')');
  perform public._policy('registrations_officer_update', 'registrations', 'update', 'public.has_role(''officer'')');
end $$;

do $$ begin
  perform public._policy('posts_public_read', 'posts', 'select', 'status = ''published'' or author_id = auth.uid() or public.has_role(''reviewer'')');
  perform public._policy('posts_author_insert', 'posts', 'insert', 'author_id = auth.uid()');
  perform public._policy('posts_author_update', 'posts', 'update', 'author_id = auth.uid() or public.has_role(''reviewer'')');
  perform public._policy('posts_author_delete', 'posts', 'delete', '(author_id = auth.uid() and status in (''draft'', ''changes_requested'')) or public.has_role(''admin'')');
end $$;

do $$ begin
  perform public._policy('reviews_read', 'post_reviews', 'select', 'public.has_role(''reviewer'') or exists (select 1 from public.posts p where p.id = post_id and p.author_id = auth.uid())');
  perform public._policy('reviews_insert', 'post_reviews', 'insert', 'public.has_role(''reviewer'') and reviewer_id = auth.uid()');
end $$;

do $$ begin
  perform public._policy('officer_terms_read', 'officer_terms', 'select', 'true');
  perform public._policy('officer_terms_write', 'officer_terms', 'all', 'public.has_role(''admin'')');
end $$;

do $$ begin
  perform public._policy('highlights_read', 'highlights', 'select', 'visible or public.has_role(''officer'')');
  perform public._policy('highlights_write', 'highlights', 'all', 'public.has_role(''officer'')');
  perform public._policy('stories_read', 'stories', 'select', 'visible or public.has_role(''officer'')');
  perform public._policy('stories_write', 'stories', 'all', 'public.has_role(''officer'')');
  perform public._policy('strip_read', 'strip_photos', 'select', 'visible or public.has_role(''officer'')');
  perform public._policy('strip_write', 'strip_photos', 'all', 'public.has_role(''officer'')');
  perform public._policy('impact_read', 'impact_semesters', 'select', 'true');
  perform public._policy('impact_write', 'impact_semesters', 'all', 'public.has_role(''officer'')');
  perform public._policy('impact_items_read', 'impact_items', 'select', 'true');
  perform public._policy('impact_items_write', 'impact_items', 'all', 'public.has_role(''officer'')');
  perform public._policy('partners_read', 'partners', 'select', 'visible or public.has_role(''officer'')');
  perform public._policy('partners_write', 'partners', 'all', 'public.has_role(''officer'')');
  perform public._policy('faq_read', 'faq', 'select', 'visible or public.has_role(''officer'')');
  perform public._policy('faq_write', 'faq', 'all', 'public.has_role(''officer'')');
  perform public._policy('settings_read', 'settings', 'select', 'public.setting_is_public(key) or public.has_role(''admin'')');
  perform public._policy('settings_write', 'settings', 'all', 'public.has_role(''admin'')');
  perform public._policy('solvers_read', 'flag_solvers', 'select', 'approved or public.has_role(''admin'')');
  perform public._policy('solvers_write', 'flag_solvers', 'all', 'public.has_role(''admin'')');
end $$;
-- email_queue, audit_log, rate_limits, keepalive: no policies, so only the service key reaches them.

-- Admins may read everyone's roles and profiles (above); members read nothing about others beyond the public view.
grant usage on schema public to anon, authenticated;
grant select on all tables in schema public to anon, authenticated;
grant insert, update, delete on public.profiles, public.media, public.registrations, public.posts, public.post_reviews, public.events, public.highlights, public.stories, public.strip_photos, public.impact_semesters, public.impact_items, public.partners, public.faq, public.settings, public.officer_terms, public.flag_solvers to authenticated;
grant execute on function public.member_count(), public.my_role(), public.has_role(text), public.role_rank(text) to anon, authenticated;
revoke execute on function public.hit_rate_limit(text, int, int) from anon, authenticated;

-- ── Storage buckets ─────────────────────────────────────────────────────────
insert into storage.buckets (id, name, public) values ('media', 'media', true) on conflict (id) do update set public = true;
insert into storage.buckets (id, name, public) values ('files', 'files', true) on conflict (id) do update set public = true;
drop policy if exists "media public read" on storage.objects;
create policy "media public read" on storage.objects for select using (bucket_id in ('media', 'files'));
-- Uploads go through the site's API with the service key, so no insert policy for users is needed.
