import type { APIRoute } from 'astro';
import { dbReady } from '../../lib/env';
import { sessionClient } from '../../lib/supabase';

export const prerender = false;
/* Supabase sends the browser back here with a code; the session lands in cookies. */
export const GET: APIRoute = async ({ url, request, cookies, redirect }) => {
  if (!dbReady()) return redirect('/join?setup=1');
  const code = url.searchParams.get('code');
  const next = url.searchParams.get('next') || '/me';
  const safeNext = next.startsWith('/') && !next.startsWith('//') ? next : '/me';
  if (!code) return redirect('/join?error=' + encodeURIComponent(url.searchParams.get('error_description') || 'cancelled'));
  const supabase = sessionClient(request, cookies);
  const { data, error } = await supabase.auth.exchangeCodeForSession(code);
  if (error || !data.user) return redirect('/join?error=exchange');
  cookies.set('cc_in', '1', { path: '/', maxAge: 60 * 60 * 24 * 30, sameSite: 'lax', httpOnly: false, secure: url.protocol === 'https:' });
  const { data: profile } = await supabase.from('profiles').select('onboarded').eq('id', data.user.id).maybeSingle();
  return redirect(profile?.onboarded ? safeNext : `/onboarding?next=${encodeURIComponent(safeNext)}`);
};
