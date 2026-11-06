import type { APIRoute } from 'astro';
import { getPosts } from '../lib/content';
import { localePath } from '../lib/i18n';
/* /sitemap.xml: the public pages in English and Arabic, and every published post, for search engines.
 * Referenced from public/robots.txt. Each page lists its other-language twin (hreflang), matching BaseLayout. */
const PAGES = ['/', '/timeline', '/blog', '/community', '/leaderboard', '/faq', '/privacy', '/terms'];
const esc = (s: string) =>
  s.replace(/[<>&"']/g, (c) => ({ '<': '&lt;', '>': '&gt;', '&': '&amp;', '"': '&quot;', "'": '&apos;' })[c]!);
const url = (loc: string, lastmod?: Date, alternates = '') =>
  `<url><loc>${esc(loc)}</loc>${alternates}${lastmod ? `<lastmod>${lastmod.toISOString().slice(0, 10)}</lastmod>` : ''}</url>`;
const alt = (lang: string, href: string) => `<xhtml:link rel="alternate" hreflang="${lang}" href="${esc(href)}"/>`;
export const GET: APIRoute = async ({ site }) => {
  const origin = site?.origin || '';
  const posts = await getPosts();
  const urls = [
    ...PAGES.flatMap((path) => {
      const en = `${origin}${path}`;
      const ar = `${origin}${localePath('ar', path)}`;
      const alternates = alt('en', en) + alt('ar', ar) + alt('x-default', en);
      return [url(en, undefined, alternates), url(ar, undefined, alternates)];
    }),
    ...posts.map((p) => url(`${origin}/blog/${encodeURIComponent(p.slug)}`, p.date)),
  ].join('');
  const xml = `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">${urls}</urlset>`;
  return new Response(xml, {
    headers: { 'Content-Type': 'application/xml; charset=utf-8', 'Cache-Control': 'public, max-age=300' },
  });
};
