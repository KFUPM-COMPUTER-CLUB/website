/* Uploads for the API routes (api/upload, admin/media, me/profile, me/onboard, posts). Checks the
 * real file type from its bytes, enforces size limits, makes WebP sizes with sharp, puts the files
 * in Storage and records a media row. Two families: public uploads go straight to the media and
 * files buckets; post-editor uploads go to the private drafts bucket and move on publish (see the
 * draft section). Everything here uses the service key, so callers must already have checked the
 * role or ownership. */
import sharp from 'sharp';
import { serviceClient, publicUrl } from './supabase';
import { ApiError } from './api';

// Vercel refuses any function request body over 4.5 MB before our code runs, so stay under it.
const IMAGE_MAX = 4 * 1024 * 1024,
  PDF_MAX = 4 * 1024 * 1024;
const WIDTHS = [480, 960, 1600];
/* The browser-supplied MIME type is just a claim; the first bytes are not. */
const sniff = (b: Uint8Array) => {
  if (b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff) return 'image/jpeg';
  if (b[0] === 0x89 && b[1] === 0x50 && b[2] === 0x4e && b[3] === 0x47) return 'image/png';
  if (b[0] === 0x47 && b[1] === 0x49 && b[2] === 0x46 && b[3] === 0x38) return 'image/gif';
  if (
    b[0] === 0x52 &&
    b[1] === 0x49 &&
    b[2] === 0x46 &&
    b[3] === 0x46 &&
    b[8] === 0x57 &&
    b[9] === 0x45 &&
    b[10] === 0x42 &&
    b[11] === 0x50
  )
    return 'image/webp';
  if (b[0] === 0x25 && b[1] === 0x50 && b[2] === 0x44 && b[3] === 0x46 && b[4] === 0x2d) return 'application/pdf';
  return null;
};
/* Date prefix plus a random id: unique, sortable, and never derived from the user's file name. Keys
 * are what content rows point at, so a key never changes once stored. */
const key = (ext: string) => `${new Date().toISOString().slice(0, 10)}-${crypto.randomUUID().slice(0, 8)}${ext}`;
const safeName = (n: string) => n.replace(/[^\w.\- ]+/g, '').slice(0, 80) || 'file';

export async function storeImage(file: File, alt: string, uploaderId: string | null, tags: string[] = []) {
  if (file.size > IMAGE_MAX) throw new ApiError('Images must be under 4 MB.');
  const buf = new Uint8Array(await file.arrayBuffer());
  const type = sniff(buf);
  if (!type || type === 'application/pdf') throw new ApiError('That file is not a JPEG, PNG, WebP or GIF image.');
  // rotate() with no argument applies the EXIF orientation, so phone photos come out upright.
  const image = sharp(Buffer.from(buf), { animated: false }).rotate();
  const meta = await image.metadata();
  const width = meta.width || 0,
    height = meta.height || 0;
  if (!width || !height) throw new ApiError('Could not read the image.');
  const k = key('.webp');
  const base = `uploads/${k.replace('.webp', '')}`;
  const sb = serviceClient();
  const sizes: Record<string, string> = {};
  // Sizes wider than the source are skipped, except the smallest, so a tiny image still gets one.
  // Keys are unique per upload, so a year-long cache header is safe.
  for (const w of WIDTHS) {
    if (w > width && w !== WIDTHS[0]) continue;
    const out = await sharp(Buffer.from(buf))
      .rotate()
      .resize({ width: Math.min(w, width), withoutEnlargement: true })
      .webp({ quality: 80 })
      .toBuffer();
    const path = `${base}/w${w}.webp`;
    const { error } = await sb.storage
      .from('media')
      .upload(path, out, { contentType: 'image/webp', upsert: true, cacheControl: '31536000' });
    if (error) throw new ApiError(`Upload failed: ${error.message}`, 502);
    sizes[String(w)] = publicUrl(`media/${path}`);
  }
  // The "original" is a 2400px WebP rather than the raw upload: Storage on the free tier is 1 GB.
  const original = await sharp(Buffer.from(buf))
    .rotate()
    .resize({ width: 2400, withoutEnlargement: true })
    .webp({ quality: 85 })
    .toBuffer();
  const origPath = `${base}/original.webp`;
  await sb.storage
    .from('media')
    .upload(origPath, original, { contentType: 'image/webp', upsert: true, cacheControl: '31536000' });
  const row = {
    key: k,
    kind: 'image',
    alt,
    width,
    height,
    bytes: file.size,
    sizes,
    path: `media/${origPath}`,
    tags,
    uploaded_by: uploaderId,
  };
  const { error } = await sb.from('media').insert(row);
  if (error) throw new ApiError(`Could not record the upload: ${error.message}`, 500);
  return { key: k, url: sizes['960'] || sizes['480'] || publicUrl(`media/${origPath}`), width, height, alt, sizes };
}

