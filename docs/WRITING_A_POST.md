# Write for the CC blog

Any club member can write: event recaps, tutorials, project stories, internship experiences, opinions. A manager reviews every post before it goes live.

**Good post:** one idea · 300–1200 words · your own words and photos (or ones you may use) · nothing private about other people.

## Way 1: no GitHub
Submit through the **Write for us** form at `/write` (Word or Markdown file). The content team publishes it and sends you the link.

## Way 2: on GitHub, in the browser
1. Repo → `src/content/posts/` → **Add file → Create new file**.
2. Name it like the URL you want: `my-first-discord-bot.md` → becomes `/news/my-first-discord-bot`.
3. Start the file with this block (the "frontmatter"), then write below it:

~~~markdown
---
title: "How I built my first Discord bot"
date: 2026-10-28
author: "Your Name"
category: "Tutorial"
tags: ["python", "discord"]
excerpt: "One or two sentences that make people want to read it."
cover: "/images/posts/discord-bot.jpg"
---

## Why I started
Your text…
~~~

   `category` must be one of: `News` · `Event recap` · `Tutorial` · `Project` · `Experience` · `Opinion` · `Announcement`. `cover` is optional. `excerpt` max 200 characters.
4. Images: upload to `public/images/posts/` (Add file → Upload files), under 200 KB. In the post: `![What the image shows](/images/posts/my-photo.jpg)`.
5. **Commit changes → Create a new branch** (`post/my-first-discord-bot`) → **Propose changes** → **Create pull request**. Not on the website team? GitHub makes a fork for you automatically; just continue.
6. The checks tell you if the frontmatter is wrong. The Vercel link shows your post. A manager reviews and merges.

## Markdown you'll use

~~~markdown
## Heading            ### Smaller heading
**bold**  *italic*  `code`  [link](https://example.com)
- list item
1. numbered item
> quote
![alt text](/images/posts/photo.jpg)
```python
print("code block")
```
~~~

Full guide: [markdownguide.org/basic-syntax](https://www.markdownguide.org/basic-syntax/).
