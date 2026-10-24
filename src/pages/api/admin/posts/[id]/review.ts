import type { APIContext, APIRoute } from 'astro';
import { handle, requireRole, readBody, ApiError, str, isUuid, wantsHtml, ok, audit } from '../../../../../lib/api';
import { serviceClient } from '../../../../../lib/supabase';
import { bust, fmtRiyadh, monthOf } from '../../../../../lib/content';
import { notifyStatus } from '../../../../../lib/notify';
import { publishPostMedia } from '../../../../../lib/upload';

export const prerender = false;
const NEXT = ['submitted', 'changes_requested', 'published', 'unpublished', 'draft'];

/* The featured post of the month (0011_featured_posts.sql), from the card on /admin/posts/<id>: one
 * published post per Riyadh month. Featuring a post takes the feature from the one that held this month,
 * and the message names it. Every change is audited as an update of featured_month, so /admin/audit
 * can undo it. Does not touch the status or mail the author. */
async function feature(ctx: APIContext, reviewerId: string, on: boolean) {
  const sb = serviceClient();
  const { data: post } = await sb
    .from('posts')
    .select('id,title,status,featured_month')
    .eq('id', ctx.params.id!)
    .maybeSingle();
  if (!post) throw new ApiError('Not found.', 404);
  const month = monthOf(new Date());
  const label = fmtRiyadh(new Date(), { month: 'long', year: 'numeric' });
  let message = `"${post.title}" is no longer featured.`;
  if (on) {
    if (post.status !== 'published') throw new ApiError('Only a published post can be featured.');
    const { data: current } = await sb
      .from('posts')
      .select('id,title,featured_month')
      .eq('featured_month', month)
      .neq('id', post.id)
      .maybeSingle();
    if (current) {
      const { error } = await sb.from('posts').update({ featured_month: null }).eq('id', current.id);
      if (error) throw new ApiError(error.message, 500);
      await audit(reviewerId, 'update', 'posts', current.id, { featured_month: month }, { featured_month: null });
    }
    const { error } = await sb.from('posts').update({ featured_month: month }).eq('id', post.id);
    if (error) throw new ApiError(error.message, 500);
    message = current
      ? `"${post.title}" is now the featured post for ${label}, replacing "${current.title}".`
      : `"${post.title}" is now the featured post for ${label}.`;
  } else {
    const { error } = await sb.from('posts').update({ featured_month: null }).eq('id', post.id);
    if (error) throw new ApiError(error.message, 500);
  }
  await audit(
    reviewerId,
    'update',
    'posts',
    post.id,
    { featured_month: post.featured_month ?? null },
    { featured_month: on ? month : null },
  );
  bust();
  return wantsHtml(ctx.request)
    ? ctx.redirect(`/admin/posts/${post.id}?ok=${encodeURIComponent(message)}`, 303)
    : ok({ message });
}
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
  if (b._action === 'feature' || b._action === 'unfeature') return feature(ctx, reviewer.id, b._action === 'feature');
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
