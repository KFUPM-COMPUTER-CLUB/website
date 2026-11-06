import assert from 'node:assert/strict';
import { test } from 'node:test';
import { clubNumbers } from '../src/lib/home.ts';

test('club numbers: all four when they are big enough (#114)', () => {
  assert.deepEqual(
    clubNumbers({ members: 240, events: 22, posts: 9, workshops: 3 }).map((n) => n.key),
    ['members', 'events', 'posts', 'workshops'],
  );
});
test('club numbers: small ones hide, and fewer than three hide the row', () => {
  assert.deepEqual(
    clubNumbers({ members: 29, events: 22, posts: 6, workshops: 1 }).map((n) => n.key),
    ['events', 'posts', 'workshops'],
  );
  assert.deepEqual(clubNumbers({ members: 3, events: 22, posts: 5, workshops: 1 }), []);
  assert.deepEqual(clubNumbers({ members: null, events: 22, posts: 3, workshops: 1 }), []);
  assert.deepEqual(clubNumbers({ members: 30, events: 0, posts: 6, workshops: 0 }), []);
});
