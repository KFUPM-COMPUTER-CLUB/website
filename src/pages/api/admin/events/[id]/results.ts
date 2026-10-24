import type { APIRoute } from 'astro';
import {
  handle,
  requireRole,
  readBody,
  ApiError,
  str,
  int,
  isUuid,
  wantsHtml,
  ok,
  audit,
} from '../../../../../lib/api';
import { serviceClient } from '../../../../../lib/supabase';
import { bust } from '../../../../../lib/content';
import { placePoints } from '../../../../../lib/types';

export const prerender = false;
type Sb = ReturnType<typeof serviceClient>;

/* The fields of one result from the form. A member is named by handle; a free-text team stands alone
 * or beside a member. An empty points field takes the default for the place; 0 means no points. */
async function fields(sb: Sb, b: Record<string, any>) {
  const place = int(b.place);
  if (!place || place < 1 || place > 99) throw new ApiError('Place must be a number from 1 to 99.');
  const handle = str(b.member, 40).replace(/^@/, '').toLowerCase();
  let user_id: string | null = null;
  if (handle) {
    const { data: p } = await sb.from('profiles').select('id').eq('handle', handle).maybeSingle();
    if (!p) throw new ApiError(`No member has the handle @${handle}.`);
    user_id = p.id;
  }
  const team = str(b.team, 80) || null;
  if (!user_id && !team) throw new ApiError('Name a member (their handle), a team, or both.');
  const prizeText = str(b.prize_sar, 20).replace(/[,\s]/g, '');
  const prize_sar = prizeText ? int(prizeText) : null;
  if (prize_sar !== null && (prize_sar < 0 || prize_sar > 10_000_000))
    throw new ApiError('Prize must be in SAR, 0 or more.');
  const pointsText = str(b.points, 10);
  const points = pointsText ? int(pointsText) : placePoints(place);
  if (points === null || points < 0 || points > 1000) throw new ApiError('Points must be a number from 0 to 1000.');
  return { place, user_id, team, prize_sar, points };
}

/* Officer tools for one event's placings, used by /admin/events/<id>/results. One POST per change:
 * _action add (the default), update, up, down or remove. Points follow the results through the trigger
 * in 0010_event_results.sql, so nothing here writes to the points table. Every change is audited with
 * the whole row, which lets /admin/audit undo it; the trigger keeps the points in step then too. */
export const POST: APIRoute = handle(async (ctx) => {
  const officer = requireRole(ctx, 'officer');
  const eventId = ctx.params.id;
  if (!isUuid(eventId)) throw new ApiError('Not found.', 404);
  const sb = serviceClient();
  const { data: ev } = await sb.from('events').select('id').eq('id', eventId).maybeSingle();
  if (!ev) throw new ApiError('Not found.', 404);
  const b = await readBody(ctx.request);
  const action = str(b._action, 10) || 'add';
  const done = (message: string) => {
    bust();
    return wantsHtml(ctx.request)
      ? ctx.redirect(`/admin/events/${eventId}/results?ok=${encodeURIComponent(message)}`, 303)
      : ok();
  };

  if (action === 'add') {
    const { data, error } = await sb
      .from('event_results')
      .insert({ event_id: eventId, ...(await fields(sb, b)) })
      .select('*')
      .single();
    if (error) throw new ApiError(error.message, 500);
    await audit(officer.id, 'insert', 'event_results', data.id, null, data);
    return done('Result added.');
  }

  const { data: list, error: listError } = await sb
    .from('event_results')
    .select('*')
    .eq('event_id', eventId)
    .order('place')
    .order('created_at');
  if (listError) throw new ApiError(listError.message, 500);
  const i = (list || []).findIndex((r: any) => r.id === b.id);
  if (i < 0) throw new ApiError('Not found.', 404);
  const row = list![i];

  if (action === 'update') {
    const { data, error } = await sb
      .from('event_results')
      .update(await fields(sb, b))
      .eq('id', row.id)
      .select('*')
      .single();
    if (error) throw new ApiError(error.message, 500);
    await audit(officer.id, 'update', 'event_results', row.id, row, data);
    return done('Saved.');
  }
  if (action === 'remove') {
    const { error } = await sb.from('event_results').delete().eq('id', row.id);
    if (error) throw new ApiError(error.message, 500);
    await audit(officer.id, 'delete', 'event_results', row.id, row, null);
    return done('Result removed.');
  }
  if (action === 'up' || action === 'down') {
    // Moving swaps places with the neighbour, so the list stays in place order. Points still at the
    // default for the old place take the default for the new one; an amount the officer typed stays.
    const other = list![action === 'up' ? i - 1 : i + 1];
    if (!other) return done('Already there.');
    if (other.place === row.place) throw new ApiError('These two share a place: change the place number instead.');
    for (const [r, place] of [
      [row, other.place],
      [other, row.place],
    ] as const) {
      const points = r.points === placePoints(r.place) ? placePoints(place) : r.points;
      const { data, error } = await sb
        .from('event_results')
        .update({ place, points })
        .eq('id', r.id)
        .select('*')
        .single();
      if (error) throw new ApiError(error.message, 500);
      await audit(officer.id, 'update', 'event_results', r.id, r, data);
    }
    return done('Moved.');
  }
  throw new ApiError('Unknown action.');
});
