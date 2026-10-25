-- 0010: competition results. Officers enter the placings of an event on /admin/events/<id>/results:
-- a place, a member or a free-text team (or both: a member's team name), the prize in SAR and the
-- points the placing is worth. Results show on the event's card on /timeline and as "Wins" on the
-- member's profile. A result that names a member awards its points through the ledger from 0005, once
-- per member and event; editing the result updates the award and removing it takes the award back,
-- like attendance. A free-text team earns no points: there is no account to give them to. Safe to run again.

create table if not exists public.event_results (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references public.events(id) on delete cascade,
  place int not null check (place between 1 and 99),
  -- Deleting an account removes its results, like its reservations.
  user_id uuid references public.profiles(id) on delete cascade,
  team text check (char_length(team) <= 80),
  prize_sar int check (prize_sar between 0 and 10000000),
  points int not null default 0 check (points between 0 and 1000),
  created_at timestamptz not null default now(),
  constraint event_results_who check (user_id is not null or char_length(coalesce(team, '')) > 0)
);
create index if not exists event_results_event_idx on public.event_results (event_id, place);
create index if not exists event_results_user_idx on public.event_results (user_id);

-- "1st", "2nd", "3rd", "4th", "11th", "21st": for the reason on a points row.
create or replace function public.ordinal(n int) returns text language sql immutable as $$
  select n || case when n % 100 between 11 and 13 then 'th'
    else case n % 10 when 1 then 'st' when 2 then 'nd' when 3 then 'rd' else 'th' end end
$$;

-- Makes the ledger agree with the results for one member and one event, in the style of the sync_*
-- functions in 0005: the member's best placing with points decides the award, which counts for the
-- event's start like attendance. points_auto_once already allows one automatic competition award per
-- member per event, so a second result for the same member never pays twice.
create or replace function public.sync_result_points(p_user uuid, p_event uuid) returns void
language plpgsql security definer set search_path = public as $$
declare best record;
begin
  if p_user is null or p_event is null then return; end if;
  select r.place, r.points, e.title, e.starts_at into best
    from public.event_results r join public.events e on e.id = r.event_id
    where r.user_id = p_user and r.event_id = p_event and r.points > 0
    order by r.points desc, r.place limit 1;
  if not found then
    delete from public.points where auto and category = 'competitions' and user_id = p_user and event_id = p_event;
    return;
  end if;
  update public.points
    set amount = best.points, reason = left(public.ordinal(best.place) || ' place, ' || best.title, 200)
    where auto and category = 'competitions' and user_id = p_user and event_id = p_event;
  if not found then
    insert into public.points (user_id, amount, category, reason, event_id, auto, awarded_at)
      values (p_user, best.points, 'competitions', left(public.ordinal(best.place) || ' place, ' || best.title, 200),
        p_event, true, best.starts_at)
      on conflict do nothing;
  end if;
end $$;

create or replace function public.event_results_points() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  if tg_op <> 'INSERT' then perform public.sync_result_points(old.user_id, old.event_id); end if;
  if tg_op <> 'DELETE' then perform public.sync_result_points(new.user_id, new.event_id); end if;
  return null;
end $$;
drop trigger if exists event_results_points on public.event_results;
create trigger event_results_points after insert or delete or update of user_id, event_id, place, points
  on public.event_results for each row execute function public.event_results_points();

-- New tables are not exposed to the Data API by default and RLS is on, so the read grant and the read
-- policy are explicit. Everyone reads the results of published events; writes go through
-- /api/admin/events/<id>/results with the service key, so there are no write policies.
alter table public.event_results enable row level security;
grant select on public.event_results to anon, authenticated;
grant all on public.event_results to service_role;
select public._policy('event_results_read', 'event_results', 'select',
  'exists (select 1 from public.events e where e.id = event_id and e.published) or public.has_role(''officer'')');
grant execute on function public.ordinal(int) to anon, authenticated;
revoke execute on function public.sync_result_points(uuid, uuid), public.event_results_points() from public, anon, authenticated;
