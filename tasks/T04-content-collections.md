# T04 · Content collections and sample data

| Owner | Prerequisites | Labels |
|---|---|---|
| Content developer | T01 | role: content-dev, type: content, P0 |

## Objective

Define the schema of every content type and provide sample data so that the page tasks (T03, T05–T08) can be built and tested before real content is available. The schema is authoritative: copy it exactly.

## Procedure

### 1. Create `src/content.config.ts`

```ts
import { defineCollection } from 'astro:content';
import { glob, file } from 'astro/loaders';
import { z } from 'astro/zod'; // Astro 7 exports z from astro/zod, not astro:content

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
    draft: z.boolean().default(false),  // true = excluded from the site
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

### 2. Create sample data

Prefix every sample title with `SAMPLE:` so that the entries are easy to find and remove in T13.

- `src/data/events.json`: six events, three past and three future, one with `featured: true`.
- `src/data/team.json`: six people, all using `/images/team/placeholder.jpg` (a 600 × 600 neutral image in `public/images/team/`).
- `src/data/newsletter.json`: three issues.
- `src/content/posts/`: three articles. Example, `welcome-to-the-new-site.md`:
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
  Article text.
  ```
  The file name becomes the URL: `/news/welcome-to-the-new-site`.

### 3. Document the schema

Create `docs/CONTENT.md` with one table per collection listing each field, whether it is required, its type, and an example value.

## Acceptance criteria

- `npm run build` completes; Astro validates every entry against its schema.
- `docs/CONTENT.md` documents every field.

## Submission

Branch, commit, and open a pull request containing `Closes #<issue number>`. The full procedure is in [CONTRIBUTING.md](../CONTRIBUTING.md). If you are blocked for more than 30 minutes, comment on the issue and mention your mentor, **@YKrishna17** (Yogesh).
