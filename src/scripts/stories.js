/* Moments carousel: advances every six seconds, pauses on hover, steps with the dots and arrows, and
 * stays still under reduced motion. Loaded by Stories.astro. */
import { onPage, reduceMotion } from './page.js';
onPage(() => {
  const root = document.querySelector('[data-stories]');
  if (!root) return;
  const slides = [...root.querySelectorAll('[data-slide]')];
  const dots = [...root.querySelectorAll('[data-go]')];
  const reduce = reduceMotion();
  let i = 0,
    timer = 0;
  const show = (n) => {
    i = (n + slides.length) % slides.length;
    slides.forEach((s, k) => {
      const on = k === i;
      if (on) s.setAttribute('data-active', '');
      else s.removeAttribute('data-active');
      s.setAttribute('aria-hidden', String(!on));
    });
    dots.forEach((d, k) => (k === i ? d.setAttribute('data-active', '') : d.removeAttribute('data-active')));
  };
  const start = () => {
    if (!reduce) timer = window.setInterval(() => show(i + 1), 6000);
  };
  const stop = () => {
    window.clearInterval(timer);
    timer = 0;
  };
  dots.forEach((d) =>
    d.addEventListener('click', () => {
      stop();
      show(Number(d.dataset.go));
      start();
    }),
  );
  root.querySelectorAll('[data-dir]').forEach((b) =>
    b.addEventListener('click', () => {
      stop();
      show(i + Number(b.dataset.dir));
      start();
    }),
  );
  root.addEventListener('pointerenter', stop);
  root.addEventListener('pointerleave', () => {
    if (!timer) start();
  });
  start();
  return stop;
});
