import { P as __exportAll } from "./content_DecWaDc1.mjs";
import { r as serviceClient } from "./supabase_BOJmasnu.mjs";
import { a as handle, c as isUrl, d as normalizePhone, f as ok, h as requireUser, i as guardRate, p as readBody, r as bool, s as isSaudiPhone, t as ApiError, v as str, y as wantsHtml } from "./api_CGwffj9f.mjs";
import { a as storeImage } from "./upload_BY-H6gBx.mjs";
//#region src/pages/api/me/profile.ts
var profile_exports = /* @__PURE__ */ __exportAll({
	PATCH: () => PATCH,
	POST: () => POST,
	prerender: () => false
});
var POST = handle(async (ctx) => {
	const user = requireUser(ctx);
	await guardRate(ctx.request, "profile", 20, 600);
	const b = await readBody(ctx.request);
	const patch = {};
	if ("name" in b) {
		patch.name = str(b.name, 80);
		if (!patch.name) throw new ApiError("Your name is required.");
	}
	if ("handle" in b) {
		const h = str(b.handle, 24).toLowerCase();
		if (!/^[a-z0-9_]{3,24}$/.test(h)) throw new ApiError("Handle: 3 to 24 letters, digits or underscores.");
		patch.handle = h;
	}
	if ("phone" in b) {
		const ph = str(b.phone, 20);
		if (!isSaudiPhone(ph)) throw new ApiError("Phone must be a Saudi mobile number.");
		patch.phone = normalizePhone(ph);
	}
	if ("email" in b) {
		const e = str(b.email, 120).toLowerCase();
		if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(e)) throw new ApiError("That email does not look right.");
		patch.email = e;
	}
	for (const k of [
		"major",
		"year",
		"kfupm_email",
		"github",
		"bio"
	]) if (k in b) patch[k] = str(b[k], k === "bio" ? 400 : 120).replace(/^@/, "") || null;
	if ("linkedin" in b) {
		const l = str(b.linkedin, 200);
		if (l && !isUrl(l)) throw new ApiError("LinkedIn must be a full URL.");
		patch.linkedin = l || null;
	}
	if ("show_in_contributors" in b || wantsHtml(ctx.request)) patch.show_in_contributors = bool(b.show_in_contributors);
	if (b.avatar instanceof File && b.avatar.size > 0) patch.avatar_url = (await storeImage(b.avatar, "Profile photo", user.id, ["avatar"])).sizes["480"];
	const { data, error } = await serviceClient().from("profiles").update(patch).eq("id", user.id).select("*").single();
	if (error) throw new ApiError(error.message.includes("handle") ? "That handle is taken." : error.message);
	return wantsHtml(ctx.request) ? ctx.redirect("/me/profile?ok=Saved.", 303) : ok({ profile: data });
});
var PATCH = POST;
//#endregion
//#region \0virtual:astro:page:src/pages/api/me/profile@_@ts
var page = () => profile_exports;
//#endregion
export { page };
