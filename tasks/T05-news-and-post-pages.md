# T05 · News list page and single post page

| Owner | Needs first | Labels |
|---|---|---|
| **Lead developer** | T01, T04 | role: lead-dev, type: feature, P0 |

## Steps
1. `src/pages/news/index.astro`:
   - `const posts = (await getCollection('posts', ({ data }) => !data.draft)).sort((a, b) => b.data.date - a.data.date);`
   - Each post as a row: date (`toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })`), title, author, category, excerpt, "Read →" link to `/news/${post.id}`.
   - Category filter buttons (All + the 7 categories) and a search box. Put `data-category`, `data-search` (title + excerpt + author, lowercase) on each row. A `<script>` hides rows that don't match. No libraries.
   - Read `?author=` and `?tag=` from the URL in the same script and filter by them.
2. `src/pages/news/[slug].astro`:
   ```astro
   ---
   import { getCollection, render } from 'astro:content';
   import BaseLayout from '../../layouts/BaseLayout.astro';
   export async function getStaticPaths() {
     const posts = await getCollection('posts', ({ data }) => !data.draft);
     return posts.map((post) => ({ params: { slug: post.id }, props: { post } }));
   }
   const { post } = Astro.props;
   const { Content } = await render(post);
   const minutes = Math.max(1, Math.round(post.body.split(/\s+/).length / 200));
   ---
   ```
   - Show: category, title, `author` (link to `/news?author=…`), date, "{minutes} min read", cover image if present, then `<article class="prose"><Content /></article>`.
   - Tags as links to `/news?tag=…`.
   - Share links (plain `<a>`): X `https://twitter.com/intent/tweet?url=…&text=…`, LinkedIn `https://www.linkedin.com/sharing/share-offsite/?url=…`, WhatsApp `https://wa.me/?text=…`, plus a "Copy link" button (`navigator.clipboard.writeText`).
   - Previous / next post links at the bottom.
   - `BaseLayout` title = post title, description = excerpt.

## Done when
- Both sample posts open at `/news/<file-name>` and look right on phone
- Search, category, author and tag filters work
- Headings, lists, images, quotes and code blocks in a post look good (styles from T02 `.prose`)

---
**How to submit:** branch → commit → pull request with `Closes #<issue number>` (full steps in [CONTRIBUTING.md](../CONTRIBUTING.md)). Stuck for 30 minutes? Comment on the issue and tag Adib.
