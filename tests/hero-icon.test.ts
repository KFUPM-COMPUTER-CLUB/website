import assert from 'node:assert/strict';
import { test } from 'node:test';
import { readFileSync } from 'node:fs';
import { tokenize, highlight } from '../src/scripts/code-tokens.js';
import { ICON, iconSvg } from '../src/scripts/hero-icon.js';
import { parseIcon } from '../src/scripts/icon-parse.js';

const source = readFileSync(new URL('../src/scripts/hero-icon.js', import.meta.url), 'utf8');

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
  assert.equal(highlight('a < b'), 'a &lt; b');
});

test('icon: the file on the first screen reads back as the icon it draws (#152)', () => {
  const { settings, errors } = parseIcon(source);
  assert.deepEqual(errors, []);
  assert.deepEqual(settings, ICON);
});

test('icon: editing blue recolours the icon; broken lines are reported, the rest applies', () => {
  const edited = source
    .replace("blue: '#2B6CED'", "blue: '#0EA5E9'")
    .replace('size: 240', 'size: big')
    .replace('gap: 0', 'gap: 30');
  const { settings, errors } = parseIcon(edited);
  assert.equal(settings.blue, '#0EA5E9');
  assert.equal(settings.gap, 30);
  assert.equal(settings.size, ICON.size);
  assert.equal(errors.length, 1);
  assert.equal(errors[0].key, 'size');
  assert.match(errors[0].message, /size is a number/);
  const svg = iconSvg(settings);
  assert.match(svg, /fill="#0EA5E9"/);
  assert.match(svg, /viewBox="-15 0 690 355"/);
});

test('icon: limits, unknown keys, quotes; the drawing code below the block is left alone', () => {
  const block = [
    'export const ICON = {',
    '  size: 999,',
    '  wings: 2,',
    '  blue: #fff,',
    "  navy: 'nope',",
    '};',
    'const x = { size: 1 };',
  ];
  assert.deepEqual(
    parseIcon(block.join('\n')).errors.map((e) => e.line),
    [2, 3, 4, 5],
  );
});
