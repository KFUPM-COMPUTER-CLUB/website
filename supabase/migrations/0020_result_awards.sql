-- 0020: special awards on competition results (#118). A result can carry an award name ("Best design",
-- "Best idea") beside its place or instead of one, so a hackathon's side prizes are entered like its
-- placings and show on the event's card on /timeline and under Wins on the winner's profile. Points work
-- as before: the member's result with the most points decides the one automatic award per event, and its
-- reason names the award when there is one. Safe to run again.

alter table public.event_results add column if not exists award text;
alter table public.event_results drop constraint if exists event_results_award_len;
alter table public.event_results add constraint event_results_award_len check (char_length(award) <= 60);
-- A place is now optional, but a result needs a place, an award, or both.
alter table public.event_results alter column place drop not null;
alter table public.event_results drop constraint if exists event_results_what;
alter table public.event_results add constraint event_results_what
  check (place is not null or char_length(coalesce(award, '')) > 0);

-- "1st place, Techathon", "Best design, Techathon" or "Best design (2nd place), Techathon".
create or replace function public.result_reason(p_place int, p_award text, p_title text) returns text
language sql immutable as $$
  select left(
    case
      when coalesce(p_award, '') <> '' and p_place is not null then p_award || ' (' || public.ordinal(p_place) || ' place)'
      when coalesce(p_award, '') <> '' then p_award
      else public.ordinal(p_place) || ' place'
    end || ', ' || p_title, 200)
$$;

create or replace function public.sync_result_points(p_user uuid, p_event uuid) returns void
language plpgsql security definer set search_path = public as $$
declare best record;
begin
  if p_user is null or p_event is null then return; end if;
  select r.place, r.award, r.points, e.title, e.starts_at into best
    from public.event_results r join public.events e on e.id = r.event_id
    where r.user_id = p_user and r.event_id = p_event and r.points > 0
    order by r.points desc, r.place nulls last limit 1;
  if not found then
    delete from public.points where auto and category = 'competitions' and user_id = p_user and event_id = p_event;
    return;
  end if;
  update public.points
    set amount = best.points, reason = public.result_reason(best.place, best.award, best.title)
    where auto and category = 'competitions' and user_id = p_user and event_id = p_event;
  if not found then
    insert into public.points (user_id, amount, category, reason, event_id, auto, awarded_at)
      values (p_user, best.points, 'competitions', public.result_reason(best.place, best.award, best.title),
        p_event, true, best.starts_at)
      on conflict do nothing;
  end if;
end $$;

-- Renaming an award changes the reason on the points row too.
drop trigger if exists event_results_points on public.event_results;
create trigger event_results_points after insert or delete or update of user_id, event_id, place, points, award
  on public.event_results for each row execute function public.event_results_points();

grant execute on function public.result_reason(int, text, text) to anon, authenticated;
revoke execute on function public.sync_result_points(uuid, uuid) from public, anon, authenticated;
