import assert from 'node:assert/strict';
import { test } from 'node:test';
import {
  DIGEST_DAYS,
  digestSince,
  digestWeek,
  postsSince,
  unsubscribeToken,
  upcomingFor,
  verifyUnsubscribe,
} from '../src/lib/digest.ts';
import { sameSecret } from '../src/lib/secret.ts';

const DAY = 86_400_000;
const now = new Date('2026-10-24T18:00:00.000Z'); // Saturday 21:00 in Riyadh, when the cron runs
const at = (offsetMs: number) => new Date(now.getTime() + offsetMs);

test('events: only those starting in the next 14 days, soonest first', () => {
  const events = [
    { slug: 'later', start: at(10 * DAY) },
    { slug: 'started', start: at(-2 * 3_600_000) },
    { slug: 'soon', start: at(3_600_000) },
    { slug: 'edge', start: at(DIGEST_DAYS * DAY) },
    { slug: 'just-in', start: at(DIGEST_DAYS * DAY - 1) },
  ];
  assert.deepEqual(
    upcomingFor(events, now).map((e) => e.slug),
    ['soon', 'later', 'just-in'],
  );
});

test('posts: published after the last digest and not in the future, newest first', () => {
  const since = at(-7 * DAY);
  const posts = [
    { slug: 'old', date: at(-8 * DAY) },
    { slug: 'on-the-line', date: since },
    { slug: 'monday', date: at(-5 * DAY) },
    { slug: 'friday', date: at(-1 * DAY) },
    { slug: 'scheduled', date: at(DAY) },
  ];
  assert.deepEqual(
    postsSince(posts, since, now).map((p) => p.slug),
    ['friday', 'monday'],
  );
});

test('posts since: the previous run, or a week back before the first one', () => {
  assert.equal(digestSince('2026-10-17T18:05:00.000Z', now).toISOString(), '2026-10-17T18:05:00.000Z');
  assert.equal(digestSince(null, now).toISOString(), '2026-10-17T18:00:00.000Z');
  assert.equal(digestSince('not a date', now).toISOString(), '2026-10-17T18:00:00.000Z');
});

test('week key: the Sunday that starts the Riyadh week', () => {
  assert.equal(digestWeek(now), '2026-10-18');
  // A cron that slips past midnight in Riyadh belongs to the next week.
  assert.equal(digestWeek(new Date('2026-10-24T21:30:00.000Z')), '2026-10-25');
  // Across a month end: Saturday 31 October, 23:00 in Riyadh.
  assert.equal(digestWeek(new Date('2026-10-31T20:00:00.000Z')), '2026-10-25');
  assert.equal(digestWeek(new Date('2026-11-01T06:00:00.000Z')), '2026-11-01');
});

test('unsubscribe token: works for its own member only', async () => {
  const secret = 'test-secret';
  const alice = '11111111-1111-4111-8111-111111111111';
  const bob = '22222222-2222-4222-8222-222222222222';
  const token = await unsubscribeToken(alice, secret);
  assert.match(token, /^[A-Za-z0-9_-]{43}$/);
  assert.equal(await unsubscribeToken(alice, secret), token);
  assert.equal(await verifyUnsubscribe(alice, token, secret), true);
  assert.equal(await verifyUnsubscribe(bob, token, secret), false);
  assert.equal(await verifyUnsubscribe(alice, token.slice(0, -1) + (token.endsWith('A') ? 'B' : 'A'), secret), false);
  assert.equal(await verifyUnsubscribe(alice, token, 'another-secret'), false);
  assert.equal(await verifyUnsubscribe(alice, token, ''), false);
  assert.equal(await verifyUnsubscribe(alice, '', secret), false);
});

test('sameSecret compares content and length', () => {
  assert.equal(sameSecret('Bearer abc', 'Bearer abc'), true);
  assert.equal(sameSecret('Bearer abd', 'Bearer abc'), false);
  assert.equal(sameSecret('Bearer abc', 'Bearer abcd'), false);
  assert.equal(sameSecret('', 'x'), false);
});
