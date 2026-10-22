import type { APIRoute } from 'astro';
import { handle, requireRole, readBody, ApiError, str, wantsHtml, ok, audit } from '../../../lib/api';
import { serviceClient } from '../../../lib/supabase';
import { storeImage } from '../../../lib/upload';
import { invalidateMedia } from '../../../lib/photos';
import { bust } from '../../../lib/content';

export const prerender = false;
/* Media library writes for /admin/media (officer and up): upload with alt text, edit alt text,
 * delete. A delete is refused while a row in any content table still points at the key, because
 * those columns reference media.key and the public page would lose its picture; the column list
 * below must grow when a new table gets a photo column. Both caches are cleared on every change:
 * photos.ts keeps its own media map apart from the content memo. */
export const POST: APIRoute = handle(async (ctx) => {
  const officer = requireRole(ctx, 'officer');
  const b = await readBody(ctx.request);
  const sb = serviceClient();
  const done = (m: string) => {
    invalidateMedia();
    bust();
    return wantsHtml(ctx.request) ? ctx.redirect(`/admin/media?ok=${encodeURIComponent(m)}`, 303) : ok();
  };
  if (b._action === 'alt') {
    const key = str(b.key, 200);
    const alt = str(b.alt, 200);
    const { data: old } = await sb.from('media').select('alt').eq('key', key).maybeSingle();
    await sb.from('media').update({ alt }).eq('key', key);
    await audit(officer.id, 'update', 'media', key, { alt: old?.alt }, { alt });
    return done('Alt text saved.');
  }
  if (b._action === 'delete') {
    const key = str(b.key, 200);
    const { data: row } = await sb.from('media').select('*').eq('key', key).maybeSingle();
    if (!row) throw new ApiError('Not found.', 404);
    const refs = await Promise.all(
      [
        ['events', 'cover_key'],
        ['highlights', 'photo_key'],
        ['stories', 'photo_key'],
        ['strip_photos', 'photo_key'],
        ['impact_semesters', 'photo_key'],
        ['partners', 'logo_key'],
        ['officer_terms', 'photo_key'],
        ['posts', 'cover_key'],
      ].map(async ([t, c]) => (await sb.from(t).select(c, { count: 'exact', head: true }).eq(c, key)).count || 0),
    );
    if (refs.some((n) => n > 0)) throw new ApiError('That file is still used on the site. Replace it there first.');
    // Storage paths are recovered from the public URLs the row stores, then removed from the right bucket.
    const paths = [
      row.path.replace(/^(media|files)\//, ''),
      ...Object.values(row.sizes || {})
        .map((u: any) =>
          String(u)
            .split('/storage/v1/object/public/')[1]
            ?.replace(/^(media|files)\//, ''),
        )
        .filter(Boolean),
    ];
    await sb.storage.from(row.path.startsWith('files/') ? 'files' : 'media').remove(paths as string[]);
    await sb.from('media').delete().eq('key', key);
    await audit(officer.id, 'delete', 'media', key, row, null);
    return done('File deleted.');
  }
  const file = b.file;
  if (!(file instanceof File) || !file.size) throw new ApiError('Choose an image.');
  const alt = str(b.alt, 200);
  if (!alt) throw new ApiError('Alt text is required.');
  const r = await storeImage(file, alt, officer.id, ['library']);
  await audit(officer.id, 'insert', 'media', r.key, null, { key: r.key, alt });
  return done(`Uploaded ${r.key}.`);
});
