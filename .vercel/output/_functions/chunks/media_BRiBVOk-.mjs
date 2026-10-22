import { A as mediaImg, P as __exportAll } from "./content_cbSbtds5.mjs";
import { D as renderComponent, I as addAttribute, N as renderTemplate, P as maybeRenderHead } from "./sequence_CcNeFUgX.mjs";
import { r as serviceClient } from "./supabase_CcU7CO77.mjs";
import { g as createComponent, h as createAstro } from "./_astro_assets_BiTtY4hV.mjs";
import { t as atLeast } from "./types_DpuWdFt1.mjs";
import { t as $$AdminLayout } from "./AdminLayout_BNKl7_S1.mjs";
//#region src/pages/admin/media.astro
var media_exports = /* @__PURE__ */ __exportAll({
	default: () => $$Media,
	file: () => $$file,
	url: () => $$url
});
createAstro("https://cckfupm-website.vercel.app");
var $$Media = createComponent(async ($$result, $$props, $$slots) => {
	const Astro = $$result.createAstro($$props, $$slots);
	Astro.self = $$Media;
	if (!atLeast(Astro.locals.role, "officer")) return new Response("Officers only", { status: 403 });
	const q = (Astro.url.searchParams.get("q") || "").toLowerCase();
	const { data: rows } = await serviceClient().from("media").select("key,kind,alt,width,height,sizes,path,published,post_id").order("created_at", { ascending: false }).limit(600);
	const all = (rows || []).filter((m) => !q || m.key.toLowerCase().includes(q) || (m.alt || "").toLowerCase().includes(q));
	return renderTemplate`${renderComponent($$result, "AdminLayout", $$AdminLayout, {
		"title": "Media library",
		"lead": "Every photo and file on the site. Alt text here is what screen readers say and what search engines read.",
		"live": false
	}, { "default": ($$result) => renderTemplate`${maybeRenderHead($$result)}<form class="form card" method="post" action="/api/admin/media" enctype="multipart/form-data" style="margin-bottom:20px"><h2 class="h3">Upload a photo</h2><div class="form__row"><div class="field"><label for="file">Image</label><input class="input" id="file" name="file" type="file" accept="image/*" required></div><div class="field"><label for="alt">Alt text</label><input class="input" id="alt" name="alt" maxlength="200" required placeholder="What is in the picture"></div></div><div class="form__actions"><button class="btn btn--small" type="submit">Upload</button><span class="hint">Converted to WebP in three sizes.</span></div></form><form class="inline-form" method="get" style="margin-bottom:16px"><input class="input" name="q"${addAttribute(q, "value")} placeholder="search key or alt" style="max-width:300px"><button class="btn btn--small" type="submit">Search</button></form><div class="media-grid">${all.map((m) => renderTemplate`<figure>${!m.published ? renderTemplate`<span class="chip chip--draft">draft upload · ${m.kind}</span>` : m.kind === "image" ? renderTemplate`<img${addAttribute(mediaImg(m).src, "src")}${addAttribute(m.alt, "alt")} loading="lazy">` : /^https:\/\//.test(m.sizes?.file || "") ? renderTemplate`<a class="pdf-card"${addAttribute(m.sizes.file, "href")} target="_blank" rel="noopener">PDF</a>` : renderTemplate`<span class="chip">PDF</span>`}<figcaption${addAttribute(m.key, "title")}>${m.key}</figcaption><form class="inline-form" method="post" action="/api/admin/media"><input type="hidden" name="_action" value="alt"><input type="hidden" name="key"${addAttribute(m.key, "value")}><input class="input" name="alt"${addAttribute(m.alt, "value")} placeholder="alt text" style="padding:6px 8px;font-size:13px"><button class="btn btn--tiny" type="submit">Save</button></form><form method="post" action="/api/admin/media" onsubmit="return confirm('Delete this file?')"><input type="hidden" name="_action" value="delete"><input type="hidden" name="key"${addAttribute(m.key, "value")}><button class="btn btn--tiny btn--ghost" type="submit">Delete</button></form></figure>`)}${!all.length && renderTemplate`<p class="hint">No media yet. Run the seed import or upload a photo.</p>`}</div>` })}`;
}, "/home/user/website/src/pages/admin/media.astro", void 0);
var $$file = "/home/user/website/src/pages/admin/media.astro";
var $$url = "/admin/media";
//#endregion
//#region \0virtual:astro:page:src/pages/admin/media@_@astro
var page = () => media_exports;
//#endregion
export { page };
