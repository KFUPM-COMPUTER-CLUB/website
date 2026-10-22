import type { APIRoute } from 'astro';
import { getEvent } from '../../../lib/content';
import { ics } from '../../../lib/calendar';
/* One event as a downloadable .ics file. */
export const GET: APIRoute = async ({ params, site }) => {
  const e = await getEvent(params.slug || '');
  if (!e) return new Response('Not found', { status: 404 });
  return new Response(ics([e], site?.origin || ''), { headers: { 'Content-Type': 'text/calendar; charset=utf-8', 'Content-Disposition': `attachment; filename="${e.slug}.ics"`, 'Cache-Control': 'public, max-age=300' } });
};
