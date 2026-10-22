import { D as __exportAll, t as bust } from "./content_BmaKDf7b.mjs";
import { r as serviceClient } from "./supabase_BKsAzIKQ.mjs";
import { a as handle, f as ok, l as isUuid, m as requireRole, n as audit, p as readBody, t as ApiError, v as str, y as wantsHtml } from "./api_BNUCaDnj.mjs";
import { r as notifyStatus } from "./notify_Bx28dzpF.mjs";
//#region src/pages/api/admin/posts/[id]/review.ts
var review_exports = /* @__PURE__ */ __exportAll({
	POST: () => POST,
	prerender: () => false
});
var NEXT = [
	"submitted",
	"changes_requested",
	"published",
	"unpublished",
	"draft"
];
var POST = handle(async (ctx) => {
	const reviewer = requireRole(ctx, "reviewer");
	if (!isUuid(ctx.params.id)) throw new ApiError("Not found.", 404);
	const b = await readBody(ctx.request);
	const status = str(b.status, 30);
	const comment = str(b.comment, 1e3);
	if (!NEXT.includes(status)) throw new ApiError("Unknown status.");
	const sb = serviceClient();
	const { data: post } = await sb.from("posts").select("*, author:profiles!posts_author_id_fkey(email,name)").eq("id", ctx.params.id).maybeSingle();
	if (!post) throw new ApiError("Not found.", 404);
	const patch = { status };
	if (status === "published" && !post.published_at) patch.published_at = (/* @__PURE__ */ new Date()).toISOString();
	await sb.from("posts").update(patch).eq("id", post.id);
	await sb.from("post_reviews").insert({
		post_id: post.id,
		reviewer_id: reviewer.id,
		comment,
		status_set: status
	});
	await audit(reviewer.id, "status", "posts", post.id, { status: post.status }, {
		status,
		comment
	});
	bust();
	if (post.status !== status) await notifyStatus({
		title: post.title,
		slug: post.slug
	}, status.replace("_", " "), comment, post.author?.email || null);
	return wantsHtml(ctx.request) ? ctx.redirect(`/admin/posts?ok=${encodeURIComponent(`"${post.title}" is now ${status.replace("_", " ")}.`)}`, 303) : ok();
});
//#endregion
//#region \0virtual:astro:page:src/pages/api/admin/posts/[id]/review@_@ts
var page = () => review_exports;
//#endregion
export { page };
