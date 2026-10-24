/* The content layer: every page reads through these functions, never through Supabase directly.
 * With PUBLIC_SUPABASE_URL set they query Postgres with the anon key (row level security applies);
 * without it they serve the seed data in src/data and src/content, so a contributor can run the
 * whole site with `npm run dev` and no account, and the site stays up if the project is paused.
 * Keep both branches returning the same shape. Caching: results are memoised for 30 s per server
 * instance, and public pages are cached by ISR for 60 s on top (astro.config.mjs). API writes call
 * bust() after a change; see the memo below for what that does and does not clear. */
import { getCollection } from 'astro:content';
import { dbReady } from './env';
import { publicClient } from './supabase';
import { photoImg, seedPhotoKeys } from './photos';
import { eventEnd, parseClock, parseRiyadh, riyadhDate, RIYADH } from './event-time';
export { eventEnd, parseClock, parseRiyadh, riyadhDate, RIYADH };
import type {
  EventItem,
  Highlight,
  Story,
  StripPhoto,
  ImpactSemester,
  Partner,
  Officer,
  FaqItem,
  Committee,
  Settings,
  PostSummary,
  PostFull,
  LeaderRow,
  LeaderPeriod,
  PointCategory,
  Writer,
} from './types';
import siteJson from '../data/site.json';
import committeesJson from '../data/committees.json';
import eventsJson from '../data/events.json';
import highlightsJson from '../data/highlights.json';
import storiesJson from '../data/stories.json';
import impactJson from '../data/impact.json';
import partnersJson from '../data/partners.json';
import teamJson from '../data/team.json';

/* One render calls many of these, so each query runs once per 30 s per instance and concurrent
 * renders share the same promise. A rejected promise is evicted so an outage is not remembered.
 * bust() only clears this instance's memo; other Vercel instances age out within 30 s, which is
 * why the window is short. The ISR cache expires on its own schedule (60 s), so an edit is live
 * everywhere within about a minute. */
const memo = new Map<string, { at: number; value: Promise<any> }>();
const cached = <T>(key: string, fn: () => Promise<T>): Promise<T> => {
  const hit = memo.get(key);
  if (hit && Date.now() - hit.at < 30_000) return hit.value;
  const value = fn().catch((e) => {
    memo.delete(key);
    throw e;
  });
  memo.set(key, { at: Date.now(), value });
  return value;
};
export const bust = () => memo.clear();
const db = () => publicClient();
/* The seed JSON uses "REPLACE" placeholders for details the club had not filled in; treat them as empty. */
const real = (v: unknown) => typeof v === 'string' && v.length > 0 && !v.includes('REPLACE');

/* ── Riyadh time helpers ───────────────────────────────────────────────── */
/* Times are stored as UTC instants but entered and shown in Riyadh time. Saudi Arabia has no
 * daylight saving, so a fixed three hour offset is exact and no timezone library is needed. The
 * same rule is repeated in admin/io.ts, calendar.ts, email.ts and scripts/import-seed.mjs. */
export const fmtRiyadh = (d: Date, opts: Intl.DateTimeFormatOptions) =>
  new Intl.DateTimeFormat('en-GB', { timeZone: RIYADH, ...opts }).format(d);
/* Academic terms by Riyadh month: August to December is Fall, January to May is Spring, the rest Summer. */
export const termOf = (d: Date) => {
  const [y, m] = riyadhDate(d).split('-').map(Number);
  return m >= 8 ? `Fall ${y}` : m <= 5 ? `Spring ${y}` : `Summer ${y}`;
};
/* The instant the term `d` falls in began (Riyadh midnight on 1 August, 1 January or 1 June), the same
 * rule as term_start() in 0006_leaderboard.sql. */
export const termStart = (d: Date) => {
  const [y, m] = riyadhDate(d).split('-').map(Number);
  return new Date(Date.UTC(y, (m >= 8 ? 8 : m <= 5 ? 1 : 6) - 1, 1) - 3 * 3_600_000);
};
/* The first day of the Riyadh month `d` falls in, `back` months earlier, as YYYY-MM-DD (posts.featured_month). */
export const monthOf = (d: Date, back = 0) => {
  const [y, m] = riyadhDate(d).split('-').map(Number);
  return new Date(Date.UTC(y, m - 1 - back, 1)).toISOString().slice(0, 10);
};

