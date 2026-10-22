/* Scroll progress fallback for browsers without CSS scroll-driven animations: writes --p on the
 * line from a passive, rAF-throttled scroll listener. */
import { onPage, listen, bag } from './page.js';

onPage(() => {
  const bar = document.querySelector('.scroll-progress i');
  if (!bar || (window.CSS && CSS.supports('animation-timeline: scroll()'))) return;
  const off = bag(); let raf = 0;
  const paint = () => { raf = 0; const max = document.documentElement.scrollHeight - innerHeight; bar.style.setProperty('--p', max > 0 ? Math.min(1, window.scrollY / max).toFixed(4) : '0'); };
  const queue = () => { if (!raf) raf = requestAnimationFrame(paint); };
  off.add(listen(window, 'scroll', queue, { passive: true })); off.add(listen(window, 'resize', queue)); paint();
  return () => { off.flush(); cancelAnimationFrame(raf); };
});
