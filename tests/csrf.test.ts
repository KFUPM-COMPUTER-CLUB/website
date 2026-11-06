import assert from 'node:assert/strict';
import { test } from 'node:test';
import { needsSameOrigin } from '../src/lib/csrf.ts';

test('csrf: API and auth mutations must come from this site', () => {
  for (const p of ['/api/me/profile', '/api/admin/members', '/api/events/x/register', '/auth/logout', '/api/digest'])
    assert.equal(needsSameOrigin(p, 'POST'), true, p);
  assert.equal(needsSameOrigin('/api/digest/unsubscribe/extra', 'POST'), true);
  assert.equal(needsSameOrigin('/api/me/profile', 'PATCH'), true);
});

test('csrf: the one-click unsubscribe and the cron routes carry their own proof (#122)', () => {
  assert.equal(needsSameOrigin('/api/digest/unsubscribe', 'POST'), false);
  assert.equal(needsSameOrigin('/api/cron/daily', 'POST'), false);
});

test('csrf: reads and pages are not checked', () => {
  assert.equal(needsSameOrigin('/api/me/profile', 'GET'), false);
  assert.equal(needsSameOrigin('/api/media/x', 'HEAD'), false);
  assert.equal(needsSameOrigin('/me/profile', 'POST'), false);
});
