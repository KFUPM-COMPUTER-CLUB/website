# T14 · Motion: scroll reveal, header blur, hover effects

| Owner | Prerequisites | Labels |
|---|---|---|
| QA and launch | T02, T03 | role: qa, type: design, P1 |

## Objective

Add restrained motion to the site without affecting performance, and ensure it is fully disabled for users who prefer reduced motion.

## Procedure

1. Create `src/scripts/reveal.js` and import it once in `BaseLayout` with `<script>import '../scripts/reveal.js'</script>`. The script:
   - uses an `IntersectionObserver` to add `.is-visible` to each `.reveal` element when 15 % of it is visible, then stops observing it;
   - toggles `body.scrolled` when `scrollY` exceeds 20 px.
2. In `global.css`: `.reveal { opacity: 0; transform: translateY(24px); transition: opacity .7s ease, transform .7s ease; }` and `.reveal.is-visible { opacity: 1; transform: none; }`.
3. Add `class="reveal"` to section headings and cards on the Home, Events, News, and About pages.
4. Hover effects: links gain an underline that slides in from the left; the `.btn` arrow moves 4 px to the right.
5. Under `@media (prefers-reduced-motion: reduce)`, disable all transitions, the marquee, and the reveal so that every element is immediately visible.
6. Confirm that the Lighthouse Performance score on `/` does not decrease. Record the before and after scores in the pull request.

## Acceptance criteria

- Motion is smooth on a phone.
- With reduced motion emulated (DevTools → Rendering → Emulate CSS media feature prefers-reduced-motion), every element is visible without animation.

## Submission

Branch, commit, and open a pull request containing `Closes #<issue number>`. The full procedure is in [CONTRIBUTING.md](../CONTRIBUTING.md). If you are blocked for more than 30 minutes, comment on the issue and mention your mentor, **@adib-alqurashi** (Adib).
