# Design system

Everything is in `src/styles/global.css` (site) and `src/styles/app.css` (dashboards and admin). Use the tokens and classes below; do not add colours or sizes outside them.

Dark navy and white, one blue accent, large light headings, one-pixel rules instead of boxes. Sections alternate navy, white and paper backgrounds.

## Tokens

| Token         | Value      | Token          | Value                    |
| ------------- | ---------- | -------------- | ------------------------ |
| `--navy`      | `#0B1A33`  | `--accent`     | `#2563EB`                |
| `--navy-2`    | `#0F2142`  | `--accent-2`   | `#4F86FF`                |
| `--navy-3`    | `#16305C`  | `--muted`      | `#9FB0C8`                |
| `--ink`       | `#081226`  | `--muted-dark` | `#5B6B85`                |
| `--white`     | `#FFFFFF`  | `--line-dark`  | `rgba(255,255,255,.14)`  |
| `--paper`     | `#F3F5F9`  | `--line-light` | `rgba(11,26,51,.14)`     |
| `--paper-2`   | `#E6EAF2`  | `--radius`     | `14px`                   |
| `--font-head` | Mona Sans  | `--container`  | `1240px`                 |
| `--font-body` | Hubot Sans | `--gutter`     | `clamp(16px, 4vw, 32px)` |
| `--font-ar`   | Readex Pro | `--header-h`   | `72px`                   |

`.section--*` classes set `--section-bg`, `--section-line` and `--section-muted`; components use these so they work on any background.

## Classes

| Class                                                              | Use                                                     |
| ------------------------------------------------------------------ | ------------------------------------------------------- |
| `.container`                                                       | Centred content, `--container` wide, `--gutter` padding |
| `.section`, `.section--navy`, `.section--white`, `.section--paper` | Page section with background                            |
| `.eyebrow`                                                         | Small uppercase label with a rule before it             |
| `.h-display`, `.h1`, `.h2`, `.h3`, `.lead`                         | Type scale                                              |
| `.btn`, `.btn--ghost`                                              | Buttons; the arrow inside moves on hover                |
| `.grid`, `.grid--2`, `.grid--3`, `.grid--4`, `.card`               | 1px-line grids, one column below 720px                  |
| `.tag`                                                             | Category pill                                           |
| `.prose`                                                           | Article body                                            |
| `.visually-hidden`, `.skip-link`                                   | Accessibility helpers                                   |

Focus: `:focus-visible` outline in `--accent-2`. Motion is disabled under `prefers-reduced-motion`.

To add something: open an issue, add the rule to `global.css` using existing tokens, update this file.
