import { defineConfig, envField } from 'astro/config';
import vercel from '@astrojs/vercel';

// Rendered on demand on Vercel. Public pages are cached by ISR for 60 seconds, so an admin's edit
// is live within about a minute without a deploy (API writes also clear the in-memory memo in
// src/lib/content.ts). Routes that depend on the visitor are excluded from ISR; keep that list in
// step with PERSONAL in src/middleware.ts, or a cached page would serve one person's data to all.
export default defineConfig({
  site: process.env.SITE_URL || 'https://cckfupm.vercel.app',
  trailingSlash: 'ignore',
  output: 'server',
  adapter: vercel({
    imageService: false, // Astro's own sharp service; no paid image transforms
    maxDuration: 60, // uploads and the admin import run sharp, which needs more than the default
    isr: {
      expiration: 60,
      exclude: [/^\/me(\/|$)/, /^\/admin(\/|$)/, /^\/api\//, /^\/auth\//, /^\/onboarding(\/|$)/, /^\/join(\/|$)/],
    },
  }),
  redirects: { '/officers': '/community' },
  // All optional on purpose: without keys the site runs from seed data (see src/lib/env.ts).
  // Keep this schema, src/lib/env.ts and .env.example in step.
  env: {
    schema: {
      PUBLIC_SUPABASE_URL: envField.string({ context: 'client', access: 'public', optional: true }),
      PUBLIC_SUPABASE_ANON_KEY: envField.string({ context: 'client', access: 'public', optional: true }),
      PUBLIC_SUPABASE_PUBLISHABLE_KEY: envField.string({ context: 'client', access: 'public', optional: true }),
      PUBLIC_GOOGLE_SIGNIN: envField.string({ context: 'client', access: 'public', optional: true }),
      SUPABASE_SERVICE_ROLE_KEY: envField.string({ context: 'server', access: 'secret', optional: true }),
      SUPABASE_SECRET_KEY: envField.string({ context: 'server', access: 'secret', optional: true }),
      ADMIN_EMAILS: envField.string({ context: 'server', access: 'secret', optional: true }),
      RESEND_API_KEY: envField.string({ context: 'server', access: 'secret', optional: true }),
      EMAIL_FROM: envField.string({ context: 'server', access: 'secret', optional: true }),
      CRON_SECRET: envField.string({ context: 'server', access: 'secret', optional: true }),
      SITE_URL: envField.string({ context: 'server', access: 'secret', optional: true }),
    },
  },
});
