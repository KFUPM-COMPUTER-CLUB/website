import type { APIRoute } from 'astro';
import { json, cronAuthorized } from '../../../lib/api';
import { serviceReady } from '../../../lib/env';
import { pingKeepAlive, sendPending, quota } from '../../../lib/email';

export const prerender = false;

/* Daily maintenance, called by the Vercel cron in vercel.json (once a day). It keeps the free
 * Supabase project awake and sends the email queue within today's budget, which is also how the
 * weekly digest goes out. Guarded by CRON_SECRET (cronAuthorized in src/lib/api.ts). */
const run: APIRoute = async ({ request }) => {
  if (!cronAuthorized(request)) return json({ ok: false, error: 'Unauthorized' }, 401);
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
