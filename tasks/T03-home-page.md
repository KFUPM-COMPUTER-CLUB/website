# T03 · Home page

| Owner | Prerequisites | Labels |
|---|---|---|
| Designer | T02, T04 | role: designer, type: feature, P0 |

## Objective

Build the home page, `src/pages/index.astro`, from the design system and the content collections. The page contains no hard-coded club information: all text and links come from `src/data/site.json` and the collections.

## Procedure

Implement the following sections in order.

1. **Hero** (`.section--navy`, full viewport height): eyebrow "KFUPM Computer Club", the tagline in `.h-display`, the description in `.lead`, and two buttons: **Join the club** (`links.join`) and **Read the blog** (`/news`). Below them, the three `stats` in a `.grid--3`. A soft blue radial glow in the background, implemented in CSS only.
2. **Marquee strip**: the `marquee` words scrolling horizontally in a continuous loop (CSS `@keyframes`; duplicate the list so the loop is seamless). The animation stops under `prefers-reduced-motion`.
3. **Next event** (`.section--white`): the event marked `featured: true` whose date is today or later; otherwise the nearest upcoming event. A large split card: image on the left, text on the right (title, date, time, location, summary, **Register** button). Hide the section when there is no upcoming event. Because the site is static, also compare dates in a small `<script>` using a `data-date` attribute so that a past event disappears without a rebuild.
4. **Upcoming events**: the next three events in a `.grid--3`, followed by a link "All events →" to `/events`.
5. **Latest articles** (`.section--paper`): the three newest posts (date, category, title, excerpt), followed by "All articles →" to `/news`.
6. **Newsletter**: heading, one sentence, a **Subscribe** button (`links.newsletterSubscribe`), and "Past issues →" to `/newsletter`.
7. **Three ways in**: a numbered link list: 01 Join the club (`links.join`), 02 Write for us (`/write`), 03 Join the Discord (`links.discord`). Each row shows the number, the title, and an arrow.
8. **Call to action** (accent background): the text "Build with us." and a Join button.

## Acceptance criteria

- All eight sections render correctly with the sample data on a phone and a laptop.
- Editing `site.json` changes the page without any other edit.

## Submission

Branch, commit, and open a pull request containing `Closes #<issue number>`. The full procedure is in [CONTRIBUTING.md](../CONTRIBUTING.md). If you are blocked for more than 30 minutes, comment on the issue and mention your mentor, **@adib-alqurashi** (Adib).
