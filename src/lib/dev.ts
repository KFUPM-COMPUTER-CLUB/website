/* Test pages for contributors (src/pages/dev, #132). The signed-in pages need Supabase, so without a .env
 * (seed mode) /me/profile and the post editor cannot be opened locally. /dev renders the same components
 * (ProfileForm, PostEditor) with a sample member and post kept in memory by the dev server, so a change
 * to those pages can be tried with npm run dev before opening a pull request. Nothing here touches a
 * database or Storage, and every /dev route answers 404 outside npm run dev (import.meta.env.DEV is false
 * in any build), so none of it reaches a preview or production. */
import type { Profile } from './types';

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
