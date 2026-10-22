import { P as __exportAll } from "./content_DecWaDc1.mjs";
import { r as serviceClient } from "./supabase_BOJmasnu.mjs";
import { a as handle, c as isUrl, d as normalizePhone, f as ok, g as safeNext, h as requireUser, i as guardRate, p as readBody, r as bool, s as isSaudiPhone, t as ApiError, v as str, y as wantsHtml } from "./api_CGwffj9f.mjs";
import { i as notifyWelcome } from "./notify_CtRWJdUF.mjs";
import { a as storeImage } from "./upload_BY-H6gBx.mjs";
//#region src/pages/api/me/onboard.ts
var onboard_exports = /* @__PURE__ */ __exportAll({
	POST: () => POST,
	prerender: () => false
});
var POST = handle(async (ctx) => {
	const user = requireUser(ctx);
	await guardRate(ctx.request, "onboard", 10, 600);
	const b = await readBody(ctx.request);
	const name = str(b.name, 80), handle = str(b.handle, 24).toLowerCase(), email = str(b.email, 120).toLowerCase(), phone = str(b.phone, 20), major = str(b.major, 80), year = str(b.year, 30);
	if (!name) throw new ApiError("Your name is required.");
	if (!/^[a-z0-9_]{3,24}$/.test(handle)) throw new ApiError("Handle: 3 to 24 letters, digits or underscores.");
	if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) throw new ApiError("That email does not look right.");
	if (!isSaudiPhone(phone)) throw new ApiError("Phone must be a Saudi mobile number (05xxxxxxxx).");
	if (!major || !year) throw new ApiError("Major and year are required.");
	const linkedin = str(b.linkedin, 200);
	if (linkedin && !isUrl(linkedin)) throw new ApiError("LinkedIn must be a full URL.");
	const sb = serviceClient();
	const { data: taken } = await sb.from("profiles").select("id").eq("handle", handle).neq("id", user.id).maybeSingle();
	if (taken) throw new ApiError("That handle is taken. Pick another.");
	let avatar_url;
	if (b.avatar instanceof File && b.avatar.size > 0) avatar_url = (await storeImage(b.avatar, `${name}'s photo`, user.id, ["avatar"])).sizes["480"];
	const row = {
		id: user.id,
		name,
		handle,
		email,
		phone: normalizePhone(phone),
		major,
		year,
		kfupm_email: str(b.kfupm_email, 120) || null,
		github: str(b.github, 60).replace(/^@/, "") || null,
		linkedin: linkedin || null,
		bio: str(b.bio, 400) || null,
		show_in_contributors: bool(b.show_in_contributors),
		onboarded: true,
		...avatar_url ? { avatar_url } : {}
	};
	const { data: profile, error } = await sb.from("profiles").upsert(row).select("*").single();
	if (error) throw new ApiError(error.message.includes("handle") ? "That handle is taken. Pick another." : error.message);
	await notifyWelcome(profile);
	const next = safeNext(b.next, "/me");
	return wantsHtml(ctx.request) ? ctx.redirect(`${next}${next.includes("?") ? "&" : "?"}welcome=1`, 303) : ok({ profile });
});
//#endregion
//#region \0virtual:astro:page:src/pages/api/me/onboard@_@ts
var page = () => onboard_exports;
//#endregion
export { page };
