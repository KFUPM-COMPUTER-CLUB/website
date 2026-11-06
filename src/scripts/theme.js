/* Theme engine and reveal-on-scroll.
 * Each [data-bg] section paints itself (its bg-* class sets the colours its text and cards use). --t and
 * --bg-live on the root follow whichever section sits under the header bar, so the header matches it.
 * Section tops are measured on load and when a section changes size, never during a scroll; the scroll
 * handler runs at most once a frame and writes only when the section under the header changes (#127).
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

  const stops = [...document.querySelectorAll('[data-bg]')].map((el) => ({
    el,
    bg: el.dataset.bg,
    t: lum(hex(el.dataset.bg)) < 0.5 ? '1' : '0',
    top: 0,
  }));
  let current = null,
    raf = 0;
  const measure = () => {
    for (const s of stops) s.top = s.el.getBoundingClientRect().top + window.scrollY;
  };
  const paint = () => {
    raf = 0;
    if (!stops.length) return;
    const y = window.scrollY + 36;
    // The last section that starts above the header line. Near the top, before any has started (the
    // header pushes them down), it is the innermost of the first ones: the first screen, not <main>.
    let cur = null;
    for (const s of stops) if (s.top <= y) cur = s;
    if (!cur) {
      const first = Math.min(...stops.map((s) => s.top));
      for (const s of stops) if (s.top === first) cur = s;
    }
    if (cur === current) return;
    current = cur;
    root.style.setProperty('--bg-live', cur.bg);
    root.style.setProperty('--t', cur.t);
  };
  const queue = () => {
    if (!raf) raf = requestAnimationFrame(paint);
  };
  measure();
  paint();
  off.add(listen(window, 'scroll', queue, { passive: true }));
  // Sections that change size (images loading, content-visibility rendering a section) move the ones below.
  const ro = new ResizeObserver(() => {
    measure();
    current = null;
    queue();
  });
  stops.forEach((s) => ro.observe(s.el));

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
    cancelAnimationFrame(raf);
    ro.disconnect();
    io.disconnect();
  };
});
