/* Server-side HTML sanitiser for posts. Whatever the editor sends, only this subset is stored. */
import sanitizeHtml from 'sanitize-html';
import { supabaseUrl } from './env';

const storage = supabaseUrl ? `${supabaseUrl}/storage/v1/object/public/` : null;
const isStorageUrl = (u: string) => u.startsWith('/api/media/') || (!!storage && u.startsWith(storage));

export function sanitizePost(html: string) {
  return sanitizeHtml(html || '', {
    allowedTags: ['p', 'br', 'h2', 'h3', 'h4', 'strong', 'b', 'em', 'i', 's', 'u', 'code', 'pre', 'blockquote', 'ul', 'ol', 'li', 'a', 'img', 'figure', 'figcaption', 'table', 'thead', 'tbody', 'tr', 'th', 'td', 'hr', 'iframe', 'small', 'span'],
    allowedAttributes: {
      a: ['href', 'title', 'target', 'rel', 'class', 'download'],
      img: ['src', 'alt', 'width', 'height', 'loading'],
      code: ['class'], pre: ['class'], span: ['class'],
      iframe: ['src', 'title', 'class'],
      figure: ['class', 'data-pdf'],
      td: ['colspan', 'rowspan'], th: ['colspan', 'rowspan'],
      '*': ['dir'],
    },
    allowedSchemes: ['http', 'https', 'mailto'],
    allowedSchemesByTag: { img: ['https'], iframe: ['https'] },
    allowProtocolRelative: false,
    allowedClasses: { code: [/^language-/], pre: [/^language-/], a: ['pdf-card'], figure: ['pdf'], iframe: ['pdf-frame'], span: [/^hljs-/] },
    exclusiveFilter: (frame) => (frame.tag === 'iframe' && !isStorageUrl(frame.attribs.src || '')) || (frame.tag === 'img' && (!frame.attribs.alt || !(isStorageUrl(frame.attribs.src || '') || /^https:\/\//.test(frame.attribs.src || '')))),
    transformTags: {
      a: (tag, attribs) => { const href = attribs.href || ''; const external = /^https?:/i.test(href); return { tagName: 'a', attribs: { ...attribs, ...(external ? { target: '_blank', rel: 'noopener' } : {}) } }; },
    },
    disallowedTagsMode: 'discard',
  });
}
export const plainText = (html: string, max = 200) => sanitizeHtml(html || '', { allowedTags: [], allowedAttributes: {} }).replace(/\s+/g, ' ').trim().slice(0, max);
