import { getCollection } from 'astro:content';
import { ics, plain } from '../lib/calendar.js';

// /calendar.ics: every upcoming event, for Google Calendar, Outlook, or Apple Calendar.
export async function GET() {
  const today = new Date(); today.setUTCHours(0, 0, 0, 0);
  const events = (await getCollection('events')).filter((e) => e.data.date.valueOf() >= today.valueOf()).sort((a, b) => a.data.date.valueOf() - b.data.date.valueOf());
  return new Response(ics(events.map(plain)), { headers: { 'Content-Type': 'text/calendar; charset=utf-8' } });
}
