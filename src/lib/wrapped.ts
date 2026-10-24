/* Semester Wrapped on the server: a member's numbers for a term (member_stats() in
 * 0015_member_dashboard.sql) and the 1080×1920 image /api/me/wrapped.png returns. The image is an SVG
 * template (background, frames, the club logo) turned into a PNG by sharp, with every piece of text
 * drawn by sharp's own text renderer (Pango) in Readex Pro, the site's Arabic face, which also covers
 * Latin. Pango shapes Arabic and sets right-to-left text, so an Arabic name comes out joined and in
 * order. The font travels inside the bundle (?inline) and is written to the temp folder on first use,
 * because Vercel's functions have no fonts of their own. Server only: uses the service key. */
import { mkdir, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import sharp from 'sharp';
import { serviceClient } from './supabase';
import { siteUrl } from './env';
import { EMPTY_STATS, termBadges, type Stats, type Term } from './stats';
import fontData from '../data/brand/fonts/ReadexPro.ttf?inline';
import logoData from '../data/brand/logo-color-ondark-sm.png?inline';

/* The member's numbers for one term. Throws when the query fails (the migration not run yet, say). */
export async function getStats(userId: string, term: Term): Promise<Stats> {
  const { data, error } = await serviceClient().rpc('member_stats', {
    p_user: userId,
    p_from: term.start.toISOString(),
    p_to: term.end.toISOString(),
  });
  if (error) throw new Error(error.message);
  const r: any = Array.isArray(data) ? data[0] : data;
  if (!r) return EMPTY_STATS;
  return {
    events: Number(r.events) || 0,
    registered: Number(r.registered) || 0,
    posts: Number(r.posts) || 0,
    points: Number(r.points) || 0,
    competitions: Number(r.competitions) || 0,
    flag: !!r.flag,
    favouriteType: r.favourite_type || null,
  };
}

/* ── The image ─────────────────────────────────────────────────────────── */

const W = 1080,
  H = 1920,
  PAD = 80;
const C = { top: '#0B1A33', bottom: '#0B0B0F', blue: '#3B82F6', deep: '#2563EB', text: '#F5F5F7', muted: '#A1A1AA' };

/* The font as a file on disk, written once per instance. FONTCONFIG_FILE points fontconfig at that folder
 * on machines without a font setup of their own; fontfile below registers the face either way. */
let fontFile: Promise<string> | null = null;
const font = () =>
  (fontFile ||= (async () => {
    const dir = join(tmpdir(), 'cc-wrapped-fonts');
    await mkdir(dir, { recursive: true });
    const file = join(dir, 'ReadexPro.ttf');
    await writeFile(file, Buffer.from(fontData.slice(fontData.indexOf(',') + 1), 'base64'));
    const conf = join(dir, 'fonts.conf');
    await writeFile(
      conf,
      `<?xml version="1.0"?><!DOCTYPE fontconfig SYSTEM "fonts.dtd"><fontconfig><dir>${dir}</dir><cachedir>${join(dir, 'cache')}</cachedir></fontconfig>`,
    );
    process.env.FONTCONFIG_FILE ||= conf;
    return file;
  })().catch((e) => {
    fontFile = null;
    throw e;
  }));

/* Pango markup is XML: names and labels are escaped. */
const esc = (s: string) =>
  s.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&apos;' })[c]!);

type Text = {
  text: string;
  size: number; // px (dpi 72 makes a point a pixel)
  top: number; // the box's top; with height, the text is centred vertically in the box
  height?: number;
  left?: number;
  width?: number;
  weight?: number;
  color?: string;
  spacing?: number; // letter spacing in px
};
/* One text layer, centred horizontally in its box (default: the page between the margins). */
async function text(t: Text, fontPath: string): Promise<{ input: Buffer; left: number; top: number }> {
  const left = t.left ?? PAD,
    width = t.width ?? W - 2 * PAD;
  const spacing = t.spacing ? ` letter_spacing="${Math.round(t.spacing * 1024)}"` : '';
  const input = await sharp({
    text: {
      text: `<span foreground="${t.color || C.text}" font_weight="${t.weight || 400}"${spacing}>${esc(t.text)}</span>`,
      font: `Readex Pro ${t.size}`,
      fontfile: fontPath,
      width,
      align: 'centre',
      dpi: 72,
      rgba: true,
      wrap: 'word',
    },
  })
    .png()
    .toBuffer();
  const m = await sharp(input).metadata();
  return {
    input,
    left: left + Math.max(0, Math.round((width - (m.width || 0)) / 2)),
    top: t.height ? t.top + Math.max(0, Math.round((t.height - (m.height || 0)) / 2)) : t.top,
  };
}

/* The member's term as a 1080×1920 PNG (a phone story). `name` is null unless the member asked for it. */
export async function renderWrapped({ term, stats, name }: { term: Term; stats: Stats; name: string | null }) {
  const fontPath = await font();
  const tileW = (W - 2 * PAD - 24) / 2,
    tileH = 290;
  const gridTop = name ? 820 : 740;
  const tiles = [
    { value: String(stats.events), label: stats.events === 1 ? 'event attended' : 'events attended' },
    { value: String(stats.posts), label: stats.posts === 1 ? 'post published' : 'posts published' },
    { value: stats.points.toLocaleString('en-US'), label: stats.points === 1 ? 'point' : 'points' },
    { value: stats.favouriteType || '–', label: 'favourite kind of event', small: true },
  ].map((t, i) => ({ ...t, left: PAD + (i % 2) * (tileW + 24), top: gridTop + Math.floor(i / 2) * (tileH + 24) }));
  const badges = termBadges(stats);
  const host = siteUrl.replace(/^https?:\/\//, '').replace(/\/$/, '');

  const svg =
    `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">` +
    `<defs><linearGradient id="bg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${C.top}"/><stop offset="1" stop-color="${C.bottom}"/></linearGradient></defs>` +
    `<rect width="${W}" height="${H}" fill="url(#bg)"/>` +
    `<rect width="${W}" height="14" fill="${C.deep}"/>` +
    `<image href="${logoData}" x="${(W - 330) / 2}" y="110" width="330" height="178"/>` +
    tiles
      .map(
        (t) =>
          `<rect x="${t.left}" y="${t.top}" width="${tileW}" height="${tileH}" fill="${C.blue}" fill-opacity="0.08" stroke="${C.blue}" stroke-opacity="0.55" stroke-width="2"/>`,
      )
      .join('') +
    `<rect x="${PAD}" y="${H - 190}" width="${W - 2 * PAD}" height="2" fill="${C.blue}" fill-opacity="0.4"/>` +
    `</svg>`;

  const t = (x: Text) => text(x, fontPath);
  const layers = await Promise.all([
    t({ text: 'SEMESTER WRAPPED', size: 30, weight: 600, color: C.blue, spacing: 6, top: 380 }),
    t({ text: term.label, size: 128, weight: 700, top: 430 }),
    ...(name ? [t({ text: name, size: 60, weight: 500, top: 640, height: 120 })] : []),
    ...tiles.flatMap((tile) => [
      t({
        text: tile.value,
        size: tile.small ? (tile.value.length > 7 ? 64 : 84) : 128,
        weight: 700,
        left: tile.left,
        width: tileW,
        top: tile.top + 24,
        height: 170,
      }),
      t({ text: tile.label, size: 32, color: C.muted, left: tile.left + 16, width: tileW - 32, top: tile.top + 200 }),
    ]),
    // No-break spaces inside a badge, so a line only ever breaks between badges.
    ...(badges.length
      ? [
          t({
            text: badges.map((b) => b.replace(/ /g, ' ')).join('   ·   '),
            size: 38,
            weight: 500,
            color: C.blue,
            top: gridTop + 2 * (tileH + 24) + 70,
          }),
        ]
      : []),
    t({ text: `KFUPM Computer Club · ${host}`, size: 30, color: C.muted, spacing: 2, top: H - 150 }),
  ]);
  return sharp(Buffer.from(svg)).composite(layers).png({ compressionLevel: 9 }).toBuffer();
}
