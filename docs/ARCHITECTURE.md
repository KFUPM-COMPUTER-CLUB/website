# Architecture

This document explains how the website is built, where its content lives, and how a change reaches the live site. It is written for contributors who will modify the code.

## 1. Overview

The website is a statically generated site. At build time, Astro reads the pages in `src/pages/`, the content in `src/content/` and `src/data/`, and the stylesheet in `src/styles/`, and writes plain HTML, CSS, and a small amount of JavaScript to `dist/`. The output is uploaded to Vercel and served from its content delivery network. No code runs on a server when a visitor opens a page.

```
src/pages/*.astro  ─┐
src/content/posts  ─┤  astro build  ─►  dist/  ─►  Vercel CDN  ─►  visitor
src/data/*.json    ─┤
src/styles/global.css ┘
```

## 2. Request flow

1. A visitor requests `/events`.
2. Vercel serves `dist/events/index.html`, which was generated at build time.
3. The browser loads `global.css` and the Google Fonts stylesheet.
4. A small inline script applies the Upcoming / Past filter using the visitor's current date, so the page stays correct between builds.

Every page follows this model. The only client-side scripts are the mobile menu, the scroll state of the header, content filters, and (after T14) the scroll-reveal animation.

## 3. Layout and components

| File | Responsibility |
|---|---|
| `src/layouts/BaseLayout.astro` | The HTML document: `<head>` with title, description, fonts, favicon, and optional `noindex`; skip link; `Header`; `<main>`; `Footer`. Every page uses it. |
| `src/components/Header.astro` | Logo, primary navigation with `aria-current` on the active link, mobile menu button, and the script that toggles `body.nav-open` and `body.scrolled`. |
| `src/components/Footer.astro` | Club name, contact email, social links from `site.json`, credits. Placeholder values containing `REPLACE` are hidden until real content is entered (T13). |
| `src/pages/*.astro` | One file per route. Pages compose sections using the classes in `global.css` and pass `title` and `description` to the layout. |

## 4. Content model

Content is validated by schemas in `src/content.config.ts` (added in T04). The build fails if an entry does not match its schema, which prevents malformed content from reaching the live site.

| Collection | Source | Entry |
|---|---|---|
| `posts` | `src/content/posts/*.md` | One article. Frontmatter: `title`, `date`, `author`, `category`, `tags`, `excerpt`, optional `cover`, `draft`. The file name is the URL slug. |
| `events` | `src/data/events.json` | One event: `id`, `title`, `type`, `date`, `time`, `location`, `summary`, optional `image`, `registerUrl`, `detailsUrl`, `featured`. |
| `team` | `src/data/team.json` | One team member: `id`, `name`, `role`, `photo`, optional `linkedin`, `order`. |
| `newsletter` | `src/data/newsletter.json` | One issue: `id`, `issue`, `title`, `date`, `summary`, `url`. |

Site-wide values (name, description, contact email, external links, key figures) live in `src/data/site.json` and are imported directly by components.

## 5. Styling

All styles are in `src/styles/global.css`. The file defines design tokens as CSS custom properties, base element styles, layout utilities, and components. Sections set three section-scoped variables (`--section-bg`, `--section-line`, `--section-muted`) so that grids, cards, and muted text adapt to a navy, white, or paper background without additional classes. The full reference is [DESIGN_SYSTEM.md](DESIGN_SYSTEM.md).

## 6. Build and deployment

| Stage | Mechanism |
|---|---|
| Local development | `npm run dev` starts Astro's development server with live reload at `http://localhost:4321`. |
| Pull request checks | The `checks` workflow (T10) runs `astro check`, a production build, and an internal link check. |
| Preview deployment | The `deploy` workflow builds every pull request and posts a preview URL as a comment. |
| Production deployment | The same workflow deploys to production on every push to `main`. |
| Build configuration | `vercel.json` pins the framework (Astro), install command (`npm ci`), build command, and output directory. `package.json` declares the Node.js version. |

The workflow authenticates to Vercel with a repository secret named `VERCEL_TOKEN`. If the secret is absent, the job skips with a warning rather than failing.

## 7. Conventions

- Routes are lowercase with hyphens. Trailing slashes are ignored (`trailingSlash: 'ignore'`).
- Pages contain no hard-coded club information; all such values come from `site.json` or a collection.
- Images are placed under `public/images/<posts|events|team>/`, compressed to under 200 KB, and referenced by absolute path (`/images/...`).
- The style guide at `/styleguide` demonstrates every class and is excluded from search indexing.
