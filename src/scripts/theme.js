/* Theme engine and reveal-on-scroll.
 * Each [data-bg] section paints itself (its bg-* class sets the colours its text and cards use). --t and
 * --bg-live on the root follow whichever section sits under the header bar, so the header matches it.
 * An IntersectionObserver on a line under the header finds that section, so scrolling runs no script, and the
 * root is written only when the section changes (#127).
 * Elements with .reveal fade in the first time they come near the screen. */
import { onPage, listen, bag } from './page.js';

const hex = (h) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));
const lum = ([r, g, b]) => {
  const f = (c) => {
    c /= 255;
    return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  };
  return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b);
};

onPage(() => {
  const off = bag();
  const root = document.documentElement;
  root.classList.add('js');

  // The header line is a 1px band 36px from the top of the screen. An IntersectionObserver reports which
  // sections cross it, so the browser does the work: no scroll handler and no measuring, and the answer is
  // right on the first paint and after any layout change. The innermost section on the line wins (the first
  // screen inside <main>, a panel inside a section).
  const stops = [...document.querySelectorAll('[data-bg]')];
  const onLine = new Set();
  let current = null,
    line = null;
  const paint = () => {
    let cur = null;
    for (const el of stops) if (onLine.has(el)) cur = el;
    if (!cur || cur === current) return;
    current = cur;
    const bg = cur.dataset.bg;
    root.style.setProperty('--bg-live', bg);
    root.style.setProperty('--t', lum(hex(bg)) < 0.5 ? '1' : '0');
  };
  const watch = () => {
    line?.disconnect();
    onLine.clear();
    line = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) onLine.add(e.target);
          else onLine.delete(e.target);
        }
        paint();
      },
      { rootMargin: `-36px 0px -${Math.max(0, window.innerHeight - 37)}px 0px` },
    );
    stops.forEach((el) => line.observe(el));
  };
  watch();
  let resizeTimer = 0;
  off.add(
    listen(window, 'resize', () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(watch, 150);
    }),
  );

  const io = new IntersectionObserver(
    (entries) => {
      for (const e of entries)
        if (e.isIntersecting) {
          e.target.classList.add('is-visible');
          io.unobserve(e.target);
        }
    },
    { threshold: 0.08, rootMargin: '0px 0px -6% 0px' },
  );
  document.querySelectorAll('.reveal').forEach((el) => io.observe(el));

  return () => {
    off.flush();
    clearTimeout(resizeTimer);
    line?.disconnect();
    io.disconnect();
  };
});
