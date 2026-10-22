/* Server-side starter-content import, driven from /admin/import. The page calls /api/admin/import
 * repeatedly with the `next` step this module returns, so each request handles a few images and
 * stays well inside Vercel's function time limit (maxDuration 60 in astro.config.mjs; sharp is
 * slow on a cold function). Photos and logos are fetched from the public GitHub repo at the
 * deployed commit (VERCEL_GIT_COMMIT_SHA): the raw files are not available on the function's file
 * system, and that commit is exactly what the bundled JSON describes. The repo must stay public
 * or the import stops at the first photo. The row mapping is shared with scripts/import-seed.mjs.
 * Idempotent: a re-run keeps admin-owned data (alt text, author links, protected settings)
 * unless force is set. */
import sharp from 'sharp';
import { serviceClient, publicUrl } from './supabase';
import {
  mapEvents,
  mapHighlights,
  mapStories,
  mapStripPhotos,
  mapImpact,
  mapPartners,
  mapOfficers,
  mapSettings,
  mapFaq,
  mapPost,
  mapSolvers,
} from '../../scripts/import-seed.mjs';
import eventsJson from '../data/events.json';
import highlightsJson from '../data/highlights.json';
import storiesJson from '../data/stories.json';
import impactJson from '../data/impact.json';
import partnersJson from '../data/partners.json';
import teamJson from '../data/team.json';
import siteJson from '../data/site.json';
import solversJson from '../data/solvers.json';

const photoFiles = Object.keys(import.meta.glob('../data/photos/*.jpg'))
  .map((p) => p.split('/').pop()!)
  .sort();
const logoFiles = Object.keys(import.meta.glob('../data/partners/*'))
  .map((p) => p.split('/').pop()!)
  .sort();
const postFiles = import.meta.glob('../data/posts/*.md', {
  query: '?raw',
  import: 'default',
  eager: true,
}) as Record<string, string>;
const REPO = 'KFUPM-COMPUTER-CLUB/website';
const ref = () => process.env.VERCEL_GIT_COMMIT_SHA || process.env.VERCEL_GIT_COMMIT_REF || 'main';
const rawUrl = (path: string) => `https://raw.githubusercontent.com/${REPO}/${ref()}/${path}`;
const PHOTO_WIDTHS = [480, 960, 1600],
  LOGO_WIDTHS = [480, 960];
/* Images per request. Each one is several sharp resizes and uploads; raise it with the time limit in mind. */
const BATCH = 6;
/* Settings admins own: imported only when missing, so an import never resets links or templates. */
const PROTECTED = ['links', 'whatsapp_groups', 'email_templates', 'banner'];

export type Step = { step: 'photos' | 'logos' | 'data' | 'done'; offset: number };
export type Progress = { next: Step | null; log: string[]; total: number; done: number };
export const totalMediaSteps = () => photoFiles.length + logoFiles.length;

async function fetchBytes(path: string) {
  const r = await fetch(rawUrl(path));
  if (!r.ok) throw new Error(`Could not fetch ${path} (${r.status})`);
  return new Uint8Array(await r.arrayBuffer());
}
/* A media row with sizes counts as imported; a row without them is a placeholder worth redoing. */
async function exists(key: string) {
  const { data } = await serviceClient().from('media').select('key,sizes').eq('key', key).maybeSingle();
  return !!(data && Object.keys(data.sizes || {}).length);
}

