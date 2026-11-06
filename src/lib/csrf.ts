/* Which requests the middleware's cross-site check covers (src/middleware.ts). Kept apart so
 * tests/csrf.test.ts runs it under plain node. Mutations on /api and /auth must come from this site:
 * browsers always send Origin or Sec-Fetch-Site on a cross-site POST, so that replaces CSRF tokens.
 * Two kinds of caller cannot send them and carry their own proof instead:
 *   /api/cron/...              Vercel's cron, with the CRON_SECRET bearer;
 *   /api/digest/unsubscribe    the mail provider's RFC 8058 one-click POST, with the member's signed token. */
const EXEMPT = /^\/api\/(cron\/|digest\/unsubscribe\/?$)/;
export const needsSameOrigin = (path: string, method: string) =>
  (path.startsWith('/api/') || path.startsWith('/auth/')) &&
  method !== 'GET' &&
  method !== 'HEAD' &&
  !EXEMPT.test(path);