/* ── Settings ──────────────────────────────────────────────────────────── */
const seedSettings = (): Settings => ({
  site: {
    name: siteJson.name,
    short: siteJson.short,
    tagline: siteJson.tagline,
    description: siteJson.description,
    intro: siteJson.intro,
    email: real(siteJson.email) ? siteJson.email : '',
    missionAr: (siteJson as any).missionAr,
  },
  links: Object.fromEntries(Object.entries(siteJson.links).map(([k, v]) => [k, real(v) ? (v as string) : ''])),
  home: {
    heroLine: siteJson.tagline,
    buildWithUs: {
      title: 'Build with us.',
      text: 'Workshops, hackathons, talks and competitions, all term long. Free for KFUPM students.',
    },
    photoMoment: {
      photoKey: '2025-04-10_1910478806520914205.jpg',
      eyebrow: 'Techathon 2025, day one',
      line: 'Any major. Any year. No experience required.',
    },
    stats: [
      { v: '40,000', u: 'SAR', l: 'biggest prize pool' },
      { v: '60+', u: 'teams', l: 'at Techathon 2025' },
      { v: '400+', u: 'students', l: 'at KAUST Connect' },
    ],
    totalPrizesSar: Number(
      String((impactJson as any).headline_numbers?.announced_prizes_since_2023_sar || '187500').replace(/\D/g, ''),
    ),
  },
  banner: null,
  madeBy: (siteJson as any).madeBy || [],
  contributorsUrl: (siteJson as any).contributorsUrl || 'https://github.com/KFUPM-COMPUTER-CLUB/website',
});
/* Seed values sit under the database rows, so a key an admin never saved still renders. */
export function getSettings(): Promise<Settings> {
  return cached('settings', async () => {
    const base = seedSettings();
    if (!dbReady()) return base;
    const { data } = await db().from('settings').select('key,value');
    const rows = Object.fromEntries((data || []).map((r: any) => [r.key, r.value]));
    return {
      site: { ...base.site, ...(rows.site || {}) },
      links: { ...base.links, ...(rows.links || {}) },
      home: { ...base.home, ...(rows.home || {}) },
      banner: rows.banner?.visible ? rows.banner : null,
      madeBy: rows.made_by || base.madeBy,
      contributorsUrl: base.contributorsUrl,
    };
  });
}

/* ── Events ────────────────────────────────────────────────────────────── */
const seedEvents = (): EventItem[] =>
  (eventsJson as any[]).map((e) => {
    const start = parseRiyadh(e.date, e.time || '');
    const allDay = !parseClock(e.time || '');
    const end = e.endDate ? parseRiyadh(e.endDate) : null;
    return {
      id: e.id,
      slug: e.id,
      title: e.title,
      type: e.type,
      start,
      end,
      allDay,
      location: e.location || '',
      summary: e.summary || '',
      coverKey: e.image || null,
      cover: null,
      xUrl: e.detailsUrl || null,
      registerUrl: real(e.registerUrl) ? e.registerUrl : null,
      capacity: null,
      registrationOpen: false,
      featured: !!e.featured,
      published: true,
    };
  });
const rowToEvent = (r: any): EventItem => ({
  id: r.id,
  slug: r.slug,
  title: r.title,
  type: r.type,
  start: new Date(r.starts_at),
  end: r.ends_at ? new Date(r.ends_at) : null,
  allDay: !!r.all_day,
  location: r.location || '',
  summary: r.summary || '',
  coverKey: r.cover_key,
  cover: null,
  xUrl: r.x_url,
  registerUrl: r.register_url,
  capacity: r.capacity,
  registrationOpen: !!r.registration_open,
  featured: !!r.featured,
  published: !!r.published,
});
export function getEvents(): Promise<EventItem[]> {
  return cached('events', async () => {
    const list = dbReady()
      ? ((await db().from('events').select('*').eq('published', true).order('starts_at')).data || []).map(rowToEvent)
      : seedEvents();
    for (const e of list) e.cover = await photoImg(e.coverKey);
    return list.sort((a, b) => a.start.valueOf() - b.start.valueOf());
  });
}
export async function getUpcomingEvents() {
  const now = Date.now();
  return (await getEvents()).filter((e) => eventEnd(e).valueOf() >= now);
}
export async function getPastEvents() {
  const now = Date.now();
  return (await getEvents())
    .filter((e) => eventEnd(e).valueOf() < now)
    .sort((a, b) => b.start.valueOf() - a.start.valueOf());
}
export async function getEvent(slugOrId: string) {
  return (await getEvents()).find((e) => e.slug === slugOrId || e.id === slugOrId) || null;
}

