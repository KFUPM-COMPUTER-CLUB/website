/* Reads the ICON block of hero-icon.js as edited on the first screen (#152). The code is never run: each
 * `key: value` line inside `ICON = { ... }` is read on its own and checked against RULES, and a line that
 * breaks a rule is reported by its number while every other line still applies (and the page keeps that
 * setting's last good value). Lines outside the block are the drawing code and are left alone. Plain
 * JavaScript with no imports from the page, so tests/hero-icon.test.ts runs it under node. */
import { ICON, RULES } from './hero-icon.js';

const strip = (line) => {
  let q = '';
  for (let i = 0; i < line.length; i++) {
    const c = line[i];
    if (q) {
      if (c === '\\') i++;
      else if (c === q) q = '';
    } else if (c === '"' || c === "'" || c === '`') q = c;
    else if (c === '/' && line[i + 1] === '/') return line.slice(0, i);
  }
  return line;
};
const unquote = (v) => /^(['"`])(.*)\1$/.exec(v)?.[2] ?? null;
const hex = (v) => /^#([0-9a-f]{3}|[0-9a-f]{6})$/i.test(v);

/* { settings, errors }: settings start from ICON; errors are { line, key?, message }, lines 1-based. */
export function parseIcon(code, isColor = hex) {
  const settings = { ...ICON };
  const errors = [];
  let inside = false;
  String(code ?? '')
    .split('\n')
    .forEach((raw, idx) => {
      const line = idx + 1;
      const body = strip(raw).trim();
      if (!inside) {
        if (/^(export\s+)?(const|let|var)\s+ICON\s*=\s*\{\s*$/.test(body)) inside = true;
        return;
      }
      if (/^\}\s*;?$/.test(body)) {
        inside = false;
        return;
      }
      if (!body) return;
      const m = /^([A-Za-z_$][\w$]*)\s*:\s*(.+?)\s*,?$/.exec(body);
      if (!m) return errors.push({ line, message: 'expected key: value' });
      const [, key, value] = m;
      const rule = RULES[key];
      const fail = (message) => errors.push({ line, key, message });
      if (!rule) return errors.push({ line, message: `${key} is not an icon setting` });
      if (rule === 'color') {
        const s = unquote(value);
        if (s === null) return fail(`${key} needs quotes, like '#2B6CED'`);
        if (!isColor(s)) return fail(`${s} is not a colour`);
        settings[key] = s;
        return;
      }
      const [lo, hi] = rule;
      if (!/^-?\d+(\.\d+)?$/.test(value)) return fail(`${key} is a number`);
      const x = Number(value);
      if (x < lo || x > hi) return fail(`${key} goes from ${lo} to ${hi}`);
      settings[key] = x;
    });
  return { settings, errors };
}
