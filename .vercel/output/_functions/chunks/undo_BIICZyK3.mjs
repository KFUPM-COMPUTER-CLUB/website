import { P as __exportAll, t as bust } from "./content_DecWaDc1.mjs";
import { r as serviceClient } from "./supabase_BOJmasnu.mjs";
import { a as handle, f as ok, l as isUuid, m as requireRole, n as audit, t as ApiError, y as wantsHtml } from "./api_CGwffj9f.mjs";
//#region src/pages/api/admin/audit/[id]/undo.ts
var undo_exports = /* @__PURE__ */ __exportAll({
	POST: () => POST,
	prerender: () => false
});
var UNDOABLE = /* @__PURE__ */ new Set([
	"events",
	"highlights",
	"stories",
	"strip_photos",
	"impact_semesters",
	"impact_items",
	"partners",
	"faq",
	"officer_terms",
	"flag_solvers",
	"settings",
	"posts",
	"media"
]);
var POST = handle(async (ctx) => {
	const user = requireRole(ctx, "admin");
	if (!isUuid(ctx.params.id)) throw new ApiError("Not found.", 404);
	const sb = serviceClient();
	const { data: entry } = await sb.from("audit_log").select("*").eq("id", ctx.params.id).maybeSingle();
	if (!entry) throw new ApiError("Not found.", 404);
	if (entry.undone_at) throw new ApiError("Already undone.", 409);
	if (!UNDOABLE.has(entry.table_name)) throw new ApiError("This action cannot be undone from here.", 400);
	const pk = entry.table_name === "strip_photos" ? "photo_key" : entry.table_name === "settings" ? "key" : entry.table_name === "media" ? "key" : "id";
	let error = null;
	if (entry.action === "update" && entry.before) ({error} = await sb.from(entry.table_name).update(entry.before).eq(pk, entry.row_id));
	else if (entry.action === "insert") ({error} = await sb.from(entry.table_name).delete().eq(pk, entry.row_id));
	else if (entry.action === "delete" && entry.before) ({error} = await sb.from(entry.table_name).insert(entry.before));
	else throw new ApiError("Nothing to restore.", 400);
	if (error) throw new ApiError(`Undo failed: ${error.message}`, 500);
	await sb.from("audit_log").update({ undone_at: (/* @__PURE__ */ new Date()).toISOString() }).eq("id", entry.id);
	await audit(user.id, "undo", entry.table_name, entry.row_id, entry.after, entry.before);
	bust();
	return wantsHtml(ctx.request) ? ctx.redirect("/admin/audit?ok=Undone.", 303) : ok();
});
//#endregion
//#region \0virtual:astro:page:src/pages/api/admin/audit/[id]/undo@_@ts
var page = () => undo_exports;
//#endregion
export { page };
