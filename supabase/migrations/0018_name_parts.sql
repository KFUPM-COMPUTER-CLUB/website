-- 0018: a member's name in parts, first, middle (optional) and last, so an email or a page can greet
-- someone by first name without guessing from the full string. profiles.name stays the full name everywhere
-- (profiles_public, the leaderboard, door lists, author names): the profile and onboarding forms ask for
-- the parts and save the full name built from them (src/lib/names.ts). Existing names are split once here:
-- the first word, the last word, and anything between as the middle name; a one-word name has no last name
-- until the member saves their profile. Safe to run again: only rows without parts are filled.

alter table public.profiles add column if not exists first_name text check (char_length(first_name) <= 40);
alter table public.profiles add column if not exists middle_name text check (char_length(middle_name) <= 40);
alter table public.profiles add column if not exists last_name text check (char_length(last_name) <= 40);

update public.profiles p
set first_name = left(w[1], 40),
    middle_name = case when cardinality(w) > 2 then left(array_to_string(w[2:cardinality(w) - 1], ' '), 40) end,
    last_name = case when cardinality(w) > 1 then left(w[cardinality(w)], 40) end
from (
  select id, regexp_split_to_array(btrim(name), '\s+') as w
  from public.profiles
  where first_name is null and coalesce(btrim(name), '') <> ''
) s
where p.id = s.id;
