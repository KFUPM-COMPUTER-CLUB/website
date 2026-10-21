# T13 · Replace sample content with real content

| Owner | Prerequisites | Labels |
|---|---|---|
| Content developer | T04, and the content folder provided by Yogesh | role: content-dev, type: content, P0 |

## Objective

Replace every sample entry and placeholder value with the club's real content before launch. The source material is in the shared folder `CC Website Content` provided by your mentor.

## Procedure

1. **Team.** Resize photographs to 600 × 600 pixels and under 150 KB ([squoosh.app](https://squoosh.app)). Save them as `public/images/team/firstname-lastname.jpg` and complete `src/data/team.json`.
2. **Events.** Complete `src/data/events.json` from `events.xlsx`. Save photographs to `public/images/events/` at 1200 px wide and under 200 KB. Mark one upcoming event `featured: true`.
3. **Newsletter.** Complete `src/data/newsletter.json`.
4. **Site.** In `site.json`, enter the real `email`, `stats`, and every entry in `links` (forms and community links from your mentor).
5. Delete every `SAMPLE:` article, event, and team member, and the placeholder photograph.
6. Search the `src/` folder for `SAMPLE` and then `REPLACE` (VS Code: Ctrl+Shift+F, or Cmd+Shift+F on macOS). Both searches must return no results.

## Acceptance criteria

- No sample or placeholder content remains anywhere in `src/`.
- `npm run build` completes without errors.

## Submission

Branch, commit, and open a pull request containing `Closes #<issue number>`. The full procedure is in [CONTRIBUTING.md](../CONTRIBUTING.md). If you are blocked for more than 30 minutes, comment on the issue and mention your mentor, **@YKrishna17** (Yogesh).
