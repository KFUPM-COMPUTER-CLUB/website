import type { APIRoute } from 'astro';
import { json, cronAuthorized } from '../../../lib/api';
import { serviceReady } from '../../../lib/env';
import { getEvents, getPosts } from '../../../lib/content';
import { queueDigest } from '../../../lib/email';

export const prerender = false;

/* The weekly digest, called by the Vercel cron in vercel.json on Saturday evening (Riyadh). It only
 * queues: the daily cron on Sunday morning sends the digests after any more urgent mail, spreading
 * them over several days when the daily budget runs out. Running it again in the same week does
 * nothing (see queueDigest in src/lib/email.ts). Guarded by CRON_SECRET like the daily cron. */
const run: APIRoute = async ({ request }) => {
  if (!cronAuthorized(request)) return json({ ok: false, error: 'Unauthorized' }, 401);
  if (!serviceReady()) return json({ ok: false, reason: 'database not configured' });
  const [events, posts] = await Promise.all([getEvents(), getPosts()]);
  return json(await queueDigest(events, posts));
};

// Vercel cron calls GET; POST is for running it by hand. The middleware skips its origin check
// for /api/cron because the secret is the guard.
export const GET = run;
export const POST = run;
