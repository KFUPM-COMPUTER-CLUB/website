/* Admin import page: calls /api/admin/import one batch at a time until it reports no next step, so
 * every request stays inside the function time limit, and shows the log as it goes. */
import { onPage } from './page.js';
onPage(() => {
  const root = document.querySelector('[data-import]');
  if (!root) return;
  const btn = root.querySelector('[data-import-start]'),
    status = root.querySelector('[data-import-status]'),
    log = root.querySelector('[data-import-log]'),
    force = root.querySelector('[data-import-force]');
  btn.addEventListener('click', async () => {
    btn.disabled = true;
    log.hidden = false;
    log.textContent = '';
    // Walk the steps the API hands back. A failure leaves the button enabled; pressing it again
    // restarts from the top, but files already uploaded are skipped unless "force" is ticked.
    let step = { step: 'photos', offset: 0 };
    try {
      while (step) {
        status.textContent = `Importing… ${step.step} ${step.offset}`;
        const r = await fetch('/api/admin/import', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ...step, force: force.checked }),
        });
        const j = await r.json();
        if (!j.ok) throw new Error(j.error || 'Import failed');
        log.textContent += j.log.join('\n') + '\n';
        log.scrollTop = log.scrollHeight;
        status.textContent = `${j.done} of ${j.total} steps done`;
        step = j.next;
      }
      status.textContent = 'Done. The site reads from the database now; changes are live in about a minute.';
    } catch (e) {
      status.textContent = `Stopped: ${e.message}. Press the button again to continue.`;
    }
    btn.disabled = false;
  });
});
