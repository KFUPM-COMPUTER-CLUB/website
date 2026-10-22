import type { APIRoute } from 'astro';
import { dbReady, googleEnabled } from '../../lib/env';
import { sessionClient } from '../../lib/supabase';

export const prerender = false;
/* Links a second sign-in provider to the current account (manual linking must be enabled in Supabase Auth). */
export const GET: APIRoute = async ({ url, request, cookies, redirect, locals }) => {
  if (!dbReady() || !locals.user) return redirect('/join');
  const provider = url.searchParams.get('provider') === 'google' ? 'google' : 'github';
  if (provider === 'google' && !googleEnabled()) return redirect('/me/profile?error=Google+sign-in+is+not+switched+on+yet.');
  const supabase = sessionClient(request, cookies);
  const { data, error } = await supabase.auth.linkIdentity({ provider, options: { redirectTo: `${url.origin}/auth/callback?next=${encodeURIComponent('/me/profile?ok=Linked.')}`, skipBrowserRedirect: true } });
  if (error || !data.url) return redirect(`/me/profile?error=${encodeURIComponent(error?.message || 'Could not start linking.')}`);
  return redirect(data.url);
};
