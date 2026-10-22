/* Runs before every request (Astro middleware). It refuses cross-site mutations, loads the
 * visitor's session on personal routes into Astro.locals (user, profile, role) and gates /me,
 * /onboarding and /admin. Reads here use the visitor's own token, so row level security applies;
 * the one write (the admin bootstrap) needs the service key, because user tokens cannot write any
 * table. Watch out: a public route must never look at the session. ISR caches its HTML for a
 * minute and would serve one person's page to everyone. */
import { defineMiddleware } from 'astro:middleware';
import { dbReady, serviceReady, adminEmails } from './lib/env';
import { sessionClient, serviceClient } from './lib/supabase';
import { atLeast, ROLE_RANK, type Profile, type Role } from './lib/types';

/* Routes that depend on who is asking. Everything else is public and cached, so it never
 * looks at the session (a cached page must not contain anyone's data). */
const PERSONAL = /^\/(me|admin|onboarding|auth|api|join)(\/|$)/;
/* A readable (not httpOnly) marker so the client script on cached public pages can show the
 * account menu without a request. It carries no secret: the real session lives in the Supabase
 * cookies. Set on sign-in, cleared as soon as a personal request finds no session. */
const SIGNED_IN_COOKIE = 'cc_in';

export const onRequest = defineMiddleware(async (ctx, next) => {
  ctx.locals.user = null;
  ctx.locals.profile = null;
  ctx.locals.role = 'guest';
  const path = ctx.url.pathname;
  const method = ctx.request.method;

  // Cross-site request forgery: mutations must come from this site. Browsers always send Origin or
  // Sec-Fetch-Site on a cross-site POST, so this replaces CSRF tokens. Cron calls (server to server)
  // carry their own secret instead.
  if (
    (path.startsWith('/api/') || path.startsWith('/auth/')) &&
    method !== 'GET' &&
    method !== 'HEAD' &&
    !path.startsWith('/api/cron/')
  ) {
    const origin = ctx.request.headers.get('origin');
    const site = ctx.request.headers.get('sec-fetch-site');
    if (!(origin === ctx.url.origin || site === 'same-origin')) return new Response('Forbidden', { status: 403 });
  }

  if (dbReady() && PERSONAL.test(path)) {
    const supabase = sessionClient(ctx.request, ctx.cookies);
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (user) {
      ctx.locals.user = { id: user.id, email: user.email ?? null };
      const [{ data: profile }, { data: roleRow }] = await Promise.all([
        supabase.from('profiles').select('*').eq('id', user.id).maybeSingle(),
        supabase.from('user_roles').select('role').eq('user_id', user.id).maybeSingle(),
      ]);
      let role: Role = (roleRow?.role as Role) || 'member';
      // Bootstrap: nobody can grant roles before an admin exists, so the addresses in ADMIN_EMAILS
      // become admins on their first personal request. Service key: user tokens are read-only.
      if (role !== 'admin' && user.email && adminEmails().includes(user.email.toLowerCase()) && serviceReady()) {
        await serviceClient().from('user_roles').upsert({ user_id: user.id, role: 'admin' });
        role = 'admin';
      }
      // A committee grants its members a minimum role (0003_committee_members.sql), so one setting covers
      // a whole team. Own committee is always readable with the member's token; a missing column (migration
      // not run yet) just means no committee.
      let committee: Profile['committee'] = null;
      if (profile?.committee_id) {
        const { data: c } = await supabase
          .from('committees')
          .select('id,name,grants_role')
          .eq('id', profile.committee_id)
          .maybeSingle();
        committee = (c as Profile['committee']) || null;
        if (committee && role !== 'admin' && ROLE_RANK[committee.grants_role] > ROLE_RANK[role])
          role = committee.grants_role;
      }
      ctx.locals.profile = profile ? { ...profile, committee } : null;
      ctx.locals.role = role;
      // /auth stays reachable so a suspended account can still sign out.
      if (profile?.suspended && !path.startsWith('/auth/'))
        return new Response('This account is suspended.', { status: 403 });
      if (!ctx.cookies.get(SIGNED_IN_COOKIE))
        ctx.cookies.set(SIGNED_IN_COOKIE, '1', {
          path: '/',
          maxAge: 60 * 60 * 24 * 30,
          sameSite: 'lax',
          httpOnly: false,
          secure: ctx.url.protocol === 'https:',
        });
    } else if (ctx.cookies.get(SIGNED_IN_COOKIE)) {
      ctx.cookies.delete(SIGNED_IN_COOKIE, { path: '/' });
    }
  }

  const { user, profile, role } = ctx.locals;
  const toSignIn = () => ctx.redirect(`/join?next=${encodeURIComponent(path)}`);
  if (/^\/(me|onboarding)(\/|$)/.test(path)) {
    if (!user) return toSignIn();
    if (!profile?.onboarded && !path.startsWith('/onboarding')) return ctx.redirect('/onboarding');
    if (profile?.onboarded && path.startsWith('/onboarding')) return ctx.redirect('/me');
  }
  if (path.startsWith('/admin')) {
    if (!user) return toSignIn();
    if (!atLeast(role, 'editor')) return new Response('You do not have access to the admin panel.', { status: 403 });
  }
  // These areas write through the API with the service key; without it they would only half work.
  if (/^\/(me|onboarding|admin)(\/|$)/.test(path) && !serviceReady())
    return new Response('The database is not fully configured (service key missing).', { status: 503 });
  return next();
});
