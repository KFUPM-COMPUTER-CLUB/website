import { defineConfig, envField } from 'astro/config';
import vercel from '@astrojs/vercel';

// Rendered on demand on Vercel. Public pages are cached by ISR for 60 seconds, so an admin's edit
// is live within about a minute without a deploy. User-specific routes are never cached.
export default defineConfig({
  site: process.env.SITE_URL || 'https://cckfupm-website.vercel.app',
  trailingSlash: 'ignore',
  output: 'server',
  adapter: vercel({
    imageService: false, // Astro's own sharp service; no paid image transforms
    maxDuration: 60,
    isr: {
      expiration: 60,
      exclude: [/^\/me(\/|$)/, /^\/admin(\/|$)/, /^\/api\//, /^\/auth\//, /^\/onboarding(\/|$)/, /^\/join(\/|$)/],
    },
  }),
  redirects: { '/officers': '/community' },
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
