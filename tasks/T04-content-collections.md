# T04 · Content collections and sample data

| Owner | Needs first | Labels |
|---|---|---|
| **Content developer** | T01 | role: content-dev, type: content, P0 |

This decides the shape of all content. Copy it exactly.

## 1. `src/content.config.ts`
```ts
import { defineCollection } from 'astro:content';
import { glob, file } from 'astro/loaders';
import { z } from 'astro/zod'; // Astro 7: z comes from astro/zod, not astro:content

const posts = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/posts' }),
  schema: z.object({
    title: z.string(),
    date: z.coerce.date(),
    author: z.string(),
    category: z.enum(['News', 'Event recap', 'Tutorial', 'Project', 'Experience', 'Opinion', 'Announcement']),
    tags: z.array(z.string()).default([]),
    excerpt: z.string().max(200),
    cover: z.string().optional(),       // e.g. /images/posts/my-photo.jpg
    draft: z.boolean().default(false),  // true = not shown on the site
  }),
});

const events = defineCollection({
  loader: file('src/data/events.json'),
  schema: z.object({
    id: z.string(),                     // e.g. ai-workshop-2026
    title: z.string(),
    type: z.enum(['Workshop', 'Talk', 'Hackathon', 'Competition', 'Social', 'Other']),
    date: z.coerce.date(),              // "2026-11-04"
    time: z.string(),                   // "7:00 PM"
    location: z.string(),
    summary: z.string().max(240),
    image: z.string().optional(),       // /images/events/ai.jpg
    registerUrl: z.string().optional(),
    detailsUrl: z.string().optional(),
    featured: z.boolean().default(false),
  }),
});

const team = defineCollection({
  loader: file('src/data/team.json'),
  schema: z.object({
    id: z.string(), name: z.string(), role: z.string(),
    photo: z.string(), linkedin: z.string().optional(), order: z.number(),
  }),
});

const newsletter = defineCollection({
  loader: file('src/data/newsletter.json'),
  schema: z.object({
    id: z.string(), issue: z.string(), title: z.string(),
    date: z.coerce.date(), summary: z.string(), url: z.string(),
  }),
});

export const collections = { posts, events, team, newsletter };
```

## 2. Sample data (every title starts with `SAMPLE:` so it's easy to delete in T13)
- `src/data/events.json`: 6 events, 3 in the past and 3 in the future, one `featured: true`
- `src/data/team.json`: 6 people, photos `/images/team/placeholder.jpg` (any 600×600 grey square in `public/images/team/`)
- `src/data/newsletter.json`: 3 issues
- `src/content/posts/`: 3 posts, e.g. `welcome-to-the-new-site.md`:
  ```markdown
  ---
  title: "SAMPLE: Welcome to the new CC website"
  date: 2026-10-20
  author: "CC Team"
  category: "Announcement"
  tags: ["website"]
  excerpt: "One place for everything the club does, written by members."
  ---

  ## Why a new website
  Text here…
  ```
  The file name becomes the URL: `/news/welcome-to-the-new-site`.

## 3. Document it
Write `docs/CONTENT.md`: one table per collection listing each field, whether it's required, and an example.

## Done when
- `npm run build` works (Astro checks every field against the schema)
- `docs/CONTENT.md` explains every field

---
**How to submit:** branch → commit → pull request with `Closes #<issue number>` (full steps in [CONTRIBUTING.md](../CONTRIBUTING.md)). Stuck for 30 minutes? Comment on the issue and tag Adib.
