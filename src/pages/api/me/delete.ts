import type { APIRoute } from 'astro';
import { handle, requireUser, readBody, ApiError } from '../../../lib/api';
import { serviceClient, sessionClient } from '../../../lib/supabase';

export const prerender = false;
/* Deletes the account and everything that cascades from it (profile, posts, registrations). */
export const POST: APIRoute = handle(async (ctx) => {
  const user = requireUser(ctx);
  const b = await readBody(ctx.request);
  if (String(b.confirm || '').trim().toLowerCase() !== 'delete') throw new ApiError('Type "delete" to confirm.');
  const sb = serviceClient();
  await sb.from('audit_log').insert({ actor_id: null, action: 'delete', table_name: 'profiles', row_id: user.id, before: { id: user.id, email: user.email }, after: null });
  const { error } = await sb.auth.admin.deleteUser(user.id);
  if (error) throw new ApiError(`Could not delete the account: ${error.message}`, 500);
  await sessionClient(ctx.request, ctx.cookies).auth.signOut();
  ctx.cookies.delete('cc_in', { path: '/' });
  return ctx.redirect('/?deleted=1', 303);
});
