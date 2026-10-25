import type { APIRoute } from 'astro';
import {
  handle,
  requireUser,
  readBody,
  str,
  bool,
  isSaudiPhone,
  normalizePhone,
  isUrl,
  ApiError,
  wantsHtml,
  ok,
  guardRate,
} from '../../../lib/api';
import { serviceClient } from '../../../lib/supabase';
import { storeImage } from '../../../lib/upload';
import { HANDLE_RE } from '../../../lib/types';

export const prerender = false;
/* Edits the signed-in member's own profile (ownership is the session's user id; no role needed).
 * Only fields present in the body change, so a JSON client may PATCH one field; the HTML form on
 * /me/profile sends them all. Checkboxes are the exception: an unticked box is simply absent from a
 * form post, so for HTML requests show_in_contributors and show_on_leaderboard are always taken from the form. */
export const POST: APIRoute = handle(async (ctx) => {
  const user = requireUser(ctx);
  await guardRate(ctx.request, 'profile', 20, 600);
  const b = await readBody(ctx.request);
  const patch: Record<string, unknown> = {};
  if ('name' in b) {
    patch.name = str(b.name, 80);
    if (!patch.name) throw new ApiError('Your name is required.');
  }
  if ('handle' in b) {
    const h = str(b.handle, 24).toLowerCase();
    if (!HANDLE_RE.test(h)) throw new ApiError('Handle: 3 to 24 letters, digits or underscores (john_doe).');
    patch.handle = h;
  }
  if ('phone' in b) {
    const ph = str(b.phone, 20);
    if (!isSaudiPhone(ph)) throw new ApiError('Phone must be a Saudi mobile number.');
    patch.phone = normalizePhone(ph);
  }
  if ('email' in b) {
    const e = str(b.email, 120).toLowerCase();
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(e)) throw new ApiError('That email does not look right.');
    patch.email = e;
  }
  for (const k of ['major', 'year', 'kfupm_email', 'github', 'bio'])
    if (k in b) patch[k] = str(b[k], k === 'bio' ? 400 : 120).replace(/^@/, '') || null;
  if ('linkedin' in b) {
    const l = str(b.linkedin, 200);
    if (l && !isUrl(l)) throw new ApiError('LinkedIn must be a full URL.');
    patch.linkedin = l || null;
  }
  if ('show_in_contributors' in b || wantsHtml(ctx.request)) patch.show_in_contributors = bool(b.show_in_contributors);
  if ('show_on_leaderboard' in b || wantsHtml(ctx.request)) patch.show_on_leaderboard = bool(b.show_on_leaderboard);
  if (b.avatar instanceof File && b.avatar.size > 0)
    patch.avatar_url = (await storeImage(b.avatar, 'Profile photo', user.id, ['avatar'])).sizes['480'];
  const save = () => serviceClient().from('profiles').update(patch).eq('id', user.id).select('*').single();
  let { data, error } = await save();
  // PGRST204: the patch names a column the database does not have yet, because its migration has not
  // been applied (the migrate workflow applies them on merge). Without this, a new checkbox on the form
  // fails every member's save until then. The missing column is dropped, logged, and the rest is saved.
  for (let tries = 0; error?.code === 'PGRST204' && tries < 5; tries++) {
    const column = /'(\w+)' column/.exec(error.message)?.[1];
    if (!column || !(column in patch)) break;
    console.error(`profile save: the ${column} column is missing, saved without it`);
    delete patch[column];
    ({ data, error } = await save());
  }
  if (error) throw new ApiError(error.message.includes('handle') ? 'That handle is taken.' : error.message);
  return wantsHtml(ctx.request) ? ctx.redirect('/me/profile?ok=Saved.', 303) : ok({ profile: data });
});
export const PATCH = POST;
