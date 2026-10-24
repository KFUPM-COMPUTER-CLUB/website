/* The weekly digest's rules, without a database: which events and posts go in, which week a run
 * belongs to, and the unsubscribe token. src/lib/email.ts (queueDigest) supplies the data and the
 * secret; tests/digest.test.ts runs this file under plain node, which is why it imports no astro module. */
import type { EventItem, PostSummary } from './types.ts';
import { hmac, sameSecret } from './secret.ts';

export const DIGEST_DAYS = 14; // events starting within the next two weeks
const DAY_MS = 86_400_000;
const RIYADH_OFFSET_MS = 3 * 3_600_000; // Saudi Arabia has no daylight saving

/* Events that start from now until DIGEST_DAYS from now, soonest first. One already under way is left
 * out: members heard about it in an earlier digest. */
export const upcomingFor = <T extends Pick<EventItem, 'start'>>(events: T[], now: Date): T[] => {
  const from = now.getTime(),
    to = from + DIGEST_DAYS * DAY_MS;
  return events
    .filter((e) => e.start.getTime() >= from && e.start.getTime() < to)
    .sort((a, b) => a.start.getTime() - b.start.getTime());
};

/* Where "posts since the last digest" starts: the previous run, or a week back before the first one. */
export const digestSince = (lastRanAt: string | null | undefined, now: Date): Date => {
  const last = lastRanAt ? new Date(lastRanAt) : null;
  return last && !Number.isNaN(last.getTime()) ? last : new Date(now.getTime() - 7 * DAY_MS);
};

/* Posts published after `since` and not after now, newest first. */
export const postsSince = <T extends Pick<PostSummary, 'date'>>(posts: T[], since: Date, now: Date): T[] =>
  posts
    .filter((p) => p.date.getTime() > since.getTime() && p.date.getTime() <= now.getTime())
    .sort((a, b) => b.date.getTime() - a.date.getTime());

/* The Sunday that starts the Riyadh week `now` falls in (the Saudi week runs Sunday to Saturday), as
 * YYYY-MM-DD. It is the primary key of digest_runs, so one week gets one digest. */
export const digestWeek = (now: Date): string => {
  const local = new Date(now.getTime() + RIYADH_OFFSET_MS); // Riyadh wall clock, read with the UTC getters
  const sunday = Date.UTC(local.getUTCFullYear(), local.getUTCMonth(), local.getUTCDate() - local.getUTCDay());
  return new Date(sunday).toISOString().slice(0, 10);
};

/* The unsubscribe link's token: an HMAC of the member's id, so the link works without signing in and
 * cannot be made for anyone else. It never expires; rotating the secret invalidates every old link. */
export const unsubscribeToken = (userId: string, secret: string) => hmac(secret, `digest-unsubscribe:${userId}`);
export async function verifyUnsubscribe(userId: string, token: string, secret: string): Promise<boolean> {
  if (!userId || !token || !secret) return false;
  return sameSecret(token, await unsubscribeToken(userId, secret));
}
