/* Flowing lines that trail the pointer. Twenty springy strands, each a chain of nodes that
 * follows the one before it, drawn as smooth curves in the club blue with a slow hue drift.
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
  const fit = () => {
    c.width = innerWidth;
    c.height = innerHeight;
  };
  fit();
  off.add(listen(window, 'resize', fit));

  const pos = { x: innerWidth / 2, y: innerHeight / 2 };
  let started = false,
    hidden = false,
    dead = false;
  const hue = {
    phase: Math.random() * Math.PI * 2,
    update() {
      this.phase += 0.0015;
      return 218 + Math.sin(this.phase) * 12;
    },
  };

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
  const isLight = () => parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--t') || '0') < 0.5;

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
      if (!hidden) requestAnimationFrame(tick);
    }),
  );

  const tick = () => {
    if (hidden || dead) return;
    ctx.globalCompositeOperation = 'source-over';
    ctx.clearRect(0, 0, c.width, c.height);
    const vis = Math.min(1, Math.max(0, 1 - window.scrollY / (hero.offsetHeight * 0.7)));
    if (started && vis > 0) {
      const light = isLight();
      const h = Math.round(hue.update());
      ctx.globalCompositeOperation = light ? 'source-over' : 'lighter';
      ctx.strokeStyle = light ? `hsla(${h}, 85%, 48%, ${0.22 * vis})` : `hsla(${h}, 90%, 62%, ${0.2 * vis})`;
      ctx.lineWidth = 1;
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
