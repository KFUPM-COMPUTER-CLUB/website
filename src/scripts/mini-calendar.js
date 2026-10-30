/* Mini calendar on the timeline: a month grid built from the events inlined on the page; a highlighted
 * day scrolls to its event row. Loaded by src/pages/timeline.astro. */
import { onPage } from './page.js';
// Mini calendar: built from the data-events JSON, one marked day per event day; clicking a day scrolls to the event.
onPage(() => {
  const cal = document.querySelector('.cal');
  if (!cal) return;
  const events = JSON.parse(cal.dataset.events || '[]');
  const byDay = new Map();
  const addDay = (d, ev) => {
    if (!byDay.has(d)) byDay.set(d, []);
    byDay.get(d).push(ev);
  };
  for (const ev of events) {
    const s = new Date(ev.d + 'T00:00:00Z'),
      e = new Date((ev.e || ev.d) + 'T00:00:00Z');
    for (let d = new Date(s); d <= e; d.setUTCDate(d.getUTCDate() + 1)) addDay(d.toISOString().slice(0, 10), ev);
  }
  const grid = cal.querySelector('.cal__grid'),
    label = cal.querySelector('.cal__month');
  const now = new Date();
  let y = now.getFullYear(),
    m = now.getMonth();
  const todayIso = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
  // Month name and weekday letters follow the page language.
  const ar = document.documentElement.lang === 'ar';
  const weekdays = ar ? ['ح', 'ن', 'ث', 'ر', 'خ', 'ج', 'س'] : ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];
  const render = () => {
    label.textContent = new Date(Date.UTC(y, m, 1)).toLocaleDateString(ar ? 'ar-SA-u-ca-gregory' : 'en-GB', {
      month: 'long',
      year: 'numeric',
      timeZone: 'UTC',
    });
    const first = new Date(Date.UTC(y, m, 1)).getUTCDay(),
      days = new Date(Date.UTC(y, m + 1, 0)).getUTCDate();
    let html = weekdays.map((d) => `<span class="cal__dow">${d}</span>`).join('');
    for (let i = 0; i < first; i++) html += '<span></span>';
    for (let d = 1; d <= days; d++) {
      const key = `${y}-${String(m + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      const evs = byDay.get(key);
      const cls = [
        'cal__day',
        evs ? 'has-ev' : '',
        key === todayIso ? 'is-today' : '',
        evs && key >= todayIso ? 'is-up' : '',
      ]
        .filter(Boolean)
        .join(' ');
      html += evs
        ? `<button type="button" class="${cls}" title="${evs
            .map((e) => e.t)
            .join(', ')
            .replace(/"/g, '&quot;')}" data-id="${evs[0].id}">${d}</button>`
        : `<span class="${cls}">${d}</span>`;
    }
    grid.innerHTML = html;
  };
  render();
  cal.querySelector('.cal__prev').addEventListener('click', () => {
    m--;
    if (m < 0) {
      m = 11;
      y--;
    }
    render();
  });
  cal.querySelector('.cal__next').addEventListener('click', () => {
    m++;
    if (m > 11) {
      m = 0;
      y++;
    }
    render();
  });
  grid.addEventListener('click', (e) => {
    const b = e.target.closest('[data-id]');
    if (!b) return;
    const el = document.getElementById(`ev-${b.dataset.id}`);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      el.classList.add('is-hit');
      setTimeout(() => el.classList.remove('is-hit'), 1600);
    }
  });
});
