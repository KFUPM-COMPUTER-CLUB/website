import type { APIRoute } from 'astro';
import { handle, requireRole, readBody, bool, json, audit } from '../../../lib/api';
import { runStep, type Step } from '../../../lib/importer';
import { bust } from '../../../lib/content';
import { invalidateMedia } from '../../../lib/photos';

export const prerender = false;
/* One batch of the starter-content import, admin only. A full import converts and uploads every
 * seed photo, far longer than one serverless invocation may run, so the work is cut into steps
 * (photos, logos, data) of a few files each. The page at /admin/import calls this in a loop,
 * sending back the "next" step from each reply, until next is null. Files already in Storage are
 * skipped unless force is set, so a stopped import can simply be started again.
 * Caches are cleared and the import audited only after the last step, once the data is complete. */
export const POST: APIRoute = handle(async (ctx) => {
  const admin = requireRole(ctx, 'admin');
  const b = await readBody(ctx.request);
  const step: Step = {
    step: ['photos', 'logos', 'data'].includes(b.step) ? b.step : 'photos',
    offset: Math.max(0, parseInt(String(b.offset || 0), 10) || 0),
  };
  const r = await runStep(step, bool(b.force));
  if (!r.next) {
    bust();
    invalidateMedia();
    await audit(admin.id, 'other', 'import', null, null, { force: bool(b.force) });
  }
  return json({ ok: true, ...r });
});
