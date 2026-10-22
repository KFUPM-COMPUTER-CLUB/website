import type { APIRoute } from 'astro';
import { handle, requireRole, readBody, ApiError, str, isUuid, wantsHtml, ok, audit } from '../../../../../lib/api';
import { serviceClient } from '../../../../../lib/supabase';
import { bust } from '../../../../../lib/content';
import { notifyStatus } from '../../../../../lib/notify';
import { publishPostMedia } from '../../../../../lib/upload';

export const prerender = false;
const NEXT = ['submitted', 'changes_requested', 'published', 'unpublished', 'draft'];
/* A reviewer sets a status and leaves a note; the author is emailed. */
export const POST: APIRoute = handle(async (ctx) => {
  const reviewer = requireRole(ctx, 'reviewer');
  if (!isUuid(ctx.params.id)) throw new ApiError('Not found.', 404);
  const b = await readBody(ctx.request);
  const status = str(b.status, 30); const comment = str(b.comment, 1000);
  if (!NEXT.includes(status)) throw new ApiError('Unknown status.');
  const sb = serviceClient();
  const { data: post } = await sb.from('posts').select('*, author:profiles!posts_author_id_fkey(email,name)').eq('id', ctx.params.id).maybeSingle();
  if (!post) throw new ApiError('Not found.', 404);
  const patch: Record<string, unknown> = { status };
  if (status === 'published' && !post.published_at) patch.published_at = new Date().toISOString();
  await sb.from('posts').update(patch).eq('id', post.id);
  if (status === 'published') await publishPostMedia(post.id);
  await sb.from('post_reviews').insert({ post_id: post.id, reviewer_id: reviewer.id, comment, status_set: status });
  await audit(reviewer.id, 'status', 'posts', post.id, { status: post.status }, { status, comment });
  bust();
  if (post.status !== status) await notifyStatus({ title: post.title, slug: post.slug, author_name: post.author?.name || post.author_name }, status.replace('_', ' '), comment, post.author?.email || null);
  return wantsHtml(ctx.request) ? ctx.redirect(`/admin/posts?ok=${encodeURIComponent(`"${post.title}" is now ${status.replace('_', ' ')}.`)}`, 303) : ok();
});
