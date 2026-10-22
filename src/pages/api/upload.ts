import type { APIRoute } from 'astro';
import { handle, requireUser, readBody, str, ApiError, guardRate, json } from '../../lib/api';
import { storeImage, storePdf, storeDraftImage, storeDraftPdf } from '../../lib/upload';
import { serviceClient } from '../../lib/supabase';
import { atLeast } from '../../lib/types';
import { isUuid } from '../../lib/api';

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
  const postId = str(b.post_id, 40);
  if (postId) {
    // Editor uploads stay private until the post is published.
    if (!isUuid(postId)) throw new ApiError('Bad post id.');
    const { data: post } = await serviceClient().from('posts').select('author_id').eq('id', postId).maybeSingle();
    if (!post || (post.author_id !== user.id && !atLeast(ctx.locals.role, 'reviewer'))) throw new ApiError('Not your post.', 403);
    if (kind === 'pdf') return json({ ok: true, kind: 'pdf', ...(await storeDraftPdf(file, user.id, postId)) });
    const alt = str(b.alt, 200);
    if (!alt) throw new ApiError('Describe the image (alt text) first.');
    return json({ ok: true, kind: 'image', ...(await storeDraftImage(file, alt, user.id, postId)) });
  }
  if (!atLeast(ctx.locals.role, 'officer') && kind === 'pdf') throw new ApiError('PDFs are uploaded from the post editor.', 403);
  if (kind === 'pdf') return json({ ok: true, kind: 'pdf', ...(await storePdf(file, user.id)) });
  const alt = str(b.alt, 200);
  if (!alt) throw new ApiError('Describe the image (alt text) first.');
  const tags = ctx.locals.role === 'admin' || ctx.locals.role === 'officer' ? ['library'] : ['post'];
  return json({ ok: true, kind: 'image', ...(await storeImage(file, alt, user.id, tags)) });
});
