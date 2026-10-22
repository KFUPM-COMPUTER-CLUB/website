import type { APIRoute } from 'astro';
import { serviceReady } from '../../../lib/env';
import { serviceClient, publicUrl } from '../../../lib/supabase';
import { atLeast } from '../../../lib/types';

export const prerender = false;
/* Stable address for an uploaded file: /api/media/<key>?w=480|960|1600|file. The URL written into a
 * post never has to change: while the post is a draft the file sits in the private "drafts" bucket
 * and this route answers with a signed URL (one hour) for the author and reviewers only; after
 * publishing, the media row points at a public bucket and this route redirects there instead.
 * It redirects rather than proxies, so file bytes never pass through the function and the CDN may
 * cache the public case. Draft answers are private, no-store: a signed URL is personal. */
export const GET: APIRoute = async ({ params, url, locals }) => {
  if (!serviceReady()) return new Response('Not available', { status: 503 });
  const key = (params.key || '').replace(/[^\w.-]/g, '');
  const sb = serviceClient();
  const { data: m } = await sb
    .from('media')
    .select('key,kind,sizes,path,bucket,published,post_id,uploaded_by')
    .eq('key', key)
    .maybeSingle();
  if (!m) return new Response('Not found', { status: 404 });
  const want = url.searchParams.get('w') || (m.kind === 'pdf' ? 'file' : '960');
  const sizes = m.sizes as Record<string, string>;
  const pick = sizes[want] || sizes['960'] || sizes['1600'] || sizes['480'] || sizes.file;
  if (m.published) {
    const target = pick && pick.startsWith('http') ? pick : publicUrl(m.path);
    return new Response(null, {
      status: 302,
      headers: { Location: target, 'Cache-Control': 'public, max-age=300, s-maxage=86400' },
    });
  }
  // Draft: the author or a reviewer.
  let allowed = atLeast(locals.role, 'reviewer') || (!!locals.user && locals.user.id === m.uploaded_by);
  if (!allowed && locals.user && m.post_id) {
    const { data: p } = await sb.from('posts').select('author_id').eq('id', m.post_id).maybeSingle();
    allowed = p?.author_id === locals.user.id;
  }
  if (!allowed) return new Response('Not found', { status: 404 });
  if (!pick) return new Response('Not found', { status: 404 });
  const { data, error } = await sb.storage.from('drafts').createSignedUrl(pick, 3600);
  if (error || !data?.signedUrl) return new Response('Not available', { status: 502 });
  return new Response(null, {
    status: 302,
    headers: { Location: data.signedUrl, 'Cache-Control': 'private, no-store' },
  });
};
