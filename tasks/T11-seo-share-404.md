# T11 · SEO, share previews, favicons and 404 page

| Owner | Prerequisites | Labels |
|---|---|---|
| QA and launch | T01, T02 | role: qa, type: feature, P1 |

## Objective

Make every page describe itself correctly to search engines and messaging apps, replace the default favicon with the club's, and add a not-found page.

## Procedure

1. In `BaseLayout.astro`, add an `image` prop (default `/og.png`) and render:
   ```html
   <link rel="canonical" href={new URL(Astro.url.pathname, Astro.site)} />
   <meta property="og:type" content="website" />
   <meta property="og:title" content={title} />
   <meta property="og:description" content={description} />
   <meta property="og:image" content={new URL(image, Astro.site)} />
   <meta property="og:url" content={new URL(Astro.url.pathname, Astro.site)} />
   <meta name="twitter:card" content="summary_large_image" />
   ```
2. Confirm that every page passes its own `title` and a `description` of at most 155 characters.
3. Create `public/og.png` at 1200 × 630 pixels: navy background, the white club logo, and the tagline.
4. Add `public/apple-touch-icon.png` (180 × 180) and the corresponding `<link>` tags. A 32 × 32 `favicon.png` and an SVG favicon already exist; replace them only if the logo changes.
5. Create `src/pages/404.astro` using `BaseLayout`: `.h-display` "404", the text "This page does not exist.", and buttons to Home and News.
6. Confirm `/styleguide` passes `noindex` to the layout so that it is excluded from search results.

## Acceptance criteria

- Pasting a preview link into WhatsApp shows the image and title.
- `/does-not-exist` renders the 404 page.

## Submission

Branch, commit, and open a pull request containing `Closes #<issue number>`. The full procedure is in [CONTRIBUTING.md](../CONTRIBUTING.md). If you are blocked for more than 30 minutes, comment on the issue and mention your mentor, **@adib-alqurashi** (Adib).
