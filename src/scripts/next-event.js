/* Next-event pill: fills every [data-next] with the first event that has not ended yet and counts
 * down to it ("in 3d 4h", "in 4h 12m", "in 12m", or "is on now"), refreshing every 30 seconds.
 * Stays hidden when nothing is ahead. */
import { onPage, siteHref } from './page.js';

const until = (ms) => {
  const min = Math.floor(ms / 60000),
    h = Math.floor(min / 60),
    d = Math.floor(h / 24);
  if (d >= 1) return `in ${d}d ${h % 24}h`;
  if (h >= 1) return `in ${h}h ${min % 60}m`;
  return `in ${Math.max(1, min)}m`;
};

onPage(() => {
  const pills = [...document.querySelectorAll('[data-next]')];
  if (!pills.length) return;
  const tick = () => {
    const now = Date.now();
    for (const pill of pills) {
      let list = [];
      try {
        list = JSON.parse(pill.dataset.next || '[]');
      } catch {
        /* bad data: stay hidden */
      }
      const ev = list.find((e) => e.e >= now);
      if (!ev) {
        pill.hidden = true;
        continue;
      }
      const start = ev.s;
      pill.querySelector('.next-pill__title').textContent = ev.t;
      pill.querySelector('.next-pill__when').textContent = now >= start ? 'is on now' : until(start - now);
      pill.href = siteHref(`/timeline#ev-${ev.id}`);
      pill.hidden = false;
    }
  };
  tick();
  const id = setInterval(tick, 30000);
  return () => clearInterval(id);
});
