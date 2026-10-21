# T01 · Astro project, base layout, header and footer

| Owner | Prerequisites | Labels | Status |
|---|---|---|---|
| Lead developer | — (all other tasks depend on this one) | role: lead-dev, type: feature, P0 | Complete ([#32](https://github.com/KFUPM-COMPUTER-CLUB/website/pull/32), [#34](https://github.com/KFUPM-COMPUTER-CLUB/website/pull/34)) |

## Objective

Create the Astro project with the shared layout, header, footer, and one placeholder page per route, so that every later task has a working base to build on.

## Procedure

1. Confirm `node -v` prints v24 (see [docs/SETUP.md](../docs/SETUP.md)). On the branch `feat/astro-project`, in the repository folder, run:
   ```bash
   npm create astro@latest -- --template minimal --no-git --install --skip-houston .
   ```
   If prompted that the folder is not empty, choose **continue**. This installs Astro 7. Run `npm run dev` and open http://localhost:4321.
2. Configure `astro.config.mjs`:
   ```js
   import { defineConfig } from 'astro/config';
   export default defineConfig({
     site: 'https://cckfupm.example', // replaced with the production domain before launch
     trailingSlash: 'ignore',
   });
   ```
3. Create `src/data/site.json` from the block at the end of this document.
4. Create `src/layouts/BaseLayout.astro`. It accepts the props `title` and `description` and renders:
   - `<html lang="en">`, charset and viewport meta tags, `<title>{title} · KFUPM Computer Club</title>`, and the meta description;
   - the Google Fonts stylesheet: `https://fonts.googleapis.com/css2?family=Mona+Sans:wght@300..700&family=Hubot+Sans:wght@400..700&family=Readex+Pro:wght@300..600&display=swap`;
   - `import '../styles/global.css'` (create the file empty; the designer completes it in T02);
   - `<Header />`, `<main id="main"><slot /></main>`, `<Footer />`.
5. Create `src/components/Header.astro`: the club logo (`public/logo.png`) and the navigation links **Home `/` · Events `/events` · News `/news` · Newsletter `/newsletter` · Write `/write` · About `/about`**. The current page's link receives `aria-current="page"` (compare with `Astro.url.pathname`). A menu button for small screens toggles the class `nav-open` on `<body>` through a small `<script>` in the component.
6. Create `src/components/Footer.astro`: club name, contact email, and social links from `site.json`, and a credit line linking to `/about`.
7. Create one placeholder page per route, each using `BaseLayout` with a heading and the text "Coming soon": `src/pages/index.astro`, `events.astro`, `news/index.astro`, `newsletter.astro`, `write.astro`, `about.astro`.
8. Create the empty folders `src/content/posts/` and `public/images/`, each containing a `.gitkeep` file.
9. Add `.nvmrc` containing `24`. In `package.json`, add `"engines": { "node": ">=22.22.0" }`. Confirm `.gitignore` lists `node_modules/`, `dist/`, and `.astro/`.
10. Open the pull request as soon as the pages load. Keep it small; other tasks depend on it.

## Notes on Astro 7

- **Every element must be closed.** The compiler reports an unclosed `<div>`, `<p>`, or `<li>` as a build error and names the file and line.
- **Whitespace between inline elements is removed.** Two links on consecutive lines render without a space between them. Use CSS `gap` for navigation, or `{' '}` where a literal space is required.

## `src/data/site.json`

```json
{
  "name": "KFUPM Computer Club",
  "short": "CCKFUPM",
  "tagline": "Where curious minds build the future.",
  "description": "The student-run tech community at KFUPM. We build, we write, we host, and we grow together.",
  "email": "REPLACE@kfupm.edu.sa",
  "stats": [
    { "value": "REPLACE", "label": "Members" },
    { "value": "REPLACE", "label": "Events a year" },
    { "value": "REPLACE", "label": "Founded" }
  ],
  "links": {
    "join": "REPLACE", "newsletterSubscribe": "REPLACE", "writeForUs": "REPLACE",
    "discord": "REPLACE", "whatsapp": "REPLACE",
    "instagram": "https://instagram.com/kfupm_cc", "x": "https://twitter.com/kfupm_cc",
    "linkedin": "https://linkedin.com/company/kfupmcclub", "github": "https://github.com/KFUPM-COMPUTER-CLUB/website"
  },
  "marquee": ["Workshops", "Hackathons", "Talks", "Student writers", "Newsletter", "AI & ML", "Web", "Cybersecurity", "Open source"]
}
```

## Acceptance criteria

- `npm run build` completes without errors.
- All six pages open from the navigation on a phone and a laptop, on the Vercel preview.

## Submission

Branch, commit, and open a pull request containing `Closes #<issue number>`. The full procedure is in [CONTRIBUTING.md](../CONTRIBUTING.md). If you are blocked for more than 30 minutes, comment on the issue and mention your mentor, **@YKrishna17** (Yogesh).