/* ── Home content ──────────────────────────────────────────────────────── */
export function getHighlights(): Promise<Highlight[]> {
  return cached('highlights', async () => {
    const list: Highlight[] = dbReady()
      ? ((await db().from('highlights').select('*').eq('visible', true).order('sort')).data || []).map((r: any) => ({
          id: r.id,
          photoKey: r.photo_key,
          img: null,
          title: r.title,
          date: r.date,
          line: r.line || '',
          postUrl: r.post_url,
          sort: r.sort,
        }))
      : (highlightsJson as any[]).map((h, i) => ({
          id: `seed-${i}`,
          photoKey: h.photo,
          img: null,
          title: h.title,
          date: h.date,
          line: h.line,
          postUrl: h.post,
          sort: i,
        }));
    for (const h of list) h.img = await photoImg(h.photoKey);
    return list.filter((h) => h.img);
  });
}
export function getStories(): Promise<Story[]> {
  return cached('stories', async () => {
    const list: Story[] = dbReady()
      ? ((await db().from('stories').select('*').eq('visible', true).order('sort')).data || []).map((r: any) => ({
          id: r.id,
          photoKey: r.photo_key,
          img: null,
          title: r.title,
          date: r.date,
          text: r.text || '',
          postUrl: r.post_url,
        }))
      : (storiesJson as any[]).map((s, i) => ({
          id: `seed-${i}`,
          photoKey: s.photo,
          img: null,
          title: s.title,
          date: s.date,
          text: s.text,
          postUrl: s.post,
        }));
    for (const s of list) s.img = await photoImg(s.photoKey);
    return list.filter((s) => s.img);
  });
}
export function getStripPhotos(): Promise<StripPhoto[]> {
  return cached('strip', async () => {
    let list: StripPhoto[];
    if (dbReady()) {
      const rows = (await db().from('strip_photos').select('*').eq('visible', true).order('sort')).data || [];
      list = rows.map((r: any) => ({
        key: r.photo_key,
        img: null,
        label: r.label || '',
        postUrl: r.post_url,
        date: (r.photo_key.match(/^\d{4}-\d{2}-\d{2}/) || [''])[0],
      }));
    } else {
      const events = eventsJson as any[];
      const highlights = highlightsJson as any[];
      const labels = new Map<string, string>(
        [
          ...events.map((e) => [e.image, e.title] as [string, string]),
          ...highlights.map((h) => [h.photo, h.title] as [string, string]),
        ].filter(([k]) => k),
      );
      const byDate = new Map(events.filter((e) => e.image).map((e) => [e.date, e.title]));
      list = seedPhotoKeys().map((key) => {
        const [date, id] = key.replace('.jpg', '').split('_');
        return {
          key,
          img: null,
          label: labels.get(key) || byDate.get(date) || '@KFUPM_CC',
          postUrl: `https://x.com/KFUPM_CC/status/${id}`,
          date,
        };
      });
    }
    for (const p of list) p.img = await photoImg(p.key);
    return list.filter((p) => p.img);
  });
}
export function getImpact(): Promise<ImpactSemester[]> {
  return cached('impact', async () => {
    let list: ImpactSemester[];
    if (dbReady()) {
      // A PostgREST embed is fine here: both tables have an unconditional read policy.
      const { data } = await db().from('impact_semesters').select('*, impact_items(*)').order('sort');
      list = (data || []).map((r: any) => ({
        id: r.id,
        term: r.term,
        totalSar: r.total_sar,
        isMinimum: !!r.total_is_minimum,
        photoKey: r.photo_key,
        img: null,
        items: (r.impact_items || [])
          .sort((a: any, b: any) => a.sort - b.sort)
          .map((i: any) => ({ name: i.name, prizeSar: i.prize_sar, detail: i.detail, sourceUrl: i.source_url })),
      }));
    } else {
      list = (impactJson as any).semesters.map((s: any, i: number) => ({
        id: `seed-${i}`,
        term: s.term,
        totalSar: s.total_sar ?? null,
        isMinimum: !!s.total_is_minimum,
        photoKey: s.photo || null,
        img: null,
        items: (s.events || []).map((e: any) => ({
          name: e.name,
          prizeSar: e.prize_sar ?? null,
          detail: e.detail || null,
          sourceUrl: e.source || null,
        })),
      }));
    }
    for (const s of list) s.img = await photoImg(s.photoKey);
    return list;
  });
}
export function getPartners(): Promise<Partner[]> {
  return cached('partners', async () => {
    let list: Partner[];
    if (dbReady()) {
      const { data } = await db().from('partners').select('*').eq('visible', true).order('sort');
      list = (data || []).map((r: any) => ({
        id: r.id,
        name: r.name,
        kind: r.kind,
        what: r.what,
        url: r.url,
        sourceUrl: r.source_url,
        logoKey: r.logo_key,
        logo: null,
        handle: r.handle,
        mark: !!r.mark,
        square: !!r.square,
        tall: !!r.tall,
        sort: r.sort,
      }));
    } else {
      const p = partnersJson as any;
      let i = 0;
      const conv = (kind: string) => (e: any) => ({
        id: `seed-${i++}`,
        name: e.name,
        kind,
        what: e.what || null,
        url: e.url || null,
        sourceUrl: e.source || null,
        logoKey: e.logo || null,
        logo: null,
        handle: e.handle || null,
        mark: !!e.mark,
        square: !!e.square,
        tall: !!e.tall,
        sort: i,
      });
      list = [
        ...p.companies.map(conv('company')),
        ...p.kfupm_units.map(conv('kfupm_unit')),
        ...p.student_clubs.map(conv('student_club')),
      ];
    }
    for (const x of list) x.logo = await photoImg(x.logoKey, 'logo');
    return list;
  });
}

