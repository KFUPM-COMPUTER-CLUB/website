/* Thin bridge to the email module. Loaded lazily so the site works before it exists or without keys. */
const mods = import.meta.glob('./email.ts');
const email = async () => { const load = mods['./email.ts']; return load ? ((await load()) as any) : null; };
export async function notifyWelcome(profile: any) { try { const m = await email(); await m?.sendWelcome?.(profile); } catch (e) { console.error('welcome email', e); } }
export async function notifyStatus(post: any, status: string, comment: string, authorEmail: string | null) { try { const m = await email(); if (authorEmail) await m?.sendStatusChange?.(post, status, comment, authorEmail); } catch (e) { console.error('status email', e); } }
export async function notifyRegistration(profile: any, event: any, calendarLinksHtml: string) { try { const m = await email(); await m?.sendRegistrationCopy?.(profile, event, calendarLinksHtml); } catch (e) { console.error('registration email', e); } }
export async function emailQuota() { try { const m = await email(); return (await m?.quota?.()) || null; } catch { return null; } }
