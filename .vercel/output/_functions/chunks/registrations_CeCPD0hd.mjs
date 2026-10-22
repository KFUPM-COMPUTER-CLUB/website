import { D as __exportAll } from "./content_Dw4BquHy.mjs";
import { r as serviceClient } from "./supabase_BYajXEmb.mjs";
import { t as atLeast } from "./types_DpuWdFt1.mjs";
import { a as handle, f as ok, l as isUuid, m as requireRole, n as audit, p as readBody, t as ApiError, v as str, y as wantsHtml } from "./api_L-wuzLIp.mjs";
//#region src/pages/api/admin/events/[id]/registrations.ts
var registrations_exports = /* @__PURE__ */ __exportAll({
	GET: () => GET,
	POST: () => POST,
	prerender: () => false
});
var esc = (v) => `"${String(v ?? "").replace(/"/g, "\"\"")}"`;
var GET = handle(async (ctx) => {
	requireRole(ctx, "officer");
	if (!isUuid(ctx.params.id)) throw new ApiError("Not found.", 404);
	const admin = atLeast(ctx.locals.role, "admin");
	const { data } = await serviceClient().from("registrations").select("email_copy,attended,created_at, profiles(name,handle,email,phone,major)").eq("event_id", ctx.params.id).order("created_at");
	const cols = admin ? [
		"name",
		"handle",
		"email",
		"phone",
		"major",
		"attended",
		"email_copy",
		"registered"
	] : [
		"name",
		"handle",
		"major",
		"attended",
		"registered"
	];
	const rows = (data || []).map((r) => ({
		name: r.profiles?.name,
		handle: r.profiles?.handle,
		email: r.profiles?.email,
		phone: r.profiles?.phone,
		major: r.profiles?.major,
		attended: r.attended,
		email_copy: r.email_copy,
		registered: String(r.created_at).slice(0, 16)
	}));
	const body = [cols.join(","), ...rows.map((r) => cols.map((c) => esc(r[c])).join(","))].join("\r\n");
	return new Response(body, { headers: {
		"Content-Type": "text/csv; charset=utf-8",
		"Content-Disposition": `attachment; filename="registrations-${ctx.params.id}.csv"`,
		"Cache-Control": "no-store"
	} });
});
var POST = handle(async (ctx) => {
	const officer = requireRole(ctx, "officer");
	if (!isUuid(ctx.params.id)) throw new ApiError("Not found.", 404);
	const b = await readBody(ctx.request);
	const rid = str(b.registration_id, 40);
	if (!isUuid(rid)) throw new ApiError("Not found.", 404);
	const sb = serviceClient();
	const { data: reg } = await sb.from("registrations").select("*").eq("id", rid).eq("event_id", ctx.params.id).maybeSingle();
	if (!reg) throw new ApiError("Not found.", 404);
	if (b._action === "remove") {
		await sb.from("registrations").delete().eq("id", rid);
		await audit(officer.id, "delete", "registrations", rid, reg, null);
	} else {
		await sb.from("registrations").update({ attended: !reg.attended }).eq("id", rid);
		await audit(officer.id, "update", "registrations", rid, { attended: reg.attended }, { attended: !reg.attended });
	}
	return wantsHtml(ctx.request) ? ctx.redirect(`/admin/events/${ctx.params.id}/registrations?ok=Updated.`, 303) : ok();
});
//#endregion
//#region \0virtual:astro:page:src/pages/api/admin/events/[id]/registrations@_@ts
var page = () => registrations_exports;
//#endregion
export { page };
