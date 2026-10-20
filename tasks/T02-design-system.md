# T02 · Design system: global.css

| Owner | Needs first | Labels |
|---|---|---|
| **Designer** | T01 | role: designer, type: design, P0 |

All styles live in **one file**: `src/styles/global.css`. Plain CSS, no Tailwind, no other libraries. Look reference: the design sample.

## Steps
1. Variables (copy exactly):
   ```css
   :root {
     --navy: #0B1A33; --navy-2: #0F2142; --navy-3: #16305C; --ink: #081226;
     --white: #FFFFFF; --paper: #F3F5F9; --paper-2: #E6EAF2;
     --accent: #2563EB; --accent-2: #4F86FF; --muted: #9FB0C8; --muted-dark: #5B6B85;
     --line-dark: rgba(255,255,255,.14); --line-light: rgba(11,26,51,.14);
     --font-head: 'Mona Sans', system-ui, sans-serif;
     --font-body: 'Hubot Sans', system-ui, sans-serif;
     --font-ar: 'Readex Pro', sans-serif;
     --container: 1240px; --gutter: clamp(16px, 4vw, 32px);
     --radius: 14px;
   }
   ```
2. Base: `body { background: var(--navy); color: var(--white); font: 17px/1.6 var(--font-body); }`, headings in `--font-head` weight 300–400 with `letter-spacing: -0.02em`, links, images `max-width: 100%`.
3. Classes (exact names, others will use them):
   | Class | What |
   |---|---|
   | `.container` | max-width `--container`, side padding `--gutter`, centered |
   | `.section` | padding 96px top/bottom (56px on phone) |
   | `.section--navy` `.section--white` `.section--paper` | background + text color for each |
   | `.eyebrow` | 12px uppercase, letter-spacing .22em, short line before it (`::before`, 24px × 1px) |
   | `.h-display` | `font-size: clamp(44px, 8vw, 112px)`, line-height 1, weight 300 |
   | `.h1` `.h2` `.h3` | clamp sizes 56/40/24px max |
   | `.lead` | 20px, `--muted` |
   | `.btn` | accent background, white text, 48px tall, radius 999px, arrow nudges right on hover |
   | `.btn--ghost` | transparent, 1px border |
   | `.grid` `.grid--2` `.grid--3` `.grid--4` | CSS grid with **1px gaps showing the line color** (background = line color, cells = section color); 1 column under 720px |
   | `.card` | cell padding 32px; hover lifts slightly |
   | `.tag` | small pill for categories |
   | `.prose` | article text: max-width 70ch, styles for h2/h3/p/ul/ol/blockquote/code/pre/img/table |
   | `.visually-hidden` | screen-reader only |
4. Header styles: fixed at top; when scrolled (`body.scrolled`, set by a tiny script in Header) background becomes `rgba(11,26,51,.8)` with `backdrop-filter: blur(12px)`. Under 900px: hide links, show the menu button; `body.nav-open` shows a full-screen navy menu.
5. Focus styles: `:focus-visible { outline: 2px solid var(--accent-2); outline-offset: 3px; }`
6. Create `src/pages/styleguide.astro` showing every class above (for the team; it's noindex).

## Done when
- `/styleguide` shows every class, correct on phone and laptop
- No other CSS file exists; no colors are written outside the variables

---
**How to submit:** branch → commit → pull request with `Closes #<issue number>` (full steps in [CONTRIBUTING.md](../CONTRIBUTING.md)). Stuck for 30 minutes? Comment on the issue and tag your mentor **@adib-alqurashi** (Adib).
