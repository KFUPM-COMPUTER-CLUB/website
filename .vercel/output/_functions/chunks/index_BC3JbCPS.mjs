import { P as __exportAll, k as invalidateMedia, t as bust } from "./content_cbSbtds5.mjs";
import { r as serviceClient } from "./supabase_CcU7CO77.mjs";
import { a as resource, n as parseFields } from "./io_BoUfjqF_.mjs";
import { a as handle, f as ok, g as safeNext, m as requireRole, n as audit, p as readBody, t as ApiError, v as str, y as wantsHtml } from "./api_BB02cnYN.mjs";
//#region src/pages/api/admin/[resource]/index.ts
var _resource__exports = /* @__PURE__ */ __exportAll({
	POST: () => POST,
	prerender: () => false
});
var POST = handle(async (ctx) => {
	const res = resource(ctx.params.resource || "");
	if (!res) throw new ApiError("Unknown resource.", 404);
	const user = requireRole(ctx, res.minRole);
	const b = await readBody(ctx.request);
	const sb = serviceClient();
	const action = str(b._action, 20) || "save";
	const id = str(b.id, 200);
	const back = safeNext(b.next, `/admin/${res.key}`);
	const done = (msg, extra = {}) => {
		bust();
		invalidateMedia();
		return wantsHtml(ctx.request) ? ctx.redirect(`${back}${back.includes("?") ? "&" : "?"}ok=${encodeURIComponent(msg)}`, 303) : ok(extra);
	};
	const current = id ? (await sb.from(res.table).select("*").eq(res.pk, id).maybeSingle()).data : null;
	if (action === "delete") {
		if (!current) throw new ApiError("Not found.", 404);
		const { error } = await sb.from(res.table).delete().eq(res.pk, id);
		if (error) throw new ApiError(error.message, 500);
		await audit(user.id, "delete", res.table, id, current, null);
		return done(`${res.singular} deleted. Undo from the audit log.`);
	}
	if (action === "move" || action === "toggle") {
		if (!current) throw new ApiError("Not found.", 404);
		const patch = {};
		if (action === "toggle") {
			const col = res.visible ? "visible" : res.key === "events" ? "published" : res.key === "board" ? "is_current" : res.key === "solvers" ? "approved" : null;
			if (!col) throw new ApiError("Nothing to toggle.");
			patch[col] = !current[col];
		} else {
			const { data: all } = await sb.from(res.table).select(`${res.pk},sort`).order("sort");
			const list = all || [];
			const i = list.findIndex((r) => String(r[res.pk]) === id);
			const j = b.dir === "up" ? i - 1 : i + 1;
			if (i < 0 || j < 0 || j >= list.length) return done("Nothing to move.");
			const order = list.map((r) => r[res.pk]);
			[order[i], order[j]] = [order[j], order[i]];
			for (let k = 0; k < order.length; k++) await sb.from(res.table).update({ sort: k }).eq(res.pk, order[k]);
			await audit(user.id, "update", res.table, id, { sort: current.sort }, { sort: j });
			return done("Order updated.");
		}
		const { error } = await sb.from(res.table).update(patch).eq(res.pk, id);
		if (error) throw new ApiError(error.message, 500);
		await audit(user.id, "update", res.table, id, current, {
			...current,
			...patch
		});
		return done("Updated.");
	}
	const row = parseFields(res, b, current);
	if (current) {
		const { data, error } = await sb.from(res.table).update(row).eq(res.pk, id).select("*").single();
		if (error) throw new ApiError(error.message.includes("duplicate") ? "That value already exists (slug or term must be unique)." : error.message, 500);
		await audit(user.id, "update", res.table, id, current, data);
		return done("Saved.", { row: data });
	}
	if (res.sortable) {
		const { data: last } = await sb.from(res.table).select("sort").order("sort", { ascending: false }).limit(1).maybeSingle();
		row.sort = (last?.sort ?? -1) + 1;
	}
	const { data, error } = await sb.from(res.table).insert(row).select("*").single();
	if (error) throw new ApiError(error.message.includes("duplicate") ? "That value already exists (slug, term or photo must be unique)." : error.message, 500);
	await audit(user.id, "insert", res.table, String(data[res.pk]), null, data);
	return done(`${res.singular} added.`, { row: data });
});
//#endregion
//#region \0virtual:astro:page:src/pages/api/admin/[resource]/index@_@ts
var page = () => _resource__exports;
//#endregion
export { page };
