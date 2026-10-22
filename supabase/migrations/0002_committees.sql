-- 0002: committees on /community. Who runs the club and what each committee owns.
-- Separate from officer_terms (a person, a title, a term) because a committee is a standing group
-- with a list of responsibilities that officers edit a few times a semester. Safe to run again.
-- `items` is text with one item per line so the generic admin form (a textarea) can edit it.

create table if not exists public.committees (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  leads text not null default '',
  items text not null default '',
  note text,
  sort int not null default 0,
  visible boolean not null default true,
  updated_at timestamptz not null default now()
);

drop trigger if exists touch_committees on public.committees;
create trigger touch_committees before update on public.committees for each row execute function public.touch_updated_at();

-- New tables are not exposed to the Data API by default and RLS is on, so the read grant and the
-- read policy are explicit. Writes go through the site's API with the service key: no write policies.
alter table public.committees enable row level security;
grant select on public.committees to anon, authenticated;
grant all on public.committees to service_role;
select public._policy('committees_read', 'committees', 'select', 'visible or public.has_role(''officer'')');
