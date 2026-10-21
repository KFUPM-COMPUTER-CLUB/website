# Design system

The design system is implemented in a single file, `src/styles/global.css`, and demonstrated on the `/styleguide` page. This document is the reference for the tokens and classes that pages and components must use. Introducing colours, font sizes, or spacing values outside this system is not permitted; propose additions in an issue.

## 1. Visual direction

Dark navy and white, with a single blue accent. Large, light-weight headings with tight letter-spacing; generous section spacing; one-pixel rules instead of boxes and shadows. Sections alternate between a navy, white, and light-grey ("paper") background. Motion is restrained and disabled under `prefers-reduced-motion`.

## 2. Tokens

| Token | Value | Use |
|---|---|---|
| `--navy` | `#0B1A33` | Default page and section background |
| `--navy-2` | `#0F2142` | Hover state on navy surfaces |
| `--navy-3` | `#16305C` | Tags, emphasised navy surfaces |
| `--ink` | `#081226` | Text on light sections; code blocks; footer |
| `--white` | `#FFFFFF` | Text on dark sections; white sections |
| `--paper` | `#F3F5F9` | Light-grey section background |
| `--paper-2` | `#E6EAF2` | Hover state on paper surfaces |
| `--accent` | `#2563EB` | Buttons, links, emphasis |
| `--accent-2` | `#4F86FF` | Button hover, focus outline, link underline |
| `--muted` | `#9FB0C8` | Secondary text on dark sections |
| `--muted-dark` | `#5B6B85` | Secondary text on light sections |
| `--line-dark` | `rgba(255, 255, 255, 0.14)` | Rules and grid lines on dark sections |
| `--line-light` | `rgba(11, 26, 51, 0.14)` | Rules and grid lines on light sections |
| `--font-head` | Mona Sans | Headings |
| `--font-body` | Hubot Sans | Body text |
| `--font-ar` | Readex Pro | Arabic text (stretch task X1) |
| `--container` | `1240px` | Maximum content width |
| `--gutter` | `clamp(16px, 4vw, 32px)` | Horizontal page padding |
| `--radius` | `14px` | Corner radius for images and code blocks |
| `--header-h` | `72px` | Height of the fixed header |

Three section-scoped variables are set by the `.section--*` classes and consumed by grids, cards, and muted text: `--section-bg`, `--section-line`, `--section-muted`. Components should reference these rather than a specific colour so that they render correctly on any section background.

## 3. Typography

| Class | Size | Weight | Use |
|---|---|---|---|
| `.h-display` | `clamp(44px, 8vw, 112px)`, line-height 1 | 300 | Page hero headline |
| `h1`, `.h1` | `clamp(36px, 5vw, 56px)` | 300 | Page title |
| `h2`, `.h2` | `clamp(28px, 3.5vw, 40px)` | 300 | Section title |
| `h3`, `.h3` | `clamp(20px, 2vw, 24px)` | 400 | Card and item title |
| `.lead` | `20px` | 400 | Introductory paragraph, in `--section-muted` |
| `.eyebrow` | `12px`, uppercase, letter-spacing `0.22em` | 400 | Short label above a heading, with a 24px rule before it |
| body | `17px`, line-height 1.6 | 400 | Running text |

Headings use `--font-head` with `letter-spacing: -0.02em`. Body text uses `--font-body`.

## 4. Layout

| Class | Behaviour |
|---|---|
| `.container` | Centres content at `--container` width with `--gutter` side padding |
| `.section` | Vertical padding of 96px (56px below 768px). The first section of a page is offset below the fixed header. |
| `.section--navy`, `.section--white`, `.section--paper` | Set the background, text colour, and the three section-scoped variables |
| `.grid`, `.grid--2`, `.grid--3`, `.grid--4` | CSS grid with 1px gaps that show the section line colour. Collapse to one column below 720px. |
| `.card` | A grid cell with 32px padding that lifts on hover |

## 5. Components

| Class | Behaviour |
|---|---|
| `.btn` | Accent background, white text, 48px tall, fully rounded. A child `<span>` or `<svg>` (the arrow) moves 4px right on hover. |
| `.btn--ghost` | Transparent with a 1px border in the current text colour; fills with accent on hover |
| `.tag` | Small rounded label for categories and event types |
| `.prose` | Article body: 70-character measure and styles for headings, paragraphs, lists, quotations, code, images, and tables |
| `.visually-hidden` | Hidden visually but available to assistive technology |
| `.skip-link` | "Skip to content" link, visible only when focused |

## 6. Header and footer

- `.site-header` is fixed to the top of the viewport. When the page is scrolled (`body.scrolled`, set by the header script) it gains a translucent navy background with a blur.
- Below 900px the navigation is hidden behind a **Menu** button. `body.nav-open` shows a full-screen navy menu; the Escape key closes it.
- `.site-footer` uses the `--ink` background with muted text and a top rule.

## 7. Focus and motion

- `:focus-visible` draws a 2px `--accent-2` outline with a 3px offset on every focusable element.
- Transitions are limited to colour, transform, and opacity. Scroll-reveal and the marquee (T14) are disabled under `prefers-reduced-motion: reduce`.

## 8. Extending the system

1. Open an issue describing the need and the proposed class or token.
2. Add the rule to `global.css` in the relevant section, using existing tokens.
3. Add an example to `/styleguide`.
4. Update this document.
