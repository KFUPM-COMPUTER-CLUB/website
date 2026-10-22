import type { APIRoute } from 'astro';
import { dbReady } from '../../lib/env';
import { sessionClient } from '../../lib/supabase';
import { safeNext as pickNext } from '../../lib/api';

export const prerender = false;
/* Second half of sign-in. Supabase Auth sends the browser back here with a one-time code; exchanging
 * it needs the PKCE verifier that /auth/login left in a cookie, and the resulting session tokens are
 * written to cookies by the same client (so login and callback must share one host).
 * cc_in is a separate, script-readable cookie holding only "1": public pages are cached for everyone
 * and cannot know who is viewing, so account.js reads it to swap the Join button. It is a hint, never
 * auth; the middleware re-reads the real session on every personal route and drops cc_in when the
 * session is gone. New accounts go to onboarding first. "next" was validated by safeNext. */
export const GET: APIRoute = async ({ url, request, cookies, redirect }) => {
  if (!dbReady()) return redirect('/join?setup=1');
  const code = url.searchParams.get('code');
  const next = url.searchParams.get('next') || '/me';
  const safeNext = pickNext(next);
  if (!code)
    return redirect('/join?error=' + encodeURIComponent(url.searchParams.get('error_description') || 'cancelled'));
  const supabase = sessionClient(request, cookies);
  const { data, error } = await supabase.auth.exchangeCodeForSession(code);
  if (error || !data.user) return redirect('/join?error=exchange');
  cookies.set('cc_in', '1', {
    path: '/',
    maxAge: 60 * 60 * 24 * 30,
    sameSite: 'lax',
    httpOnly: false,
    secure: url.protocol === 'https:',
  });
  const { data: profile } = await supabase.from('profiles').select('onboarded').eq('id', data.user.id).maybeSingle();
  return redirect(profile?.onboarded ? safeNext : `/onboarding?next=${encodeURIComponent(safeNext)}`);
};
