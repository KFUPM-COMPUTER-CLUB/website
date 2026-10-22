/* Header: the menu toggle on small screens, and the bar's background once the page is scrolled
 * (over a pinned hero it stays transparent until the hero is covered). */
import { onPage, listen, bag } from './page.js';

onPage(() => {
  const off = bag();
  const toggle = document.querySelector('.nav-toggle');
  const nav = document.getElementById('site-nav');
  const body = document.body;
  const setOpen = (open) => {
    body.classList.toggle('nav-open', open);
    toggle?.setAttribute('aria-expanded', String(open));
    toggle?.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
  };
  setOpen(false);
  toggle?.addEventListener('click', () => setOpen(!body.classList.contains('nav-open')));
  off.add(
    listen(document, 'keydown', (e) => {
      if (e.key === 'Escape' && body.classList.contains('nav-open')) {
        setOpen(false);
        toggle?.focus();
      }
    }),
  );
  nav?.querySelectorAll('a').forEach((a) => a.addEventListener('click', () => setOpen(false)));
  const wide = window.matchMedia('(min-width: 1024px)');
  off.add(
    listen(wide, 'change', (e) => {
      if (e.matches) setOpen(false);
    }),
  );

  const hero = document.querySelector('[data-hero]');
  const headerH = () => document.querySelector('.site-header')?.offsetHeight || 72;
  const onScroll = () => {
    const y = window.scrollY;
    body.classList.toggle('scrolled', y > 8);
    body.classList.toggle('past-hero', hero ? y >= hero.offsetHeight - headerH() : y > 8);
  };
  onScroll();
  off.add(listen(window, 'scroll', onScroll, { passive: true }));
  off.add(listen(window, 'resize', onScroll));
  return () => {
    off.flush();
    body.classList.remove('nav-open', 'scrolled', 'past-hero');
  };
});
