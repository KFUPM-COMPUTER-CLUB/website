/* Semester Wrapped, the rules without a database: which terms exist, which one /me/wrapped opens on,
 * when /me links to it, and what the numbers earn. Terms follow term_start() in 0006_leaderboard.sql:
 * Fall from 1 August, Spring from 1 January, Summer from 1 June, each starting at Riyadh midnight.
 * src/lib/wrapped.ts reads the numbers (member_stats() in 0012_member_stats.sql) and draws the image;
 * tests/stats.test.ts runs this file under plain node, which is why it imports no astro module. */

const DAY_MS = 86_400_000;
const RIYADH_OFFSET_MS = 3 * 3_600_000; // Saudi Arabia has no daylight saving
const LINK_BEFORE_END_MS = 28 * DAY_MS; // /me links to Wrapped in a term's last four weeks
const LINK_AFTER_END_MS = 14 * DAY_MS; // and the two weeks after it

export type Season = 'fall' | 'spring' | 'summer';
export type Term = { key: string; label: string; start: Date; end: Date };
const STARTS: Record<Season, number> = { spring: 1, summer: 6, fall: 8 }; // first month
const NAMES: Record<Season, string> = { spring: 'Spring', summer: 'Summer', fall: 'Fall' };
const riyadhMidnight = (y: number, month: number) => new Date(Date.UTC(y, month - 1, 1) - RIYADH_OFFSET_MS);

/* The term with this season and calendar year (Fall 2026 runs August to December 2026). */
export function makeTerm(season: Season, year: number): Term {
  const next: [Season, number] =
    season === 'spring' ? ['summer', year] : season === 'summer' ? ['fall', year] : ['spring', year + 1];
  return {
    key: `${season}-${year}`,
    label: `${NAMES[season]} ${year}`,
    start: riyadhMidnight(year, STARTS[season]),
    end: riyadhMidnight(next[1], STARTS[next[0]]),
  };
}
/* The term a moment falls in, by the Riyadh calendar. */
export function termAt(d: Date): Term {
  const local = new Date(d.getTime() + RIYADH_OFFSET_MS);
  const y = local.getUTCFullYear(),
    m = local.getUTCMonth() + 1;
  return makeTerm(m >= 8 ? 'fall' : m >= 6 ? 'summer' : 'spring', y);
}
export const previousTerm = (t: Term) => termAt(new Date(t.start.getTime() - 1));
/* "fall-2026" back to its term; anything else is null. */
export function termByKey(key: string | null | undefined): Term | null {
  const m = /^(fall|spring|summer)-(\d{4})$/.exec(key || '');
  return m ? makeTerm(m[1] as Season, Number(m[2])) : null;
}

/* Which term Wrapped is about right now, and whether /me shows the link: the current term from four
 * weeks before its end, the previous term for two weeks after that, and no link the rest of the time
 * (the page still opens on the current term). */
export function wrappedNow(now: Date): { term: Term; linked: boolean } {
  const current = termAt(now);
  if (now.getTime() >= current.end.getTime() - LINK_BEFORE_END_MS) return { term: current, linked: true };
  if (now.getTime() < current.start.getTime() + LINK_AFTER_END_MS) return { term: previousTerm(current), linked: true };
  return { term: current, linked: false };
}
/* The terms a member can look back on: from the one they joined in to the current one, newest first. */
export function termsSince(joined: Date, now: Date): Term[] {
  const out: Term[] = [];
  const first = termAt(joined.getTime() > now.getTime() ? now : joined).key;
  for (let t = termAt(now); out.length < 40; t = previousTerm(t)) {
    out.push(t);
    if (t.key === first) break;
  }
  return out;
}

/* The numbers member_stats() returns for one member and one term. */
export type Stats = {
  events: number;
  registered: number;
  posts: number;
  points: number;
  competitions: number;
  flag: boolean;
  favouriteType: string | null;
};
export const EMPTY_STATS: Stats = {
  events: 0,
  registered: 0,
  posts: 0,
  points: 0,
  competitions: 0,
  flag: false,
  favouriteType: null,
};
/* The term's badges, from the same activity as the badges on a public profile. */
export function termBadges(s: Stats): string[] {
  return [
    s.events >= 5 && 'Regular',
    s.events > 0 && s.events < 5 && 'Attended events',
    s.posts > 0 && 'Writer',
    s.competitions > 0 && 'Competitor',
    s.flag && 'Flag solver',
    s.points >= 100 && '100+ points',
  ].filter(Boolean) as string[];
}
export const isEmptyTerm = (s: Stats) => !s.events && !s.posts && !s.points && !s.flag;
