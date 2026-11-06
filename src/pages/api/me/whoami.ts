import type { APIRoute } from 'astro';
import { json } from '../../../lib/api';

export const prerender = false;
/* Who is signed in, for the terminal (scripts/terminal.js) on pages that are cached for everyone and so
 * never carry the member's name themselves. /api is a personal route, so the middleware has loaded the
 * session; this only echoes the public-ish parts of it (no email, no phone). 401 without a session. */
export const GET: APIRoute = async ({ locals }) => {
  const p = locals.profile;
  if (!locals.user || !p?.onboarded) return json({ ok: false }, 401);
  return json({
    ok: true,
    handle: p.handle,
    name: p.name,
    firstName: p.first_name || null,
    year: p.year,
    major: p.major,
    role: locals.role,
    committee: p.committee?.name || null,
  });
};
