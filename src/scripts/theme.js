/* Reveal-on-scroll. The site is light only: each section paints its own background (its bg-* class) and
 * the page, header and tokens never switch colours while scrolling, so there is no scroll work here.
 * Elements with .reveal fade in the first time they come near the screen. */
import { onPage } from './page.js';

onPage(() => {
  const root = document.documentElement;
  root.classList.add('js');

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
    io.disconnect();
  };
});
