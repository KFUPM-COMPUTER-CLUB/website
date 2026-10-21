# T07 · Newsletter page and Write-for-us page

| Owner | Prerequisites | Labels |
|---|---|---|
| Content developer | T02, T04 | role: content-dev, type: feature, P1 |

## Objective

Build the two pages that direct readers to external actions: subscribing to the newsletter and submitting an article.

## Procedure

### `src/pages/newsletter.astro`

1. Hero: eyebrow "Newsletter", `.h1` "The CC newsletter", one sentence, and a **Subscribe** button (`links.newsletterSubscribe`).
2. The issues from `getCollection('newsletter')`, newest first: issue number, title, date, summary, and a "Read →" link to `url` opening in a new tab.

### `src/pages/write.astro`

1. Hero: eyebrow "Write for us", `.h1` "Your story belongs here.", `.lead` "Any club member can publish on the CC blog."
2. **What we publish**: four cards: Tutorials, Project stories, Event recaps, Experiences and opinions, one sentence each.
3. **How it works**: four numbered steps: 1 Choose a topic → 2 Write 300–1,200 words → 3 Submit → 4 We edit with you and publish.
4. One button: **Submit with the form** (`links.writeForUs`).
5. A short list of rules: your own words, your own or permitted photographs, no private information about others.

## Acceptance criteria

- Both pages render correctly on a phone.
- Every button uses a link from `site.json`.

## Submission

Branch, commit, and open a pull request containing `Closes #<issue number>`. The full procedure is in [CONTRIBUTING.md](../CONTRIBUTING.md). If you are blocked for more than 30 minutes, comment on the issue and mention your mentor, **@YKrishna17** (Yogesh).
