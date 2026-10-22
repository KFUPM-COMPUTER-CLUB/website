/* Magnetic buttons: elements with data-magnet lean toward a nearby pointer and spring back when it
 * leaves. Desktop pointers only (hover + fine), off under reduced motion. One rAF-throttled
 * pointermove listener; the offset lands in --mx/--my, the CSS does the rest. */
import { onPage, reduceMotion, listen, bag } from './page.js';

onPage(() => {
  const els = [...document.querySelectorAll('[data-magnet]')];
  if (!els.length || reduceMotion() || !matchMedia('(pointer: fine) and (hover: hover)').matches) return;
  const off = bag();
  const RADIUS = 90,
    PULL = 0.35,
    MAX = 14;
  const near = new Set();
  let mx = -1e4,
    my = -1e4,
    raf = 0;
  const set = (el, x, y) => {
    el.style.setProperty('--mx', `${x.toFixed(1)}px`);
    el.style.setProperty('--my', `${y.toFixed(1)}px`);
  };
  const tick = () => {
    raf = 0;
    for (const el of els) {
      const r = el.getBoundingClientRect();
      const dx = mx - (r.left + r.width / 2),
        dy = my - (r.top + r.height / 2);
      const gap = Math.hypot(Math.max(0, Math.abs(dx) - r.width / 2), Math.max(0, Math.abs(dy) - r.height / 2)); // distance from the edge
      if (gap < RADIUS) {
        if (!near.has(el)) {
          near.add(el);
          el.classList.remove('is-releasing');
        }
        const f = 1 - gap / RADIUS;
        set(el, Math.max(-MAX, Math.min(MAX, dx * PULL * f)), Math.max(-MAX, Math.min(MAX, dy * PULL * f)));
      } else if (near.has(el)) {
        near.delete(el);
        el.classList.add('is-releasing');
        set(el, 0, 0);
      }
    }
  };
  const queue = () => {
    if (!raf) raf = requestAnimationFrame(tick);
  };
  off.add(
    listen(
      window,
      'pointermove',
      (e) => {
        mx = e.clientX;
        my = e.clientY;
        queue();
      },
      { passive: true },
    ),
  );
  off.add(listen(window, 'scroll', queue, { passive: true }));
  off.add(
    listen(document, 'pointerleave', () => {
      mx = my = -1e4;
      queue();
    }),
  );
  return () => {
    off.flush();
    cancelAnimationFrame(raf);
    els.forEach((el) => {
      el.classList.remove('is-releasing');
      el.style.removeProperty('--mx');
      el.style.removeProperty('--my');
    });
  };
});
