import type { APIRoute } from 'astro';
import { handle, requireRole, readBody, ApiError, str, isUuid, wantsHtml, ok, audit } from '../../../lib/api';
import { serviceClient } from '../../../lib/supabase';
import { OFFICER_BADGES, badgeName } from '../../../lib/badges';

export const prerender = false;
/* Officer badges from /admin/badges (0014_badges.sql): _action award (the default) or remove. Only the
 * officer-awarded badges (Hackathon winner, Top writer of the semester) are written here; the automatic
 * ones belong to the triggers, which would put them back, so they cannot be removed by hand. A member is
 * named by handle; the reference says what the badge is for. Every change is audited with the whole row,
 * so /admin/audit can undo it. */
export const POST: APIRoute = handle(async (ctx) => {
  const officer = requireRole(ctx, 'officer');
  const b = await readBody(ctx.request);
  const sb = serviceClient();
  const done = (message: string) =>
    wantsHtml(ctx.request) ? ctx.redirect(`/admin/badges?ok=${encodeURIComponent(message)}`, 303) : ok();

  if (b._action === 'remove') {
    const id = str(b.id, 40);
    if (!isUuid(id)) throw new ApiError('Not found.', 404);
    const { data: row } = await sb.from('member_badges').select('*').eq('id', id).maybeSingle();
    if (!row) throw new ApiError('Not found.', 404);
    if (row.auto) throw new ApiError("Automatic badges follow the member's activity and cannot be removed here.");
    const { error } = await sb.from('member_badges').delete().eq('id', id);
    if (error) throw new ApiError(error.message, 500);
    await audit(officer.id, 'delete', 'member_badges', id, row, null);
    return done('Badge removed.');
  }

  const badge = str(b.badge, 40);
  if (!(OFFICER_BADGES as string[]).includes(badge)) throw new ApiError('Pick a badge that officers award.');
  const handleText = str(b.member, 40).replace(/^@/, '').toLowerCase();
  const { data: member } = handleText
    ? await sb.from('profiles').select('id,name').eq('handle', handleText).eq('onboarded', true).maybeSingle()
    : { data: null };
  if (!member) throw new ApiError(handleText ? `No member has the handle @${handleText}.` : 'Name a member by handle.');
  const reference = str(b.reference, 120);
  if (!reference) throw new ApiError('Say what it is for, like "Techathon 2026" or "Fall 2026".');
  const day = str(b.date, 10);
  if (day && !/^\d{4}-\d{2}-\d{2}$/.test(day)) throw new ApiError('Date must be a day (YYYY-MM-DD).');
  // A bare day means that day in Riyadh; noon keeps it on the same date in any time zone nearby.
  const at = day ? new Date(`${day}T12:00:00+03:00`) : new Date();
  // An impossible day is either no date at all (2026-13-01) or rolls over into the next month (2026-02-30).
  if (Number.isNaN(at.getTime()) || (day && at.toISOString().slice(0, 10) !== day))
    throw new ApiError('Pick a valid date.');
  const awarded_at = at.toISOString();
  const { data, error } = await sb
    .from('member_badges')
    .insert({ user_id: member.id, badge, reference, awarded_at, auto: false, awarded_by: officer.id })
    .select('*')
    .single();
  if (error) throw new ApiError(error.message, 500);
  await audit(officer.id, 'insert', 'member_badges', data.id, null, data);
  return done(`${badgeName(badge)} awarded to ${member.name}.`);
});
