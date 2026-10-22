/* Calendar links for events. Events carry UTC instants (entered in Asia/Riyadh); all-day events
 * use date-only values so calendars do not shift them. */
import type { EventItem } from './types';
import { eventEnd, riyadhDate } from './content';

const stamp = (d: Date) => d.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');
const dateOnly = (d: Date) => riyadhDate(d).replace(/-/g, '');
const nextDay = (d: Date) => { const [y, m, day] = riyadhDate(d).split('-').map(Number); return `${y}${String(m).padStart(2, '0')}${String(day + 1).padStart(2, '0')}`; };
const endExclusive = (e: EventItem) => { const end = eventEnd(e); const [y, m, d] = riyadhDate(end).split('-').map(Number); const n = new Date(Date.UTC(y, m - 1, d + 1)); return `${n.getUTCFullYear()}${String(n.getUTCMonth() + 1).padStart(2, '0')}${String(n.getUTCDate()).padStart(2, '0')}`; };
const details = (e: EventItem, site: string) => [e.summary, e.xUrl, `${site}/timeline#ev-${e.slug}`].filter(Boolean).join('\n');

export function googleUrl(e: EventItem, site = '') {
  const q = new URLSearchParams({ action: 'TEMPLATE', text: e.title, dates: e.allDay ? `${dateOnly(e.start)}/${endExclusive(e)}` : `${stamp(e.start)}/${stamp(eventEnd(e))}`, details: details(e, site), location: e.location, ctz: 'Asia/Riyadh' });
  return `https://calendar.google.com/calendar/render?${q}`;
}
/* kind: "work" for KFUPM and other Microsoft 365 accounts, "personal" for outlook.com accounts. */
export function outlookUrl(e: EventItem, kind: 'work' | 'personal', site = '') {
  const q = new URLSearchParams({ path: '/calendar/action/compose', rru: 'addevent', subject: e.title, startdt: e.start.toISOString(), enddt: eventEnd(e).toISOString(), body: details(e, site), location: e.location });
  if (e.allDay) q.set('allday', 'true');
  return `https://${kind === 'work' ? 'outlook.office.com' : 'outlook.live.com'}/calendar/0/deeplink/compose?${q}`;
}
const esc = (s: string | null | undefined) => String(s ?? '').replace(/\\/g, '\\\\').replace(/;/g, '\\;').replace(/,/g, '\\,').replace(/\n/g, '\\n');
export function vevent(e: EventItem, site = '') {
  return ['BEGIN:VEVENT', `UID:${e.slug}@cckfupm`, `DTSTAMP:${stamp(new Date())}`,
    e.allDay ? `DTSTART;VALUE=DATE:${dateOnly(e.start)}` : `DTSTART:${stamp(e.start)}`,
    e.allDay ? `DTEND;VALUE=DATE:${endExclusive(e)}` : `DTEND:${stamp(eventEnd(e))}`,
    `SUMMARY:${esc(e.title)}`, `DESCRIPTION:${esc(details(e, site))}`, `LOCATION:${esc(e.location)}`, e.xUrl ? `URL:${e.xUrl}` : null, 'END:VEVENT'].filter(Boolean).join('\r\n');
}
export function ics(events: EventItem[], site = '') {
  return ['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//KFUPM Computer Club//Events//EN', 'CALSCALE:GREGORIAN', 'METHOD:PUBLISH', 'X-WR-CALNAME:KFUPM Computer Club', 'X-WR-TIMEZONE:Asia/Riyadh', ...events.map((e) => vevent(e, site)), 'END:VCALENDAR'].join('\r\n') + '\r\n';
}
