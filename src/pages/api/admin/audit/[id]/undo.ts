import type { APIRoute } from 'astro';
import { handle, requireRole, ApiError, isUuid, wantsHtml, ok, audit } from '../../../../../lib/api';
import { serviceClient } from '../../../../../lib/supabase';
import { bust } from '../../../../../lib/content';

export const prerender = false;
const UNDOABLE = new Set([
  'events',
  'highlights',
  'stories',
  'strip_photos',
  'impact_semesters',
  'impact_items',
  'partners',
  'faq',
  'officer_terms',
  'flag_solvers',
  'settings',
  'posts',
  'media',
  'points',
  'event_results',
  'member_badges',
]);
/* Undo for /admin/audit, admin only. Each audit_log entry carries a before and after snapshot of the
 * row, and that is all an undo has to work with:
 *   update -> the "before" row is written back in full, so anything changed on that row since is lost too;
 *   insert -> the row is deleted, with whatever cascades from it (the items of an impact semester, say);
 *   delete -> the "before" row is inserted again under its old key, which fails if the key was reused
 *             or a row it references is gone. Files already removed from Storage do not come back.
 * An entry can be undone once (undone_at). The undo is itself logged with action "undo", which never
 * matches an undoable action, so there is no undo of an undo. UNDOABLE lists content tables only:
 * people, roles and reservations are deliberately left out, and the audit page hides the button for them.
 * Automatic badges are refused too: only the officer-awarded ones in member_badges can be undone. */
export const POST: APIRoute = handle(async (ctx) => {
  const user = requireRole(ctx, 'admin');
  if (!isUuid(ctx.params.id)) throw new ApiError('Not found.', 404);
  const sb = serviceClient();
  const { data: entry } = await sb.from('audit_log').select('*').eq('id', ctx.params.id).maybeSingle();
  if (!entry) throw new ApiError('Not found.', 404);
  if (entry.undone_at) throw new ApiError('Already undone.', 409);
  if (!UNDOABLE.has(entry.table_name)) throw new ApiError('This action cannot be undone from here.', 400);
  // Automatic badges belong to the triggers in 0014_badges.sql. Restoring one by hand would show a badge the
  // member no longer qualifies for, or drop one they still hold, until their next post, attendance or solve.
  if (entry.table_name === 'member_badges' && (entry.after ?? entry.before)?.auto)
    throw new ApiError("Automatic badges follow the member's activity and cannot be undone here.", 400);
  // Tables keyed by something other than id. Keep in step with lib/admin/resources.ts.
  const pk =
    entry.table_name === 'strip_photos'
      ? 'photo_key'
      : entry.table_name === 'settings'
        ? 'key'
        : entry.table_name === 'media'
          ? 'key'
          : 'id';
  let error: { message: string } | null | undefined;
  if (entry.action === 'update' && entry.before)
    ({ error } = await sb.from(entry.table_name).update(entry.before).eq(pk, entry.row_id));
  else if (entry.action === 'insert') ({ error } = await sb.from(entry.table_name).delete().eq(pk, entry.row_id));
  else if (entry.action === 'delete' && entry.before)
    ({ error } = await sb.from(entry.table_name).insert(entry.before));
  else throw new ApiError('Nothing to restore.', 400);
  if (error) throw new ApiError(`Undo failed: ${error.message}`, 500);
  await sb.from('audit_log').update({ undone_at: new Date().toISOString() }).eq('id', entry.id);
  await audit(user.id, 'undo', entry.table_name, entry.row_id, entry.after, entry.before);
  bust();
  return wantsHtml(ctx.request) ? ctx.redirect('/admin/audit?ok=Undone.', 303) : ok();
});
