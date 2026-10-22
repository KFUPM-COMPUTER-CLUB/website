/* Home page extras: counters that count up once, and date-stamped elements that hide once their
 * day has passed. Loaded by src/pages/index.astro. */
import { onPage, reduceMotion } from './page.js';

onPage(() => {
  const reduce = reduceMotion();
  document.querySelectorAll('[data-count]').forEach((el) => {
    const raw = el.dataset.count || '';
    const n = parseInt(raw.replace(/\D/g, ''), 10);
    if (!n || reduce) return;
    const suffix = raw.replace(/^[\d,]+/, '');
    const start = performance.now();
    const step = (t) => {
      const p = Math.min(1, (t - start) / 1200);
      el.textContent = Math.round(n * (1 - Math.pow(1 - p, 3))) + suffix;
      if (p < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  });
  const t = new Date();
  const todayIso = `${t.getFullYear()}-${String(t.getMonth() + 1).padStart(2, '0')}-${String(t.getDate()).padStart(2, '0')}`;
  document.querySelectorAll('[data-date]').forEach((el) => {
    if ((el.getAttribute('data-date') || '') < todayIso) el.remove();
  });
});
