import { P as __exportAll } from "./content_cbSbtds5.mjs";
import { D as renderComponent, I as addAttribute, N as renderTemplate, O as Fragment, P as maybeRenderHead } from "./sequence_CcNeFUgX.mjs";
import { r as serviceClient } from "./supabase_CcU7CO77.mjs";
import { g as createComponent, h as createAstro } from "./_astro_assets_BiTtY4hV.mjs";
import { t as atLeast } from "./types_DpuWdFt1.mjs";
import { t as $$AdminLayout } from "./AdminLayout_BNKl7_S1.mjs";
//#region src/pages/admin/posts/index.astro
var posts_exports = /* @__PURE__ */ __exportAll({
	default: () => $$Index,
	file: () => $$file,
	url: () => $$url
});
createAstro("https://cckfupm-website.vercel.app");
var $$Index = createComponent(async ($$result, $$props, $$slots) => {
	const Astro = $$result.createAstro($$props, $$slots);
	Astro.self = $$Index;
	if (!atLeast(Astro.locals.role, "reviewer")) return new Response("Reviewers only", { status: 403 });
	const status = Astro.url.searchParams.get("status") || "submitted";
	const { data } = await serviceClient().from("posts").select("id,slug,title,status,category,updated_at,author_name, author:profiles!posts_author_id_fkey(name,handle)").eq("status", status).order("updated_at", { ascending: false }).limit(100);
	const STATUSES = [
		"submitted",
		"changes_requested",
		"published",
		"draft",
		"unpublished"
	];
	return renderTemplate`${renderComponent($$result, "AdminLayout", $$AdminLayout, {
		"title": "Blog review",
		"lead": "Submitted posts wait here. Open one to read it, leave a note and set its status."
	}, { "default": ($$result) => renderTemplate`${maybeRenderHead($$result)}<p class="links-row">${STATUSES.map((s) => renderTemplate`<a${addAttribute(`chip${s === status ? " chip--published" : ""}`, "class")}${addAttribute(`?status=${s}`, "href")}>${s.replace("_", " ")}</a>`)}</p><div class="table-wrap" style="margin-top:14px"><table class="table"><thead><tr><th>Title</th><th>Author</th><th>Category</th><th>Updated</th><th></th></tr></thead><tbody>${(data || []).map((p) => renderTemplate`<tr><td><a${addAttribute(`/admin/posts/${p.id}`, "href")}>${p.title}</a></td><td>${p.author?.name || p.author_name}${p.author?.handle && renderTemplate`<span class="mono"> @${p.author.handle}</span>`}</td><td>${p.category}</td><td class="mono">${String(p.updated_at).slice(0, 10)}</td><td><a class="btn btn--tiny btn--ghost"${addAttribute(`/admin/posts/${p.id}`, "href")}>Review</a>${p.status === "published" && renderTemplate`${renderComponent($$result, "Fragment", Fragment, {}, { "default": ($$result) => renderTemplate` <a class="btn btn--tiny btn--ghost"${addAttribute(`/blog/${p.slug}`, "href")} target="_blank">View ↗</a>` })}`}</td></tr>`)}${!data?.length && renderTemplate`<tr><td colspan="5" class="hint">Nothing with status "${status.replace("_", " ")}".</td></tr>`}</tbody></table></div>` })}`;
}, "/home/user/website/src/pages/admin/posts/index.astro", void 0);
var $$file = "/home/user/website/src/pages/admin/posts/index.astro";
var $$url = "/admin/posts";
//#endregion
//#region \0virtual:astro:page:src/pages/admin/posts/index@_@astro
var page = () => posts_exports;
//#endregion
export { page };
