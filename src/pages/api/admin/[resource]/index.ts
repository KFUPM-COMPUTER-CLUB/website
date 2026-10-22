import type { APIRoute } from 'astro';
import { handle, requireRole, readBody, ApiError, audit, str, wantsHtml, ok, safeNext } from '../../../../lib/api';
import { serviceClient } from '../../../../lib/supabase';
import { resource } from '../../../../lib/admin/resources';
import { parseFields } from '../../../../lib/admin/io';
import { bust } from '../../../../lib/content';
import { invalidateMedia } from '../../../../lib/photos';

export const prerender = false;
/* Writes for every generic admin resource (events, polaroids, partners, FAQ, board, ...). The
 * definition in lib/admin/resources.ts says which table, key, fields and minimum role apply, so one
 * route serves them all: _action = save | delete | move | toggle. Called by the forms on
 * /admin/<resource> and /admin/<resource>/<id>.
 *
 * The page already checked the role before rendering the form, but that only guards the HTML:
 * anyone can POST here directly, and this route is what actually writes with the service key
 * (which bypasses row level security). So the role is checked again, here, every time.
 * Every change goes to audit_log with a before and after snapshot; /admin/audit undoes from those
 * snapshots, so keep logging whole rows. */
export const POST: APIRoute = handle(async (ctx) => {
  const res = resource(ctx.params.resource || '');
  if (!res) throw new ApiError('Unknown resource.', 404);
  const user = requireRole(ctx, res.minRole);
  const b = await readBody(ctx.request);
  const sb = serviceClient();
  const action = str(b._action, 20) || 'save';
  const id = str(b.id, 200);
  const back = safeNext(b.next, `/admin/${res.key}`);
  // bust() clears the content memo and invalidateMedia() the photo map, so the next render reads
  // fresh rows; the ISR copy of the public page expires on its own within a minute.
  const done = (msg: string, extra: Record<string, unknown> = {}) => {
    bust();
    invalidateMedia();
    return wantsHtml(ctx.request)
      ? ctx.redirect(`${back}${back.includes('?') ? '&' : '?'}ok=${encodeURIComponent(msg)}`, 303)
      : ok(extra);
  };
  const current = id ? (await sb.from(res.table).select('*').eq(res.pk, id).maybeSingle()).data : null;

  if (action === 'delete') {
    if (!current) throw new ApiError('Not found.', 404);
    const { error } = await sb.from(res.table).delete().eq(res.pk, id);
    if (error) throw new ApiError(error.message, 500);
    await audit(user.id, 'delete', res.table, id, current, null);
    return done(`${res.singular} deleted. Undo from the audit log.`);
  }
  if (action === 'move' || action === 'toggle') {
    if (!current) throw new ApiError('Not found.', 404);
    const patch: Record<string, unknown> = {};
    // Which column "toggle" flips depends on the resource; the list page maps it the same way (change both).
    if (action === 'toggle') {
      const col = res.visible
        ? 'visible'
        : res.key === 'events'
          ? 'published'
          : res.key === 'board'
            ? 'is_current'
            : res.key === 'solvers'
              ? 'approved'
              : null;
      if (!col) throw new ApiError('Nothing to toggle.');
      patch[col] = !current[col];
    } else {
      const { data: all } = await sb.from(res.table).select(`${res.pk},sort`).order('sort');
      const list = all || [];
      const i = list.findIndex((r: any) => String(r[res.pk]) === id);
      const j = b.dir === 'up' ? i - 1 : i + 1;
      if (i < 0 || j < 0 || j >= list.length) return done('Nothing to move.');
      // Seed rows and deletes leave gaps in sort, so renumber densely first, then swap. The audit entry
      // records this row's sort only: enough for the log, not for an exact undo of the swap.
      const order = list.map((r: any) => r[res.pk]);
      [order[i], order[j]] = [order[j], order[i]];
      for (let k = 0; k < order.length; k++) await sb.from(res.table).update({ sort: k }).eq(res.pk, order[k]);
      await audit(user.id, 'update', res.table, id, { sort: current.sort }, { sort: j });
      return done('Order updated.');
    }
    const { error } = await sb.from(res.table).update(patch).eq(res.pk, id);
    if (error) throw new ApiError(error.message, 500);
    await audit(user.id, 'update', res.table, id, current, { ...current, ...patch });
    return done('Updated.');
  }
  // Save. parseFields validates and coerces by field type; on edit the primary key is never rewritten.
  const row = parseFields(res, b, current);
  if (current) {
    const { data, error } = await sb.from(res.table).update(row).eq(res.pk, id).select('*').single();
    if (error)
      throw new ApiError(
        error.message.includes('duplicate')
          ? 'That value already exists (slug or term must be unique).'
          : error.message,
        500,
      );
    await audit(user.id, 'update', res.table, id, current, data);
    return done('Saved.', { row: data });
  }
  // New rows go to the end of the order.
  if (res.sortable) {
    const { data: last } = await sb
      .from(res.table)
      .select('sort')
      .order('sort', { ascending: false })
      .limit(1)
      .maybeSingle();
    row.sort = (last?.sort ?? -1) + 1;
  }
  const { data, error } = await sb.from(res.table).insert(row).select('*').single();
  if (error)
    throw new ApiError(
      error.message.includes('duplicate')
        ? 'That value already exists (slug, term or photo must be unique).'
        : error.message,
      500,
    );
  await audit(user.id, 'insert', res.table, String(data[res.pk]), null, data);
  return done(`${res.singular} added.`, { row: data });
});
