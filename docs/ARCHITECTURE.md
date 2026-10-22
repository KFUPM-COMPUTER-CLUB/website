# Architecture

The site is an [Astro](https://astro.build) app rendered on demand on Vercel. Public pages are cached by Vercel's ISR for 60 seconds, so they are as fast as static pages and an admin's edit is live within about a minute without a deploy. Pages about a specific person (`/me`, `/admin`, `/onboarding`, `/api/*`, `/auth/*`) are never cached.

```
browser ─ Vercel CDN (ISR, 60 s) ─ Astro server (Node, region arn1)
                                        ├── src/lib/content.ts ─┬─ Supabase Postgres (anon key, RLS)
                                        │                       └─ src/data/*.json (seed fallback)
                                        ├── src/lib/supabase.ts ── Supabase Auth, Storage (service key, server only)
                                        └── src/lib/email.ts ──── Resend (queued, 90 a day)
```

## Data

| Where | What |
|---|---|
| `supabase/migrations/0001_init.sql` | Every table, view, function, policy and bucket. Run once; safe to re-run. |
| `src/lib/content.ts` | The only way pages read content. With `PUBLIC_SUPABASE_URL` set it queries the database; without it, it serves the seed JSON. |
| `src/lib/photos.ts` | Resolves a photo key to `{ src, srcset }`: WebP sizes in Storage, or the seed photo optimised by Astro. |
| `src/data/*.json`, `src/content/posts/*.md` | Seed data. Imported once with `scripts/import-seed.mjs`; after that the database is the source of truth. |

Tables: `profiles` (+ `profiles_public` view without phone or email), `user_roles`, `media`, `events`, `registrations`, `posts`, `post_reviews`, `officer_terms`, `highlights`, `stories`, `strip_photos`, `impact_semesters`, `impact_items`, `partners`, `faq`, `settings` (key/value JSON), `flag_solvers`, `email_queue`, `audit_log`, `rate_limits`, `keepalive`.

Row level security is on everywhere. The anon key can read published, visible rows and nothing personal. Signed-in users can read and edit their own rows. Everything else goes through the site's API routes, which check the role and then use the service key. The service key exists only on the server.

## Roles

`member` < `editor` < `reviewer` < `officer` < `admin`. A signed-in user without a role row is a member. Officers edit site content (events, home page, partners, FAQ, media); reviewers run the blog queue; admins also manage members, the board, settings, flag solvers and the audit log. The first admins come from the `ADMIN_EMAILS` environment variable.

## Request flow

1. `src/middleware.ts` runs on every request. On personal routes it reads the Supabase session from cookies, loads the profile and role into `Astro.locals`, and enforces sign-in and onboarding. On every `/api/*` mutation it checks the request came from this site (origin / `Sec-Fetch-Site`).
2. Pages render with the content layer. Components receive plain objects, never a Supabase client.
3. API routes (`src/pages/api/**`) use `src/lib/api.ts`: `handle()` turns errors into JSON (or a redirect with `?error=` for form posts), `requireRole()`, `rateLimit()` (a Postgres function, per IP and scope), `audit()`.
4. Writes call `bust()` so the in-memory memo clears; ISR expiry does the rest.

## Images and files

Uploads (`/api/upload`) are checked by real file signature and size, converted to WebP at 480, 960 and 1600 px with sharp, stored in the `media` bucket, and recorded in `media` with required alt text. PDFs (max 10 MB) go to the `files` bucket. No paid image transforms are used; the seed photos are optimised by Astro's own image service at request time and cached by the CDN.

## Blog

Posts are written in a TipTap editor (`src/scripts/editor.js`), autosaved as HTML + JSON. The server sanitises the HTML (`src/lib/sanitize.ts`) before storing it. Status flow: draft → submitted → changes requested or published → unpublished. Reviewers leave notes in `/admin/posts`; each status change emails the author.

## Email

`src/lib/email.ts` queues every message in `email_queue`. If Resend is configured and today's budget (90) is left, it sends immediately; otherwise the daily cron (`/api/cron/daily`, from `vercel.json`) sends by priority (welcome first) and rolls the remainder to the next day. The same cron touches `keepalive` so the free Supabase project never pauses.

## Client-side scripts

Small modules in `src/scripts/`, each initialised through `src/scripts/page.js` so they survive Astro's client-side page transitions. No client framework; TipTap is loaded only on the editor page.

## Deployment

`.github/workflows/deploy.yml` deploys every pull request to a Vercel preview and `main` to production. Environment variables live in Vercel (see `docs/SETUP.md`), never in the repo.
