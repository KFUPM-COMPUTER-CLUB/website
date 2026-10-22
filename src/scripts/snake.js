/* Snake for the 404 page. A 20x20 board on a canvas that is sized to whole device pixels per cell,
 * so it stays crisp on retina screens. Arrows or WASD steer, Space or Enter starts, pauses and
 * retries, a swipe on the board steers on touch screens and a tap starts. The frame loop runs only
 * while a game is in play: idle, paused and game-over are single static frames, and the loop stops
 * when the tab is hidden or the page is swapped out. Nothing blinks or flashes, so reduced motion
 * needs no special case. */
import { onPage, listen, bag } from './page.js';

const N = 20; // cells per side
const SWIPE = 24; // px of travel that counts as a swipe
const BEST_KEY = 'cc_snake_best';
const DIRS = { up: [0, -1], down: [0, 1], left: [-1, 0], right: [1, 0] };
const KEYS = {
  ArrowUp: 'up',
  ArrowDown: 'down',
  ArrowLeft: 'left',
  ArrowRight: 'right',
  w: 'up',
  s: 'down',
  a: 'left',
  d: 'right',
  W: 'up',
  S: 'down',
  A: 'left',
  D: 'right',
};
const C = {
  board: '#0B1A33',
  grid: 'rgba(96,165,250,.08)',
  body: '#2563EB',
  head: '#60A5FA',
  food: '#FFFFFF',
  text: '#FFFFFF',
  muted: '#A1A1AA',
  band: 'rgba(11,26,51,.88)',
};

