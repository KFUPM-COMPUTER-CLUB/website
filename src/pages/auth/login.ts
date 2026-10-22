import type { APIRoute } from 'astro';
import { dbReady, googleEnabled } from '../../lib/env';
import { sessionClient } from '../../lib/supabase';
import { safeNext as pickNext } from '../../lib/api';

export const prerender = false;
/* First half of sign-in: /auth/login?provider=github|google&next=/me. Asks Supabase Auth for the
 * provider's authorisation URL and redirects the browser there. skipBrowserRedirect because this runs
 * on the server: we need the URL to send a redirect, not a window to open. The PKCE verifier lands in
 * a cookie through sessionClient, and the code comes back to /auth/callback, which must be listed
 * under the Supabase project's allowed redirect URLs (watch for this when adding a domain).
 * "next" is kept to a same-site path by safeNext, so this cannot be used as an open redirect. */
export const GET: APIRoute = async ({ url, request, cookies, redirect }) => {
  if (!dbReady()) return redirect('/join?setup=1');
  const provider = url.searchParams.get('provider') === 'google' ? 'google' : 'github';
  if (provider === 'google' && !googleEnabled()) return redirect('/join?google=off');
  const next = url.searchParams.get('next') || '/me';
  const safeNext = pickNext(next);
  const supabase = sessionClient(request, cookies);
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider,
    options: {
      redirectTo: `${url.origin}/auth/callback?next=${encodeURIComponent(safeNext)}`,
      skipBrowserRedirect: true,
    },
  });
  if (error || !data.url) return redirect('/join?error=start');
  return redirect(data.url);
};
