/* Shapes shared by the content layer, the pages and the API routes. The only runtime code is the role ladder
 * and the year list. */

/* Roles are a ladder, not a set of permissions: a higher rank can do everything a lower one can.
 * ROLE_RANK must match role_rank() in supabase/migrations/0001_init.sql, which the read policies
 * use through has_role(); if the two drift, the page and the database admit different people.
 * 'guest' (no session) is deliberately not a Role and never passes atLeast(). */
export type Role = 'member' | 'editor' | 'reviewer' | 'officer' | 'admin';
export const ROLE_RANK: Record<Role, number> = { member: 0, editor: 1, reviewer: 2, officer: 3, admin: 4 };
export const atLeast = (role: Role | 'guest', min: Role) => role !== 'guest' && ROLE_RANK[role] >= ROLE_RANK[min];

/* Points (supabase/migrations/0005_points.sql). The categories match the check on points.category,
 * and POINT_VALUES mirrors point_value() there: the automatic award for each kind of activity.
 * Competitions and "other" have no fixed value: a competition placing awards the amount on its result
 * (/admin/events/<id>/results, 0010_event_results.sql), and anything else is entered on /admin/points.
 * Competitions are never entered by hand: the result already pays, so a manual row would pay twice. */
export const POINT_CATEGORIES = ['events', 'posts', 'flag', 'competitions', 'other'] as const;
export type PointCategory = (typeof POINT_CATEGORIES)[number];
export const POINT_LABELS: Record<PointCategory, string> = {
  events: 'Events',
  posts: 'Posts',
  flag: 'Flag',
  competitions: 'Competitions',
  other: 'Other',
};
export const POINT_VALUES = { events: 10, posts: 25, flag: 50 } as const;
/* What a competition placing is worth unless the officer types another amount on the results page
 * (0010_event_results.sql stores the amount on each result). */
export const placePoints = (place: number) => (place === 1 ? 100 : place === 2 ? 75 : place === 3 ? 50 : 25);
/* Event types with placings (EVENT_TYPES in admin/resources.ts). Only these get a Results page, the
 * Results block on /timeline and Wins on profiles. */
export const RESULT_TYPES = ['Competition', 'Hackathon'];
export const hasResults = (type: string) => RESULT_TYPES.includes(type);
/* A whole number typed into a form: a place, a prize, points. Commas and spaces are dropped and
 * Arabic-Indic (٠-٩) or Persian (۰-۹) digits read as 0-9. Empty is null; anything else that is not
 * only digits ("5k", "1.5", "SAR 5000", "-3") is NaN, so the caller refuses it instead of saving the
 * wrong number. */
export const wholeNumber = (v: unknown): number | null => {
  const t = (typeof v === 'string' || typeof v === 'number' ? String(v) : '')
    .replace(/[,،٬\s]/g, '')
    .replace(/[٠-٩]/g, (d) => String(d.charCodeAt(0) - 0x660))
    .replace(/[۰-۹]/g, (d) => String(d.charCodeAt(0) - 0x6f0));
  if (!t) return null;
  return /^\d+$/.test(t) ? Number(t) : NaN;
};
/* One row of /leaderboard from leaderboard() in 0006_leaderboard.sql. handle, name and avatar are null
 * for members who did not opt in: they keep their rank and total but show as "A member". */
export type LeaderRow = {
  rank: number;
  handle: string | null;
  name: string | null;
  avatar: string | null;
  total: number;
};
export type LeaderPeriod = 'term' | 'all';

/* The public handle rule, shared by onboarding, the profile form and both APIs. Handles are URLs
 * (/u/<handle>) and are stored lowercase. The forms accept capitals because the API lowercases them,
 * so "JohnDoe" is saved as "johndoe" instead of failing with the browser's bare "match the requested
 * format"; the title is what the browser adds to that message when the pattern still fails. */
export const HANDLE_RE = /^[a-z0-9_]{3,24}$/;
export const HANDLE_PATTERN = '[A-Za-z0-9_]{3,24}';
export const HANDLE_HINT =
  '3 to 24 characters: letters, digits and underscores, saved in lowercase. For example john_doe or sara_99; not john.doe, john-doe or john doe.';

/* The study-year choices on onboarding and the profile form. One list for both: the profile <select>
 * can only keep a value it lists, so a year missing there would be silently replaced on save.
 * profiles.year is free text (max 30 characters in the API), so adding a choice needs no migration. */
export const YEARS = [
  'Preparatory / Orientation',
  'Freshman',
  'Sophomore',
  'Junior',
  'Senior',
  'Graduate',
  'Alumni',
  'Other',
];

/* Enough to render a plain <img>; produced by photos.ts for database and seed pictures alike. */
export type Img = { src: string; srcset?: string; width?: number; height?: number };

/* A profiles row as its owner or an admin sees it. Never put email or phone on a public page: use
 * PublicProfile, which mirrors the profiles_public view. */
