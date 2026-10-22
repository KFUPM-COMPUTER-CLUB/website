/* Copy to clipboard for every [data-copy]: writes the value, shows the tip for 1.4s and announces
 * it to screen readers. Delegated on the document, so it also covers elements added later. */
import { onPage, listen } from './page.js';

const write = async (text) => {
  try { await navigator.clipboard.writeText(text); return true; } catch { /* fall through */ }
  const ta = document.createElement('textarea'); ta.value = text; ta.setAttribute('readonly', ''); ta.style.position = 'fixed'; ta.style.opacity = '0';
  document.body.appendChild(ta); ta.select();
  let ok = false; try { ok = document.execCommand('copy'); } catch { ok = false; }
  ta.remove(); return ok;
};

onPage(() => {
  const timers = new Map();
  const stop = listen(document, 'click', async (e) => {
    const el = e.target instanceof Element ? e.target.closest('[data-copy]') : null;
    if (!el) return;
    e.preventDefault();
    const ok = await write(el.dataset.copy || '');
    const status = el.querySelector('[data-copy-status]');
    if (status) status.textContent = ok ? `Copied ${el.dataset.copy} to clipboard` : 'Could not copy';
    if (!ok) return;
    el.classList.add('is-copied');
    clearTimeout(timers.get(el));
    timers.set(el, setTimeout(() => { el.classList.remove('is-copied'); if (status) status.textContent = ''; }, 1400));
  });
  return () => { stop(); timers.forEach((t) => clearTimeout(t)); };
});
