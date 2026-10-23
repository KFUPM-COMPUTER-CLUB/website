/* Blog post editor for /me/posts/<id>/edit. TipTap renders into the data-editor-surface box, the
 * toolbar is built into data-editor-toolbar, and the hidden content_html, content_json and dir fields
 * are kept in sync so the form's own submit (handled by the page) always carries the latest copy.
 *
 * Contract with the page: a form with data-editor, data-post-id, data-status, data-dir, data-upload
 * (POST multipart), data-save (PATCH JSON) and data-preview; inputs named title, excerpt, category and
 * tags; the two hidden textareas, the dir input, a data-editor-status element (aria-live) and a
 * data-editor-preview button. Disabled fields mean read-only (see "locked" below).
 *
 * Autosave: a change starts a 1.5 s timer; one PATCH runs at a time and a change made while one is in
 * flight queues a second run, so the server always ends up with the newest state. A reply may clear
 * "dirty" only when nothing changed since it was sent (the serial counter). Network errors and 5xx
 * retry after 15 s; a 4xx (for example 409 once a reviewer locked the post) does not. On tab close or
 * client-side navigation an unsaved copy is sent with keepalive as a last chance.
 *
 * Uploads: multipart to data-upload with kind (image or pdf), the post id and, for images, the alt
 * text, which is required. The reply's url is /api/media/<key>, which keeps working after the post is
 * published, so the stored content never needs rewriting. */
import { Editor, Node } from '@tiptap/core';
import StarterKit from '@tiptap/starter-kit';
import Link from '@tiptap/extension-link';
import Image from '@tiptap/extension-image';
import { Table } from '@tiptap/extension-table';
import { TableRow } from '@tiptap/extension-table-row';
import { TableCell } from '@tiptap/extension-table-cell';
import { TableHeader } from '@tiptap/extension-table-header';
import CodeBlockLowlight from '@tiptap/extension-code-block-lowlight';
import Placeholder from '@tiptap/extension-placeholder';
import { createLowlight, common } from 'lowlight';
import { onPage, listen, bag } from './page.js';

