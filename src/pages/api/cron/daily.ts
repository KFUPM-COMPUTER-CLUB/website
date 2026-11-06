import type { APIRoute } from 'astro';
import { json, cronAuthorized } from '../../../lib/api';
import { serviceReady } from '../../../lib/env';
import { pingKeepAlive, sendPending, quota, purgeSent } from '../../../lib/email';

export const prerender = false;

/* Daily maintenance, called by the Vercel cron in vercel.json (once a day). It keeps the free
 * Supabase project awake, sends the email queue within today's budget (which is also how the weekly
 * digest goes out) and deletes sent mail older than 90 days. Guarded by CRON_SECRET (cronAuthorized in src/lib/api.ts). */
const run: APIRoute = async ({ request }) => {
  if (!cronAuthorized(request)) return json({ ok: false, error: 'Unauthorized' }, 401);
  if (!serviceReady()) return json({ ok: false, reason: 'database not configured' });
  const keepalive = await pingKeepAlive();
  // At most 80 of the 90-a-day budget, so the rest stays free for emails sent straight away during the
  // day; digests stop earlier (DIGEST_RESERVE), and the run stops after SEND_BUDGET_MS (src/lib/digest.ts).
  const r = await sendPending(80);
  // Sent mail older than 90 days goes (purgeSent in src/lib/email.ts); `purged` is how many rows.
  const purged = await purgeSent();
  return json({ ok: true, keepalive, ...r, purged, quota: await quota() });
};

// Vercel cron calls GET; POST is for running it by hand. The middleware skips its origin check
// for /api/cron because the secret is the guard.
export const GET = run;
export const POST = run;
