<h1 align="center">KFUPM Computer Club — Community Website</h1>

<p align="center">The blog, news, newsletter and events home of the Computer Club at KFUPM.<br>Written by the community. Built by a team of 6 students.</p>

> 🚧 **Being built.** The repo starts empty. This README describes what we are building. The work is split into tasks in [`tasks/`](tasks/README.md).

## The idea

The club does a lot, and most of it disappears into Instagram stories and WhatsApp chats. This site is **the one place that documents everything**: news, event recaps, tutorials, the newsletter, upcoming events. **Any club member can write for it.**

- **No database, no server, no logins.** It's a static site.
- **Content is files.** A blog post is one Markdown file. An event is one entry in a JSON file.
- **Every button is a link.** Join, register, subscribe and write-for-us open a Microsoft Form or a community group.

## Pages

| Page | URL | Shows |
|---|---|---|
| Home | `/` | Tagline, numbers, next featured event, 3 upcoming events, 3 latest posts, newsletter, join |
| Events | `/events` | All events, filter Upcoming / Past / All, Register links |
| News | `/news` | All posts, category filter, search, author and tag filters |
| Post | `/news/<slug>` | One article: author, date, reading time, share links, previous/next |
| Newsletter | `/newsletter` | Subscribe + archive of issues |
| Write for us | `/write` | What we publish, how to submit |
| About | `/about` | The club, the team, all links, website credits |
| 404 | | Page not found |
| RSS / sitemap | `/rss.xml`, `/sitemap-index.xml` | For feed readers and Google |

## Tech stack 

| Part | Choice | Why |
|---|---|---|
| Framework | **[Astro 7](https://astro.build)** | Made for content sites. Posts are plain Markdown files. Outputs plain fast HTML. Easier than React/Next.js for a blog. |
| Language | `.astro` components (HTML + a bit of JavaScript), TypeScript only in `content.config.ts` | Close to plain HTML, so learners can read it |
| Styling | **Plain CSS**, one file: `src/styles/global.css`, with CSS variables | No Tailwind, no UI library. One place for all styles. |
| Content | Astro **content collections**: Markdown posts + JSON data, checked by a schema | A typo in a post breaks the build, not the live site |
| Client JS | Small `<script>` tags only (filters, menu, animations) | No React, no jQuery |
| Fonts | Mona Sans (headings), Hubot Sans (text), Readex Pro (Arabic) via Google Fonts | Club identity |
| Forms | Microsoft Forms (links only) | The site stores no personal data |
| Hosting | **Vercel**: preview link on every pull request, auto-deploy from `main` | Free, zero setup for Astro |
| Checks | GitHub Actions: `astro check` + build + internal link check | Catches mistakes before review |
| Node | **24 LTS** (see `.nvmrc`) | Astro 7 needs Node 22.22 or newer; 24 is the current LTS |

Install everything: [docs/SETUP.md](docs/SETUP.md).

## Design

Look reference: the design sample the managers share. Dark navy and white, calm, editorial.

- **Colors:** `--navy #0B1A33` · `--navy-2 #0F2142` · `--ink #081226` · `--white #FFFFFF` · `--paper #F3F5F9` · `--accent #2563EB` · `--accent-2 #4F86FF` · `--muted #9FB0C8`
- **Type:** big light headings (Mona Sans 300), 17px body (Hubot Sans), small uppercase "eyebrow" labels.
- **Layout:** 1240px container; sections switch between navy, white and light grey; grids with thin 1px lines.
- **Motion:** blurred header on scroll, fade-up on scroll, a moving word strip. All of it off with reduced motion.
- **Rule:** only use the variables and classes from `global.css`. Full class list in [T02](tasks/T02-design-system.md).

## Folder structure

```
src/
  pages/            one file = one URL (index.astro, events.astro, news/index.astro, news/[slug].astro …)
  layouts/          BaseLayout.astro: <head>, header, footer for every page
  components/       Header.astro, Footer.astro, cards …
  styles/global.css ALL styles
  scripts/          small browser scripts (reveal.js)
  content/posts/    blog posts, one .md file each
  data/             site.json, events.json, team.json, newsletter.json
  content.config.ts the shape of all content
public/             logo, favicons, og.png, images/ (team, events, posts)
docs/               setup guide, writing guide
tasks/              one guide per task
.github/            issue + PR templates, workflows
```

## Commands

```bash
npm install        # once, after cloning
npm run dev        # local site at http://localhost:4321 (live reload)
npm run build      # build to dist/ (what Vercel does)
npm run preview    # open the built site
npx astro check    # find type and content errors
```

## How we work

1. Read [tasks/README.md](tasks/README.md). Your tasks are the ones under your role.
2. Branch → commit → pull request with `Closes #N` → a manager reviews → merged → live in a minute.

Full flow: [CONTRIBUTING.md](CONTRIBUTING.md). Writing a post: [docs/WRITING_A_POST.md](docs/WRITING_A_POST.md).

## Team

| Role | Person | Mentor (tag them when stuck, they review your PRs) |
|---|---|---|
| Manager & mentor: project lead, GitHub, mentors the **Designer** and **QA & launch** | Adib Alqurashi | |
| Manager & mentor: content lead, mentors the **Lead developer** and **Content developer** | Yogesh Krishna Thakur | |
| Lead developer | Turki Almutairi | Yogesh, @YKrishna17 |
| Content developer | Ali Abdullah Alobaid | Yogesh, @YKrishna17 |
| Designer | Mohammad Qoqazeh | Adib, @adib-alqurashi |
| QA & launch | [name] | Adib, @adib-alqurashi |

Everyone who helps: [CONTRIBUTORS.md](CONTRIBUTORS.md).

## License

Code: MIT. Blog posts belong to their writers and are published with their permission.
