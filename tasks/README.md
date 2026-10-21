# Task index

Each task has a specification in this folder and a corresponding issue on GitHub. Work on tasks in the order listed for your role. The **Prerequisites** column lists tasks that must be merged before you begin; if a prerequisite is still in review, branch from its branch.

**Overall sequence:** T01 and T02 (complete) → T04, T10 → T03, T05, T06, T07, T08 → T09, T11, T12, T13, T14 → T15 → launch.

## Lead developer

Mentor: Yogesh Krishna Thakur ([@YKrishna17](https://github.com/YKrishna17))

| Task | Prerequisites | Status |
|---|---|---|
| [T01 · Astro project, base layout, header and footer](T01-astro-project-and-layout.md) | — | Complete ([#32](https://github.com/KFUPM-COMPUTER-CLUB/website/pull/32), [#34](https://github.com/KFUPM-COMPUTER-CLUB/website/pull/34)) |
| [T05 · News list page and article page](T05-news-and-post-pages.md) | T01, T04 | Open |
| [T09 · RSS feed and sitemap](T09-rss-and-sitemap.md) | T05 | Open |

## Designer

Mentor: Adib Alqurashi ([@adib-alqurashi](https://github.com/adib-alqurashi))

| Task | Prerequisites | Status |
|---|---|---|
| [T02 · Design system: global.css and style guide](T02-design-system.md) | T01 | Complete ([#36](https://github.com/KFUPM-COMPUTER-CLUB/website/pull/36)) |
| [T03 · Home page](T03-home-page.md) | T02, T04 | Open |
| [T08 · About page with team grid](T08-about-page.md) | T02, T04 | Open |
| [T12 · Mobile and accessibility review](T12-mobile-and-accessibility.md) | T03, T05, T06, T07, T08 | Open |

## Content developer

Mentor: Yogesh Krishna Thakur ([@YKrishna17](https://github.com/YKrishna17))

| Task | Prerequisites | Status |
|---|---|---|
| [T04 · Content collections and sample data](T04-content-collections.md) | T01 | Open |
| [T06 · Events page with Upcoming / Past filter](T06-events-page.md) | T02, T04 | Open |
| [T07 · Newsletter page and Write-for-us page](T07-newsletter-and-write-pages.md) | T02, T04 | Open |
| [T13 · Replace sample content with real content](T13-real-content.md) | T04 and the content folder from Yogesh | Open |

## QA and launch

Mentor: Adib Alqurashi ([@adib-alqurashi](https://github.com/adib-alqurashi))

| Task | Prerequisites | Status |
|---|---|---|
| [T10 · Automated checks on every pull request](T10-pr-checks.md) | T01 | Open |
| [T11 · SEO, share previews, favicons and 404 page](T11-seo-share-404.md) | T01, T02 | Open |
| [T14 · Motion: scroll reveal, header blur, hover effects](T14-motion.md) | T02, T03 | Open |
| [T15 · Final test on real devices and browsers](T15-final-test.md) | All P0 tasks merged | Open |

## All members

| Task | Prerequisites | Status |
|---|---|---|
| [S0 · Starter task: add yourself to CONTRIBUTORS.md](S0-starter-add-yourself.md) | — | Complete for current members |
| [X1 · Arabic and right-to-left support (post-launch)](X1-arabic-rtl.md) | Launch | Deferred |

## Priority labels

| Label | Meaning |
|---|---|
| `P0` | Required for launch |
| `P1` | Should be completed before launch if time allows |
| `P2` | After launch |

## Specification format

Every task specification has the same sections: a summary table (owner, prerequisites, labels), **Objective**, **Procedure**, **Acceptance criteria**, and **Submission**. The issue on GitHub carries the same text; if the two differ, the file in this folder is authoritative.
