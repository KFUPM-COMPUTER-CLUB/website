/* Counts one read of the open post for the writers' leaderboard on /blog (0011_featured_posts.sql):
 * a single request once the page has been visible for DWELL_MS in total, so a skim or a tab left in
 * the background does not count. Only database posts carry [data-read]; seed posts have nothing to count.
 * The request carries no identifier; the API throttles repeats from one address. */
import { onPage, listen } from './page.js';

const DWELL_MS = 15_000;

onPage(() => {
  const el = document.querySelector('[data-read]');
  if (!el) return;
  let left = DWELL_MS,
    since = 0,
    timer = 0;
  const send = () => {
    left = 0;
    since = 0;
    fetch(`/api/posts/${encodeURIComponent(el.dataset.read)}/read`, { method: 'POST', keepalive: true }).catch(
      () => {},
    );
  };
  const start = () => {
    if (left <= 0 || since || document.visibilityState !== 'visible') return;
    since = Date.now();
    timer = setTimeout(send, left);
  };
  const stop = () => {
    clearTimeout(timer);
    if (since) left -= Date.now() - since;
    since = 0;
  };
  const off = listen(document, 'visibilitychange', () => (document.visibilityState === 'visible' ? start() : stop()));
  start();
  return () => {
    stop();
    off();
  };
});
