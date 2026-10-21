# Writing for the website

Any club member may publish on the website: event recaps, tutorials, project write-ups, internship and competition experiences, and opinion pieces. Every article is reviewed by a project manager before publication.

## Editorial guidelines

| Requirement | Detail |
|---|---|
| Scope | One subject per article |
| Length | 300 to 1,200 words |
| Originality | Your own words. Quotations must be attributed. |
| Images | Your own photographs, or images you have permission to use. Under 200 KB each, with descriptive alternative text. |
| Privacy | No personal information about other people without their consent |
| Category | One of: News, Event recap, Tutorial, Project, Experience, Opinion, Announcement |

## Submission procedure

### Option A: submission form

Submit the draft (Word or Markdown) through the **Write for us** form linked from `/write`. The content team formats and publishes it and sends you the published link.

### Option B: pull request on GitHub

1. Open the repository and navigate to `src/content/posts/`. Select **Add file → Create new file**.
2. Name the file after the intended URL. `my-first-discord-bot.md` is published at `/news/my-first-discord-bot`.
3. Begin the file with the metadata block below (the frontmatter), then write the article in Markdown.

   ~~~markdown
   ---
   title: "How I built my first Discord bot"
   date: 2026-10-28
   author: "Your Name"
   category: "Tutorial"
   tags: ["python", "discord"]
   excerpt: "One or two sentences that summarise the article."
   cover: "/images/posts/discord-bot.jpg"
   ---

   ## Why I started
   Article text.
   ~~~

   `cover` is optional. `excerpt` is limited to 200 characters. `category` must be one of the values listed above.
4. Upload images to `public/images/posts/` (**Add file → Upload files**) and reference them as `![Description](/images/posts/file-name.jpg)`.
5. Select **Commit changes → Create a new branch**, name it `post/<file-name>`, and open the pull request. Contributors without write access are offered a fork automatically; continue through the same steps.
6. The automated checks validate the frontmatter and the preview deployment shows the rendered article. A project manager reviews and merges.

## Markdown reference

~~~markdown
## Section heading
### Subsection heading
**bold**, *italic*, `inline code`, [link text](https://example.com)
- unordered list item
1. ordered list item
> quotation
![alternative text](/images/posts/photo.jpg)
```python
print("code block")
```
~~~

Full reference: [markdownguide.org/basic-syntax](https://www.markdownguide.org/basic-syntax/).
