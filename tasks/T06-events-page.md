# T06 · Events page with Upcoming / Past filter

| Owner | Needs first | Labels |
|---|---|---|
| **Member 3 — Content pages** | T02, T04 | who: member-3, type: feature, P0 |

File: `src/pages/events.astro`.

## Steps
1. Hero: eyebrow "Events", `.h1` "What's happening", 1-line `.lead`.
2. `const events = (await getCollection('events')).sort((a, b) => a.data.date - b.data.date);`
3. Filter buttons: **Upcoming** (default) · **Past** · **All**.
4. Each event as a `.card` in `.grid--3`: image (if any), type `.tag`, title, date (`Wed, 4 Nov 2026`), time, location, summary, **Register** button (`registerUrl`, `target="_blank" rel="noopener"`, hidden if empty or the event is past), **Details** link if `detailsUrl`.
5. Put `data-date="YYYY-MM-DD"` on each card. A `<script>` compares with today's date in the browser to filter Upcoming/Past (so it stays correct without rebuilding). Past events are listed newest first.
6. Empty state per filter: "No upcoming events yet. Follow us on Instagram" (link from `site.json`).

## Done when
- Changing an event's date in `events.json` moves it between Upcoming and Past
- Works on phone

---
**How to submit:** branch → commit → pull request with `Closes #<issue number>` (full steps in [CONTRIBUTING.md](../CONTRIBUTING.md)). Stuck for 30 minutes? Comment on the issue and tag Manager 1.