export type Profile = {
  id: string;
  handle: string | null;
  name: string | null;
  email: string | null;
  phone: string | null;
  major: string | null;
  year: string | null;
  kfupm_email: string | null;
  github: string | null;
  linkedin: string | null;
  bio: string | null;
  avatar_url: string | null;
  show_in_contributors: boolean;
  /* Name and photo on /leaderboard and points on /u/<handle> (0006_leaderboard.sql); off by default. */
  show_on_leaderboard?: boolean;
  /* The weekly digest email (0009_digest.sql); off by default, also turned off by its unsubscribe link. */
  digest_opt_in?: boolean;
  onboarded: boolean;
  suspended: boolean;
  created_at: string;
  committee_id?: string | null;
  /* Attached by the middleware when the member is in a committee (0003_committee_members.sql). */
  committee?: { id: string; name: string; grants_role: Role } | null;
};
export type PublicProfile = Pick<
  Profile,
  | 'id'
  | 'handle'
  | 'name'
  | 'bio'
  | 'avatar_url'
  | 'github'
  | 'linkedin'
  | 'major'
  | 'year'
  | 'show_in_contributors'
  | 'created_at'
>;

/* start and end are UTC instants; allDay means only their Riyadh date matters (see content.ts). */
export type EventItem = {
  id: string;
  slug: string;
  title: string;
  type: string;
  start: Date;
  end: Date | null;
  allDay: boolean;
  location: string;
  summary: string;
  coverKey: string | null;
  cover: Img | null;
  xUrl: string | null;
  registerUrl: string | null;
  capacity: number | null;
  registrationOpen: boolean;
  featured: boolean;
  published: boolean;
};
/* One placing from event_results (0010_event_results.sql). name and handle are set while the member's
 * profile is public; team is the free-text name, alone or beside the member. */
export type EventResult = {
  place: number;
  name: string | null;
  handle: string | null;
  team: string | null;
  prizeSar: number | null;
};
/* A placing as a member's profile lists it, with the event it was won at. */
export type Win = { place: number; team: string | null; prizeSar: number | null; event: EventItem };
export type Highlight = {
  id: string;
  photoKey: string | null;
  img: Img | null;
  title: string;
  date: string;
  line: string;
  postUrl: string | null;
  sort: number;
};
export type Story = {
  id: string;
  photoKey: string | null;
  img: Img | null;
  title: string;
  date: string;
  text: string;
  postUrl: string | null;
};
export type StripPhoto = { key: string; img: Img | null; label: string; postUrl: string | null; date: string };
export type ImpactSemester = {
  id: string;
  term: string;
  totalSar: number | null;
  isMinimum: boolean;
  photoKey: string | null;
  img: Img | null;
  items: { name: string; prizeSar: number | null; detail: string | null; sourceUrl: string | null }[];
};
export type Partner = {
  id: string;
  name: string;
  kind: string;
  what: string | null;
  url: string | null;
  sourceUrl: string | null;
  logoKey: string | null;
  logo: Img | null;
  handle: string | null;
  mark: boolean;
  square: boolean;
  tall: boolean;
  sort: number;
};
export type Officer = {
  id: string;
  userId: string | null;
  handle: string | null;
  name: string;
  title: string;
  committee: string;
  term: string;
  major: string | null;
  photo: string | null;
  linkedin: string | null;
  isCurrent: boolean;
  sort: number;
};
export type FaqItem = { id: string; q: string; a: string; qAr: string | null; aAr: string | null; sort: number };
/* A committee on /community. Leads are free text so the section works before the leads have accounts. */
export type Committee = {
  id: string;
  name: string;
  leads: string;
  items: string[];
  note: string | null;
  sort: number;
  /* The minimum role every member of the committee gets; see src/middleware.ts. */
  grantsRole: Role;
  members: { name: string | null; handle: string | null; avatar_url: string | null }[];
};
/* The settings table merged over the seed defaults (content.ts getSettings). */
export type Settings = {
  site: {
    name: string;
    short: string;
    tagline: string;
    description: string;
    intro: string;
    email: string;
    missionAr?: string;
  };
  links: Record<string, string>;
  home: {
    heroLine: string;
    buildWithUs: { title: string; text: string };
    photoMoment: { photoKey: string; eyebrow: string; line: string };
    stats: { v: string; u: string; l: string }[];
    totalPrizesSar: number;
  };
  banner: { text: string; url: string; visible: boolean } | null;
  madeBy: { name: string; github?: string }[];
  contributorsUrl: string;
};
export type PostSummary = {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  date: Date;
  authorName: string;
  authorHandle: string | null;
  authorAvatar: string | null;
  category: string;
  tags: string[];
  dir: 'ltr' | 'rtl';
  status: string;
  /* When the content last changed (posts.edited_at, 0013_post_edited_at.sql); null for seed posts. */
  updatedAt: Date | null;
};
/* One row of the writers' leaderboard on /blog (writers_leaderboard() in 0011_featured_posts.sql): posts
 * published this term. handle, name and avatarUrl are null for members who did not opt in, like LeaderRow:
 * they keep their place but show as "A member". Seed mode has the seed bylines as names and no handles. */
export type Writer = { handle: string | null; name: string | null; avatarUrl: string | null; posts: number };
/* Exactly one of html (editor HTML from the database) and entry (an Astro content entry, seed mode) is set. */
export type PostFull = PostSummary & { html: string | null; entry: any | null; coverKey: string | null };
