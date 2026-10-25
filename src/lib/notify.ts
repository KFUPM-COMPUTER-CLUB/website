/* Thin bridge between the API routes and email.ts. The glob import keeps Resend and the email
 * module out of a route's bundle until a message is actually sent, and the try/catch means a
 * failed email never fails the request (onboarding, registration, review) that triggered it.
 * Callers: the onboarding route, the event registration route, the post review route, the profile
 * route (a digest turned off), and the admin dashboard for the quota. */
const mods = import.meta.glob('./email.ts');
const email = async () => {
  const load = mods['./email.ts'];
  return load ? ((await load()) as any) : null;
};
export async function notifyWelcome(profile: any) {
  try {
    const m = await email();
    await m?.sendWelcome?.(profile);
  } catch (e) {
    console.error('welcome email', e);
  }
}
export async function notifyStatus(post: any, status: string, comment: string, authorEmail: string | null) {
  try {
    const m = await email();
    if (authorEmail) await m?.sendStatusChange?.(post, status, comment, authorEmail);
  } catch (e) {
    console.error('status email', e);
  }
}
export async function notifyRegistration(profile: any, event: any, calendarLinksHtml: string) {
  try {
    const m = await email();
    await m?.sendRegistrationCopy?.(profile, event, calendarLinksHtml);
  } catch (e) {
    console.error('registration email', e);
  }
}
export async function dropDigest(emails: (string | null | undefined)[]) {
  try {
    const m = await email();
    await m?.dropQueuedDigest?.(emails);
  } catch (e) {
    console.error('drop digest', e);
  }
}
export async function emailQuota() {
  try {
    const m = await email();
    return (await m?.quota?.()) || null;
  } catch {
    return null;
  }
}
