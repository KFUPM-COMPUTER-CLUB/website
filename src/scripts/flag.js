/* The /flag page. The flag itself never ships: only its SHA-256 digest does, and the pasted value is
 * hashed in the browser with crypto.subtle. A correct flag (typed, or passed as ?key=) opens the
 * solvers list and a form that posts to site.links.solvers when set, or opens a prefilled GitHub issue. */
import { onPage, listen, bag } from './page.js';

const DIGEST = 'ab5b2416c1919874bbfea712414a31735c66a89b31b471ffe6cc5f0606169e3a';
const SOLVED_KEY = 'cc_solved';

const hex = (buf) => Array.from(new Uint8Array(buf), (b) => b.toString(16).padStart(2, '0')).join('');
const digest = async (text) => hex(await crypto.subtle.digest('SHA-256', new TextEncoder().encode(text)));
const local = {
  get(k) { try { return localStorage.getItem(k); } catch { return null; } },
  set(k, v) { try { localStorage.setItem(k, v); } catch { /* ignore */ } },
};

onPage(() => {
  const root = document.querySelector('[data-flag]');
  if (!root) return;

  let cfg = { endpoint: '', issue: 'https://github.com/KFUPM-COMPUTER-CLUB/website/issues/new' };
  try { const el = document.querySelector('[data-flag-cfg]'); if (el) cfg = { ...cfg, ...JSON.parse(el.textContent) }; } catch (e) { console.error(e); }

  const gate = root.querySelector('[data-flag-gate]');
  const won = root.querySelector('[data-flag-won]');
  const form = root.querySelector('[data-flag-form]');
  const input = root.querySelector('[data-flag-input]');
  const result = root.querySelector('[data-flag-result]');
  const solverForm = root.querySelector('[data-solver-form]');
  const nameEl = root.querySelector('[data-solver-name]');
  const handleEl = root.querySelector('[data-solver-handle]');
  const submitBtn = root.querySelector('[data-solver-submit]');
  const solverResult = root.querySelector('[data-solver-result]');
  if (!gate || !won || !form || !input) return;

  const off = bag();
  let busy = false;

  const say = (el, text) => { if (el) el.textContent = text; };

  /* Swap the gate for the congratulations; focus lands on the new heading so it is announced. */
  const unlock = (announce) => {
    gate.hidden = true;
    won.hidden = false;
    local.set(SOLVED_KEY, '1');
    if (announce) won.querySelector('[data-flag-title]')?.focus({ preventScroll: true });
  };

  const check = async (raw) => {
    const value = raw.trim();
    if (!value || busy) return;
    if (!window.crypto?.subtle) return say(result, 'This page needs a secure connection to check the flag.');
    busy = true;
    try {
      if ((await digest(value)) === DIGEST) { try { sessionStorage.setItem('cc_flag', value); } catch { /* ignore */ } say(result, ''); unlock(true); }
      else say(result, 'Not it. Keep looking.');
    } catch { say(result, 'Could not check that. Try again.'); }
    busy = false;
  };

  off.add(listen(form, 'submit', (e) => { e.preventDefault(); check(input.value); }));

  /* Add a solver: POST to the configured endpoint, or open a prefilled issue when none is set. */
  if (solverForm && nameEl) off.add(listen(solverForm, 'submit', async (e) => {
    e.preventDefault();
    const name = nameEl.value.trim().slice(0, 40);
    const handle = (handleEl?.value || '').trim().slice(0, 40);
    if (!name) return nameEl.focus();
    if (cfg.endpoint) {
      if (submitBtn) submitBtn.disabled = true;
      say(solverResult, 'Sending…');
      try {
        const r = await fetch(cfg.endpoint, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name, handle, flag: input.value.trim() || sessionStorage.getItem('cc_flag') || '' }) });
        if (!r.ok) throw new Error(String(r.status));
        say(solverResult, 'Sent. An officer adds you to the list.');
        solverForm.reset();
      } catch { say(solverResult, 'Could not send. Try again in a moment.'); }
      if (submitBtn) submitBtn.disabled = false;
    } else {
      const url = new URL(cfg.issue);
      url.searchParams.set('title', `Flag solved: ${name}`);
      url.searchParams.set('body', `Name: ${name}\nHandle: ${handle || 'none'}\n\nSolved the site challenge. Please add me to the solvers list.`);
      window.open(url.href, '_blank', 'noopener');
      say(solverResult, 'Opened a GitHub issue. An officer adds you to the list.');
    }
  }));

  /* ?key=<flag> in the URL is checked on arrival, then removed so it does not linger in history. */
  const key = new URL(location.href).searchParams.get('key');
  if (key) {
    input.value = key;
    history.replaceState(history.state, '', location.pathname);
    check(key);
  } else if (local.get(SOLVED_KEY) === '1') {
    unlock(false); // a returning solver skips the door
  }

  return off.flush;
});
