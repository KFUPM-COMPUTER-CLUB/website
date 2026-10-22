import { P as __exportAll } from "./content_cbSbtds5.mjs";
import { D as renderComponent, I as addAttribute, N as renderTemplate, P as maybeRenderHead } from "./sequence_CcNeFUgX.mjs";
import { r as serviceClient } from "./supabase_CcU7CO77.mjs";
import { g as createComponent, h as createAstro } from "./_astro_assets_BiTtY4hV.mjs";
import { t as $$AdminLayout } from "./AdminLayout_CRytYdVc.mjs";
//#region src/pages/admin/audit.astro
var audit_exports = /* @__PURE__ */ __exportAll({
	default: () => $$Audit,
	file: () => $$file,
	url: () => $$url
});
createAstro("https://cckfupm-website.vercel.app");
var $$Audit = createComponent(async ($$result, $$props, $$slots) => {
	const Astro = $$result.createAstro($$props, $$slots);
	Astro.self = $$Audit;
	if (Astro.locals.role !== "admin") return new Response("Admins only", { status: 403 });
	const { data } = await serviceClient().from("audit_log").select("id,action,table_name,row_id,before,after,undone_at,created_at, actor:profiles!audit_log_actor_id_fkey(name)").order("created_at", { ascending: false }).limit(200);
	const summary = (e) => {
		const a = e.after || e.before || {};
		return a.title || a.name || a.term || a.q_en || a.label || a.key || a.role || a.status || e.row_id || "";
	};
	const undoable = (e) => !e.undone_at && [
		"insert",
		"update",
		"delete"
	].includes(e.action) && ![
		"profiles",
		"user_roles",
		"registrations"
	].includes(e.table_name);
	return renderTemplate`${renderComponent($$result, "AdminLayout", $$AdminLayout, {
		"title": "Audit log",
		"lead": "Every admin action. Content edits can be undone.",
		"live": false
	}, { "default": ($$result) => renderTemplate`${maybeRenderHead($$result)}<div class="table-wrap"><table class="table"><thead><tr><th>When</th><th>Who</th><th>Action</th><th>What</th><th></th></tr></thead><tbody>${(data || []).map((e) => renderTemplate`<tr><td class="mono">${String(e.created_at).slice(0, 16).replace("T", " ")}</td><td>${e.actor?.name || "system"}</td><td><span class="chip">${e.action}</span> ${e.table_name}</td><td>${summary(e)}${e.undone_at && renderTemplate`<span class="chip chip--draft" style="margin-left:8px">undone</span>`}</td><td>${undoable(e) && renderTemplate`<form method="post"${addAttribute(`/api/admin/audit/${e.id}/undo`, "action")}><button class="btn btn--tiny btn--ghost" type="submit">Undo</button></form>`}</td></tr>`)}${!data?.length && renderTemplate`<tr><td colspan="5" class="hint">Nothing yet.</td></tr>`}</tbody></table></div>` })}`;
}, "/home/user/website/src/pages/admin/audit.astro", void 0);
var $$file = "/home/user/website/src/pages/admin/audit.astro";
var $$url = "/admin/audit";
//#endregion
//#region \0virtual:astro:page:src/pages/admin/audit@_@astro
var page = () => audit_exports;
//#endregion
export { page };
