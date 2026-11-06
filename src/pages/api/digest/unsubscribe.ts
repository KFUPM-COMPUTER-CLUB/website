import type { APIRoute } from 'astro';
import { handle, readBody, str, isUuid, ApiError, wantsHtml, ok, guardRate } from '../../../lib/api';
import { serviceReady, serviceKey } from '../../../lib/env';
import { serviceClient } from '../../../lib/supabase';
import { verifyUnsubscribe, ONE_CLICK_BODY } from '../../../lib/digest';
import { dropQueuedDigest } from '../../../lib/email';

export const prerender = false;
/* Turns the weekly digest off from the link in the email, without signing in. The link opens
 * /unsubscribe, whose button posts here: opening the link alone changes nothing, because mail
 * scanners open links. The token is an HMAC of the member's id (src/lib/digest.ts), so a link only
 * works for the member it was sent to. A digest already queued for the member is dropped too.
 * The digest's List-Unsubscribe header points here too, for the one-click button mail apps show.
 * Signed-in members can also untick the box on /me/profile. */
export const POST: APIRoute = handle(async (ctx) => {
  if (!serviceReady()) throw new ApiError('The database is not configured.', 503);
  const b = await readBody(ctx.request);
  // RFC 8058 one-click: the mail provider POSTs "List-Unsubscribe=One-Click" to the link in the digest's
  // List-Unsubscribe header, with u and t in the query and no Origin (middleware.ts lets this route through
  // its cross-site check; the signed token is the guard). Providers post from shared servers, so the per-IP
  // rate limit applies to the page's button only.
  const oneClick = `List-Unsubscribe=${str(b['List-Unsubscribe'], 20)}` === ONE_CLICK_BODY;
  if (!oneClick) await guardRate(ctx.request, 'unsubscribe', 10, 600);
  const q = ctx.url.searchParams;
  const id = str(b.u || q.get('u'), 40);
  const token = str(b.t || q.get('t'), 80);
  if (!isUuid(id) || !(await verifyUnsubscribe(id, token, serviceKey)))
    throw new ApiError('This unsubscribe link is not valid. Sign in and untick the digest on your profile instead.');
  const { data, error } = await serviceClient()
    .from('profiles')
    .update({ digest_opt_in: false })
    .eq('id', id)
    .select('email')
    .maybeSingle();
  if (error) throw new ApiError(error.message, 500);
  await dropQueuedDigest([data?.email]);
  return !oneClick && wantsHtml(ctx.request) ? ctx.redirect('/unsubscribe?done=1', 303) : ok();
});
