# T08 · About page with team grid

| Owner | Needs first | Labels |
|---|---|---|
| **Designer** | T02, T04 | role: designer, type: feature, P1 |

File: `src/pages/about.astro`.

## Sections
1. Hero: eyebrow "About", `.h1` "We are the Computer Club.", `.lead` = `site.description`.
2. "What we do": 4 cards in `.grid--4`: Workshops, Talks, Hackathons, Community writing (1–2 lines each).
3. **Team** (`.section--white`): `getCollection('team')`, sorted by `order`. Each card: square photo (`object-fit: cover`, `alt` = name), name, role, LinkedIn link if present. Works with 4, 7 or 12 people.
4. "Find us": link list with Instagram, X, LinkedIn, Discord, WhatsApp, email, all from `site.json`.
5. "Website credits": "Built by:" + names from `CONTRIBUTORS.md`. Type them in a list here, that's fine.

## Done when
- Looks right with the sample team on phone and laptop

---
**How to submit:** branch → commit → pull request with `Closes #<issue number>` (full steps in [CONTRIBUTING.md](../CONTRIBUTING.md)). Stuck for 30 minutes? Comment on the issue and tag Adib.
