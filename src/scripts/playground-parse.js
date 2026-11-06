/* Reads the playground snippet on the home page (#152) into the sticker's settings. The snippet is never
 * run: each `key: value` line inside the object is read on its own, checked against the rules below, and
 * a line that breaks a rule is reported with its number while every other line still applies. So a typo
 * shows what went wrong instead of blanking the sticker. Plain JavaScript with no imports, so
 * tests/playground.test.ts runs it under node; scripts/playground.js passes the browser's colour check. */

export const DEFAULTS = {
  text: 'CC',
  color: '#2563EB',
  size: 160,
  shape: 'square',
  rotate: -6,
  shadow: true,
  spin: false,
};
export const SHAPES = ['square', 'circle', 'diamond', 'blob'];
export const LIMITS = { size: [40, 240], rotate: [-180, 180], text: 6 };

export const DEFAULT_CODE = `// Edit a value: the sticker,
// and the headline, follow.
const sticker = {
  text: 'CC',
  color: '#2563EB',
  size: 160,
  shape: 'square', // square, circle, diamond, blob
  rotate: -6,
  shadow: true,
  spin: false,
};`;

const strip = (line) => {
  // Drop a trailing // comment that is not inside quotes.
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
const unquote = (v) => {
  const m = /^(['"`])(.*)\1$/.exec(v);
  return m ? m[2] : null;
};

/* { settings, errors }. settings starts from DEFAULTS; errors are { line, message } with 1-based lines,
 * plus the setting's key when the line named one (so the page can keep that setting's last good value).
 * isColor(value) decides what counts as a colour (the browser's CSS.supports in the page). */
export function parsePlayground(code, isColor = (v) => /^#([0-9a-f]{3}|[0-9a-f]{6})$/i.test(v)) {
  const settings = { ...DEFAULTS };
  const errors = [];
  const seen = new Set();
  const lines = String(code ?? '').split('\n');
  lines.forEach((raw, idx) => {
    const line = idx + 1;
    const body = strip(raw).trim();
    if (!body || body.startsWith('/*') || body.startsWith('*')) return;
    if (/^(const|let|var)\s+\w+\s*=\s*\{\s*$/.test(body) || /^\}\s*;?$/.test(body)) return;
    const m = /^([A-Za-z_$][\w$]*)\s*:\s*(.+?)\s*,?$/.exec(body);
    if (!m) return errors.push({ line, message: 'expected key: value' });
    const [, key, value] = m;
    if (!(key in DEFAULTS)) return errors.push({ line, message: `${key} is not a sticker setting` });
    const fail = (message) => errors.push({ line, key, message });
    if (seen.has(key)) errors.push({ line, message: `${key} is set twice; the last one wins` });
    seen.add(key);
    switch (key) {
      case 'text': {
        const s = unquote(value);
        if (s === null) return fail("text needs quotes, like 'CC'");
        if ([...s].length > LIMITS.text) return fail(`text is ${LIMITS.text} characters at most`);
        settings.text = s;
        break;
      }
      case 'color': {
        const s = unquote(value);
        if (s === null) return fail("color needs quotes, like '#2563EB'");
        if (!isColor(s)) return fail(`${s} is not a colour`);
        settings.color = s;
        break;
      }
      case 'shape': {
        const s = unquote(value);
        if (s === null || !SHAPES.includes(s)) return fail(`shape is one of ${SHAPES.join(', ')}`);
        settings.shape = s;
        break;
      }
      case 'size':
      case 'rotate': {
        const x = Number(value);
        const [lo, hi] = LIMITS[key];
        if (!/^-?\d+(\.\d+)?$/.test(value)) return fail(`${key} is a number`);
        if (x < lo || x > hi) return fail(`${key} goes from ${lo} to ${hi}`);
        settings[key] = x;
        break;
      }
      case 'shadow':
      case 'spin':
        if (value !== 'true' && value !== 'false') return fail(`${key} is true or false`);
        settings[key] = value === 'true';
        break;
    }
  });
  return { settings, errors };
}

/* Black or white text, whichever reads better on the sticker's colour (hex only; others keep white). */
export function inkFor(color) {
  const m = /^#([0-9a-f]{3}|[0-9a-f]{6})$/i.exec(color || '');
  if (!m) return '#FFFFFF';
  const h = m[1].length === 3 ? [...m[1]].map((c) => c + c).join('') : m[1];
  const [r, g, b] = [0, 2, 4].map((i) => parseInt(h.slice(i, i + 2), 16) / 255);
  const lin = (c) => (c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4);
  const L = 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b);
  return L > 0.4 ? '#0B0B0F' : '#FFFFFF';
}

/* The snippet with one key's value replaced (for the preset buttons), keeping the rest as the member typed it. */
export function setValue(code, key, literal) {
  const re = new RegExp(`^(\\s*${key}\\s*:\\s*)([^,\\n]*?)(\\s*,?\\s*(?://.*)?)$`, 'm');
  if (re.test(code)) return code.replace(re, (_, a, _b, c) => `${a}${literal}${c}`);
  return code.replace(/\n\};?\s*$/, `\n  ${key}: ${literal},\n};`);
}
