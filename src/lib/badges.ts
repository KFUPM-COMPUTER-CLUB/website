/* Badges (0014_badges.sql): the catalogue with its art, and the reads for /u/<handle> and /me. The art
 * lives in src/data/badges/ and goes through astro:assets. Keep BADGES in step with the rows the
 * migration inserts into public.badges. Automatic badges are awarded by triggers in the database;
 * officer badges by /api/admin/badges. Reads never throw: a failed query (the migration not run yet,
 * say) is logged and shows no badges. */
import type { ImageMetadata } from 'astro';
import { dbReady, serviceReady } from './env';
import { publicClient, serviceClient } from './supabase';
import firstPost from '../data/badges/first-post.svg';
import fiveEvents from '../data/badges/five-events.svg';
import flagSolver from '../data/badges/flag-solver.svg';
import hackathonWinner from '../data/badges/hackathon-winner.svg';
import topWriter from '../data/badges/top-writer.svg';

export type BadgeKey = 'first_post' | 'five_events' | 'flag_solver' | 'hackathon_winner' | 'top_writer';
export const BADGES: Record<BadgeKey, { name: string; description: string; officer: boolean; icon: ImageMetadata }> = {
  first_post: {
    name: 'First post',
    description: 'Published a first post on the blog.',
    officer: false,
    icon: firstPost,
  },
  five_events: { name: '5 events', description: 'Attended five club events.', officer: false, icon: fiveEvents },
  flag_solver: {
    name: 'Flag solver',
    description: 'Found the flag hidden on the site.',
    officer: false,
    icon: flagSolver,
  },
  hackathon_winner: {
    name: 'Hackathon winner',
    description: 'Placed at a club hackathon.',
    officer: true,
    icon: hackathonWinner,
  },
  top_writer: {
    name: 'Top writer of the semester',
    description: 'Chosen by the blog team for a semester.',
    officer: true,
    icon: topWriter,
  },
};
export const OFFICER_BADGES = (Object.keys(BADGES) as BadgeKey[]).filter((k) => BADGES[k].officer);
export const isBadgeKey = (v: unknown): v is BadgeKey => typeof v === 'string' && v in BADGES;

export type MemberBadge = {
  id: string | null;
  key: BadgeKey;
  name: string;
  description: string;
  icon: ImageMetadata;
  awardedAt: Date;
  reference: string | null;
  auto: boolean;
};
/* The display name for a stored key; an unknown key (a badge added in SQL only) shows as itself. */
export const badgeName = (key: unknown) => (isBadgeKey(key) ? BADGES[key].name : String(key ?? ''));
const toBadge = (r: any): MemberBadge | null => {
  const key: unknown = r.badge;
  if (!isBadgeKey(key)) return null;
  const { name, description, icon } = BADGES[key];
  return {
    id: r.id || null,
    key,
    name,
    description,
    icon,
    awardedAt: new Date(r.awarded_at),
    reference: r.reference || null,
    auto: !!r.auto,
  };
};
const only = (rows: any[]) => rows.map(toBadge).filter(Boolean) as MemberBadge[];

/* For the public profile: profile_badges() returns nothing unless the profile is public and the member
 * left "Show my badges on my public profile" ticked. */
export async function getProfileBadges(userId: string): Promise<MemberBadge[]> {
  if (!dbReady()) return [];
  const { data, error } = await publicClient().rpc('profile_badges', { p_user: userId });
  if (error) {
    console.error('profile badges', error.message);
    return [];
  }
  return only(data || []);
}
/* For /me: every badge the member holds, shown to them whatever the public setting. */
export async function getMyBadges(userId: string): Promise<MemberBadge[]> {
  if (!serviceReady()) return [];
  const { data, error } = await serviceClient()
    .from('member_badges')
    .select('id,badge,awarded_at,reference,auto')
    .eq('user_id', userId)
    .order('awarded_at', { ascending: false });
  if (error) {
    console.error('my badges', error.message);
    return [];
  }
  return only(data || []);
}
