/* The first screen (#152): the faint code that fills the screen comes up around the pointer
 * (components/HeroCode.astro), and the ICON box over the icon is editable (components/IconEditor.astro).
 * Each edit re-reads the box's name/value lines (icon-parse.js), redraws the icon (hero-icon.js) and sets --play-hl, the colour
 * of the headline's highlighted words, to the icon's blue. A broken line is reported by its number and its
 * setting keeps its last good value. */
import { onPage, listen, bag, reduceMotion } from './page.js';
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
  const pane = code?.querySelector('.herocode__pane');
  let raf = 0;

  // The spotlight: a round window holding a brighter copy of the code. Only transforms change while the
  // pointer moves (the window goes to the pointer, the copy inside goes the other way so it lines up with
  // the faint code), so the browser moves layers instead of repainting the screen.
  if (code && pane && !reduceMotion()) {
    const R = 320;
    const spot = document.createElement('div');
    spot.className = 'herocode__spot';
    const copy = pane.cloneNode(true);
    spot.append(copy);
    code.append(spot);
    const size = () => {
      copy.style.width = `${code.clientWidth}px`;
      copy.style.height = `${code.clientHeight}px`;
    };
    size();
    let x = 0,
      y = 0;
    const move = () => {
      raf = 0;
      spot.style.transform = `translate3d(${x - R}px, ${y - R}px, 0)`;
      copy.style.transform = `translate3d(${R - x}px, ${R - y}px, 0)`;
    };
    off.add(listen(window, 'resize', size, { passive: true }));
    off.add(
      listen(
        hero,
        'pointermove',
        (e) => {
          if (e.pointerType !== 'mouse') return;
          const r = code.getBoundingClientRect();
          x = e.clientX - r.left;
          y = e.clientY - r.top;
          if (!raf) raf = requestAnimationFrame(move);
          code.classList.add('is-lit');
        },
        { passive: true },
      ),
    );
    off.add(listen(hero, 'pointerleave', () => code.classList.remove('is-lit')));
    off.add(() => spot.remove());
  }

  if (input && hl) {
    const hint = status?.textContent.trim() || '';
    let last = { ...ICON };
    const render = () => {
      hl.innerHTML = `${settingsHtml(input.value)}\n`;
      const { settings: s, errors } = parseSettings(input.value, isColor);
      for (const e of errors) if (e.key && e.key in last) s[e.key] = last[e.key];
      last = { ...s };
      if (icon) {
        icon.innerHTML = iconSvg(s);
        if (!errors.length && !reduceMotion())
          icon.firstElementChild?.animate(
            [{ transform: 'scale(1)' }, { transform: 'scale(1.04)' }, { transform: 'scale(1)' }],
            {
              duration: 280,
              easing: 'cubic-bezier(.2,.8,.2,1)',
            },
          );
      }
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
