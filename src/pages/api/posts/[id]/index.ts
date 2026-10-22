import type { APIRoute } from 'astro';
import {
  handle,
  requireUser,
  readBody,
  str,
  ApiError,
  isUuid,
  guardRate,
  ok,
  audit,
  wantsHtml,
} from '../../../../lib/api';
import { serviceClient } from '../../../../lib/supabase';
import { sanitizePost, plainText } from '../../../../lib/sanitize';
import { atLeast } from '../../../../lib/types';
import { bust } from '../../../../lib/content';
import { deletePostMedia } from '../../../../lib/upload';

export const prerender = false;
const CATEGORIES = ['News', 'Event recap', 'Tutorial', 'Project', 'Experience', 'Opinion', 'Announcement'];

/* One post's edits: PATCH is the editor's autosave (JSON), DELETE removes it, POST is the HTML
 * form's way of doing either (_method=DELETE), because forms cannot send other verbs.
 * Access is ownership or role: the author, or anyone reviewer and up. */
async function load(ctx: any) {
  const user = requireUser(ctx);
  if (!isUuid(ctx.params.id)) throw new ApiError('Not found.', 404);
  const { data: post } = await serviceClient().from('posts').select('*').eq('id', ctx.params.id).maybeSingle();
  if (!post) throw new ApiError('Not found.', 404);
  const own = post.author_id === user.id;
  const reviewer = atLeast(ctx.locals.role, 'reviewer');
  if (!own && !reviewer) throw new ApiError('Not your post.', 403);
  return { user, post, own, reviewer };
}

/* Autosave and edits. Authors may edit drafts and posts with changes requested; reviewers and above may
 * edit anything (that is how a reviewer fixes a typo in a published post). Two copies of the body are
 * stored: content_json is what the editor reloads exactly, content_html is what the public page renders,
 * sanitised here so nothing the browser sent is trusted. Draft saves are not audited (the editor saves
 * every few seconds); edits to a published post are, and they clear the content memo so the public
 * page refreshes within the ISR minute. */
export const PATCH: APIRoute = handle(async (ctx) => {
  const { user, post, own, reviewer } = await load(ctx);
  if (own && !reviewer && !['draft', 'changes_requested'].includes(post.status))
    throw new ApiError('This post is under review or published; ask a reviewer to reopen it.', 409);
  await guardRate(ctx.request, 'post-save', 120, 60);
  const b = await readBody(ctx.request);
  const patch: Record<string, unknown> = {};
  if ('title' in b) patch.title = str(b.title, 140) || 'Untitled';
  if ('excerpt' in b) patch.excerpt = str(b.excerpt, 200);
  if ('category' in b) patch.category = CATEGORIES.includes(String(b.category)) ? b.category : 'News';
  if ('tags' in b)
    patch.tags = (Array.isArray(b.tags) ? b.tags : String(b.tags || '').split(','))
      .map((t: string) => str(t, 30).toLowerCase().replace(/^#/, ''))
      .filter(Boolean)
      .slice(0, 8);
  if ('dir' in b) patch.dir = b.dir === 'rtl' ? 'rtl' : 'ltr';
  if ('content_html' in b) {
    patch.content_html = sanitizePost(String(b.content_html || ''));
    if (!('excerpt' in b) || !patch.excerpt)
      patch.excerpt = post.excerpt || plainText(patch.content_html as string, 180);
  }
  if ('content_json' in b)
    patch.content_json =
      typeof b.content_json === 'string'
        ? (() => {
            try {
              return JSON.parse(b.content_json);
            } catch {
              return null;
            }
          })()
        : b.content_json;
  const { data, error } = await serviceClient()
    .from('posts')
    .update(patch)
    .eq('id', post.id)
    .select('id,title,excerpt,status,updated_at')
    .single();
  if (error) throw new ApiError(error.message, 500);
  if (post.status === 'published') {
    bust();
    await audit(
      user.id,
      'update',
      'posts',
      post.id,
      { title: post.title, content_html: post.content_html },
      { title: data.title },
    );
  }
  return ok({ post: data });
});

/* Authors may delete their own drafts; admins anything. The files uploaded for the post go too. */
export const DELETE: APIRoute = handle(async (ctx) => {
  const { user, post, own } = await load(ctx);
  const admin = atLeast(ctx.locals.role, 'admin');
  if (!(admin || (own && ['draft', 'changes_requested'].includes(post.status))))
    throw new ApiError('Only drafts can be deleted.', 403);
  await deletePostMedia(post.id);
  await serviceClient().from('posts').delete().eq('id', post.id);
  await audit(user.id, 'delete', 'posts', post.id, post, null);
  if (post.status === 'published') bust();
  return wantsHtml(ctx.request) ? ctx.redirect('/me/posts?ok=Post+deleted.', 303) : ok();
});
export const POST: APIRoute = async (ctx) =>
  String(
    (
      await ctx.request
        .clone()
        .formData()
        .catch(() => new FormData())
    ).get('_method') || '',
  ).toUpperCase() === 'DELETE'
    ? DELETE(ctx)
    : PATCH(ctx);
