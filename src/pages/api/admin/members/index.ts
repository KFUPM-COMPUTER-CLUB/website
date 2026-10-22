import type { APIRoute } from 'astro';
import { handle, requireRole, readBody, ApiError, str, isUuid, wantsHtml, ok, audit } from '../../../../lib/api';
import { serviceClient } from '../../../../lib/supabase';
import { bust } from '../../../../lib/content';

export const prerender = false;
const ROLES = ['member', 'editor', 'reviewer', 'officer', 'admin'];
const csv = (rows: Record<string, unknown>[]) => {
  const cols = Object.keys(rows[0] || { id: '' });
  // A cell starting with = + - @ runs as a formula in Excel, so it gets a leading apostrophe.
  const esc = (v: unknown) => {
    const s = String(v ?? '');
    return `"${(/^[=+\-@\t\r]/.test(s) ? `'${s}` : s).replace(/"/g, '""')}"`;
  };
  return [cols.join(','), ...rows.map((r) => cols.map((c) => esc(r[c])).join(','))].join('\r\n');
};

/* Member administration for /admin/members, admin only because it handles email and phone.
 * GET is the CSV export; no-store keeps personal data out of any cache. */
export const GET: APIRoute = handle(async (ctx) => {
  requireRole(ctx, 'admin');
  const { data } = await serviceClient()
    .from('profiles')
    .select(
      'handle,name,email,phone,major,year,kfupm_email,github,linkedin,onboarded,suspended,created_at, user_roles(role)',
    )
    .order('created_at');
  const rows = (data || []).map((p: any) => ({
    handle: p.handle,
    name: p.name,
    email: p.email,
    phone: p.phone,
    major: p.major,
    year: p.year,
    kfupm_email: p.kfupm_email,
    github: p.github,
    linkedin: p.linkedin,
    role: p.user_roles?.role || 'member',
    onboarded: p.onboarded,
    suspended: p.suspended,
    joined: String(p.created_at).slice(0, 10),
  }));
  return new Response(csv(rows), {
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="members-${new Date().toISOString().slice(0, 10)}.csv"`,
      'Cache-Control': 'no-store',
    },
  });
});

/* _action = role | committee | suspend | delete. An admin cannot suspend, delete or demote themselves, so the
 * club can never lock itself out; the first admins come from ADMIN_EMAILS anyway (see middleware).
 * Delete goes through Supabase Auth: removing the auth user cascades to the profile and from there
 * to roles and registrations. The audit entry is written first because the profile is gone after. */
export const POST: APIRoute = handle(async (ctx) => {
  const admin = requireRole(ctx, 'admin');
  const b = await readBody(ctx.request);
  const id = str(b.user_id, 40);
  if (!isUuid(id)) throw new ApiError('Not found.', 404);
  if (id === admin.id && (b._action === 'delete' || b._action === 'suspend'))
    throw new ApiError('You cannot do that to your own account.');
  const sb = serviceClient();
  const { data: p } = await sb.from('profiles').select('*').eq('id', id).maybeSingle();
  if (!p) throw new ApiError('Not found.', 404);
  const back = `/admin/members?q=${encodeURIComponent(str(b.q, 60))}`;
  const done = (m: string) => {
    bust();
    return wantsHtml(ctx.request) ? ctx.redirect(`${back}&ok=${encodeURIComponent(m)}`, 303) : ok();
  };
  switch (b._action) {
    case 'role': {
      const role = str(b.role, 20);
      if (!ROLES.includes(role)) throw new ApiError('Unknown role.');
      if (id === admin.id && role !== 'admin') throw new ApiError('You cannot remove your own admin role.');
      const { data: old } = await sb.from('user_roles').select('role').eq('user_id', id).maybeSingle();
      await sb.from('user_roles').upsert({ user_id: id, role, granted_by: admin.id });
      await audit(admin.id, 'role', 'user_roles', id, { role: old?.role || 'member' }, { role });
      return done(`${p.name || p.email} is now ${role}.`);
    }
    case 'committee': {
      // Membership is a profile field; the access it gives comes from the committee's grants_role.
      const cid = str(b.committee_id, 40);
      if (cid && !isUuid(cid)) throw new ApiError('Unknown committee.');
      const { data: c } = cid
        ? await sb.from('committees').select('id,name').eq('id', cid).maybeSingle()
        : { data: null };
      if (cid && !c) throw new ApiError('Unknown committee.');
      await sb
        .from('profiles')
        .update({ committee_id: cid || null })
        .eq('id', id);
      await audit(
        admin.id,
        'update',
        'profiles',
        id,
        { committee_id: p.committee_id || null },
        { committee_id: cid || null },
      );
      return done(c ? `${p.name || p.email} is in ${c.name}.` : `${p.name || p.email} is in no committee.`);
    }
    case 'suspend': {
      await sb.from('profiles').update({ suspended: !p.suspended }).eq('id', id);
      await audit(admin.id, 'update', 'profiles', id, { suspended: p.suspended }, { suspended: !p.suspended });
      return done(p.suspended ? 'Account reinstated.' : 'Account suspended.');
    }
    case 'delete': {
      await audit(admin.id, 'delete', 'profiles', id, { id, name: p.name, email: p.email }, null);
      const { error } = await sb.auth.admin.deleteUser(id);
      if (error) throw new ApiError(error.message, 500);
      return done('Account deleted.');
    }
    default:
      throw new ApiError('Unknown action.');
  }
});
