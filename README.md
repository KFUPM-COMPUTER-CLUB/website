# KFUPM Computer Club — Community Website

The public website of the Computer Club at King Fahd University of Petroleum and Minerals (KFUPM). It publishes club news, event recaps, tutorials, the newsletter, and the events calendar, and it is written and maintained by club members.

| | |
|---|---|
| Live site | https://cckfupm-website.vercel.app |
| Status | In development. Tasks T01 and T02 are complete; see [Project status](#project-status). |
| Framework | [Astro 7](https://astro.build) on Node.js 24 LTS |
| Hosting | Vercel, deployed from GitHub Actions |
| License | MIT (code). Articles remain the property of their authors. |

## Contents

1. [Purpose](#purpose)
2. [Project status](#project-status)
3. [Site map](#site-map)
4. [Technical overview](#technical-overview)
5. [Repository layout](#repository-layout)
6. [Getting started](#getting-started)
7. [Development process](#development-process)
8. [Team](#team)
9. [Documentation index](#documentation-index)

## Purpose

The club runs workshops, talks, hackathons, and competitions throughout the academic year. Records of these activities are scattered across social media and chat groups and are lost within weeks. This website is the permanent, searchable record of the club's work, and it is open to contributions from any member.

The project is also a training exercise. Each contributor owns a defined set of tasks, works through the standard GitHub workflow (branch, pull request, review, merge), and is mentored by a project manager. The documentation in this repository is written to support that learning objective.

Design principles:

- **Static site.** There is no database, no server-side code, and no authentication. Every page is generated at build time and served as HTML.
- **Content as files.** An article is one Markdown file. An event, a team member, or a newsletter issue is one entry in a JSON file. Content is validated against a schema during the build.
- **External actions.** Membership registration, event registration, newsletter subscription, and article submission are handled by external forms and community platforms. The site links to them and stores no personal data.

## Project status

| Task | Description | Owner | Status |
|---|---|---|---|
| T01 | Astro project, base layout, header, footer | Lead developer | Complete ([#32](https://github.com/KFUPM-COMPUTER-CLUB/website/pull/32), [#34](https://github.com/KFUPM-COMPUTER-CLUB/website/pull/34)) |
| T02 | Design system (`global.css`) and style guide | Designer | Complete ([#36](https://github.com/KFUPM-COMPUTER-CLUB/website/pull/36)) |
| T03–T15 | Pages, content, checks, SEO, accessibility, launch | See [tasks/README.md](tasks/README.md) | Open |

The full task list, dependencies, and ownership are in [tasks/README.md](tasks/README.md).

## Site map

| Page | Route | Content |
|---|---|---|
| Home | `/` | Introduction, key figures, featured event, upcoming events, latest articles, newsletter, membership |
| Events | `/events` | All events with an Upcoming / Past / All filter and registration links |
| News | `/news` | All articles with category, author, and tag filters and a search box |
| Article | `/news/<slug>` | One article: author, date, reading time, sharing links, previous and next |
| Newsletter | `/newsletter` | Subscription link and archive of past issues |
| Write for us | `/write` | Editorial scope and submission procedure |
| About | `/about` | The club, the team, contact links, website credits |
| Style guide | `/styleguide` | Every design-system class, for the team (not indexed) |
| Not found | `/404` | Error page |
| Feeds | `/rss.xml`, `/sitemap-index.xml` | For feed readers and search engines |

## Technical overview

| Area | Decision | Rationale |
|---|---|---|
| Framework | Astro 7 | Built for content sites. Markdown in, static HTML out. No client-side framework is required. |
| Components | `.astro` files (HTML with a small frontmatter script). TypeScript is used only in `src/content.config.ts`. | Readable by contributors who know HTML and basic JavaScript. |
| Styling | One plain CSS file, `src/styles/global.css`, built on CSS custom properties | A single source of truth for colour, type, and spacing. No utility framework or component library. |
| Content | Astro content collections: Markdown articles and JSON data validated by a Zod schema | A malformed entry fails the build rather than reaching the live site. |
| Client scripts | Small inline `<script>` blocks for filters, the mobile menu, and motion | No runtime dependencies. |
| Typography | Mona Sans (headings), Hubot Sans (body), Readex Pro (Arabic), served by Google Fonts | Consistent with the club's visual identity. |
| Forms | External forms, linked only | No personal data is stored by the site. |
| Hosting | Vercel. A preview deployment for every pull request; production on every merge to `main`. | Reviewers see the real result before approving. |
| Quality gates | GitHub Actions: `astro check`, production build, internal link check (T10) | Errors are caught before review. |
| Runtime | Node.js 24 LTS (`.nvmrc`); Astro 7 requires 22.22 or later | Current long-term-support release. |

The design system is documented in [docs/DESIGN_SYSTEM.md](docs/DESIGN_SYSTEM.md). The architecture and data flow are documented in [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md).

## Repository layout

```
.
├── src/
│   ├── pages/            One file per route (index.astro, events.astro, news/index.astro, …)
│   ├── layouts/          BaseLayout.astro: document head, header, footer
│   ├── components/       Header.astro, Footer.astro, and shared UI components
│   ├── styles/           global.css — the complete design system
│   ├── scripts/          Small browser scripts (added in T14)
│   ├── content/posts/    Articles, one Markdown file each (schema in T04)
│   ├── data/             site.json, events.json, team.json, newsletter.json
│   └── content.config.ts Content collection schemas (added in T04)
├── public/               Static files served as-is: logo, favicons, images
├── docs/                 Setup, architecture, design system, writing guide
├── tasks/                One specification per task, plus the task index
├── .github/              Issue and pull request templates, workflows, CODEOWNERS
├── astro.config.mjs      Astro configuration
├── vercel.json           Build settings for Vercel
└── package.json          Scripts and dependencies
```

## Getting started

Prerequisites: Git, Node.js 24 LTS, and a code editor. The complete installation procedure is in [docs/SETUP.md](docs/SETUP.md).

```bash
git clone https://github.com/KFUPM-COMPUTER-CLUB/website.git
cd website
npm install
npm run dev        # http://localhost:4321
```

| Command | Purpose |
|---|---|
| `npm run dev` | Start the development server with live reload |
| `npm run build` | Produce the production build in `dist/` |
| `npm run preview` | Serve the production build locally |
| `npx astro check` | Report type and content-schema errors |

## Development process

1. Each contributor is assigned tasks by role. Tasks and their prerequisites are listed in [tasks/README.md](tasks/README.md).
2. Work happens on a branch, one branch per task. Direct pushes to `main` are rejected by the repository rules.
3. A pull request references its issue (`Closes #N`), receives an automated preview deployment, and is reviewed by the task owner's mentor.
4. Pull requests are squash-merged. Production deploys automatically.

The complete procedure, naming conventions, and code rules are in [CONTRIBUTING.md](CONTRIBUTING.md). The procedure for submitting an article is in [docs/WRITING_A_POST.md](docs/WRITING_A_POST.md).

## Team

| Role | Member | Mentor |
|---|---|---|
| Project manager and mentor (project lead, repository administration) | Adib Alqurashi — [@adib-alqurashi](https://github.com/adib-alqurashi) | — |
| Project manager and mentor (content lead) | Yogesh Krishna Thakur — [@YKrishna17](https://github.com/YKrishna17) | — |
| Lead developer | Turki Almutairi — [@TruuV9](https://github.com/TruuV9) | Yogesh |
| Content developer | Ali Abdullah Alobaid — [@NullAliCompiles](https://github.com/NullAliCompiles) | Yogesh |
| Designer | Mohammad Qoqazeh — [@SylvesterM7mD](https://github.com/SylvesterM7mD) | Adib |
| QA and launch | To be assigned | Adib |

All contributors are listed in [CONTRIBUTORS.md](CONTRIBUTORS.md).

## Documentation index

| Document | Audience | Content |
|---|---|---|
| [CONTRIBUTING.md](CONTRIBUTING.md) | All contributors | Workflow, branch naming, commit format, review process, code rules |
| [CODE_OF_CONDUCT.md](CODE_OF_CONDUCT.md) | All contributors | Expected conduct in this repository |
| [docs/SETUP.md](docs/SETUP.md) | New contributors | Installing the toolchain and running the project |
| [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) | Developers | How the site is built, where content lives, how deployment works |
| [docs/DESIGN_SYSTEM.md](docs/DESIGN_SYSTEM.md) | Developers and designers | Tokens, type scale, layout classes, components |
| [docs/WRITING_A_POST.md](docs/WRITING_A_POST.md) | Authors | Editorial guidelines and the submission procedure |
| [tasks/README.md](tasks/README.md) | All contributors | Task index, ownership, dependencies, start order |
