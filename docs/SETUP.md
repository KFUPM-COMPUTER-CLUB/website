# Setup: install once

About 20 minutes. Do it before you start your first task.

## 1. Install

| Tool | Get it | Check it works |
|---|---|---|
| **Git** | [git-scm.com/downloads](https://git-scm.com/downloads) (Windows: keep the defaults) | `git --version` |
| **Node.js 24 LTS** | [nodejs.org/en/download](https://nodejs.org/en/download): choose **v24 (LTS)** (npm comes with it) | `node -v` → `v24.x`, `npm -v` |
| **VS Code** | [code.visualstudio.com](https://code.visualstudio.com) | |
| VS Code extensions | **Astro** (astro-build.astro-vscode), **Prettier**, **GitLens** (optional) | |
| **GitHub Desktop** *(optional)* | [desktop.github.com](https://desktop.github.com) if you prefer buttons to the terminal | |

Mac users: if `git` asks to install the Command Line Tools, say yes.

## 2. Configure Git

```bash
git config --global user.name "Your Name"
git config --global user.email "the-email-on-your-github-account"
git config --global init.defaultBranch main
```

Log in once: the first `git push` opens a browser window to sign in to GitHub. (GitHub Desktop: File → Options → Accounts → Sign in.)

## 3. Get the project running

```bash
git clone https://github.com/KFUPM-COMPUTER-CLUB/website.git
cd website
code .                 # opens VS Code here
npm install            # once T01 is merged
npm run dev            # → http://localhost:4321
```

Edit a file in `src/pages/`, save, and the browser updates by itself. `Ctrl+C` stops the server.

## 4. Learn the basics (do this, it pays off)

You don't need to be an expert. Watch or read enough to understand **repo, commit, branch, push, pull request, merge**.

- **GitHub's own YouTube channel:** [youtube.com/@GitHub](https://www.youtube.com/@GitHub) → *Playlists* → **"GitHub for Beginners"** (short videos on Git, GitHub, branches and pull requests).
- **GitHub Skills** (interactive, free): [skills.github.com](https://skills.github.com), start with *Introduction to GitHub*.
- **Git docs:** [docs.github.com/get-started](https://docs.github.com/en/get-started)
- **Astro tutorial** (build a blog in ~2 hours): [docs.astro.build/en/tutorial/0-introduction](https://docs.astro.build/en/tutorial/0-introduction/)
- **Astro content collections** (how our posts work): [docs.astro.build/en/guides/content-collections](https://docs.astro.build/en/guides/content-collections/)
- **Markdown in 10 minutes:** [markdownguide.org/basic-syntax](https://www.markdownguide.org/basic-syntax/)
- **CSS reference:** [developer.mozilla.org/en-US/docs/Web/CSS](https://developer.mozilla.org/en-US/docs/Web/CSS)

## Common problems

| Problem | Fix |
|---|---|
| `npm` / `node` not found | Close and reopen the terminal after installing Node. Windows: restart VS Code. |
| `npm install` errors | Check `node -v` is **v24** (Astro 7 refuses anything older than 22.22). Delete `node_modules` and `package-lock.json` only if the lead developer says so. |
| Port 4321 in use | Another `npm run dev` is running; stop it, or use the new port Astro prints. |
| Permission denied on push | Accept the repository invite: [github.com/notifications](https://github.com/notifications), or the email from GitHub. |
