/* Pinned hero: the first screen stays put while the navy screen slides over it. As it gets
 * covered, the hero content scales down a little and fades for depth. Off under reduced motion. */
import { onPage, reduceMotion, listen, bag } from './page.js';

onPage(() => {
  const hero = document.querySelector('[data-hero]');
  const inner = document.querySelector('[data-hero-inner]');
  if (!hero || !inner || reduceMotion()) return;
  const off = bag();
  hero.classList.add('is-pinned');
  let raf = 0;
  const paint = () => {
    raf = 0;
    const p = Math.min(1, Math.max(0, window.scrollY / Math.max(1, hero.offsetHeight)));
    inner.style.transform = `scale(${(1 - 0.06 * p).toFixed(4)})`;
    inner.style.opacity = (1 - 0.6 * p).toFixed(3);
  };
  const onScroll = () => { if (!raf) raf = requestAnimationFrame(paint); };
  off.add(listen(window, 'scroll', onScroll, { passive: true }));
  off.add(listen(window, 'resize', onScroll));
  paint();
  return () => { off.flush(); cancelAnimationFrame(raf); };
});
