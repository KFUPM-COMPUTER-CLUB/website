# Contributing

This document defines how changes are made to this repository. It applies to every contributor, including the project managers. Read [docs/SETUP.md](docs/SETUP.md) first if the project is not yet running on your machine.

## 1. Rules

1. **No direct pushes to `main`.** Every change is made on a branch and merged through a pull request. The repository rules enforce this.
2. **One task, one branch, one pull request.** Keep each pull request focused on its task and, where possible, under 300 changed lines.
3. **Follow the task specification.** If you believe a specification is wrong or incomplete, raise it in the task's issue before deviating from it.
4. **Ask within 30 minutes.** If you are blocked for more than 30 minutes, comment on the issue and mention your mentor. Mentors are listed in the [README](README.md#team).
5. **Never commit secrets or personal data.** No tokens, passwords, private phone numbers, or unpublished personal information.

## 2. Workflow

### 2.1 Select a task

- Your tasks are assigned to you on GitHub and listed by role in [tasks/README.md](tasks/README.md).
- Complete tasks in the listed order. Check the **Prerequisites** row of each task: those tasks must be merged first. If a prerequisite is still in review, branch from its branch.
- Move the task's card to **In progress** on the project board.
- When your assigned tasks are complete, you may take any unassigned task: comment "Taking this task" on the issue and assign yourself.

### 2.2 Create a branch

```bash
git checkout main
git pull
git checkout -b feat/t06-events-page
```

Branch names use a type prefix and a short description:

| Prefix | Use |
|---|---|
| `feat/` | New page or feature |
| `fix/` | Bug fix |
| `design/` | Styling and design-system changes |
| `content/` | Articles and data |
| `docs/` | Documentation |
| `chore/` | Tooling, configuration, maintenance |

### 2.3 Commit

```bash
npm run dev            # verify the change in the browser, including at phone width
git add .
git commit -m "feat: events page with upcoming/past filter (#11)"
```

Commit messages follow the pattern `type: summary (#issue)`. Use the same types as the branch prefixes. Commit as often as is useful; the pull request is squashed on merge.

### 2.4 Open a pull request

```bash
git push -u origin feat/t06-events-page
```

Open the pull request from the link GitHub prints, and complete the template:

- Title in the same format as the commit message.
- `Closes #<issue>` in the description, so the issue closes automatically on merge.
- Screenshots at phone and laptop width for any visual change.
- Reviewers are assigned automatically through `CODEOWNERS`. Move the card to **In review**.

### 2.5 Checks, preview, and review

- The **checks** workflow must pass. If it fails, open the run, read the error, fix it, and push again. The pull request updates automatically.
- The **deploy** workflow posts a preview link. Verify your change on the preview, including on a phone.
- Respond to review comments by pushing further commits to the same branch, replying on each comment, and then selecting **Re-request review**. Do not open a second pull request for the same task.

### 2.6 Merge

Your mentor squash-merges the pull request. Production deploys within about a minute. Delete the branch and begin the next task from step 2.2.

## 3. Keeping a branch up to date

```bash
git checkout main && git pull
git checkout <your-branch>
git merge main
# resolve any conflicts in the editor, then:
git add . && git commit
git push
```

Conflicts are expected when several people edit `global.css` at the same time. Resolve them carefully and ask your mentor if the correct resolution is unclear.

## 4. Code rules

- Pages live in `src/pages/`, shared components in `src/components/`, and every page uses `BaseLayout`.
- All CSS lives in `src/styles/global.css` and uses the custom properties defined there. Do not introduce new colours, a second stylesheet, or a styling library. See [docs/DESIGN_SYSTEM.md](docs/DESIGN_SYSTEM.md).
- Do not hard-code club information in pages. Site-wide values come from `src/data/site.json`; everything else comes from the content collections.
- Images are stored under `public/images/`, compressed to under 200 KB ([squoosh.app](https://squoosh.app)), and always have an `alt` attribute.
- Run `npm run build` before pushing. A build that fails locally will fail in the checks.
- Close every HTML element. The Astro 7 compiler treats an unclosed element as a build error.

## 5. Reviewing

Any contributor may review a pull request. Open the preview, test the change on a phone and a laptop, and comment on specific lines under **Files changed**. Comments should describe the problem and, where possible, the expected result. Keep feedback factual and specific to the code.
