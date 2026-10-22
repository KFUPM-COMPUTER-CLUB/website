/* Page lifecycle for every script on the site.
 *
 *   import { onPage } from './page.js';
 *   onPage(() => { ...set up...; return () => { ...tear down... }; });
 *
 * `init` runs once the page is ready, and again after every client-side navigation (Astro view
 * transitions swap the document without reloading). The cleanup it returns runs before the page is
 * swapped out, so listeners on window/document and animation loops do not pile up. Without the view
 * transitions router on the page (older builds, previews), init simply runs once. */
const hasRouter = () => !!document.querySelector('meta[name="astro-view-transitions-enabled"]');

export function onPage(init) {
  let cleanup = null, ran = false, navigated = false;
  const stop = () => { if (cleanup) { try { cleanup(); } catch (e) { console.error(e); } cleanup = null; } };
  const run = () => { stop(); ran = true; try { const r = init(); if (typeof r === 'function') cleanup = r; } catch (e) { console.error(e); } };
  // First run as soon as the DOM is parsed (module scripts are deferred, so usually right now).
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', run, { once: true }); else run();
  if (hasRouter()) {
    // The router fires page-load at window.load too; skip that one, the page already ran.
    document.addEventListener('astro:before-swap', stop);
    document.addEventListener('astro:after-swap', () => { navigated = true; });
    document.addEventListener('astro:page-load', () => { if (!navigated && ran) return; navigated = false; run(); });
  }
}

/* Shared media checks. Call at init time, not at module load, so they reflect the current page. */
export const reduceMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;
export const finePointer = () => window.matchMedia('(pointer: fine)').matches;

/* `listen(target, type, fn, opts)` returns an unsubscribe function; collect them with `bag()`:
 *   const off = bag(); off.add(listen(window, 'scroll', fn, { passive: true })); return off.flush; */
export const listen = (t, type, fn, opts) => { t.addEventListener(type, fn, opts); return () => t.removeEventListener(type, fn, opts); };
export const bag = () => { const fns = []; return { add: (f) => { if (f) fns.push(f); }, flush: () => { fns.splice(0).forEach((f) => f()); } }; };

/* Internal links set from scripts. In production this returns the path untouched. In a static preview
 * bundle, where the pages live in folders and root-relative URLs do not resolve, the site-root meta
 * has been rewritten to a relative path and the link is built from it. */
export const siteHref = (path) => {
  const meta = document.querySelector('meta[name="site-root"]');
  const content = meta?.getAttribute('content') || '/';
  if (content === '/') return path;
  const root = new URL(content, location.href).href.replace(/index\.html$/, '');
  const [pathPart, hash = ''] = path.replace(/^\//, '').split('#');
  const [pp, query = ''] = pathPart.split('?');
  const file = pp === '' ? 'index.html' : /\.[a-z0-9]+$/i.test(pp) ? pp : `${pp.replace(/\/$/, '')}/index.html`;
  return `${root}${file}${query ? `?${query}` : ''}${hash ? `#${hash}` : ''}`;
};
