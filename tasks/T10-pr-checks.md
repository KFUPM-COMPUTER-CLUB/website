# T10 · Automatic checks on every pull request

| Owner | Needs first | Labels |
|---|---|---|
| **Member 4 — Quality & launch** | T01 | who: member-4, type: chore, P0 |

## Steps
1. `npm install -D @astrojs/check typescript`
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
         - uses: actions/checkout@v4
         - uses: actions/setup-node@v4
           with:
             node-version: 20
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
3. Open the PR and make sure the check turns green ✓.
4. Test it: on a separate test branch, break a post's frontmatter (remove `title`), open a draft PR, confirm the check turns red ✗, then close that PR.
5. Tell Manager 1 to make `checks` a required check on `main`.

## Done when
- Green on a good PR, red on a broken one; `checks` is required on `main`

---
**How to submit:** branch → commit → pull request with `Closes #<issue number>` (full steps in [CONTRIBUTING.md](../CONTRIBUTING.md)). Stuck for 30 minutes? Comment on the issue and tag Manager 1.
