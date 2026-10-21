# Development environment setup

Estimated time: 20 minutes. Complete this procedure once, before starting your first task.

## 1. Install the tools

| Tool | Source | Verification |
|---|---|---|
| Git | [git-scm.com/downloads](https://git-scm.com/downloads). On Windows, accept the default options. | `git --version` |
| Node.js 24 LTS | [nodejs.org/en/download](https://nodejs.org/en/download). Select **v24 (LTS)**. npm is included. | `node -v` prints `v24.x`; `npm -v` prints a version |
| Visual Studio Code | [code.visualstudio.com](https://code.visualstudio.com) | |
| VS Code extensions | **Astro** (`astro-build.astro-vscode`), **Prettier**, and optionally **GitLens** | |
| GitHub Desktop (optional) | [desktop.github.com](https://desktop.github.com), for contributors who prefer a graphical Git client | |

On macOS, if Git prompts to install the Command Line Tools, accept.

## 2. Configure Git

```bash
git config --global user.name "Your Name"
git config --global user.email "the-email-address-on-your-github-account"
git config --global init.defaultBranch main
```

The first `git push` opens a browser window to authenticate with GitHub. In GitHub Desktop, sign in under File → Options → Accounts.

## 3. Run the project

```bash
git clone https://github.com/KFUPM-COMPUTER-CLUB/website.git
cd website
code .            # open the folder in VS Code
npm install       # once, after cloning
npm run dev       # development server at http://localhost:4321
```

Edit any file under `src/pages/` and save; the browser reloads automatically. Press `Ctrl+C` in the terminal to stop the server.

## 4. Background reading

Contributors are not expected to be experts, but they must understand the concepts of repository, commit, branch, push, pull request, and merge before starting a task.

| Topic | Resource |
|---|---|
| Git and GitHub fundamentals | [GitHub for Beginners](https://www.youtube.com/@GitHub) playlist on GitHub's YouTube channel |
| Interactive practice | [GitHub Skills](https://skills.github.com), starting with *Introduction to GitHub* |
| Reference | [docs.github.com/get-started](https://docs.github.com/en/get-started) |
| Astro | [Build a blog tutorial](https://docs.astro.build/en/tutorial/0-introduction/) (about two hours) |
| Content collections | [docs.astro.build/en/guides/content-collections](https://docs.astro.build/en/guides/content-collections/) |
| Markdown | [markdownguide.org/basic-syntax](https://www.markdownguide.org/basic-syntax/) |
| CSS | [MDN CSS reference](https://developer.mozilla.org/en-US/docs/Web/CSS) |

## 5. Troubleshooting

| Symptom | Resolution |
|---|---|
| `npm` or `node` is not recognised | Close and reopen the terminal after installing Node.js. On Windows, restart VS Code. |
| `npm install` fails | Confirm `node -v` prints v24. Astro 7 requires Node.js 22.22 or later. Do not delete `package-lock.json` without consulting the lead developer. |
| Port 4321 is already in use | Another development server is running. Stop it, or use the alternative port Astro prints. |
| Permission denied on push | Accept the repository invitation at [github.com/notifications](https://github.com/notifications) or in the invitation email. |
| The build fails with an unclosed-tag error | Astro 7 requires every HTML element to be closed. The error message names the file and line. |
