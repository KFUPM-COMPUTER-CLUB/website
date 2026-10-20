# X1 · STRETCH (after launch): Arabic / RTL

| Owner | Needs first | Labels |
|---|---|---|
| **Whoever finishes early** | the v1.0 launch | who: anyone, type: feature, P2 |

Only start after launch (v1.1). Ask a manager (Adib or Yogesh) first.

## Plan
- Astro i18n routing: `i18n: { locales: ['en', 'ar'], defaultLocale: 'en' }` in `astro.config.mjs`
- `src/i18n/ui.ts` with English and Arabic labels; pages under `src/pages/ar/`
- `<html lang="ar" dir="rtl">` and `font-family: var(--font-ar)` for Arabic; a language switch in the header
- Posts stay in the language they were written in

## Done when
- Every UI label has Arabic; RTL has no overlaps

---
**How to submit:** branch → commit → pull request with `Closes #<issue number>` (full steps in [CONTRIBUTING.md](../CONTRIBUTING.md)). Stuck for 30 minutes? Comment on the issue and tag your mentor (see the Team table in the [README](../README.md#team)).
