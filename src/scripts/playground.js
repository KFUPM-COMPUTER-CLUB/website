/* The home page playground (components/Playground.astro, #152): keeps the coloured copy under the
 * textarea in step with what is typed, reads the snippet (playground-parse.js) and redraws the sticker.
 * The colour also goes to --play-hl on the page, which the first screen's highlighted words use. */
import { onPage, listen, bag } from './page.js';
import { highlight } from './code-tokens.js';
import { DEFAULT_CODE, inkFor, parsePlayground, setValue } from './playground-parse.js';

const isColor = (v) => typeof CSS !== 'undefined' && CSS.supports('color', v);
const RADIUS = { square: '0', circle: '50%', diamond: '0', blob: '42% 58% 63% 37% / 45% 38% 62% 55%' };

onPage(() => {
  const root = document.querySelector('[data-play]');
  if (!root) return;
  const input = root.querySelector('[data-play-input]');
  const hl = root.querySelector('[data-play-hl]');
  const status = root.querySelector('[data-play-status]');
  const sticker = root.querySelector('[data-play-sticker]');
  const label = root.querySelector('[data-play-text]');
  const readout = root.querySelector('[data-play-readout]');
  if (!input || !hl || !sticker) return;
  const off = bag();
  let last = parsePlayground(DEFAULT_CODE).settings;
  const okText = status?.textContent.replace(/^✓\s*/, '').trim() || 'rendered';

  const render = () => {
    hl.innerHTML = `${highlight(input.value)}\n`;
    const { settings: s, errors } = parsePlayground(input.value, isColor);
    // A setting whose line is broken keeps its last good value while it is being typed.
    for (const e of errors) if (e.key && e.key in last) s[e.key] = last[e.key];
    last = { ...s };
    sticker.style.setProperty('--c', s.color);
    sticker.style.setProperty('--ink', inkFor(s.color));
    sticker.style.setProperty('--s', `${s.size}px`);
    sticker.style.setProperty('--r', `${s.rotate}deg`);
    sticker.style.setProperty('--radius', RADIUS[s.shape]);
    sticker.dataset.shape = s.shape;
    sticker.classList.toggle('sticker--shadow', s.shadow);
    sticker.classList.toggle('sticker--spin', s.spin);
    if (label) label.textContent = s.text;
    document.documentElement.style.setProperty('--play-hl', s.color);
    if (readout) readout.textContent = `${s.size}px · ${s.color} · ${s.shape}${s.spin ? ' · spinning' : ''}`;
    if (status) {
      status.textContent = errors.length ? `✗ line ${errors[0].line}: ${errors[0].message}` : `✓ ${okText}`;
      status.classList.toggle('is-error', errors.length > 0);
    }
  };
  const syncScroll = () => {
    hl.scrollTop = input.scrollTop;
    hl.scrollLeft = input.scrollLeft;
  };

  off.add(listen(input, 'input', render));
  off.add(listen(input, 'scroll', syncScroll, { passive: true }));
  off.add(
    listen(input, 'keydown', (e) => {
      if (e.key !== 'Tab' || e.shiftKey) return; // Shift+Tab still leaves the editor
      e.preventDefault();
      const { selectionStart: a, selectionEnd: b, value } = input;
      input.value = `${value.slice(0, a)}  ${value.slice(b)}`;
      input.selectionStart = input.selectionEnd = a + 2;
      render();
    }),
  );
  off.add(
    listen(root, 'click', (e) => {
      const btn = e.target instanceof Element ? e.target.closest('[data-play-set], [data-play-reset]') : null;
      if (!btn) return;
      input.value = btn.hasAttribute('data-play-reset')
        ? DEFAULT_CODE
        : setValue(input.value, btn.dataset.playSet, btn.dataset.playValue);
      render();
    }),
  );
  render();
  return () => {
    off.flush();
    document.documentElement.style.removeProperty('--play-hl');
  };
});
