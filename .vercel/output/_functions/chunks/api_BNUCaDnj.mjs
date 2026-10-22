import { c as serviceReady, r as serviceClient } from "./supabase_BKsAzIKQ.mjs";
import { t as atLeast } from "./types_DpuWdFt1.mjs";
//#region src/lib/api.ts
var ApiError = class extends Error {
	status;
	constructor(message, status = 400) {
		super(message);
		this.status = status;
	}
};
var json = (data, status = 200, headers = {}) => new Response(JSON.stringify(data), {
	status,
	headers: {
		"Content-Type": "application/json; charset=utf-8",
		"Cache-Control": "no-store",
		...headers
	}
});
var ok = (data = {}) => json({
	ok: true,
	...data
});
function requireUser(ctx) {
	if (!ctx.locals.user) throw new ApiError("Sign in first.", 401);
	if (!serviceReady()) throw new ApiError("The database is not configured.", 503);
	return ctx.locals.user;
}
function requireRole(ctx, min) {
	const u = requireUser(ctx);
	if (!atLeast(ctx.locals.role, min)) throw new ApiError("You do not have permission to do that.", 403);
	return u;
}
var clientIp = (request) => request.headers.get("x-forwarded-for")?.split(",")[0].trim() || request.headers.get("x-real-ip") || "local";
async function rateLimit(key, limit, windowSeconds) {
	if (!serviceReady()) return true;
	const { data, error } = await serviceClient().rpc("hit_rate_limit", {
		p_key: key,
		p_limit: limit,
		p_window_seconds: windowSeconds
	});
	if (error) {
		console.error("rate limit", error.message);
		return true;
	}
	return data !== false;
}
async function guardRate(request, scope, limit, windowSeconds = 60) {
	if (!await rateLimit(`${scope}:${clientIp(request)}`, limit, windowSeconds)) throw new ApiError("Too many requests. Try again in a minute.", 429);
}
async function audit(actorId, action, table, rowId, before, after) {
	try {
		await serviceClient().from("audit_log").insert({
			actor_id: actorId,
			action,
			table_name: table,
			row_id: rowId,
			before: before ?? null,
			after: after ?? null
		});
	} catch (e) {
		console.error("audit", e);
	}
}
async function readBody(request) {
	if ((request.headers.get("content-type") || "").includes("application/json")) try {
		return await request.json() || {};
	} catch {
		throw new ApiError("Invalid JSON.");
	}
	const form = await request.formData();
	const out = {};
	for (const [k, v] of form.entries()) if (k.endsWith("[]")) (out[k.slice(0, -2)] ||= []).push(v);
	else out[k] = v;
	return out;
}
var wantsHtml = (request) => !(request.headers.get("content-type") || "").includes("application/json") && (request.headers.get("accept") || "").includes("text/html");
var safeNext = (v, fallback = "/me") => typeof v === "string" && v.startsWith("/") && !v.startsWith("//") ? v : fallback;
var handle = (fn) => async (ctx) => {
	try {
		return await fn(ctx);
	} catch (e) {
		const status = e instanceof ApiError ? e.status : 500;
		const message = e instanceof ApiError ? e.message : "Something went wrong.";
		if (status >= 500) console.error(e);
		if (wantsHtml(ctx.request)) {
			const back = ctx.request.headers.get("referer") || "/";
			const u = new URL(back, ctx.url.origin);
			u.searchParams.set("error", message);
			return ctx.redirect(u.pathname + u.search + u.hash, 303);
		}
		return json({
			ok: false,
			error: message
		}, status);
	}
};
var str = (v, max = 200) => typeof v === "string" ? v.trim().slice(0, max) : "";
var bool = (v) => v === true || v === "true" || v === "1" || v === "on";
var int = (v) => {
	const n = typeof v === "number" ? v : parseInt(String(v ?? ""), 10);
	return Number.isFinite(n) ? n : null;
};
var isUuid = (v) => typeof v === "string" && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(v);
var slugify = (s) => s.toLowerCase().normalize("NFKD").replace(/[̀-ͯ]/g, "").replace(/[^a-z0-9؀-ۿ]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 80) || "post";
var isSaudiPhone = (v) => /^(\+966|0)?5\d{8}$/.test(v.replace(/[\s-]/g, ""));
var normalizePhone = (v) => {
	const d = v.replace(/[\s-]/g, "");
	return d.startsWith("+966") ? d : d.startsWith("0") ? `+966${d.slice(1)}` : `+966${d}`;
};
var isUrl = (v) => /^https?:\/\/[^\s]+$/i.test(v);
//#endregion
export { slugify as _, handle as a, isUrl as c, normalizePhone as d, ok as f, safeNext as g, requireUser as h, guardRate as i, isUuid as l, requireRole as m, audit as n, int as o, readBody as p, bool as r, isSaudiPhone as s, ApiError as t, json as u, str as v, wantsHtml as y };
