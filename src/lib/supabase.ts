import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { createServerClient, parseCookieHeader } from '@supabase/ssr';
import type { AstroCookies } from 'astro';
import { supabaseUrl, supabaseAnon, serviceKey } from './env';

/* Anonymous client for public reads (RLS applies). Used by the cached public pages. */
let anon: SupabaseClient | null = null;
export const publicClient = () => (anon ??= createClient(supabaseUrl, supabaseAnon, { auth: { persistSession: false, autoRefreshToken: false } }));

/* Service-role client. Server only; never reaches the browser. Bypasses RLS, so every caller checks the role first. */
let service: SupabaseClient | null = null;
export const serviceClient = () => {
  if (!serviceKey) throw new Error('SUPABASE_SERVICE_ROLE_KEY is not set');
  return (service ??= createClient(supabaseUrl, serviceKey, { auth: { persistSession: false, autoRefreshToken: false } }));
};

/* Per-request client bound to the visitor's session cookies (sign-in, /me, /admin, API routes). */
export function sessionClient(request: Request, cookies: AstroCookies) {
  return createServerClient(supabaseUrl, supabaseAnon, {
    cookies: {
      getAll: () => parseCookieHeader(request.headers.get('cookie') ?? '').map((c) => ({ name: c.name, value: c.value ?? '' })),
      setAll: (list) => { for (const { name, value, options } of list) cookies.set(name, value, { ...options, path: '/' }); },
    },
  });
}

export const publicUrl = (path: string) => `${supabaseUrl}/storage/v1/object/public/${path}`;
