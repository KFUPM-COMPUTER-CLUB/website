// Calendar links for events. Times are read as Asia/Riyadh (UTC+3) and written in UTC.
const TZ = 3;
const RANGE = /(\d{1,2}):(\d{2})\s*(AM|PM)\s*[\u2013\u2014-]\s*(\d{1,2}):(\d{2})\s*(AM|PM)/i;
const hour = (h, ap) => (Number(h) % 12) + (/pm/i.test(ap) ? 12 : 0);

export function range(ev) {
  const d = ev.date, y = d.getUTCFullYear(), m = d.getUTCMonth(), day = d.getUTCDate();
  const t = RANGE.exec(ev.time || '');
  if (!t) return { allDay: true, start: new Date(Date.UTC(y, m, day)), end: new Date(Date.UTC(y, m, day + 1)) };
  return { allDay: false, start: new Date(Date.UTC(y, m, day, hour(t[1], t[3]) - TZ, Number(t[2]))), end: new Date(Date.UTC(y, m, day, hour(t[4], t[6]) - TZ, Number(t[5]))) };
}
const stamp = (d) => d.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');
const dateOnly = (d) => d.toISOString().slice(0, 10).replace(/-/g, '');

export function googleUrl(ev) {
  const r = range(ev);
  const q = new URLSearchParams({ action: 'TEMPLATE', text: ev.title, dates: r.allDay ? `${dateOnly(r.start)}/${dateOnly(r.end)}` : `${stamp(r.start)}/${stamp(r.end)}`, details: ev.url ? `${ev.summary}\n${ev.url}` : ev.summary, location: ev.location, ctz: 'Asia/Riyadh' });
  return `https://calendar.google.com/calendar/render?${q}`;
}
export function outlookUrl(ev) {
  const r = range(ev);
  const q = new URLSearchParams({ path: '/calendar/action/compose', rru: 'addevent', subject: ev.title, startdt: r.start.toISOString(), enddt: r.end.toISOString(), body: ev.summary, location: ev.location });
  if (r.allDay) q.set('allday', 'true');
  return `https://outlook.live.com/calendar/0/deeplink/compose?${q}`;
}
const esc = (s) => String(s ?? '').replace(/\\/g, '\\\\').replace(/;/g, '\\;').replace(/,/g, '\\,').replace(/\n/g, '\\n');
export function vevent(ev) {
  const r = range(ev);
  return ['BEGIN:VEVENT', `UID:${ev.id}@cckfupm`, `DTSTAMP:${stamp(new Date())}`,
    r.allDay ? `DTSTART;VALUE=DATE:${dateOnly(r.start)}` : `DTSTART:${stamp(r.start)}`,
    r.allDay ? `DTEND;VALUE=DATE:${dateOnly(r.end)}` : `DTEND:${stamp(r.end)}`,
    `SUMMARY:${esc(ev.title)}`, `DESCRIPTION:${esc(ev.summary)}`, `LOCATION:${esc(ev.location)}`, ev.url ? `URL:${ev.url}` : null, 'END:VEVENT'].filter(Boolean).join('\r\n');
}
export function ics(events) {
  return ['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//KFUPM Computer Club//Events//EN', 'CALSCALE:GREGORIAN', 'X-WR-CALNAME:KFUPM Computer Club', 'X-WR-TIMEZONE:Asia/Riyadh', ...events.map(vevent), 'END:VCALENDAR'].join('\r\n') + '\r\n';
}
export const icsHref = (events) => `data:text/calendar;charset=utf-8,${encodeURIComponent(ics(events))}`;
export const plain = (e) => ({ id: e.id, ...e.data, url: e.data.registerUrl && !e.data.registerUrl.includes('REPLACE') ? e.data.registerUrl : undefined });
