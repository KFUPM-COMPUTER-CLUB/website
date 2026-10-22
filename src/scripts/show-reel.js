/* Impact reel: the pinned stage switches scene with scroll progress or hover, and the headline counts
 * up once when it comes into view. Loaded by ShowReel.astro. */
import { onPage, reduceMotion, listen, bag } from './page.js';
onPage(() => {
  const reel = document.querySelector('[data-reel]');
  if (!reel) return;
  const off = bag();
  const reduce = reduceMotion();
  const scenes = [...reel.querySelectorAll('[data-scene]')];
  const links = [...reel.querySelectorAll('.reel__link')];
  const events = [...reel.querySelectorAll('[data-events]')];
  const n = scenes.length;
  let active = 0,
    hovered = -1;
  const show = (i) => {
    if (i === active) return;
    active = i;
    scenes.forEach((s, k) => (k === i ? s.setAttribute('data-active', '') : s.removeAttribute('data-active')));
    links.forEach((l, k) => (k === i ? l.setAttribute('data-active', '') : l.removeAttribute('data-active')));
    events.forEach((e, k) => {
      e.hidden = k !== i;
    });
  };
  links.forEach((l, i) => {
    l.addEventListener('pointerenter', () => {
      hovered = i;
      show(i);
    });
    l.addEventListener('pointerleave', () => {
      hovered = -1;
    });
    l.addEventListener('click', () => show(i));
  });
  if (!reduce) {
    reel.setAttribute('data-pinned', '');
    const onScroll = () => {
      if (hovered >= 0) return;
      const r = reel.getBoundingClientRect();
      const span = r.height - window.innerHeight;
      if (span <= 0) return;
      const p = Math.min(1, Math.max(0, -r.top / span));
      show(Math.min(n - 1, Math.floor(p * n)));
    };
    off.add(listen(window, 'scroll', onScroll, { passive: true }));
    onScroll();
  }
  // The headline counts up once, the first time the stage is seen.
  const el = reel.querySelector('[data-count]');
  let io;
  if (el && !reduce && 'IntersectionObserver' in window) {
    const target = Number(el.dataset.count);
    el.textContent = '0';
    io = new IntersectionObserver(
      (entries) => {
        if (!entries.some((e) => e.isIntersecting)) return;
        io.disconnect();
        const start = performance.now();
        const step = (t) => {
          const p = Math.min(1, (t - start) / 1800);
          el.textContent = Math.round(target * (1 - Math.pow(1 - p, 3))).toLocaleString('en-US');
          if (p < 1) requestAnimationFrame(step);
        };
        requestAnimationFrame(step);
      },
      { threshold: 0.3 },
    );
    io.observe(el);
  }
  return () => {
    off.flush();
    io?.disconnect();
  };
});
