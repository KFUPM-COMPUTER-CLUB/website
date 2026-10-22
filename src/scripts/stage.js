/* Screen two: the CC | KFUPM mark stays pinned while the text under it steps through the panels
 * driven by scroll position. The bar above the text shows progress and doubles as tabs. Under
 * reduced motion nothing is pinned and the first panel is shown with the tabs still clickable. */
import { onPage, reduceMotion, listen, bag } from './page.js';

onPage(() => {
  const sec = document.querySelector('[data-stage]');
  if (!sec) return;
  const off = bag();
  const stage = sec.querySelector('.stage');
  const tabs = [...sec.querySelectorAll('.stage__tab')];
  const panels = [...sec.querySelectorAll('.stage__panel')];
  const n = panels.length;
  let active = 0;
  const show = (i) => {
    if (i === active) return;
    active = i;
    panels.forEach((p, k) => (k === i ? p.setAttribute('data-active', '') : p.removeAttribute('data-active')));
    tabs.forEach((t, k) => t.setAttribute('aria-selected', String(k === i)));
  };
  const fill = (p) =>
    tabs.forEach((t, k) => t.style.setProperty('--f', Math.min(1, Math.max(0, p * n - k)).toFixed(3)));
  let raf = 0;
  if (reduceMotion()) {
    fill(1 / n);
    tabs.forEach((t, i) =>
      t.addEventListener('click', () => {
        show(i);
        fill((i + 1) / n);
      }),
    );
  } else {
    sec.setAttribute('data-pinned', '');
    // The anchor sits where the stage would be without stickiness, so its position is stable.
    const anchor = sec.querySelector('.stage__anchor');
    const start = () => anchor.getBoundingClientRect().top + window.scrollY;
    const span = () =>
      sec.getBoundingClientRect().bottom +
      window.scrollY -
      parseFloat(getComputedStyle(sec).paddingBottom) -
      start() -
      stage.offsetHeight;
    const paint = () => {
      raf = 0;
      const p = Math.min(1, Math.max(0, (window.scrollY - start()) / Math.max(1, span())));
      show(Math.min(n - 1, Math.floor(p * n)));
      fill(p);
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(paint);
    };
    off.add(listen(window, 'scroll', onScroll, { passive: true }));
    off.add(listen(window, 'resize', onScroll));
    paint();
    tabs.forEach((t, i) =>
      t.addEventListener('click', () => window.scrollTo({ top: start() + span() * (i / n) + 2, behavior: 'smooth' })),
    );
  }
  return () => {
    off.flush();
    cancelAnimationFrame(raf);
  };
});
