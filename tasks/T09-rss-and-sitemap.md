# T09 · RSS feed and sitemap

| Owner | Needs first | Labels |
|---|---|---|
| **Member 1 — Lead developer** | T05 | who: member-1, type: feature, P1 |

## Steps
1. `npm install @astrojs/rss` and `npx astro add sitemap` (answer **yes**).
2. `src/pages/rss.xml.js`:
   ```js
   import rss from '@astrojs/rss';
   import { getCollection } from 'astro:content';
   export async function GET(context) {
     const posts = (await getCollection('posts', ({ data }) => !data.draft))
       .sort((a, b) => b.data.date - a.data.date);
     return rss({
       title: 'KFUPM Computer Club',
       description: 'News, events and stories from the CC community',
       site: context.site,
       items: posts.map((p) => ({ title: p.data.title, pubDate: p.data.date, description: p.data.excerpt, link: `/news/${p.id}/` })),
     });
   }
   ```
3. In `BaseLayout.astro` `<head>`: `<link rel="alternate" type="application/rss+xml" title="CC News" href="/rss.xml">` and `<link rel="sitemap" href="/sitemap-index.xml">`.
4. Add an "RSS" link in the footer.

## Done when
- `/rss.xml` on the preview passes [validator.w3.org/feed](https://validator.w3.org/feed/)
- `/sitemap-index.xml` lists all pages

---
**How to submit:** branch → commit → pull request with `Closes #<issue number>` (full steps in [CONTRIBUTING.md](../CONTRIBUTING.md)). Stuck for 30 minutes? Comment on the issue and tag Manager 1.
