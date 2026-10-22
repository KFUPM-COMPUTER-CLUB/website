import type { APIRoute } from 'astro';
import { json } from '../../../lib/api';
import { cronSecret, serviceReady } from '../../../lib/env';
import { pingKeepAlive, sendPending, quota } from '../../../lib/email';

export const prerender = false;

/* Daily maintenance, called by the Vercel cron in vercel.json (once a day). It keeps the free
 * Supabase project awake and sends the email queue within today's budget. Vercel sends
 * "Authorization: Bearer <CRON_SECRET>"; when the secret is set, nothing else gets through. */
const sameSecret = (given: string, want: string) => {
  const a = new TextEncoder().encode(given),
    b = new TextEncoder().encode(want);
  let diff = a.length ^ b.length; // constant time over the longer input, so length is not leaked by timing
  for (let i = 0; i < Math.max(a.length, b.length); i++) diff |= (a[i] ?? 0) ^ (b[i] ?? 0);
  return diff === 0;
};
const authorized = (request: Request) =>
  !cronSecret || sameSecret(request.headers.get('authorization') || '', `Bearer ${cronSecret}`);

const run: APIRoute = async ({ request }) => {
  if (!authorized(request)) return json({ ok: false, error: 'Unauthorized' }, 401);
  if (!serviceReady()) return json({ ok: false, reason: 'database not configured' });
  const keepalive = await pingKeepAlive();
  // 80 of the 90-a-day budget: the rest stays free for emails sent straight away during the day.
  const r = await sendPending(80);
  return json({ ok: true, keepalive, ...r, quota: await quota() });
};

// Vercel cron calls GET; POST is for running it by hand. The middleware skips its origin check
// for /api/cron because the secret is the guard.
export const GET = run;
export const POST = run;
