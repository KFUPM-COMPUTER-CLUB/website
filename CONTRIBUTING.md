# Contributing

Contributions are welcome. These are the rules.

## Workflow

- Work from an issue. For anything beyond a small fix, open an issue first and wait for a maintainer to confirm it.
- One issue per branch, one branch per pull request. Branch from `main`.
- Branch names: `feat/…`, `fix/…`, `design/…`, `content/…`, `docs/…`, `chore/…`.
- Commit messages: `type: summary (#issue)`. Pull requests are squash-merged, so commit as often as you like.
- The pull request description states `Closes #<issue>` and includes screenshots at phone and laptop width for any visual change.
- All checks must pass and the preview deployment must be verified before review is requested.
- Every pull request requires a maintainer review (`CODEOWNERS`). Direct pushes to `main` are rejected.

## Code

- Node.js 24. Run `npm run build` before pushing.
- Pages in `src/pages/`, shared components in `src/components/`, every page uses `BaseLayout`.
- All CSS lives in `src/styles/global.css` and uses its tokens. No new colours, no second stylesheet, no CSS framework. See [docs/DESIGN_SYSTEM.md](docs/DESIGN_SYSTEM.md).
- No new dependencies without discussion in the issue.
- No hard-coded club information in pages. Site-wide values come from `src/data/site.json`; the rest from the content collections.
- Images under `public/images/`, under 200 KB, always with `alt`.
- Close every HTML element. Astro 7 treats an unclosed element as a build error.
- Never commit credentials, tokens or personal data.

## Review

Anyone may review. Test on the preview deployment, comment on specific lines, and keep feedback factual and specific to the code. See [CODE_OF_CONDUCT.md](CODE_OF_CONDUCT.md).