/* ── Community ─────────────────────────────────────────────────────────── */
export function getOfficers(): Promise<Officer[]> {
  return cached('officers', async () => {
    if (!dbReady())
      return (teamJson as any[]).map((m, i) => ({
        id: m.id,
        userId: null,
        handle: null,
        name: m.name,
        title: m.role,
        committee: m.committee || '',
        term: m.term || '',
        major: m.major || null,
        photo: m.photo || null,
        linkedin: m.linkedin || null,
        isCurrent: true,
        sort: m.order ?? i,
      }));
    const { data } = await db().from('officer_terms').select('*').order('sort');
    // Handles and avatars come from the public view, matched by id here rather than embedded; see withAuthors.
    const ids = (data || []).map((r: any) => r.user_id).filter(Boolean);
    const profiles = ids.length
      ? (await db().from('profiles_public').select('id,handle,avatar_url').in('id', ids)).data || []
      : [];
    const byId = new Map(profiles.map((p: any) => [p.id, p]));
    const out: Officer[] = [];
    for (const r of data || []) {
      const p: any = r.user_id ? byId.get(r.user_id) : null;
      const img = await photoImg(r.photo_key);
      out.push({
        id: r.id,
        userId: r.user_id,
        handle: p?.handle || null,
        name: r.name,
        title: r.title,
        committee: r.committee || '',
        term: r.term,
        major: r.major,
        photo: img?.src || p?.avatar_url || null,
        linkedin: r.linkedin,
        isCurrent: !!r.is_current,
        sort: r.sort,
      });
    }
    return out;
  });
}
/* Profiles are readable only by their owner, so the count comes from the security-definer member_count(). */
export async function getMemberCount(): Promise<number | null> {
  if (!dbReady()) return null;
  return cached('member_count', async () => {
    const { data } = await db().rpc('member_count');
    return typeof data === 'number' ? data : Number(data) || 0;
  });
}
export async function getContributors(): Promise<
  { id: string; handle: string; name: string; avatar_url: string | null; posts: number }[]
> {
  if (!dbReady()) return [];
  return cached(
    'contributors',
    async () =>
      ((await db().from('contributors').select('*').order('posts', { ascending: false }).limit(24)).data || []) as any,
  );
}

/* ── Leaderboard ───────────────────────────────────────────────────────── */
/* Totals come from the security-definer leaderboard() (0006_leaderboard.sql), which names only members
 * who opted in. Seed mode has no points, so the page shows its empty state. A failed call is logged and
 * also shows the empty state: a public page must not go down because one query did (the function
 * missing from the API's schema cache right after a migration, say). */
