import assert from 'node:assert/strict';
import { test } from 'node:test';
import { hasResults, wholeNumber } from '../src/lib/types.ts';

test('whole numbers drop commas and spaces and read Arabic digits', () => {
  assert.equal(wholeNumber('5000'), 5000);
  assert.equal(wholeNumber('5,000'), 5000);
  assert.equal(wholeNumber(' 10 000 '), 10000);
  assert.equal(wholeNumber('٥٠٠٠'), 5000);
  assert.equal(wholeNumber('٥٬٠٠٠'), 5000);
  assert.equal(wholeNumber('۱۲۳'), 123);
  assert.equal(wholeNumber('0'), 0);
  assert.equal(wholeNumber(75), 75);
});

test('an empty value is null, so it means no prize', () => {
  assert.equal(wholeNumber(''), null);
  assert.equal(wholeNumber('  '), null);
  assert.equal(wholeNumber(undefined), null);
});

test('anything that is not only digits is refused, not cut short', () => {
  for (const v of ['5k', '1.5', 'SAR 5000', '5000 SAR', '-3', '1e3', '٥٫٥', 1.5]) {
    assert.ok(Number.isNaN(wholeNumber(v)), `${v} should be refused`);
  }
});

test('only competitions and hackathons have results', () => {
  assert.ok(hasResults('Competition'));
  assert.ok(hasResults('Hackathon'));
  for (const type of ['Workshop', 'Talk', 'Social', 'Trip', 'Exhibition', 'Other']) assert.ok(!hasResults(type));
});
