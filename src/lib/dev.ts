/* Test pages for contributors (src/pages/dev, #132). The signed-in pages need Supabase, so without a .env
 * (seed mode) /me/profile and the post editor cannot be opened locally. /dev renders the same components
 * (ProfileForm, PostEditor) with a sample member and post kept in memory by the dev server, so a change
 * to those pages can be tried with npm run dev before opening a pull request. Nothing here touches a
 * database or Storage, and every /dev route answers 404 outside npm run dev (import.meta.env.DEV is false
 * in any build), so none of it reaches a preview or production. */
import type { EventItem, LeaderRow, PostSummary, Profile } from './types';
import { photoImg } from './photos';

export const devOnly = () => import.meta.env.DEV;

const sampleProfile = (): Profile => ({
  id: '00000000-0000-4000-8000-000000000001',
  handle: 'test_member',
  name: 'Test Member',
  first_name: 'Test',
  middle_name: null,
  last_name: 'Member',
  email: 'test.member@example.com',
  phone: '+966500000000',
  major: 'Computer Science',
  year: 'Junior',
  kfupm_email: 's000000000@kfupm.edu.sa',
  github: 'test-member',
  linkedin: null,
  bio: 'A sample member for the test pages. Edit anything and press Save.',
  avatar_url: null,
  show_in_contributors: true,
  show_on_leaderboard: false,
  show_badges: true,
  digest_opt_in: false,
  onboarded: true,
  suspended: false,
  created_at: '2026-09-01T09:00:00.000Z',
});
const samplePost = () => ({
  id: '00000000-0000-4000-8000-000000000002',
  title: 'A sample post',
  excerpt: 'Try the toolbar, code blocks, tables and image uploads.',
  category: 'Tutorial',
  tags: ['sample'],
  dir: 'ltr',
  status: 'draft',
  author_name: 'Test Member',
  content_html:
    '<p>Everything here stays in the dev server’s memory. Restart it, or open /dev?reset=1, to start over.</p>',
  content_json: null as unknown,
});

/* One sample of each for the whole dev server, so a saved change survives a reload. */
const store = { profile: sampleProfile(), post: samplePost() };
export const devStore = () => store;
export const resetDevStore = () => {
  store.profile = sampleProfile();
  store.post = samplePost();
};

/* The home page with ?sample in npm run dev (src/pages/index.astro): seed mode has no upcoming events, no
 * featured post and no leaderboard, so the sections built on them would stay hidden locally. This fills
 * them with the seed data moved into the future and a few sample numbers, so the design can be tried. */
export async function homeSample(events: EventItem[], posts: PostSummary[]) {
  const day = 86_400_000;
  const soon = events.slice(-3).map((e, i) => ({
    ...e,
    start: new Date(Date.now() + (3 + i * 6) * day),
    end: null,
    registrationOpen: i === 0,
  }));
  const post = posts[0] ? { ...posts[0], cover: await photoImg(events.find((e) => e.coverKey)?.coverKey) } : null;
  const leaders: LeaderRow[] = [
    { rank: 1, handle: 'test_member', name: 'Test Member', avatar: null, total: 140 },
    { rank: 2, handle: null, name: null, avatar: null, total: 95 },
    { rank: 3, handle: 'sample_two', name: 'Sample Two', avatar: null, total: 80 },
  ];
  return {
    upcoming: soon,
    featured: post ? { ...post, month: new Date().toISOString().slice(0, 7) + '-01' } : null,
    leaders,
    counts: { members: 240, events: 22, posts: 9, workshops: 3 },
  };
}
