import { P as __exportAll } from "./content_DecWaDc1.mjs";
import { r as serviceClient } from "./supabase_BOJmasnu.mjs";
import { a as handle, f as ok, h as requireUser, l as isUuid, n as audit, p as readBody, t as ApiError, v as str, y as wantsHtml } from "./api_CGwffj9f.mjs";
import { n as sanitizePost, t as plainText } from "./sanitize_CnqS7ry6.mjs";
//#region src/pages/api/posts/[id]/submit.ts
var submit_exports = /* @__PURE__ */ __exportAll({
	POST: () => POST,
	prerender: () => false
});
var POST = handle(async (ctx) => {
	const user = requireUser(ctx);
	if (!isUuid(ctx.params.id)) throw new ApiError("Not found.", 404);
	const sb = serviceClient();
	const { data: post } = await sb.from("posts").select("*").eq("id", ctx.params.id).maybeSingle();
	if (!post || post.author_id !== user.id) throw new ApiError("Not your post.", 403);
	if (!["draft", "changes_requested"].includes(post.status)) throw new ApiError("This post is already in review or published.", 409);
	const b = await readBody(ctx.request);
	if ("content_html" in b) {
		const patch = {
			content_html: sanitizePost(String(b.content_html || "")),
			title: str(b.title, 140) || post.title,
			excerpt: str(b.excerpt, 200) || post.excerpt || plainText(String(b.content_html || ""), 180),
			dir: b.dir === "rtl" ? "rtl" : "ltr"
		};
		if (typeof b.content_json === "string" && b.content_json) try {
			patch.content_json = JSON.parse(b.content_json);
		} catch {}
		await sb.from("posts").update(patch).eq("id", post.id);
		Object.assign(post, patch);
	}
	if (!post.title || post.title === "Untitled" || !post.content_html || post.content_html.length < 40) throw new ApiError("Add a title and some content before submitting.");
	await sb.from("posts").update({ status: "submitted" }).eq("id", post.id);
	await audit(user.id, "status", "posts", post.id, { status: post.status }, { status: "submitted" });
	return wantsHtml(ctx.request) ? ctx.redirect("/me/posts?ok=Submitted for review. You will get an email when a reviewer answers.", 303) : ok();
});
//#endregion
//#region \0virtual:astro:page:src/pages/api/posts/[id]/submit@_@ts
var page = () => submit_exports;
//#endregion
export { page };
