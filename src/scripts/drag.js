/* Draggable polaroids. On desktop each polaroid at the seam can be picked up and dragged: it tilts
 * with the hand, slides a little on release and settles with a soft spring. Double-click sends it
 * home. A press that barely moves is still a click and opens the post. Keyboard: arrows nudge a
 * focused polaroid, Home returns it. Desktop pointers only, 1024px and up, off under reduced motion. */
import { onPage, reduceMotion } from './page.js';

onPage(() => {
  const collage = document.querySelector('.collage');
  if (!collage || reduceMotion() || !matchMedia('(pointer: fine) and (min-width: 1024px)').matches) return;
  collage.classList.add('is-draggable');
  const cards = [...collage.querySelectorAll('.polaroid')];
  const state = new Map();
  let top = 30;
  const get = (el) => state.get(el) || state.set(el, { x: 0, y: 0, tilt: 0, vx: 0, vy: 0, tv: 0, raf: 0 }).get(el);
  const apply = (el, s) => {
    el.style.setProperty('--dx', `${s.x.toFixed(2)}px`);
    el.style.setProperty('--dy', `${s.y.toFixed(2)}px`);
    el.style.setProperty('--tilt', `${s.tilt.toFixed(2)}deg`);
  };

  // Spring: tilt eases back to level; on release the card slides out its last velocity, on
  // "home" it is pulled back to its original spot.
  const settle = (el, home) => {
    const s = get(el);
    cancelAnimationFrame(s.raf);
    const step = () => {
      if (home) {
        s.vx += -s.x * 0.12;
        s.vy += -s.y * 0.12;
        s.vx *= 0.76;
        s.vy *= 0.76;
      } else {
        s.vx *= 0.88;
        s.vy *= 0.88;
      }
      s.x += s.vx;
      s.y += s.vy;
      s.tv += -s.tilt * 0.14;
      s.tv *= 0.76;
      s.tilt += s.tv;
      apply(el, s);
      const still =
        Math.abs(s.vx) < 0.04 &&
        Math.abs(s.vy) < 0.04 &&
        Math.abs(s.tv) < 0.04 &&
        Math.abs(s.tilt) < 0.05 &&
        (!home || Math.hypot(s.x, s.y) < 0.3);
      if (still) {
        if (home) s.x = s.y = 0;
        s.tilt = s.tv = s.vx = s.vy = 0;
        apply(el, s);
        s.raf = 0;
      } else s.raf = requestAnimationFrame(step);
    };
    s.raf = requestAnimationFrame(step);
  };

  cards.forEach((el) => {
    el.draggable = false;
    let down = null,
      dragged = false,
      lastX = 0,
      lastY = 0,
      lastT = 0;
    el.addEventListener('dragstart', (e) => e.preventDefault());
    el.addEventListener('pointerdown', (e) => {
      if (e.button !== 0) return;
      const s = get(el);
      cancelAnimationFrame(s.raf);
      s.raf = 0;
      s.vx = s.vy = 0;
      down = { ox: e.clientX - s.x, oy: e.clientY - s.y, sx: e.clientX, sy: e.clientY };
      dragged = false;
      lastX = e.clientX;
      lastY = e.clientY;
      lastT = e.timeStamp;
      el.setPointerCapture(e.pointerId);
    });
    el.addEventListener('pointermove', (e) => {
      if (!down) return;
      const s = get(el);
      if (!dragged) {
        if (Math.hypot(e.clientX - down.sx, e.clientY - down.sy) < 6) return;
        dragged = true;
        el.classList.add('is-dragging');
        el.style.zIndex = String(++top);
      }
      const dt = Math.max(1, e.timeStamp - lastT);
      s.vx = s.vx * 0.5 + ((e.clientX - lastX) / dt) * 16 * 0.5;
      s.vy = s.vy * 0.5 + ((e.clientY - lastY) / dt) * 16 * 0.5;
      lastX = e.clientX;
      lastY = e.clientY;
      lastT = e.timeStamp;
      s.x = e.clientX - down.ox;
      s.y = e.clientY - down.oy;
      s.tilt += (Math.max(-12, Math.min(12, s.vx * 1.1)) - s.tilt) * 0.3;
      apply(el, s);
    });
    const release = () => {
      if (!down) return;
      down = null;
      if (dragged) {
        el.classList.remove('is-dragging');
        settle(el, false);
      }
    };
    el.addEventListener('pointerup', release);
    el.addEventListener('pointercancel', release);
    // A click after a drag is swallowed. A plain click opens the post, but a beat later, so the
    // first click of a double-click (which sends the card home) does not open it too. Modifier
    // clicks keep their native meaning.
    let clickTimer = 0;
    el.addEventListener(
      'click',
      (e) => {
        if (dragged) {
          e.preventDefault();
          e.stopPropagation();
          dragged = false;
          return;
        }
        if (e.ctrlKey || e.metaKey || e.shiftKey || e.altKey) return;
        e.preventDefault();
        clearTimeout(clickTimer);
        clickTimer = setTimeout(() => window.open(el.href, '_blank', 'noopener'), 230);
      },
      true,
    );
    el.addEventListener('dblclick', (e) => {
      e.preventDefault();
      clearTimeout(clickTimer);
      settle(el, true);
      el.style.zIndex = '';
    });
    el.addEventListener('keydown', (e) => {
      const s = get(el),
        d = 16;
      if (e.key === 'ArrowLeft') s.x -= d;
      else if (e.key === 'ArrowRight') s.x += d;
      else if (e.key === 'ArrowUp') s.y -= d;
      else if (e.key === 'ArrowDown') s.y += d;
      else if (e.key === 'Home') {
        e.preventDefault();
        settle(el, true);
        el.style.zIndex = '';
        return;
      } else return;
      e.preventDefault();
      cancelAnimationFrame(s.raf);
      s.raf = 0;
      apply(el, s);
    });
  });
  return () => {
    collage.classList.remove('is-draggable');
    cards.forEach((el) => {
      const s = state.get(el);
      if (s) cancelAnimationFrame(s.raf);
      el.classList.remove('is-dragging');
      ['--dx', '--dy', '--tilt'].forEach((p) => el.style.removeProperty(p));
      el.style.zIndex = '';
    });
  };
});
