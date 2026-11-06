/* A small JavaScript tokenizer for the home page's code (#152): the background made of the site's own
 * source (components/CodeBackground.astro, on the server) and the editable snippet in the playground
 * (scripts/playground.js, in the browser). One tokenizer for both, so they share the colours in
 * global.css (.tok--*), which follow GitHub's light theme. It only has to colour code well, not parse it:
 * strings, template strings, comments, numbers, keywords, literals, property names before a colon,
 * function names before a parenthesis, and everything else as plain text. Plain JavaScript with no
 * imports, so tests/playground.test.ts runs it under node. */

const KEYWORDS = new Set(
  (
    'const let var function return if else for while do switch case break continue new class extends ' +
    'import from export default async await try catch finally throw typeof instanceof in of this yield'
  ).split(' '),
);
const LITERALS = new Set(['true', 'false', 'null', 'undefined', 'NaN', 'Infinity']);

/* [type, text] pairs that join back into the input exactly. Types: com, str, num, kw, lit, prop, fn, plain. */
export function tokenize(src) {
  const out = [];
  const push = (type, text) => {
    const last = out[out.length - 1];
    if (last && last[0] === type && type === 'plain') last[1] += text;
    else out.push([type, text]);
  };
  let i = 0;
  const n = src.length;
  while (i < n) {
    const c = src[i];
    const next = src[i + 1];
    if (c === '/' && next === '/') {
      const end = src.indexOf('\n', i);
      const j = end === -1 ? n : end;
      push('com', src.slice(i, j));
      i = j;
    } else if (c === '/' && next === '*') {
      const end = src.indexOf('*/', i + 2);
      const j = end === -1 ? n : end + 2;
      push('com', src.slice(i, j));
      i = j;
    } else if (c === '"' || c === "'" || c === '`') {
      let j = i + 1;
      while (j < n && src[j] !== c) {
        if (src[j] === '\\') j++;
        else if (src[j] === '\n' && c !== '`') break; // an unclosed quote ends at the line, like an editor
        j++;
      }
      j = Math.min(n, j + 1);
      push('str', src.slice(i, j));
      i = j;
    } else if (/[0-9]/.test(c) || (c === '.' && /[0-9]/.test(next || ''))) {
      const m = /^(0[xX][0-9a-fA-F_]+|[0-9_]*\.?[0-9_]+(?:[eE][+-]?[0-9]+)?)/.exec(src.slice(i));
      const text = m ? m[0] : c;
      push('num', text);
      i += text.length;
    } else if (/[A-Za-z_$]/.test(c)) {
      const m = /^[A-Za-z0-9_$]+/.exec(src.slice(i));
      const word = m[0];
      const rest = src.slice(i + word.length);
      const prevType = out[out.length - 1]?.[0];
      const prevText = (out[out.length - 1]?.[1] || '').trimEnd();
      let type = 'plain';
      if (KEYWORDS.has(word)) type = 'kw';
      else if (LITERALS.has(word)) type = 'lit';
      else if (/^\s*\(/.test(rest)) type = 'fn';
      else if (/^\s*:(?!:)/.test(rest) && !(prevType === 'plain' && prevText.endsWith('?'))) type = 'prop';
      push(type, word);
      i += word.length;
    } else {
      push('plain', c);
      i++;
    }
  }
  return out;
}

const ESC = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' };
const esc = (s) => s.replace(/[&<>"]/g, (ch) => ESC[ch]);
/* Escaped HTML, one <span class="tok tok--…"> per coloured token. */
export const highlight = (src) =>
  tokenize(src)
    .map(([type, text]) => (type === 'plain' ? esc(text) : `<span class="tok tok--${type}">${esc(text)}</span>`))
    .join('');
