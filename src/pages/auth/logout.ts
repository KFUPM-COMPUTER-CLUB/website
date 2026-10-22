import type { APIRoute } from 'astro';
import { dbReady } from '../../lib/env';
import { sessionClient } from '../../lib/supabase';

export const prerender = false;
/* Signs out. POST only, so a cross-site link cannot log someone out (the middleware's origin check
 * covers /auth posts). signOut clears Supabase's cookies; cc_in is ours and cleared by hand. */
export const POST: APIRoute = async ({ request, cookies, redirect }) => {
  if (dbReady()) await sessionClient(request, cookies).auth.signOut();
  cookies.delete('cc_in', { path: '/' });
  return redirect('/');
};
