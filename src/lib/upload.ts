/* Uploads: real-type checks, size limits, WebP sizes with sharp, Storage upload, media row. */
import sharp from 'sharp';
import { serviceClient, publicUrl } from './supabase';
import { ApiError } from './api';

const IMAGE_MAX = 8 * 1024 * 1024, PDF_MAX = 10 * 1024 * 1024;
const WIDTHS = [480, 960, 1600];
const sniff = (b: Uint8Array) => {
  if (b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff) return 'image/jpeg';
  if (b[0] === 0x89 && b[1] === 0x50 && b[2] === 0x4e && b[3] === 0x47) return 'image/png';
  if (b[0] === 0x47 && b[1] === 0x49 && b[2] === 0x46 && b[3] === 0x38) return 'image/gif';
  if (b[0] === 0x52 && b[1] === 0x49 && b[2] === 0x46 && b[3] === 0x46 && b[8] === 0x57 && b[9] === 0x45 && b[10] === 0x42 && b[11] === 0x50) return 'image/webp';
  if (b[0] === 0x25 && b[1] === 0x50 && b[2] === 0x44 && b[3] === 0x46 && b[4] === 0x2d) return 'application/pdf';
  return null;
};
const key = (ext: string) => `${new Date().toISOString().slice(0, 10)}-${crypto.randomUUID().slice(0, 8)}${ext}`;
const safeName = (n: string) => n.replace(/[^\w.\- ]+/g, '').slice(0, 80) || 'file';

export async function storeImage(file: File, alt: string, uploaderId: string | null, tags: string[] = []) {
  if (file.size > IMAGE_MAX) throw new ApiError('Images must be under 8 MB.');
  const buf = new Uint8Array(await file.arrayBuffer());
  const type = sniff(buf);
  if (!type || type === 'application/pdf') throw new ApiError('That file is not a JPEG, PNG, WebP or GIF image.');
  const image = sharp(Buffer.from(buf), { animated: false }).rotate();
  const meta = await image.metadata();
  const width = meta.width || 0, height = meta.height || 0;
  if (!width || !height) throw new ApiError('Could not read the image.');
  const k = key('.webp'); const base = `uploads/${k.replace('.webp', '')}`;
  const sb = serviceClient(); const sizes: Record<string, string> = {};
  for (const w of WIDTHS) {
    if (w > width && w !== WIDTHS[0]) continue;
    const out = await sharp(Buffer.from(buf)).rotate().resize({ width: Math.min(w, width), withoutEnlargement: true }).webp({ quality: 80 }).toBuffer();
    const path = `${base}/w${w}.webp`;
    const { error } = await sb.storage.from('media').upload(path, out, { contentType: 'image/webp', upsert: true, cacheControl: '31536000' });
    if (error) throw new ApiError(`Upload failed: ${error.message}`, 502);
    sizes[String(w)] = publicUrl(`media/${path}`);
  }
  const original = await sharp(Buffer.from(buf)).rotate().resize({ width: 2400, withoutEnlargement: true }).webp({ quality: 85 }).toBuffer();
  const origPath = `${base}/original.webp`;
  await sb.storage.from('media').upload(origPath, original, { contentType: 'image/webp', upsert: true, cacheControl: '31536000' });
  const row = { key: k, kind: 'image', alt, width, height, bytes: file.size, sizes, path: `media/${origPath}`, tags, uploaded_by: uploaderId };
  const { error } = await sb.from('media').insert(row);
  if (error) throw new ApiError(`Could not record the upload: ${error.message}`, 500);
  return { key: k, url: sizes['960'] || sizes['480'] || publicUrl(`media/${origPath}`), width, height, alt, sizes };
}

export async function storePdf(file: File, uploaderId: string | null) {
  if (file.size > PDF_MAX) throw new ApiError('PDFs must be under 10 MB.');
  const buf = new Uint8Array(await file.arrayBuffer());
  if (sniff(buf) !== 'application/pdf') throw new ApiError('That file is not a PDF.');
  const k = key('.pdf'); const path = `pdf/${k}`;
  const sb = serviceClient();
  const { error } = await sb.storage.from('files').upload(path, buf, { contentType: 'application/pdf', upsert: true, cacheControl: '31536000' });
  if (error) throw new ApiError(`Upload failed: ${error.message}`, 502);
  const url = publicUrl(`files/${path}`);
  const name = safeName(file.name);
  await sb.from('media').insert({ key: k, kind: 'pdf', alt: name, bytes: file.size, sizes: { file: url }, path: `files/${path}`, tags: ['pdf'], uploaded_by: uploaderId });
  return { key: k, url, name, bytes: file.size };
}
