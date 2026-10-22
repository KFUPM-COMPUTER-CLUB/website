import type { APIRoute } from 'astro';
import { handle, requireUser, readBody, ApiError } from '../../../lib/api';
import { serviceClient, sessionClient } from '../../../lib/supabase';

export const prerender = false;
/* Self-service account deletion from /me/profile. Removing the auth user cascades to the profile,
 * roles and registrations; posts keep their text with author_id cleared (author_name stays).
 * The audit entry is written first, with no actor, because the actor is about to disappear. Supabase
 * clears its own cookies on signOut; cc_in is ours, so it is cleared by hand. */
export const POST: APIRoute = handle(async (ctx) => {
  const user = requireUser(ctx);
  const b = await readBody(ctx.request);
  if (
    String(b.confirm || '')
      .trim()
      .toLowerCase() !== 'delete'
  )
    throw new ApiError('Type "delete" to confirm.');
  const sb = serviceClient();
  await sb.from('audit_log').insert({
    actor_id: null,
    action: 'delete',
    table_name: 'profiles',
    row_id: user.id,
    before: { id: user.id, email: user.email },
    after: null,
  });
  const { error } = await sb.auth.admin.deleteUser(user.id);
  if (error) throw new ApiError(`Could not delete the account: ${error.message}`, 500);
  await sessionClient(ctx.request, ctx.cookies).auth.signOut();
  ctx.cookies.delete('cc_in', { path: '/' });
  return ctx.redirect('/?deleted=1', 303);
});
