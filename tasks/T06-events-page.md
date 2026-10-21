# T06 · Events page with Upcoming / Past filter

| Owner | Prerequisites | Labels |
|---|---|---|
| Content developer | T02, T04 | role: content-dev, type: feature, P0 |

## Objective

Build `src/pages/events.astro`: a list of all events with a filter that remains correct without rebuilding the site.

## Procedure

1. Hero: eyebrow "Events", `.h1` "What's happening", and a one-sentence `.lead`.
2. Load and sort the events: `const events = (await getCollection('events')).sort((a, b) => a.data.date.valueOf() - b.data.date.valueOf());`
3. Filter buttons: **Upcoming** (default), **Past**, **All**.
4. Render each event as a `.card` in a `.grid--3`: image (if present), type as a `.tag`, title, date in the form `Wed, 4 Nov 2026`, time, location, summary, a **Register** button (`registerUrl`, `target="_blank" rel="noopener"`, hidden when the URL is empty or the event is past), and a **Details** link when `detailsUrl` is set.
5. Add `data-date="YYYY-MM-DD"` to each card. A `<script>` compares it with the current date in the browser to apply the Upcoming / Past filter. Past events are listed newest first.
6. Empty state for each filter, for example "No upcoming events are scheduled. Follow us on Instagram." with the link from `site.json`.

## Acceptance criteria

- Changing an event's date in `events.json` moves it between Upcoming and Past.
- The page renders correctly on a phone.

## Submission

Branch, commit, and open a pull request containing `Closes #<issue number>`. The full procedure is in [CONTRIBUTING.md](../CONTRIBUTING.md). If you are blocked for more than 30 minutes, comment on the issue and mention your mentor, **@YKrishna17** (Yogesh).
