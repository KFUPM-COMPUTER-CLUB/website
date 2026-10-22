/* The three Supabase clients, one per trust level. Use the least powerful one that works:
 * publicClient for anything a visitor may see, sessionClient when the answer depends on who is
 * signed in, serviceClient only inside API routes after a role or ownership check. */
import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { createServerClient, parseCookieHeader } from '@supabase/ssr';
import type { AstroCookies } from 'astro';
import { supabaseUrl, supabaseAnon, serviceKey } from './env';

/* Anonymous client for public reads (RLS applies). Used by the cached public pages, which must not
 * depend on a visitor, so it deliberately carries no session. */
let anon: SupabaseClient | null = null;
export const publicClient = () =>
  (anon ??= createClient(supabaseUrl, supabaseAnon, { auth: { persistSession: false, autoRefreshToken: false } }));

/* Service-role client. Server only (env.ts reads the key from astro:env/server, which never reaches
 * the browser). Bypasses RLS, so every caller checks the role or ownership first. */
let service: SupabaseClient | null = null;
export const serviceClient = () => {
  if (!serviceKey) throw new Error('SUPABASE_SERVICE_ROLE_KEY is not set');
  return (service ??= createClient(supabaseUrl, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  }));
};

/* Per-request client bound to the visitor's cookies, so auth.uid() is set in the database and the
 * read policies see the member (sign-in, /me, /admin, API routes). @supabase/ssr keeps the PKCE
 * verifier and refreshed tokens in cookies; setAll writes them back on the response, which is why
 * this needs the AstroCookies object and cannot be a shared singleton. */
export function sessionClient(request: Request, cookies: AstroCookies) {
  return createServerClient(supabaseUrl, supabaseAnon, {
    cookies: {
      getAll: () =>
        parseCookieHeader(request.headers.get('cookie') ?? '').map((c) => ({ name: c.name, value: c.value ?? '' })),
      setAll: (list) => {
        for (const { name, value, options } of list) cookies.set(name, value, { ...options, path: '/' });
      },
    },
  });
}

/* Address of a file in a public bucket (media, files). Draft files have no public URL. */
export const publicUrl = (path: string) => `${supabaseUrl}/storage/v1/object/public/${path}`;
