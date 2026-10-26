/* Every environment variable the site reads, in one place; nothing else imports astro:env. All of
 * them are optional on purpose: the readiness switches below let each module degrade (seed data
 * instead of the database, a 503 instead of a crash on writes, email that waits in the queue).
 * PUBLIC_ variables are inlined into the browser bundle, so only the URL and the anon key may
 * carry that prefix. A new variable goes in the schema in astro.config.mjs and in .env.example. */
import {
  PUBLIC_SUPABASE_URL,
  PUBLIC_SUPABASE_ANON_KEY,
  PUBLIC_SUPABASE_PUBLISHABLE_KEY,
  PUBLIC_GOOGLE_SIGNIN,
} from 'astro:env/client';
import {
  SUPABASE_SERVICE_ROLE_KEY,
  SUPABASE_SECRET_KEY,
  ADMIN_EMAILS,
  RESEND_API_KEY,
  EMAIL_FROM,
  CRON_SECRET,
  SITE_URL,
} from 'astro:env/server';
import { cronSecretRequired } from './secret';

export const supabaseUrl = PUBLIC_SUPABASE_URL || '';
/* Supabase's newer key names (publishable / secret) work the same as anon / service_role. */
export const supabaseAnon = PUBLIC_SUPABASE_ANON_KEY || PUBLIC_SUPABASE_PUBLISHABLE_KEY || '';
export const serviceKey = SUPABASE_SERVICE_ROLE_KEY || SUPABASE_SECRET_KEY || '';
/* dbReady: pages can read from Postgres. serviceReady: API routes can write and use the service-only tables. */
export const dbReady = () => !!(supabaseUrl && supabaseAnon);
export const serviceReady = () => dbReady() && !!serviceKey;
/* Google sign-in is on unless PUBLIC_GOOGLE_SIGNIN is "false" (the provider is configured in Supabase). */
export const googleEnabled = () => (PUBLIC_GOOGLE_SIGNIN || 'true').toLowerCase() !== 'false';
export const resendReady = () => !!RESEND_API_KEY;
export const resendKey = RESEND_API_KEY || '';
export const emailFrom = EMAIL_FROM || 'KFUPM Computer Club <onboarding@resend.dev>';
export const cronSecret = CRON_SECRET || '';
/* A production build without VERCEL_ENV must not leave the cron routes open. */
export const isCronSecretRequired = () => cronSecretRequired(process.env.VERCEL_ENV, import.meta.env.PROD);
/* For emails and calendar links, where there is no request to read the origin from. */
export const siteUrl = SITE_URL || 'https://cckfupm.vercel.app';
export const adminEmails = () =>
  (ADMIN_EMAILS || '')
    .split(',')
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean);
