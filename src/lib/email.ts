/* Email: a small queue in front of Resend's free tier. Reached through notify.ts from the
 * onboarding, registration and review routes, and directly from /api/cron/daily and /api/cron/weekly
 * (the digest, queued at the lowest priority and sent by the daily run).
 *
 * Every message is written to public.email_queue first and sent from there, so nothing is lost
 * when Resend is missing, rate limited or down. Sends stay under the free tier (100 a day,
 * 3000 a month) with a margin: DAILY_LIMIT is 90 so a retry or a test from the Resend dashboard
 * never hits the hard cap. What does not fit today rolls to tomorrow and goes out on the next
 * daily run, highest priority first (welcome mails before registration copies). Days are counted
 * on the Riyadh calendar (UTC+3, no daylight saving). Server only: everything here uses the
 * service key, and every function is a no-op that never throws when the database or Resend is
 * not configured, so a missing email never fails the request that triggered it. */
import { Resend } from 'resend';
import { serviceReady, resendReady, resendKey, emailFrom, siteUrl, serviceKey } from './env';
import { serviceClient } from './supabase';
import { getWhatsappGroups, type Group } from './whatsapp';
import { digestSince, digestWeek, postsSince, unsubscribeToken, upcomingFor } from './digest';
import type { EventItem, PostSummary } from './types';

export const DAILY_LIMIT = 90; // Resend free tier: 100 a day
export const MONTHLY_LIMIT = 3000; // and 3000 a month
const MAX_ATTEMPTS = 3; // a message that fails three times stays failed
const SEND_GAP_MS = 550; // Resend allows 2 requests a second
const TEMPLATE_TTL_MS = 60_000;

export type EmailKind = 'welcome' | 'status' | 'registration' | 'digest' | 'other';
export type TemplateKind = Exclude<EmailKind, 'other'>;
export const PRIORITY: Record<EmailKind, number> = { welcome: 1, status: 3, registration: 4, other: 5, digest: 6 };
export type Template = { subject: string; html: string };
export type Templates = Record<TemplateKind, Template>;
export type Vars = Record<string, string | number | null | undefined>;
export type SendResult = { sent: number; rolled: number; failed: number; error?: string };
export type Quota = {
  sentToday: number;
  sentMonth: number;
  queued: number;
  failed: number;
  dailyLimit: number;
  monthlyLimit: number;
  warnDaily: boolean;
  warnMonthly: boolean;
  configured: boolean;
};
type QueueRow = { id: string; to_email: string; subject: string; html: string; attempts: number };
const NOT_QUEUED = { queued: false, sent: false };

/* ── Pure helpers (no database) ──────────────────────────────────────────── */

const RIYADH_OFFSET_MS = 3 * 3_600_000;
const pad = (n: number) => String(n).padStart(2, '0');
const ymd = (d: Date) => `${d.getUTCFullYear()}-${pad(d.getUTCMonth() + 1)}-${pad(d.getUTCDate())}`;
/* Today and tomorrow on the Riyadh calendar, plus the UTC instants where the Riyadh day and month began. */
export function riyadhBounds(now = new Date()) {
  const local = new Date(now.getTime() + RIYADH_OFFSET_MS); // Riyadh wall clock, read with the UTC getters
  const y = local.getUTCFullYear(),
    m = local.getUTCMonth(),
    d = local.getUTCDate();
  return {
    today: ymd(new Date(Date.UTC(y, m, d))),
    tomorrow: ymd(new Date(Date.UTC(y, m, d + 1))),
    dayStart: new Date(Date.UTC(y, m, d) - RIYADH_OFFSET_MS).toISOString(),
    monthStart: new Date(Date.UTC(y, m, 1) - RIYADH_OFFSET_MS).toISOString(),
  };
}
/* How many messages may go out now: the caller's cap, bounded by what is left of both limits. */
export const budgetFor = (sentToday: number, sentMonth: number, max: number) =>
  Math.max(0, Math.min(max, DAILY_LIMIT - sentToday, MONTHLY_LIMIT - sentMonth));

