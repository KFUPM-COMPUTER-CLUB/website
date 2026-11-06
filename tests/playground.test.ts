import assert from 'node:assert/strict';
import { test } from 'node:test';
import { tokenize, highlight } from '../src/scripts/code-tokens.js';
import { DEFAULT_CODE, DEFAULTS, inkFor, parsePlayground, setValue } from '../src/scripts/playground-parse.js';

test('tokens: join back into the source, with the right kinds', () => {
  const src = "const a = { size: 160, color: '#fff' }; // hi\nrun(a, true);";
  const toks = tokenize(src);
  assert.equal(toks.map(([, t]) => t).join(''), src);
  const kind = (text: string) => toks.find(([, t]) => t === text)?.[0];
  assert.equal(kind('const'), 'kw');
  assert.equal(kind('size'), 'prop');
  assert.equal(kind('160'), 'num');
  assert.equal(kind("'#fff'"), 'str');
  assert.equal(kind('// hi'), 'com');
  assert.equal(kind('run'), 'fn');
  assert.equal(kind('true'), 'lit');
});

test('tokens: highlight escapes HTML', () => {
  assert.equal(highlight('a < b'), 'a &lt; b');
  assert.match(highlight("'<script>'"), /&lt;script&gt;/);
  assert.doesNotMatch(highlight('x = "</pre>"'), /<\/pre>/);
});

test('playground: the default snippet gives the defaults with no errors', () => {
  const { settings, errors } = parsePlayground(DEFAULT_CODE);
  assert.deepEqual(errors, []);
  assert.deepEqual(settings, DEFAULTS);
});

test('playground: edits apply, bad lines are reported and the rest still applies', () => {
  const code = DEFAULT_CODE.replace("'#2563EB'", "'#0EA5E9'")
    .replace('size: 160', 'size: big')
    .replace("shape: 'square'", "shape: 'circle'")
    .replace('spin: false', 'spin: true');
  const { settings, errors } = parsePlayground(code);
  assert.equal(settings.color, '#0EA5E9');
  assert.equal(settings.shape, 'circle');
  assert.equal(settings.spin, true);
  assert.equal(settings.size, DEFAULTS.size);
  assert.equal(errors.length, 1);
  assert.equal(errors[0].line, 6);
  assert.match(errors[0].message, /size is a number/);
});

test('playground: limits, unknown keys and quotes', () => {
  const lines = [
    'const sticker = {',
    '  size: 999,',
    '  wings: 2,',
    '  text: CC,',
    "  text: 'TOOLONGX',",
    "  shape: 'hex',",
    '};',
  ];
  const { errors } = parsePlayground(lines.join('\n'));
  assert.deepEqual(
    errors.map((e) => e.line),
    [2, 3, 4, 5, 5, 6],
  );
});

test('playground: ink and preset edits', () => {
  assert.equal(inkFor('#FFFFFF'), '#0B0B0F');
  assert.equal(inkFor('#2563EB'), '#FFFFFF');
  assert.equal(inkFor('tomato'), '#FFFFFF');
  const out = setValue(DEFAULT_CODE, 'size', '220');
  assert.equal(parsePlayground(out).settings.size, 220);
  assert.match(out, /shape: 'square', \/\/ square, circle, diamond, blob/);
  assert.equal(parsePlayground(setValue(out, 'shape', "'blob'")).settings.shape, 'blob');
});
