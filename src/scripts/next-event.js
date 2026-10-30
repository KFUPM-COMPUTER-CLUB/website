/* Next-event pill: fills every [data-next] with the first event that has not ended yet and counts
 * down to it ("in 3d 4h", "in 4h 12m", "in 12m", or "is on now"), refreshing every 30 seconds.
 * Stays hidden when nothing is ahead. */
import { onPage, siteHref } from './page.js';

const until = (ms, pill) => {
  const min = Math.floor(ms / 60000),
    h = Math.floor(min / 60),
    d = Math.floor(h / 24);
  const inLabel = pill.dataset.nextIn || 'in';
  const day = pill.dataset.nextDay || 'd';
  const hour = pill.dataset.nextHour || 'h';
  const minute = pill.dataset.nextMinute || 'm';
  if (d >= 1) return `${inLabel} ${d}${day} ${h % 24}${hour}`;
  if (h >= 1) return `${inLabel} ${h}${hour} ${min % 60}${minute}`;
  return `${inLabel} ${Math.max(1, min)}${minute}`;
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
      pill.querySelector('.next-pill__when').textContent =
        now >= start ? pill.dataset.nextNow || 'is on now' : until(start - now, pill);
      pill.href = siteHref(`/timeline#ev-${ev.id}`);
      pill.hidden = false;
    }
  };
  tick();
  const id = setInterval(tick, 30000);
  return () => clearInterval(id);
});
