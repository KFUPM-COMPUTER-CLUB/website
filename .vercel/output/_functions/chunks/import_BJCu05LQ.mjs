import { P as __exportAll } from "./content_cbSbtds5.mjs";
import { D as renderComponent, N as renderTemplate, P as maybeRenderHead } from "./sequence_CcNeFUgX.mjs";
import { r as serviceClient } from "./supabase_CcU7CO77.mjs";
import { g as createComponent, h as createAstro } from "./_astro_assets_BiTtY4hV.mjs";
import { i as renderScript } from "./BaseLayout_DNxJM0lr.mjs";
import { t as $$AdminLayout } from "./AdminLayout_CRytYdVc.mjs";
import { n as totalMediaSteps } from "./importer_9IwkuZSX.mjs";
//#region src/pages/admin/import.astro
var import_exports = /* @__PURE__ */ __exportAll({
	default: () => $$Import,
	file: () => $$file,
	url: () => $$url
});
createAstro("https://cckfupm-website.vercel.app");
var $$Import = createComponent(async ($$result, $$props, $$slots) => {
	const Astro = $$result.createAstro($$props, $$slots);
	Astro.self = $$Import;
	if (Astro.locals.role !== "admin") return new Response("Admins only", { status: 403 });
	const sb = serviceClient();
	const [{ count: media }, { count: events }, { count: posts }] = await Promise.all([
		sb.from("media").select("key", {
			count: "exact",
			head: true
		}),
		sb.from("events").select("id", {
			count: "exact",
			head: true
		}),
		sb.from("posts").select("id", {
			count: "exact",
			head: true
		})
	]);
	const files = totalMediaSteps();
	return renderTemplate`${renderComponent($$result, "AdminLayout", $$AdminLayout, {
		"title": "Import starter content",
		"lead": "Loads the photos, logos, events, polaroids, moments, impact numbers, partners, board, FAQ, settings and the three posts that ship with the site. Safe to run again: nothing duplicates, and anything you edited stays.",
		"live": false
	}, { "default": ($$result) => renderTemplate`${maybeRenderHead($$result)}<div class="cards" style="margin-bottom:20px"><div class="stat"><b>${media ?? 0}<small style="font-size:14px;color:var(--muted)"> / ${files}</small></b><span>photos and logos in the library</span></div><div class="stat"><b>${events ?? 0}</b><span>events</span></div><div class="stat"><b>${posts ?? 0}</b><span>posts</span></div></div><div class="card" data-import><p>Takes two to three minutes the first time; the page shows progress. Keep it open.</p><p class="form__actions"><button class="btn" type="button" data-import-start>Import starter content <span aria-hidden="true">→</span></button> <label class="check"><input type="checkbox" data-import-force> Re-upload every photo (slower)</label></p><p class="live" data-import-status></p><pre class="prose" style="max-height:320px;overflow:auto;font-size:12px;padding:12px;background:#0B1A33" data-import-log hidden></pre></div>` })}${renderScript($$result, "/home/user/website/src/pages/admin/import.astro?astro&type=script&index=0&lang.ts")}`;
}, "/home/user/website/src/pages/admin/import.astro", void 0);
var $$file = "/home/user/website/src/pages/admin/import.astro";
var $$url = "/admin/import";
//#endregion
//#region \0virtual:astro:page:src/pages/admin/import@_@astro
var page = () => import_exports;
//#endregion
export { page };
