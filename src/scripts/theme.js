/* Theme engine and reveal-on-scroll.
 * Each [data-bg] section paints itself; --t on the root follows whichever section sits under the
 * header bar, so the header and every token mix the right colours. Elements with .reveal fade in
 * the first time they scroll into view. */
import { onPage, listen, bag } from './page.js';

onPage(() => {
  const off = bag();
  const root = document.documentElement;
  root.classList.add('js');

  const stops = [...document.querySelectorAll('[data-bg]')];
  const hex = (h) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));
  const lum = ([r, g, b]) => { const f = (c) => { c /= 255; return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4); }; return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b); };
  const paint = () => {
    if (!stops.length) return;
    const y = window.scrollY + 36;
    let cur = stops[0];
    for (const el of stops) if (el.getBoundingClientRect().top + window.scrollY <= y) cur = el;
    root.style.setProperty('--bg-live', cur.dataset.bg);
    root.style.setProperty('--t', lum(hex(cur.dataset.bg)) < 0.5 ? '1' : '0');
  };
  paint();
  off.add(listen(window, 'scroll', paint, { passive: true }));
  off.add(listen(window, 'resize', paint));

  const io = new IntersectionObserver((entries) => {
    for (const e of entries) if (e.isIntersecting) { e.target.classList.add('is-visible'); io.unobserve(e.target); }
  }, { threshold: 0.12 });
  document.querySelectorAll('.reveal').forEach((el) => io.observe(el));

  return () => { off.flush(); io.disconnect(); };
});
