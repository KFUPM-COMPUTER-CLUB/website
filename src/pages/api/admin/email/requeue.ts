import type { APIRoute } from 'astro';
import { handle, requireRole, wantsHtml, ok, audit, ApiError } from '../../../../lib/api';
import { requeueMail } from '../../../../lib/notify';

export const prerender = false;
/* "Send failed emails again" on /admin: after a setup problem (a missing EMAIL_FROM, a revoked key, an
 * unverified domain) is fixed, puts every failed message back in today's queue with its attempts reset.
 * The next daily run sends them, within the usual budget. Admin only, like the email settings. */
export const POST: APIRoute = handle(async (ctx) => {
  const admin = requireRole(ctx, 'admin');
  const n = await requeueMail().catch((e: Error) => {
    throw new ApiError(`Could not requeue: ${e.message}`, 500);
  });
  await audit(admin.id, 'update', 'email_queue', null, { status: 'failed' }, { status: 'queued', count: n });
  const msg = n ? `${n} failed email${n === 1 ? '' : 's'} queued again for today's run.` : 'No failed emails.';
  return wantsHtml(ctx.request) ? ctx.redirect(`/admin?ok=${encodeURIComponent(msg)}`, 303) : ok({ requeued: n });
});
