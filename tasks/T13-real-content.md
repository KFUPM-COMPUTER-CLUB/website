# T13 · Replace all sample content with real content

| Owner | Needs first | Labels |
|---|---|---|
| **Content developer** | T04 + the content folder from Yogesh | role: content-dev, type: content, P0 |

Yogesh shares a OneDrive folder `CC Website Content` with everything below.

## Steps
1. **Team**: resize photos to **600×600**, under 150 KB ([squoosh.app](https://squoosh.app)), save as `public/images/team/firstname-lastname.jpg`. Fill `src/data/team.json`.
2. **Events**: fill `src/data/events.json` from `events.xlsx`. Photos → `public/images/events/`, under 200 KB, 1200px wide. One upcoming event `featured: true`.
3. **Newsletter**: fill `src/data/newsletter.json`.
4. **site.json**: real `email`, `stats`, all `links` (the forms and community links from Yogesh).
5. Delete all `SAMPLE:` posts, events, team members and the placeholder photo.
6. In VS Code press **Ctrl+Shift+F** (Mac: Cmd+Shift+F), search `SAMPLE` and then `REPLACE`. Both must find **nothing** in `src/`.

## Done when
- No sample or placeholder content anywhere; `npm run build` works

---
**How to submit:** branch → commit → pull request with `Closes #<issue number>` (full steps in [CONTRIBUTING.md](../CONTRIBUTING.md)). Stuck for 30 minutes? Comment on the issue and tag your mentor **@YKrishna17** (Yogesh).
