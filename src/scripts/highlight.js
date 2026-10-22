/* Syntax highlighting for code blocks in posts, loaded only when a page has one. */
import { onPage } from './page.js';
onPage(() => {
  const blocks = document.querySelectorAll('[data-prose] pre code');
  if (!blocks.length) return;
  import('highlight.js/lib/common').then(({ default: hljs }) => { blocks.forEach((b) => { if (!b.dataset.highlighted) hljs.highlightElement(b); }); });
});
