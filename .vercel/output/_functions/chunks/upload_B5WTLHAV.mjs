import { P as __exportAll } from "./content_DecWaDc1.mjs";
import { r as serviceClient } from "./supabase_BOJmasnu.mjs";
import { t as atLeast } from "./types_DpuWdFt1.mjs";
import { a as handle, h as requireUser, i as guardRate, l as isUuid, p as readBody, t as ApiError, u as json, v as str } from "./api_CGwffj9f.mjs";
import { a as storeImage, i as storeDraftPdf, o as storePdf, r as storeDraftImage } from "./upload_BY-H6gBx.mjs";
//#region src/pages/api/upload.ts
var upload_exports = /* @__PURE__ */ __exportAll({
	POST: () => POST,
	prerender: () => false
});
var POST = handle(async (ctx) => {
	const user = requireUser(ctx);
	if (!ctx.locals.profile?.onboarded) throw new ApiError("Finish onboarding first.", 403);
	await guardRate(ctx.request, "upload", 40, 600);
	const b = await readBody(ctx.request);
	const file = b.file;
	if (!(file instanceof File) || !file.size) throw new ApiError("Choose a file.");
	const kind = str(b.kind, 10) || "image";
	const postId = str(b.post_id, 40);
	if (postId) {
		if (!isUuid(postId)) throw new ApiError("Bad post id.");
		const { data: post } = await serviceClient().from("posts").select("author_id").eq("id", postId).maybeSingle();
		if (!post || post.author_id !== user.id && !atLeast(ctx.locals.role, "reviewer")) throw new ApiError("Not your post.", 403);
		if (kind === "pdf") return json({
			ok: true,
			kind: "pdf",
			...await storeDraftPdf(file, user.id, postId)
		});
		const alt = str(b.alt, 200);
		if (!alt) throw new ApiError("Describe the image (alt text) first.");
		return json({
			ok: true,
			kind: "image",
			...await storeDraftImage(file, alt, user.id, postId)
		});
	}
	if (!atLeast(ctx.locals.role, "officer") && kind === "pdf") throw new ApiError("PDFs are uploaded from the post editor.", 403);
	if (kind === "pdf") return json({
		ok: true,
		kind: "pdf",
		...await storePdf(file, user.id)
	});
	const alt = str(b.alt, 200);
	if (!alt) throw new ApiError("Describe the image (alt text) first.");
	const tags = ctx.locals.role === "admin" || ctx.locals.role === "officer" ? ["library"] : ["post"];
	return json({
		ok: true,
		kind: "image",
		...await storeImage(file, alt, user.id, tags)
	});
});
//#endregion
//#region \0virtual:astro:page:src/pages/api/upload@_@ts
var page = () => upload_exports;
//#endregion
export { page };
