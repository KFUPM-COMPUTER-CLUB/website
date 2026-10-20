# T12 · Mobile and accessibility pass on every page

| Owner | Needs first | Labels |
|---|---|---|
| **Designer** | T03, T05, T06, T07, T08 | role: designer, type: design, P0 |

## Steps
1. Open every page in Chrome → F12 → phone icon at widths **360, 390, 768, 1280**.
2. Fix: no sideways scrolling, nothing cut off, all buttons/links at least **44px** tall, text at least 16px.
3. Add a "Skip to content" link as the first thing in `BaseLayout` (`.visually-hidden` until focused → `#main`).
4. Tab through every page with the keyboard. Everything must be reachable with a visible focus outline. The phone menu opens and closes with Enter and Escape.
5. Every `<img>` has a real `alt` (or `alt=""` if decoration).
6. Run Lighthouse (F12 → Lighthouse → Mobile) on `/`, `/events`, `/news`, one post. Accessibility must be **95+**. Paste the 4 scores in the PR.

## Done when
- 4 Lighthouse Accessibility scores of 95+ in the PR; no sideways scroll at 360px anywhere

---
**How to submit:** branch → commit → pull request with `Closes #<issue number>` (full steps in [CONTRIBUTING.md](../CONTRIBUTING.md)). Stuck for 30 minutes? Comment on the issue and tag your mentor **@adib-alqurashi** (Adib).
