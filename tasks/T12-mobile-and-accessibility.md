# T12 · Mobile and accessibility review

| Owner | Prerequisites | Labels |
|---|---|---|
| Designer | T03, T05, T06, T07, T08 | role: designer, type: design, P0 |

## Objective

Verify and correct every page for small screens, keyboard use, and assistive technology, measured with Lighthouse.

## Procedure

1. Open every page in Chrome DevTools device mode at widths of **360, 390, 768, and 1280** pixels.
2. Correct any horizontal scrolling, clipped content, interactive elements shorter than **44 px**, or text smaller than 16 px.
3. Confirm that the "Skip to content" link in `BaseLayout` is the first focusable element and moves focus to `#main`.
4. Navigate every page with the keyboard only. Every interactive element must be reachable and show a visible focus outline. The mobile menu must open with Enter and close with Escape.
5. Confirm that every `<img>` has a meaningful `alt` attribute, or `alt=""` when decorative.
6. Run Lighthouse (DevTools → Lighthouse → Mobile) on `/`, `/events`, `/news`, and one article. The Accessibility score must be **95 or higher**. Record the four scores in the pull request.

## Acceptance criteria

- Four Lighthouse Accessibility scores of 95 or higher are recorded in the pull request.
- No page scrolls horizontally at 360 px.

## Submission

Branch, commit, and open a pull request containing `Closes #<issue number>`. The full procedure is in [CONTRIBUTING.md](../CONTRIBUTING.md). If you are blocked for more than 30 minutes, comment on the issue and mention your mentor, **@adib-alqurashi** (Adib).
