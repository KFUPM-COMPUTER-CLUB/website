import { PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY, PUBLIC_GOOGLE_SIGNIN } from 'astro:env/client';
import { SUPABASE_SERVICE_ROLE_KEY, ADMIN_EMAILS, RESEND_API_KEY, EMAIL_FROM, CRON_SECRET, SITE_URL } from 'astro:env/server';

/* Feature switches. Everything degrades cleanly when a key is missing. */
export const supabaseUrl = PUBLIC_SUPABASE_URL || '';
export const supabaseAnon = PUBLIC_SUPABASE_ANON_KEY || '';
export const serviceKey = SUPABASE_SERVICE_ROLE_KEY || '';
export const dbReady = () => !!(supabaseUrl && supabaseAnon);
export const serviceReady = () => dbReady() && !!serviceKey;
export const googleEnabled = () => (PUBLIC_GOOGLE_SIGNIN || '').toLowerCase() === 'true';
export const resendReady = () => !!RESEND_API_KEY;
export const resendKey = RESEND_API_KEY || '';
export const emailFrom = EMAIL_FROM || 'KFUPM Computer Club <onboarding@resend.dev>';
export const cronSecret = CRON_SECRET || '';
export const siteUrl = SITE_URL || 'https://cckfupm-website.vercel.app';
export const adminEmails = () => (ADMIN_EMAILS || '').split(',').map((s) => s.trim().toLowerCase()).filter(Boolean);
