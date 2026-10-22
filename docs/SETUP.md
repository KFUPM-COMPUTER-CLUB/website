# Owner setup (about 25 minutes)

Only the project owner can do these steps. Do them in order; nothing on the site breaks while a step is still missing, the feature just stays switched off.

Replace `<project-ref>` with the reference of your Supabase project (the part before `.supabase.co` in its URL).

## 1. Supabase project (8 min)

1. Go to https://supabase.com/dashboard, **New project**. Name: `cckfupm-website`. Region: **Stockholm (eu-north-1)**. Generate and store the database password (you will not need it again for the site).
2. Open **SQL Editor → New query**, paste the whole file `supabase/migrations/0001_init.sql` from the repo, press **Run**. It must end with "Success". It is safe to run again later.
3. **Project Settings → API** (or **Data API**). Copy:
   - Project URL → `PUBLIC_SUPABASE_URL`
   - the publishable key (`sb_publishable_…`) → `PUBLIC_SUPABASE_PUBLISHABLE_KEY` (older projects: the `anon` key as `PUBLIC_SUPABASE_ANON_KEY`)
   - the secret key (`sb_secret_…`) → `SUPABASE_SECRET_KEY` (older projects: `service_role` as `SUPABASE_SERVICE_ROLE_KEY`); server only, never share it
4. **Authentication → URL Configuration**:
   - Site URL: `https://cckfupm-website.vercel.app`
   - Redirect URLs, add all three:
     - `https://cckfupm-website.vercel.app/**`
     - `https://cckfupm-website-*.vercel.app/**` (every Vercel preview deployment)
     - `http://localhost:4321/**`
5. **Authentication → Sign In / Providers → Email**: turn **off** "Enable email provider" (we only use GitHub and Google).
6. Optional now, needed for "link both providers to one account": **Authentication → Sign In / Providers**, scroll to **Manual linking**, turn it on.

## 2. GitHub sign-in (4 min)

1. https://github.com/settings/developers → **OAuth Apps → New OAuth App**.
   - Application name: `KFUPM Computer Club`
   - Homepage URL: `https://cckfupm-website.vercel.app`
   - Authorization callback URL: `https://<project-ref>.supabase.co/auth/v1/callback`
2. **Register application**, then **Generate a new client secret**. Copy the Client ID and the secret.
3. Supabase → **Authentication → Sign In / Providers → GitHub**: enable, paste Client ID and secret, **Save**.

## 3. Vercel environment variables (5 min)

Vercel → the `cckfupm-website` project → **Settings → Environment Variables**. Add each for **Production, Preview and Development**:

| Name | Value |
|---|---|
| `PUBLIC_SUPABASE_URL` | the Project URL |
| `PUBLIC_SUPABASE_PUBLISHABLE_KEY` | the publishable key (or `PUBLIC_SUPABASE_ANON_KEY` with the anon key) |
| `SUPABASE_SECRET_KEY` | the secret key, marked sensitive (or `SUPABASE_SERVICE_ROLE_KEY` with the service_role key) |
| `ADMIN_EMAILS` | your email(s), comma separated, e.g. `adib.alqurashi@gmail.com` (the GitHub account's primary email) |
| `SITE_URL` | `https://cckfupm-website.vercel.app` |
| `CRON_SECRET` | any long random string (Vercel sends it with the daily cron) |

Then **Deployments → ⋯ on the latest → Redeploy** so the build picks them up. Also check **Settings → Functions → Function Region** shows **Stockholm (arn1)**; `vercel.json` requests it.

## 4. Seed the database (3 min, on your computer)

```bash
git pull
npm install
cp .env.example .env     # fill PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY
node scripts/import-seed.mjs --dry-run   # shows what will be imported
node scripts/import-seed.mjs             # uploads photos and logos, imports every data file
```

It is idempotent: run it again any time and nothing duplicates. After it finishes, the site reads from the database; `src/data/*.json` stays in the repo as seed data only.

## 5. First sign-in (1 min)

Open `https://cckfupm-website.vercel.app/join`, **Continue with GitHub**, fill the onboarding form. Because your email is in `ADMIN_EMAILS` you land as **admin**: `/admin` is open. Under **Settings → WhatsApp groups** paste the invite links; under **Links** fill the social links.

## Later: switch on the rest (nothing breaks until then)

### Google sign-in (5 min)
1. https://console.cloud.google.com → a project → **APIs & Services → Credentials → Create credentials → OAuth client ID** (type **Web application**).
   - Authorized JavaScript origins: `https://cckfupm-website.vercel.app` and `https://<project-ref>.supabase.co`
   - Authorized redirect URIs: `https://<project-ref>.supabase.co/auth/v1/callback`
   - If asked, configure the consent screen first (External, app name, support email, scopes `email` and `profile`).
2. Supabase → **Authentication → Sign In / Providers → Google**: enable, paste Client ID and secret.
3. Vercel env var `PUBLIC_GOOGLE_SIGNIN` = `true`, redeploy. The Google button on `/join` turns on.

### Email with Resend (10 min)
1. https://resend.com → **API Keys → Create** (sending access). Vercel env var `RESEND_API_KEY`.
2. **Domains → Add domain** with the production domain (for example `cckfupm.com`). Add the DNS records Resend shows (DKIM TXT, SPF/MX for the `send` subdomain) at your DNS provider and wait for **Verified**.
3. Vercel env var `EMAIL_FROM` = `KFUPM Computer Club <hello@cckfupm.com>` (an address on the verified domain). Redeploy.
4. Queued emails start going out: the welcome email first, at most 90 a day; the rest roll to the next day. The admin dashboard shows the counts and warns at 80%.

### Production domain
1. Vercel → **Settings → Domains → Add** the domain, follow the DNS instructions.
2. Set `SITE_URL` to `https://<domain>` in Vercel, and add `https://<domain>/**` to the Supabase redirect URLs; set the Supabase Site URL to it as well.
3. Tell the developer the domain so `site` in `astro.config.mjs` is updated in the repo.

## Daily keep-alive
`vercel.json` runs `/api/cron/daily` every day at 03:00 UTC. It touches the database (so the free Supabase project never pauses) and sends the email queue. Nothing to set up beyond `CRON_SECRET`.
