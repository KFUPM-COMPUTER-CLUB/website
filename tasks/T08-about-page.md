# T08 · About page with team grid

| Owner | Prerequisites | Labels |
|---|---|---|
| Designer | T02, T04 | role: designer, type: feature, P1 |

## Objective

Build `src/pages/about.astro`: the club's description, the team, contact links, and website credits.

## Procedure

1. Hero: eyebrow "About", `.h1` "We are the Computer Club.", and `.lead` set to `site.description`.
2. **What we do**: four cards in a `.grid--4`: Workshops, Talks, Hackathons, Community writing, one or two sentences each.
3. **Team** (`.section--white`): `getCollection('team')` sorted by `order`. Each card shows a square photograph (`object-fit: cover`, `alt` set to the name), the name, the role, and a LinkedIn link when present. The grid must work with 4, 7, or 12 people.
4. **Find us**: a link list with Instagram, X, LinkedIn, Discord, WhatsApp, and email, all from `site.json`.
5. **Website credits**: "Built by" followed by the names in `CONTRIBUTORS.md`. A static list in the page is acceptable.

## Acceptance criteria

- The page renders correctly with the sample team on a phone and a laptop.

## Submission

Branch, commit, and open a pull request containing `Closes #<issue number>`. The full procedure is in [CONTRIBUTING.md](../CONTRIBUTING.md). If you are blocked for more than 30 minutes, comment on the issue and mention your mentor, **@adib-alqurashi** (Adib).
