/* The first screen's editable background (components/HeroCode.astro, #152). Moving the pointer brings
 * the code up around it; while it is being edited the whole file shows. Each edit re-reads the ICON block
 * (icon-parse.js), redraws the icon above the headline (hero-icon.js), and sets --play-hl, the colour of
 * the headline's highlighted words, to the icon's blue. A broken line is reported by its number and its
 * setting keeps its last good value. */
import { onPage, listen, bag } from './page.js';
import { highlight } from './code-tokens.js';
import { iconSvg, ICON } from './hero-icon.js';
import { parseIcon } from './icon-parse.js';

const isColor = (v) => typeof CSS !== 'undefined' && CSS.supports('color', v);

onPage(() => {
  const root = document.querySelector('[data-herocode]');
  const hero = root?.closest('[data-hero]');
  const input = root?.querySelector('[data-herocode-input]');
  const hl = root?.querySelector('[data-herocode-hl]');
  const status = root?.querySelector('[data-herocode-status]');
  const icon = document.querySelector('[data-hero-icon]');
  if (!root || !hero || !input || !hl) return;
  const off = bag();
  const hint = status?.textContent.trim() || '';
  let last = { ...ICON };
  let raf = 0;

  const render = () => {
    hl.innerHTML = `${highlight(input.value)}\n`;
    const { settings: s, errors } = parseIcon(input.value, isColor);
    for (const e of errors) if (e.key && e.key in last) s[e.key] = last[e.key];
    last = { ...s };
    if (icon) icon.innerHTML = iconSvg(s);
    document.documentElement.style.setProperty('--play-hl', s.blue);
    if (status) {
      status.textContent = errors.length ? `✗ line ${errors[0].line}: ${errors[0].message}` : `✓ blue ${s.blue}`;
      status.classList.toggle('is-error', errors.length > 0);
    }
  };
  // The spotlight follows the pointer over the whole first screen, not just the code.
  const move = (e) => {
    const r = root.getBoundingClientRect();
    cancelAnimationFrame(raf);
    raf = requestAnimationFrame(() => {
      root.style.setProperty('--mx', `${e.clientX - r.left}px`);
      root.style.setProperty('--my', `${e.clientY - r.top}px`);
      root.classList.add('is-lit');
    });
  };
  off.add(listen(hero, 'pointermove', move, { passive: true }));
  off.add(listen(hero, 'pointerleave', () => root.classList.remove('is-lit')));
  off.add(listen(input, 'focus', () => root.classList.add('is-editing')));
  off.add(
    listen(input, 'blur', () => {
      root.classList.remove('is-editing');
      if (status && !status.classList.contains('is-error')) status.textContent = hint;
    }),
  );
  off.add(
    listen(input, 'input', () => {
      render();
      hl.scrollTop = input.scrollTop;
    }),
  );
  off.add(
    listen(input, 'keydown', (e) => {
      if (e.key === 'Escape') return input.blur();
      if (e.key !== 'Tab' || e.shiftKey) return;
      e.preventDefault();
      const { selectionStart: a, selectionEnd: b, value } = input;
      input.value = `${value.slice(0, a)}  ${value.slice(b)}`;
      input.selectionStart = input.selectionEnd = a + 2;
      render();
    }),
  );
  return () => {
    off.flush();
    cancelAnimationFrame(raf);
    document.documentElement.style.removeProperty('--play-hl');
  };
});