const ESC: Record<string, string> = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };
export const escapeHtml = (v: unknown) => String(v ?? '').replace(/[&<>"']/g, (c) => ESC[c]);
const stripTags = (s: string) => s.replace(/<[^>]*>/g, '');
/* These placeholders carry HTML this module (or the calendar helpers) built from escaped parts. Everything else is escaped. */
const RAW_VARS = new Set(['whatsappLinks', 'calendarLinks', 'eventsList', 'postsList']);
/* Replaces {{name}}-style placeholders. Unknown or missing ones become empty. `text` mode is for subjects: no escaping, tags stripped. */
export function fill(template: string, vars: Vars, mode: 'html' | 'text' = 'html'): string {
  return template.replace(/\{\{\s*(\w+)\s*\}\}/g, (_, key: string) => {
    const v = vars[key] == null ? '' : String(vars[key]);
    if (mode === 'text') return (RAW_VARS.has(key) ? stripTags(v) : v).replace(/\s+/g, ' ').trim();
    return RAW_VARS.has(key) ? v : escapeHtml(v);
  });
}

/* The one layout every email uses: club name as heading, dark text on white, blue links, site URL in the footer. No images.
 * With an unsubscribe URL (the digest) the footer carries the link, whatever the admin's template says. */
export function layout(body: string, site = siteUrl, unsubscribeUrl = ''): string {
  const url = escapeHtml(site);
  return (
    `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width"><title>KFUPM Computer Club</title><style>a{color:#2563EB}</style></head>` +
    `<body style="margin:0;padding:0;background:#FFFFFF;color:#0B0B0F;font-family:system-ui,-apple-system,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;font-size:16px;line-height:1.5">` +
    `<div style="max-width:560px;margin:0 auto;padding:32px 24px">` +
    `<h1 style="margin:0 0 24px;font-size:20px;font-weight:700;color:#0B1A33">KFUPM Computer Club</h1>` +
    `<div style="color:#0B0B0F">${body}</div>` +
    `<p style="margin:32px 0 0;padding-top:16px;border-top:1px solid #E5E7EB;font-size:13px;color:#52525B"><a href="${url}" style="color:#2563EB">${url}</a></p>` +
    (unsubscribeUrl
      ? `<p style="margin:8px 0 0;font-size:13px;color:#52525B">You get this because you turned on the weekly digest. <a href="${escapeHtml(unsubscribeUrl)}" style="color:#2563EB">Unsubscribe</a></p>`
      : '') +
    `</div></body></html>`
  );
}

/* Built-in copy. Admins override any field from /admin/settings (settings row "email_templates"); an empty field keeps the default. */
export const DEFAULT_TEMPLATES: Templates = {
  welcome: {
    subject: 'You are in: welcome to the KFUPM Computer Club',
    html: '<p>Hi {{name}},</p><p>You are in. Here are the WhatsApp groups:</p>{{whatsappLinks}}<p>Workshops, talks and competitions are posted at <a href="{{siteUrl}}/timeline">{{siteUrl}}/timeline</a>. See you there.</p>',
  },
  status: {
    subject: 'Your post "{{postTitle}}" is now {{status}}',
    html: '<p>Hi {{name}},</p><p>Your post "{{postTitle}}" is now {{status}}. {{comment}}</p><p><a href="{{siteUrl}}/me/posts">Open your posts</a></p>',
  },
  registration: {
    subject: 'Your spot at {{eventTitle}}',
    html: '<p>Hi {{name}},</p><p>You reserved a spot at {{eventTitle}}, {{eventWhen}} at {{eventLocation}}.</p><p>Add it to your calendar: {{calendarLinks}}</p><p>Plans changed? Cancel from <a href="{{siteUrl}}/me/registrations">your registrations</a>.</p>',
  },
  digest: {
    subject: 'This week at the KFUPM Computer Club',
    html: '<p>Hi {{name}},</p><p>Here is what is coming up in the next two weeks and what was posted since the last digest.</p><p><b>Upcoming events</b></p>{{eventsList}}<p><b>New posts</b></p>{{postsList}}<p>The full calendar is at <a href="{{siteUrl}}/timeline">{{siteUrl}}/timeline</a>.</p>',
  },
};
const KINDS: TemplateKind[] = ['welcome', 'status', 'registration', 'digest'];
const text = (v: unknown) => (typeof v === 'string' && v.trim() ? v : '');
/* Defaults with the admin's non-empty overrides on top. Tolerates any shape in the settings row. */
export function mergeTemplates(overrides: unknown): Templates {
  const o = (overrides && typeof overrides === 'object' ? overrides : {}) as Record<string, any>;
  const out = {} as Templates;
  for (const k of KINDS)
    out[k] = {
      subject: text(o[k]?.subject) || DEFAULT_TEMPLATES[k].subject,
      html: text(o[k]?.html) || DEFAULT_TEMPLATES[k].html,
    };
  return out;
}
/* Fills a template: subject as plain text, body wrapped in the layout. {{siteUrl}} is always available. */
export function render(tpl: Template, vars: Vars, site = siteUrl, unsubscribeUrl = ''): Template {
  const all = { siteUrl: site, ...vars };
  return {
    subject: fill(tpl.subject, all, 'text').slice(0, 200),
    html: layout(fill(tpl.html, all, 'html'), site, unsubscribeUrl),
  };
}
/* The WhatsApp group list for the welcome email, or a pointer to the member page when none is set. */
export function whatsappList(groups: Group[], site = siteUrl): string {
  const items = (groups || [])
    .filter((g) => /^https?:\/\//i.test(g?.url || ''))
    .map((g) => `<li><a href="${escapeHtml(g.url)}" style="color:#2563EB">${escapeHtml(g.label || g.url)}</a></li>`);
  return items.length
    ? `<ul style="margin:0 0 16px;padding-left:20px">${items.join('')}</ul>`
    : `<p>The group links are on your <a href="${escapeHtml(site)}/me" style="color:#2563EB">member page</a>.</p>`;
}
const greet = (p: ProfileLike) => (p?.name || '').trim() || (p?.handle || '').trim() || 'there';
const isEmail = (v: unknown): v is string => typeof v === 'string' && /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(v);
const errorText = (e: unknown) => (e instanceof Error ? e.message : String(e)).slice(0, 500);
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

/* ── Templates from the database ─────────────────────────────────────────── */

/* Admin overrides come from the private email_templates setting, so they are read with the service
 * key and cached for a minute. Any failure falls back to the built-in copy rather than blocking a send. */
let templateCache: { at: number; value: Promise<Templates> } | null = null;
async function loadTemplates(): Promise<Templates> {
  if (templateCache && Date.now() - templateCache.at < TEMPLATE_TTL_MS) return templateCache.value;
  const value = (async () => {
    if (!serviceReady()) return mergeTemplates(null);
    const { data, error } = await serviceClient()
      .from('settings')
      .select('value')
      .eq('key', 'email_templates')
      .maybeSingle();
    if (error) throw new Error(error.message);
    return mergeTemplates(data?.value);
  })().catch((e) => {
    templateCache = null;
    console.error('email templates', e);
    return mergeTemplates(null);
  });
  templateCache = { at: Date.now(), value };
  return value;
}
export async function renderTemplate(kind: TemplateKind, vars: Vars): Promise<Template> {
  return render((await loadTemplates())[kind], vars);
}

/* ── Queue ───────────────────────────────────────────────────────────────── */

/* Stores one message and tries to send it right away. Never throws: the row waits in the queue when it cannot go out now. */
export async function enqueue({
  to,
  subject,
  html,
  kind = 'other',
}: {
  to: string;
  subject: string;
  html: string;
  kind?: EmailKind;
}): Promise<{ queued: boolean; sent: boolean }> {
  if (!serviceReady()) return NOT_QUEUED;
  if (!isEmail(to)) {
    console.error('email enqueue: bad address', to);
    return NOT_QUEUED;
  }
  try {
    const row = {
      to_email: to.trim(),
      subject: subject.slice(0, 200),
      html,
      kind,
      priority: PRIORITY[kind] ?? PRIORITY.other,
      status: 'queued',
      scheduled_for: riyadhBounds().today,
    };
    const { data, error } = await serviceClient().from('email_queue').insert(row).select('id').single();
    if (error) {
      console.error('email enqueue', error.message);
      return NOT_QUEUED;
    }
    const r = await drain(1);
    return { queued: true, sent: r.sentIds.includes(data.id) };
  } catch (e) {
    console.error('email enqueue', e);
    return NOT_QUEUED;
  }
}

/* Sends what is due, highest priority (lowest number) first, within today's budget. Returns the counts; see drain() for the rules. */
export async function sendPending(max = 50): Promise<SendResult> {
  const { sent, rolled, failed, error } = await drain(max);
  return error ? { sent, rolled, failed, error } : { sent, rolled, failed };
}

const sentSince = (sb: ReturnType<typeof serviceClient>, iso: string) =>
  count(sb, (q) => q.eq('status', 'sent').gte('sent_at', iso));
async function count(sb: ReturnType<typeof serviceClient>, where: (q: any) => any): Promise<number> {
  const { count: n, error } = await where(sb.from('email_queue').select('id', { count: 'exact', head: true }));
  if (error) throw new Error(error.message);
  return n || 0;
}
/* One pass over the queue:
 *  - picks queued rows due today (scheduled_for <= today), lowest priority number first, oldest first;
 *  - sends up to min(max, daily budget left, monthly budget left);
 *  - a row is claimed by bumping attempts before the send, so two overlapping runs cannot both send it;
 *  - success: status sent, sent_at; failure: error kept, retried tomorrow, failed for good after MAX_ATTEMPTS;
 *  - when today's budget is used up, every row still due today rolls to tomorrow.
 * Without a database or Resend the queue is left untouched. */
async function drain(max: number): Promise<SendResult & { sentIds: string[] }> {
  const out = { sent: 0, rolled: 0, failed: 0, sentIds: [] as string[] };
  if (!serviceReady() || !resendReady() || max <= 0) return out;
  try {
    const sb = serviceClient();
    const b = riyadhBounds();
    const [sentToday, sentMonth] = await Promise.all([sentSince(sb, b.dayStart), sentSince(sb, b.monthStart)]);
    let dayLeft = DAILY_LIMIT - sentToday,
      monthLeft = MONTHLY_LIMIT - sentMonth;
    const budget = budgetFor(sentToday, sentMonth, max);
    if (budget > 0) {
      const { data, error } = await sb
        .from('email_queue')
        .select('id,to_email,subject,html,attempts')
        .eq('status', 'queued')
        .lte('scheduled_for', b.today)
        .order('priority')
        .order('created_at')
        .limit(budget);
      if (error) throw new Error(error.message);
      const resend = new Resend(resendKey);
      const rows = (data || []) as QueueRow[];
      for (let i = 0; i < rows.length; i++) {
        const row = rows[i];
        const attempts = (row.attempts || 0) + 1;
        const { data: claimed } = await sb
          .from('email_queue')
          .update({ attempts })
          .eq('id', row.id)
          .eq('status', 'queued')
          .eq('attempts', row.attempts || 0)
          .select('id');
        if (!claimed?.length) continue; // another run took it
        if (i > 0) await sleep(SEND_GAP_MS);
        const failure = await deliver(resend, row);
        if (!failure) {
          await sb
            .from('email_queue')
            .update({ status: 'sent', sent_at: new Date().toISOString(), error: null })
            .eq('id', row.id);
          out.sent++;
          out.sentIds.push(row.id);
          dayLeft--;
          monthLeft--;
        } else {
          const final = attempts >= MAX_ATTEMPTS;
          await sb
            .from('email_queue')
            .update({
              error: failure,
              status: final ? 'failed' : 'queued',
              ...(final ? {} : { scheduled_for: b.tomorrow }),
            })
            .eq('id', row.id);
          out.failed++;
          console.error(`email ${row.id} attempt ${attempts}: ${failure}`);
        }
      }
    }
    if (Math.min(dayLeft, monthLeft) <= 0) {
      const { count: n, error } = await sb
        .from('email_queue')
        .update({ scheduled_for: b.tomorrow }, { count: 'exact' })
        .eq('status', 'queued')
        .lte('scheduled_for', b.today);
      if (error) throw new Error(error.message);
      out.rolled = n || 0;
    }
    return out;
  } catch (e) {
    console.error('email send', e);
    return { ...out, error: errorText(e) };
  }
}
/* One Resend call. Returns null on success, else a short error text. A rate-limit reply is retried once after a pause. */
async function deliver(resend: Resend, row: QueueRow, retried = false): Promise<string | null> {
  try {
    const { error } = await resend.emails.send({
      from: emailFrom,
      to: row.to_email,
      subject: row.subject,
      html: row.html,
    });
    if (!error) return null;
    if (error.name === 'rate_limit_exceeded' && !retried) {
      await sleep(1_200);
      return deliver(resend, row, true);
    }
    return `${error.name}: ${error.message}`.slice(0, 500);
  } catch (e) {
    return errorText(e);
  }
}

/* Counters for the admin dashboard. Sent counts follow the Riyadh day and month. */
export async function quota(): Promise<Quota> {
  const base: Quota = {
    sentToday: 0,
    sentMonth: 0,
    queued: 0,
    failed: 0,
    dailyLimit: DAILY_LIMIT,
    monthlyLimit: MONTHLY_LIMIT,
    warnDaily: false,
    warnMonthly: false,
    configured: resendReady(),
  };
  if (!serviceReady()) return base;
  try {
    const sb = serviceClient();
    const b = riyadhBounds();
    const [sentToday, sentMonth, queued, failed] = await Promise.all([
      sentSince(sb, b.dayStart),
      sentSince(sb, b.monthStart),
      count(sb, (q) => q.eq('status', 'queued')),
      count(sb, (q) => q.eq('status', 'failed')),
    ]);
    return {
      ...base,
      sentToday,
      sentMonth,
      queued,
      failed,
      warnDaily: sentToday >= 0.8 * DAILY_LIMIT,
      warnMonthly: sentMonth >= 0.8 * MONTHLY_LIMIT,
    };
  } catch (e) {
    console.error('email quota', e);
    return base;
  }
}

/* A daily write that keeps a free Supabase project from pausing for inactivity (they pause after about a week without traffic). */
export async function pingKeepAlive(): Promise<boolean> {
  if (!serviceReady()) return false;
  try {
    const { error } = await serviceClient().from('keepalive').upsert({ id: 1, pinged_at: new Date().toISOString() });
    if (error) throw new Error(error.message);
    return true;
  } catch (e) {
    console.error('keepalive', e);
    return false;
  }
}

/* ── The three messages the site sends ───────────────────────────────────── */

type ProfileLike = { email?: string | null; name?: string | null; handle?: string | null } | null | undefined;
type PostLike = { title?: string | null; author_name?: string | null; authorName?: string | null } | null | undefined;
type EventLike =
  | {
      title?: string | null;
      when?: string | null;
      location?: string | null;
      start?: Date | string | null;
      allDay?: boolean;
    }
  | null
  | undefined;
const fmtWhen = (d: Date, allDay: boolean) =>
  new Intl.DateTimeFormat('en-GB', {
    timeZone: 'Asia/Riyadh',
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    ...(allDay ? {} : { hour: 'numeric', minute: '2-digit' }),
  }).format(d);

/* After onboarding: the greeting and the members-only WhatsApp links. */
export async function sendWelcome(profile: ProfileLike) {
  const to = profile?.email;
  if (!serviceReady() || !isEmail(to)) return NOT_QUEUED;
  const groups = await getWhatsappGroups().catch((): Group[] => []);
  const { subject, html } = await renderTemplate('welcome', {
    name: greet(profile),
    whatsappLinks: whatsappList(groups),
  });
  return enqueue({ to, subject, html, kind: 'welcome' });
}
/* After a reviewer changes a post's status; `status` is already human-readable ("changes requested"). */
export async function sendStatusChange(
  post: PostLike,
  status: string,
  comment: string,
  authorEmail: string | null | undefined,
) {
  if (!serviceReady() || !isEmail(authorEmail)) return NOT_QUEUED;
  const { subject, html } = await renderTemplate('status', {
    name: greet({ name: post?.author_name || post?.authorName }),
    postTitle: post?.title || 'Untitled',
    status,
    comment: (comment || '').trim(),
  });
  return enqueue({ to: authorEmail, subject, html, kind: 'status' });
}
/* The copy a member asked for when reserving a spot; `calendarLinksHtml` comes from the calendar helpers. */
export async function sendRegistrationCopy(profile: ProfileLike, event: EventLike, calendarLinksHtml: string) {
  const to = profile?.email;
  if (!serviceReady() || !isEmail(to)) return NOT_QUEUED;
  const start =
    event?.start instanceof Date ? event.start : typeof event?.start === 'string' ? new Date(event.start) : null;
  const when =
    (event?.when || '').trim() ||
    (start && !Number.isNaN(start.getTime()) ? fmtWhen(start, event?.allDay !== false) : '');
  const { subject, html } = await renderTemplate('registration', {
    name: greet(profile),
    eventTitle: event?.title || 'the event',
    eventWhen: when,
    eventLocation: (event?.location || '').trim() || 'KFUPM',
    calendarLinks:
      (calendarLinksHtml || '').trim() ||
      `<a href="${escapeHtml(siteUrl)}/timeline" style="color:#2563EB">${escapeHtml(siteUrl)}/timeline</a>`,
  });
  return enqueue({ to, subject, html, kind: 'registration' });
}

/* ── The weekly digest ───────────────────────────────────────────────────── */

type DigestEvent = Pick<EventItem, 'slug' | 'title' | 'start' | 'allDay' | 'location'>;
type DigestPost = Pick<PostSummary, 'slug' | 'title' | 'date' | 'authorName'>;
type DigestMember = { id: string; email: string | null; name: string | null; handle: string | null };
export type DigestResult = {
  ok: boolean;
  week?: string;
  skipped?: string;
  events?: number;
  posts?: number;
  recipients?: number;
  queued?: number;
  error?: string;
};
const PAGE_ROWS = 1000; // PostgREST's default cap on rows per request
const INSERT_ROWS = 500;

/* The digest's two lists ({{eventsList}} and {{postsList}}), built from escaped parts. */
export function eventsList(events: DigestEvent[], site = siteUrl): string {
  if (!events.length) return '<p>No events in the next two weeks.</p>';
  const items = events.map(
    (e) =>
      `<li style="margin:0 0 8px"><a href="${escapeHtml(`${site}/timeline#ev-${e.slug}`)}" style="color:#2563EB">${escapeHtml(e.title)}</a><br>` +
      `${escapeHtml(fmtWhen(e.start, e.allDay))}${e.location ? `, ${escapeHtml(e.location)}` : ''}</li>`,
  );
  return `<ul style="margin:0 0 16px;padding-left:20px">${items.join('')}</ul>`;
}
export function postsList(posts: DigestPost[], site = siteUrl): string {
  if (!posts.length) return '<p>No new posts since the last digest.</p>';
  const items = posts.map(
    (p) =>
      `<li style="margin:0 0 8px"><a href="${escapeHtml(`${site}/blog/${encodeURIComponent(p.slug)}`)}" style="color:#2563EB">${escapeHtml(p.title)}</a>` +
      `${p.authorName ? ` by ${escapeHtml(p.authorName)}` : ''}</li>`,
  );
  return `<ul style="margin:0 0 16px;padding-left:20px">${items.join('')}</ul>`;
}

/* Every opted-in, onboarded and unsuspended member, a page at a time. */
async function digestMembers(sb: ReturnType<typeof serviceClient>): Promise<DigestMember[]> {
  const out: DigestMember[] = [];
  for (let from = 0; ; from += PAGE_ROWS) {
    const { data, error } = await sb
      .from('profiles')
      .select('id,email,name,handle')
      .eq('digest_opt_in', true)
      .eq('onboarded', true)
      .eq('suspended', false)
      .order('created_at')
      .range(from, from + PAGE_ROWS - 1);
    if (error) throw new Error(error.message);
    out.push(...((data || []) as DigestMember[]));
    if (!data || data.length < PAGE_ROWS) return out;
  }
}

/* Called by /api/cron/weekly with the published events and posts from content.ts. One run per Riyadh
 * week: the run first claims the week in digest_runs, so a retry or a second call queues nothing.
 * Nothing is queued either when there are no events in the next two weeks and no posts since the last
 * digest. Otherwise it queues one message per opted-in member at the lowest priority and sends none
 * itself: the daily cron delivers them after everything more urgent, and what does not fit in a day's
 * budget rolls to the next day. Each message carries the member's own unsubscribe link. */
export async function queueDigest(events: DigestEvent[], posts: DigestPost[], now = new Date()): Promise<DigestResult> {
  if (!serviceReady()) return { ok: false, error: 'database not configured' };
  const sb = serviceClient();
  const week = digestWeek(now);
  let claimed = false,
    queued = 0;
  try {
    const { data: prev, error: prevError } = await sb
      .from('digest_runs')
      .select('ran_at')
      .lt('week', week)
      .order('week', { ascending: false })
      .limit(1)
      .maybeSingle();
    if (prevError) throw new Error(prevError.message);
    const { error: claimError } = await sb.from('digest_runs').insert({ week, ran_at: now.toISOString() });
    if (claimError?.code === '23505') return { ok: true, week, skipped: 'already ran this week' };
    if (claimError) throw new Error(claimError.message);
    claimed = true;

    const upcoming = upcomingFor(events, now);
    const fresh = postsSince(posts, digestSince(prev?.ran_at, now), now);
    const counts = { events: upcoming.length, posts: fresh.length };
    if (!upcoming.length && !fresh.length)
      return { ok: true, week, ...counts, recipients: 0, queued: 0, skipped: 'no events and no posts' };

    const members = (await digestMembers(sb)).flatMap((m) => (isEmail(m.email) ? [{ ...m, email: m.email }] : []));
    const tpl = (await loadTemplates()).digest;
    const lists = { eventsList: eventsList(upcoming), postsList: postsList(fresh) };
    const today = riyadhBounds(now).today;
    const rows = [];
    for (const m of members) {
      const unsubscribe = `${siteUrl}/unsubscribe?u=${m.id}&t=${await unsubscribeToken(m.id, serviceKey)}`;
      const { subject, html } = render(tpl, { name: greet(m), ...lists }, siteUrl, unsubscribe);
      rows.push({
        to_email: m.email.trim(),
        subject,
        html,
        kind: 'digest',
        priority: PRIORITY.digest,
        status: 'queued',
        scheduled_for: today,
      });
    }
    for (let i = 0; i < rows.length; i += INSERT_ROWS) {
      const chunk = rows.slice(i, i + INSERT_ROWS);
      const { error } = await sb.from('email_queue').insert(chunk);
      if (error) throw new Error(error.message);
      queued += chunk.length;
    }
    await sb
      .from('digest_runs')
      .update({ ...counts, recipients: rows.length })
      .eq('week', week);
    return { ok: true, week, ...counts, recipients: rows.length, queued };
  } catch (e) {
    // With nothing queued yet, give the week back so a run by hand can retry. After a partial queue the
    // claim stays, or the retry would queue a second copy for the members already queued.
    if (claimed && !queued) await sb.from('digest_runs').delete().eq('week', week);
    console.error('digest', e);
    return { ok: false, week, queued, error: errorText(e) };
  }
}
