# T02 · Design system: global.css and style guide

| Owner | Prerequisites | Labels | Status |
|---|---|---|---|
| Designer | T01 | role: designer, type: design, P0 | Complete ([#36](https://github.com/KFUPM-COMPUTER-CLUB/website/pull/36)) |

## Objective

Implement the complete visual system in one stylesheet, `src/styles/global.css`, and a style guide page that demonstrates every class. All later pages are built from these classes only. The reference document is [docs/DESIGN_SYSTEM.md](../docs/DESIGN_SYSTEM.md).

## Procedure

1. Define the tokens exactly as follows:
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
2. Base styles: `body { background: var(--navy); color: var(--white); font: 17px/1.6 var(--font-body); }`; headings in `--font-head` at weight 300–400 with `letter-spacing: -0.02em`; link styles; `img { max-width: 100%; }`.
3. Implement the following classes with these exact names, as other tasks depend on them:

   | Class | Specification |
   |---|---|
   | `.container` | `max-width: var(--container)`, side padding `--gutter`, centred |
   | `.section` | 96px vertical padding (56px on phones) |
   | `.section--navy`, `.section--white`, `.section--paper` | Background and text colour for each surface |
   | `.eyebrow` | 12px uppercase, letter-spacing 0.22em, preceded by a 24px × 1px rule (`::before`) |
   | `.h-display` | `font-size: clamp(44px, 8vw, 112px)`, line-height 1, weight 300 |
   | `.h1`, `.h2`, `.h3` | Fluid sizes with maxima of 56px, 40px, 24px |
   | `.lead` | 20px in the muted colour |
   | `.btn` | Accent background, white text, 48px tall, fully rounded; the arrow moves right on hover |
   | `.btn--ghost` | Transparent with a 1px border |
   | `.grid`, `.grid--2`, `.grid--3`, `.grid--4` | CSS grid with 1px gaps showing the line colour (grid background = line colour, cells = section colour); one column below 720px |
   | `.card` | 32px cell padding; lifts slightly on hover |
   | `.tag` | Small rounded label for categories |
   | `.prose` | Article text: 70ch measure; styles for h2, h3, p, ul, ol, blockquote, code, pre, img, table |
   | `.visually-hidden` | Screen-reader-only content |
4. Header styles: fixed at the top. When scrolled (`body.scrolled`, set by the header script) the background becomes `rgba(11,26,51,.8)` with `backdrop-filter: blur(12px)`. Below 900px the links are hidden and the menu button is shown; `body.nav-open` shows a full-screen navy menu.
5. Focus styles: `:focus-visible { outline: 2px solid var(--accent-2); outline-offset: 3px; }`.
6. Create `src/pages/styleguide.astro` demonstrating every class above. The page is for the team and is excluded from search indexing.

## Acceptance criteria

- `/styleguide` demonstrates every class and renders correctly on a phone and a laptop.
- No other CSS file exists, and no colour value is written outside the token definitions.

## Submission

Branch, commit, and open a pull request containing `Closes #<issue number>`. The full procedure is in [CONTRIBUTING.md](../CONTRIBUTING.md). If you are blocked for more than 30 minutes, comment on the issue and mention your mentor, **@adib-alqurashi** (Adib).
