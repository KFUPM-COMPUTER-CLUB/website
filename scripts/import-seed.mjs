#!/usr/bin/env node
/* One-shot, idempotent import of the seed content (src/data, src/data/posts, src/assets) into
 * Supabase. Run it once after the schema migration, and again whenever the seed files change:
 *
 *   node scripts/import-seed.mjs            # import (reads .env and process.env)
 *   node scripts/import-seed.mjs --dry-run  # no writes; prints what would change
 *   node scripts/import-seed.mjs --force    # re-upload every image, overwrite admin-owned settings
 *
 * Needs PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY (or SUPABASE_SECRET_KEY). Every row gets a deterministic id derived
 * from its seed identity, so a second run finds its own rows and only writes what changed. Rows
 * that admins own (alt text, author links, the links/banner/whatsapp/email settings) are never
 * overwritten without --force.
 *
 * The map* functions are also imported by src/lib/importer.ts (the in-app import), so this file
 * must stay free of side effects on import; main() only runs when the script is invoked directly. */
import { readFileSync, readdirSync, existsSync } from 'node:fs';
import { join, resolve, dirname, extname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createHash } from 'node:crypto';
import { createClient } from '@supabase/supabase-js';
import sharp from 'sharp';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const argv = new Set(process.argv.slice(2));
const DRY = argv.has('--dry-run');
const FORCE = argv.has('--force');
const BUCKET = 'media';
const PHOTO_WIDTHS = [480, 960, 1600];
const LOGO_WIDTHS = [480, 960];
const LOGO_MAX = 800;
const PROTECTED_SETTINGS = ['links', 'whatsapp_groups', 'email_templates', 'banner'];
const CONTENT_TYPES = {
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
  '.svg': 'image/svg+xml',
  '.webp': 'image/webp',
  '.gif': 'image/gif',
};

/* ── Small helpers ─────────────────────────────────────────────────────── */

