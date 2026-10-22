/* Server-side HTML sanitiser for posts. The save and submit routes run every post body through
 * this before it reaches the posts table, so stored HTML can be rendered as it is. The TipTap
 * editor limits what it emits, but a client can send anything, so this allow-list is the real
 * gate. Extend it together with the editor; anything not listed is silently dropped. */
import sanitizeHtml from 'sanitize-html';
import { supabaseUrl } from './env';

/* Our own files: public bucket URLs, or /api/media/<key> for draft files served through signed URLs. */
const storage = supabaseUrl ? `${supabaseUrl}/storage/v1/object/public/` : null;
const isStorageUrl = (u: string) => u.startsWith('/api/media/') || (!!storage && u.startsWith(storage));

export function sanitizePost(html: string) {
  return sanitizeHtml(html || '', {
    allowedTags: [
      'p',
      'br',
      'h2',
      'h3',
      'h4',
      'strong',
      'b',
      'em',
      'i',
      's',
      'u',
      'code',
      'pre',
      'blockquote',
      'ul',
      'ol',
      'li',
      'a',
      'img',
      'figure',
      'figcaption',
      'table',
      'thead',
      'tbody',
      'tr',
      'th',
      'td',
      'hr',
      'iframe',
      'small',
      'span',
    ],
    allowedAttributes: {
      a: ['href', 'title', 'target', 'rel', 'class', 'download'],
      img: ['src', 'alt', 'width', 'height', 'loading'],
      code: ['class'],
      pre: ['class'],
      span: ['class'],
      iframe: ['src', 'title', 'class'],
      figure: ['class', 'data-pdf'],
      td: ['colspan', 'rowspan'],
      th: ['colspan', 'rowspan'],
      '*': ['dir'],
    },
    allowedSchemes: ['http', 'https', 'mailto'],
    allowedSchemesByTag: { img: ['https'], iframe: ['https'] },
    allowProtocolRelative: false,
    allowedClasses: {
      code: [/^language-/],
      pre: [/^language-/],
      a: ['pdf-card'],
      figure: ['pdf'],
      iframe: ['pdf-frame'],
      span: [/^hljs-/],
    },
    // Frames may only show our own PDFs; images need alt text and must be ours or plain https.
    exclusiveFilter: (frame) =>
      (frame.tag === 'iframe' && !isStorageUrl(frame.attribs.src || '')) ||
      (frame.tag === 'img' &&
        (!frame.attribs.alt ||
          !(isStorageUrl(frame.attribs.src || '') || /^https:\/\//.test(frame.attribs.src || '')))),
    transformTags: {
      // External links open in a new tab; noopener stops the target from scripting this window.
      a: (tag, attribs) => {
        const href = attribs.href || '';
        const external = /^https?:/i.test(href);
        return { tagName: 'a', attribs: { ...attribs, ...(external ? { target: '_blank', rel: 'noopener' } : {}) } };
      },
    },
    disallowedTagsMode: 'discard',
  });
}
/* Tag-free excerpt for meta descriptions and list cards. */
export const plainText = (html: string, max = 200) =>
  sanitizeHtml(html || '', { allowedTags: [], allowedAttributes: {} })
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, max);
