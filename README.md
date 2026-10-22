<p align="center">
  <a href="https://cckfupm.vercel.app"><img src="public/logo.png" alt="KFUPM Computer Club" width="150"></a>
</p>

<h1 align="center">KFUPM Computer Club — Website</h1>

<p align="center">
  Events, recaps, tutorials and the people behind them. Written by members, built by students, open source.<br>
  <a href="https://cckfupm.vercel.app">cckfupm.vercel.app</a> · <a href="https://github.com/KFUPM-COMPUTER-CLUB/website/issues">Issues</a> · <a href="CONTRIBUTING.md">Contributing</a>
</p>

<p align="center">
  <a href="https://github.com/KFUPM-COMPUTER-CLUB/website/actions/workflows/ci.yml"><img alt="CI" src="https://github.com/KFUPM-COMPUTER-CLUB/website/actions/workflows/ci.yml/badge.svg"></a>
  <a href="https://github.com/KFUPM-COMPUTER-CLUB/website/actions/workflows/deploy.yml"><img alt="Deploy" src="https://github.com/KFUPM-COMPUTER-CLUB/website/actions/workflows/deploy.yml/badge.svg"></a>
  <a href="LICENSE"><img alt="License: MIT" src="https://img.shields.io/badge/license-MIT-2563EB"></a>
</p>

![The home page](docs/screenshot.jpg)

## What it is

The club's site and its membership platform in one Astro app:

- **Public pages** (home, timeline, blog, community, FAQ): rendered on Vercel and cached for 60 seconds, so they are as fast as static pages and edits go live within a minute.
- **Members** sign in with GitHub or Google, fill a short onboarding form, get the group links, reserve spots at events, and write posts in a rich editor that goes through review.
- **Officers** edit everything in `/admin`: events, the home page, partners, FAQ, the board, settings, media, the blog queue. No deploys, no pull requests for content.
- **Without any keys** the site serves the seed data in `src/data`, so a fresh clone runs in a minute.

## Stack

| Layer             | What                                                                            | Why                                                           |
| ----------------- | ------------------------------------------------------------------------------- | ------------------------------------------------------------- |
| Framework         | [Astro 7](https://astro.build), server output, plain CSS, small vanilla scripts | Pages are mostly HTML; no client framework to learn           |
| Hosting           | Vercel (functions in Stockholm, ISR cache)                                      | Free tier, preview deployment per pull request                |
| Data, auth, files | [Supabase](https://supabase.com) Postgres, Auth (GitHub, Google), Storage       | One project for everything, row level security on every table |
| Email             | [Resend](https://resend.com) through a queue in Postgres                        | Free tier; the queue keeps us under the daily limit           |
| Editor            | TipTap                                                                          | Headings, tables, code, images, PDFs, Arabic                  |

## Run it locally (under 5 minutes)

```bash
git clone https://github.com/KFUPM-COMPUTER-CLUB/website.git
cd website
npm install
npm run dev          # http://localhost:4321 with the seed data; sign-in is off
```

To work against the real database, copy `.env.example` to `.env` and fill the Supabase values (ask a maintainer; see `docs/OPERATIONS.md`). Then `/join` signs you in and `ADMIN_EMAILS` makes you an admin.

```bash
npm run lint         # ESLint
npm run format       # Prettier
npm run check        # Astro type check
npm run build        # must pass before every pull request
```

## Where to start reading

1. `docs/ARCHITECTURE.md`: the one diagram, the roles, the data model.
2. `src/lib/content.ts`: how every page gets its data (database or seed).
3. `src/middleware.ts` and `src/lib/api.ts`: sessions, roles, and how API routes are written.
4. `supabase/migrations/0001_init.sql`: the schema and its policies, commented.
5. `src/pages/admin/` and `src/lib/admin/resources.ts`: how one definition drives an admin screen.
6. `docs/OPERATIONS.md`: the outside services, who owns them, and the handover checklist.

`docs/DESIGN_SYSTEM.md` describes the look; `/styleguide` on the running site shows it.

## License

MIT. Content (posts, photos) belongs to its authors and the club.
