-- 0004: the committees from the members-meeting deck, so the Community page has content as soon as
-- the migrations have run, with no import step. Ids are the same ones scripts/import-seed.mjs makes
-- (uuidFrom: a SHA-1 name-based uuid of "committee:<name>"), so a later "Import starter content"
-- updates these rows instead of adding duplicates. "on conflict do nothing" keeps every edit an
-- officer has made since. Safe to run again.

create extension if not exists pgcrypto;

-- Same id as uuidFrom() in scripts/import-seed.mjs: SHA-1 of the seed, version nibble 5, RFC variant.
-- pgcrypto lives in the extensions schema on Supabase and in public elsewhere, hence the search_path.
create or replace function public.seed_uuid(seed text) returns uuid language sql immutable
set search_path = public, extensions as $$
  select encode(substring(set_byte(set_byte(d, 6, (get_byte(d, 6) & 15) | 80), 8, (get_byte(d, 8) & 63) | 128) from 1 for 16), 'hex')::uuid
  from (select digest(seed, 'sha1') as d) h
$$;
revoke execute on function public.seed_uuid(text) from public, anon, authenticated;

insert into public.committees (id, name, leads, items, note, grants_role, sort, visible) values
  (public.seed_uuid('committee:Cybersecurity'), 'Cybersecurity', 'Mazen · Noureldin',
   E'KIFADA 6367 (done)\nAD Pentesting Bootcamp\nBug Bounty Bootcamp, 15 to 19 Nov', null, 'member', 0, true),
  (public.seed_uuid('committee:AI'), 'AI', 'Ahmad Alzuhair',
   E'AI & Applied Math booth, CCM event\nRAG Systems Bootcamp\nKaggle Competition\nResearch Seminar', null, 'member', 1, true),
  (public.seed_uuid('committee:Dev & Growth'), 'Dev & Growth', 'Thamer · Fawaz',
   E'The club''s Notion\nOur website, maintained and updated\nThe club''s Telegram bot', null, 'member', 2, true),
  (public.seed_uuid('committee:PR'), 'PR', 'Abdullah Alharbi',
   E'Hackathon sponsor\nVisits: Humain, Autopia, Accenture\nSpeakers and IoT talk', null, 'member', 3, true),
  (public.seed_uuid('committee:Media & Marketing'), 'Media & Marketing', 'Basem · Khaled',
   E'Graphic Design Workshop\nPosters for every event\nPhotos and coverage', null, 'officer', 4, true),
  (public.seed_uuid('committee:Logistics & Ops'), 'Logistics & Ops', 'Ziyad · Hammad',
   '', 'The enablers of every event. No event happens without them.', 'member', 5, true),
  (public.seed_uuid('committee:Financial'), 'Financial', 'Abdullah Eitani',
   E'Custody and settlements\nCompetition prizes\nInvoices from every event', null, 'member', 6, true)
on conflict (id) do nothing;
