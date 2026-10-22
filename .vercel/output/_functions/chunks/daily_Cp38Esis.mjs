import { P as __exportAll } from "./content_DecWaDc1.mjs";
import { f as serviceReady, o as cronSecret } from "./supabase_BOJmasnu.mjs";
import { u as json } from "./api_CGwffj9f.mjs";
import { i as sendPending, n as pingKeepAlive, r as quota } from "./email_CIHCj54n.mjs";
//#region src/pages/api/cron/daily.ts
var daily_exports = /* @__PURE__ */ __exportAll({
	GET: () => GET,
	POST: () => POST,
	prerender: () => false
});
var sameSecret = (given, want) => {
	const a = new TextEncoder().encode(given), b = new TextEncoder().encode(want);
	let diff = a.length ^ b.length;
	for (let i = 0; i < Math.max(a.length, b.length); i++) diff |= (a[i] ?? 0) ^ (b[i] ?? 0);
	return diff === 0;
};
var authorized = (request) => !cronSecret || sameSecret(request.headers.get("authorization") || "", `Bearer ${cronSecret}`);
var run = async ({ request }) => {
	if (!authorized(request)) return json({
		ok: false,
		error: "Unauthorized"
	}, 401);
	if (!serviceReady()) return json({
		ok: false,
		reason: "database not configured"
	});
	const keepalive = await pingKeepAlive();
	const r = await sendPending(80);
	return json({
		ok: true,
		keepalive,
		...r,
		quota: await quota()
	});
};
var GET = run;
var POST = run;
//#endregion
//#region \0virtual:astro:page:src/pages/api/cron/daily@_@ts
var page = () => daily_exports;
//#endregion
export { page };
