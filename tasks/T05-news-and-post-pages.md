# T05 · News list page and article page

| Owner | Prerequisites | Labels |
|---|---|---|
| Lead developer | T01, T04 | role: lead-dev, type: feature, P0 |

## Objective

Build the article index at `/news` with client-side filtering, and the article page at `/news/<slug>` with metadata, sharing links, and navigation between articles.

## Procedure

### 1. `src/pages/news/index.astro`

- Load the posts, excluding drafts, newest first:
  ```ts
  const posts = (await getCollection('posts', ({ data }) => !data.draft))
    .sort((a, b) => b.data.date.valueOf() - a.data.date.valueOf());
  ```
  Use `.valueOf()` so that `astro check` passes.
- Render each post as a row: date (`toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })`), title, author, category, excerpt, and a "Read →" link to `/news/${post.id}`.
- Add category filter buttons (All plus the seven categories) and a search box. Give each row `data-category` and `data-search` (title, excerpt, and author in lower case). A `<script>` hides rows that do not match. No libraries.
- In the same script, read `?author=` and `?tag=` from the URL and apply them as filters.

### 2. `src/pages/news/[slug].astro`

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

- Display the category, title, author (linked to `/news?author=…`), date, reading time, and the cover image when present, followed by `<article class="prose"><Content /></article>`.
- Render tags as links to `/news?tag=…`.
- Sharing links as plain anchors: X (`https://twitter.com/intent/tweet?url=…&text=…`), LinkedIn (`https://www.linkedin.com/sharing/share-offsite/?url=…`), WhatsApp (`https://wa.me/?text=…`), and a "Copy link" button using `navigator.clipboard.writeText`.
- Previous and next article links at the end.
- Pass the post title and excerpt to `BaseLayout` as `title` and `description`.

## Acceptance criteria

- Every sample article opens at `/news/<file-name>` and renders correctly on a phone.
- Search, category, author, and tag filters work.
- Headings, lists, images, quotations, and code blocks inside an article render with the `.prose` styles.

## Submission

Branch, commit, and open a pull request containing `Closes #<issue number>`. The full procedure is in [CONTRIBUTING.md](../CONTRIBUTING.md). If you are blocked for more than 30 minutes, comment on the issue and mention your mentor, **@YKrishna17** (Yogesh).
