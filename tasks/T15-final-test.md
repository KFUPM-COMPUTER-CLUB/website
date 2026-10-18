# T15 · Final test on real phones and browsers

| Owner | Needs first | Labels |
|---|---|---|
| **QA & launch** | all P0 tasks merged | role: qa, type: bug, P0 |

Everyone helps; you lead and keep the list.

## Test on
iPhone Safari · Android Chrome · Windows Chrome · Edge · Firefox · Mac Safari (if anyone has one)

## Checklist for every page (Home, Events, News, a post, Newsletter, Write, About, 404)
- [ ] Loads in under 3 seconds on phone data
- [ ] No sideways scroll; phone menu opens/closes
- [ ] Every button and link goes to the right place (click each one)
- [ ] No `SAMPLE`, `REPLACE` or placeholder text
- [ ] Sharing the link in WhatsApp shows image + title
- [ ] `/rss.xml` and `/sitemap-index.xml` open
- [ ] Lighthouse mobile: Performance 90+, Accessibility 95+, SEO 95+ on `/`, `/news`, a post

## For every problem
Open an issue with the **Bug** template. Label **P0** if it must be fixed before launch, otherwise P1/P2. Assign it to whoever owns that page.

## Done when
- Every checklist item is ticked and no **P0** bug is open. Tell Adib that it's ready to launch.

---
**How to submit:** branch → commit → pull request with `Closes #<issue number>` (full steps in [CONTRIBUTING.md](../CONTRIBUTING.md)). Stuck for 30 minutes? Comment on the issue and tag Adib.
