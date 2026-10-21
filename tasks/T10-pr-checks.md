# T10 · Automated checks on every pull request

| Owner | Prerequisites | Labels |
|---|---|---|
| QA and launch | T01 | role: qa, type: chore, P0 |

## Objective

Add a GitHub Actions workflow that validates every pull request: type and content-schema checking, a production build, and an internal link check. Make it a required check on `main`.

## Procedure

1. Install the checker: `npm install -D @astrojs/check typescript`.
2. Create `.github/workflows/checks.yml`:
   ```yaml
   name: checks
   on:
     pull_request:
     push:
       branches: [main]
   jobs:
     checks:
       runs-on: ubuntu-latest
       steps:
         - uses: actions/checkout@v5
         - uses: actions/setup-node@v5
           with:
             node-version-file: .nvmrc   # the same Node.js version as the development environment
             cache: npm
         - run: npm ci
         - run: npx astro check
         - run: npm run build
         - name: Check internal links
           uses: lycheeverse/lychee-action@v2
           with:
             args: --offline --no-progress --root-dir dist 'dist/**/*.html'
             fail: true
   ```
3. Open the pull request and confirm the check passes.
4. Verify that the check detects errors: on a separate test branch, remove the `title` field from a sample article, open a draft pull request, confirm the check fails, then close that pull request.
5. Ask your mentor to add `checks` as a required status check in the `protect-main` ruleset.

## Acceptance criteria

- The check passes on a valid pull request and fails on an invalid one.
- `checks` is a required status check on `main`.

## Submission

Branch, commit, and open a pull request containing `Closes #<issue number>`. The full procedure is in [CONTRIBUTING.md](../CONTRIBUTING.md). If you are blocked for more than 30 minutes, comment on the issue and mention your mentor, **@adib-alqurashi** (Adib).