onPage(() => {
  const root = document.querySelector('[data-snake]');
  if (!root) return;
  const board = root.querySelector('[data-snake-board]');
  const canvas = root.querySelector('[data-snake-canvas]');
  const scoreEl = root.querySelector('[data-snake-score]');
  const bestEl = root.querySelector('[data-snake-best]');
  const statusEl = root.querySelector('[data-snake-status]');
  const ctx = canvas.getContext('2d');
  const mono = getComputedStyle(document.documentElement).getPropertyValue('--font-mono').trim() || 'monospace';
  const off = bag();

  // Best score survives reloads. Storage can be blocked, so every access is guarded.
  const loadBest = () => {
    try {
      return Math.max(0, parseInt(localStorage.getItem(BEST_KEY), 10) || 0);
    } catch {
      return 0;
    }
  };
  const saveBest = (n) => {
    try {
      localStorage.setItem(BEST_KEY, String(n));
    } catch {
      /* private mode, fine */
    }
  };

  let phase = 'idle'; // idle | running | paused | over
  let snake = null,
    dir = DIRS.right,
    queue = [],
    food = null,
    score = 0,
    best = loadBest(),
    won = false;
  let dpr = 1,
    cell = 20,
    px = N * cell; // device-pixel cell size and canvas size
  let raf = 0,
    last = 0,
    acc = 0,
    dead = false;

  const say = (msg) => {
    statusEl.textContent = msg;
  };

  /* ── Sizing ─────────────────────────────── */
  // Whole device pixels per cell, so edges stay crisp. The board is measured at its CSS width,
  // then --snake-w shrinks the board and the score row to hug the canvas (plus the 1px borders).
  const fit = () => {
    dpr = Math.min(window.devicePixelRatio || 1, 3);
    root.style.removeProperty('--snake-w');
    cell = Math.max(4, Math.floor((board.clientWidth * dpr) / N));
    px = cell * N;
    canvas.width = canvas.height = px;
    canvas.style.width = canvas.style.height = `${px / dpr}px`;
    root.style.setProperty('--snake-w', `${px / dpr + 2}px`);
    draw();
  };

  /* ── Rules ──────────────────────────────── */
  // A fresh snake of three cells facing `d`, so the first move is always open.
  const reset = (d) => {
    const m = N >> 1;
    dir = d;
    queue = [];
    score = 0;
    won = false;
    acc = 0;
    last = 0;
    snake = [0, 1, 2].map((i) => ({ x: m - d[0] * i, y: m - d[1] * i }));
    food = spawn();
    scoreEl.textContent = '0';
  };
  const spawn = () => {
    const taken = new Set(snake.map((s) => s.y * N + s.x));
    const free = [];
    for (let i = 0; i < N * N; i++) if (!taken.has(i)) free.push(i);
    if (!free.length) return null;
    const i = free[Math.floor(Math.random() * free.length)];
    return { x: i % N, y: Math.floor(i / N) };
  };
  const cps = () => Math.min(15, 7 + score * 0.2); // cells per second: 7 at the start, +1 every five foods
  const step = () => {
    // Apply the first queued turn that is not a reversal into the body.
    while (queue.length) {
      const d = queue.shift();
      if (d[0] !== -dir[0] || d[1] !== -dir[1]) {
        dir = d;
        break;
      }
    }
    const head = { x: snake[0].x + dir[0], y: snake[0].y + dir[1] };
    const eats = !!food && head.x === food.x && head.y === food.y;
    // The tail moves away this tick unless the snake grows, so it cannot be hit.
    const solid = eats ? snake.length : snake.length - 1;
    const hit =
      head.x < 0 ||
      head.y < 0 ||
      head.x >= N ||
      head.y >= N ||
      snake.slice(0, solid).some((s) => s.x === head.x && s.y === head.y);
    if (hit) return end();
    snake.unshift(head);
    if (!eats) {
      snake.pop();
      return;
    }
    score++;
    scoreEl.textContent = String(score);
    if (score > best) {
      best = score;
      bestEl.textContent = String(best);
      saveBest(best);
    }
    food = spawn();
    if (!food) {
      won = true;
      end();
    }
  };

  /* ── Phases ─────────────────────────────── */
  const stop = () => {
    if (raf) cancelAnimationFrame(raf);
    raf = 0;
    last = 0;
  };
  const tick = (t) => {
    raf = 0;
    if (dead || phase !== 'running') return;
    if (last) acc += Math.min(t - last, 250); // a long stall (tab switch) is not a long move
    last = t;
    const dt = 1000 / cps();
    while (acc >= dt && phase === 'running') {
      acc -= dt;
      step();
    }
    draw();
    if (phase === 'running') raf = requestAnimationFrame(tick);
  };
  const start = (d = DIRS.right) => {
    reset(d);
    phase = 'running';
    say('Game on.');
    stop();
    raf = requestAnimationFrame(tick);
  };
  const end = () => {
    phase = 'over';
    stop();
    say(`${won ? 'Board full' : 'Game over'}. Score ${score}. Space to retry.`);
  };
  const pause = () => {
    if (phase !== 'running') return;
    phase = 'paused';
    stop();
    say('Paused.');
    draw();
  };
  const resume = () => {
    if (phase !== 'paused') return;
    phase = 'running';
    say('Resumed.');
    stop();
    raf = requestAnimationFrame(tick);
  };
  const toggle = () => {
    if (phase === 'running') pause();
    else if (phase === 'paused') resume();
    else start();
  };
  // A direction also starts or resumes, so the first key or swipe is never wasted.
  const steer = (name) => {
    const d = DIRS[name];
    if (!d) return;
    if (phase === 'idle' || phase === 'over') return start(d);
    if (phase === 'paused') resume();
    const lastD = queue.length ? queue[queue.length - 1] : dir;
    if (d === lastD || (d[0] === -lastD[0] && d[1] === -lastD[1])) return; // same way or straight back: ignore
    if (queue.length < 2) queue.push(d);
  };

  /* ── Drawing ────────────────────────────── */
  const box = (c, g) => ctx.fillRect(c.x * cell + g, c.y * cell + g, cell - 2 * g, cell - 2 * g);
  const draw = () => {
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.fillStyle = C.board;
    ctx.fillRect(0, 0, px, px);
    ctx.strokeStyle = C.grid;
    ctx.lineWidth = 1;
    ctx.beginPath();
    for (let i = 1; i < N; i++) {
      const p = i * cell + 0.5;
      ctx.moveTo(p, 0);
      ctx.lineTo(p, px);
      ctx.moveTo(0, p);
      ctx.lineTo(px, p);
    }
    ctx.stroke();
    if (snake) {
      const g = Math.max(1, Math.round(dpr)); // one CSS pixel of board between cells
      ctx.fillStyle = C.body;
      for (let i = snake.length - 1; i > 0; i--) box(snake[i], g);
      ctx.fillStyle = C.head;
      box(snake[0], g);
      if (food) {
        ctx.fillStyle = C.food;
        box(food, g);
      }
    }
    if (phase !== 'running') band();
  };
  // Static text band for idle, paused and over. Mono labels, upper case, letter-spaced like .mono.
  const band = () => {
    const lines =
      phase === 'idle'
        ? [['press space or swipe to start', false]]
        : phase === 'paused'
          ? [
              ['paused', true],
              ['space to resume', false],
            ]
          : [
              [`${won ? 'board full' : 'segfault'} — score ${score}`, true],
              ['space to retry', false],
            ];
    const lh = Math.round(22 * dpr),
      pad = Math.round(14 * dpr),
      h = lines.length * lh + pad * 2;
    ctx.fillStyle = C.band;
    ctx.fillRect(0, Math.round((px - h) / 2), px, h);
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    lines.forEach(([text, big], i) => {
      const size = Math.round((big ? 14 : 12) * dpr);
      ctx.font = `${big ? 700 : 600} ${size}px ${mono}`;
      try {
        ctx.letterSpacing = `${(size * 0.14).toFixed(1)}px`;
      } catch {
        /* older engines */
      }
      ctx.fillStyle = big ? C.text : C.muted;
      ctx.fillText(text.toUpperCase(), px / 2, (px - h) / 2 + pad + lh * (i + 0.5));
    });
  };

  /* ── Keyboard ───────────────────────────── */
  const focused = () => board.contains(document.activeElement);
  const typing = (t) =>
    t instanceof Element && !!t.closest('input, textarea, select, [contenteditable]:not([contenteditable="false"])');
  const grab = () => {
    if (!focused()) board.focus({ preventScroll: true });
  };
  off.add(
    listen(document, 'keydown', (e) => {
      delete board.dataset.pointer; // keyboard in use: the focus ring may show again
      if (e.altKey || e.ctrlKey || e.metaKey || typing(e.target)) return;
      const live = focused() || phase === 'running'; // steer from anywhere once a game is on
      const name = KEYS[e.key];
      if (name && live) {
        e.preventDefault();
        grab();
        steer(name);
        return;
      }
      if (e.target instanceof Element && e.target.closest('button, a')) return; // let controls keep Space/Enter
      if (e.key === ' ' && live) {
        e.preventDefault();
        grab();
        toggle();
        return;
      }
      if (e.key === 'Enter' && focused()) {
        e.preventDefault();
        toggle();
        return;
      }
      if (e.key === 'Escape') pause();
    }),
  );

  /* ── Pointer: tap starts, swipe steers, a long drag can turn more than once ── */
  let swipe = null;
  off.add(
    listen(board, 'pointerdown', (e) => {
      if (e.pointerType === 'mouse' && e.button !== 0) return;
      swipe = { id: e.pointerId, x: e.clientX, y: e.clientY, turned: false };
      try {
        board.setPointerCapture(e.pointerId);
      } catch {
        /* not supported */
      }
      // Focus so Space and arrows work right away. A script focus() would show the focus ring even
      // for a click or tap, so mark the pointer as the source; the CSS hides the ring until a key is used.
      board.dataset.pointer = '';
      board.focus({ preventScroll: true });
    }),
  );
  off.add(
    listen(board, 'pointermove', (e) => {
      if (!swipe || e.pointerId !== swipe.id) return;
      const dx = e.clientX - swipe.x,
        dy = e.clientY - swipe.y;
      if (Math.max(Math.abs(dx), Math.abs(dy)) < SWIPE) return;
      steer(Math.abs(dx) > Math.abs(dy) ? (dx > 0 ? 'right' : 'left') : dy > 0 ? 'down' : 'up');
      swipe.turned = true;
      swipe.x = e.clientX;
      swipe.y = e.clientY; // re-anchor for the next turn
    }),
  );
  const lift = (e) => {
    if (!swipe || e.pointerId !== swipe.id) return;
    const tap = !swipe.turned && e.type === 'pointerup';
    swipe = null;
    if (tap && phase !== 'running') toggle();
  };
  off.add(listen(board, 'pointerup', lift));
  off.add(listen(board, 'pointercancel', lift));
  root.querySelectorAll('[data-dir]').forEach((b) => off.add(listen(b, 'click', () => steer(b.dataset.dir))));

  /* ── Lifecycle ──────────────────────────── */
  off.add(listen(window, 'resize', fit));
  off.add(listen(window, 'blur', pause));
  off.add(
    listen(document, 'visibilitychange', () => {
      if (document.hidden) pause();
    }),
  );
  bestEl.textContent = String(best);
  fit();
  // The label font arrives after first paint; redraw the static frame once it is in.
  document.fonts
    ?.load(`600 12px ${mono}`)
    .then(() => {
      if (!dead && phase !== 'running') draw();
    })
    .catch(() => {});

  return () => {
    dead = true;
    stop();
    off.flush();
  };
});
