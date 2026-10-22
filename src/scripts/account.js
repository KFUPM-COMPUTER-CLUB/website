/* Public pages are cached for everyone, so they never know who is signed in. A plain cookie set at
 * sign-in (no personal data) lets the Join button turn into "My account" on the client. */
import { onPage } from './page.js';
onPage(() => {
  const signedIn = /(^|; )cc_in=1(;|$)/.test(document.cookie);
  document.querySelectorAll('[data-join]').forEach((a) => {
    if (!signedIn) return;
    a.setAttribute('href', '/me'); a.removeAttribute('target'); a.innerHTML = 'My account <span aria-hidden="true">→</span>';
  });
  document.querySelectorAll('[data-signed-in]').forEach((el) => { el.hidden = !signedIn; });
  document.querySelectorAll('[data-signed-out]').forEach((el) => { el.hidden = signedIn; });
});
