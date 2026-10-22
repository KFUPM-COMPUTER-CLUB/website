import { P as __exportAll } from "./content_cbSbtds5.mjs";
import { D as renderComponent, I as addAttribute, N as renderTemplate, O as Fragment, P as maybeRenderHead } from "./sequence_CcNeFUgX.mjs";
import { r as serviceClient } from "./supabase_CcU7CO77.mjs";
import { g as createComponent, h as createAstro } from "./_astro_assets_BiTtY4hV.mjs";
import { t as $$MeLayout } from "./MeLayout_Ccj2yCcv.mjs";
//#region src/pages/me/posts/index.astro
var posts_exports = /* @__PURE__ */ __exportAll({
	default: () => $$Index,
	file: () => $$file,
	url: () => $$url
});
createAstro("https://cckfupm-website.vercel.app");
var $$Index = createComponent(async ($$result, $$props, $$slots) => {
	const Astro = $$result.createAstro($$props, $$slots);
	Astro.self = $$Index;
	const { user } = Astro.locals;
	const { data: posts } = await serviceClient().from("posts").select("id,slug,title,status,updated_at,published_at, post_reviews(comment,status_set,created_at)").eq("author_id", user.id).order("updated_at", { ascending: false });
	const latestNote = (p) => (p.post_reviews || []).sort((a, b) => a.created_at < b.created_at ? 1 : -1)[0];
	return renderTemplate`${renderComponent($$result, "MeLayout", $$MeLayout, {
		"title": "My posts",
		"lead": "Drafts save as you type. Submit when it is ready; a reviewer answers by email."
	}, { "default": ($$result) => renderTemplate`${maybeRenderHead($$result)}<p><a class="btn btn--small" href="/me/posts/new">Write a post <span aria-hidden="true">→</span></a></p><div class="table-wrap" style="margin-top:16px"><table class="table"><thead><tr><th>Title</th><th>Status</th><th>Reviewer note</th><th>Updated</th><th></th></tr></thead><tbody>${(posts || []).map((p) => renderTemplate`<tr><td><a${addAttribute(`/me/posts/${p.id}/edit`, "href")}>${p.title}</a>${p.status === "published" && renderTemplate`${renderComponent($$result, "Fragment", Fragment, {}, { "default": ($$result) => renderTemplate` · <a${addAttribute(`/blog/${p.slug}`, "href")}>view</a>` })}`}</td><td><span${addAttribute(`chip chip--${p.status}`, "class")}>${p.status.replace("_", " ")}</span></td><td>${latestNote(p)?.comment || ""}</td><td class="mono">${String(p.updated_at).slice(0, 10)}</td><td>${["draft", "changes_requested"].includes(p.status) && renderTemplate`<form method="post"${addAttribute(`/api/posts/${p.id}/submit`, "action")}><button class="btn btn--tiny" type="submit">Submit</button></form>`}</td></tr>`)}${!posts?.length && renderTemplate`<tr><td colspan="5" class="hint">No posts yet.</td></tr>`}</tbody></table></div>` })}`;
}, "/home/user/website/src/pages/me/posts/index.astro", void 0);
var $$file = "/home/user/website/src/pages/me/posts/index.astro";
var $$url = "/me/posts";
//#endregion
//#region \0virtual:astro:page:src/pages/me/posts/index@_@astro
var page = () => posts_exports;
//#endregion
export { page };
