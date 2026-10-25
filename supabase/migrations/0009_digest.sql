-- 0009: the weekly digest email (/api/cron/weekly). Members opt in on /me/profile (digest_opt_in) and
-- get one email a week: events in the next 14 days and posts published since the last digest. The
-- mails go through email_queue at the lowest priority, so they never take the place of a welcome or a
-- reservation copy and spread over several days when the daily budget runs out. Safe to run again.

alter table public.profiles add column if not exists digest_opt_in boolean not null default false;

-- The queue gains the "digest" kind. The check constraint from 0001 is replaced, not edited.
alter table public.email_queue drop constraint if exists email_queue_kind_check;
alter table public.email_queue add constraint email_queue_kind_check
  check (kind in ('welcome', 'status', 'registration', 'digest', 'other'));

-- One row per digest week (the Riyadh week, Sunday to Saturday, keyed by its Sunday). The primary key
-- is the claim: a second run in the same week (a retry, a call by hand) cannot insert and sends
-- nothing. The previous row's ran_at is where "posts since the last digest" starts.
create table if not exists public.digest_runs (
  week date primary key,
  ran_at timestamptz not null default now(),
  recipients int not null default 0,
  events int not null default 0,
  posts int not null default 0
);
-- New tables are not exposed to the Data API by default, so the service key needs its grant. No
-- policies and no grants for tokens: only the service key reaches it, like email_queue.
alter table public.digest_runs enable row level security;
grant all on public.digest_runs to service_role;
