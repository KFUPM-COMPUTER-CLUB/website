# T03 · Home page

| Owner | Needs first | Labels |
|---|---|---|
| **Designer** | T02, T04 | role: designer, type: feature, P0 |

File: `src/pages/index.astro`. Everything comes from `src/data/site.json` and the collections; no club text typed into the page.

## Sections, top to bottom
1. **Hero** (`.section--navy`, full screen height): eyebrow "KFUPM Computer Club", `.h-display` tagline, `.lead` description, buttons **Join the club** (`links.join`) and **Read the blog** (`/news`). Under it the 3 `stats` in a `.grid--3`. A soft blue radial glow in the background (CSS only).
2. **Marquee strip**: the `marquee` words scrolling sideways forever (CSS `@keyframes`, duplicate the list for a seamless loop). Stops when `prefers-reduced-motion`.
3. **Next event** (`.section--white`): the event with `featured: true` whose date is today or later; if none, the nearest upcoming. Big split card: image left, text right (title, date, time, place, summary, **Register** button). Hide the section if there are no upcoming events. Since the site is static, also compare dates in a small `<script>` using `data-date`, so a past event disappears without a rebuild.
4. **Upcoming events**: next 3 events in `.grid--3` + "All events →" `/events`.
5. **Latest posts** (`.section--paper`): newest 3 posts (date, category, title, excerpt) + "All posts →" `/news`.
6. **Newsletter** block: heading, 1 line, **Subscribe** button (`links.newsletterSubscribe`), "Past issues →" `/newsletter`.
7. **Three ways in**: numbered link list: 01 Join the club, 02 Write for us (`/write`), 03 Join Discord (`links.discord`). Each row: number, title, arrow.
8. **Call-to-action band** (accent background): "Build with us." + Join button.

## Done when
- All 8 sections work with the sample data, on phone and laptop
- Changing `site.json` changes the page with no other edit

---
**How to submit:** branch → commit → pull request with `Closes #<issue number>` (full steps in [CONTRIBUTING.md](../CONTRIBUTING.md)). Stuck for 30 minutes? Comment on the issue and tag Adib.
