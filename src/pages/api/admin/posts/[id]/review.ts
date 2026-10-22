import type { APIRoute } from 'astro';
import { handle, requireRole, readBody, ApiError, str, isUuid, wantsHtml, ok, audit } from '../../../../../lib/api';
import { serviceClient } from '../../../../../lib/supabase';
import { bust } from '../../../../../lib/content';
import { notifyStatus } from '../../../../../lib/notify';
import { publishPostMedia } from '../../../../../lib/upload';

export const prerender = false;
const NEXT = ['submitted', 'changes_requested', 'published', 'unpublished', 'draft'];
/* The review decision, posted from /admin/posts/<id> (reviewer and up). Status flow:
 * draft -> submitted (the author, via /api/posts/<id>/submit) -> published | changes_requested here;
 * a reviewer may also unpublish or hand a post back to draft. published_at is set on the first
 * publish only, so re-publishing after an edit keeps the original date.
 * Publishing is the moment draft files leave the private bucket: publishPostMedia copies them to the
 * public buckets and marks the media rows published, while the /api/media/<key> URLs inside the post
 * stay the same. It is idempotent, so repeated publishes are harmless. Unpublishing does not move
 * files back. Every decision is kept in post_reviews (the history the author sees); the email goes
 * only when the status actually changed, so saving a note alone does not mail the author. */
export const POST: APIRoute = handle(async (ctx) => {
  const reviewer = requireRole(ctx, 'reviewer');
  if (!isUuid(ctx.params.id)) throw new ApiError('Not found.', 404);
  const b = await readBody(ctx.request);
  const status = str(b.status, 30);
  const comment = str(b.comment, 1000);
  if (!NEXT.includes(status)) throw new ApiError('Unknown status.');
  const sb = serviceClient();
  const { data: post } = await sb
    .from('posts')
    .select('*, author:profiles!posts_author_id_fkey(email,name)')
    .eq('id', ctx.params.id)
    .maybeSingle();
  if (!post) throw new ApiError('Not found.', 404);
  const patch: Record<string, unknown> = { status };
  if (status === 'published' && !post.published_at) patch.published_at = new Date().toISOString();
  const { error } = await sb.from('posts').update(patch).eq('id', post.id);
  if (error) throw new ApiError(error.message, 500); // before media moves or the author is told
  if (status === 'published') await publishPostMedia(post.id);
  await sb.from('post_reviews').insert({ post_id: post.id, reviewer_id: reviewer.id, comment, status_set: status });
  await audit(reviewer.id, 'status', 'posts', post.id, { status: post.status }, { status, comment });
  bust();
  if (post.status !== status)
    await notifyStatus(
      { title: post.title, slug: post.slug, author_name: post.author?.name || post.author_name },
      status.replace('_', ' '),
      comment,
      post.author?.email || null,
    );
  return wantsHtml(ctx.request)
    ? ctx.redirect(`/admin/posts?ok=${encodeURIComponent(`"${post.title}" is now ${status.replace('_', ' ')}.`)}`, 303)
    : ok();
});
