import type { APIRoute } from 'astro';
import { handle, requireRole, readBody, ApiError, str, isUuid, wantsHtml, ok, audit } from '../../../../../lib/api';
import { serviceClient } from '../../../../../lib/supabase';
import { atLeast } from '../../../../../lib/types';

export const prerender = false;
// A cell starting with = + - @ runs as a formula in Excel, so it gets a leading apostrophe.
const esc = (v: unknown) => `"${String(v ?? '').replace(/^[=+\-@\t\r]/, "'$&").replace(/"/g, '""')}"`;
/* Officer tools for one event's reservations, used by /admin/events/<id>/registrations.
 * GET is the CSV export. Officers get names only; email and phone are admin columns, the same split
 * as the page itself, because contact details are what members were promised stays with admins.
 * no-store: the file is personal data and must never sit in a shared cache. */
export const GET: APIRoute = handle(async (ctx) => {
  requireRole(ctx, 'officer');
  if (!isUuid(ctx.params.id)) throw new ApiError('Not found.', 404);
  const admin = atLeast(ctx.locals.role, 'admin');
  const { data } = await serviceClient()
    .from('registrations')
    .select('email_copy,attended,created_at, profiles(name,handle,email,phone,major)')
    .eq('event_id', ctx.params.id)
    .order('created_at');
  const cols = admin
    ? ['name', 'handle', 'email', 'phone', 'major', 'attended', 'email_copy', 'registered']
    : ['name', 'handle', 'major', 'attended', 'registered'];
  const rows = (data || []).map((r: any) => ({
    name: r.profiles?.name,
    handle: r.profiles?.handle,
    email: r.profiles?.email,
    phone: r.profiles?.phone,
    major: r.profiles?.major,
    attended: r.attended,
    email_copy: r.email_copy,
    registered: String(r.created_at).slice(0, 16),
  }));
  const body = [cols.join(','), ...rows.map((r: any) => cols.map((c) => esc(r[c])).join(','))].join('\r\n');
  return new Response(body, {
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="registrations-${ctx.params.id}.csv"`,
      'Cache-Control': 'no-store',
    },
  });
});
/* POST toggles attendance (the default) or removes a reservation (_action=remove). Attendance is
 * what the "Attended events" badge on a public profile is built from, so mark it after the event. */
export const POST: APIRoute = handle(async (ctx) => {
  const officer = requireRole(ctx, 'officer');
  if (!isUuid(ctx.params.id)) throw new ApiError('Not found.', 404);
  const b = await readBody(ctx.request);
  const rid = str(b.registration_id, 40);
  if (!isUuid(rid)) throw new ApiError('Not found.', 404);
  const sb = serviceClient();
  const { data: reg } = await sb
    .from('registrations')
    .select('*')
    .eq('id', rid)
    .eq('event_id', ctx.params.id)
    .maybeSingle();
  if (!reg) throw new ApiError('Not found.', 404);
  if (b._action === 'remove') {
    await sb.from('registrations').delete().eq('id', rid);
    await audit(officer.id, 'delete', 'registrations', rid, reg, null);
  } else {
    await sb.from('registrations').update({ attended: !reg.attended }).eq('id', rid);
    await audit(officer.id, 'update', 'registrations', rid, { attended: reg.attended }, { attended: !reg.attended });
  }
  return wantsHtml(ctx.request) ? ctx.redirect(`/admin/events/${ctx.params.id}/registrations?ok=Updated.`, 303) : ok();
});
