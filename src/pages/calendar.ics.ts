import type { APIRoute } from 'astro';
import { getUpcomingEvents } from '../lib/content';
import { ics } from '../lib/calendar';
/* /calendar.ics: a subscribable feed of upcoming events for Google Calendar, Outlook or Apple Calendar. */
export const GET: APIRoute = async ({ site }) => new Response(ics(await getUpcomingEvents(), site?.origin || ''), { headers: { 'Content-Type': 'text/calendar; charset=utf-8', 'Cache-Control': 'public, max-age=300' } });
