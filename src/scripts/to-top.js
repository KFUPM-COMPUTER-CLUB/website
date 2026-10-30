/* Shows the floating back-to-top button (.to-top) once the reader is 35% of the way down the page.
 * A passive, rAF-throttled scroll listener, the same shape as progress.js. */
import { onPage, listen, bag } from './page.js';

const SHOW_AT = 0.35;

onPage(() => {
  const btn = document.querySelector('.to-top');
  if (!btn) return;
  const off = bag();
  let raf = 0;
  const paint = () => {
    raf = 0;
    const max = document.documentElement.scrollHeight - innerHeight;
    btn.classList.toggle('is-visible', max > 0 && window.scrollY / max >= SHOW_AT);
  };
  const queue = () => {
    if (!raf) raf = requestAnimationFrame(paint);
  };
  off.add(listen(window, 'scroll', queue, { passive: true }));
  off.add(listen(window, 'resize', queue));
  paint();
  return () => {
    off.flush();
    cancelAnimationFrame(raf);
  };
});
