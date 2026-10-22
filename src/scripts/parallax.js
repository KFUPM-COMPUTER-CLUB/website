/* Tilted cards drift at different speeds as the page scrolls. */
import { onPage, reduceMotion, listen, bag } from './page.js';

onPage(() => {
  const pieces = [...document.querySelectorAll('.polaroid')];
  if (!pieces.length || reduceMotion()) return;
  const off = bag();
  const f = [0.13, 0.32, 0.29, 0.22, 0.18];
  const update = () => { const mid = innerHeight * 0.5; pieces.forEach((p, i) => { const r = p.getBoundingClientRect(); p.style.setProperty('--py', `${((r.top + r.height / 2 - mid) * f[i % f.length] * -0.55).toFixed(2)}px`); }); };
  let raf = 0; const q = () => { cancelAnimationFrame(raf); raf = requestAnimationFrame(update); };
  off.add(listen(window, 'scroll', q, { passive: true })); off.add(listen(window, 'resize', q, { passive: true })); update();
  return () => { off.flush(); cancelAnimationFrame(raf); };
});
