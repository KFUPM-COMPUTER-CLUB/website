import { PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY, PUBLIC_SUPABASE_PUBLISHABLE_KEY, PUBLIC_GOOGLE_SIGNIN } from 'astro:env/client';
import { SUPABASE_SERVICE_ROLE_KEY, SUPABASE_SECRET_KEY, ADMIN_EMAILS, RESEND_API_KEY, EMAIL_FROM, CRON_SECRET, SITE_URL } from 'astro:env/server';

/* Feature switches. Everything degrades cleanly when a key is missing. */
export const supabaseUrl = PUBLIC_SUPABASE_URL || '';
/* Supabase's newer key names (publishable / secret) work the same as anon / service_role. */
export const supabaseAnon = PUBLIC_SUPABASE_ANON_KEY || PUBLIC_SUPABASE_PUBLISHABLE_KEY || '';
export const serviceKey = SUPABASE_SERVICE_ROLE_KEY || SUPABASE_SECRET_KEY || '';
export const dbReady = () => !!(supabaseUrl && supabaseAnon);
export const serviceReady = () => dbReady() && !!serviceKey;
/* Google sign-in is on unless PUBLIC_GOOGLE_SIGNIN is "false" (the provider is configured in Supabase). */
export const googleEnabled = () => (PUBLIC_GOOGLE_SIGNIN || 'true').toLowerCase() !== 'false';
export const resendReady = () => !!RESEND_API_KEY;
export const resendKey = RESEND_API_KEY || '';
export const emailFrom = EMAIL_FROM || 'KFUPM Computer Club <onboarding@resend.dev>';
export const cronSecret = CRON_SECRET || '';
export const siteUrl = SITE_URL || 'https://cckfupm-website.vercel.app';
export const adminEmails = () => (ADMIN_EMAILS || '').split(',').map((s) => s.trim().toLowerCase()).filter(Boolean);
