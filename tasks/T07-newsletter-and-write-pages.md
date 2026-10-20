# T07 · Newsletter page and Write-for-us page

| Owner | Needs first | Labels |
|---|---|---|
| **Content developer** | T02, T04 | role: content-dev, type: feature, P1 |

## `src/pages/newsletter.astro`
1. Hero: eyebrow "Newsletter", `.h1` "The CC newsletter", 1 line, **Subscribe** button (`links.newsletterSubscribe`).
2. List of issues from `getCollection('newsletter')`, newest first: issue number, title, date, summary, "Read →" (`url`, new tab).

## `src/pages/write.astro`
1. Hero: eyebrow "Write for us", `.h1` "Your story belongs here.", `.lead` "Any club member can publish on the CC blog."
2. **What we publish**: 4 cards: Tutorials · Project stories · Event recaps · Experiences & opinions (1 line each).
3. **How it works**: 4 numbered steps: 1 Pick a topic → 2 Write 300–1200 words → 3 Submit → 4 We edit with you and publish.
4. Two buttons: **Submit with the form** (`links.writeForUs`) and **Submit on GitHub** (link to `docs/WRITING_A_POST.md` on GitHub).
5. Short rules list: your own words, your own or allowed photos, nothing private.

## Done when
- Both pages work on phone; every button uses a link from `site.json`

---
**How to submit:** branch → commit → pull request with `Closes #<issue number>` (full steps in [CONTRIBUTING.md](../CONTRIBUTING.md)). Stuck for 30 minutes? Comment on the issue and tag your mentor **@YKrishna17** (Yogesh).
