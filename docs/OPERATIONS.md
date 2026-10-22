# Operations

Every outside service the site depends on, who owns it, how to rotate its keys, and what to do when officers change. No secrets live in this file or in the repository; they live in Vercel's environment variables and in the services themselves.

## Services

| Service                                              | What it is for                                                            | Owner account                                                                                            | Free-tier limits that matter                                                                                                               |
| ---------------------------------------------------- | ------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------ |
| **GitHub organisation** `KFUPM-COMPUTER-CLUB`        | the code, pull requests, CI, deploy workflow                              | the club's GitHub org; owners are the current lead and web lead                                          | public repo: unlimited Actions minutes                                                                                                     |
| **Vercel** project `cckfupm-website` (team `adib25`) | hosting, preview per pull request, functions, cron, environment variables | the web lead's Vercel account; add the next lead as a team member                                        | 100 GB bandwidth/month, 1 cron job per day on Hobby, 60 s function limit (300 s with Fluid compute)                                        |
| **Supabase** project (Stockholm)                     | Postgres, Auth, Storage                                                   | the web lead's Supabase account; invite the next lead as Owner                                           | 500 MB database, 1 GB storage, 50 000 monthly active users; the project pauses after a week without traffic, which the daily cron prevents |
| **GitHub OAuth app** "KFUPM Computer Club"           | "Continue with GitHub"                                                    | created under the GitHub org (Settings → Developer settings → OAuth Apps), not under a person            | none                                                                                                                                       |
| **Google Cloud OAuth client**                        | "Continue with Google"                                                    | a Google Cloud project under the club's Google account; the consent screen lists `/privacy` and `/terms` | none for sign-in                                                                                                                           |
| **Resend** (when switched on)                        | the queued emails                                                         | the club's email account                                                                                 | 100 emails/day and 3 000/month; the queue stops at 90/day                                                                                  |

## Where the keys are

All runtime secrets are Vercel environment variables (Vercel → project → Settings → Environment Variables), set for Production and Preview. `.env.example` lists each with a one-line explanation. Nobody needs them to run the site locally in seed mode.

## Rotating a key

- **Supabase secret key**: Supabase → Project Settings → API → generate a new secret key → put it in Vercel as `SUPABASE_SECRET_KEY` → redeploy → revoke the old one. The publishable key is public by design and only needs rotating if the secret key leaked with it.
- **GitHub OAuth secret**: GitHub org → Developer settings → the app → Generate a new client secret → paste it in Supabase → Authentication → Providers → GitHub → delete the old secret.
- **Google OAuth secret**: Google Cloud → Credentials → the client → Reset secret → paste in Supabase → Providers → Google.
- **Resend API key**: Resend → API Keys → create a new key → Vercel `RESEND_API_KEY` → redeploy → delete the old key.
- **Vercel deploy token** (`VERCEL_TOKEN` in GitHub Actions secrets): Vercel → Account → Tokens → create → GitHub repo → Settings → Secrets → update → delete the old token.
- **`CRON_SECRET`**: any new random string in Vercel; the cron route reads it on the next call.

After any rotation, open the preview or production site, sign in, and load `/admin` once.

## Routine

- The daily cron (`/api/cron/daily`, 03:00 UTC) sends queued mail and touches the database so the free project never pauses. If Supabase shows "paused", restore it in the dashboard and check the cron in Vercel → Cron Jobs.
- `/admin` shows the email counts and warns at 80% of the daily or monthly limit.
- The audit log in `/admin/audit` records every admin action; content edits can be undone there.
- Database changes are SQL files under `supabase/migrations/`, run by a maintainer in the Supabase SQL editor; `0001_init.sql` is never edited after it has run.

## Handover checklist (when officers change)

1. **GitHub**: make the new web lead an owner of the organisation and add them to `CODEOWNERS`; remove people who left from the org's teams.
2. **Vercel**: add the new lead to the team with the Member role; transfer ownership if the previous lead is leaving.
3. **Supabase**: invite the new lead as Owner of the project; remove leavers.
4. **Google Cloud**: add the new lead as Owner of the project that holds the OAuth client.
5. **Resend** (if in use): add the new lead to the team.
6. **Admins on the site**: set `ADMIN_EMAILS` in Vercel to the new leads' sign-in emails and redeploy; in `/admin/members` set the roles of the new board (officer, reviewer) and demote leavers to member.
7. **Board page**: in `/admin/board`, untick "current" for the old board (they move to the alumni archive) and add the new one.
8. **Settings**: check the members-only group links, the social links and the club email in `/admin/settings`.
9. **Rotate** the Supabase secret key, the Resend key and the Vercel token if any leaver had them.
10. **Docs**: update the owner account column above and the names in `CONTRIBUTORS.md`.
