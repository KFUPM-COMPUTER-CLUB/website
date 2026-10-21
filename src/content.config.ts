import { defineCollection } from 'astro:content';
import { glob, file } from 'astro/loaders';
import { z } from 'astro/zod';

const posts = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/posts' }),
  schema: z.object({
    title: z.string(),
    date: z.coerce.date(),
    author: z.string(),
    category: z.enum(['News', 'Event recap', 'Tutorial', 'Project', 'Experience', 'Opinion', 'Announcement']),
    tags: z.array(z.string()).default([]),
    excerpt: z.string().max(200),
    cover: z.string().optional(),
    draft: z.boolean().default(false),
  }),
});

const events = defineCollection({
  loader: file('src/data/events.json'),
  schema: z.object({
    id: z.string(),
    title: z.string(),
    type: z.enum(['Workshop', 'Talk', 'Hackathon', 'Competition', 'Social', 'Other']),
    date: z.coerce.date(),
    time: z.string(),
    location: z.string(),
    summary: z.string().max(240),
    image: z.string().optional(),
    registerUrl: z.string().optional(),
    detailsUrl: z.string().optional(),
    featured: z.boolean().default(false),
  }),
});

const team = defineCollection({
  loader: file('src/data/team.json'),
  schema: z.object({
    id: z.string(),
    name: z.string(),
    role: z.string(),
    photo: z.string(),
    linkedin: z.string().optional(),
    order: z.number(),
  }),
});

const newsletter = defineCollection({
  loader: file('src/data/newsletter.json'),
  schema: z.object({
    id: z.string(),
    issue: z.string(),
    title: z.string(),
    date: z.coerce.date(),
    summary: z.string(),
    url: z.string(),
  }),
});

export const collections = { posts, events, team, newsletter };