/* Languages offered for code blocks; every one is in lowlight's "common" bundle. */
const LANGS = [
  ['plaintext', 'Plain text'],
  ['javascript', 'JavaScript'],
  ['typescript', 'TypeScript'],
  ['python', 'Python'],
  ['bash', 'Bash'],
  ['json', 'JSON'],
  ['xml', 'HTML / XML'],
  ['css', 'CSS'],
  ['sql', 'SQL'],
  ['c', 'C'],
  ['cpp', 'C++'],
  ['java', 'Java'],
  ['go', 'Go'],
  ['rust', 'Rust'],
];
const PDF_MAX = 4 * 1024 * 1024; // Vercel caps request bodies at 4.5 MB
const fmtSize = (b) => (b >= 1048576 ? `${(b / 1048576).toFixed(1)} MB` : `${Math.max(1, Math.round(b / 1024))} KB`);
const hhmm = () => {
  const d = new Date();
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
};
const safeUrl = (s) => {
  const v = s.trim();
  if (!v || /^\s*(javascript|data|vbscript):/i.test(v)) return '';
  return /^(https?:|mailto:|tel:|\/|#)/i.test(v) ? v : /^[\w-]+(\.[\w-]+)+(\/|$|\?|#)/.test(v) ? `https://${v}` : '';
};

/* Toolbar icons: 16px line art in currentColor. Text labels do the rest. */
const I = {
  bullets:
    '<svg viewBox="0 0 16 16" aria-hidden="true"><path d="M6 4h8M6 8h8M6 12h8"/><circle cx="3" cy="4" r="1" fill="currentColor" stroke="none"/><circle cx="3" cy="8" r="1" fill="currentColor" stroke="none"/><circle cx="3" cy="12" r="1" fill="currentColor" stroke="none"/></svg>',
  numbers:
    '<svg viewBox="0 0 16 16" aria-hidden="true"><path d="M6 4h8M6 8h8M6 12h8M1.8 3l1.2-.7V6M1.7 8.2c.3-.8 2.1-.8 2.1.2 0 .8-2.1 1.3-2.1 2.4h2.2M1.7 11.2h2l-1.1 1.3c1 0 1.5.4 1.5 1 0 .8-1.4 1.2-2.4.7"/></svg>',
  quote:
    '<svg viewBox="0 0 16 16" aria-hidden="true"><path d="M3 10V7.5A3 3 0 0 1 6 4.5M3 10h3v3H3zM9.5 10V7.5a3 3 0 0 1 3-3M9.5 10h3v3h-3z"/></svg>',
  table:
    '<svg viewBox="0 0 16 16" aria-hidden="true"><path d="M2 3h12v10H2zM2 7h12M2 10.5h12M6.5 3v10M10.5 3v10"/></svg>',
  code: '<svg viewBox="0 0 16 16" aria-hidden="true"><path d="M5.5 4.5 2 8l3.5 3.5M10.5 4.5 14 8l-3.5 3.5M9 3 7 13"/></svg>',
  link: '<svg viewBox="0 0 16 16" aria-hidden="true"><path d="M6.5 9.5l3-3M5 11l-1 1a2.5 2.5 0 0 1-3.5-3.5l2-2A2.5 2.5 0 0 1 6 6.5M11 5l1-1a2.5 2.5 0 0 1 3.5 3.5l-2 2A2.5 2.5 0 0 1 10 9.5"/></svg>',
  image:
    '<svg viewBox="0 0 16 16" aria-hidden="true"><path d="M2 3h12v10H2z"/><path d="M2 11l3.5-4 3 3 2-2 3.5 3.5"/><circle cx="11" cy="6" r="1.2"/></svg>',
};

/* A PDF attachment: one atom block that serialises to the same markup the public post uses, so the
 * saved content_html needs no post-processing. The card is parsed back from that markup on load. */
const PdfCard = Node.create({
  name: 'pdfCard',
  group: 'block',
  atom: true,
  draggable: true,
  selectable: true,
  addAttributes() {
    return { src: { default: '' }, name: { default: 'document.pdf' }, size: { default: '' } };
  },
  parseHTML() {
    return [
      {
        tag: 'figure[data-pdf]',
        getAttrs: (el) => {
          const a = el.querySelector('a[href]');
          const src =
            a?.getAttribute('href') || (el.querySelector('iframe')?.getAttribute('src') || '').replace(/#.*$/, '');
          if (!src) return false;
          const name =
            el.querySelector('b')?.textContent?.trim() ||
            el.querySelector('iframe')?.getAttribute('title') ||
            'document.pdf';
          const size = (el.querySelector('small')?.textContent || '').replace(/^\s*PDF\s*·\s*/, '').trim();
          return { src, name, size };
        },
      },
    ];
  },
  renderHTML({
    node: {
      attrs: { src, name, size },
    },
  }) {
    return [
      'figure',
      { class: 'pdf', 'data-pdf': '' },
      ['iframe', { class: 'pdf-frame', src: `${src}#toolbar=0`, title: name }],
      ['a', { class: 'pdf-card', href: src, download: '' }, ['b', {}, name], ['small', {}, `PDF · ${size}`]],
    ];
  },
  addCommands() {
    return {
      insertPdfCard:
        (attrs) =>
        ({ commands }) =>
          commands.insertContent({ type: this.name, attrs }),
    };
  },
});

onPage(() => {
  const form = document.querySelector('form[data-editor]');
  if (!form) return;
  const $ = (s) => form.querySelector(s);
  const toolbar = $('[data-editor-toolbar]'),
    surface = $('[data-editor-surface]'),
    htmlField = $('[data-editor-html]'),
    jsonField = $('[data-editor-json]'),
    dirField = $('[data-editor-dir]'),
    status = $('[data-editor-status]');
  if (!toolbar || !surface) return;
  const off = bag();
  const field = (name) => form.elements.namedItem(name);
  const value = (name) => {
    const f = field(name);
    return f && 'value' in f ? String(f.value) : '';
  };
  const setStatus = (text, kind = '') => {
    if (!status) return;
    status.textContent = text;
    status.dataset.kind = kind;
  };
  let dir = form.dataset.dir === 'rtl' ? 'rtl' : 'ltr';
  /* A post under review or published by a plain author is read-only: the page disables its fields
   * (or sets data-locked) and the API answers 409, so the editor opens without toolbar or autosave. */
  const locked = form.hasAttribute('data-locked') || !!field('title')?.disabled;

  /* ── Document ───────────────────────────────────────────────────────── */
  const initial = () => {
    const raw = (jsonField?.value || '').trim();
    if (raw) {
      try {
        const doc = JSON.parse(raw);
        if (doc && doc.type === 'doc') return doc;
      } catch {
        /* fall back to the HTML copy */
      }
    }
    return htmlField?.value || '';
  };
  const editor = new Editor({
    element: surface,
    editable: !locked,
    content: initial(),
    extensions: [
      StarterKit.configure({ codeBlock: false, link: false, heading: { levels: [2, 3] } }),
      Link.configure({
        openOnClick: false,
        autolink: true,
        linkOnPaste: true,
        defaultProtocol: 'https',
        HTMLAttributes: { target: null, rel: null },
      }),
      Image.configure({ inline: false, allowBase64: false }),
      Table.configure({ resizable: false }),
      TableRow,
      TableHeader,
      TableCell,
      CodeBlockLowlight.configure({ lowlight: createLowlight(common), defaultLanguage: 'plaintext' }),
      Placeholder.configure({ placeholder: 'Write your post…' }),
      PdfCard,
    ],
    editorProps: {
      attributes: { class: 'editor__doc', role: 'textbox', 'aria-multiline': 'true', 'aria-label': 'Post body' },
    },
    onUpdate: () => {
      syncFields();
      markDirty();
    },
  });
  const syncFields = () => {
    if (htmlField) htmlField.value = editor.getHTML();
    if (jsonField) jsonField.value = JSON.stringify(editor.getJSON());
  };
  const applyDir = () => {
    surface.setAttribute('dir', dir);
    form.dataset.dir = dir;
    if (dirField) dirField.value = dir;
    dirBtn?.setAttribute('aria-pressed', String(dir === 'rtl'));
  };

  /* ── Autosave ───────────────────────────────────────────────────────── */
  const tags = () =>
    value('tags')
      .split(',')
      .map((t) => t.trim())
      .filter((t, i, a) => t && a.indexOf(t) === i);
  const payload = () => ({
    title: value('title').trim(),
    excerpt: value('excerpt').trim(),
    category: value('category'),
    tags: tags(),
    dir,
    content_html: editor.getHTML(),
    content_json: editor.getJSON(),
  });
  let dirty = false,
    serial = 0,
    timer = 0,
    inflight = null,
    queued = false;
  const markDirty = () => {
    if (locked) return;
    dirty = true;
    serial++;
    clearTimeout(timer);
    timer = setTimeout(save, 1500);
  };
  async function send() {
    const at = serial;
    setStatus('Saving…', 'busy');
    try {
      const res = await fetch(form.dataset.save, {
        method: 'PATCH',
        credentials: 'same-origin',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify(payload()),
      });
      const data = await res.json().catch(() => null);
      if (!res.ok || data?.ok === false) {
        const e = new Error(data?.error || `HTTP ${res.status}`);
        e.retry = res.status >= 500;
        throw e;
      }
      if (serial === at) dirty = false;
      setStatus(form.dataset.status === 'published' ? 'Saved · live in about a minute' : `Saved ${hhmm()}`, 'ok');
      return true;
    } catch (e) {
      setStatus(`Could not save: ${e instanceof TypeError ? 'network error' : e.message}`, 'error');
      if (e.retry !== false) {
        clearTimeout(timer);
        timer = setTimeout(save, 15000);
      } // transient: try again later
      return false;
    }
  }
  /* One PATCH at a time; a save requested mid-flight runs again afterwards with the newer state. */
  function save() {
    clearTimeout(timer);
    if (inflight) {
      queued = true;
      return inflight;
    }
    inflight = (async () => {
      let ok;
      do {
        queued = false;
        ok = await send();
      } while (queued && ok);
      inflight = null;
      return ok;
    })();
    return inflight;
  }
  /* Last-chance copy when the page goes away with unsaved edits (tab close, client-side navigation). */
  const flush = () => {
    if (!dirty) return;
    try {
      fetch(form.dataset.save, {
        method: 'PATCH',
        credentials: 'same-origin',
        keepalive: true,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload()),
      }).catch(() => {});
    } catch {
      /* ignore */
    }
  };

  /* ── Uploads ────────────────────────────────────────────────────────── */
  const fileInput = (kind, accept) => {
    const i = document.createElement('input');
    i.type = 'file';
    i.accept = accept;
    i.hidden = true;
    i.tabIndex = -1;
    i.dataset.editorFile = kind;
    form.append(i);
    return i;
  };
  async function upload(file, kind, alt) {
    if (file.size > 4 * 1024 * 1024) throw new Error(`${file.name} is over 4 MB.`); // Vercel's body limit is 4.5 MB
    const fd = new FormData();
    fd.append('file', file, file.name);
    if (kind === 'image') fd.append('alt', alt);
    fd.append('kind', kind);
    if (form.dataset.postId) fd.append('post_id', form.dataset.postId);
    const res = await fetch(form.dataset.upload, { method: 'POST', credentials: 'same-origin', body: fd });
    const data = await res.json().catch(() => null);
    if (!res.ok || !data || data.ok === false || !data.url)
      throw new Error(data?.error || `Upload failed (HTTP ${res.status})`);
    return data;
  }
  const imgInput = fileInput('image', 'image/*');
  off.add(
    listen(imgInput, 'change', async () => {
      const file = imgInput.files?.[0];
      imgInput.value = '';
      if (!file) return;
      let alt = ''; // required: keep asking until there is one, cancel aborts
      while (!alt) {
        const a = window.prompt('Describe the image for readers who cannot see it (required):', '');
        if (a === null) return;
        alt = a.trim();
      }
      setStatus(`Uploading ${file.name}…`, 'busy');
      try {
        const d = await upload(file, 'image', alt);
        editor
          .chain()
          .focus()
          .setImage({ src: d.url, alt: d.alt || alt, width: d.width || null, height: d.height || null })
          .run();
        setStatus('Image added.', 'ok');
      } catch (e) {
        setStatus(e.message, 'error');
      }
    }),
  );
  const pdfInput = fileInput('pdf', 'application/pdf,.pdf');
  off.add(
    listen(pdfInput, 'change', async () => {
      const file = pdfInput.files?.[0];
      pdfInput.value = '';
      if (!file) return;
      if (!/\.pdf$/i.test(file.name)) return setStatus('Only .pdf files can be attached.', 'error');
      if (file.size > PDF_MAX) return setStatus(`${file.name} is ${fmtSize(file.size)}; the limit is 4 MB.`, 'error');
      setStatus(`Uploading ${file.name}…`, 'busy');
      try {
        const d = await upload(file, 'pdf');
        editor
          .chain()
          .focus()
          .insertPdfCard({ src: d.url, name: d.name || file.name, size: fmtSize(d.bytes || file.size) })
          .run();
        setStatus('PDF attached.', 'ok');
      } catch (e) {
        setStatus(e.message, 'error');
      }
    }),
  );

  /* ── Toolbar ────────────────────────────────────────────────────────── */
  toolbar.setAttribute('role', 'toolbar');
  toolbar.setAttribute('aria-label', 'Formatting');
  toolbar.hidden = locked;
  const tools = [];
  const group = (label, hidden = false) => {
    const g = document.createElement('span');
    g.className = 'editor__group';
    g.setAttribute('role', 'group');
    g.setAttribute('aria-label', label);
    g.hidden = hidden;
    toolbar.append(g);
    return g;
  };
  const tool = (g, label, aria, run, { active, can, wide } = {}) => {
    const b = document.createElement('button');
    b.type = 'button';
    b.className = `editor__tool${wide ? ' editor__tool--wide' : ''}`;
    b.innerHTML = label;
    b.title = aria;
    b.setAttribute('aria-label', aria);
    if (active) b.setAttribute('aria-pressed', 'false');
    b.addEventListener('mousedown', (e) => e.preventDefault()); // a click must not steal the selection
    b.addEventListener('click', run);
    g.append(b);
    tools.push({ b, active, can });
    return b;
  };
  /* Focus synchronously (TipTap's own focus() waits a frame), so a command right after a keyboard
   * activation lands in the document, then chain as usual. */
  const chain = () => {
    editor.view.focus();
    return editor.chain().focus();
  };
  const cmd = (fn) => () => fn(chain()).run();
  const blocks = group('Blocks');
  tool(
    blocks,
    '¶',
    'Paragraph',
    cmd((c) => c.setParagraph()),
    { active: () => editor.isActive('paragraph') },
  );
  tool(
    blocks,
    'H2',
    'Heading 2',
    cmd((c) => c.toggleHeading({ level: 2 })),
    { active: () => editor.isActive('heading', { level: 2 }) },
  );
  tool(
    blocks,
    'H3',
    'Heading 3',
    cmd((c) => c.toggleHeading({ level: 3 })),
    { active: () => editor.isActive('heading', { level: 3 }) },
  );
  const marks = group('Text style');
  tool(
    marks,
    '<b>B</b>',
    'Bold',
    cmd((c) => c.toggleBold()),
    { active: () => editor.isActive('bold'), can: () => editor.can().toggleBold() },
  );
  tool(
    marks,
    '<i>I</i>',
    'Italic',
    cmd((c) => c.toggleItalic()),
    { active: () => editor.isActive('italic'), can: () => editor.can().toggleItalic() },
  );
  const lists = group('Lists and quotes');
  tool(
    lists,
    I.bullets,
    'Bullet list',
    cmd((c) => c.toggleBulletList()),
    { active: () => editor.isActive('bulletList') },
  );
  tool(
    lists,
    I.numbers,
    'Numbered list',
    cmd((c) => c.toggleOrderedList()),
    { active: () => editor.isActive('orderedList') },
  );
  tool(
    lists,
    I.quote,
    'Quote',
    cmd((c) => c.toggleBlockquote()),
    { active: () => editor.isActive('blockquote') },
  );
  const inserts = group('Insert');
  tool(
    inserts,
    I.table,
    'Insert table',
    cmd((c) => c.insertTable({ rows: 3, cols: 3, withHeaderRow: true })),
    { can: () => !editor.isActive('table') && editor.can().insertTable({ rows: 3, cols: 3, withHeaderRow: true }) },
  );
  tool(
    inserts,
    I.code,
    'Code block',
    cmd((c) => c.toggleCodeBlock()),
    { active: () => editor.isActive('codeBlock') },
  );
  tool(
    inserts,
    I.link,
    'Link',
    () => {
      const prev = editor.getAttributes('link').href || '';
      const typed = window.prompt('Link address (leave empty to remove the link):', prev);
      if (typed === null) return;
      if (!typed.trim()) return chain().extendMarkRange('link').unsetLink().run();
      const href = safeUrl(typed);
      if (!href) return setStatus('That does not look like a web address.', 'error');
      const ok =
        editor.state.selection.empty && !prev
          ? chain()
              .insertContent({ type: 'text', text: href, marks: [{ type: 'link', attrs: { href } }] })
              .run()
          : chain().extendMarkRange('link').setLink({ href }).run();
      if (!ok) setStatus('That link could not be added.', 'error');
    },
    { active: () => editor.isActive('link'), can: () => !editor.isActive('codeBlock') },
  );
  tool(inserts, I.image, 'Insert image', () => imgInput.click(), { can: () => !editor.isActive('codeBlock') });
  tool(inserts, 'PDF', 'Attach PDF', () => pdfInput.click(), { can: () => !editor.isActive('codeBlock'), wide: true });
  const direction = group('Text direction');
  const dirBtn = tool(
    direction,
    'RTL',
    'Right-to-left text',
    () => {
      dir = dir === 'rtl' ? 'ltr' : 'rtl';
      applyDir();
      markDirty();
      editor.commands.focus();
    },
    { active: () => dir === 'rtl', wide: true },
  );
  /* Context groups: shown only while the cursor sits in a table or a code block. */
  const tableGroup = group('Table', true);
  tool(
    tableGroup,
    '+Row',
    'Add row below',
    cmd((c) => c.addRowAfter()),
    { wide: true },
  );
  tool(
    tableGroup,
    '−Row',
    'Delete row',
    cmd((c) => c.deleteRow()),
    { wide: true },
  );
  tool(
    tableGroup,
    '+Col',
    'Add column after',
    cmd((c) => c.addColumnAfter()),
    { wide: true },
  );
  tool(
    tableGroup,
    '−Col',
    'Delete column',
    cmd((c) => c.deleteColumn()),
    { wide: true },
  );
  tool(
    tableGroup,
    '✕',
    'Delete table',
    cmd((c) => c.deleteTable()),
  );
  const codeGroup = group('Code block', true);
  const lang = document.createElement('select');
  lang.className = 'editor__lang';
  lang.setAttribute('aria-label', 'Code language');
  lang.dataset.editorLang = '';
  for (const [v, l] of LANGS) lang.append(new Option(l, v));
  off.add(
    listen(lang, 'change', () => {
      // Read the choice first: chain() refocuses the editor, the focus transaction runs refresh(), and that
      // resets the select to the block's current language before lang.value would be read.
      const language = lang.value;
      chain().updateAttributes('codeBlock', { language }).run();
    }),
  );
  codeGroup.append(lang);

  const refresh = () => {
    for (const { b, active, can } of tools) {
      if (active) b.setAttribute('aria-pressed', String(!!active()));
      if (can) b.disabled = !can();
    }
    tableGroup.hidden = !editor.isActive('table');
    const inCode = editor.isActive('codeBlock');
    codeGroup.hidden = !inCode;
    if (inCode) lang.value = editor.getAttributes('codeBlock').language || 'plaintext';
  };
  editor.on('transaction', refresh);
  /* Arrow keys walk the toolbar; Tab leaves it. */
  off.add(
    listen(toolbar, 'keydown', (e) => {
      if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(e.key) || e.target.tagName === 'SELECT') return;
      const items = [...toolbar.querySelectorAll('button, select')].filter(
        (el) => !el.disabled && el.offsetParent !== null,
      );
      const i = items.indexOf(document.activeElement);
      if (i < 0) return;
      e.preventDefault();
      items[
        e.key === 'Home'
          ? 0
          : e.key === 'End'
            ? items.length - 1
            : (i + (e.key === 'ArrowRight' ? 1 : -1) + items.length) % items.length
      ].focus();
    }),
  );

  /* ── Wiring ─────────────────────────────────────────────────────────── */
  applyDir();
  syncFields();
  refresh();
  const fieldChanged = (e) => {
    const t = e.target;
    if (!t || surface.contains(t) || t.type === 'hidden' || t.type === 'file' || t.hidden) return;
    markDirty();
  };
  off.add(listen(form, 'input', fieldChanged));
  off.add(listen(form, 'change', fieldChanged));
  off.add(
    listen(form, 'keydown', (e) => {
      if ((e.ctrlKey || e.metaKey) && !e.altKey && !e.shiftKey && e.key.toLowerCase() === 's') {
        e.preventDefault();
        if (!locked) save();
      }
    }),
  );
  off.add(
    listen(surface, 'mousedown', (e) => {
      if (e.target === surface) {
        e.preventDefault();
        editor.commands.focus('end');
      }
    }),
  );
  off.add(
    listen(form, 'submit', () => {
      clearTimeout(timer);
      syncFields();
      dirty = false;
    }),
  ); // the submit carries the content itself
  off.add(
    listen(window, 'beforeunload', (e) => {
      if (dirty || inflight) {
        e.preventDefault();
        e.returnValue = '';
      }
    }),
  );
  off.add(listen(window, 'pagehide', flush));
  const previewBtn = $('[data-editor-preview]');
  if (previewBtn)
    off.add(
      listen(previewBtn, 'click', async () => {
        const url = form.dataset.preview;
        const win = window.open('about:blank', '_blank'); // opened inside the click so popup blockers allow it
        const ok = locked || (await save());
        if (!ok) {
          win?.close();
          return;
        }
        if (win) {
          win.opener = null;
          win.location.href = url;
        } else window.open(url, '_blank', 'noopener');
      }),
    );

  return () => {
    off.flush();
    clearTimeout(timer);
    flush();
    editor.destroy();
  };
});