export async function storePdf(file: File, uploaderId: string | null) {
  if (file.size > PDF_MAX) throw new ApiError('PDFs must be under 4 MB.');
  const buf = new Uint8Array(await file.arrayBuffer());
  if (sniff(buf) !== 'application/pdf') throw new ApiError('That file is not a PDF.');
  const k = key('.pdf');
  const path = `pdf/${k}`;
  const sb = serviceClient();
  const { error } = await sb.storage
    .from('files')
    .upload(path, buf, { contentType: 'application/pdf', upsert: true, cacheControl: '31536000' });
  if (error) throw new ApiError(`Upload failed: ${error.message}`, 502);
  const url = publicUrl(`files/${path}`);
  const name = safeName(file.name);
  await sb.from('media').insert({
    key: k,
    kind: 'pdf',
    alt: name,
    bytes: file.size,
    sizes: { file: url },
    path: `files/${path}`,
    tags: ['pdf'],
    uploaded_by: uploaderId,
  });
  return { key: k, url, name, bytes: file.size };
}

/* ── Draft uploads: private until the post is published ─────────────────── */
/* Files from the post editor land in the private "drafts" bucket under the post's folder and are
 * served through /api/media/<key> with short-lived signed URLs to the author and reviewers only,
 * so an unpublished post cannot leak through a guessable Storage URL. The media row records
 * bucket, post_id and published, which is how that route decides between a public redirect and a
 * signed URL. On publish, publishPostMedia moves the files to the public buckets and flips the
 * row; the /api/media URL inside the post keeps working, so the HTML is never rewritten.
 * Note the asymmetry: for public rows `sizes` holds absolute URLs, for draft rows it holds paths
 * inside the drafts bucket (there is no public URL to store). publishPostMedia and deletePostMedia
 * rely on that. */

export async function storeDraftImage(file: File, alt: string, uploaderId: string, postId: string) {
  if (file.size > IMAGE_MAX) throw new ApiError('Images must be under 4 MB.');
  const buf = new Uint8Array(await file.arrayBuffer());
  const type = sniff(buf);
  if (!type || type === 'application/pdf') throw new ApiError('That file is not a JPEG, PNG, WebP or GIF image.');
  const meta = await sharp(Buffer.from(buf), { animated: false }).rotate().metadata();
  const width = meta.width || 0,
    height = meta.height || 0;
  if (!width || !height) throw new ApiError('Could not read the image.');
  const k = key('.webp');
  const base = `posts/${postId}/${k.replace('.webp', '')}`;
  const sb = serviceClient();
  const sizes: Record<string, string> = {};
  for (const w of WIDTHS) {
    if (w > width && w !== WIDTHS[0]) continue;
    const out = await sharp(Buffer.from(buf))
      .rotate()
      .resize({ width: Math.min(w, width), withoutEnlargement: true })
      .webp({ quality: 80 })
      .toBuffer();
    const path = `${base}/w${w}.webp`;
    const { error } = await sb.storage.from('drafts').upload(path, out, { contentType: 'image/webp', upsert: true });
    if (error) throw new ApiError(`Upload failed: ${error.message}`, 502);
    sizes[String(w)] = path;
  }
  const row = {
    key: k,
    kind: 'image',
    alt,
    width,
    height,
    bytes: file.size,
    sizes,
    path: `drafts/${base}/w${Math.max(...Object.keys(sizes).map(Number))}.webp`,
    tags: ['post'],
    bucket: 'drafts',
    post_id: postId,
    published: false,
    uploaded_by: uploaderId,
  };
  const { error } = await sb.from('media').insert(row);
  if (error) throw new ApiError(`Could not record the upload: ${error.message}`, 500);
  return {
    key: k,
    url: `/api/media/${k}?w=960`,
    width,
    height,
    alt,
    sizes: Object.fromEntries(Object.keys(sizes).map((w) => [w, `/api/media/${k}?w=${w}`])),
  };
}

