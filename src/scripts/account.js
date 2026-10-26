/* Public pages are cached for everyone (ISR), so the server never puts a person's state in them. At
 * sign-in the callback sets cc_in=1, a cookie with no data in it and readable by scripts, and this
 * swaps the Join button for "My account" and shows or hides the data-signed-in and data-signed-out
 * pairs (the timeline's reservation form). It is a hint only: a stale cookie shows the wrong button
 * until the next personal request, where the middleware checks the real session and corrects it. */
import { onPage } from './page.js';
onPage(() => {
  const signedIn = /(^|; )cc_in=1(;|$)/.test(document.cookie);
  document.querySelectorAll('[data-join]').forEach((a) => {
    if (!signedIn) return;
    a.setAttribute('href', '/me');
    a.removeAttribute('target');
    // The label comes from the page (data-account-label) so Arabic pages show Arabic; English is the fallback.
    a.textContent = `${a.dataset.accountLabel || 'My account'} `;
    const arrow = document.createElement('span');
    arrow.setAttribute('aria-hidden', 'true');
    arrow.textContent = '→';
    a.append(arrow);
  });
  document.querySelectorAll('[data-signed-in]').forEach((el) => {
    el.hidden = !signedIn;
  });
  document.querySelectorAll('[data-signed-out]').forEach((el) => {
    el.hidden = signedIn;
  });
});
