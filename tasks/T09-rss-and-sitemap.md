# T09 · RSS feed and sitemap

| Owner | Prerequisites | Labels |
|---|---|---|
| Lead developer | T05 | role: lead-dev, type: feature, P1 |

## Objective

Publish an RSS feed of the articles and an XML sitemap of all pages, for feed readers and search engines.

## Procedure

1. Install the packages: `npm install @astrojs/rss` and `npx astro add sitemap` (answer **yes** to the prompts).
2. Create `src/pages/rss.xml.js`:
   ```js
   import rss from '@astrojs/rss';
   import { getCollection } from 'astro:content';
   export async function GET(context) {
     const posts = (await getCollection('posts', ({ data }) => !data.draft))
       .sort((a, b) => b.data.date.valueOf() - a.data.date.valueOf());
     return rss({
       title: 'KFUPM Computer Club',
       description: 'News, events and stories from the CC community',
       site: context.site,
       items: posts.map((p) => ({ title: p.data.title, pubDate: p.data.date, description: p.data.excerpt, link: `/news/${p.id}/` })),
     });
   }
   ```
3. In the `<head>` of `BaseLayout.astro`, add `<link rel="alternate" type="application/rss+xml" title="CC News" href="/rss.xml">` and `<link rel="sitemap" href="/sitemap-index.xml">`.
4. Add an "RSS" link to the footer.

## Acceptance criteria

- `/rss.xml` on the preview deployment passes [validator.w3.org/feed](https://validator.w3.org/feed/).
- `/sitemap-index.xml` lists every page.

## Submission

Branch, commit, and open a pull request containing `Closes #<issue number>`. The full procedure is in [CONTRIBUTING.md](../CONTRIBUTING.md). If you are blocked for more than 30 minutes, comment on the issue and mention your mentor, **@YKrishna17** (Yogesh).
