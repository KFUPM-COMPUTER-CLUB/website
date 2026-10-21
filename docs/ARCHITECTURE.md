# Architecture

The site is statically generated with [Astro](https://astro.build). At build time, pages, content and the stylesheet are compiled into plain HTML in `dist/`, which Vercel serves from its CDN. No code runs on a server at request time.

```
src/pages/*.astro ─┐
src/content/posts ─┤  astro build  →  dist/  →  Vercel
src/data/*.json   ─┤
src/styles/global.css ┘
```

## Layout

| File | Role |
|---|---|
| `src/layouts/BaseLayout.astro` | Document shell: `<head>`, skip link, header, `<main>`, footer. Used by every page. |
| `src/components/Header.astro` | Logo, navigation with `aria-current`, mobile menu, `body.scrolled` and `body.nav-open` toggles. |
| `src/components/Footer.astro` | Club name, email and social links from `site.json`. |
| `src/pages/*.astro` | One file per route. |

## Content

Content is validated by the schemas in `src/content.config.ts`; an invalid entry fails the build.

| Collection | Source | Key fields |
|---|---|---|
| `posts` | `src/content/posts/*.md` | `title`, `date`, `author`, `category`, `tags`, `excerpt`, `cover`, `draft`. File name = URL slug. |
| `events` | `src/data/events.json` | `id`, `title`, `type`, `date`, `time`, `location`, `summary`, `image`, `registerUrl`, `featured` |
| `team` | `src/data/team.json` | `id`, `name`, `role`, `photo`, `linkedin`, `order` |
| `newsletter` | `src/data/newsletter.json` | `id`, `issue`, `title`, `date`, `summary`, `url` |

Site-wide values (name, description, email, external links) live in `src/data/site.json`.

## Client-side scripts

Small inline `<script>` blocks only: the mobile menu, the header scroll state, list filters, and scroll-reveal motion. No client-side framework.

## Deployment

| Event | Result |
|---|---|
| Pull request | `checks` workflow (type check, build, link check) and a preview deployment posted as a comment |
| Push to `main` | Production deployment |

Build settings are pinned in `vercel.json`; the workflow uses a `VERCEL_TOKEN` repository secret.
