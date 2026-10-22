<p align="center">
  <a href="https://cckfupm.vercel.app"><img src="public/logo.png" alt="KFUPM Computer Club" width="180"></a>
</p>

<h1 align="center">نادي الحاسب الآلي · KFUPM Computer Club</h1>

<p align="center">
  The club's website and membership platform: events, recaps, tutorials and the people behind them. Built by students, open source.
</p>

<p align="center">
  <a href="https://cckfupm.vercel.app"><img alt="Live site" src="https://img.shields.io/badge/live-cckfupm.vercel.app-2563EB?logo=vercel&logoColor=white"></a>
  <a href="https://github.com/KFUPM-COMPUTER-CLUB/website/actions/workflows/ci.yml"><img alt="CI" src="https://github.com/KFUPM-COMPUTER-CLUB/website/actions/workflows/ci.yml/badge.svg"></a>
  <a href="LICENSE"><img alt="License: MIT" src="https://img.shields.io/badge/license-MIT-16A34A"></a>
  <img alt="Astro" src="https://img.shields.io/badge/Astro-7-BC52EE?logo=astro&logoColor=white">
  <img alt="Supabase" src="https://img.shields.io/badge/Supabase-Postgres%20%2B%20Auth-3ECF8E?logo=supabase&logoColor=white">
  <img alt="Vercel" src="https://img.shields.io/badge/Vercel-ISR-000000?logo=vercel&logoColor=white">
</p>

## Features

| Area            | What it does                                                                                       |
| --------------- | -------------------------------------------------------------------------------------------------- |
| **Timeline**    | Every club event in one place, split into upcoming and past, with a mini calendar                  |
| **Blog**        | Members write in a rich editor; reviewers approve each post before it is published                 |
| **Community**   | The board, member count, contributors and public member profiles                                   |
| **Admin panel** | Events, home page, partners, FAQ, media, settings and the review queue, with an audit log and undo |
| **Calendar**    | One-click add to Google or Outlook, `.ics` files and a club-wide feed                              |
| **Accounts**    | Sign-in with Google or GitHub, onboarding, event reservations and members-only group links         |
| **Challenge**   | A capture-the-flag puzzle hidden in the site, with a solvers wall and a terminal mode              |

## Tech stack

| Layer     | Tool                                          | Notes                                                |
| --------- | --------------------------------------------- | ---------------------------------------------------- |
| Framework | [Astro 7](https://astro.build), server output | Plain CSS and small vanilla scripts, no UI framework |
| Hosting   | [Vercel](https://vercel.com)                  | Functions in Stockholm, public pages cached 60 s     |
| Data      | [Supabase](https://supabase.com)              | Postgres with RLS, Auth (GitHub, Google), Storage    |
| Email     | [Resend](https://resend.com)                  | Queued in Postgres to stay inside the free tier      |
| Editor    | [TipTap](https://tiptap.dev)                  | Headings, tables, code, images, PDFs, Arabic         |

## Quick start

```bash
git clone https://github.com/KFUPM-COMPUTER-CLUB/website.git && cd website
npm install
npm run dev     # http://localhost:4321 with the seed data, no keys needed
```

To work against the real database, copy `.env.example` to `.env` and ask a maintainer for the values (see [docs/OPERATIONS.md](docs/OPERATIONS.md)). Before a pull request: `npm run lint && npm run check && npm run build`.

## Project structure

```
src/
├── pages/        routes: public pages, /me, /admin, /api, /auth
├── components/   building blocks used by the pages
├── layouts/      the page shell (head, header, footer)
├── lib/          data access, auth, roles, email queue, uploads, importer
├── scripts/      client-side code (editor, terminal, home page effects)
├── styles/       global.css for the site, app.css for /me and /admin
└── data/         seed content, posts and images used when no database is set
supabase/migrations/   schema, policies and grants (add a new file, never edit 0001)
docs/                  ARCHITECTURE, OPERATIONS, SETUP, DESIGN_SYSTEM
scripts/               one-off Node scripts (seed import)
```

## Contributing

Read [CONTRIBUTING.md](CONTRIBUTING.md) for the branch flow, commit style and how to add a page, an admin section or a table. Good first issues are [labelled](https://github.com/KFUPM-COMPUTER-CLUB/website/issues?q=is%3Aissue+is%3Aopen+label%3A%22good+first+issue%22).

<a href="https://github.com/KFUPM-COMPUTER-CLUB/website/graphs/contributors">
  <img src="https://contrib.rocks/image?repo=KFUPM-COMPUTER-CLUB/website" alt="Contributors">
</a>

## License

[MIT](LICENSE). Posts and photos belong to their authors and the club.
