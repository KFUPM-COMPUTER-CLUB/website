<p align="center">
  <a href="https://cckfupm-website.vercel.app">
    <img src="public/logo.png" alt="KFUPM Computer Club" width="150">
  </a>
</p>

<h1 align="center">KFUPM Computer Club — Website</h1>

<p align="center">
  News, events, tutorials and the newsletter of the Computer Club at KFUPM.<br>
  Written by members. Built by students. Open to everyone.
</p>

<p align="center">
  <a href="https://cckfupm-website.vercel.app"><img alt="Live site" src="https://img.shields.io/badge/live-cckfupm--website.vercel.app-0B1A33?style=for-the-badge&logo=vercel&logoColor=white"></a>
</p>

<p align="center">
  <a href="https://github.com/KFUPM-COMPUTER-CLUB/website/actions/workflows/deploy.yml"><img alt="Deploy" src="https://github.com/KFUPM-COMPUTER-CLUB/website/actions/workflows/deploy.yml/badge.svg"></a>
  <img alt="Astro" src="https://img.shields.io/badge/Astro-7-BC52EE?logo=astro&logoColor=white">
  <img alt="Node" src="https://img.shields.io/badge/Node.js-24_LTS-5FA04E?logo=node.js&logoColor=white">
  <a href="LICENSE"><img alt="License: MIT" src="https://img.shields.io/badge/license-MIT-2563EB"></a>
  <a href="https://github.com/KFUPM-COMPUTER-CLUB/website/issues"><img alt="Issues" src="https://img.shields.io/github/issues/KFUPM-COMPUTER-CLUB/website?color=2563EB"></a>
  <a href="https://github.com/KFUPM-COMPUTER-CLUB/website/pulls"><img alt="Pull requests" src="https://img.shields.io/github/issues-pr/KFUPM-COMPUTER-CLUB/website?color=2563EB"></a>
</p>

<p align="center">
  <a href="https://cckfupm-website.vercel.app">Visit the site</a> ·
  <a href="docs/WRITING_A_POST.md">Write an article</a> ·
  <a href="https://github.com/KFUPM-COMPUTER-CLUB/website/issues/new/choose">Report a bug</a> ·
  <a href="CONTRIBUTING.md">Contribute</a>
</p>

---

## About

The club runs workshops, talks, hackathons and competitions all year. Most of it used to vanish into stories and chat groups. This website is the permanent record, and any member can publish on it.

- **Static.** No database, no server, no logins. Every page is plain HTML.
- **Content is files.** An article is one Markdown file. An event is one line of JSON.
- **Links, not forms.** Joining, registering and subscribing open the club's own forms. The site stores no personal data.

## Pages

| Page | Route | Page | Route |
|---|---|---|---|
| Home | `/` | Newsletter | `/newsletter` |
| Events | `/events` | Write for us | `/write` |
| News | `/news` | About | `/about` |
| Article | `/news/<slug>` | Feeds | `/rss.xml`, `/sitemap-index.xml` |

## Built with

| | |
|---|---|
| [Astro](https://astro.build) | Static site generator. Markdown and JSON in, HTML out. |
| Plain CSS | One stylesheet, one set of design tokens. No frameworks. |
| [Vercel](https://vercel.com) | Preview on every pull request, production on every merge. |
| GitHub Actions | Build, type check and link check before anything is merged. |

## Quick start

```bash
git clone https://github.com/KFUPM-COMPUTER-CLUB/website.git
cd website
npm install
npm run dev        # http://localhost:4321
```

Needs Node.js 24 LTS. Full setup guide: [docs/SETUP.md](docs/SETUP.md).

```
src/
├── pages/        one file = one route
├── layouts/      the shared document shell
├── components/   header, footer, cards
├── styles/       global.css, the whole design system
├── content/      articles (Markdown)
└── data/         site, events, team, newsletter (JSON)
```

## Contributing

1. Pick an issue, or open one.
2. Branch from `main`, make the change, run `npm run build`.
3. Open a pull request. A preview link appears automatically.
4. A maintainer reviews and merges. The site updates within a minute.

The full workflow is in [CONTRIBUTING.md](CONTRIBUTING.md). Want to publish an article without touching code? See [docs/WRITING_A_POST.md](docs/WRITING_A_POST.md).

| Guide | What it covers |
|---|---|
| [docs/SETUP.md](docs/SETUP.md) | Installing the tools |
| [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) | How the site is built and deployed |
| [docs/DESIGN_SYSTEM.md](docs/DESIGN_SYSTEM.md) | Colours, type, layout, components |
| [docs/WRITING_A_POST.md](docs/WRITING_A_POST.md) | Publishing an article |
| [tasks/](tasks/README.md) | The build plan, one specification per task |

## Team

Built and maintained by student members of the Computer Club. Everyone who has contributed is in [CONTRIBUTORS.md](CONTRIBUTORS.md).

<p align="center">
  <a href="https://github.com/KFUPM-COMPUTER-CLUB/website/graphs/contributors">
    <img src="https://contrib.rocks/image?repo=KFUPM-COMPUTER-CLUB/website" alt="Contributors">
  </a>
</p>

## License

Code is released under the [MIT License](LICENSE). Articles belong to their authors.

<p align="center">
  <sub>Computer Club · King Fahd University of Petroleum and Minerals</sub>
</p>
