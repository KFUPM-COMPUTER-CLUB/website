/* Terminal overlay. A bottom sheet with a prompt that answers a handful of commands from the site's
 * own data (events, impact, partners, site copy), inlined as JSON by Terminal.astro. Opens with ` or /
 * outside form fields, or from any element with data-term-open; closes with Escape, "exit" or its close
 * button, and hands focus back to whatever had it. History lives in sessionStorage; Tab completes
 * command names; Ctrl+L clears. A few commands are not listed by help: they are part of the site
 * challenge (ls -a, cat .flag), so do not tidy them away. Same for the "sudo rm -rf /" easter egg. */
import { onPage, reduceMotion, listen, bag, siteHref } from './page.js';

const FLAG_B64 = 'Q0N7d2gzcjNfY3VyMTB1c19tMW5kc19idTFsZH0='; // the flag, base64; decoding it is the last step
const HIST_KEY = 'cc_term_hist',
  HIST_MAX = 50,
  OUT_MAX = 400;
const PROMPT = 'guest@cckfupm:~$';

/* Easter egg: the "wipe everything" command fakes a wipe, then closes the tab. */
const WIPE_COMMANDS = new Set(['sudo rm -rf /', 'sudo rm -rf / --no-preserve-root']);
const WIPE_LINES = [
  'rm: removing /home ...',
  'rm: removing /usr ...',
  'rm: removing /var/www/cckfupm ...',
  'rm: removing /etc ...',
  'rm: removing /boot ...',
  'kernel panic - not syncing: attempted to kill init!',
];

const COMMANDS = [
  ['help', 'list the commands'],
  ['about', 'what the club is'],
  ['events', 'what is coming up (events --past for earlier ones)'],
  ['join', 'open the join page'],
  ['impact', 'prize pools by semester'],
  ['partners', 'who we build with'],
  ['whoami', 'who you are'],
  ['clear', 'clear the screen'],
  ['exit', 'close the terminal'],
];
const PAGES = { home: '/', timeline: '/timeline', blog: '/blog', officers: '/officers', faq: '/faq', flag: '/flag' };
const FILES = {
  about: 'What the club is. Run: about',
  events: 'Upcoming and past events from the Timeline. Run: events',
  impact: 'Prize pools by semester, as announced. Run: impact',
  join: 'The join link. Run: join',
  partners: 'Companies and campus friends. Run: partners',
};

/* sessionStorage can throw (private mode, blocked storage); the terminal must not care. */
const store = {
  get(k) {
    try {
      return sessionStorage.getItem(k);
    } catch {
      return null;
    }
  },
  set(k, v) {
    try {
      sessionStorage.setItem(k, v);
    } catch {
      /* ignore */
    }
  },
};
const local = (k) => {
  try {
    return localStorage.getItem(k);
  } catch {
    return null;
  }
};

const pad2 = (n) => String(n).padStart(2, '0');
const todayISO = () => {
  const d = new Date();
  return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
};
/* "2026-11-05" -> "Thu 5 Nov" (year added when it is not this year). Built from parts, so no timezone drift. */
const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const fmtDate = (iso) => {
  const [y, m, d] = iso.split('-').map(Number);
  const s = `${DAYS[new Date(y, m - 1, d).getDay()]} ${d} ${MONTHS[m - 1]}`;
  return y === new Date().getFullYear() ? s : `${s} ${y}`;
};
const sar = (n) => n.toLocaleString('en-US');
const dots = (label, width) => `${label} ${'.'.repeat(Math.max(3, width - label.length))}`;

/* True when typing into this element should not reach the page's shortcuts. */
const editable = (t) =>
  t instanceof Element && !!t.closest('input, textarea, select, [contenteditable]:not([contenteditable="false"])');

/* Navigate through a real anchor click so the view-transitions router can pick it up. */
const go = (url, blank) => {
  const a = document.createElement('a');
  a.href = blank ? url : siteHref(url);
  a.hidden = true;
  if (blank) {
    a.target = '_blank';
    a.rel = 'noopener';
  }
  document.body.appendChild(a);
  a.click();
  a.remove();
};

