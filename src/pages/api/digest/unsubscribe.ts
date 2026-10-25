import type { APIRoute } from 'astro';
import { handle, readBody, str, isUuid, ApiError, wantsHtml, ok, guardRate } from '../../../lib/api';
import { serviceReady, serviceKey } from '../../../lib/env';
import { serviceClient } from '../../../lib/supabase';
import { verifyUnsubscribe } from '../../../lib/digest';
import { dropQueuedDigest } from '../../../lib/email';

export const prerender = false;
/* Turns the weekly digest off from the link in the email, without signing in. The link opens
 * /unsubscribe, whose button posts here: opening the link alone changes nothing, because mail
 * scanners open links. The token is an HMAC of the member's id (src/lib/digest.ts), so a link only
 * works for the member it was sent to. A digest already queued for the member is dropped too.
 * Signed-in members can also untick the box on /me/profile. */
export const POST: APIRoute = handle(async (ctx) => {
  if (!serviceReady()) throw new ApiError('The database is not configured.', 503);
  await guardRate(ctx.request, 'unsubscribe', 10, 600);
  const b = await readBody(ctx.request);
  const id = str(b.u, 40);
  if (!isUuid(id) || !(await verifyUnsubscribe(id, str(b.t, 80), serviceKey)))
    throw new ApiError('This unsubscribe link is not valid. Sign in and untick the digest on your profile instead.');
  const { data, error } = await serviceClient()
    .from('profiles')
    .update({ digest_opt_in: false })
    .eq('id', id)
    .select('email')
    .maybeSingle();
  if (error) throw new ApiError(error.message, 500);
  await dropQueuedDigest([data?.email]);
  return wantsHtml(ctx.request) ? ctx.redirect('/unsubscribe?done=1', 303) : ok();
});
