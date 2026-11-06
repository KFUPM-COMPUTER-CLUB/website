/* The first screen (#152): the faint code down both sides comes up around the pointer
 * (components/HeroCode.astro), and the ICON box over the icon is editable (components/IconEditor.astro).
 * Each edit re-reads the box's name/value lines (icon-parse.js), redraws the icon (hero-icon.js) and sets --play-hl, the colour
 * of the headline's highlighted words, to the icon's blue. A broken line is reported by its number and its
 * setting keeps its last good value. */
import { onPage, listen, bag } from './page.js';
import { iconSvg, ICON } from './hero-icon.js';
import { parseSettings, settingsHtml } from './icon-parse.js';

const isColor = (v) => typeof CSS !== 'undefined' && CSS.supports('color', v);

onPage(() => {
  const hero = document.querySelector('[data-hero]');
  const code = document.querySelector('[data-herocode]');
  const edit = document.querySelector('[data-iconedit]');
  const input = edit?.querySelector('[data-iconedit-input]');
  const hl = edit?.querySelector('[data-iconedit-hl]');
  const status = edit?.querySelector('[data-iconedit-status]');
  const icon = document.querySelector('[data-hero-icon]');
  if (!hero) return;
  const off = bag();
  const panes = code ? [...code.querySelectorAll('.herocode__pane')] : [];
  let raf = 0;

  // The spotlight follows the pointer over the whole first screen.
  if (code) {
    off.add(
      listen(
        hero,
        'pointermove',
        (e) => {
          cancelAnimationFrame(raf);
          raf = requestAnimationFrame(() => {
            // Each column gets the pointer in its own coordinates, so one spot of light spans both.
            for (const pane of panes) {
              const r = pane.getBoundingClientRect();
              pane.style.setProperty('--mx', `${e.clientX - r.left}px`);
              pane.style.setProperty('--my', `${e.clientY - r.top}px`);
            }
            code.classList.add('is-lit');
          });
        },
        { passive: true },
      ),
    );
    off.add(listen(hero, 'pointerleave', () => code.classList.remove('is-lit')));
  }

  if (input && hl) {
    const hint = status?.textContent.trim() || '';
    let last = { ...ICON };
    const render = () => {
      hl.innerHTML = `${settingsHtml(input.value)}\n`;
      const { settings: s, errors } = parseSettings(input.value, isColor);
      for (const e of errors) if (e.key && e.key in last) s[e.key] = last[e.key];
      last = { ...s };
      if (icon) icon.innerHTML = iconSvg(s);
      document.documentElement.style.setProperty('--play-hl', s.blue);
      if (status) {
        status.textContent = errors.length ? `✗ line ${errors[0].line}: ${errors[0].message}` : `✓ blue ${s.blue}`;
        status.classList.toggle('is-error', errors.length > 0);
      }
    };
    off.add(listen(input, 'input', render));
    off.add(
      listen(input, 'blur', () => {
        if (status && !status.classList.contains('is-error')) status.textContent = hint;
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
  }
  return () => {
    off.flush();
    cancelAnimationFrame(raf);
    document.documentElement.style.removeProperty('--play-hl');
  };
});
