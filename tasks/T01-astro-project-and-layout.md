# T01 · Create the Astro project, base layout, header and footer

| Owner | Needs first | Labels |
|---|---|---|
| **Lead developer** | nothing (do this first, everyone waits for it) | role: lead-dev, type: feature, P0 |

## Steps
1. On your branch `feat/astro-project`, in the repo folder, run:
   ```bash
   npm create astro@latest -- --template minimal --no-git --install --skip-houston .
   ```
   (If it asks about the folder not being empty, choose **continue**.) Then: `npm run dev` → open http://localhost:4321.
2. `astro.config.mjs`:
   ```js
   import { defineConfig } from 'astro/config';
   export default defineConfig({
     site: 'https://cckfupm.example', // Adib gives the real domain later
     trailingSlash: 'ignore',
   });
   ```
3. Copy `src/data/site.json` from the block at the bottom of this file.
4. Create `src/layouts/BaseLayout.astro`. It takes props `title` and `description`, and contains:
   - `<html lang="en">`, meta charset/viewport, `<title>{title} · KFUPM Computer Club</title>`, meta description
   - Google Fonts link: `https://fonts.googleapis.com/css2?family=Mona+Sans:wght@300..700&family=Hubot+Sans:wght@400..700&family=Readex+Pro:wght@300..600&display=swap`
   - `import '../styles/global.css'` (create an empty file; the designer fills it in T02)
   - `<Header />`, `<main id="main"><slot /></main>`, `<Footer />`
5. `src/components/Header.astro`: logo (`/logo.png`, put the white CC logo in `public/logo.png`) + nav links **Home `/` · Events `/events` · News `/news` · Newsletter `/newsletter` · Write `/write` · About `/about`**. The current page link gets `aria-current="page"` (compare with `Astro.url.pathname`). A menu button for phones that toggles a class `nav-open` on `<body>` (small `<script>` in the component).
6. `src/components/Footer.astro`: club name, email, social links from `site.json`, "Website built by the CC website team" → `/about`.
7. Create these pages, each using `BaseLayout` with a heading and "Coming soon": `src/pages/index.astro`, `events.astro`, `news/index.astro`, `newsletter.astro`, `write.astro`, `about.astro`.
8. Empty folders with a `.gitkeep`: `src/components/`, `src/content/posts/`, `public/images/`.
9. Add `.nvmrc` with `20`. Make sure `.gitignore` has `node_modules/`, `dist/`, `.astro/`.
10. Open the PR **as soon as the pages load**. Keep it small. Others are waiting.

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

## Done when
- `npm run build` works with no errors
- All 6 pages open from the nav, on phone and laptop, on the Vercel preview

---
**How to submit:** branch → commit → pull request with `Closes #<issue number>` (full steps in [CONTRIBUTING.md](../CONTRIBUTING.md)). Stuck for 30 minutes? Comment on the issue and tag Adib.
