import assert from 'node:assert/strict';
import { test } from 'node:test';
import { cronBearerAuthorized, cronSecretRequired } from '../src/lib/secret.ts';

test('cron secret is required on production, previews and builds without the deployment marker', () => {
  assert.equal(cronSecretRequired('production', false), true);
  assert.equal(cronSecretRequired('preview', true), true);
  assert.equal(cronSecretRequired(undefined, true), true);
  assert.equal(cronSecretRequired('', true), true);
  assert.equal(cronSecretRequired('development', false), false);
  assert.equal(cronSecretRequired(undefined, false), false);
});

test('cron calls stay open without a secret in local development', () => {
  assert.equal(cronBearerAuthorized(null, '', false), true);
});

test('production refuses cron calls when the secret is missing', () => {
  assert.equal(cronBearerAuthorized(null, '', true), false);
  assert.equal(cronBearerAuthorized('Bearer anything', '', true), false);
});

test('a configured cron secret requires an exact bearer value', () => {
  assert.equal(cronBearerAuthorized('Bearer test-secret', 'test-secret', true), true);
  assert.equal(cronBearerAuthorized(null, 'test-secret', true), false);
  assert.equal(cronBearerAuthorized('Bearer wrong', 'test-secret', true), false);
  assert.equal(cronBearerAuthorized('test-secret', 'test-secret', true), false);
  assert.equal(cronBearerAuthorized('Bearer test-secret', 'test-secret', false), true);
});
