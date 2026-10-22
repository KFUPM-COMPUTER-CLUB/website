import { P as __exportAll } from "./content_DecWaDc1.mjs";
import { f as serviceReady, n as publicUrl, r as serviceClient } from "./supabase_BOJmasnu.mjs";
import { t as atLeast } from "./types_DpuWdFt1.mjs";
//#region src/pages/api/media/[key].ts
var _key__exports = /* @__PURE__ */ __exportAll({
	GET: () => GET,
	prerender: () => false
});
var GET = async ({ params, url, locals }) => {
	if (!serviceReady()) return new Response("Not available", { status: 503 });
	const key = (params.key || "").replace(/[^\w.\-]/g, "");
	const sb = serviceClient();
	const { data: m } = await sb.from("media").select("key,kind,sizes,path,bucket,published,post_id,uploaded_by").eq("key", key).maybeSingle();
	if (!m) return new Response("Not found", { status: 404 });
	const want = url.searchParams.get("w") || (m.kind === "pdf" ? "file" : "960");
	const sizes = m.sizes;
	const pick = sizes[want] || sizes["960"] || sizes["1600"] || sizes["480"] || sizes.file;
	if (m.published) {
		const target = pick && pick.startsWith("http") ? pick : publicUrl(m.path);
		return new Response(null, {
			status: 302,
			headers: {
				Location: target,
				"Cache-Control": "public, max-age=300, s-maxage=86400"
			}
		});
	}
	let allowed = atLeast(locals.role, "reviewer") || !!locals.user && locals.user.id === m.uploaded_by;
	if (!allowed && locals.user && m.post_id) {
		const { data: p } = await sb.from("posts").select("author_id").eq("id", m.post_id).maybeSingle();
		allowed = p?.author_id === locals.user.id;
	}
	if (!allowed) return new Response("Not found", { status: 404 });
	if (!pick) return new Response("Not found", { status: 404 });
	const { data, error } = await sb.storage.from("drafts").createSignedUrl(pick, 3600);
	if (error || !data?.signedUrl) return new Response("Not available", { status: 502 });
	return new Response(null, {
		status: 302,
		headers: {
			Location: data.signedUrl,
			"Cache-Control": "private, no-store"
		}
	});
};
//#endregion
//#region \0virtual:astro:page:src/pages/api/media/[key]@_@ts
var page = () => _key__exports;
//#endregion
export { page };
