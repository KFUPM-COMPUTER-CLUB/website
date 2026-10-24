import type { EventItem } from './types.ts';

/* Times are stored as UTC instants but entered and shown in Riyadh time. Saudi Arabia has no
 * daylight saving, so a fixed three hour offset is exact and no timezone library is needed. The
 * same rule is repeated in admin/io.ts, calendar.ts, email.ts and scripts/import-seed.mjs. */
export const RIYADH = 'Asia/Riyadh';
const riyadh = (y: number, m: number, d: number, h = 0, min = 0) => new Date(Date.UTC(y, m - 1, d, h - 3, min));
/* Time strings in the seed look like "", "14:00", "2:00 PM" or "8:00 PM – 9:30 PM"; the start is used. */
export const parseClock = (time: string): { h: number; min: number } | null => {
  const t = /(\d{1,2}):(\d{2})\s*(AM|PM)?/i.exec(time || '');
  if (!t) return null;
  let h = Number(t[1]);
  const ap = (t[3] || '').toUpperCase();
  if (ap === 'PM' && h < 12) h += 12;
  if (ap === 'AM' && h === 12) h = 0;
  return { h, min: Number(t[2]) };
};
export const parseRiyadh = (date: string, time = ''): Date => {
  const [y, m, d] = date.split('-').map(Number);
  const c = parseClock(time);
  return c ? riyadh(y, m, d, c.h, c.min) : riyadh(y, m, d);
};
export const riyadhDate = (d: Date) =>
  new Intl.DateTimeFormat('en-CA', { timeZone: RIYADH, year: 'numeric', month: '2-digit', day: '2-digit' }).format(d); // YYYY-MM-DD

/* When an event stops being upcoming. All-day events run to the end of their last Riyadh day; a timed
 * event without an end is assumed to last two hours, so it stays on the upcoming list while it is on. */
export const eventEnd = (e: EventItem) =>
  e.allDay
    ? new Date(parseRiyadh(riyadhDate(e.end ?? e.start)).valueOf() + 86_400_000 - 1)
    : (e.end ?? new Date(e.start.valueOf() + 2 * 3_600_000));
