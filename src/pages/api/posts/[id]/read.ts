import type { APIRoute } from 'astro';
import { isUuid, rateLimit, clientIp } from '../../../../lib/api';
import { serviceReady } from '../../../../lib/env';
import { serviceClient } from '../../../../lib/supabase';

export const prerender = false;
/* Counts one read of a published post (count_post_read() in 0011_featured_posts.sql) for the writers'
 * leaderboard on /blog. The post page sends it once, after the reader has stayed a while
 * (src/scripts/read.js). No sign-in and no cookie; the only trace of the reader is the rate-limit key
 * (post and address), which allows one read per post per address per half hour and is deleted within a
 * day. Always 204, so the page never waits on the count or learns anything from it. */
export const POST: APIRoute = async ({ params, request }) => {
  const id = params.id;
  if (serviceReady() && isUuid(id) && (await rateLimit(`read:${id}:${clientIp(request)}`, 1, 1800))) {
    const { error } = await serviceClient().rpc('count_post_read', { p_post: id });
    if (error) console.error('post read', error.message);
  }
  return new Response(null, { status: 204, headers: { 'Cache-Control': 'no-store' } });
};
