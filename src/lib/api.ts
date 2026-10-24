/* Helpers for the API routes in src/pages/api: responses, auth checks, rate limits, audit log,
 * body parsing and small validators. Every route writes with the service key, which bypasses row
 * level security, so the checks here are the only gate: a handler must call requireUser or
 * requireRole, or verify ownership, before it touches serviceClient(). User tokens exist for reads
 * only (the policies in supabase/migrations/0001_init.sql have no write rules), which keeps all
 * validation and sanitising in one place that cannot be skipped by calling PostgREST directly. */
import type { APIContext } from 'astro';
import { cronSecret, serviceReady } from './env';
import { sameSecret } from './secret';
import { serviceClient } from './supabase';
import { atLeast, type Role } from './types';

export class ApiError extends Error {
  constructor(
    message: string,
    public status = 400,
  ) {
    super(message);
  }
}
export const json = (data: unknown, status = 200, headers: Record<string, string> = {}) =>
  new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store', ...headers },
  });
export const ok = (data: Record<string, unknown> = {}) => json({ ok: true, ...data });

export function requireUser(ctx: APIContext) {
  if (!ctx.locals.user) throw new ApiError('Sign in first.', 401);
  if (!serviceReady()) throw new ApiError('The database is not configured.', 503);
  return ctx.locals.user;
}
export function requireRole(ctx: APIContext, min: Role) {
  const u = requireUser(ctx);
  if (!atLeast(ctx.locals.role, min)) throw new ApiError('You do not have permission to do that.', 403);
  return u;
}
/* The cron routes (/api/cron/*): Vercel sends "Authorization: Bearer <CRON_SECRET>"; when the secret
 * is set, nothing else gets through. */
export const cronAuthorized = (request: Request) =>
  !cronSecret || sameSecret(request.headers.get('authorization') || '', `Bearer ${cronSecret}`);

export const clientIp = (request: Request) =>
  request.headers.get('x-forwarded-for')?.split(',')[0].trim() || request.headers.get('x-real-ip') || 'local';
/* True while under the limit. Keys look like "flag:1.2.3.4". hit_rate_limit is a security-definer
 * function that only the service key may execute, so a visitor cannot read or reset the counters.
 * Fails open (no database, query error) because a public form that stops working is worse than a
 * minute without throttling. */
export async function rateLimit(key: string, limit: number, windowSeconds: number) {
  if (!serviceReady()) return true;
  const { data, error } = await serviceClient().rpc('hit_rate_limit', {
    p_key: key,
    p_limit: limit,
    p_window_seconds: windowSeconds,
  });
  if (error) {
    console.error('rate limit', error.message);
    return true;
  }
  return data !== false;
}
export async function guardRate(request: Request, scope: string, limit: number, windowSeconds = 60) {
  if (!(await rateLimit(`${scope}:${clientIp(request)}`, limit, windowSeconds)))
    throw new ApiError('Too many requests. Try again in a minute.', 429);
}

/* Best effort: a failed audit insert is logged, never thrown, so it cannot fail a write that already happened. */
export async function audit(
  actorId: string | null,
  action: string,
  table: string,
  rowId: string | null,
  before: unknown,
  after: unknown,
) {
  try {
    await serviceClient()
      .from('audit_log')
      .insert({
        actor_id: actorId,
        action,
        table_name: table,
        row_id: rowId,
        before: before ?? null,
        after: after ?? null,
      });
  } catch (e) {
    console.error('audit', e);
  }
}

/* Reads JSON, multipart or urlencoded bodies into one plain object (files kept as File), so a
 * handler serves the fetch() calls and the plain <form> fallback with the same code. Form field
 * names with the array suffix collect into arrays. */
export async function readBody(request: Request): Promise<Record<string, any>> {
  const type = request.headers.get('content-type') || '';
  if (type.includes('application/json')) {
    try {
      return (await request.json()) || {};
    } catch {
      throw new ApiError('Invalid JSON.');
    }
  }
  const form = await request.formData();
  const out: Record<string, any> = {};
  for (const [k, v] of form.entries()) {
    if (k.endsWith('[]')) (out[k.slice(0, -2)] ||= []).push(v);
    else out[k] = v;
  }
  return out;
}
export const wantsHtml = (request: Request) =>
  !(request.headers.get('content-type') || '').includes('application/json') &&
  (request.headers.get('accept') || '').includes('text/html');
/* Only same-site paths: resolved against a dummy origin so tricks like //host or /\\host cannot escape. */
export const safeNext = (v: unknown, fallback = '/me') => {
  if (typeof v !== 'string' || !v.startsWith('/')) return fallback;
  try {
    const u = new URL(v, 'https://x.invalid');
    return u.origin === 'https://x.invalid' ? u.pathname + u.search + u.hash : fallback;
  } catch {
    return fallback;
  }
};

/* Wraps a handler: ApiError becomes a JSON error (or a redirect with ?error= for form posts). */
export const handle = (fn: (ctx: APIContext) => Promise<Response>) => async (ctx: APIContext) => {
  try {
    return await fn(ctx);
  } catch (e: any) {
    const status = e instanceof ApiError ? e.status : 500;
    const message = e instanceof ApiError ? e.message : 'Something went wrong.';
    if (status >= 500) console.error(e);
    if (wantsHtml(ctx.request)) {
      const back = ctx.request.headers.get('referer') || '/';
      const u = new URL(back, ctx.url.origin);
      u.searchParams.set('error', message);
      return ctx.redirect(u.pathname + u.search + u.hash, 303);
    }
    return json({ ok: false, error: message }, status);
  }
};

export const str = (v: unknown, max = 200) => (typeof v === 'string' ? v.trim().slice(0, max) : '');
export const bool = (v: unknown) => v === true || v === 'true' || v === '1' || v === 'on';
export const int = (v: unknown) => {
  const n = typeof v === 'number' ? v : parseInt(String(v ?? ''), 10);
  return Number.isFinite(n) ? n : null;
};
export const isUuid = (v: unknown) =>
  typeof v === 'string' && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(v);
/* Keeps Arabic letters so Arabic titles still get readable slugs. */
export const slugify = (s: string) =>
  s
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9؀-ۿ]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80) || 'post';
export const isSaudiPhone = (v: string) => /^(\+966|0)?5\d{8}$/.test(v.replace(/[\s-]/g, ''));
export const normalizePhone = (v: string) => {
  const d = v.replace(/[\s-]/g, '');
  return d.startsWith('+966') ? d : d.startsWith('0') ? `+966${d.slice(1)}` : `+966${d}`;
};
export const isUrl = (v: string) => /^https?:\/\/[^\s]+$/i.test(v);