async function importPhoto(name: string, force: boolean) {
  if (!force && (await exists(name))) return 'kept';
  const buf = await fetchBytes(`src/data/photos/${name}`);
  const sb = serviceClient();
  const base = `photos/${name.replace(/\.[^.]+$/, '')}`;
  const meta = await sharp(Buffer.from(buf)).rotate().metadata();
  const width = meta.width || 0,
    height = meta.height || 0;
  const sizes: Record<string, string> = {};
  for (const w of PHOTO_WIDTHS) {
    if (w > width && w !== PHOTO_WIDTHS[0]) continue;
    const out = await sharp(Buffer.from(buf))
      .rotate()
      .resize({ width: Math.min(w, width), withoutEnlargement: true })
      .webp({ quality: 80 })
      .toBuffer();
    const path = `${base}/w${w}.webp`;
    const { error } = await sb.storage
      .from('media')
      .upload(path, out, { contentType: 'image/webp', upsert: true, cacheControl: '31536000' });
    if (error) throw new Error(`${name}: ${error.message}`);
    sizes[String(w)] = publicUrl(`media/${path}`);
  }
  const origPath = `${base}/original.jpg`;
  await sb.storage
    .from('media')
    .upload(origPath, buf, { contentType: 'image/jpeg', upsert: true, cacheControl: '31536000' });
  const { data: old } = await sb.from('media').select('alt,uploaded_by').eq('key', name).maybeSingle();
  const { error } = await sb.from('media').upsert({
    key: name,
    kind: 'image',
    alt: old?.alt || '',
    width,
    height,
    bytes: buf.byteLength,
    sizes,
    path: `media/${origPath}`,
    tags: ['seed', 'photo'],
    bucket: 'media',
    published: true,
    uploaded_by: old?.uploaded_by || null,
  });
  if (error) throw new Error(`${name}: ${error.message}`);
  return 'imported';
}
async function importLogo(name: string, force: boolean) {
  if (!force && (await exists(name))) return 'kept';
  const buf = await fetchBytes(`src/data/partners/${name}`);
  const sb = serviceClient();
  const ext = name.split('.').pop()!.toLowerCase();
  const type =
    ext === 'svg' ? 'image/svg+xml' : ext === 'png' ? 'image/png' : ext === 'webp' ? 'image/webp' : 'image/jpeg';
  const path = `partners/${name}`;
  const { error } = await sb.storage
    .from('media')
    .upload(path, buf, { contentType: type, upsert: true, cacheControl: '31536000' });
  if (error) throw new Error(`${name}: ${error.message}`);
  const sizes: Record<string, string> = { file: publicUrl(`media/${path}`) };
  let width: number | null = null,
    height: number | null = null;
  if (ext !== 'svg') {
    const meta = await sharp(Buffer.from(buf)).metadata();
    width = meta.width || null;
    height = meta.height || null;
    for (const w of LOGO_WIDTHS) {
      if (width && w > width && w !== LOGO_WIDTHS[0]) continue;
      const out = await sharp(Buffer.from(buf))
        .resize({ width: Math.min(w, 800, width || w), withoutEnlargement: true })
        .webp({ quality: 85 })
        .toBuffer();
      const p = `partners/${name.replace(/\.[^.]+$/, '')}/w${w}.webp`;
      await sb.storage
        .from('media')
        .upload(p, out, { contentType: 'image/webp', upsert: true, cacheControl: '31536000' });
      sizes[String(w)] = publicUrl(`media/${p}`);
    }
  }
  const { data: old } = await sb.from('media').select('alt').eq('key', name).maybeSingle();
  const { error: e2 } = await sb.from('media').upsert({
    key: name,
    kind: 'image',
    alt: old?.alt || name.replace(/[-_]/g, ' ').replace(/\.[^.]+$/, ''),
    width,
    height,
    bytes: buf.byteLength,
    sizes,
    path: `media/${path}`,
    tags: ['seed', 'partner'],
    bucket: 'media',
    published: true,
  });
  if (e2) throw new Error(`${name}: ${e2.message}`);
  return 'imported';
}

async function upsertAll(table: string, rows: any[], pk = 'id') {
  if (!rows.length) return 0;
  const { error } = await serviceClient().from(table).upsert(rows, { onConflict: pk });
  if (error) throw new Error(`${table}: ${error.message}`);
  return rows.length;
}

