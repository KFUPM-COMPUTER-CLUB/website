import type { APIRoute } from 'astro';
import { handle, requireUser, guardRate } from '../../../lib/api';
import { termByKey, wrappedNow } from '../../../lib/stats';
import { getStats, renderWrapped } from '../../../lib/wrapped';

export const prerender = false;
/* The signed-in member's Semester Wrapped as a 1080×1920 PNG, drawn here with sharp (src/lib/wrapped.ts),
 * no outside service. ?term=fall-2026 picks the term (default: the one /me/wrapped opens on; a future
 * term falls back to it too), ?name=1 puts the member's name on it, and ?view=1 shows it in the page
 * instead of downloading. Personal, so never cached. Drawing costs CPU, hence the rate limit. */
export const GET: APIRoute = handle(async (ctx) => {
  const user = requireUser(ctx);
  await guardRate(ctx.request, 'wrapped', 20, 600);
  const q = ctx.url.searchParams;
  const now = new Date();
  const asked = termByKey(q.get('term'));
  const term = asked && asked.start.getTime() <= now.getTime() ? asked : wrappedNow(now).term;
  const name = q.get('name') === '1' ? (ctx.locals.profile?.name || '').trim() || null : null;
  const png = await renderWrapped({ term, stats: await getStats(user.id, term), name });
  return new Response(new Uint8Array(png), {
    headers: {
      'Content-Type': 'image/png',
      'Cache-Control': 'no-store',
      ...(q.get('view') === '1' ? {} : { 'Content-Disposition': `attachment; filename="cc-wrapped-${term.key}.png"` }),
    },
  });
});
