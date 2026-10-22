import { D as __exportAll } from "./content_Dw4BquHy.mjs";
import { D as renderComponent, I as addAttribute, N as renderTemplate, P as maybeRenderHead } from "./sequence_CcNeFUgX.mjs";
import { r as serviceClient } from "./supabase_BYajXEmb.mjs";
import { g as createComponent, h as createAstro } from "./_astro_assets_BiTtY4hV.mjs";
import { t as atLeast } from "./types_DpuWdFt1.mjs";
import { t as $$AdminLayout } from "./AdminLayout_CVtl0j24.mjs";
import { a as resource, t as display } from "./io_Ct7MIBDT.mjs";
//#region src/pages/admin/[resource]/index.astro
var _resource__exports = /* @__PURE__ */ __exportAll({
	default: () => $$Index,
	file: () => $$file,
	url: () => $$url
});
createAstro("https://cckfupm-website.vercel.app");
var $$Index = createComponent(async ($$result, $$props, $$slots) => {
	const Astro = $$result.createAstro($$props, $$slots);
	Astro.self = $$Index;
	const res = resource(Astro.params.resource || "");
	if (!res) return new Response(null, { status: 404 });
	if (!atLeast(Astro.locals.role, res.minRole)) return new Response("Not allowed", { status: 403 });
	const [col, dir] = res.orderBy.split(".");
	const { data: rows } = await serviceClient().from(res.table).select("*").order(col, { ascending: dir !== "desc" }).limit(500);
	const field = (n) => res.fields.find((f) => f.name === n);
	const toggleCol = res.visible ? "visible" : res.key === "events" ? "published" : res.key === "board" ? "is_current" : res.key === "solvers" ? "approved" : null;
	const extra = res.key === "impact" ? [{
		href: "/admin/impact-items",
		label: "Impact items"
	}] : res.key === "events" ? [] : [];
	return renderTemplate`${renderComponent($$result, "AdminLayout", $$AdminLayout, {
		"title": res.title,
		"lead": res.help
	}, { "default": ($$result) => renderTemplate`${maybeRenderHead($$result)}<p class="form__actions"><a class="btn btn--small"${addAttribute(`/admin/${res.key}/new`, "href")}>Add ${res.singular} <span aria-hidden="true">→</span></a>${extra.map((e) => renderTemplate`<a class="btn btn--small btn--ghost"${addAttribute(e.href, "href")}>${e.label}</a>`)}${res.publicPage && renderTemplate`<a class="btn btn--small btn--ghost"${addAttribute(res.publicPage, "href")} target="_blank" rel="noopener">View on site ↗</a>`}</p><div class="table-wrap"><table class="table"><thead><tr>${res.sortable && renderTemplate`<th>Order</th>`}${res.columns.map((c) => renderTemplate`<th>${field(c)?.label || c}</th>`)}<th></th></tr></thead><tbody>${(rows || []).map((r, i) => renderTemplate`<tr>${res.sortable && renderTemplate`<td><form method="post"${addAttribute(`/api/admin/${res.key}`, "action")}><input type="hidden" name="_action" value="move"><input type="hidden" name="id"${addAttribute(r[res.pk], "value")}><button class="btn btn--tiny btn--ghost" name="dir" value="up" type="submit" aria-label="Move up"${addAttribute(i === 0, "disabled")}>↑</button> <button class="btn btn--tiny btn--ghost" name="dir" value="down" type="submit" aria-label="Move down"${addAttribute(i === (rows?.length || 0) - 1, "disabled")}>↓</button></form></td>`}${res.columns.map((c) => renderTemplate`<td>${field(c)?.type === "media" && r[c] ? renderTemplate`<span class="mono">${String(r[c]).slice(0, 28)}</span>` : display(field(c), r[c])}</td>`)}<td style="white-space:nowrap"><a class="btn btn--tiny btn--ghost"${addAttribute(`/admin/${res.key}/${encodeURIComponent(r[res.pk])}`, "href")}>Edit</a>${res.key === "events" && renderTemplate`<a class="btn btn--tiny btn--ghost"${addAttribute(`/admin/events/${r.id}/registrations`, "href")}>Registrations</a>`}${toggleCol && renderTemplate`<form method="post"${addAttribute(`/api/admin/${res.key}`, "action")}><input type="hidden" name="_action" value="toggle"><input type="hidden" name="id"${addAttribute(r[res.pk], "value")}><button class="btn btn--tiny btn--ghost" type="submit">${r[toggleCol] ? toggleCol === "is_current" ? "Move to alumni" : "Hide" : toggleCol === "is_current" ? "Make current" : toggleCol === "approved" ? "Approve" : "Show"}</button></form>`}</td></tr>`)}${!rows?.length && renderTemplate`<tr><td colspan="99" class="hint">Nothing yet. Add the first ${res.singular}.</td></tr>`}</tbody></table></div>` })}`;
}, "/home/user/website/src/pages/admin/[resource]/index.astro", void 0);
var $$file = "/home/user/website/src/pages/admin/[resource]/index.astro";
var $$url = "/admin/[resource]";
//#endregion
//#region \0virtual:astro:page:src/pages/admin/[resource]/index@_@astro
var page = () => _resource__exports;
//#endregion
export { page };
