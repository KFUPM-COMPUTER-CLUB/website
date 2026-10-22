import type { APIRoute } from 'astro';
import { handle, requireUser, ApiError, isUuid, wantsHtml, ok, audit, readBody, str } from '../../../../lib/api';
import { sanitizePost, plainText } from '../../../../lib/sanitize';
import { serviceClient } from '../../../../lib/supabase';

export const prerender = false;
/* Author sends a draft (or a post with changes requested) to review, from the editor's submit button
 * or the list on /me/posts. Nobody is emailed: reviewers find it under /admin/posts, which opens on
 * the submitted queue. */
export const POST: APIRoute = handle(async (ctx) => {
  const user = requireUser(ctx);
  if (!isUuid(ctx.params.id)) throw new ApiError('Not found.', 404);
  const sb = serviceClient();
  const { data: post } = await sb.from('posts').select('*').eq('id', ctx.params.id).maybeSingle();
  if (!post || post.author_id !== user.id) throw new ApiError('Not your post.', 403);
  if (!['draft', 'changes_requested'].includes(post.status))
    throw new ApiError('This post is already in review or published.', 409);
  // The editor's form carries its latest content, because the last autosave may still be in flight; save it before judging it.
  const b = await readBody(ctx.request);
  if ('content_html' in b) {
    const patch: Record<string, unknown> = {
      content_html: sanitizePost(String(b.content_html || '')),
      title: str(b.title, 140) || post.title,
      excerpt: str(b.excerpt, 200) || post.excerpt || plainText(String(b.content_html || ''), 180),
      dir: b.dir === 'rtl' ? 'rtl' : 'ltr',
    };
    if (typeof b.content_json === 'string' && b.content_json) {
      try {
        patch.content_json = JSON.parse(b.content_json);
      } catch {
        /* keep the stored one */
      }
    }
    await sb.from('posts').update(patch).eq('id', post.id);
    Object.assign(post, patch);
  }
  if (!post.title || post.title === 'Untitled' || !post.content_html || post.content_html.length < 40)
    throw new ApiError('Add a title and some content before submitting.');
  const { error } = await sb.from('posts').update({ status: 'submitted' }).eq('id', post.id);
  if (error) throw new ApiError(error.message, 500);
  await audit(user.id, 'status', 'posts', post.id, { status: post.status }, { status: 'submitted' });
  return wantsHtml(ctx.request)
    ? ctx.redirect('/me/posts?ok=Submitted for review. You will get an email when a reviewer answers.', 303)
    : ok();
});