onPage(() => {
  const root = document.querySelector('[data-terminal]');
  if (!root) return; // page without the terminal: nothing to do

  const out = root.querySelector('[data-term-out]');
  const form = root.querySelector('[data-term-form]');
  const input = root.querySelector('[data-term-input]');
  const mirror = root.querySelector('[data-term-mirror]');
  const cursor = root.querySelector('[data-term-cursor]');
  if (!out || !form || !input) return;

  let data = {
    events: [],
    impact: { semesters: [], total: 0, plus: false },
    partners: { companies: [], friends: [] },
    site: {},
  };
  try {
    const el = document.querySelector('[data-term-data]');
    if (el) data = { ...data, ...JSON.parse(el.textContent) };
  } catch (e) {
    console.error(e);
  }

  const off = bag();
  const reduce = reduceMotion();
  const vv = window.visualViewport;
  let opener = null,
    welcomed = false,
    closeTimer = 0,
    navTimer = 0;
  let hist = [];
  try {
    hist = JSON.parse(store.get(HIST_KEY) || '[]');
  } catch {
    hist = [];
  }
  if (!Array.isArray(hist)) hist = [];
  let hix = hist.length,
    draft = '';

  /* ---- output ---- */
  const print = (text, kind = 'out') => {
    for (const line of Array.isArray(text) ? text : [text]) {
      const row = document.createElement('div');
      row.className = `terminal__row terminal__row--${kind}`;
      row.textContent = line;
      out.appendChild(row);
    }
    while (out.childElementCount > OUT_MAX) out.firstElementChild.remove();
    out.scrollTop = out.scrollHeight;
  };
  const sys = (t) => print(t, 'sys');
  const err = (t) => print(t, 'err');
  const clear = () => {
    out.replaceChildren();
  };

  /* Block cursor follows the caret: the mirror holds the text before the caret, the cursor sits at its width. */
  const place = () => {
    if (!mirror || !cursor) return;
    const at = input.selectionStart ?? input.value.length;
    mirror.textContent = input.value.slice(0, at);
    cursor.style.setProperty('--cx', `${mirror.offsetWidth}px`);
  };

  /* ---- open / close ---- */
  const isOpen = () => root.classList.contains('is-open');
  /* On phones the keyboard shrinks the visual viewport; keep the sheet above it and within 46% of what is left. */
  const fit = () => {
    if (!vv || !isOpen()) {
      root.style.bottom = '';
      root.style.maxHeight = '';
      return;
    }
    const gap = Math.max(0, Math.round(window.innerHeight - vv.height - vv.offsetTop));
    root.style.bottom = `${gap}px`;
    root.style.maxHeight = `${Math.round(vv.height * 0.46)}px`;
  };
  const open = () => {
    if (isOpen()) {
      input.focus({ preventScroll: true });
      return;
    }
    clearTimeout(closeTimer);
    opener = document.activeElement;
    root.hidden = false;
    document.body.classList.add('terminal-open');
    if (reduce) root.classList.add('is-open');
    else {
      void root.offsetHeight;
      root.classList.add('is-open');
    } // reflow first so the slide runs
    if (!welcomed) {
      welcomed = true;
      sys('KFUPM Computer Club terminal. Type help.');
    }
    fit();
    input.focus({ preventScroll: true });
    place();
  };
  const close = () => {
    if (!isOpen()) return;
    root.classList.remove('is-open');
    document.body.classList.remove('terminal-open');
    const done = () => {
      root.hidden = true;
      root.style.bottom = '';
      root.style.maxHeight = '';
    };
    if (reduce) done();
    else closeTimer = setTimeout(done, 220);
    const back =
      opener && opener !== document.body && opener.isConnected && typeof opener.focus === 'function' ? opener : null;
    opener = null;
    if (back) back.focus({ preventScroll: true });
    else input.blur();
  };

  /* ---- commands ---- */
  const eventLine = (e) => {
    const when = e.endDate && e.endDate !== e.date ? `${fmtDate(e.date)} to ${fmtDate(e.endDate)}` : fmtDate(e.date);
    return [when, e.time, e.title, e.location].filter(Boolean).join(' · ');
  };
  const cmdEvents = (args) => {
    const today = todayISO();
    const past = data.events.filter((e) => (e.endDate || e.date) < today).reverse();
    if (args.includes('--past')) {
      if (!past.length) return sys('No past events in the data yet.');
      print('Past events:');
      return print(past.slice(0, 8).map(eventLine));
    }
    const next = data.events.filter((e) => (e.endDate || e.date) >= today).slice(0, 6);
    if (next.length) {
      print('Upcoming:');
      print(next.map(eventLine));
      return sys('Full list with calendar links: /timeline');
    }
    sys('Nothing scheduled right now. Follow @KFUPM_CC for the next announcement.');
    if (past.length) {
      print('Last ones:');
      print(past.slice(0, 3).map(eventLine));
    }
  };
  const cmdImpact = () => {
    const sems = data.impact.semesters || [];
    if (!sems.length) return sys('No prize data yet.');
    const w = Math.max(...sems.map((s) => s.term.length), 5) + 3;
    print(
      sems.map(
        (s) =>
          `${dots(s.term, w)} ${s.total_sar == null ? 'not announced' : `${sar(s.total_sar)}${s.min ? '+' : ''} SAR`}`,
      ),
    );
    print(`${dots('Total', w)} ${sar(data.impact.total || 0)}${data.impact.plus ? '+' : ''} SAR`);
    sys('Prize pools as announced on X. The Impact section on the home page has the events behind each number.');
  };
  const cmdPartners = () => {
    const { companies = [], friends = [] } = data.partners;
    print('Companies:');
    print(`  ${companies.join(', ')}`);
    print('Friends on campus:');
    print(`  ${friends.join(', ')}`);
  };
  const cmdWhoami = () => {
    if (local('cc_solved') === '1')
      return print('solver. You read the console, the source and the terminal. Welcome to the list.');
    print('guest. A curious mind at KFUPM. Any major, any year.');
  };
  const cmdLs = (args) => {
    const all = args.some((a) => /^-[a-z]*a[a-z]*$/i.test(a));
    print(`${all ? '.flag  ' : ''}about  events  impact  join  partners`);
  };
  const cmdCat = (args) => {
    const name = args[0];
    if (!name) return err('cat: missing file name');
    if (name === '.flag') {
      print(FLAG_B64);
      return sys('clue 3/3: decode it (base64), then bring it to /flag. Tip: open flag');
    }
    if (FILES[name]) return print(FILES[name]);
    err(`cat: ${name}: No such file`);
  };
  const cmdOpen = (args) => {
    const key = (args[0] || '').toLowerCase().replace(/^\//, '') || 'home';
    const url = PAGES[key];
    if (!url) return err(`open: ${key}: no such page. Try timeline, blog, officers, faq or home.`);
    sys(`Opening ${url}…`);
    navTimer = setTimeout(() => go(url), 350);
  };
  const cmdJoin = () => {
    const url = data.site.join || '/join';
    const blank = /^https?:/i.test(url);
    sys('Opening the join page…');
    if (blank) go(url, true);
    else navTimer = setTimeout(() => go(url), 350);
  };

  /* Print fake rm output line by line, then try to close the tab. Browsers only let a script close tabs
   * it opened, so if the tab is still here a moment later, blank it instead. */
  const cmdWipe = () => {
    input.disabled = true;
    let i = 0;
    const step = () => {
      if (i < WIPE_LINES.length) {
        err(WIPE_LINES[i++]);
        navTimer = setTimeout(step, reduce ? 0 : 160);
        return;
      }
      const bye = () => {
        window.close();
        navTimer = setTimeout(() => location.replace('about:blank'), 250);
      };
      navTimer = setTimeout(bye, reduce ? 0 : 500);
    };
    step();
  };

  const run = (raw) => {
    const line = raw.trim();
    print(`${PROMPT} ${line}`, 'cmd');
    if (!line) return;
    hist = hist
      .filter((h) => h !== line)
      .concat(line)
      .slice(-HIST_MAX);
    store.set(HIST_KEY, JSON.stringify(hist));
    hix = hist.length;
    draft = '';
    const [word, ...args] = line.split(/\s+/);
    const cmd = word.toLowerCase();
    switch (cmd) {
      case 'help':
        return print(COMMANDS.map(([c, d]) => `${c.padEnd(10)}${d}`));
      case 'about':
        return print([data.site.name || 'KFUPM Computer Club', data.site.intro, data.site.description].filter(Boolean));
      case 'events':
        return cmdEvents(args);
      case 'join':
        return cmdJoin();
      case 'impact':
        return cmdImpact();
      case 'partners':
        return cmdPartners();
      case 'whoami':
        return cmdWhoami();
      case 'clear':
        return clear();
      case 'exit':
        return close();
      case 'ls':
        return cmdLs(args);
      case 'cat':
        return cmdCat(args);
      case 'sudo':
        if (WIPE_COMMANDS.has(line.split(/\s+/).join(' '))) return cmdWipe();
        return err('guest is not in the sudoers file. This incident will be reported.');
      case '404':
        err('segfault (core dumped)');
        navTimer = setTimeout(() => go('/404.html'), 350);
        return;
      case 'open':
        return cmdOpen(args);
      case 'echo':
        return print(args.join(' '));
      default:
        return err(`${cmd}: command not found, try help`);
    }
  };

  /* ---- keys ---- */
  off.add(
    listen(form, 'submit', (e) => {
      e.preventDefault();
      const v = input.value;
      input.value = '';
      place();
      run(v);
    }),
  );
  off.add(
    listen(input, 'keydown', (e) => {
      if (e.key === 'ArrowUp' || e.key === 'ArrowDown') {
        if (!hist.length) return;
        e.preventDefault();
        if (hix === hist.length) draft = input.value;
        hix = e.key === 'ArrowUp' ? Math.max(0, hix - 1) : Math.min(hist.length, hix + 1);
        input.value = hix === hist.length ? draft : hist[hix];
        input.setSelectionRange(input.value.length, input.value.length);
        place();
      } else if (e.key === 'Tab' && !e.shiftKey && input.value && !input.value.includes(' ')) {
        // Complete a command name; with nothing typed, Tab moves focus on as usual.
        const typed = input.value.toLowerCase();
        const hits = COMMANDS.map(([c]) => c).filter((c) => c.startsWith(typed));
        if (!hits.length) return;
        e.preventDefault();
        if (hits.length === 1) {
          input.value = `${hits[0]} `;
          place();
        } else sys(hits.join('  '));
      } else if (e.key === 'l' && e.ctrlKey && !e.metaKey && !e.altKey) {
        e.preventDefault();
        clear();
      }
    }),
  );
  for (const t of ['input', 'keyup', 'click', 'select']) off.add(listen(input, t, place));
  off.add(
    listen(document, 'selectionchange', () => {
      if (document.activeElement === input) place();
    }),
  );

  off.add(
    listen(document, 'keydown', (e) => {
      if (e.key === 'Escape') {
        if (isOpen()) {
          e.preventDefault();
          close();
        }
        return;
      }
      if ((e.key === '`' || e.key === '/') && !e.ctrlKey && !e.metaKey && !e.altKey && !editable(e.target)) {
        e.preventDefault();
        open();
      }
    }),
  );
  off.add(
    listen(document, 'click', (e) => {
      const t = e.target instanceof Element ? e.target : null;
      if (!t) return;
      if (t.closest('[data-term-open]')) {
        e.preventDefault();
        open();
      } else if (t.closest('[data-term-close]')) {
        e.preventDefault();
        close();
      }
    }),
  );
  if (vv) off.add(listen(vv, 'resize', fit));

  return () => {
    clearTimeout(closeTimer);
    clearTimeout(navTimer);
    document.body.classList.remove('terminal-open');
    off.flush();
  };
});
