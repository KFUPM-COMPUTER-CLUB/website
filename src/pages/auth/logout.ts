import type { APIRoute } from 'astro';
import { dbReady } from '../../lib/env';
import { sessionClient } from '../../lib/supabase';

export const prerender = false;
export const POST: APIRoute = async ({ request, cookies, redirect }) => {
  if (dbReady()) await sessionClient(request, cookies).auth.signOut();
  cookies.delete('cc_in', { path: '/' });
  return redirect('/');
};
