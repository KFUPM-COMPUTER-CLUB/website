import type { APIRoute } from 'astro';
import { getPosts } from '../lib/content';
const esc = (s: string) => s.replace(/[<>&"]/g, (c) => ({ '<': '&lt;', '>': '&gt;', '&': '&amp;', '"': '&quot;' })[c]!);
export const GET: APIRoute = async ({ site }) => {
  const origin = site?.origin || '';
  const posts = await getPosts();
  const items = posts
    .map(
      (p) =>
        `<item><title>${esc(p.title)}</title><link>${origin}/blog/${p.slug}</link><guid>${origin}/blog/${p.slug}</guid><pubDate>${p.date.toUTCString()}</pubDate><description>${esc(p.excerpt)}</description><author>${esc(p.authorName)}</author>${p.category ? `<category>${esc(p.category)}</category>` : ''}</item>`,
    )
    .join('');
  const xml = `<?xml version="1.0" encoding="UTF-8"?><rss version="2.0"><channel><title>KFUPM Computer Club</title><link>${origin}/blog</link><description>Written by members of the KFUPM Computer Club.</description>${items}</channel></rss>`;
  return new Response(xml, {
    headers: { 'Content-Type': 'application/rss+xml; charset=utf-8', 'Cache-Control': 'public, max-age=300' },
  });
};
