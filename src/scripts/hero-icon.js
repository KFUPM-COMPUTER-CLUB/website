/* The club icon, drawn from code (#152): two brackets, < and >, each navy above a blue wave, with a
 * white circuit line. The first screen shows this very file as its background, faint, and the ICON
 * settings below can be edited right there: the icon redraws, and its blue colours "build the future".
 * Plain JavaScript with no imports: Astro renders it on the server, the page redraws it in the browser,
 * and tests/hero-icon.test.ts runs it under node. Colours are the logo's own (src/data/brand). */

// Edit a value below: the icon and the headline change with it.
export const ICON = {
  blue: '#2B6CED',
  navy: '#141E30',
  line: '#FFFFFF',
  size: 240,
  gap: 0,
  round: 34,
  rotate: 0,
};
// psst. curious minds start in the console (F12).
export const W = 660,
  H = 355;

/* One bracket, the < : a thick chevron with every corner rounded by r. */
const CHEVRON = [
  [95, 0],
  [320, 0],
  [205, 177],
  [320, 355],
  [95, 355],
  [0, 177],
];
export function roundedPath(points, r) {
  const n = points.length;
  const at = (a, b, d) => {
    const len = Math.hypot(b[0] - a[0], b[1] - a[1]) || 1;
    const k = Math.min(d, len / 2) / len;
    return [a[0] + (b[0] - a[0]) * k, a[1] + (b[1] - a[1]) * k];
  };
  const f = (p) => `${p[0].toFixed(1)} ${p[1].toFixed(1)}`;
  let d = '';
  for (let i = 0; i < n; i++) {
    const prev = points[(i - 1 + n) % n],
      cur = points[i],
      next = points[(i + 1) % n];
    const a = at(cur, prev, r),
      b = at(cur, next, r);
    d += `${i ? 'L' : 'M'}${f(a)} Q${f(cur)} ${f(b)} `;
  }
  return `${d}Z`;
}

/* The SVG for a set of icon settings (missing ones fall back to ICON). */
export function iconSvg(settings = {}) {
  const s = { ...ICON, ...settings };
  const shape = roundedPath(CHEVRON, s.round);
  const wave = 'M0 190 C40 140 90 118 132 128 C186 142 262 262 336 360 L0 360 Z';
  const half = (id, dx, flip) =>
    `<g transform="translate(${dx} 0)${flip ? ` rotate(180 ${W / 2} ${H / 2})` : ''}">` +
    `<clipPath id="${id}"><path d="${shape}"/></clipPath>` +
    `<path d="${shape}" fill="${s.navy}"/>` +
    `<path d="${wave}" fill="${s.blue}" clip-path="url(#${id})"/>` +
    `<path d="M118 88 L210 166" stroke="${s.line}" stroke-width="11" stroke-linecap="round"/>` +
    `<circle cx="118" cy="88" r="15" fill="${s.line}"/></g>`;
  const g = s.gap / 2;
  return (
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${-g} 0 ${W + s.gap} ${H}" width="${s.size}" ` +
    `style="transform: rotate(${s.rotate}deg)" aria-hidden="true">` +
    `${half('cc-left', -g, false)}${half('cc-right', g, true)}</svg>`
  );
}

/* Which values the ICON block may take, for the page's live editing (icon-parse.js). */
export const RULES = {
  blue: 'color',
  navy: 'color',
  line: 'color',
  size: [140, 360],
  gap: [-10, 80],
  round: [0, 60],
  rotate: [-30, 30],
};
