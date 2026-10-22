/* Photo strip: picks 20 random photos (mixed years) from the rendered pool on every visit, duplicates
 * them for a seamless loop and keeps the strip still under reduced motion. Loaded by PhotoStrip.astro. */
import { onPage, reduceMotion } from './page.js';
onPage(() => {
  const strip = document.querySelector('[data-strip]');
  if (!strip) return;
  const track = strip.querySelector('.strip__track');
  const all = [...track.children];
  const byYear = new Map();
  for (const li of all.sort(() => Math.random() - 0.5)) {
    const y = li.dataset.year;
    if (!byYear.has(y)) byYear.set(y, []);
    byYear.get(y).push(li);
  }
  const pick = [];
  const years = [...byYear.keys()];
  while (pick.length < 20 && years.some((y) => byYear.get(y).length))
    for (const y of years) {
      const li = byYear.get(y).shift();
      if (li && pick.length < 20) pick.push(li);
    }
  all.forEach((li) => li.remove());
  pick.forEach((li) => {
    li.hidden = false;
    track.appendChild(li);
  });
  if (!reduceMotion()) {
    pick.forEach((li) => track.appendChild(li.cloneNode(true)));
    strip.classList.add('strip--moving');
  }
});
