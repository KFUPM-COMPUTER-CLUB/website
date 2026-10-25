import assert from 'node:assert/strict';
import { test } from 'node:test';
import {
  EMPTY_STATS,
  dashboardTiles,
  isEmptyTerm,
  makeTerm,
  previousTerm,
  termAt,
  termBadges,
  termByKey,
  termsSince,
  wrappedNow,
} from '../src/lib/stats.ts';

const riyadh = (s: string) => new Date(`${s}+03:00`);

test('terms start at Riyadh midnight on 1 August, 1 January and 1 June', () => {
  const fall = makeTerm('fall', 2026);
  assert.equal(fall.start.toISOString(), '2026-07-31T21:00:00.000Z');
  assert.equal(fall.end.toISOString(), '2026-12-31T21:00:00.000Z');
  assert.equal(fall.label, 'Fall 2026');
  assert.equal(makeTerm('spring', 2027).end.toISOString(), '2027-05-31T21:00:00.000Z');
  assert.equal(makeTerm('summer', 2027).end.toISOString(), '2027-07-31T21:00:00.000Z');
});

test('termAt follows the Riyadh calendar, not UTC', () => {
  assert.equal(termAt(riyadh('2026-10-24T12:00:00')).key, 'fall-2026');
  // 1 January 00:30 in Riyadh is still 31 December in UTC.
  assert.equal(termAt(riyadh('2027-01-01T00:30:00')).key, 'spring-2027');
  assert.equal(termAt(riyadh('2027-06-15T09:00:00')).key, 'summer-2027');
  assert.equal(previousTerm(makeTerm('spring', 2027)).key, 'fall-2026');
  assert.equal(previousTerm(makeTerm('fall', 2026)).key, 'summer-2026');
});

test('termByKey reads keys back and rejects anything else', () => {
  assert.equal(termByKey('spring-2026')?.label, 'Spring 2026');
  assert.equal(termByKey('winter-2026'), null);
  assert.equal(termByKey('fall-26'), null);
  assert.equal(termByKey(null), null);
});

test('the /me link shows in the last four weeks of a term and the two weeks after', () => {
  assert.deepEqual(pick(wrappedNow(riyadh('2026-10-24T12:00:00'))), ['fall-2026', false]);
  assert.deepEqual(pick(wrappedNow(riyadh('2026-12-03T23:59:00'))), ['fall-2026', false]);
  assert.deepEqual(pick(wrappedNow(riyadh('2026-12-04T00:00:00'))), ['fall-2026', true]);
  assert.deepEqual(pick(wrappedNow(riyadh('2026-12-31T23:00:00'))), ['fall-2026', true]);
  // After the term ends, Wrapped is about the term that just ended, for two weeks.
  assert.deepEqual(pick(wrappedNow(riyadh('2027-01-10T12:00:00'))), ['fall-2026', true]);
  assert.deepEqual(pick(wrappedNow(riyadh('2027-01-15T00:00:00'))), ['spring-2027', false]);
});
const pick = (w: { term: { key: string }; linked: boolean }) => [w.term.key, w.linked];

test('terms since joining, newest first', () => {
  assert.deepEqual(
    termsSince(riyadh('2026-02-10T10:00:00'), riyadh('2026-10-24T12:00:00')).map((t) => t.key),
    ['fall-2026', 'summer-2026', 'spring-2026'],
  );
  assert.deepEqual(
    termsSince(riyadh('2026-10-01T10:00:00'), riyadh('2026-10-24T12:00:00')).map((t) => t.key),
    ['fall-2026'],
  );
});

test('badges and the empty term', () => {
  assert.deepEqual(termBadges(EMPTY_STATS), []);
  assert.equal(isEmptyTerm(EMPTY_STATS), true);
  const busy = { ...EMPTY_STATS, events: 6, posts: 1, points: 180, competitions: 50, flag: true };
  assert.deepEqual(termBadges(busy), ['Regular', 'Writer', 'Competitor', 'Flag solver', '100+ points']);
  assert.deepEqual(termBadges({ ...EMPTY_STATS, events: 2, points: 20 }), ['Attended events']);
  assert.equal(isEmptyTerm({ ...EMPTY_STATS, points: 10 }), false);
});

test('dashboard tiles: rank reads "unranked" until there are points, and labels follow the numbers', () => {
  const none = dashboardTiles({ events: 0, posts: 1, points: 0, rank: null, streak: 1 });
  assert.deepEqual(
    none.map((t) => [t.value, t.label]),
    [
      ['0', 'events attended'],
      ['1', 'post published'],
      ['0', 'points'],
      ['unranked', 'rank'],
      ['1', 'semester in a row'],
    ],
  );
  const busy = dashboardTiles({ events: 12, posts: 3, points: 1240, rank: 4, streak: 3 });
  assert.deepEqual(
    busy.map((t) => t.value),
    ['12', '3', '1,240', '#4', '3'],
  );
  assert.equal(busy[4].label, 'semesters in a row');
  assert.ok(busy.every((t) => t.hint.length > 0));
});
