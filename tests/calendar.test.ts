import assert from 'node:assert/strict';
import { test } from 'node:test';
import { calendarLinksHtml, googleUrl, ics, outlookUrl } from '../src/lib/calendar.ts';
import type { EventItem } from '../src/lib/types.ts';

const event = (overrides: Partial<EventItem> = {}): EventItem => ({
  id: 'club-event',
  slug: 'club-event',
  title: 'Club meetup',
  type: 'workshop',
  start: new Date('2026-10-22T21:00:00.000Z'),
  end: null,
  allDay: true,
  location: 'Dhahran',
  summary: '',
  coverKey: null,
  cover: null,
  xUrl: null,
  registerUrl: null,
  capacity: null,
  registrationOpen: false,
  featured: false,
  published: true,
  ...overrides,
});

test('single-day all-day event ends on the following date', () => {
  const singleDay = event();

  assert.match(ics([singleDay]), /^DTSTART;VALUE=DATE:20261023\r?$/m);
  assert.match(ics([singleDay]), /^DTEND;VALUE=DATE:20261024\r?$/m);
  assert.equal(new URL(googleUrl(singleDay)).searchParams.get('dates'), '20261023/20261024');
});

test('multi-day all-day event uses an exclusive DTEND after its last day', () => {
  const multiDay = event({ end: new Date('2026-10-24T21:00:00.000Z') });
  const calendar = ics([multiDay]);

  assert.match(calendar, /^DTSTART;VALUE=DATE:20261023\r?$/m);
  assert.match(calendar, /^DTEND;VALUE=DATE:20261026\r?$/m);
});

test('timed event links keep UTC instants and identify Riyadh time', () => {
  const timed = event({
    start: new Date('2026-10-23T15:00:00.000Z'),
    end: new Date('2026-10-23T16:30:00.000Z'),
    allDay: false,
  });
  const google = new URL(googleUrl(timed));
  const outlook = new URL(outlookUrl(timed, 'personal'));
  const calendar = ics([timed]);

  assert.equal(google.searchParams.get('dates'), '20261023T150000Z/20261023T163000Z');
  assert.equal(google.searchParams.get('ctz'), 'Asia/Riyadh');
  assert.equal(outlook.searchParams.get('startdt'), '2026-10-23T15:00:00.000Z');
  assert.equal(outlook.searchParams.get('enddt'), '2026-10-23T16:30:00.000Z');
  assert.match(calendar, /^DTSTART:20261023T150000Z\r?$/m);
  assert.match(calendar, /^DTEND:20261023T163000Z\r?$/m);
});

test('.ics titles escape semicolons, commas, and newlines', () => {
  const calendar = ics([event({ title: 'Meet; greet, then\nshare' })]);

  assert.match(calendar, /^SUMMARY:Meet\\; greet\\, then\\nshare\r?$/m);
});

test('reservation email links use the site address, not the request host', () => {
  const links = calendarLinksHtml(event(), 'https://cckfupm.vercel.app');

  for (const href of links.matchAll(/href="([^"]+)"/g)) {
    const url = new URL(href[1]);
    const wanted = url.searchParams.get('details') || url.searchParams.get('body');
    assert.ok(!url.origin.includes('preview'), `${href[1]} points at a preview host`);
    if (wanted) assert.ok(wanted.startsWith('https://cckfupm.vercel.app/'), `${href[1]} describes a different site`);
  }
  assert.match(links, /href="https:\/\/cckfupm\.vercel\.app\/api\/events\/club-event\.ics"/);
});
