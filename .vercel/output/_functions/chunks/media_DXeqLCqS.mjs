import { P as __exportAll, k as invalidateMedia, t as bust } from "./content_DecWaDc1.mjs";
import { r as serviceClient } from "./supabase_BOJmasnu.mjs";
import { a as handle, f as ok, m as requireRole, n as audit, p as readBody, t as ApiError, v as str, y as wantsHtml } from "./api_CGwffj9f.mjs";
import { a as storeImage } from "./upload_BY-H6gBx.mjs";
//#region src/pages/api/admin/media.ts
var media_exports = /* @__PURE__ */ __exportAll({
	POST: () => POST,
	prerender: () => false
});
var POST = handle(async (ctx) => {
	const officer = requireRole(ctx, "officer");
	const b = await readBody(ctx.request);
	const sb = serviceClient();
	const done = (m) => {
		invalidateMedia();
		bust();
		return wantsHtml(ctx.request) ? ctx.redirect(`/admin/media?ok=${encodeURIComponent(m)}`, 303) : ok();
	};
	if (b._action === "alt") {
		const key = str(b.key, 200);
		const alt = str(b.alt, 200);
		const { data: old } = await sb.from("media").select("alt").eq("key", key).maybeSingle();
		await sb.from("media").update({ alt }).eq("key", key);
		await audit(officer.id, "update", "media", key, { alt: old?.alt }, { alt });
		return done("Alt text saved.");
	}
	if (b._action === "delete") {
		const key = str(b.key, 200);
		const { data: row } = await sb.from("media").select("*").eq("key", key).maybeSingle();
		if (!row) throw new ApiError("Not found.", 404);
		if ((await Promise.all([
			["events", "cover_key"],
			["highlights", "photo_key"],
			["stories", "photo_key"],
			["strip_photos", "photo_key"],
			["impact_semesters", "photo_key"],
			["partners", "logo_key"],
			["officer_terms", "photo_key"],
			["posts", "cover_key"]
		].map(async ([t, c]) => (await sb.from(t).select(c, {
			count: "exact",
			head: true
		}).eq(c, key)).count || 0))).some((n) => n > 0)) throw new ApiError("That file is still used on the site. Replace it there first.");
		const paths = [row.path.replace(/^(media|files)\//, ""), ...Object.values(row.sizes || {}).map((u) => String(u).split("/storage/v1/object/public/")[1]?.replace(/^(media|files)\//, "")).filter(Boolean)];
		await sb.storage.from(row.path.startsWith("files/") ? "files" : "media").remove(paths);
		await sb.from("media").delete().eq("key", key);
		await audit(officer.id, "delete", "media", key, row, null);
		return done("File deleted.");
	}
	const file = b.file;
	if (!(file instanceof File) || !file.size) throw new ApiError("Choose an image.");
	const alt = str(b.alt, 200);
	if (!alt) throw new ApiError("Alt text is required.");
	const r = await storeImage(file, alt, officer.id, ["library"]);
	await audit(officer.id, "insert", "media", r.key, null, {
		key: r.key,
		alt
	});
	return done(`Uploaded ${r.key}.`);
});
//#endregion
//#region \0virtual:astro:page:src/pages/api/admin/media@_@ts
var page = () => media_exports;
//#endregion
export { page };
