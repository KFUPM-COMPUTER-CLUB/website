import type { APIRoute } from 'astro';
import { handle, readBody, str, ApiError, guardRate, ok } from '../../../lib/api';
import { serviceReady } from '../../../lib/env';
import { serviceClient } from '../../../lib/supabase';

export const prerender = false;
const DIGEST = 'ab5b2416c1919874bbfea712414a31735c66a89b31b471ffe6cc5f0606169e3a';
const sha256 = async (t: string) => Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256', new TextEncoder().encode(t))), (b) => b.toString(16).padStart(2, '0')).join('');

/* A solver adds their name; the flag is verified again here and the entry waits for an admin. */
export const POST: APIRoute = handle(async (ctx) => {
  if (!serviceReady()) throw new ApiError('Not available.', 503);
  await guardRate(ctx.request, 'flag', 5, 600);
  const b = await readBody(ctx.request);
  if ((await sha256(str(b.flag, 80))) !== DIGEST) throw new ApiError('That is not the flag.', 400);
  const name = str(b.name, 40), handle = str(b.handle, 40);
  if (!name) throw new ApiError('A name is required.');
  const { error } = await serviceClient().from('flag_solvers').insert({ name, handle: handle || null, user_id: ctx.locals.user?.id || null, approved: false });
  if (error) throw new ApiError(error.message, 500);
  return ok({ pending: true });
});
