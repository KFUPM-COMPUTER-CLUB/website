import type { APIRoute } from 'astro';
import { handle, requireUser, readBody, str, ApiError, guardRate, json } from '../../lib/api';
import { storeImage, storePdf } from '../../lib/upload';

export const prerender = false;
/* Images (WebP sizes) and PDFs from the editor, the profile form and the admin media library. */
export const POST: APIRoute = handle(async (ctx) => {
  const user = requireUser(ctx);
  if (!ctx.locals.profile?.onboarded) throw new ApiError('Finish onboarding first.', 403);
  await guardRate(ctx.request, 'upload', 40, 600);
  const b = await readBody(ctx.request);
  const file = b.file;
  if (!(file instanceof File) || !file.size) throw new ApiError('Choose a file.');
  const kind = str(b.kind, 10) || 'image';
  if (kind === 'pdf') return json({ ok: true, kind: 'pdf', ...(await storePdf(file, user.id)) });
  const alt = str(b.alt, 200);
  if (!alt) throw new ApiError('Describe the image (alt text) first.');
  const tags = ctx.locals.role === 'admin' || ctx.locals.role === 'officer' ? ['library'] : ['post'];
  return json({ ok: true, kind: 'image', ...(await storeImage(file, alt, user.id, tags)) });
});
