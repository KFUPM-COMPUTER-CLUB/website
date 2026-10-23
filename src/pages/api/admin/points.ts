import type { APIRoute } from 'astro';
import { handle, requireRole, readBody, ApiError, str, int, isUuid, wantsHtml, ok, audit } from '../../../lib/api';
import { serviceClient } from '../../../lib/supabase';
import { bust } from '../../../lib/content';
import { POINT_CATEGORIES, type PointCategory } from '../../../lib/types';

export const prerender = false;
/* Manual points, posted from /admin/points (officer and up). The default action awards: the member is
 * named by handle, the amount may be negative to take points back, and a reason is required because
 * it is what the member and the audit log see. _action=remove deletes one manual award.
 * Automatic awards (attendance, published posts, the flag) are written by the triggers in
 * 0005_points.sql and follow their source rows, so they cannot be removed here: untick the
 * attendance, unpublish the post or unapprove the solver instead, and the points follow. */
export const POST: APIRoute = handle(async (ctx) => {
  const officer = requireRole(ctx, 'officer');
  const b = await readBody(ctx.request);
  const sb = serviceClient();
  const back = (msg: string) =>
    wantsHtml(ctx.request) ? ctx.redirect(`/admin/points?ok=${encodeURIComponent(msg)}`, 303) : ok({ message: msg });

  if (b._action === 'remove') {
    const id = str(b.id, 40);
    if (!isUuid(id)) throw new ApiError('Not found.', 404);
    const { data: row } = await sb.from('points').select('*').eq('id', id).maybeSingle();
    if (!row) throw new ApiError('Not found.', 404);
    if (row.auto)
      throw new ApiError(
        'Automatic points follow attendance, publishing and the flag. Change those and the points follow.',
      );
    const { error } = await sb.from('points').delete().eq('id', id);
    if (error) throw new ApiError(error.message, 500);
    await audit(officer.id, 'delete', 'points', id, row, null);
    bust();
    return back('Award removed.');
  }

  const handleName = str(b.handle, 30).replace(/^@/, '').toLowerCase();
  const amount = int(b.amount);
  const category = str(b.category, 20) as PointCategory;
  const reason = str(b.reason, 200);
  const eventId = str(b.event_id, 40);
  if (!handleName) throw new ApiError('Pick a member by handle.');
  if (!amount || Math.abs(amount) > 1000) throw new ApiError('The amount must be between -1000 and 1000, and not 0.');
  if (!POINT_CATEGORIES.includes(category)) throw new ApiError('Unknown category.');
  if (!reason) throw new ApiError('Give a reason: the member sees it.');
  if (eventId && !isUuid(eventId)) throw new ApiError('Unknown event.');
  const { data: member } = await sb
    .from('profiles')
    .select('id,name,handle')
    .eq('handle', handleName)
    .eq('onboarded', true)
    .maybeSingle();
  if (!member) throw new ApiError(`No member with the handle @${handleName}.`, 404);
  const { data: row, error } = await sb
    .from('points')
    .insert({
      user_id: member.id,
      amount,
      category,
      reason,
      event_id: eventId || null,
      awarded_by: officer.id,
    })
    .select('*')
    .single();
  if (error) throw new ApiError(error.message.includes('event') ? 'Unknown event.' : error.message, 400);
  await audit(officer.id, 'insert', 'points', row.id, null, row);
  bust();
  return back(`${amount > 0 ? `+${amount}` : amount} points for ${member.name || `@${member.handle}`}.`);
});
