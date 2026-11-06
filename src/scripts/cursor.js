/* Flowing lines that trail the pointer. Twenty springy strands, each a chain of nodes that
 * follows the one before it, drawn as smooth curves in the headline's blue.
 * Home page first screen only. Desktop pointers only; off under reduced motion; paused while the tab is hidden. */
import { onPage, reduceMotion, finePointer, listen, bag } from './page.js';

onPage(() => {
  const hero = document.querySelector('[data-hero]');
  // Only on the home page, and only while the first screen is in view: it fades out as the navy screen covers the hero.
  if (!hero || !finePointer() || reduceMotion()) return;
  const off = bag();
  const S = { friction: 0.5, trails: 20, size: 50, dampening: 0.25, tension: 0.98 };
  const c = document.createElement('canvas');
  c.className = 'glow';
  c.setAttribute('aria-hidden', 'true');
  document.body.appendChild(c);
  const ctx = c.getContext('2d');
  // Drawn at the screen's pixel density (up to 2x) so the strands stay sharp.
  const dpr = Math.min(2, window.devicePixelRatio || 1);
  const fit = () => {
    c.width = Math.round(innerWidth * dpr);
    c.height = Math.round(innerHeight * dpr);
    c.style.width = `${innerWidth}px`;
    c.style.height = `${innerHeight}px`;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  };
  fit();
  off.add(listen(window, 'resize', fit));

  const pos = { x: innerWidth / 2, y: innerHeight / 2 };
  let started = false,
    hidden = false,
    dead = false;

  class Line {
    constructor(spring) {
      this.spring = spring + 0.1 * Math.random() - 0.05;
      this.friction = S.friction + 0.01 * Math.random() - 0.005;
      this.nodes = Array.from({ length: S.size }, () => ({ x: pos.x, y: pos.y, vx: 0, vy: 0 }));
    }
    update() {
      let e = this.spring,
        prev = this.nodes[0];
      prev.vx += (pos.x - prev.x) * e;
      prev.vy += (pos.y - prev.y) * e;
      for (let i = 0; i < this.nodes.length; i++) {
        const n = this.nodes[i];
        if (i > 0) {
          const p = this.nodes[i - 1];
          n.vx += (p.x - n.x) * e;
          n.vy += (p.y - n.y) * e;
          n.vx += p.vx * S.dampening;
          n.vy += p.vy * S.dampening;
        }
        n.vx *= this.friction;
        n.vy *= this.friction;
        n.x += n.vx;
        n.y += n.vy;
        e *= S.tension;
      }
    }
    draw() {
      const n = this.nodes;
      let x = n[0].x,
        y = n[0].y,
        i;
      ctx.beginPath();
      ctx.moveTo(x, y);
      for (i = 1; i < n.length - 2; i++) {
        x = (n[i].x + n[i + 1].x) / 2;
        y = (n[i].y + n[i + 1].y) / 2;
        ctx.quadraticCurveTo(n[i].x, n[i].y, x, y);
      }
      ctx.quadraticCurveTo(n[i].x, n[i].y, n[i + 1].x, n[i + 1].y);
      ctx.stroke();
    }
  }
  const lines = Array.from({ length: S.trails }, (_, i) => new Line(0.45 + (i / S.trails) * 0.025));

  off.add(
    listen(
      window,
      'pointermove',
      (e) => {
        pos.x = e.clientX;
        pos.y = e.clientY;
        if (!started) {
          started = true;
          lines.forEach((l) =>
            l.nodes.forEach((n) => {
              n.x = pos.x;
              n.y = pos.y;
            }),
          );
        }
      },
      { passive: true },
    ),
  );
  off.add(
    listen(document, 'visibilitychange', () => {
      hidden = document.hidden;
      if (!hidden && inView) requestAnimationFrame(tick);
    }),
  );

  // The loop only runs while the first screen is on screen; the canvas hides while it is stopped.
  let inView = true,
    heroH = hero.offsetHeight;
  off.add(listen(window, 'resize', () => (heroH = hero.offsetHeight)));
  const seen = new IntersectionObserver(([e]) => {
    const was = inView;
    inView = e.isIntersecting;
    c.style.visibility = inView ? '' : 'hidden';
    if (inView && !was && !hidden) requestAnimationFrame(tick);
  });
  seen.observe(hero);
  off.add(() => seen.disconnect());

  const toRgb = (v) => {
    const m = /^#?([0-9a-f]{6})$/i.exec(v.trim());
    return m ? [0, 2, 4].map((i) => parseInt(m[1].slice(i, i + 2), 16)) : [59, 130, 246];
  };
  let blue = [59, 130, 246],
    frame = 0;
  const readBlue = () => {
    const v = getComputedStyle(document.documentElement).getPropertyValue('--play-hl');
    blue = v ? toRgb(v) : [59, 130, 246];
  };

  const tick = () => {
    if (hidden || dead || !inView) return;
    ctx.clearRect(0, 0, innerWidth, innerHeight);
    const vis = Math.min(1, Math.max(0, 1 - window.scrollY / (heroH * 0.7)));
    if (frame++ % 60 === 0) readBlue();
    if (started && vis > 0) {
      // The blue of "build the future" (it follows the icon box's blue), light and see-through.
      ctx.strokeStyle = `rgba(${blue.join(', ')}, ${0.26 * vis})`;
      ctx.lineWidth = 1.15;
      for (const l of lines) {
        l.update();
        l.draw();
      }
    }
    requestAnimationFrame(tick);
  };
  requestAnimationFrame(tick);
  return () => {
    dead = true;
    off.flush();
    c.remove();
  };
});
