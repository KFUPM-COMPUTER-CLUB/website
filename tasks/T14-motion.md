# T14 · Motion: scroll reveal, header blur, hover effects

| Owner | Needs first | Labels |
|---|---|---|
| **Member 4 — Quality & launch** | T02, T03 | who: member-4, type: design, P1 |

## Steps
1. `src/scripts/reveal.js`, imported once in `BaseLayout` with `<script>import '../scripts/reveal.js'</script>`:
   - IntersectionObserver adds `.is-visible` to every `.reveal` element when 15% is on screen (then unobserve).
   - On scroll, toggle `body.scrolled` when `scrollY > 20`.
2. In `global.css`: `.reveal { opacity: 0; transform: translateY(24px); transition: opacity .7s ease, transform .7s ease; }` and `.reveal.is-visible { opacity: 1; transform: none; }`
3. Add `class="reveal"` to section headings and cards on Home, Events, News, About.
4. Hover: links get an underline that slides in from the left; `.btn` arrow moves 4px right.
5. **Reduced motion:** `@media (prefers-reduced-motion: reduce)` turns off all transitions, the marquee and the reveal (elements just show).
6. Lighthouse Performance must not drop: paste before/after on `/`.

## Done when
- Smooth on phone; everything is visible with reduced motion on (test in DevTools → Rendering → Emulate prefers-reduced-motion)

---
**How to submit:** branch → commit → pull request with `Closes #<issue number>` (full steps in [CONTRIBUTING.md](../CONTRIBUTING.md)). Stuck for 30 minutes? Comment on the issue and tag Manager 1.
