# All tasks: who does what

Every task has its own guide. Managers have their own task list (private). Click it, follow it step by step. **Needs first** = merge those before you start (or branch from their branch).

**Start order:** `T01` first (everyone waits for it) → then `T02`, `T04`, `T10` → then the pages → then `T12`, `T13`, `T09` → `T15` → launch.

## Member 1 — Lead developer

| Task | Needs first |
|---|---|
| [T01 · Create the Astro project, base layout, header and footer](T01-astro-project-and-layout.md) | nothing (do this first, everyone waits for it) |
| [T05 · News list page and single post page](T05-news-and-post-pages.md) | T01, T04 |
| [T09 · RSS feed and sitemap](T09-rss-and-sitemap.md) | T05 |

## Member 2 — Designer

| Task | Needs first |
|---|---|
| [T02 · Design system: global.css](T02-design-system.md) | T01 |
| [T03 · Home page](T03-home-page.md) | T02, T04 |
| [T08 · About page with team grid](T08-about-page.md) | T02, T04 |
| [T12 · Mobile and accessibility pass on every page](T12-mobile-and-accessibility.md) | T03, T05, T06, T07, T08 |

## Member 3 — Content pages

| Task | Needs first |
|---|---|
| [T04 · Content collections and sample data](T04-content-collections.md) | T01 |
| [T06 · Events page with Upcoming / Past filter](T06-events-page.md) | T02, T04 |
| [T07 · Newsletter page and Write-for-us page](T07-newsletter-and-write-pages.md) | T02, T04 |
| [T13 · Replace all sample content with real content](T13-real-content.md) | T04 + the content folder from Manager 2 |

## Member 4 — Quality & launch

| Task | Needs first |
|---|---|
| [T10 · Automatic checks on every pull request](T10-pr-checks.md) | T01 |
| [T11 · SEO, share previews, favicon and 404 page](T11-seo-share-404.md) | T01, T02 |
| [T14 · Motion: scroll reveal, header blur, hover effects](T14-motion.md) | T02, T03 |
| [T15 · Final test on real phones and browsers](T15-final-test.md) | all P0 tasks merged |

## Everyone

| Task | Needs first |
|---|---|
| [S0 · Starter task: add yourself to CONTRIBUTORS.md](S0-starter-add-yourself.md) | nothing |
| [X1 · STRETCH (after launch): Arabic / RTL](X1-arabic-rtl.md) | launch |

**Labels:** `P0` = must have for launch · `P1` = should have · `P2` = after launch.
