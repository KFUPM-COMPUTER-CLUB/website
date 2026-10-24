import type { APIRoute } from 'astro';
import { getPosts } from '../lib/content';
/* /sitemap.xml: the public pages and every published post, for search engines. Referenced from public/robots.txt. */
const PAGES = ['/', '/timeline', '/blog', '/community', '/leaderboard', '/faq', '/privacy', '/terms'];
const esc = (s: string) =>
  s.replace(/[<>&"']/g, (c) => ({ '<': '&lt;', '>': '&gt;', '&': '&amp;', '"': '&quot;', "'": '&apos;' })[c]!);
const url = (loc: string, lastmod?: Date) =>
  `<url><loc>${esc(loc)}</loc>${lastmod ? `<lastmod>${lastmod.toISOString().slice(0, 10)}</lastmod>` : ''}</url>`;
export const GET: APIRoute = async ({ site }) => {
  const origin = site?.origin || '';
  const posts = await getPosts();
  const urls = [
    ...PAGES.map((path) => url(`${origin}${path}`)),
    ...posts.map((p) => url(`${origin}/blog/${encodeURIComponent(p.slug)}`, p.date)),
  ].join('');
  const xml = `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${urls}</urlset>`;
  return new Response(xml, {
    headers: { 'Content-Type': 'application/xml; charset=utf-8', 'Cache-Control': 'public, max-age=300' },
  });
};
