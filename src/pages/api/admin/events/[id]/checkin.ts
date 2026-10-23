import type { APIRoute } from 'astro';
import {
  handle,
  requireRole,
  readBody,
  ApiError,
  str,
  isUuid,
  wantsHtml,
  ok,
  audit,
  safeNext,
} from '../../../../../lib/api';
import { serviceClient } from '../../../../../lib/supabase';
import { fmtRiyadh } from '../../../../../lib/content';

export const prerender = false;
/* Door check-in for one event (officer and up). The scanner on /admin/events/<id>/checkin posts JSON
 * {token}; the page a phone camera opens (/admin/checkin/<token>) and the manual list post a form with
 * token or registration_id. Setting attended is the whole check-in: 0007_checkin.sql stamps
 * attended_at and 0005_points.sql awards the attendance points. A code for another event, or a member
 * already checked in, is refused with a message that says which, so the officer at the door knows
 * what to tell the member. */
export const POST: APIRoute = handle(async (ctx) => {
  const officer = requireRole(ctx, 'officer');
  if (!isUuid(ctx.params.id)) throw new ApiError('Not found.', 404);
  const b = await readBody(ctx.request);
  const token = str(b.token, 64).toLowerCase();
  const rid = str(b.registration_id, 40);
  if (!/^[0-9a-f]{32}$/.test(token) && !isUuid(rid)) throw new ApiError('That is not a check-in code.');
  const sb = serviceClient();
  const query = sb
    .from('registrations')
    .select('id,event_id,attended,attended_at, profiles(name,handle), events(title)')
    .limit(1);
  const { data: reg } = await (token ? query.eq('checkin_token', token) : query.eq('id', rid)).maybeSingle();
  if (!reg) throw new ApiError('No reservation matches this code.', 404);
  const member = (reg as any).profiles?.name || `@${(reg as any).profiles?.handle}`;
  if (reg.event_id !== ctx.params.id)
    throw new ApiError(`${member} has a code for ${(reg as any).events?.title || 'another event'}, not this one.`, 409);
  if (reg.attended) {
    const at = reg.attended_at
      ? ` at ${fmtRiyadh(new Date(reg.attended_at), { hour: 'numeric', minute: '2-digit' })}`
      : '';
    throw new ApiError(`${member} is already checked in${at}.`, 409);
  }
  const { error } = await sb.from('registrations').update({ attended: true }).eq('id', reg.id).eq('attended', false);
  if (error) throw new ApiError(error.message, 500);
  await audit(officer.id, 'update', 'registrations', reg.id, { attended: false }, { attended: true, via: 'check-in' });
  const message = `${member} is checked in.`;
  return wantsHtml(ctx.request)
    ? ctx.redirect(
        `${safeNext(b.next, `/admin/events/${ctx.params.id}/checkin`)}?ok=${encodeURIComponent(message)}`,
        303,
      )
    : ok({ message, name: member, handle: (reg as any).profiles?.handle || null });
});
