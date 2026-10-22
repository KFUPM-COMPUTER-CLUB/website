import { P as __exportAll } from "./content_cbSbtds5.mjs";
import { D as renderComponent, I as addAttribute, N as renderTemplate, O as Fragment, P as maybeRenderHead, U as unescapeHTML } from "./sequence_CcNeFUgX.mjs";
import { r as serviceClient } from "./supabase_CcU7CO77.mjs";
import { g as createComponent, h as createAstro } from "./_astro_assets_BiTtY4hV.mjs";
import { i as renderScript, t as $$BaseLayout } from "./BaseLayout_BQqFWRil.mjs";
import { t as atLeast } from "./types_DpuWdFt1.mjs";
import { l as isUuid } from "./api_BB02cnYN.mjs";
//#region src/pages/me/posts/[id]/preview.astro
var preview_exports = /* @__PURE__ */ __exportAll({
	default: () => $$Preview,
	file: () => $$file,
	url: () => $$url
});
createAstro("https://cckfupm-website.vercel.app");
var $$Preview = createComponent(async ($$result, $$props, $$slots) => {
	const Astro = $$result.createAstro($$props, $$slots);
	Astro.self = $$Preview;
	const { user, role } = Astro.locals;
	if (!isUuid(Astro.params.id)) return new Response(null, { status: 404 });
	const { data: post } = await serviceClient().from("posts").select("*").eq("id", Astro.params.id).maybeSingle();
	if (!post || post.author_id !== user.id && !atLeast(role, "reviewer")) return new Response(null, { status: 404 });
	return renderTemplate`${renderComponent($$result, "BaseLayout", $$BaseLayout, {
		"title": `Preview: ${post.title}`,
		"noindex": true
	}, { "default": ($$result) => renderTemplate`${maybeRenderHead($$result)}<section class="page-head"><div class="container"${addAttribute(post.dir, "dir")}><span class="eyebrow">Preview · ${post.status.replace("_", " ")}</span><h1 class="h1">${post.title}</h1><p class="meta" style="margin-top:18px"><span>By ${post.author_name || "you"}</span><span>${post.category}</span></p></div></section><section class="section"><div class="container"><article class="prose"${addAttribute(post.dir, "dir")} data-prose>${renderComponent($$result, "Fragment", Fragment, {}, { "default": async ($$result) => renderTemplate`${unescapeHTML(post.content_html || "<p>Nothing written yet.</p>")}` })}</article><p style="margin-top:32px"><a class="link-arrow"${addAttribute(`/me/posts/${post.id}/edit`, "href")}>← Back to the editor</a></p></div></section>` })}${renderScript($$result, "/home/user/website/src/pages/me/posts/[id]/preview.astro?astro&type=script&index=0&lang.ts")}`;
}, "/home/user/website/src/pages/me/posts/[id]/preview.astro", void 0);
var $$file = "/home/user/website/src/pages/me/posts/[id]/preview.astro";
var $$url = "/me/posts/[id]/preview";
//#endregion
//#region \0virtual:astro:page:src/pages/me/posts/[id]/preview@_@astro
var page = () => preview_exports;
//#endregion
export { page };
