# X1 · Arabic and right-to-left support (post-launch)

| Owner | Prerequisites | Labels |
|---|---|---|
| Any member with capacity | The v1.0 launch | who: anyone, type: feature, P2 |

## Objective

Provide an Arabic version of the user interface with right-to-left layout. This task begins only after launch and with the agreement of a project manager.

## Plan

- Enable Astro's internationalised routing in `astro.config.mjs`: `i18n: { locales: ['en', 'ar'], defaultLocale: 'en' }`.
- Create `src/i18n/ui.ts` with English and Arabic labels, and Arabic pages under `src/pages/ar/`.
- Set `<html lang="ar" dir="rtl">` and `font-family: var(--font-ar)` for Arabic pages, and add a language switch to the header.
- Articles remain in the language in which they were written.

## Acceptance criteria

- Every interface label has an Arabic translation.
- The right-to-left layout has no overlapping or clipped elements.

## Submission

Branch, commit, and open a pull request containing `Closes #<issue number>`. The full procedure is in [CONTRIBUTING.md](../CONTRIBUTING.md). If you are blocked for more than 30 minutes, comment on the issue and mention your mentor (see the [team table](../README.md#team)).
