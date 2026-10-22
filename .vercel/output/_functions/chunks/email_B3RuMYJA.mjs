import { P as __exportAll } from "./content_cbSbtds5.mjs";
import { c as emailFrom, d as resendReady, f as serviceReady, p as siteUrl, r as serviceClient, u as resendKey } from "./supabase_CcU7CO77.mjs";
import { t as getWhatsappGroups } from "./whatsapp_GAvfnLdX.mjs";
import { Resend } from "resend";
//#region src/lib/email.ts
var email_exports = /* @__PURE__ */ __exportAll({
	DAILY_LIMIT: () => 90,
	DEFAULT_TEMPLATES: () => DEFAULT_TEMPLATES,
	MONTHLY_LIMIT: () => MONTHLY_LIMIT,
	PRIORITY: () => PRIORITY,
	budgetFor: () => budgetFor,
	enqueue: () => enqueue,
	escapeHtml: () => escapeHtml,
	fill: () => fill,
	layout: () => layout,
	mergeTemplates: () => mergeTemplates,
	pingKeepAlive: () => pingKeepAlive,
	quota: () => quota,
	render: () => render,
	renderTemplate: () => renderTemplate,
	riyadhBounds: () => riyadhBounds,
	sendPending: () => sendPending,
	sendRegistrationCopy: () => sendRegistrationCopy,
	sendStatusChange: () => sendStatusChange,
	sendWelcome: () => sendWelcome,
	whatsappList: () => whatsappList
});
var MONTHLY_LIMIT = 3e3;
var MAX_ATTEMPTS = 3;
var SEND_GAP_MS = 550;
var TEMPLATE_TTL_MS = 6e4;
var PRIORITY = {
	welcome: 1,
	status: 3,
	registration: 4,
	other: 5
};
var NOT_QUEUED = {
	queued: false,
	sent: false
};
var RIYADH_OFFSET_MS = 108e5;
var pad = (n) => String(n).padStart(2, "0");
var ymd = (d) => `${d.getUTCFullYear()}-${pad(d.getUTCMonth() + 1)}-${pad(d.getUTCDate())}`;
function riyadhBounds(now = /* @__PURE__ */ new Date()) {
	const local = new Date(now.getTime() + RIYADH_OFFSET_MS);
	const y = local.getUTCFullYear(), m = local.getUTCMonth(), d = local.getUTCDate();
	return {
		today: ymd(new Date(Date.UTC(y, m, d))),
		tomorrow: ymd(new Date(Date.UTC(y, m, d + 1))),
		dayStart: (/* @__PURE__ */ new Date(Date.UTC(y, m, d) - RIYADH_OFFSET_MS)).toISOString(),
		monthStart: (/* @__PURE__ */ new Date(Date.UTC(y, m, 1) - RIYADH_OFFSET_MS)).toISOString()
	};
}
var budgetFor = (sentToday, sentMonth, max) => Math.max(0, Math.min(max, 90 - sentToday, MONTHLY_LIMIT - sentMonth));
var ESC = {
	"&": "&amp;",
	"<": "&lt;",
	">": "&gt;",
	"\"": "&quot;",
	"'": "&#39;"
};
var escapeHtml = (v) => String(v ?? "").replace(/[&<>"']/g, (c) => ESC[c]);
var stripTags = (s) => s.replace(/<[^>]*>/g, "");
var RAW_VARS = /* @__PURE__ */ new Set(["whatsappLinks", "calendarLinks"]);
function fill(template, vars, mode = "html") {
	return template.replace(/\{\{\s*(\w+)\s*\}\}/g, (_, key) => {
		const v = vars[key] == null ? "" : String(vars[key]);
		if (mode === "text") return (RAW_VARS.has(key) ? stripTags(v) : v).replace(/\s+/g, " ").trim();
		return RAW_VARS.has(key) ? v : escapeHtml(v);
	});
}
function layout(body, site = siteUrl) {
	const url = escapeHtml(site);
	return `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width"><title>KFUPM Computer Club</title><style>a{color:#2563EB}</style></head><body style="margin:0;padding:0;background:#FFFFFF;color:#0B0B0F;font-family:system-ui,-apple-system,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;font-size:16px;line-height:1.5"><div style="max-width:560px;margin:0 auto;padding:32px 24px"><h1 style="margin:0 0 24px;font-size:20px;font-weight:700;color:#0B1A33">KFUPM Computer Club</h1><div style="color:#0B0B0F">${body}</div><p style="margin:32px 0 0;padding-top:16px;border-top:1px solid #E5E7EB;font-size:13px;color:#52525B"><a href="${url}" style="color:#2563EB">${url}</a></p></div></body></html>`;
}
var DEFAULT_TEMPLATES = {
	welcome: {
		subject: "You are in: welcome to the KFUPM Computer Club",
		html: "<p>Hi {{name}},</p><p>You are in. Here are the WhatsApp groups:</p>{{whatsappLinks}}<p>Workshops, talks and competitions are posted at <a href=\"{{siteUrl}}/timeline\">{{siteUrl}}/timeline</a>. See you there.</p>"
	},
	status: {
		subject: "Your post \"{{postTitle}}\" is now {{status}}",
		html: "<p>Hi {{name}},</p><p>Your post \"{{postTitle}}\" is now {{status}}. {{comment}}</p><p><a href=\"{{siteUrl}}/me/posts\">Open your posts</a></p>"
	},
	registration: {
		subject: "Your spot at {{eventTitle}}",
		html: "<p>Hi {{name}},</p><p>You reserved a spot at {{eventTitle}}, {{eventWhen}} at {{eventLocation}}.</p><p>Add it to your calendar: {{calendarLinks}}</p><p>Plans changed? Cancel from <a href=\"{{siteUrl}}/me/registrations\">your registrations</a>.</p>"
	}
};
var KINDS = [
	"welcome",
	"status",
	"registration"
];
var text = (v) => typeof v === "string" && v.trim() ? v : "";
function mergeTemplates(overrides) {
	const o = overrides && typeof overrides === "object" ? overrides : {};
	const out = {};
	for (const k of KINDS) out[k] = {
		subject: text(o[k]?.subject) || DEFAULT_TEMPLATES[k].subject,
		html: text(o[k]?.html) || DEFAULT_TEMPLATES[k].html
	};
	return out;
}
function render(tpl, vars, site = siteUrl) {
	const all = {
		siteUrl: site,
		...vars
	};
	return {
		subject: fill(tpl.subject, all, "text").slice(0, 200),
		html: layout(fill(tpl.html, all, "html"), site)
	};
}
function whatsappList(groups, site = siteUrl) {
	const items = (groups || []).filter((g) => /^https?:\/\//i.test(g?.url || "")).map((g) => `<li><a href="${escapeHtml(g.url)}" style="color:#2563EB">${escapeHtml(g.label || g.url)}</a></li>`);
	return items.length ? `<ul style="margin:0 0 16px;padding-left:20px">${items.join("")}</ul>` : `<p>The group links are on your <a href="${escapeHtml(site)}/me" style="color:#2563EB">member page</a>.</p>`;
}
var greet = (p) => (p?.name || "").trim() || (p?.handle || "").trim() || "there";
var isEmail = (v) => typeof v === "string" && /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(v);
var errorText = (e) => (e instanceof Error ? e.message : String(e)).slice(0, 500);
var sleep = (ms) => new Promise((r) => setTimeout(r, ms));
var templateCache = null;
async function loadTemplates() {
	if (templateCache && Date.now() - templateCache.at < TEMPLATE_TTL_MS) return templateCache.value;
	const value = (async () => {
		if (!serviceReady()) return mergeTemplates(null);
		const { data, error } = await serviceClient().from("settings").select("value").eq("key", "email_templates").maybeSingle();
		if (error) throw new Error(error.message);
		return mergeTemplates(data?.value);
	})().catch((e) => {
		templateCache = null;
		console.error("email templates", e);
		return mergeTemplates(null);
	});
	templateCache = {
		at: Date.now(),
		value
	};
	return value;
}
async function renderTemplate(kind, vars) {
	return render((await loadTemplates())[kind], vars);
}
async function enqueue({ to, subject, html, kind = "other" }) {
	if (!serviceReady()) return NOT_QUEUED;
	if (!isEmail(to)) {
		console.error("email enqueue: bad address", to);
		return NOT_QUEUED;
	}
	try {
		const row = {
			to_email: to.trim(),
			subject: subject.slice(0, 200),
			html,
			kind,
			priority: PRIORITY[kind] ?? PRIORITY.other,
			status: "queued",
			scheduled_for: riyadhBounds().today
		};
		const { data, error } = await serviceClient().from("email_queue").insert(row).select("id").single();
		if (error) {
			console.error("email enqueue", error.message);
			return NOT_QUEUED;
		}
		return {
			queued: true,
			sent: (await drain(1)).sentIds.includes(data.id)
		};
	} catch (e) {
		console.error("email enqueue", e);
		return NOT_QUEUED;
	}
}
async function sendPending(max = 50) {
	const { sent, rolled, failed, error } = await drain(max);
	return error ? {
		sent,
		rolled,
		failed,
		error
	} : {
		sent,
		rolled,
		failed
	};
}
var sentSince = (sb, iso) => count(sb, (q) => q.eq("status", "sent").gte("sent_at", iso));
async function count(sb, where) {
	const { count: n, error } = await where(sb.from("email_queue").select("id", {
		count: "exact",
		head: true
	}));
	if (error) throw new Error(error.message);
	return n || 0;
}
async function drain(max) {
	const out = {
		sent: 0,
		rolled: 0,
		failed: 0,
		sentIds: []
	};
	if (!serviceReady() || !resendReady() || max <= 0) return out;
	try {
		const sb = serviceClient();
		const b = riyadhBounds();
		const [sentToday, sentMonth] = await Promise.all([sentSince(sb, b.dayStart), sentSince(sb, b.monthStart)]);
		let dayLeft = 90 - sentToday, monthLeft = MONTHLY_LIMIT - sentMonth;
		const budget = budgetFor(sentToday, sentMonth, max);
		if (budget > 0) {
			const { data, error } = await sb.from("email_queue").select("id,to_email,subject,html,attempts").eq("status", "queued").lte("scheduled_for", b.today).order("priority").order("created_at").limit(budget);
			if (error) throw new Error(error.message);
			const resend = new Resend(resendKey);
			const rows = data || [];
			for (let i = 0; i < rows.length; i++) {
				const row = rows[i];
				const attempts = (row.attempts || 0) + 1;
				const { data: claimed } = await sb.from("email_queue").update({ attempts }).eq("id", row.id).eq("status", "queued").eq("attempts", row.attempts || 0).select("id");
				if (!claimed?.length) continue;
				if (i > 0) await sleep(SEND_GAP_MS);
				const failure = await deliver(resend, row);
				if (!failure) {
					await sb.from("email_queue").update({
						status: "sent",
						sent_at: (/* @__PURE__ */ new Date()).toISOString(),
						error: null
					}).eq("id", row.id);
					out.sent++;
					out.sentIds.push(row.id);
					dayLeft--;
					monthLeft--;
				} else {
					const final = attempts >= MAX_ATTEMPTS;
					await sb.from("email_queue").update({
						error: failure,
						status: final ? "failed" : "queued",
						...final ? {} : { scheduled_for: b.tomorrow }
					}).eq("id", row.id);
					out.failed++;
					console.error(`email ${row.id} attempt ${attempts}: ${failure}`);
				}
			}
		}
		if (Math.min(dayLeft, monthLeft) <= 0) {
			const { count: n, error } = await sb.from("email_queue").update({ scheduled_for: b.tomorrow }, { count: "exact" }).eq("status", "queued").lte("scheduled_for", b.today);
			if (error) throw new Error(error.message);
			out.rolled = n || 0;
		}
		return out;
	} catch (e) {
		console.error("email send", e);
		return {
			...out,
			error: errorText(e)
		};
	}
}
async function deliver(resend, row, retried = false) {
	try {
		const { error } = await resend.emails.send({
			from: emailFrom,
			to: row.to_email,
			subject: row.subject,
			html: row.html
		});
		if (!error) return null;
		if (error.name === "rate_limit_exceeded" && !retried) {
			await sleep(1200);
			return deliver(resend, row, true);
		}
		return `${error.name}: ${error.message}`.slice(0, 500);
	} catch (e) {
		return errorText(e);
	}
}
async function quota() {
	const base = {
		sentToday: 0,
		sentMonth: 0,
		queued: 0,
		failed: 0,
		dailyLimit: 90,
		monthlyLimit: MONTHLY_LIMIT,
		warnDaily: false,
		warnMonthly: false,
		configured: resendReady()
	};
	if (!serviceReady()) return base;
	try {
		const sb = serviceClient();
		const b = riyadhBounds();
		const [sentToday, sentMonth, queued, failed] = await Promise.all([
			sentSince(sb, b.dayStart),
			sentSince(sb, b.monthStart),
			count(sb, (q) => q.eq("status", "queued")),
			count(sb, (q) => q.eq("status", "failed"))
		]);
		return {
			...base,
			sentToday,
			sentMonth,
			queued,
			failed,
			warnDaily: sentToday >= 72,
			warnMonthly: sentMonth >= .8 * MONTHLY_LIMIT
		};
	} catch (e) {
		console.error("email quota", e);
		return base;
	}
}
async function pingKeepAlive() {
	if (!serviceReady()) return false;
	try {
		const { error } = await serviceClient().from("keepalive").upsert({
			id: 1,
			pinged_at: (/* @__PURE__ */ new Date()).toISOString()
		});
		if (error) throw new Error(error.message);
		return true;
	} catch (e) {
		console.error("keepalive", e);
		return false;
	}
}
var fmtWhen = (d, allDay) => new Intl.DateTimeFormat("en-GB", {
	timeZone: "Asia/Riyadh",
	weekday: "short",
	day: "numeric",
	month: "short",
	...allDay ? {} : {
		hour: "numeric",
		minute: "2-digit"
	}
}).format(d);
async function sendWelcome(profile) {
	const to = profile?.email;
	if (!serviceReady() || !isEmail(to)) return NOT_QUEUED;
	const groups = await getWhatsappGroups().catch(() => []);
	const { subject, html } = await renderTemplate("welcome", {
		name: greet(profile),
		whatsappLinks: whatsappList(groups)
	});
	return enqueue({
		to,
		subject,
		html,
		kind: "welcome"
	});
}
async function sendStatusChange(post, status, comment, authorEmail) {
	if (!serviceReady() || !isEmail(authorEmail)) return NOT_QUEUED;
	const { subject, html } = await renderTemplate("status", {
		name: greet({ name: post?.author_name || post?.authorName }),
		postTitle: post?.title || "Untitled",
		status,
		comment: (comment || "").trim()
	});
	return enqueue({
		to: authorEmail,
		subject,
		html,
		kind: "status"
	});
}
async function sendRegistrationCopy(profile, event, calendarLinksHtml) {
	const to = profile?.email;
	if (!serviceReady() || !isEmail(to)) return NOT_QUEUED;
	const start = event?.start instanceof Date ? event.start : typeof event?.start === "string" ? new Date(event.start) : null;
	const when = (event?.when || "").trim() || (start && !Number.isNaN(start.getTime()) ? fmtWhen(start, event?.allDay !== false) : "");
	const { subject, html } = await renderTemplate("registration", {
		name: greet(profile),
		eventTitle: event?.title || "the event",
		eventWhen: when,
		eventLocation: (event?.location || "").trim() || "KFUPM",
		calendarLinks: (calendarLinksHtml || "").trim() || `<a href="${escapeHtml(siteUrl)}/timeline" style="color:#2563EB">${escapeHtml(siteUrl)}/timeline</a>`
	});
	return enqueue({
		to,
		subject,
		html,
		kind: "registration"
	});
}
//#endregion
export { sendPending as i, pingKeepAlive as n, quota as r, email_exports as t };
