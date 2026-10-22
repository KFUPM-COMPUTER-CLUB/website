import type { APIRoute } from 'astro';
import { handle, requireUser, ApiError, isUuid, wantsHtml, ok, audit } from '../../../../lib/api';
import { serviceClient } from '../../../../lib/supabase';

export const prerender = false;
/* Author sends a draft (or a post with changes requested) to review. */
export const POST: APIRoute = handle(async (ctx) => {
  const user = requireUser(ctx);
  if (!isUuid(ctx.params.id)) throw new ApiError('Not found.', 404);
  const sb = serviceClient();
  const { data: post } = await sb.from('posts').select('*').eq('id', ctx.params.id).maybeSingle();
  if (!post || post.author_id !== user.id) throw new ApiError('Not your post.', 403);
  if (!['draft', 'changes_requested'].includes(post.status)) throw new ApiError('This post is already in review or published.', 409);
  if (!post.title || post.title === 'Untitled' || !post.content_html || post.content_html.length < 40) throw new ApiError('Add a title and some content before submitting.');
  await sb.from('posts').update({ status: 'submitted' }).eq('id', post.id);
  await audit(user.id, 'status', 'posts', post.id, { status: post.status }, { status: 'submitted' });
  return wantsHtml(ctx.request) ? ctx.redirect('/me/posts?ok=Submitted for review. You will get an email when a reviewer answers.', 303) : ok();
});
