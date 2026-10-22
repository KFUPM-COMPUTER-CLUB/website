# Scripts

## `import-seed.mjs`: seed content into Supabase

Copies the seed content that ships in the repository (`src/data/*.json`, `src/content/posts/*.md`,
`src/assets/photos`, `src/assets/partners`) into the database and the `media` storage bucket.
Run it once after applying `supabase/migrations/0001_init.sql`, and again whenever the seed files
change. It is idempotent: a second run finds its own rows and changes nothing.

```bash
node scripts/import-seed.mjs            # import
node scripts/import-seed.mjs --dry-run  # read-only; prints every row it would insert or update
node scripts/import-seed.mjs --force    # re-process every image; overwrite admin-owned settings
```

Needs `PUBLIC_SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY`, read from `.env` in the project root or
from the environment (the environment wins). The service key bypasses row level security, so run
this from a trusted machine only; the key is never printed. A dry run works without either variable
and then assumes an empty database. Supabase project region: Stockholm (eu-north-1).

### What it writes

| Source | Table | Notes |
| --- | --- | --- |
| `src/assets/photos/*.jpg` | `media`, storage `photos/<name>/` | WebP at 480/960/1600 (never upscaled, quality 80) plus the original; `key` = file name, `tags` `seed, photo` |
| `src/assets/partners/*` | `media`, storage `partners/` | SVGs as-is; PNG/JPG also get WebP slots capped at 800px; `tags` `seed, partner` |
| `events.json` | `events` | times are Riyadh (UTC+3); `ends_at` from `endDate` (end of day) or the end of a time range |
| `highlights.json`, `stories.json` | `highlights`, `stories` | ordered by position in the file |
| every seed photo | `strip_photos` | label from the matching event or highlight, else an event on the same day, else `@KFUPM_CC` |
| `impact.json` | `impact_semesters`, `impact_items` | items removed from the JSON are deleted |
| `partners.json` | `partners` | `visited` entries are inserted hidden |
| `team.json` | `officer_terms` | placeholder photos are not uploaded; `user_id`/`photo_key` set by admins are kept |
| `site.json` | `settings` (`site`, `links`, `home`, `made_by`, `banner`, `whatsapp_groups`, `email_templates`), `faq` | `REPLACE` placeholders become empty strings |
| `src/content/posts/*.md` | `posts` | frontmatter + a small Markdown converter; published, `author_id` null |
| `solvers.json` | `flag_solvers` | approved |

Every row id is derived from its seed identity (`sha1("event:" + id)` laid out as a UUID), so the
same seed always maps to the same row and nothing is duplicated. `cover_key`, `photo_key` and
`logo_key` are only set when the referenced file exists; anything else is listed under "skipped".

### Re-running

- A row is rewritten only when a column differs from the seed; identical rows are reported as
  unchanged and no `updated_at` is touched.
- Images are not re-processed when their `media` row exists and every size answers a `HEAD`
  request with 200. `--force` regenerates and re-uploads all of them.
- Admin-owned data survives re-runs: `media.alt` and `uploaded_by`, `posts.author_id`,
  `cover_key` and `content_json`, `officer_terms.user_id` and `photo_key`, and the `links`,
  `banner`, `whatsapp_groups` and `email_templates` settings (the last four are only overwritten
  with `--force`).
- The summary at the end lists inserted / updated / unchanged / deleted / skipped counts per table
  and the reasons for every skip. The exit code is 1 when anything failed.