export async function getLeaderboard(period: LeaderPeriod, category: PointCategory | 'all'): Promise<LeaderRow[]> {
  if (!dbReady()) return [];
  return cached(`leaderboard:${period}:${category}`, async () => {
    const { data, error } = await db().rpc('leaderboard', { p_period: period, p_category: category });
    if (error) {
      console.error('leaderboard', error.message);
      return [];
    }
    return ((data || []) as any[]).map((r) => ({
      rank: r.rank,
      handle: r.handle,
      name: r.name,
      avatar: r.avatar_url,
      total: r.total,
    }));
  });
}

/* ── FAQ ───────────────────────────────────────────────────────────────── */
export function getFaq(): Promise<FaqItem[]> {
  return cached('faq', async () => {
    if (!dbReady())
      return (siteJson as any).faq.map((f: any, i: number) => ({
        id: `seed-${i}`,
        q: f.q,
        a: f.a,
        qAr: f.qAr ?? null,
        aAr: f.aAr ?? null,
        sort: i,
      }));
    const { data } = await db().from('faq').select('*').eq('visible', true).order('sort');
    return (data || []).map((r: any) => ({ id: r.id, q: r.q_en, a: r.a_en, qAr: r.q_ar, aAr: r.a_ar, sort: r.sort }));
  });
}

/* ── Committees ────────────────────────────────────────────────────────── */
/* Items are one per line in the table so the generic admin textarea can edit them. */
const splitLines = (s: unknown) =>
  String(s || '')
    .split('\n')
    .map((l) => l.trim())
    .filter(Boolean);
/* The table is not in the Data API: 0002_committees.sql has not run on the project yet. */
const noTable = (e: { code?: string; message?: string } | null) =>
  !!e && (e.code === 'PGRST205' || e.code === '42P01' || /schema cache/i.test(e.message || ''));
export function getCommittees(): Promise<Committee[]> {
  return cached('committees', async () => {
    const seed = () =>
      (committeesJson as any[]).map((c, i) => ({
        id: `seed-${i}`,
        name: c.name,
        leads: c.leads || '',
        items: c.items || [],
        note: c.note || null,
        sort: i,
        grantsRole: (c.grantsRole || 'member') as Committee['grantsRole'],
        members: [],
      }));
    if (!dbReady()) return seed();
    const [{ data, error }, { data: people }] = await Promise.all([
      db().from('committees').select('*').eq('visible', true).order('sort'),
      // Members who are in a committee, for the cards. Empty until 0003_committee_members.sql has run.
      db()
        .from('profiles_public')
        .select('committee_id,name,handle,avatar_url')
        .not('committee_id', 'is', null)
        .order('name'),
    ]);
    // Until the migration has run, show the deck's committees rather than an empty page.
    if (noTable(error)) return seed();
    return (data || []).map((r: any) => ({
      id: r.id,
      name: r.name,
      leads: r.leads || '',
      items: splitLines(r.items),
      note: r.note || null,
      sort: r.sort,
      grantsRole: r.grants_role || 'member',
      members: (people || [])
        .filter((p: any) => p.committee_id === r.id)
        .map((p: any) => ({ name: p.name, handle: p.handle, avatar_url: p.avatar_url })),
    }));
  });
}

/* ── Posts ─────────────────────────────────────────────────────────────── */
const rowToPost = (r: any): PostSummary => ({
  id: r.id,
  slug: r.slug,
  title: r.title,
  excerpt: r.excerpt || '',
  date: new Date(r.published_at || r.created_at),
  authorName: r.author?.name || r.author_name || 'Computer Club',
  authorHandle: r.author?.handle || null,
  authorAvatar: r.author?.avatar_url || null,
  category: r.category,
  tags: r.tags || [],
  dir: r.dir || 'ltr',
  status: r.status,
});
/* Authors are fetched from profiles_public and joined here instead of a PostgREST embed such as
 * select('*, profiles(...)'). An embed through the profiles table is filtered by its policy, which
 * lets a visitor read only their own row, so authors would come back empty on public pages; an
 * embed through the view depends on PostgREST inferring the relationship, which silently yields
 * nulls when it cannot. Two plain queries are predictable, and the view already hides phone and email. */
