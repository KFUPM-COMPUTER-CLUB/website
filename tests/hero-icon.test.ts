import assert from 'node:assert/strict';
import { test } from 'node:test';
import { readFileSync } from 'node:fs';
import { tokenize, highlight, highlightLines } from '../src/scripts/code-tokens.js';
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

test('icon: the box marks exactly the ICON block, and follows it when lines are added', async () => {
  const { iconBlock } = await import('../src/scripts/icon-parse.js');
  const code = `// header\n${source}`;
  const lines = code.split('\n');
  const b = iconBlock(code);
  assert.match(lines[b.start], /export const ICON = \{/);
  assert.match(lines[b.start + b.lines - 1], /^\};$/);
  assert.match(b.html, /tok--prop">blue</);
  const longer = code.replace("  line: '#FFFFFF',", "  line: '#FFFFFF',\n  // a note");
  assert.equal(iconBlock(longer).lines, b.lines + 1);
  assert.deepEqual(iconBlock('nothing here'), { start: 0, lines: 0, html: '' });
});

test('tokens: one highlighted string per line, block comments split cleanly', () => {
  const src = '/* a\n * b */\nconst x = 1;\n\nx;';
  const lines = highlightLines(src);
  assert.equal(lines.length, 5);
  assert.equal(lines[0], '<span class="tok tok--com">/* a</span>');
  assert.equal(lines[1], '<span class="tok tok--com"> * b */</span>');
  assert.equal(lines[3], '');
  assert.equal(lines.join('\n').replace(/<[^>]+>/g, ''), src);
});

test('settings box: plain name/value lines read back as the icon, errors by line', async () => {
  const { settingsText, parseSettings, settingsHtml } = await import('../src/scripts/icon-parse.js');
  const text = settingsText();
  assert.match(text, /^blue {3}#2B6CED$/m);
  assert.match(text, /^black {2}#141E30$/m);
  assert.deepEqual(parseSettings(text), { settings: ICON, errors: [] });
  const edited = text
    .replace('#2B6CED', '#F97316')
    .replace('round  34', 'round: 99')
    .replace('size   240', 'size = 200,');
  const { settings, errors } = parseSettings(edited + '\npink 1\nnavy #000');
  assert.equal(settings.blue, '#F97316');
  assert.equal(settings.size, 200);
  assert.equal(settings.round, ICON.round);
  assert.equal(settings.navy, '#000');
  assert.deepEqual(
    errors.map((e) => e.line),
    [6, 8],
  );
  assert.equal(settingsHtml('a <b> 1').replace(/<span[^>]*>|<\/span>/g, ''), 'a &lt;b&gt; 1');
});
