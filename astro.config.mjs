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
  // sanitize-html is CommonJS but requires htmlparser2, which is ESM-only since v10. Left external, the
  // function crashes at runtime with ERR_REQUIRE_ESM (blog submit and review). Bundling them lets Vite
  // turn the require() into an import. Its whole dependency tree is listed, because a bundled package
  // cannot find an unbundled dependency at runtime ("Cannot find module 'escape-string-regexp'").
  vite: {
    ssr: {
      noExternal: [
        'sanitize-html',
        'htmlparser2',
        'domhandler',
        'domutils',
        'dom-serializer',
        'domelementtype',
        'entities',
        'escape-string-regexp',
        'is-plain-object',
        'launder',
        'dayjs',
        'parse-srcset',
        'postcss',
        'nanoid',
        'picocolors',
        'source-map-js',
      ],
    },
  },
  redirects: { '/officers': '/community' },

  // English stays at /xxx, Arabic lives at /ar/xxx
  // any /ar/...page that doesn't exist yet quietly shows the English page.
  i18n: {
    defaultLocale: 'en',
    locales: ['en', 'ar'],
    routing: { prefixDefaultLocale: false, fallbackType: 'rewrite' },
    fallback: { ar: 'en' },
  },

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