async function withAuthors(rows: any[]): Promise<PostSummary[]> {
  const ids = [...new Set(rows.map((r) => r.author_id).filter(Boolean))];
  const authors = ids.length
    ? (await db().from('profiles_public').select('id,name,handle,avatar_url').in('id', ids)).data || []
    : [];
  const byId = new Map(authors.map((a: any) => [a.id, a]));
  return rows.map((r) => rowToPost({ ...r, author: byId.get(r.author_id) || null }));
}
/* Seed posts are markdown in src/data/posts rendered by Astro; database posts carry the editor's HTML. */
export function getPosts(): Promise<PostSummary[]> {
  return cached('posts', async () => {
    if (!dbReady()) {
      const entries = await getCollection('posts', ({ data }) => !data.draft);
      return entries
        .map((e) => ({
          id: e.id,
          slug: e.id,
          title: e.data.title,
          excerpt: e.data.excerpt,
          date: e.data.date,
          authorName: e.data.author,
          authorHandle: null,
          authorAvatar: null,
          category: e.data.category,
          tags: e.data.tags,
          dir: 'ltr' as const,
          status: 'published',
        }))
        .sort((a, b) => b.date.valueOf() - a.date.valueOf());
    }
    const { data } = await db()
      .from('posts')
      .select('id,slug,title,excerpt,published_at,created_at,author_id,author_name,category,tags,dir,status')
      .eq('status', 'published')
      .order('published_at', { ascending: false });
    return withAuthors(data || []);
  });
}
/* The featured post (0011_featured_posts.sql): this month's pick, or last month's until a reviewer picks
 * one, so /blog does not lose its hero on the 1st. A separate query from getPosts(), so the blog still
 * lists its posts if the column is missing (the migration not run yet); that and seed mode show no hero. */
export function getFeaturedPost(): Promise<PostSummary | null> {
  if (!dbReady()) return Promise.resolve(null);
  return cached('featured', async () => {
    const now = new Date();
    const { data, error } = await db()
      .from('posts')
      .select('id')
      .eq('status', 'published')
      .in('featured_month', [monthOf(now), monthOf(now, 1)])
      .order('featured_month', { ascending: false })
      .limit(1);
    if (error) {
      console.error('featured post', error.message);
      return null;
    }
    const id = data?.[0]?.id;
    return id ? (await getPosts()).find((p) => p.id === id) || null : null;
  });
}
/* The top five writers this term: posts published this term, then reads this term (writers_leaderboard()
 * in 0011_featured_posts.sql). Seed mode counts the seed posts by author, with no reads. A failed call is
 * logged and shows an empty list. */
export function getWriters(): Promise<Writer[]> {
  return cached('writers', async () => {
    const since = termStart(new Date());
    if (!dbReady()) {
      const counts = new Map<string, number>();
      for (const p of await getPosts())
        if (p.date >= since) counts.set(p.authorName, (counts.get(p.authorName) || 0) + 1);
      return [...counts]
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(([name, posts]) => ({ handle: null, name, avatarUrl: null, posts, reads: 0 }));
    }
    const { data, error } = await db().rpc('writers_leaderboard', { p_since: since.toISOString(), p_limit: 5 });
    if (error) {
      console.error('writers', error.message);
      return [];
    }
    return (data || []).map((r: any) => ({
      handle: r.handle,
      name: r.name || r.handle,
      avatarUrl: r.avatar_url,
      posts: Number(r.posts) || 0,
      reads: Number(r.reads) || 0,
    }));
  });
}
export async function getPost(slug: string): Promise<PostFull | null> {
  if (!dbReady()) {
    const entries = await getCollection('posts', ({ data }) => !data.draft);
    const e = entries.find((x) => x.id === slug);
    if (!e) return null;
    return {
      id: e.id,
      slug: e.id,
      title: e.data.title,
      excerpt: e.data.excerpt,
      date: e.data.date,
      authorName: e.data.author,
      authorHandle: null,
      authorAvatar: null,
      category: e.data.category,
      tags: e.data.tags,
      dir: 'ltr',
      status: 'published',
      html: null,
      entry: e,
      coverKey: null,
    };
  }
  const { data } = await db().from('posts').select('*').eq('slug', slug).eq('status', 'published').maybeSingle();
  if (!data) return null;
  const [row] = await withAuthors([data]);
  return { ...row, html: data.content_html, entry: null, coverKey: data.cover_key };
}
