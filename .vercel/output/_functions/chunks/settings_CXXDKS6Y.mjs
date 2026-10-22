import { D as __exportAll, t as bust } from "./content_Dw4BquHy.mjs";
import { r as serviceClient } from "./supabase_BYajXEmb.mjs";
import { a as handle, c as isUrl, f as ok, m as requireRole, n as audit, p as readBody, r as bool, t as ApiError, v as str, y as wantsHtml } from "./api_L-wuzLIp.mjs";
//#region src/pages/api/admin/settings.ts
var settings_exports = /* @__PURE__ */ __exportAll({
	POST: () => POST,
	prerender: () => false
});
var KEYS = [
	"site",
	"links",
	"banner",
	"whatsapp_groups",
	"email_templates",
	"home",
	"made_by"
];
var POST = handle(async (ctx) => {
	const admin = requireRole(ctx, (ctx.params, "officer"));
	const b = await readBody(ctx.request);
	const key = str(b.key, 30);
	if (!KEYS.includes(key)) throw new ApiError("Unknown settings key.");
	if (key !== "home" && ctx.locals.role !== "admin") throw new ApiError("Admins only.", 403);
	const sb = serviceClient();
	const { data: old } = await sb.from("settings").select("value").eq("key", key).maybeSingle();
	let value;
	switch (key) {
		case "site":
			value = {
				...old?.value || {},
				name: str(b.name, 80),
				short: str(b.short, 20),
				tagline: str(b.tagline, 120),
				description: str(b.description, 300),
				intro: str(b.intro, 240),
				email: str(b.email, 120),
				missionAr: str(b.missionAr, 400)
			};
			break;
		case "links":
			value = { ...old?.value || {} };
			for (const k of [
				"join",
				"whatsapp",
				"discord",
				"instagram",
				"x",
				"linkedin",
				"github",
				"solvers"
			]) {
				const v = str(b[k], 300);
				if (v && !isUrl(v)) throw new ApiError(`${k}: must be a full URL.`);
				value[k] = v;
			}
			break;
		case "banner":
			value = {
				text: str(b.text, 160),
				url: str(b.url, 300),
				visible: bool(b.visible)
			};
			break;
		case "whatsapp_groups": {
			const labels = Array.isArray(b.label) ? b.label : [b.label];
			const urls = Array.isArray(b.url) ? b.url : [b.url];
			value = labels.map((l, i) => ({
				label: str(l, 60),
				url: str(urls[i], 300)
			})).filter((g) => g.url);
			for (const g of value) if (!isUrl(g.url)) throw new ApiError("Group links must be full URLs.");
			break;
		}
		case "email_templates":
			value = {
				welcome: {
					subject: str(b.welcome_subject, 160),
					html: str(b.welcome_html, 5e3)
				},
				status: {
					subject: str(b.status_subject, 160),
					html: str(b.status_html, 5e3)
				},
				registration: {
					subject: str(b.registration_subject, 160),
					html: str(b.registration_html, 5e3)
				}
			};
			break;
		case "home":
			value = {
				...old?.value || {},
				heroLine: str(b.heroLine, 120),
				buildWithUs: {
					title: str(b.build_title, 80),
					text: str(b.build_text, 240)
				},
				photoMoment: {
					photoKey: str(b.moment_photo, 200),
					eyebrow: str(b.moment_eyebrow, 80),
					line: str(b.moment_line, 120)
				},
				stats: [
					0,
					1,
					2
				].map((i) => ({
					v: str(b[`stat_v_${i}`], 20),
					u: str(b[`stat_u_${i}`], 20),
					l: str(b[`stat_l_${i}`], 60)
				})).filter((s) => s.v),
				totalPrizesSar: Number(String(b.totalPrizesSar || "").replace(/\D/g, "")) || old?.value?.totalPrizesSar || 0
			};
			break;
		case "made_by": {
			const names = Array.isArray(b.name) ? b.name : [b.name];
			const githubs = Array.isArray(b.github) ? b.github : [b.github];
			value = names.map((n, i) => ({
				name: str(n, 60),
				github: str(githubs[i], 60)
			})).filter((m) => m.name);
			break;
		}
	}
	const { error } = await sb.from("settings").upsert({
		key,
		value
	});
	if (error) throw new ApiError(error.message, 500);
	await audit(admin.id, old ? "update" : "insert", "settings", key, old?.value ?? null, value);
	bust();
	const back = key === "home" ? "/admin/home" : `/admin/settings#${key}`;
	return wantsHtml(ctx.request) ? ctx.redirect(`${back.split("#")[0]}?ok=Saved.${back.includes("#") ? "#" + back.split("#")[1] : ""}`, 303) : ok();
});
//#endregion
//#region \0virtual:astro:page:src/pages/api/admin/settings@_@ts
var page = () => settings_exports;
//#endregion
export { page };