export async function storeDraftPdf(file: File, uploaderId: string, postId: string) {
  if (file.size > PDF_MAX) throw new ApiError('PDFs must be under 4 MB.');
  const buf = new Uint8Array(await file.arrayBuffer());
  if (sniff(buf) !== 'application/pdf') throw new ApiError('That file is not a PDF.');
  const k = key('.pdf');
  const path = `posts/${postId}/${k}`;
  const sb = serviceClient();
  const { error } = await sb.storage.from('drafts').upload(path, buf, { contentType: 'application/pdf', upsert: true });
  if (error) throw new ApiError(`Upload failed: ${error.message}`, 502);
  const name = safeName(file.name);
  await sb.from('media').insert({
    key: k,
    kind: 'pdf',
    alt: name,
    bytes: file.size,
    sizes: { file: path },
    path: `drafts/${path}`,
    tags: ['pdf', 'post'],
    bucket: 'drafts',
    post_id: postId,
    published: false,
    uploaded_by: uploaderId,
  });
  return { key: k, url: `/api/media/${k}?w=file`, name, bytes: file.size };
}

/* Moves a post's draft files to the public buckets. Idempotent; safe to call on every publish. A row
 * whose files could not be downloaded stays a draft rather than pointing at nothing. */
export async function publishPostMedia(postId: string) {
  const sb = serviceClient();
  const { data: rows } = await sb.from('media').select('*').eq('post_id', postId).eq('published', false);
  for (const m of rows || []) {
    const sizes: Record<string, string> = {};
    let path = m.path;
    for (const [name, rel] of Object.entries(m.sizes as Record<string, string>)) {
      const { data: blob, error } = await sb.storage.from('drafts').download(rel);
      if (error || !blob) continue;
      const isPdf = m.kind === 'pdf';
      const dest = isPdf ? `pdf/${m.key}` : `uploads/${m.key.replace('.webp', '')}/w${name}.webp`;
      const bucket = isPdf ? 'files' : 'media';
      await sb.storage.from(bucket).upload(dest, Buffer.from(await blob.arrayBuffer()), {
        contentType: isPdf ? 'application/pdf' : 'image/webp',
        upsert: true,
        cacheControl: '31536000',
      });
      sizes[name] = publicUrl(`${bucket}/${dest}`);
      path = `${bucket}/${dest}`;
    }
    if (!Object.keys(sizes).length) continue;
    await sb
      .from('media')
      .update({ sizes, path, bucket: m.kind === 'pdf' ? 'files' : 'media', published: true })
      .eq('key', m.key);
    await sb.storage.from('drafts').remove(Object.values(m.sizes as Record<string, string>));
  }
}

/* Removes every file a post uploaded (draft or published). */
export async function deletePostMedia(postId: string) {
  const sb = serviceClient();
  const { data: rows } = await sb.from('media').select('*').eq('post_id', postId);
  for (const m of rows || []) {
    const paths = Object.values(m.sizes as Record<string, string>)
      .map((v) =>
        v.startsWith('http') ? v.split('/storage/v1/object/public/')[1]?.replace(/^(media|files)\//, '') : v,
      )
      .filter(Boolean) as string[];
    await sb.storage.from(m.bucket === 'drafts' ? 'drafts' : m.kind === 'pdf' ? 'files' : 'media').remove(paths);
  }
  await sb.from('media').delete().eq('post_id', postId);
}
