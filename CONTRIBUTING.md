# Contributing

Setup first: [docs/SETUP.md](docs/SETUP.md). New to Git? Watch GitHub's *GitHub for Beginners* playlist linked there. This page is how **we** work.

## Rules

1. Nobody pushes to `main`. Everything goes through a pull request (GitHub blocks direct pushes).
2. **One task = one branch = one pull request.** Keep PRs small; under ~300 changed lines reviews fast.
3. Follow the task guide. If you think something in it is wrong, say so in the issue before changing direction.
4. Stuck for 30 minutes? Comment on the issue and tag Adib. Don't sit on it.

## The flow

### 1. Pick your task
- Read [tasks/README.md](tasks/README.md). Your role (the 4 roles) came from the form; the tasks under your role are yours, already assigned to you on GitHub.
- Start in order. Check **Needs first** at the top of the task: those must be merged, or branch from their branch.
- On the **Projects** board, move your card to **In progress**.
- Finished everything? Take any unassigned task: comment "I'll take this" and assign yourself.

### 2. Branch
```bash
git checkout main
git pull
git checkout -b feat/t06-events-page
```
Names: `feat/…` new feature · `fix/…` bug · `content/…` content · `design/…` styles · `docs/…` docs.

### 3. Work, then commit
```bash
npm run dev                      # check your change in the browser, phone size too (F12 → phone icon)
git add .
git commit -m "feat: events page with upcoming/past filter (#12)"
```
Commit message = type + what changed, with the issue number. Commit as often as you like.

### 4. Push and open a pull request
```bash
git push -u origin feat/t06-events-page
```
GitHub shows **Compare & pull request**. Fill in the template:
- Title like the commit message
- `Closes #12` in the description: this links and auto-closes the issue
- Screenshots for anything visual (phone + laptop)
- Reviewers are added automatically (the managers, via `CODEOWNERS`). Move your card to **In review**.

### 5. Checks, preview, review
- **checks** must be green ✓. Red ✗ → click *Details*, fix, push again. The PR updates by itself.
- **Vercel** comments a preview link. Open it on your phone.
- Review comments: fix on the **same branch**, push, reply "Done", then **Re-request review**. Don't open a new PR.

### 6. Merged
Adib squashes and merges. The site updates in about a minute. Delete your branch, then start your next task from step 2.

## Staying up to date / conflicts

```bash
git checkout main && git pull
git checkout your-branch
git merge main          # fix conflicts in VS Code (Accept Current / Incoming / Both), then:
git add . && git commit
git push
```
Conflicts are normal when two people edit `global.css`. Ask if unsure.

## Code rules

- **Astro pages** in `src/pages/`, shared pieces in `src/components/`, every page uses `BaseLayout`.
- **CSS** only in `src/styles/global.css`, only with the variables. No new colors, no Tailwind, no libraries without asking Adib.
- **No text that belongs in content** typed into pages: club info comes from `src/data/site.json`, the rest from collections.
- **Images:** in `public/images/…`, under 200 KB ([squoosh.app](https://squoosh.app)), always with `alt`.
- **Never commit** tokens, passwords, or personal phone numbers.
- Run `npm run build` before you push. If it fails locally, it fails in checks.

## Reviewing others

Anyone can review. Open the preview, try it on your phone, comment on lines in **Files changed**. Be specific and kind: talk about the code, not the person.
