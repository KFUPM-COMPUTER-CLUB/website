-- 0007: check-in at the door. Each reservation gets a random token; the member's QR code on
-- /me/registrations is a link to /admin/checkin/<token>, so the code carries no ids, cannot be
-- guessed (122 random bits) and works with any phone's camera app. Checking in sets attended, which
-- awards the attendance points through the trigger in 0005; a second scan of the same code is refused
-- with the time of the first, which is what makes a code single-use. Safe to run again.

alter table public.registrations add column if not exists checkin_token text;
update public.registrations set checkin_token = replace(gen_random_uuid()::text, '-', '') where checkin_token is null;
alter table public.registrations alter column checkin_token set default replace(gen_random_uuid()::text, '-', '');
alter table public.registrations alter column checkin_token set not null;
create unique index if not exists registrations_checkin_token_idx on public.registrations (checkin_token);

-- When the member was checked in. It follows attended whichever path changed it (the door scan, the
-- attendance button on the registrations page, an undo), so it can never disagree with it.
alter table public.registrations add column if not exists attended_at timestamptz;
create or replace function public.stamp_attendance() returns trigger language plpgsql as $$
begin
  if not new.attended then
    new.attended_at = null;
  elsif tg_op = 'INSERT' or not old.attended then
    new.attended_at = coalesce(new.attended_at, now());
  end if;
  return new;
end $$;
drop trigger if exists stamp_attendance on public.registrations;
create trigger stamp_attendance before insert or update of attended on public.registrations
  for each row execute function public.stamp_attendance();
revoke execute on function public.stamp_attendance() from public, anon, authenticated;
