/* Home page extras: date-stamped elements that hide once their day has passed (the reel counts its own
 * headline, scripts/show-reel.js). Loaded by src/pages/index.astro. */
import { onPage } from './page.js';

onPage(() => {
  const t = new Date();
  const todayIso = `${t.getFullYear()}-${String(t.getMonth() + 1).padStart(2, '0')}-${String(t.getDate()).padStart(2, '0')}`;
  document.querySelectorAll('[data-date]').forEach((el) => {
    if ((el.getAttribute('data-date') || '') < todayIso) el.remove();
  });
});
