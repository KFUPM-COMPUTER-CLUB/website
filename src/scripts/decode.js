/* Headline decode: the first time a big heading scrolls into view its letters flicker through
 * random characters and settle, left to right, into the real text in about 600ms. Text nodes only,
 * so inner spans keep their styling; letters swap for letters of the same case so lines keep their
 * width. Once per heading per visit. Off under reduced motion. */
import { onPage, reduceMotion } from './page.js';

const UP = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ#$%&@<>/_',
  LOW = 'abcdefghijklmnopqrstuvwxyz#$%&@<>/_',
  DIG = '0123456789';
const pick = (ch) => {
  const set = /[0-9]/.test(ch) ? DIG : ch === ch.toUpperCase() ? UP : LOW;
  return set[Math.floor(Math.random() * set.length)];
};
const done = new Set(); // "path|text" of headings already decoded this visit

onPage(() => {
  if (reduceMotion()) return;
  const heads = [...document.querySelectorAll('.h-display, .h1, h1, h2.h1')].filter(
    (el) =>
      !el.matches('.ccmark, .post__title, [data-decoded]') &&
      !el.closest('[data-no-decode]') &&
      !el.querySelector('img') &&
      el.textContent.trim() &&
      !done.has(location.pathname + '|' + el.textContent),
  );
  if (!heads.length) return;

  const run = (el) => {
    el.dataset.decoded = '';
    done.add(location.pathname + '|' + el.textContent);
    const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT);
    const nodes = [];
    let n;
    while ((n = walker.nextNode()))
      if (n.nodeValue.trim()) nodes.push({ node: n, text: n.nodeValue, out: n.nodeValue });
    const total = nodes.reduce((s, x) => s + x.text.length, 0);
    if (!total) return;
    el.setAttribute('aria-label', el.textContent);
    el.style.minHeight = `${el.offsetHeight}px`;
    const t0 = performance.now(),
      DUR = 600;
    let lastRoll = -1;
    const step = (t) => {
      const p = Math.min(1, (t - t0) / DUR),
        settled = Math.floor(p * total),
        reroll = t - lastRoll > 40;
      if (reroll) lastRoll = t;
      let idx = 0;
      for (const x of nodes) {
        let out = '';
        for (let i = 0; i < x.text.length; i++, idx++) {
          const ch = x.text[i];
          out += idx < settled || !/[A-Za-z0-9]/.test(ch) ? ch : reroll ? pick(ch) : x.out[i];
        }
        if (out !== x.out) {
          x.out = out;
          x.node.nodeValue = out;
        }
      }
      if (p < 1) requestAnimationFrame(step);
      else {
        nodes.forEach((x) => {
          x.node.nodeValue = x.text;
        });
        el.removeAttribute('aria-label');
        el.style.minHeight = '';
      }
    };
    requestAnimationFrame(step);
  };

  const io = new IntersectionObserver(
    (entries) => {
      for (const e of entries)
        if (e.isIntersecting) {
          io.unobserve(e.target);
          run(e.target);
        }
    },
    { threshold: 0.35 },
  );
  heads.forEach((h) => io.observe(h));
  return () => io.disconnect();
});
