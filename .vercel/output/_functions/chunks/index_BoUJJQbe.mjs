import { P as __exportAll } from "./content_DecWaDc1.mjs";
import { r as serviceClient } from "./supabase_BOJmasnu.mjs";
import { _ as slugify, a as handle, f as ok, h as requireUser, i as guardRate, p as readBody, t as ApiError, v as str, y as wantsHtml } from "./api_CGwffj9f.mjs";
//#region src/pages/api/posts/index.ts
var posts_exports = /* @__PURE__ */ __exportAll({
	POST: () => POST,
	prerender: () => false
});
var POST = handle(async (ctx) => {
	const user = requireUser(ctx);
	if (!ctx.locals.profile?.onboarded) throw new ApiError("Finish onboarding first.", 403);
	await guardRate(ctx.request, "post-create", 10, 600);
	const b = await readBody(ctx.request);
	const title = str(b.title, 140) || "Untitled";
	const sb = serviceClient();
	const base = slugify(title);
	let slug = base;
	for (let i = 2;; i++) {
		const { data } = await sb.from("posts").select("id").eq("slug", slug).maybeSingle();
		if (!data) break;
		slug = `${base}-${i}`;
	}
	const { data, error } = await sb.from("posts").insert({
		slug,
		title,
		author_id: user.id,
		author_name: ctx.locals.profile?.name || null,
		status: "draft",
		category: str(b.category, 40) || "News",
		dir: b.dir === "rtl" ? "rtl" : "ltr"
	}).select("id").single();
	if (error) throw new ApiError(error.message, 500);
	return wantsHtml(ctx.request) ? ctx.redirect(`/me/posts/${data.id}/edit`, 303) : ok({ id: data.id });
});
//#endregion
//#region \0virtual:astro:page:src/pages/api/posts/index@_@ts
var page = () => posts_exports;
//#endregion
export { page };