/* Minimal .env parser: KEY=value, optional quotes, # comments. process.env wins over the file. */
export function parseEnv(text) {
  const out = {};
  for (const raw of text.split(/\r?\n/)) {
    const line = raw.trim();
    if (!line || line.startsWith('#')) continue;
    const m = /^(?:export\s+)?([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)$/.exec(line);
    if (!m) continue;
    let v = m[2].trim();
    const q = /^(["'])([\s\S]*)\1\s*(?:#.*)?$/.exec(v);
    if (q) v = q[2];
    else v = v.replace(/\s+#.*$/, '').trim();
    out[m[1]] = v;
  }
  return out;
}

/* Deterministic UUID: sha1 of a seed identity, laid out like a version 5 UUID (RFC 4122). */
export function uuidFrom(seed) {
  const h = createHash('sha1').update(seed, 'utf8').digest();
  h[6] = (h[6] & 0x0f) | 0x50; // version nibble = 5
  h[8] = (h[8] & 0x3f) | 0x80; // variant bits = 10
  const x = h.subarray(0, 16).toString('hex');
  return `${x.slice(0, 8)}-${x.slice(8, 12)}-${x.slice(12, 16)}-${x.slice(16, 20)}-${x.slice(20)}`;
}

/* Riyadh is UTC+3 with no daylight saving, so a wall-clock time converts by a fixed offset. */
export const riyadhIso = (date, h = 0, min = 0, s = 0, ms = 0) => {
  const [y, m, d] = date.split('-').map(Number);
  return new Date(Date.UTC(y, m - 1, d, h - 3, min, s, ms)).toISOString();
};
export const riyadhEndOfDay = (date) => riyadhIso(date, 23, 59, 59, 999);

/* "8:00 PM", "20:00" or "8:00 PM – 9:30 PM" -> a start and an optional end as {h, min}; both null when there is no time. */
export function parseTimeRange(text) {
  const one = (s) => {
    const m = /^\s*(\d{1,2}):(\d{2})\s*(AM|PM)?/i.exec(s || '');
    if (!m) return null;
    let h = Number(m[1]);
    const ap = m[3]?.toUpperCase();
    if (ap === 'PM' && h < 12) h += 12;
    if (ap === 'AM' && h === 12) h = 0;
    return { h, min: Number(m[2]) };
  };
  const [a, b] = String(text || '').split(/\s*[–—-]\s*/);
  const start = one(a);
  return [start, start && b ? one(b) : null];
}

const real = (v) => typeof v === 'string' && v.length > 0 && !v.includes('REPLACE');
const orNull = (v) => (v === undefined || v === null || v === '' ? null : v);
const stable = (v) =>
  JSON.stringify(v, (_, x) =>
    x && typeof x === 'object' && !Array.isArray(x)
      ? Object.fromEntries(
          Object.keys(x)
            .sort()
            .map((k) => [k, x[k]]),
        )
      : x,
  );
const readJson = (p) => JSON.parse(readFileSync(join(ROOT, p), 'utf8'));
const listDir = (p) =>
  existsSync(join(ROOT, p))
    ? readdirSync(join(ROOT, p))
        .filter((f) => !f.startsWith('.'))
        .sort()
    : [];
const stripExt = (f) => f.replace(/\.[^.]+$/, '');

/* Run `fn` over `items` with at most `n` in flight. */
async function pmap(items, n, fn) {
  const out = new Array(items.length);
  let next = 0;
  await Promise.all(
    Array.from({ length: Math.min(n, items.length) }, async () => {
      for (let i; (i = next++) < items.length;) out[i] = await fn(items[i], i);
    }),
  );
  return out;
}

/* ── Frontmatter + Markdown (enough for the seed posts) ───────────────── */

export function parseFrontmatter(src) {
  const m = /^---\r?\n([\s\S]*?)\r?\n---\r?\n?/.exec(src);
  if (!m) return { data: {}, body: src };
  const scalar = (v) => {
    v = v.trim();
    if (v.startsWith('[') && v.endsWith(']')) {
      try {
        return JSON.parse(v);
      } catch {
        return v
          .slice(1, -1)
          .split(',')
          .map((s) => s.trim().replace(/^["']|["']$/g, ''))
          .filter(Boolean);
      }
    }
    const q = /^(["'])([\s\S]*)\1$/.exec(v);
    if (q) return q[2].replace(/\\"/g, '"');
    if (v === 'true') return true;
    if (v === 'false') return false;
    if (/^-?\d+(\.\d+)?$/.test(v)) return Number(v);
    return v;
  };
  const data = {};
  for (const line of m[1].split(/\r?\n/)) {
    const kv = /^([\w-]+):\s*(.*)$/.exec(line);
    if (kv) data[kv[1]] = scalar(kv[2]);
  }
  return { data, body: src.slice(m[0].length) };
}

const escapeHtml = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

/* Inline markdown on an already-escaped string: code spans first (their content is left alone),
 * then links, bold and italic on the text between them. */
function inline(text) {
  const esc = escapeHtml(text);
  return esc
    .split(/(`[^`\n]+`)/)
    .map((part) => {
      if (part.startsWith('`') && part.endsWith('`') && part.length > 1) return `<code>${part.slice(1, -1)}</code>`;
      return part
        .replace(/\[([^\]]+)\]\(([^)\s]+)\)/g, '<a href="$2">$1</a>')
        .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
        .replace(/(^|[^\w*])\*(?!\s)([^*\n]+?)(?<!\s)\*(?![\w*])/g, '$1<em>$2</em>')
        .replace(/(^|[^\w])_(?!\s)([^_\n]+?)(?<!\s)_(?!\w)/g, '$1<em>$2</em>');
    })
    .join('');
}

/* Block-level markdown: fenced code, headings, blockquotes, lists, paragraphs. Produces the same
 * HTML shapes the site's editor emits (<pre><code class="language-x">, <ul><li>, ...). */
export function markdownToHtml(md) {
  const lines = md.replace(/\r\n?/g, '\n').split('\n');
  const out = [];
  let i = 0;
  const isBlank = (l) => /^\s*$/.test(l);
  const isUl = (l) => /^\s*[-*+]\s+/.test(l);
  const isOl = (l) => /^\s*\d+[.)]\s+/.test(l);
  const isBlock = (l) => /^```/.test(l) || /^#{1,6}\s/.test(l) || /^\s*>/.test(l) || isUl(l) || isOl(l);
  while (i < lines.length) {
    const line = lines[i];
    if (isBlank(line)) {
      i++;
      continue;
    }
    if (/^```/.test(line)) {
      const lang = line.slice(3).trim();
      const code = [];
      i++;
      while (i < lines.length && !/^```\s*$/.test(lines[i])) code.push(lines[i++]);
      i++; // closing fence
      out.push(
        `<pre><code${lang ? ` class="language-${escapeHtml(lang)}"` : ''}>${escapeHtml(code.join('\n'))}</code></pre>`,
      );
      continue;
    }
    const h = /^(#{1,6})\s+(.*?)\s*#*\s*$/.exec(line);
    if (h) {
      out.push(`<h${h[1].length}>${inline(h[2])}</h${h[1].length}>`);
      i++;
      continue;
    }
    if (/^\s*>/.test(line)) {
      const quoted = [];
      while (i < lines.length && /^\s*>/.test(lines[i])) quoted.push(lines[i++].replace(/^\s*>\s?/, ''));
      out.push(`<blockquote>${markdownToHtml(quoted.join('\n'))}</blockquote>`);
      continue;
    }
    if (isUl(line) || isOl(line)) {
      const ordered = isOl(line);
      const test = ordered ? isOl : isUl;
      const items = [];
      while (i < lines.length && test(lines[i])) {
        let item = lines[i++].replace(/^\s*(?:[-*+]|\d+[.)])\s+/, '');
        while (i < lines.length && !isBlank(lines[i]) && !isBlock(lines[i])) item += ' ' + lines[i++].trim(); // lazy continuation
        items.push(`<li>${inline(item)}</li>`);
      }
      out.push(ordered ? `<ol>${items.join('')}</ol>` : `<ul>${items.join('')}</ul>`);
      continue;
    }
    const para = [];
    while (i < lines.length && !isBlank(lines[i]) && !isBlock(lines[i])) para.push(lines[i++].trim());
    out.push(`<p>${inline(para.join(' '))}</p>`);
  }
  return out.join('\n');
}

/* ── Environment and client ────────────────────────────────────────────── */

const fileEnv = existsSync(join(ROOT, '.env')) ? parseEnv(readFileSync(join(ROOT, '.env'), 'utf8')) : {};
const env = (k) => process.env[k] ?? fileEnv[k] ?? '';
let SUPABASE_URL = env('PUBLIC_SUPABASE_URL').replace(/\/+$/, '');
const SERVICE_KEY = env('SUPABASE_SERVICE_ROLE_KEY') || env('SUPABASE_SECRET_KEY');
const publicUrl = (path) => `${SUPABASE_URL}/storage/v1/object/public/${BUCKET}/${path}`;

/* ── Logging and bookkeeping ───────────────────────────────────────────── */

const log = (...a) => console.log(...a);
const stats = {};
const skips = [];
const stat = (table) => (stats[table] ??= { inserted: 0, updated: 0, unchanged: 0, deleted: 0, skipped: 0 });
const skip = (table, why) => {
  stat(table).skipped++;
  skips.push(`${table}: ${why}`);
};

/* ── Generic table sync ────────────────────────────────────────────────────
 * Fetches the rows with the same primary keys, compares column by column and upserts only what is
 * new or changed. `keep` lists columns whose existing value is preserved on updates (admin-owned);
 * `protect(existing)` returning true leaves the whole row alone unless --force. */
let db = null;

async function selectIn(table, pk, ids, columns = '*') {
  if (!db || !ids.length) return [];
  const rows = [];
  for (let i = 0; i < ids.length; i += 100) {
    const { data, error } = await db
      .from(table)
      .select(columns)
      .in(pk, ids.slice(i, i + 100));
    if (error) throw new Error(`select ${table}: ${error.message}`);
    rows.push(...data);
  }
  return rows;
}

const norm = (v) => {
  if (v === undefined || v === null) return null;
  if (typeof v === 'string' && /^\d{4}-\d{2}-\d{2}T/.test(v) && !Number.isNaN(Date.parse(v)))
    return new Date(v).toISOString();
  if (typeof v === 'object') return stable(v);
  return v;
};
const same = (existing, row) => Object.keys(row).every((k) => norm(existing[k]) === norm(row[k]));

async function sync(table, rows, { pk = 'id', label = (r) => r[pk], keep = [], protect = () => false } = {}) {
  const s = stat(table);
  const existing = new Map(
    (
      await selectIn(
        table,
        pk,
        rows.map((r) => r[pk]),
      )
    ).map((r) => [r[pk], r]),
  );
  const writes = [];
  for (const row of rows) {
    const cur = existing.get(row[pk]);
    const payload = cur ? { ...row, ...Object.fromEntries(keep.filter((k) => k in cur).map((k) => [k, cur[k]])) } : row;
    if (cur && same(cur, payload)) {
      s.unchanged++;
      continue;
    }
    if (cur && !FORCE && protect(cur)) {
      skip(table, `${label(row)} differs from the seed but is admin-owned; kept (use --force to overwrite)`);
      continue;
    }
    if (DRY) log(`  ${cur ? '~' : '+'} ${table}: ${label(row)}`);
    if (cur) s.updated++;
    else s.inserted++;
    writes.push(payload);
  }
  if (!DRY && writes.length) {
    // PostgREST needs every object in a bulk upsert to have the same keys, so group by key set.
    const groups = new Map();
    for (const w of writes) {
      const sig = Object.keys(w).sort().join(',');
      (groups.get(sig) ?? groups.set(sig, []).get(sig)).push(w);
    }
    for (const group of groups.values()) {
      for (let i = 0; i < group.length; i += 100) {
        const { error } = await db.from(table).upsert(group.slice(i, i + 100), { onConflict: pk });
        if (error) throw new Error(`upsert ${table}: ${error.message}`);
      }
    }
  }
  return writes.length;
}

/* ── Storage ───────────────────────────────────────────────────────────── */

async function upload(path, body, contentType) {
  if (DRY) return;
  for (let attempt = 1; ; attempt++) {
    const { error } = await db.storage
      .from(BUCKET)
      .upload(path, body, { upsert: true, contentType, cacheControl: '31536000' });
    if (!error) return;
    if (attempt >= 3) throw new Error(`upload ${path}: ${error.message}`);
    await new Promise((r) => setTimeout(r, 500 * attempt));
  }
}

async function headOk(url) {
  try {
    return (await fetch(url, { method: 'HEAD' })).status === 200;
  } catch {
    return false;
  }
}

/* ── 1. Media ──────────────────────────────────────────────────────────────
 * Each seed image becomes a folder in the bucket (WebP sizes + original) and one media row whose
 * key is the original file name. Returns the set of media keys that exist after this step. */
async function importMedia() {
  const photoDir = 'src/data/photos',
    logoDir = 'src/data/partners';
  const photos = listDir(photoDir).filter((f) => /\.jpe?g$/i.test(f));
  const logos = listDir(logoDir).filter((f) => extname(f).toLowerCase() in CONTENT_TYPES);

  // Plan every file: metadata, expected storage paths and the media row it maps to.
  const plan = async (file, dir, isPhoto) => {
    const abs = join(ROOT, dir, file);
    const buf = readFileSync(abs);
    const ext = extname(file).toLowerCase();
    const name = stripExt(file);
    let meta;
    try {
      meta = await sharp(buf).metadata();
    } catch (e) {
      skip('media', `${file}: unreadable (${e.message})`);
      return null;
    }
    const rotated = meta.orientation >= 5; // EXIF rotation swaps the axes
    const width = (rotated ? meta.height : meta.width) ?? null,
      height = (rotated ? meta.width : meta.height) ?? null;
    const folder = isPhoto ? `photos/${name}` : `partners/${name}`;
    const originalPath = isPhoto ? `${folder}/original.jpg` : `partners/${file}`;
    const variants = []; // { slot, width, path }
    if (isPhoto) {
      for (const w of PHOTO_WIDTHS)
        if (width && w <= width) variants.push({ slot: String(w), width: w, path: `${folder}/w${w}.webp` });
    } else if (ext !== '.svg') {
      const seen = new Set();
      for (const w of LOGO_WIDTHS) {
        const actual = Math.min(w, LOGO_MAX, width || w); // never enlarge; cap at LOGO_MAX
        if (seen.has(actual)) continue;
        seen.add(actual);
        variants.push({ slot: String(w), width: actual, path: `${folder}/w${w}.webp` });
      }
    }
    const sizes = Object.fromEntries(variants.map((v) => [v.slot, publicUrl(v.path)]));
    if (!isPhoto) sizes.file = publicUrl(originalPath);
    return {
      file,
      buf,
      ext,
      isPhoto,
      originalPath,
      variants,
      row: {
        key: file,
        kind: 'image',
        alt: '',
        width,
        height,
        bytes: buf.length,
        sizes,
        path: originalPath,
        tags: isPhoto ? ['seed', 'photo'] : ['seed', 'partner'],
      },
    };
  };
  const items = (
    await Promise.all([...photos.map((f) => plan(f, photoDir, true)), ...logos.map((f) => plan(f, logoDir, false))])
  ).filter(Boolean);
  log(`media: ${photos.length} photos, ${logos.length} partner logos`);

  // Fast path: a row that already exists with every size reachable in storage is not re-processed.
  const existing = new Map(
    (
      await selectIn(
        'media',
        'key',
        items.map((it) => it.row.key),
        'key,alt,sizes,path,tags,uploaded_by',
      )
    ).map((r) => [r.key, r]),
  );
  const upToDate = async (it) => {
    const cur = existing.get(it.row.key);
    if (!cur || FORCE || cur.path !== it.originalPath) return false;
    const urls = [...Object.values(it.row.sizes), publicUrl(it.originalPath)];
    if (Object.keys(it.row.sizes).some((k) => cur.sizes?.[k] !== it.row.sizes[k])) return false;
    return (await pmap(urls, 4, headOk)).every(Boolean);
  };
  const fresh = await pmap(items, 8, upToDate);
  const todo = items.filter((_, i) => !fresh[i]);
  const skippedUploads = items.length - todo.length;
  log(`media: ${skippedUploads} already in storage, ${todo.length} to ${DRY ? 'process (dry run)' : 'process'}`);

  // Resize + upload. sharp is CPU bound and the uploads are network bound, so a little concurrency helps.
  await pmap(todo, 3, async (it) => {
    if (DRY) {
      log(`  ^ upload ${it.file}: ${it.variants.map((v) => `${v.slot}=${v.width}px`).join(' ') || 'original only'}`);
      return;
    }
    const base = sharp(it.buf).rotate();
    for (const v of it.variants) {
      const webp = await base
        .clone()
        .resize({ width: v.width, withoutEnlargement: true })
        .webp({ quality: 80 })
        .toBuffer();
      await upload(v.path, webp, 'image/webp');
    }
    await upload(it.originalPath, it.buf, CONTENT_TYPES[it.ext]);
    log(`  uploaded ${it.file} (${it.variants.length} sizes + original)`);
  });

  // Rows: alt text and uploader belong to admins, tags are merged rather than replaced.
  const rows = items.map((it) => {
    const cur = existing.get(it.row.key);
    return cur ? { ...it.row, tags: [...new Set([...(cur.tags || []), ...it.row.tags])] } : it.row;
  });
  await sync('media', rows, { pk: 'key', keep: ['alt', 'uploaded_by'] });
  stat('media').uploads = todo.length;
  stat('media').cached = skippedUploads;
  return new Set(items.map((it) => it.row.key));
}

/* ── 2–12. Content tables ──────────────────────────────────────────────── */

export function mapEvents(events, mediaKeys) {
  return events.map((e) => {
    const [start, end] = parseTimeRange(e.time);
    const allDay = !start;
    let endsAt = e.endDate ? riyadhEndOfDay(e.endDate) : null;
    if (!endsAt && end) {
      // a same-day range like "8:00 PM – 9:30 PM"; a range that passes midnight ends the next day
      const endMs =
        Date.parse(riyadhIso(e.date, end.h, end.min)) +
        (end.h * 60 + end.min <= start.h * 60 + start.min ? 86_400_000 : 0);
      endsAt = new Date(endMs).toISOString();
    }
    if (e.image && !mediaKeys.has(e.image))
      skip('events', `${e.id}: cover "${e.image}" is not a media key, left empty`);
    return {
      id: uuidFrom(`event:${e.id}`),
      slug: e.id,
      title: e.title,
      type: e.type || 'Other',
      starts_at: allDay ? riyadhIso(e.date) : riyadhIso(e.date, start.h, start.min),
      ends_at: endsAt,
      all_day: allDay,
      location: e.location || '',
      summary: e.summary || '',
      cover_key: e.image && mediaKeys.has(e.image) ? e.image : null,
      x_url: orNull(e.detailsUrl),
      register_url: real(e.registerUrl) ? e.registerUrl : null,
      featured: !!e.featured,
      published: true,
    };
  });
}

export const mapHighlights = (list, mediaKeys) =>
  list.map((h, i) => {
    if (h.photo && !mediaKeys.has(h.photo)) skip('highlights', `${h.title}: photo "${h.photo}" is not a media key`);
    return {
      id: uuidFrom(`highlight:${h.photo}`),
      photo_key: mediaKeys.has(h.photo) ? h.photo : null,
      title: h.title,
      date: h.date,
      line: h.line || '',
      post_url: orNull(h.post),
      sort: i,
      visible: true,
    };
  });

export const mapStories = (list, mediaKeys) =>
  list.map((s, i) => {
    if (s.photo && !mediaKeys.has(s.photo)) skip('stories', `${s.title}: photo "${s.photo}" is not a media key`);
    return {
      id: uuidFrom(`story:${s.photo}`),
      photo_key: mediaKeys.has(s.photo) ? s.photo : null,
      title: s.title,
      date: s.date,
      text: s.text || '',
      post_url: orNull(s.post),
      sort: i,
      visible: true,
    };
  });

/* The photo strip: every seed photo, labelled by the event or highlight it belongs to. */
export function mapStripPhotos(photoKeys, events, highlights) {
  const byImage = new Map(events.filter((e) => e.image).map((e) => [e.image, e.title]));
  const byPhoto = new Map(highlights.map((h) => [h.photo, h.title]));
  const byDate = new Map();
  for (const e of events) if (!byDate.has(e.date)) byDate.set(e.date, e.title);
  return [...photoKeys].sort().map((key, i) => {
    const [date, id] = stripExt(key).split('_');
    return {
      photo_key: key,
      label: byImage.get(key) || byPhoto.get(key) || byDate.get(date) || '@KFUPM_CC',
      post_url: id ? `https://x.com/KFUPM_CC/status/${id}` : null,
      sort: i,
      visible: true,
    };
  });
}

export function mapImpact(impact, mediaKeys) {
  const semesters = [],
    items = [];
  (impact.semesters || []).forEach((s, i) => {
    if (s.photo && !mediaKeys.has(s.photo))
      skip('impact_semesters', `${s.term}: photo "${s.photo}" is not a media key`);
    const id = uuidFrom(`impact:${s.term}`);
    semesters.push({
      id,
      term: s.term,
      total_sar: s.total_sar ?? null,
      total_is_minimum: !!s.total_is_minimum,
      photo_key: s.photo && mediaKeys.has(s.photo) ? s.photo : null,
      sort: i,
    });
    (s.events || []).forEach((e, j) =>
      items.push({
        id: uuidFrom(`impactitem:${s.term}:${e.name}`),
        semester_id: id,
        name: e.name,
        prize_sar: e.prize_sar ?? null,
        detail: orNull(e.detail),
        source_url: orNull(e.source),
        sort: j,
      }),
    );
  });
  return { semesters, items };
}

export function mapPartners(partners, mediaKeys) {
  const groups = [
    ['companies', 'company'],
    ['kfupm_units', 'kfupm_unit'],
    ['student_clubs', 'student_club'],
    ['visited', 'visited'],
  ];
  const rows = [];
  let sort = 0;
  for (const [field, kind] of groups) {
    for (const p of partners[field] || []) {
      if (p.logo && !mediaKeys.has(p.logo)) skip('partners', `${p.name}: logo "${p.logo}" is not a media key`);
      rows.push({
        id: uuidFrom(`partner:${kind}:${p.name}`),
        name: p.name,
        kind,
        what: orNull(p.what),
        url: orNull(p.url),
        source_url: orNull(p.source),
        logo_key: p.logo && mediaKeys.has(p.logo) ? p.logo : null,
        handle: orNull(p.handle),
        mark: !!p.mark,
        square: !!p.square,
        tall: !!p.tall,
        sort: sort++,
        visible: kind !== 'visited',
      });
    }
  }
  return rows;
}

export const mapOfficers = (team) =>
  team.map((m, i) => ({
    id: uuidFrom(`officer:${m.id}`),
    name: m.name,
    title: m.role,
    committee: m.committee || '',
    term: m.term || '',
    major: orNull(m.major),
    linkedin: orNull(m.linkedin),
    sort: m.order ?? i,
    is_current: true,
    photo_key: null,
  }));

export function mapSettings(site, impact) {
  const clean = (v) => (real(v) ? v : '');
  const prizes = Number(String(impact.headline_numbers?.announced_prizes_since_2023_sar ?? '').replace(/\D/g, '')) || 0;
  return [
    {
      key: 'site',
      value: {
        name: site.name,
        short: site.short,
        tagline: site.tagline,
        description: site.description,
        intro: site.intro,
        email: clean(site.email),
        missionAr: site.missionAr || '',
      },
    },
    { key: 'links', value: Object.fromEntries(Object.entries(site.links || {}).map(([k, v]) => [k, clean(v)])) },
    {
      key: 'home',
      value: {
        heroLine: site.tagline,
        buildWithUs: {
          title: 'Build with us.',
          text: 'Workshops, hackathons, talks and competitions, all term long. Free for KFUPM students.',
        },
        photoMoment: {
          photoKey: '2025-04-10_1910478806520914205.jpg',
          eyebrow: 'Techathon 2025, day one',
          line: 'Any major. Any year. No experience required.',
        },
        stats: [
          { v: '40,000', u: 'SAR', l: 'biggest prize pool' },
          { v: '60+', u: 'teams', l: 'at Techathon 2025' },
          { v: '400+', u: 'students', l: 'at KAUST Connect' },
        ],
        totalPrizesSar: prizes,
      },
    },
    { key: 'made_by', value: site.madeBy || [] },
    { key: 'banner', value: { text: '', url: '', visible: false } },
    { key: 'whatsapp_groups', value: [] },
    { key: 'email_templates', value: {} },
  ];
}

export const mapFaq = (faq) =>
  faq.map((f, i) => ({ id: uuidFrom(`faq:${f.q}`), q_en: f.q, a_en: f.a, sort: i, visible: true }));

export function mapPost(file, src) {
  const slug = stripExt(file);
  const { data, body } = parseFrontmatter(src);
  const date = data.date instanceof Date ? data.date.toISOString().slice(0, 10) : String(data.date || '').slice(0, 10);
  return {
    id: uuidFrom(`post:${slug}`),
    slug,
    title: data.title || slug,
    excerpt: data.excerpt || '',
    content_html: markdownToHtml(body.trim()),
    dir: 'ltr',
    category: data.category || 'News',
    tags: Array.isArray(data.tags) ? data.tags : [],
    author_id: null,
    author_name: data.author || null,
    status: 'published',
    published_at: /^\d{4}-\d{2}-\d{2}$/.test(date) ? riyadhIso(date) : new Date().toISOString(),
  };
}

export const mapSolvers = (list) =>
  (Array.isArray(list) ? list : [])
    .filter((s) => s && (s.name || typeof s === 'string'))
    .map((s) => {
      const name = String(typeof s === 'string' ? s : s.name).slice(0, 40),
        handle = orNull(typeof s === 'string' ? null : s.handle);
      return {
        id: uuidFrom(`solver:${name}:${handle || ''}`),
        name,
        handle: handle ? String(handle).slice(0, 40) : null,
        approved: true,
      };
    });

/* ── Main ──────────────────────────────────────────────────────────────── */

async function main() {
  log(`seed import${DRY ? ' (dry run: nothing is written)' : ''}${FORCE ? ' (force)' : ''}`);
  if (!SUPABASE_URL || !SERVICE_KEY) {
    const missing = [!SUPABASE_URL && 'PUBLIC_SUPABASE_URL', !SERVICE_KEY && 'SUPABASE_SERVICE_ROLE_KEY']
      .filter(Boolean)
      .join(' and ');
    if (!DRY) {
      console.error(`Missing ${missing}. Put them in .env (see .env.example) or export them, then run again.`);
      process.exit(1);
    }
    log(
      `note: ${missing} not set; the dry run assumes an empty database${SUPABASE_URL ? '' : ' and a placeholder project URL'}.`,
    );
    SUPABASE_URL ||= 'https://PROJECT.supabase.co';
  } else {
    db = createClient(SUPABASE_URL, SERVICE_KEY, { auth: { persistSession: false, autoRefreshToken: false } });
    const { error } = await db.from('settings').select('key').limit(1);
    if (error) {
      console.error(
        `Cannot reach the database at ${SUPABASE_URL}: ${error.message}. Has supabase/migrations/0001_init.sql been applied?`,
      );
      process.exit(1);
    }
  }

  const events = readJson('src/data/events.json');
  const highlights = readJson('src/data/highlights.json');
  const stories = readJson('src/data/stories.json');
  const impact = readJson('src/data/impact.json');
  const partners = readJson('src/data/partners.json');
  const team = readJson('src/data/team.json');
  const site = readJson('src/data/site.json');
  const solvers = existsSync(join(ROOT, 'src/data/solvers.json')) ? readJson('src/data/solvers.json') : [];

  // 1. Media first: every other table points at media keys.
  const mediaKeys = await importMedia();
  const photoKeys = [...mediaKeys].filter((k) => /^\d{4}-\d{2}-\d{2}_\d+\.jpe?g$/i.test(k));

  // 2–5. Events, highlights, stories, the photo strip.
  await sync('events', mapEvents(events, mediaKeys), { label: (r) => r.slug });
  await sync('highlights', mapHighlights(highlights, mediaKeys), { label: (r) => r.title });
  await sync('stories', mapStories(stories, mediaKeys), { label: (r) => r.title });
  await sync('strip_photos', mapStripPhotos(photoKeys, events, highlights), { pk: 'photo_key' });

  // 6. Impact: semesters, then their items; items dropped from the JSON are deleted.
  const { semesters, items } = mapImpact(impact, mediaKeys);
  await sync('impact_semesters', semesters, { label: (r) => r.term });
  await sync('impact_items', items, { label: (r) => r.name });
  const current = await selectIn(
    'impact_items',
    'semester_id',
    semesters.map((s) => s.id),
    'id,name,semester_id',
  );
  const keepIds = new Set(items.map((i) => i.id));
  const stale = current.filter((r) => !keepIds.has(r.id));
  if (stale.length) {
    if (DRY) stale.forEach((r) => log(`  - impact_items: ${r.name}`));
    else {
      const { error } = await db
        .from('impact_items')
        .delete()
        .in(
          'id',
          stale.map((r) => r.id),
        );
      if (error) throw new Error(`delete impact_items: ${error.message}`);
    }
    stat('impact_items').deleted += stale.length;
  }

  // 7–10. Partners, officers, settings, FAQ.
  await sync('partners', mapPartners(partners, mediaKeys), { label: (r) => `${r.kind}/${r.name}` });
  await sync('officer_terms', mapOfficers(team), {
    label: (r) => `${r.name} (${r.title})`,
    keep: ['user_id', 'photo_key'],
  });
  await sync('settings', mapSettings(site, impact), {
    pk: 'key',
    protect: (cur) => PROTECTED_SETTINGS.includes(cur.key),
  });
  await sync('faq', mapFaq(site.faq || []), { label: (r) => r.q_en });

  // 11. Posts from markdown.
  const posts = listDir('src/data/posts')
    .filter((f) => f.endsWith('.md'))
    .map((f) => mapPost(f, readFileSync(join(ROOT, 'src/data/posts', f), 'utf8')));
  await sync('posts', posts, { label: (r) => r.slug, keep: ['author_id', 'cover_key', 'content_json'] });

  // 12. Flag solvers.
  await sync('flag_solvers', mapSolvers(solvers), { label: (r) => r.name });

  // Summary.
  const cols = ['table', 'inserted', 'updated', 'unchanged', 'deleted', 'skipped'];
  const rows = Object.entries(stats).map(([t, s]) =>
    [t, s.inserted, s.updated, s.unchanged, s.deleted, s.skipped].map(String),
  );
  const w = cols.map((c, i) => Math.max(c.length, ...rows.map((r) => r[i].length)));
  const line = (r) => r.map((c, i) => (i ? c.padStart(w[i]) : c.padEnd(w[i]))).join('  ');
  log(
    `\n${DRY ? 'would change' : 'changed'}:\n${line(cols)}\n${w.map((n) => '-'.repeat(n)).join('  ')}\n${rows.map(line).join('\n')}`,
  );
  if (stats.media)
    log(
      `media files: ${stats.media.uploads} ${DRY ? 'to upload' : 'uploaded'}, ${stats.media.cached} already in storage`,
    );
  if (skips.length) log(`\nskipped:\n${skips.map((s) => `  ${s}`).join('\n')}`);
  log(DRY ? '\ndry run complete; nothing was written.' : '\ndone.');
}

// Only when run directly: importer.ts imports the map* functions from this file.
if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  main().catch((e) => {
    console.error(`\nimport failed: ${e.message}`);
    process.exit(1);
  });
}
