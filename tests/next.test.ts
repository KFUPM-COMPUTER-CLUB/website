import assert from 'node:assert/strict';
import { test } from 'node:test';
import { safeNext } from '../src/lib/next.ts';

test('next: paths that normalize to //host fall back (#135)', () => {
  for (const v of ['/.//evil.com', '/..//evil.com', '/x/..//evil.com', '//evil.com', '/\\evil.com', '/./\\evil.com'])
    assert.equal(safeNext(v, '/me'), '/me', v);
});

test('next: other sites and non-paths fall back', () => {
  for (const v of ['https://evil.com', 'evil.com', 'javascript:alert(1)', '', null, undefined, 42])
    assert.equal(safeNext(v, '/me'), '/me', String(v));
});

test('next: same-site paths pass with their query and hash', () => {
  assert.equal(safeNext('/me/registrations'), '/me/registrations');
  assert.equal(safeNext('/admin/events?ok=1#top'), '/admin/events?ok=1#top');
  assert.equal(safeNext('/blog/../faq'), '/faq');
  assert.equal(safeNext('/ar/faq', '/x'), '/ar/faq');
});
