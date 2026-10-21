# T15 · Final test on real devices and browsers

| Owner | Prerequisites | Labels |
|---|---|---|
| QA and launch | All P0 tasks merged | role: qa, type: bug, P0 |

## Objective

Verify the complete site on real devices and browsers before launch, record every defect as an issue, and confirm that no launch-blocking defect remains. The whole team participates; the QA owner leads and maintains the list.

## Test matrix

iPhone Safari · Android Chrome · Windows Chrome · Edge · Firefox · macOS Safari (where available)

## Checklist, for every page (Home, Events, News, one article, Newsletter, Write, About, 404)

- [ ] Loads in under 3 seconds on a mobile connection
- [ ] No horizontal scrolling; the mobile menu opens and closes
- [ ] Every button and link leads to the correct destination (test each one)
- [ ] No `SAMPLE`, `REPLACE`, or placeholder text
- [ ] Sharing the link in WhatsApp shows the image and title
- [ ] `/rss.xml` and `/sitemap-index.xml` open
- [ ] Lighthouse (mobile): Performance 90+, Accessibility 95+, SEO 95+ on `/`, `/news`, and one article

## Recording defects

Open one issue per defect using the **Bug** template. Label it **P0** if it must be fixed before launch, otherwise P1 or P2, and assign it to the owner of the affected page.

## Acceptance criteria

- Every checklist item is confirmed for every page.
- No P0 issue is open. Inform your mentor that the site is ready to launch.

## Submission

Branch, commit, and open a pull request containing `Closes #<issue number>`. The full procedure is in [CONTRIBUTING.md](../CONTRIBUTING.md). If you are blocked for more than 30 minutes, comment on the issue and mention your mentor, **@adib-alqurashi** (Adib).
