import type { APIRoute } from 'astro';
import { handle, requireRole, readBody, bool, json, audit } from '../../../lib/api';
import { runStep, type Step } from '../../../lib/importer';
import { bust } from '../../../lib/content';
import { invalidateMedia } from '../../../lib/photos';

export const prerender = false;
/* One batch of the starter-content import. The page calls this repeatedly until next is null. */
export const POST: APIRoute = handle(async (ctx) => {
  const admin = requireRole(ctx, 'admin');
  const b = await readBody(ctx.request);
  const step: Step = { step: ['photos', 'logos', 'data'].includes(b.step) ? b.step : 'photos', offset: Math.max(0, parseInt(String(b.offset || 0), 10) || 0) };
  const r = await runStep(step, bool(b.force));
  if (!r.next) { bust(); invalidateMedia(); await audit(admin.id, 'other', 'import', null, null, { force: bool(b.force) }); }
  return json({ ok: true, ...r });
});
