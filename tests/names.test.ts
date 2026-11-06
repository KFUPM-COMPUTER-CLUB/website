import assert from 'node:assert/strict';
import { test } from 'node:test';
import { joinName, nameColumns, namePartsOf, readNameParts, splitName } from '../src/lib/names.ts';

test('names: the full name is built from the filled parts', () => {
  assert.equal(joinName({ first: 'Adib', middle: '', last: 'Alqurashi' }), 'Adib Alqurashi');
  assert.equal(
    joinName({ first: 'Mohammed', middle: 'bin Ahmed', last: 'Al Qahtani' }),
    'Mohammed bin Ahmed Al Qahtani',
  );
});

test('names: form values are trimmed, single-spaced and capped', () => {
  const p = readNameParts({ first_name: '  Adib  ', middle_name: ' ', last_name: 'Al   Qurashi', other: 'x' });
  assert.deepEqual(p, { first: 'Adib', middle: '', last: 'Al Qurashi' });
  assert.equal(readNameParts({ first_name: 'a'.repeat(60) }).first.length, 40);
  assert.deepEqual(readNameParts({}), { first: '', middle: '', last: '' });
});

test('names: first and last are required', () => {
  assert.throws(() => nameColumns({ first: '', middle: '', last: 'X' }), /first name/);
  assert.throws(() => nameColumns({ first: 'X', middle: '', last: '' }), /last name/);
  assert.deepEqual(nameColumns({ first: 'Sara', middle: '', last: 'Ali' }), {
    first_name: 'Sara',
    middle_name: null,
    last_name: 'Ali',
    name: 'Sara Ali',
  });
});

test('names: an old full name is split for the form', () => {
  assert.deepEqual(splitName('Mohammed bin Ahmed Qahtani'), {
    first: 'Mohammed',
    middle: 'bin Ahmed',
    last: 'Qahtani',
  });
  assert.deepEqual(splitName('  Plato '), { first: 'Plato', middle: '', last: '' });
  assert.deepEqual(splitName(null), { first: '', middle: '', last: '' });
  assert.deepEqual(namePartsOf({ name: 'Adib Alqurashi' }), { first: 'Adib', middle: '', last: 'Alqurashi' });
  assert.deepEqual(namePartsOf({ name: 'ignored', first_name: 'A', middle_name: null, last_name: 'B' }), {
    first: 'A',
    middle: '',
    last: 'B',
  });
});
