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
  safeNext,
  guardRate,
  wantsHtml,
  ok,
} from '../../../lib/api';
import { serviceClient } from '../../../lib/supabase';
import { storeImage } from '../../../lib/upload';
import { HANDLE_RE } from '../../../lib/types';
import { notifyWelcome } from '../../../lib/notify';
import { nameColumns, readNameParts, splitName } from '../../../lib/names';

export const prerender = false;
/* Completes a membership from /onboarding: validates the form, fills the profile row the sign-up
 * trigger created, and queues the welcome email with the group links. The middleware sends every
 * signed-in but not yet onboarded account to that page, and the API routes that matter (posts,
 * uploads, reservations) refuse until onboarded is true.
 * Handles are lowercase and unique because they are URLs (/u/<handle>) and the lookup lowercases
 * the path; the pre-check gives a friendly message, the unique index on profiles.handle is what
 * actually guarantees it (hence the duplicate mapping on the upsert error).
 * The phone must be a Saudi mobile (05... or +9665...) and is stored as +966..., so exports and
 * officer call lists share one format. Email is asked separately from the sign-in email because
 * GitHub accounts often hide theirs. */
export const POST: APIRoute = handle(async (ctx) => {
  const user = requireUser(ctx);
  await guardRate(ctx.request, 'onboard', 10, 600);
  const b = await readBody(ctx.request);
  // The form sends the name in parts; a JSON client may still send one full name, which is split.
  let names: ReturnType<typeof nameColumns>;
  try {
    names = nameColumns('first_name' in b ? readNameParts(b) : splitName(str(b.name, 80)), 'first_name' in b);
  } catch (e) {
    throw new ApiError((e as Error).message);
  }
  const name = names.name,
    handle = str(b.handle, 24).toLowerCase(),
    email = str(b.email, 120).toLowerCase(),
    phone = str(b.phone, 20),
    major = str(b.major, 80),
    year = str(b.year, 30);
  if (!HANDLE_RE.test(handle)) throw new ApiError('Handle: 3 to 24 letters, digits or underscores (john_doe).');
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) throw new ApiError('That email does not look right.');
  if (!isSaudiPhone(phone)) throw new ApiError('Phone must be a Saudi mobile number (05xxxxxxxx).');
  if (!major || !year) throw new ApiError('Major and year are required.');
  const linkedin = str(b.linkedin, 200);
  if (linkedin && !isUrl(linkedin)) throw new ApiError('LinkedIn must be a full URL.');
  const sb = serviceClient();
  // The welcome email (with the group links) goes out once, on the first onboarding only.
  const firstTime = !ctx.locals.profile?.onboarded;
  const { data: taken } = await sb.from('profiles').select('id').eq('handle', handle).neq('id', user.id).maybeSingle();
  if (taken) throw new ApiError('That handle is taken. Pick another.');
  let avatar_url: string | undefined;
  if (b.avatar instanceof File && b.avatar.size > 0)
    avatar_url = (await storeImage(b.avatar, `${name}'s photo`, user.id, ['avatar'])).sizes['480'];
  const row: Record<string, unknown> = {
    id: user.id,
    ...names,
    handle,
    email,
    phone: normalizePhone(phone),
    major,
    year,
    kfupm_email: str(b.kfupm_email, 120) || null,
    github: str(b.github, 60).replace(/^@/, '') || null,
    linkedin: linkedin || null,
    bio: str(b.bio, 400) || null,
    show_in_contributors: bool(b.show_in_contributors),
    onboarded: true,
    ...(avatar_url ? { avatar_url } : {}),
  };
  let { data: profile, error } = await sb.from('profiles').upsert(row).select('*').single();
  // PGRST204: the name-part columns are not in the database yet (0018_name_parts.sql runs on merge, and a
  // deploy can be live first). The full name is enough to finish onboarding, so save without the parts.
  if (error?.code === 'PGRST204') {
    delete row.first_name;
    delete row.middle_name;
    delete row.last_name;
    ({ data: profile, error } = await sb.from('profiles').upsert(row).select('*').single());
  }
  if (error)
    throw new ApiError(error.message.includes('handle') ? 'That handle is taken. Pick another.' : error.message);
  if (firstTime) await notifyWelcome(profile);
  const next = safeNext(b.next, '/me');
  return wantsHtml(ctx.request)
    ? ctx.redirect(`${next}${next.includes('?') ? '&' : '?'}welcome=1`, 303)
    : ok({ profile });
});
