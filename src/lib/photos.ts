/* Images for content. With Supabase, every picture is a `media` row with WebP sizes in Storage.
 * Without it (local development, a preview before the keys exist) the same keys resolve to the
 * seed photos in src/assets, optimised by Astro on request. Either way a component gets
 * { src, srcset, width, height } and renders a plain <img>. Only published media rows are visible
 * to the anon key; draft files are addressed through /api/media/<key> instead (see upload.ts). */
import { getImage } from 'astro:assets';
import { dbReady } from './env';
import { publicClient, publicUrl } from './supabase';
import type { Img } from './types';

const localPhotos = import.meta.glob('../data/photos/*.jpg', { eager: true }) as Record<
  string,
  { default: ImageMetadata }
>;
const localLogos = import.meta.glob('../data/partners/*', { eager: true }) as Record<
  string,
  { default: ImageMetadata }
>;
const WIDTHS = [480, 960, 1600];
export const SIZE_NAMES = ['480', '960', '1600'];

type MediaRow = {
  key: string;
  kind: string;
  alt: string;
  width: number | null;
  height: number | null;
  sizes: Record<string, string>;
  path: string;
};
/* The whole media table, cached 60 s per instance: a page shows dozens of pictures and one query
 * beats one per picture. Admin writes call invalidateMedia() so the next render sees new uploads. */
let mediaCache: { at: number; map: Map<string, MediaRow> } | null = null;
export async function mediaMap(): Promise<Map<string, MediaRow>> {
  if (mediaCache && Date.now() - mediaCache.at < 60_000) return mediaCache.map;
  const { data } = await publicClient().from('media').select('key,kind,alt,width,height,sizes,path');
  const map = new Map<string, MediaRow>((data || []).map((m: MediaRow) => [m.key, m]));
  mediaCache = { at: Date.now(), map };
  return map;
}
export const invalidateMedia = () => {
  mediaCache = null;
};

export function mediaImg(m: MediaRow): Img {
  const sizes = m.sizes || {};
  const names = SIZE_NAMES.filter((n) => sizes[n]);
  const src = sizes['960'] || sizes['1600'] || sizes['480'] || sizes.file || publicUrl(m.path);
  return {
    src,
    srcset: names.length ? names.map((n) => `${sizes[n]} ${n}w`).join(', ') : undefined,
    width: m.width ?? undefined,
    height: m.height ?? undefined,
  };
}

/* Resolves one key. Promises are cached so the same picture is not resolved twice in a render; in
 * database mode an entry expires after 60 s, in seed mode it is permanent (the files never change). */
const imgCache = new Map<string, Promise<Img | null>>();
export function photoImg(key: string | null | undefined, kind: 'photo' | 'logo' = 'photo'): Promise<Img | null> {
  if (!key) return Promise.resolve(null);
  const ck = `${kind}:${key}:${dbReady() ? 'db' : 'seed'}`;
  if (!imgCache.has(ck))
    imgCache.set(
      ck,
      (async () => {
        if (dbReady()) {
          const m = (await mediaMap()).get(key);
          return m ? mediaImg(m) : null;
        }
        const mod = kind === 'logo' ? localLogos[`../data/partners/${key}`] : localPhotos[`../data/photos/${key}`];
        if (!mod) return null;
        const meta = mod.default;
        // Logos get one size and keep their format: SVGs pass through untouched, and logos are small anyway.
        if (kind === 'logo' || meta.format === 'svg') {
          const r = await getImage({ src: meta, width: Math.min(meta.width, 600) });
          return { src: r.src, width: r.attributes.width, height: r.attributes.height };
        }
        const r = await getImage({ src: meta, widths: WIDTHS, format: 'webp' });
        return { src: r.src, srcset: r.srcSet.attribute, width: r.attributes.width, height: r.attributes.height };
      })(),
    );
  if (dbReady()) {
    const p = imgCache.get(ck)!;
    setTimeout(() => imgCache.delete(ck), 60_000);
    return p;
  }
  return imgCache.get(ck)!;
}

/* All seed photo keys (file names) with their dates and post ids: the photo strip pool in seed mode. */
export const seedPhotoKeys = () =>
  Object.keys(localPhotos)
    .map((p) => p.split('/').pop()!)
    .sort();
