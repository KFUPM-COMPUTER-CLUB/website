import type { APIRoute } from 'astro';
import { dbReady, googleEnabled } from '../../lib/env';
import { sessionClient } from '../../lib/supabase';
import { safeNext as pickNext } from '../../lib/api';

export const prerender = false;
/* Starts an OAuth sign-in. /auth/login?provider=github&next=/me */
export const GET: APIRoute = async ({ url, request, cookies, redirect }) => {
  if (!dbReady()) return redirect('/join?setup=1');
  const provider = url.searchParams.get('provider') === 'google' ? 'google' : 'github';
  if (provider === 'google' && !googleEnabled()) return redirect('/join?google=off');
  const next = url.searchParams.get('next') || '/me';
  const safeNext = pickNext(next);
  const supabase = sessionClient(request, cookies);
  const { data, error } = await supabase.auth.signInWithOAuth({ provider, options: { redirectTo: `${url.origin}/auth/callback?next=${encodeURIComponent(safeNext)}`, skipBrowserRedirect: true } });
  if (error || !data.url) return redirect('/join?error=start');
  return redirect(data.url);
};
