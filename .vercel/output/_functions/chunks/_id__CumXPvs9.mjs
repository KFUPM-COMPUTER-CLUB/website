import { D as __exportAll } from "./content_Dw4BquHy.mjs";
import { D as renderComponent, I as addAttribute, N as renderTemplate, O as Fragment, P as maybeRenderHead, U as unescapeHTML } from "./sequence_CcNeFUgX.mjs";
import { r as serviceClient } from "./supabase_BYajXEmb.mjs";
import { g as createComponent, h as createAstro } from "./_astro_assets_BiTtY4hV.mjs";
import { i as renderScript } from "./BaseLayout_CmhdDrAC.mjs";
import { t as atLeast } from "./types_DpuWdFt1.mjs";
import { t as $$AdminLayout } from "./AdminLayout_CVtl0j24.mjs";
import { l as isUuid } from "./api_L-wuzLIp.mjs";
//#region src/pages/admin/posts/[id].astro
var _id__exports = /* @__PURE__ */ __exportAll({
	default: () => $$Id,
	file: () => $$file,
	url: () => $$url
});
createAstro("https://cckfupm-website.vercel.app");
var $$Id = createComponent(async ($$result, $$props, $$slots) => {
	const Astro = $$result.createAstro($$props, $$slots);
	Astro.self = $$Id;
	if (!atLeast(Astro.locals.role, "reviewer")) return new Response("Reviewers only", { status: 403 });
	if (!isUuid(Astro.params.id)) return new Response(null, { status: 404 });
	const { data: post } = await serviceClient().from("posts").select("*, author:profiles!posts_author_id_fkey(name,handle,email), post_reviews(comment,status_set,created_at, reviewer:profiles!post_reviews_reviewer_id_fkey(name))").eq("id", Astro.params.id).maybeSingle();
	if (!post) return new Response(null, { status: 404 });
	const notes = (post.post_reviews || []).sort((a, b) => a.created_at < b.created_at ? 1 : -1);
	return renderTemplate`${renderComponent($$result, "AdminLayout", $$AdminLayout, {
		"title": post.title,
		"lead": `${post.author?.name || post.author_name || "Unknown author"} · ${post.category} · ${post.status.replace("_", " ")}`
	}, { "default": ($$result) => renderTemplate`${maybeRenderHead($$result)}<div class="app" style="grid-template-columns: minmax(0, 1fr) 320px"><article class="prose"${addAttribute(post.dir, "dir")} data-prose style="max-width:none">${renderComponent($$result, "Fragment", Fragment, {}, { "default": async ($$result) => renderTemplate`${unescapeHTML(post.content_html || "<p>(empty)</p>")}` })}</article><div><form class="form card" method="post"${addAttribute(`/api/admin/posts/${post.id}/review`, "action")}><h2 class="h3">Decision</h2><div class="field"><label for="status">Status</label><select class="select" id="status" name="status">${[
		"published",
		"changes_requested",
		"unpublished",
		"submitted",
		"draft"
	].map((s) => renderTemplate`<option${addAttribute(s, "value")}${addAttribute(s === (post.status === "submitted" ? "published" : post.status), "selected")}>${s.replace("_", " ")}</option>`)}</select></div><div class="field"><label for="comment">Note to the author</label><textarea class="textarea" id="comment" name="comment" maxlength="1000" placeholder="What to change, or a thank-you."></textarea><small>The author gets an email with this note.</small></div><button class="btn" type="submit">Save decision</button><a class="btn btn--ghost"${addAttribute(`/me/posts/${post.id}/edit`, "href")}>Open in editor</a></form>${notes.length > 0 && renderTemplate`<div class="card" style="margin-top:16px"><h2 class="h3">History</h2><ul>${notes.map((n) => renderTemplate`<li><span class="mono">${String(n.created_at).slice(0, 10)}</span> · <b>${n.status_set?.replace("_", " ")}</b> · ${n.reviewer?.name || "reviewer"}${n.comment && renderTemplate`${renderComponent($$result, "Fragment", Fragment, {}, { "default": ($$result) => renderTemplate`: ${n.comment}` })}`}</li>`)}</ul></div>`}</div></div>` })}${renderScript($$result, "/home/user/website/src/pages/admin/posts/[id].astro?astro&type=script&index=0&lang.ts")}`;
}, "/home/user/website/src/pages/admin/posts/[id].astro", void 0);
var $$file = "/home/user/website/src/pages/admin/posts/[id].astro";
var $$url = "/admin/posts/[id]";
//#endregion
//#region \0virtual:astro:page:src/pages/admin/posts/[id]@_@astro
var page = () => _id__exports;
//#endregion
export { page };
