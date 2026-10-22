import type { APIRoute } from 'astro';
import {
  handle,
  requireUser,
  readBody,
  bool,
  ApiError,
  isUuid,
  wantsHtml,
  ok,
  safeNext,
  guardRate,
} from '../../../../lib/api';
import { serviceClient } from '../../../../lib/supabase';
import { getEvent, eventEnd, fmtRiyadh } from '../../../../lib/content';
import { googleUrl, outlookUrl } from '../../../../lib/calendar';
import { notifyRegistration } from '../../../../lib/notify';

export const prerender = false;
/* One-click reservation for members, posted from the timeline and from /me/registrations.
 * POST reserves; cancel=1 cancels; _action=show flips "show on profile".
 * The order of the checks matters: onboarded (officers need a name and phone for the door list),
 * rate limit, then the event must exist and be published, and only for a new reservation must
 * registration be open and a spot remain. A member who already holds a spot may post again to
 * change the email copy without counting against capacity. The count and the insert are two
 * queries, so two people can take the last spot in the same second; for club-sized events that is
 * accepted rather than locking. The upsert on (event_id, user_id) makes a double click harmless.
 * Reservations are private: a public profile lists an event only when show_on_profile is set,
 * which profile_events() in SQL enforces and the "show" switch toggles. */
export const POST: APIRoute = handle(async (ctx) => {
  const user = requireUser(ctx);
  if (!ctx.locals.profile?.onboarded) throw new ApiError('Finish onboarding first.', 403);
  await guardRate(ctx.request, 'rsvp', 20, 600);
  if (!isUuid(ctx.params.id)) throw new ApiError('Not found.', 404);
  const b = await readBody(ctx.request);
  const sb = serviceClient();
  const { data: ev } = await sb.from('events').select('*').eq('id', ctx.params.id).eq('published', true).maybeSingle();
  if (!ev) throw new ApiError('Event not found.', 404);
  const next = safeNext(b.next, '/me/registrations');
  if (b._action === 'show') {
    const { data: mine } = await sb
      .from('registrations')
      .select('id,show_on_profile')
      .eq('event_id', ev.id)
      .eq('user_id', user.id)
      .maybeSingle();
    if (!mine) throw new ApiError('No reservation found.', 404);
    await sb.from('registrations').update({ show_on_profile: !mine.show_on_profile }).eq('id', mine.id);
    return wantsHtml(ctx.request)
      ? ctx.redirect(
          `/me/registrations?ok=${mine.show_on_profile ? 'Hidden from your profile.' : 'Shown on your profile.'}`,
          303,
        )
      : ok({ show_on_profile: !mine.show_on_profile });
  }
  if (bool(b.cancel)) {
    await sb.from('registrations').delete().eq('event_id', ev.id).eq('user_id', user.id);
    return wantsHtml(ctx.request)
      ? ctx.redirect(`/me/registrations?ok=Reservation cancelled.`, 303)
      : ok({ registered: false });
  }
  if (!ev.registration_open) throw new ApiError('Registration is closed for this event.', 409);
  if (ev.capacity) {
    const { count } = await sb.from('registrations').select('id', { count: 'exact', head: true }).eq('event_id', ev.id);
    const { data: mine } = await sb
      .from('registrations')
      .select('id')
      .eq('event_id', ev.id)
      .eq('user_id', user.id)
      .maybeSingle();
    if (!mine && (count || 0) >= ev.capacity) throw new ApiError('This event is full.', 409);
  }
  const email_copy = bool(b.email_copy);
  const { error } = await sb
    .from('registrations')
    .upsert({ event_id: ev.id, user_id: user.id, email_copy }, { onConflict: 'event_id,user_id' });
  if (error) throw new ApiError(error.message, 500);
  // The copy carries calendar links. It goes through the email queue, so it may wait for the daily run.
  if (email_copy) {
    const item = await getEvent(ev.slug);
    if (item) {
      const site = ctx.url.origin;
      const links = `<a href="${googleUrl(item, site)}">Google Calendar</a> · <a href="${outlookUrl(item, 'work', site)}">Outlook</a> · <a href="${outlookUrl(item, 'personal', site)}">Outlook.com</a> · <a href="${site}/api/events/${item.slug}.ics">.ics</a>`;
      await notifyRegistration(
        ctx.locals.profile,
        {
          title: item.title,
          when: fmtRiyadh(item.start, {
            weekday: 'short',
            day: 'numeric',
            month: 'short',
            ...(item.allDay ? {} : { hour: 'numeric', minute: '2-digit' }),
          }),
          location: item.location,
          end: eventEnd(item),
        },
        links,
      );
    }
  }
  return wantsHtml(ctx.request)
    ? ctx.redirect(`/me/registrations?ok=${encodeURIComponent(`You have a spot at ${ev.title}.`)}`, 303)
    : ok({ registered: true, next });
});