async function importData(log: string[]) {
  const sb = serviceClient();
  const { data: media } = await sb.from('media').select('key');
  const keys = new Set((media || []).map((m: any) => m.key));
  const count = (t: string, n: number) => log.push(`${t}: ${n} rows`);
  count('events', await upsertAll('events', mapEvents(eventsJson as any, keys)));
  count('highlights', await upsertAll('highlights', mapHighlights(highlightsJson as any, keys)));
  count('stories', await upsertAll('stories', mapStories(storiesJson as any, keys)));
  count(
    'strip_photos',
    await upsertAll(
      'strip_photos',
      mapStripPhotos(
        photoFiles.filter((k) => keys.has(k)),
        eventsJson as any,
        highlightsJson as any,
      ),
      'photo_key',
    ),
  );
  const impact = mapImpact(impactJson as any, keys) as any;
  count('impact_semesters', await upsertAll('impact_semesters', impact.semesters));
  count('impact_items', await upsertAll('impact_items', impact.items));
  count('partners', await upsertAll('partners', mapPartners(partnersJson as any, keys)));
  count('officer_terms', await upsertAll('officer_terms', mapOfficers(teamJson as any)));
  count('faq', await upsertAll('faq', mapFaq((siteJson as any).faq || [])));
  const { data: existing } = await sb.from('settings').select('key');
  const have = new Set((existing || []).map((r: any) => r.key));
  const settings = mapSettings(siteJson as any, impactJson as any).filter(
    (s: any) => !(PROTECTED.includes(s.key) && have.has(s.key)),
  );
  count('settings', await upsertAll('settings', settings, 'key'));
  // Author links, covers and editor JSON belong to admins and survive a re-import.
  const posts = Object.entries(postFiles).map(([path, src]) => mapPost(path.split('/').pop()!, src));
  const { data: oldPosts } = await sb
    .from('posts')
    .select('id,author_id,cover_key,content_json')
    .in(
      'id',
      posts.map((p: any) => p.id),
    );
  const keep = new Map((oldPosts || []).map((p: any) => [p.id, p]));
  count(
    'posts',
    await upsertAll(
      'posts',
      posts.map((p: any) => ({
        ...p,
        ...(keep.get(p.id)
          ? {
              author_id: keep.get(p.id).author_id,
              cover_key: keep.get(p.id).cover_key,
              content_json: keep.get(p.id).content_json,
            }
          : {}),
      })),
    ),
  );
  count('flag_solvers', await upsertAll('flag_solvers', mapSolvers(solversJson as any)));
}

/* Runs one batch and says what to run next. */
export async function runStep(s: Step, force: boolean): Promise<Progress> {
  const log: string[] = [];
  const total = totalMediaSteps() + 1;
  if (s.step === 'photos') {
    const slice = photoFiles.slice(s.offset, s.offset + BATCH);
    for (const name of slice) {
      try {
        log.push(`${name}: ${await importPhoto(name, force)}`);
      } catch (e: any) {
        log.push(`${name}: FAILED ${e.message}`);
      }
    }
    const next =
      s.offset + BATCH < photoFiles.length
        ? { step: 'photos' as const, offset: s.offset + BATCH }
        : { step: 'logos' as const, offset: 0 };
    return { next, log, total, done: Math.min(s.offset + BATCH, photoFiles.length) };
  }
  if (s.step === 'logos') {
    const slice = logoFiles.slice(s.offset, s.offset + BATCH);
    for (const name of slice) {
      try {
        log.push(`${name}: ${await importLogo(name, force)}`);
      } catch (e: any) {
        log.push(`${name}: FAILED ${e.message}`);
      }
    }
    const next =
      s.offset + BATCH < logoFiles.length
        ? { step: 'logos' as const, offset: s.offset + BATCH }
        : { step: 'data' as const, offset: 0 };
    return { next, log, total, done: photoFiles.length + Math.min(s.offset + BATCH, logoFiles.length) };
  }
  if (s.step === 'data') {
    await importData(log);
    return { next: null, log, total, done: total };
  }
  return { next: null, log, total, done: total };
}
