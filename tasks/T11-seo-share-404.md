# T11 · SEO, share previews, favicon and 404 page

| Owner | Needs first | Labels |
|---|---|---|
| **Member 4 — Quality & launch** | T01, T02 | who: member-4, type: feature, P1 |

## Steps
1. `BaseLayout.astro`: add props `image` (default `/og.png`) and use them for:
   ```html
   <link rel="canonical" href={new URL(Astro.url.pathname, Astro.site)} />
   <meta property="og:type" content="website" />
   <meta property="og:title" content={title} />
   <meta property="og:description" content={description} />
   <meta property="og:image" content={new URL(image, Astro.site)} />
   <meta property="og:url" content={new URL(Astro.url.pathname, Astro.site)} />
   <meta name="twitter:card" content="summary_large_image" />
   ```
2. Make sure every page passes its own `title` and `description` (≤ 155 characters).
3. `public/og.png`: **1200×630**, navy background, white CC logo, tagline (make it in Figma or Canva).
4. Favicons from the logo: `public/favicon.png` (32×32), `public/apple-touch-icon.png` (180×180) + the `<link>` tags.
5. `src/pages/404.astro`: uses `BaseLayout`, `.h-display` "404", "This page doesn't exist.", buttons Home and News.
6. `src/pages/styleguide.astro` gets `<meta name="robots" content="noindex">` (add a `noindex` prop to the layout).

## Done when
- Pasting the preview link in WhatsApp shows the image and title
- `/does-not-exist` shows the 404 page

---
**How to submit:** branch → commit → pull request with `Closes #<issue number>` (full steps in [CONTRIBUTING.md](../CONTRIBUTING.md)). Stuck for 30 minutes? Comment on the issue and tag Manager 1.
