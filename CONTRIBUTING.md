# Contributing

Thanks for helping. This file is the whole process; `docs/ARCHITECTURE.md` explains the code.

## Branches and pull requests

- `main` is protected: nothing lands without a pull request and a maintainer review (`CODEOWNERS`). Every push to `main` deploys to production.
- Work from an issue. Small fixes can skip this; anything bigger, open or pick an issue first so nobody does the same work twice.
- Branch from `main`: `feat/…`, `fix/…`, `design/…`, `content/…`, `docs/…`, `chore/…`. One topic per branch.
- Commits: `type: short summary` in the imperative (`feat: reservation emails`, `fix: ics escaping`). Pull requests are squash-merged, so commit as often as you like.
- The pull request template asks for a summary, screenshots for anything visual (laptop and phone width), and a checklist. CI runs lint, type check and build; the deploy workflow posts a preview URL. Both must be green before review.
- No Claude or other AI co-author lines in commits or pull requests; the work ships under your name.

## Before you push

```bash
npm run lint      # ESLint; fix or explain every warning
npm run format    # Prettier (stylesheets are excluded on purpose: one rule per line)
npm run check     # Astro type check
npm run build     # the same build Vercel runs
```

Then open the preview deployment and click through what you changed at laptop and phone width. For anything behind sign-in, test on the preview with your own account; `ADMIN_EMAILS` in Vercel decides who is admin there.

## How to add things

### A page

1. Create `src/pages/<name>.astro` using `BaseLayout` and the existing classes from `src/styles/global.css` (see `docs/DESIGN_SYSTEM.md`).
2. Read data only through `src/lib/content.ts`, never from a JSON file or a Supabase client in the page. The page must render in seed mode too (`npm run dev` without `.env`).
3. If the page is about a person (dashboard-like), add its prefix to `PERSONAL` in `src/middleware.ts` and to the ISR `exclude` list in `astro.config.mjs` so it is never cached.
4. Link it from the header, footer or wherever it belongs.

### An admin section

- For a table that is "rows with fields", add a definition to `src/lib/admin/resources.ts`. That alone gives you the list page, the edit form, ordering, show/hide, the API and the audit log with undo.
- For anything else, add a page under `src/pages/admin/`, use `AdminLayout`, check the role in frontmatter (`atLeast(Astro.locals.role, 'officer')`), and put its writes in `src/pages/api/admin/…` using `handle`, `requireRole`, `readBody` and `audit` from `src/lib/api.ts`. Add the link in `src/components/AdminLayout.astro`.

### A database table or column

1. Never edit `supabase/migrations/0001_init.sql` once it has been run on the project. Add `supabase/migrations/0002_<topic>.sql`, idempotent (`create table if not exists`, `add column if not exists`, `drop policy if exists` before `create policy`).
2. Enable row level security, write read policies, and grant `select` to `anon, authenticated` explicitly: the project does not expose new tables by itself. Do not write policies for user tokens; every write goes through the API with the service key (`src/lib/api.ts`).
3. Run the file in the Supabase SQL editor (a maintainer does this for the shared project) and say so in the pull request.
4. Read the new data through `src/lib/content.ts` with a seed fallback where it makes sense.

### An email

Use `enqueue` or the helpers in `src/lib/email.ts`; never call Resend directly. The queue enforces the daily budget.

## Content rules

- Facts on the site come from the club's own posts; link the source. No invented numbers, names or events.
- Images need alt text. Uploads go through the site (WebP sizes are generated); do not add large files to `public/`.
- Copy is plain and short; no square-bracket decoration; Arabic goes in `lang="ar" dir="rtl"`.

## Review

Anyone may review. Test on the preview, comment on specific lines, keep feedback factual. See `CODE_OF_CONDUCT.md`.
